const mongoose = require('mongoose');

const ShoppingList = require('../models/ShoppingList');
const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');

const {
  buildShoppingListFromRecipes,
} = require('../services/shoppingListService');

const getStartOfWeek = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const day = date.getDay();

  // Monday as the first day of the week
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);

  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  return monday;
};

// @desc    Get current user's shopping list
// @route   GET /api/shopping-list
const getShoppingList = async (req, res, next) => {
  try {
    let list = await ShoppingList.findOne({
      userId: req.user._id,
    });

    if (!list) {
      list = await ShoppingList.create({
        userId: req.user._id,
        items: [],
      });
    }

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Regenerate shopping list from meal plan
// @route   POST /api/shopping-list
// body: { week, availableIngredients: [] }
const generateShoppingList = async (req, res, next) => {
  try {
    const {
      week,
      availableIngredients = [],
    } = req.body;

    // Validate available ingredients
    if (!Array.isArray(availableIngredients)) {
      return res.status(400).json({
        success: false,
        message: 'Available ingredients must be an array',
      });
    }

    // Resolve requested week
    const weekStartDate = getStartOfWeek(week);

    if (!weekStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid week date',
      });
    }

    // Find only this user's meal plan
    const plan = await MealPlan.findOne({
      userId: req.user._id,
      weekStartDate,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'No meal plan found for that week',
      });
    }

    // Collect recipe IDs from all meal slots
    const recipeIds = [];

    for (const day of Object.values(plan.meals.toObject())) {
      for (const slot of Object.values(day)) {
        if (slot?.recipeId) {
          recipeIds.push(slot.recipeId);
        }
      }
    }

    // Remove duplicate recipe IDs
    const uniqueRecipeIds = [
      ...new Set(recipeIds.map((id) => String(id))),
    ];

    let recipes = [];

    if (uniqueRecipeIds.length > 0) {
      recipes = await Recipe.find({
        _id: {
          $in: uniqueRecipeIds,
        },
      });
    }

    // Normalize available ingredients
    const normalizedIngredients = availableIngredients
      .map((ingredient) => String(ingredient).trim().toLowerCase())
      .filter(Boolean);

    // Generate required shopping items
    const generatedItems = buildShoppingListFromRecipes(
      recipes,
      normalizedIngredients
    );

    // Get existing shopping list
    let list = await ShoppingList.findOne({
      userId: req.user._id,
    });

    if (!list) {
      list = new ShoppingList({
        userId: req.user._id,
        items: [],
      });
    }

    /*
     * Preserve purchased state from the previous list.
     *
     * Key format:
     * ingredient name + unit
     */
    const previousByKey = new Map();

    list.items.forEach((item) => {
      const key = `${String(item.name).trim().toLowerCase()}|${String(
        item.unit || ''
      )
        .trim()
        .toLowerCase()}`;

      previousByKey.set(key, item);
    });

    // Preserve custom items
    const customItems = list.items.filter(
      (item) => item.custom
    );

    const regeneratedItems = generatedItems.map((item) => {
      const key = `${String(item.name).trim().toLowerCase()}|${String(
        item.unit || ''
      )
        .trim()
        .toLowerCase()}`;

      const previousItem = previousByKey.get(key);

      return {
        ...item,
        purchased: previousItem?.purchased || false,
        custom: false,
      };
    });

    /*
     * Keep generated items + existing custom items.
     */
    list.items = [
      ...regeneratedItems,
      ...customItems,
    ];

    await list.save();

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a custom shopping item
// @route   POST /api/shopping-list/items
const addItem = async (req, res, next) => {
  try {
    const {
      name,
      quantity = 1,
      unit = '',
      category = 'other',
    } = req.body;

    const cleanName = String(name || '').trim();

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: 'Item name is required',
      });
    }

    const numericQuantity = Number(quantity);

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero',
      });
    }

    let list = await ShoppingList.findOne({
      userId: req.user._id,
    });

    if (!list) {
      list = new ShoppingList({
        userId: req.user._id,
        items: [],
      });
    }

    list.items.push({
      name: cleanName,
      quantity: numericQuantity,
      unit: String(unit || '').trim(),
      category: String(category || 'other')
        .trim()
        .toLowerCase(),
      purchased: false,
      custom: true,
    });

    await list.save();

    return res.status(201).json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a shopping item
// @route   PUT /api/shopping-list/:itemId
const updateItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shopping item ID',
      });
    }

    const list = await ShoppingList.findOne({
      userId: req.user._id,
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Shopping list not found',
      });
    }

    const item = list.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    /*
     * Only allow fields that are actually editable.
     */
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Item name cannot be empty',
        });
      }

      item.name = name;
    }

    if (req.body.quantity !== undefined) {
      const quantity = Number(req.body.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than zero',
        });
      }

      item.quantity = quantity;
    }

    if (req.body.unit !== undefined) {
      item.unit = String(req.body.unit).trim();
    }

    if (req.body.category !== undefined) {
      item.category = String(req.body.category)
        .trim()
        .toLowerCase();
    }

    if (req.body.purchased !== undefined) {
      item.purchased = Boolean(req.body.purchased);
    }

    // Do not allow clients to arbitrarily change `custom`.
    await list.save();

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a shopping item
// @route   DELETE /api/shopping-list/:itemId
const deleteItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shopping item ID',
      });
    }

    const list = await ShoppingList.findOne({
      userId: req.user._id,
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Shopping list not found',
      });
    }

    const item = list.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    item.deleteOne();

    await list.save();

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear all purchased items
// @route   DELETE /api/shopping-list/purchased/clear
const clearPurchased = async (req, res, next) => {
  try {
    const list = await ShoppingList.findOne({
      userId: req.user._id,
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'Shopping list not found',
      });
    }

    list.items = list.items.filter(
      (item) => !item.purchased
    );

    await list.save();

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShoppingList,
  generateShoppingList,
  addItem,
  updateItem,
  deleteItem,
  clearPurchased,
};