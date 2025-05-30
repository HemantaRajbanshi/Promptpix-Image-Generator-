const axios = require('axios');
const FormData = require('form-data');
const { deductCredits } = require('../middleware/creditMiddleware');

// Base URL for ClipDrop API
const BASE_URL = process.env.CLIPDROP_API_URL || 'https://clipdrop-api.co';

// Helper function to handle file uploads and API calls
const makeClipDropRequest = async (endpoint, formData, req, res) => {
  // Check if we're in development mode and should use mock responses
  const useMockResponse = process.env.NODE_ENV !== 'production' &&
    (!process.env.CLIPDROP_API_KEY || process.env.USE_MOCK_IMAGES === 'true');

  if (useMockResponse) {
    console.log('Using mock ClipDrop response for development...');

    // Try to use a sample image from the public directory first
    try {
      // Look for sample images in the client's public directory
      const publicImagesPath = require('path').join(__dirname, '../../../client/public/images');
      const fs = require('fs');

      // Get a list of available sample images
      const imageFiles = fs.readdirSync(publicImagesPath)
        .filter(file => file.match(/\.(jpg|jpeg|png)$/i));

      if (imageFiles.length > 0) {
        // Pick a random sample image
        const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        const imagePath = require('path').join(publicImagesPath, randomImage);

        if (process.env.NODE_ENV !== 'production') {
          console.log(`Using sample image: ${randomImage}`);
        }

        // Read and send the image
        const sampleImage = fs.readFileSync(imagePath);
        const contentType = randomImage.endsWith('.png') ? 'image/png' : 'image/jpeg';
        res.set('Content-Type', contentType);
        res.send(sampleImage);
        return;
      }
    } catch (sampleError) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error using sample images:', sampleError);
      }
    }

    // Fallback to mock image
    try {
      // Create a mock image response
      const mockImagePath = require('path').join(__dirname, '../../mock-data/mock-image.png');

      // Check if mock image exists
      if (require('fs').existsSync(mockImagePath)) {
        const mockImage = require('fs').readFileSync(mockImagePath);
        res.set('Content-Type', 'image/png');
        res.send(mockImage);
      } else {
        // If mock image doesn't exist, create a mock image at the ClipDrop API's fixed resolution
        const { createCanvas } = require('canvas');
        // ClipDrop API uses a fixed resolution of 1024x1024
        const width = 1024;
        const height = 1024;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Draw a gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#8a2be2'); // Purple
        gradient.addColorStop(1, '#4169e1'); // Royal Blue
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add text
        ctx.font = '36px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Mock Image (Development Mode)', width/2, height/2 - 20);
        ctx.font = '24px Arial';
        ctx.fillText('API Key Not Configured', width/2, height/2 + 20);

        // Add format indicator
        ctx.font = '18px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('1024×1024 PNG (high-quality, lossless)', width - 20, height - 20);

        // Send the canvas as PNG
        res.set('Content-Type', 'image/png');
        res.send(canvas.toBuffer());
      }
    } catch (mockError) {
      console.error('Error creating mock response:', mockError);

      // If all else fails, send a simple error response
      res.status(200).json({
        status: 'success',
        message: 'Mock ClipDrop response (no image available)'
      });
    }

    return;
  }

  // Real API call
  try {
    const response = await axios({
      method: 'POST',
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY,
        ...formData.getHeaders()
      },
      data: formData,
      responseType: 'arraybuffer'
    });

    // Set response headers
    res.set('Content-Type', response.headers['content-type']);

    // Deduct credits after successful operation
    await new Promise((resolve, reject) => {
      deductCredits(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Send the response
    res.send(response.data);
  } catch (error) {
    console.error('ClipDrop API Error:', error.message);

    // Check if API key is missing
    if (!process.env.CLIPDROP_API_KEY) {
      console.error('CLIPDROP_API_KEY is not set in environment variables');
      return res.status(500).json({
        status: 'error',
        message: 'API key not configured. Please set CLIPDROP_API_KEY in your environment variables.'
      });
    }

    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data.toString();
      const statusCode = error.response.status;

      // Provide more specific error messages based on status code
      let message = `ClipDrop API Error: ${errorMessage}`;

      if (statusCode === 401 || statusCode === 403) {
        message = 'Authentication failed. Your API key may be invalid or expired.';
      } else if (statusCode === 429) {
        message = 'Rate limit exceeded. Too many requests to the ClipDrop API.';
      }

      res.status(statusCode).json({
        status: 'fail',
        message: message
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from ClipDrop API');
      res.status(500).json({
        status: 'error',
        message: 'No response received from ClipDrop API. The service might be down or unreachable.'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({
        status: 'error',
        message: `Error: ${error.message}`
      });
    }
  }
};

// Text to Image generation
exports.textToImage = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a prompt'
      });
    }

    const formData = new FormData();
    formData.append('prompt', prompt);

    // Note: ClipDrop API generates images at a fixed 1024x1024 resolution
    // Width and height parameters are not supported

    await makeClipDropRequest('/text-to-image/v1', formData, req, res);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Image upscaling
exports.upscaleImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an image file'
      });
    }

    const formData = new FormData();
    formData.append('image_file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Add target dimensions if provided
    if (req.body.target_width && req.body.target_height) {
      formData.append('target_width', req.body.target_width);
      formData.append('target_height', req.body.target_height);
    }

    await makeClipDropRequest('/image-upscaling/v1/upscale', formData, req, res);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Image uncropping
exports.uncropImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an image file'
      });
    }

    const formData = new FormData();
    formData.append('image_file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Add uncrop parameters
    const extendPixels = req.body.extend_pixels || 200;
    formData.append('extend_left', req.body.extend_left || extendPixels);
    formData.append('extend_right', req.body.extend_right || extendPixels);
    formData.append('extend_up', req.body.extend_up || extendPixels);
    formData.append('extend_down', req.body.extend_down || extendPixels);

    await makeClipDropRequest('/uncrop/v1', formData, req, res);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Background removal
exports.removeBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an image file'
      });
    }

    const formData = new FormData();
    formData.append('image_file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    await makeClipDropRequest('/remove-background/v1', formData, req, res);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
