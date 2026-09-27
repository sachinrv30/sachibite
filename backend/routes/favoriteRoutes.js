const express = require('express');

const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/favoriteController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All favorite operations require authentication
router.use(protect);

router.get('/', getFavorites);

router.post('/:recipeId', addFavorite);

router.delete('/:recipeId', removeFavorite);

module.exports = router;