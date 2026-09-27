const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const preferenceOptions = [
  'vegetarian',
  'vegan',
  'non-vegetarian',
  'keto',
  'high-protein',
  'low-carb',
  'gluten-free',
  'dairy-free',
];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 80,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      index: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    preferences: {
      diet: [
        {
          type: String,
          enum: preferenceOptions,
        },
      ],

      maxPrepTime: {
        type: Number,
        default: 60,
        min: 5,
        max: 600,
      },

      calorieTarget: {
        type: Number,
        default: null,
        min: 0,
      },

      servingsDefault: {
        type: Number,
        default: 2,
        min: 1,
        max: 50,
      },
    },

    allergies: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    favoriteCuisines: [
      {
        type: String,
        trim: true,
      },
    ],

    mealPreferences: [
      {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      },
    ],

    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },

    recentSearches: [
      {
        type: String,
        trim: true,
      },
    ],

    recentlyViewed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Return user data without password
userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();

  delete obj.password;

  return obj;
};

module.exports = mongoose.model('User', userSchema);