const express = require('express');

const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  matchRecipes,
} = require('../controllers/recipeController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public recipe browsing
router.get('/', getRecipes);

// Public ingredient-based recipe matching
router.post('/match', matchRecipes);

// Public recipe details
router.get('/:id', getRecipeById);

// Authenticated recipe management
router.post('/', protect, createRecipe);
router.put('/:id', protect, updateRecipe);
router.delete('/:id', protect, deleteRecipe);

module.exports = router;