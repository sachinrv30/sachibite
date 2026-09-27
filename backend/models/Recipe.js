const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },

    unit: {
      type: String,
      default: '',
      trim: true,
    },

    category: {
      type: String,
      enum: [
        'vegetables',
        'meat-protein',
        'dairy',
        'pantry',
        'spices',
        'fruits',
        'other',
      ],
      default: 'other',
    },

    optional: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    ingredients: {
      type: [ingredientSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'A recipe must contain at least one ingredient',
      },
    },

    instructions: {
      type: [
        {
          type: String,
          required: true,
          trim: true,
        },
      ],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'A recipe must contain at least one instruction',
      },
    },

    cuisine: {
      type: String,
      enum: [
        'indian',
        'italian',
        'mexican',
        'chinese',
        'japanese',
        'korean',
        'mediterranean',
        'continental',
        'asian',
        'other',
      ],
      required: true,
      lowercase: true,
    },

    category: {
      type: String,
      enum: [
        'breakfast',
        'lunch',
        'dinner',
        'snack',
      ],
      required: true,
      lowercase: true,
    },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
      lowercase: true,
    },

    prepTime: {
      type: Number,
      required: true,
      min: 0,
    },

    cookTime: {
      type: Number,
      required: true,
      min: 0,
    },

    servings: {
      type: Number,
      required: true,
      default: 2,
      min: 1,
      max: 100,
    },

    nutrition: {
      calories: {
        type: Number,
        required: true,
        min: 0,
      },

      protein: {
        type: Number,
        required: true,
        min: 0,
      },

      carbs: {
        type: Number,
        required: true,
        min: 0,
      },

      fat: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    dietaryTags: [
      {
        type: String,
        enum: [
          'vegetarian',
          'vegan',
          'non-vegetarian',
          'gluten-free',
          'dairy-free',
          'high-protein',
          'low-calorie',
          'keto',
        ],
        lowercase: true,
      },
    ],

    allergens: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },

    popularity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  {
    timestamps: true,
  }
);

/*
 * Search index
 * Supports recipe title, description and ingredient searches.
 */
recipeSchema.index({
  title: 'text',
  description: 'text',
  'ingredients.name': 'text',
});

/*
 * Filtering and sorting
 */
recipeSchema.index({
  cuisine: 1,
  category: 1,
  difficulty: 1,
});

recipeSchema.index({
  dietaryTags: 1,
});

recipeSchema.index({
  popularity: -1,
});

recipeSchema.index({
  rating: -1,
});

module.exports = mongoose.model('Recipe', recipeSchema);