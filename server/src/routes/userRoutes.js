const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// User routes
router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.post('/addCredits', userController.addCredits);
router.post('/useCredits', userController.useCredits);
router.get('/credit-history', userController.getCreditHistory);

module.exports = router;
