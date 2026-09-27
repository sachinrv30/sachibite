const User = require('../models/User');

const ALLOWED_THEMES = ['light', 'dark'];

const ALLOWED_DIETS = [
  'vegetarian',
  'vegan',
  'non-vegetarian',
  'keto',
  'high-protein',
  'low-carb',
  'gluten-free',
  'dairy-free',
];

const ALLOWED_MEAL_PREFERENCES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
];

// @desc    Get current user's profile
// @route   GET /api/users/profile
const getProfile = async (req, res) => {
  return res.json({
    success: true,
    user: req.user.toSafeObject(),
  });
};

// @desc    Update profile basics
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, theme } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update name only when provided
    if (name !== undefined) {
      const cleanName = String(name).trim();

      if (cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must contain at least 2 characters',
        });
      }

      if (cleanName.length > 80) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot exceed 80 characters',
        });
      }

      user.name = cleanName;
    }

    // Update theme only when provided
    if (theme !== undefined) {
      if (!ALLOWED_THEMES.includes(theme)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid theme',
        });
      }

      user.theme = theme;
    }

    await user.save();

    return res.json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update dietary preferences, allergies, cuisines and meal preferences
// @route   PUT /api/users/preferences
const updatePreferences = async (req, res, next) => {
  try {
    const {
      preferences,
      allergies,
      favoriteCuisines,
      mealPreferences,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // -----------------------------
    // Preferences
    // -----------------------------
    if (preferences !== undefined) {
      if (
        typeof preferences !== 'object' ||
        Array.isArray(preferences) ||
        preferences === null
      ) {
        return res.status(400).json({
          success: false,
          message: 'Preferences must be an object',
        });
      }

      const updatedPreferences = {
        diet: user.preferences?.diet || [],
        maxPrepTime: user.preferences?.maxPrepTime ?? 60,
        calorieTarget: user.preferences?.calorieTarget ?? null,
        servingsDefault: user.preferences?.servingsDefault ?? 2,
      };

      // Diet
      if (preferences.diet !== undefined) {
        if (!Array.isArray(preferences.diet)) {
          return res.status(400).json({
            success: false,
            message: 'Diet preferences must be an array',
          });
        }

        const diet = preferences.diet
          .map((value) => String(value).trim().toLowerCase())
          .filter(Boolean);

        const invalidDiet = diet.filter(
          (value) => !ALLOWED_DIETS.includes(value)
        );

        if (invalidDiet.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid diet preference: ${invalidDiet[0]}`,
          });
        }

        updatedPreferences.diet = [...new Set(diet)];
      }

      // Maximum preparation time
      if (preferences.maxPrepTime !== undefined) {
        const maxPrepTime = Number(preferences.maxPrepTime);

        if (
          !Number.isFinite(maxPrepTime) ||
          maxPrepTime < 5 ||
          maxPrepTime > 600
        ) {
          return res.status(400).json({
            success: false,
            message: 'Maximum preparation time must be between 5 and 600 minutes',
          });
        }

        updatedPreferences.maxPrepTime = maxPrepTime;
      }

      // Calorie target
      if (preferences.calorieTarget !== undefined) {
        if (preferences.calorieTarget === null) {
          updatedPreferences.calorieTarget = null;
        } else {
          const calorieTarget = Number(preferences.calorieTarget);

          if (!Number.isFinite(calorieTarget) || calorieTarget < 0) {
            return res.status(400).json({
              success: false,
              message: 'Calorie target must be a valid positive number',
            });
          }

          updatedPreferences.calorieTarget = calorieTarget;
        }
      }

      // Default servings
      if (preferences.servingsDefault !== undefined) {
        const servingsDefault = Number(preferences.servingsDefault);

        if (
          !Number.isFinite(servingsDefault) ||
          servingsDefault < 1 ||
          servingsDefault > 50
        ) {
          return res.status(400).json({
            success: false,
            message: 'Default servings must be between 1 and 50',
          });
        }

        updatedPreferences.servingsDefault = servingsDefault;
      }

      user.preferences = updatedPreferences;
    }

    // -----------------------------
    // Allergies
    // -----------------------------
    if (allergies !== undefined) {
      if (!Array.isArray(allergies)) {
        return res.status(400).json({
          success: false,
          message: 'Allergies must be an array',
        });
      }

      user.allergies = [
        ...new Set(
          allergies
            .map((value) => String(value).trim().toLowerCase())
            .filter(Boolean)
        ),
      ];
    }

    // -----------------------------
    // Favorite cuisines
    // -----------------------------
    if (favoriteCuisines !== undefined) {
      if (!Array.isArray(favoriteCuisines)) {
        return res.status(400).json({
          success: false,
          message: 'Favorite cuisines must be an array',
        });
      }

      user.favoriteCuisines = [
        ...new Set(
          favoriteCuisines
            .map((value) => String(value).trim().toLowerCase())
            .filter(Boolean)
        ),
      ];
    }

    // -----------------------------
    // Meal preferences
    // -----------------------------
    if (mealPreferences !== undefined) {
      if (!Array.isArray(mealPreferences)) {
        return res.status(400).json({
          success: false,
          message: 'Meal preferences must be an array',
        });
      }

      const normalizedMeals = mealPreferences
        .map((value) => String(value).trim().toLowerCase())
        .filter(Boolean);

      const invalidMeal = normalizedMeals.find(
        (value) => !ALLOWED_MEAL_PREFERENCES.includes(value)
      );

      if (invalidMeal) {
        return res.status(400).json({
          success: false,
          message: `Invalid meal preference: ${invalidMeal}`,
        });
      }

      user.mealPreferences = [
        ...new Set(normalizedMeals),
      ];
    }

    await user.save();

    return res.json({
      success: true,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
};