const express = require('express');

const {
  getProfile,
  updateProfile,
  updatePreferences,
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All user/profile operations require authentication
router.use(protect);

router.get('/profile', getProfile);

router.put('/profile', updateProfile);

router.put('/preferences', updatePreferences);

module.exports = router;