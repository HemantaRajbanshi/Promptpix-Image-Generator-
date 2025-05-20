const express = require('express');
const multer = require('multer');
const clipdropController = require('../controllers/clipdropController');
const authController = require('../controllers/authController');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Protect all routes
router.use(authController.protect);

// ClipDrop API routes
router.post('/text-to-image', clipdropController.textToImage);
router.post('/upscale', upload.single('image_file'), clipdropController.upscaleImage);
router.post('/uncrop', upload.single('image_file'), clipdropController.uncropImage);
router.post('/remove-background', upload.single('image_file'), clipdropController.removeBackground);

module.exports = router;
