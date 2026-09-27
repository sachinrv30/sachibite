const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same user from saving the same recipe twice
favoriteSchema.index(
  { userId: 1, recipeId: 1 },
  { unique: true }
);

module.exports = mongoose.model('Favorite', favoriteSchema);