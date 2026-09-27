const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { register, login, getMe, logout } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  login
);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
