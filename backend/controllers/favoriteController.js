const mongoose = require('mongoose');

const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');

// @desc    Get current user's favorites
// @route   GET /api/favorites
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({
      userId: req.user._id,
    })
      .populate('recipeId')
      .sort({ createdAt: -1 });

    // Remove favorites whose recipe was deleted
    // and return the recipe objects expected by the frontend.
    const recipes = favorites
      .filter((favorite) => favorite.recipeId)
      .map((favorite) => favorite.recipeId);

    return res.json({
      success: true,
      data: recipes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a recipe to favorites
// @route   POST /api/favorites/:recipeId
const addFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    // Validate ObjectId before querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID',
      });
    }

    // Make sure the recipe exists
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Upsert makes the operation idempotent:
    // saving an already-favorited recipe won't create duplicates.
    const favorite = await Favorite.findOneAndUpdate(
      {
        userId: req.user._id,
        recipeId,
      },
      {
        $setOnInsert: {
          userId: req.user._id,
          recipeId,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (err) {
    // Unique index protection in case of a concurrent request
    if (err.code === 11000) {
      const favorite = await Favorite.findOne({
        userId: req.user._id,
        recipeId: req.params.recipeId,
      });

      return res.status(201).json({
        success: true,
        data: favorite,
      });
    }

    next(err);
  }
};

// @desc    Remove a recipe from favorites
// @route   DELETE /api/favorites/:recipeId
const removeFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID',
      });
    }

    await Favorite.findOneAndDelete({
      userId: req.user._id,
      recipeId,
    });

    return res.json({
      success: true,
      message: 'Removed from favorites',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};