const mongoose = require('mongoose');

const mealSlotSchema = new mongoose.Schema(
  {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      default: null,
    },
  },
  {
    _id: false,
  }
);

const daySchema = new mongoose.Schema(
  {
    breakfast: {
      type: mealSlotSchema,
      default: () => ({}),
    },

    lunch: {
      type: mealSlotSchema,
      default: () => ({}),
    },

    dinner: {
      type: mealSlotSchema,
      default: () => ({}),
    },

    snack: {
      type: mealSlotSchema,
      default: () => ({}),
    },
  },
  {
    _id: false,
  }
);

const mealPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    weekStartDate: {
      type: Date,
      required: true,
    },

    meals: {
      monday: {
        type: daySchema,
        default: () => ({}),
      },

      tuesday: {
        type: daySchema,
        default: () => ({}),
      },

      wednesday: {
        type: daySchema,
        default: () => ({}),
      },

      thursday: {
        type: daySchema,
        default: () => ({}),
      },

      friday: {
        type: daySchema,
        default: () => ({}),
      },

      saturday: {
        type: daySchema,
        default: () => ({}),
      },

      sunday: {
        type: daySchema,
        default: () => ({}),
      },
    },
  },

  {
    timestamps: true,
  }
);

// One meal plan per user for each week
mealPlanSchema.index(
  {
    userId: 1,
    weekStartDate: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model('MealPlan', mealPlanSchema);