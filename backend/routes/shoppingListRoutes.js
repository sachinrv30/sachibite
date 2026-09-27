const express = require('express');

const {
  getShoppingList,
  generateShoppingList,
  addItem,
  updateItem,
  deleteItem,
  clearPurchased,
} = require('../controllers/shoppingListController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All shopping-list operations require authentication
router.use(protect);

router.get('/', getShoppingList);

router.post('/', generateShoppingList);

router.post('/items', addItem);

router.put('/:itemId', updateItem);

router.delete('/purchased/clear', clearPurchased);

router.delete('/:itemId', deleteItem);

module.exports = router;