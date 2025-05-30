const express = require('express');
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    status: 'fail',
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      status: 'fail',
      message: 'Too many login attempts from this IP, please try again after 15 minutes'
    });
  }
});

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', loginLimiter, authController.login);
router.get('/logout', authController.logout);

// Password management routes
router.post('/update-password', authController.protect, authController.updatePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Account management routes
router.delete('/delete-account', authController.protect, authController.deleteAccount);

module.exports = router;
