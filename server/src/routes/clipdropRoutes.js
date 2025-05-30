const express = require('express');
const multer = require('multer');
const clipdropController = require('../controllers/clipdropController');
const authController = require('../controllers/authController');
const { validateCredits } = require('../middleware/creditMiddleware');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Protect all routes
router.use(authController.protect);

// ClipDrop API routes with credit validation (2 credits per operation)
router.post('/text-to-image', validateCredits(2, 'text-to-image'), clipdropController.textToImage);
router.post('/upscale', validateCredits(2, 'upscale'), upload.single('image_file'), clipdropController.upscaleImage);
router.post('/uncrop', validateCredits(2, 'uncrop'), upload.single('image_file'), clipdropController.uncropImage);
router.post('/remove-background', validateCredits(2, 'remove-background'), upload.single('image_file'), clipdropController.removeBackground);

module.exports = router;
