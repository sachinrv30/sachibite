const Recipe = require('../models/Recipe');
const { rankRecipes } = require('../services/recipeMatchingService');

// @desc    List / search / filter recipes
// @route   GET /api/recipes
const getRecipes = async (req, res, next) => {
  try {
    const {
      q,
      cuisine,
      category,
      difficulty,
      diet,
      maxPrepTime,
      maxCalories,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    // -----------------------------
    // Search
    // -----------------------------
    if (q && String(q).trim()) {
      filter.$text = {
        $search: String(q).trim(),
      };
    }

    // -----------------------------
    // Filters
    // -----------------------------
    if (cuisine) {
      filter.cuisine = {
        $in: String(cuisine)
          .split(',')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
      };
    }

    if (category) {
      filter.category = {
        $in: String(category)
          .split(',')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
      };
    }

    if (difficulty) {
      filter.difficulty = {
        $in: String(difficulty)
          .split(',')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
      };
    }

    if (diet) {
      filter.dietaryTags = {
        $in: String(diet)
          .split(',')
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
      };
    }

    // -----------------------------
    // Numeric filters
    // -----------------------------
    const prepTime = Number(maxPrepTime);
    const calories = Number(maxCalories);

    if (maxPrepTime !== undefined && Number.isFinite(prepTime) && prepTime >= 0) {
      filter.prepTime = {
        $lte: prepTime,
      };
    }

    if (maxCalories !== undefined && Number.isFinite(calories) && calories >= 0) {
      filter['nutrition.calories'] = {
        $lte: calories,
      };
    }

    // -----------------------------
    // Sorting
    // -----------------------------
    let sortSpec = {
      createdAt: -1,
    };

    switch (sort) {
      case 'fastest':
        sortSpec = {
          prepTime: 1,
        };
        break;

      case 'lowest-calories':
        sortSpec = {
          'nutrition.calories': 1,
        };
        break;

      case 'highest-protein':
        sortSpec = {
          'nutrition.protein': -1,
        };
        break;

      case 'popular':
        sortSpec = {
          popularity: -1,
        };
        break;

      case 'rating':
        sortSpec = {
          rating: -1,
        };
        break;

      case 'newest':
        sortSpec = {
          createdAt: -1,
        };
        break;

      default:
        sortSpec = {
          createdAt: -1,
        };
    }

    // -----------------------------
    // Pagination
    // -----------------------------
    let currentPage = Number.parseInt(page, 10);
    let pageSize = Number.parseInt(limit, 10);

    if (!Number.isFinite(currentPage) || currentPage < 1) {
      currentPage = 1;
    }

    if (!Number.isFinite(pageSize) || pageSize < 1) {
      pageSize = 12;
    }

    // Prevent excessively large requests
    pageSize = Math.min(pageSize, 50);

    const skip = (currentPage - 1) * pageSize;

    const [items, total] = await Promise.all([
      Recipe.find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(pageSize),

      Recipe.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / pageSize);

    return res.json({
      success: true,
      data: items,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total,
        pages,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    return res.json({
      success: true,
      data: recipe,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create recipe
// @route   POST /api/recipes
const createRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.create(req.body);

    return res.status(201).json({
      success: true,
      data: recipe,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update recipe
// @route   PUT /api/recipes/:id
const updateRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    return res.json({
      success: true,
      data: recipe,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete recipe
// @route   DELETE /api/recipes/:id
const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    return res.json({
      success: true,
      message: 'Recipe deleted',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Ingredient-based recipe matching
// @route   POST /api/recipes/match
const matchRecipes = async (req, res, next) => {
  try {
    const {
      ingredients = [],
      preferences = {},
      limit = 20,
    } = req.body;

    // -----------------------------
    // Validate ingredients
    // -----------------------------
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one ingredient',
      });
    }

    const normalizedIngredients = ingredients
      .map((ingredient) => String(ingredient).trim().toLowerCase())
      .filter(Boolean);

    if (normalizedIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one valid ingredient',
      });
    }

    // -----------------------------
    // Normalize preferences
    // -----------------------------
    const normalizedPreferences = {
      ...preferences,
      diet: Array.isArray(preferences?.diet)
        ? preferences.diet
            .map((diet) => String(diet).trim().toLowerCase())
            .filter(Boolean)
        : [],
    };

    // -----------------------------
    // Candidate filtering
    // -----------------------------
    const candidateFilter = {};

    if (normalizedPreferences.diet.length > 0) {
      candidateFilter.dietaryTags = {
        $in: normalizedPreferences.diet,
      };
    }

    const candidates = await Recipe.find(candidateFilter)
      .limit(300);

    // -----------------------------
    // Rank recipes
    // -----------------------------
    let resultLimit = Number.parseInt(limit, 10);

    if (!Number.isFinite(resultLimit) || resultLimit < 1) {
      resultLimit = 20;
    }

    resultLimit = Math.min(resultLimit, 50);

    const ranked = rankRecipes(
      candidates,
      {
        ingredients: normalizedIngredients,
        preferences: normalizedPreferences,
      }
    ).slice(0, resultLimit);

    return res.json({
      success: true,
      data: ranked.map((item) => ({
        recipe: item.recipe,
        matchScore: item.matchScore,
        availableIngredients: item.availableIngredients,
        missingIngredients: item.missingIngredients,
        allergyConflict: item.allergyConflict,
      })),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  matchRecipes,
};