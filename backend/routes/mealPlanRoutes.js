const express = require('express');

const {
  getMealPlan,
  updateMealSlot,
  clearMealPlan,
  generatePlan,
} = require('../controllers/mealPlanController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All meal-plan operations require authentication
router.use(protect);

router.get('/', getMealPlan);

router.post('/generate', generatePlan);

router.put('/:id', updateMealSlot);

router.delete('/:id', clearMealPlan);

module.exports = router;