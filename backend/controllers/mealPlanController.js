const mongoose = require('mongoose');

const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');
const { generateWeeklyPlan } = require('../services/mealPlannerService');

const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const SLOT_KEYS = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

// Populate every recipe slot in a meal plan
const POPULATE_PATHS = DAY_KEYS.flatMap((day) =>
  SLOT_KEYS.map((slot) => ({
    path: `meals.${day}.${slot}.recipeId`,
  }))
);

const populatePlan = async (plan) => {
  return plan.populate(POPULATE_PATHS);
};

// Get Monday 00:00:00 for a supplied date
const getStartOfWeek = (dateInput) => {
  const date = dateInput ? new Date(dateInput) : new Date();

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const day = date.getDay();

  // Monday = 1, Sunday = 0
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);

  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  return monday;
};

const isValidDay = (day) => DAY_KEYS.includes(day);

const isValidSlot = (slot) => SLOT_KEYS.includes(slot);

// @desc    Get meal plan for a given week
// @route   GET /api/meal-plans?week=YYYY-MM-DD
const getMealPlan = async (req, res, next) => {
  try {
    const weekStartDate = getStartOfWeek(req.query.week);

    if (!weekStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid week date',
      });
    }

    let plan = await MealPlan.findOne({
      userId: req.user._id,
      weekStartDate,
    });

    // Create an empty weekly plan if one doesn't exist
    if (!plan) {
      plan = await MealPlan.create({
        userId: req.user._id,
        weekStartDate,
      });
    }

    await populatePlan(plan);

    return res.json({
      success: true,
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Set or replace a single meal slot
// @route   PUT /api/meal-plans/:id
// body: { day, slot, recipeId }
const updateMealSlot = async (req, res, next) => {
  try {
    const { day, slot, recipeId } = req.body;

    // Validate day
    if (!isValidDay(day)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day',
      });
    }

    // Validate slot
    if (!isValidSlot(slot)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal slot',
      });
    }

    // Validate meal plan ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal plan ID',
      });
    }

    // recipeId can be null when clearing a meal
    if (
      recipeId !== null &&
      recipeId !== undefined &&
      recipeId !== '' &&
      !mongoose.Types.ObjectId.isValid(recipeId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID',
      });
    }

    const plan = await MealPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    // If a recipe is supplied, make sure it exists
    if (recipeId) {
      const recipeExists = await Recipe.exists({
        _id: recipeId,
      });

      if (!recipeExists) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found',
        });
      }
    }

    plan.meals[day][slot].recipeId = recipeId || null;

    await plan.save();
    await populatePlan(plan);

    return res.json({
      success: true,
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear the entire weekly meal plan
// @route   DELETE /api/meal-plans/:id
const clearMealPlan = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal plan ID',
      });
    }

    const plan = await MealPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Meal plan not found',
      });
    }

    DAY_KEYS.forEach((day) => {
      SLOT_KEYS.forEach((slot) => {
        plan.meals[day][slot].recipeId = null;
      });
    });

    await plan.save();
    await populatePlan(plan);

    return res.json({
      success: true,
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Smart auto-generate weekly meal plan
// @route   POST /api/meal-plans/generate
// body: { week, ingredients: [], onlyDays?, onlySlots? }
const generatePlan = async (req, res, next) => {
  try {
    const {
      week,
      ingredients = [],
      onlyDays,
      onlySlots,
    } = req.body;

    // Validate week
    const weekStartDate = getStartOfWeek(week);

    if (!weekStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid week date',
      });
    }

    // Validate ingredients
    if (!Array.isArray(ingredients)) {
      return res.status(400).json({
        success: false,
        message: 'Ingredients must be an array',
      });
    }

    // Validate optional day filter
    if (
      onlyDays !== undefined &&
      (!Array.isArray(onlyDays) ||
        onlyDays.some((day) => !isValidDay(day)))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid day selection',
      });
    }

    // Validate optional slot filter
    if (
      onlySlots !== undefined &&
      (!Array.isArray(onlySlots) ||
        onlySlots.some((slot) => !isValidSlot(slot)))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meal slot selection',
      });
    }

    let plan = await MealPlan.findOne({
      userId: req.user._id,
      weekStartDate,
    });

    if (!plan) {
      plan = await MealPlan.create({
        userId: req.user._id,
        weekStartDate,
      });
    }

    // Load recipes used by the recommendation engine
    const recipes = await Recipe.find({});

    const preferences = {
      diet: req.user.preferences?.diet || [],
      allergies: req.user.allergies || [],
      favoriteCuisines: req.user.favoriteCuisines || [],
      maxPrepTime: req.user.preferences?.maxPrepTime,
    };

    const generated = generateWeeklyPlan(
      recipes,
      {
        ingredients,
        preferences,
      },
      {
        onlyDays,
        onlySlots,
      }
    );

    // Apply generated meals
    Object.entries(generated).forEach(([day, slots]) => {
      if (!isValidDay(day)) {
        return;
      }

      if (onlyDays && !onlyDays.includes(day)) {
        return;
      }

      Object.entries(slots).forEach(([slot, recipeId]) => {
        if (!isValidSlot(slot)) {
          return;
        }

        if (onlySlots && !onlySlots.includes(slot)) {
          return;
        }

        if (recipeId) {
          plan.meals[day][slot].recipeId = recipeId;
        }
      });
    });

    await plan.save();
    await populatePlan(plan);

    return res.json({
      success: true,
      data: plan,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMealPlan,
  updateMealSlot,
  clearMealPlan,
  generatePlan,
};