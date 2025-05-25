/**
 * ClipDrop API Service
 *
 * This service provides integration with the ClipDrop API for various image processing tasks:
 * - Text-to-Image generation
 * - Image upscaling
 * - Image uncropping
 * - Background removal
 *
 * Each function includes robust error handling and fallback mechanisms.
 *
 * SECURITY UPDATE: This service now uses a secure backend proxy to protect the API key.
 * All requests are authenticated and the API key is stored only on the server.
 */

// Import the secure API service
import { clipdropAPI } from './api';

/**
 * Generate an image from text prompt
 * @param {string} prompt - Text description of the image to generate
 * @param {Object} options - Additional options like resolution
 * @param {number} options.width - Width of the generated image (default: 1024)
 * @param {number} options.height - Height of the generated image (default: 1024)
 * @returns {Promise<Blob>} - Generated image as blob
 */
export const generateImage = async (prompt, options = {}) => {
  // ClipDrop API uses a fixed resolution of 1024x1024
  // We'll ignore any provided width/height as the API doesn't support custom resolutions
  const width = 1024;
  const height = 1024;

  try {
    // Call the secure API proxy with just the prompt
    const imageBlob = await clipdropAPI.textToImage(prompt);
    return imageBlob;
  } catch (error) {
    // Enhanced error handling for better user experience
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      error.message = 'Network error: Check if the server is running and API key is configured';
    } else if (error.message.includes('401') || error.message.includes('403')) {
      error.message = 'Authentication error: API key may be invalid or expired';
    } else if (error.message.includes('429')) {
      error.message = 'Rate limit exceeded: Too many requests to the API';
    }

    // Create fallback image if API call fails

    // Create canvas for fallback image with the requested dimensions
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Create gradient background for high-resolution fallback
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8a2be2'); // Purple
    gradient.addColorStop(1, '#4169e1'); // Royal Blue

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add format indicator
    ctx.font = `${Math.max(16, canvas.width / 60)}px Arial`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'right';
    ctx.fillText('1024×1024 PNG (high-quality, lossless)', canvas.width - 20, canvas.height - 20);

    // Add text to indicate fallback
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('API Error', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText('Image Generation Failed', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText('Please check API key and try again', canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = '16px Arial';
    ctx.fillText(prompt.substring(0, 30) + (prompt.length > 30 ? '...' : ''), canvas.width / 2, canvas.height / 2 + 60);

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  }
};

/**
 * Upscale an image to higher resolution
 * @param {File} imageFile - Image file to upscale
 * @returns {Promise<Blob>} - Upscaled image as blob
 */
export const upscaleImage = async (imageFile) => {
  // Calculate target dimensions
  const targetWidth = Math.min(imageFile.width * 2 || 2048, 4096);
  const targetHeight = Math.min(imageFile.height * 2 || 2048, 4096);

  try {
    // Call the secure API proxy
    const imageBlob = await clipdropAPI.upscaleImage(imageFile, targetWidth, targetHeight);
    return imageBlob;
  } catch (error) {
    // Create fallback upscaled image

    // Load the original image
    const imageUrl = await readFileAsDataURL(imageFile);
    const img = await loadImage(imageUrl);

    // Create canvas with 2x dimensions
    const canvas = document.createElement('canvas');
    canvas.width = img.width * 2;
    canvas.height = img.height * 2;
    const ctx = canvas.getContext('2d');

    // Draw image at 2x size with smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Apply sharpening filter
    applySharpening(ctx, canvas.width, canvas.height);

    // Add label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Upscaled 2x (API Error)', canvas.width - 10, canvas.height - 10);

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  }
};

/**
 * Uncrop an image (expand canvas)
 * @param {File} imageFile - Image file to uncrop
 * @returns {Promise<Blob>} - Uncropped image as blob
 */
export const uncropImage = async (imageFile) => {
  // Define extend options
  const extendPixels = 200; // Default extend amount
  const extendOptions = {
    extend_left: extendPixels,
    extend_right: extendPixels,
    extend_up: extendPixels,
    extend_down: extendPixels
  };

  try {
    console.log('Uncropping image:', imageFile.name);

    // Call the secure API proxy
    const imageBlob = await clipdropAPI.uncropImage(imageFile, extendOptions);
    console.log('Received image blob:', imageBlob.size, 'bytes, type:', imageBlob.type);

    return imageBlob;
  } catch (error) {
    console.error('Error uncropping image:', error);

    // Create fallback uncropped image
    console.log('Creating fallback uncropped image...');

    // Load the original image
    const imageUrl = await readFileAsDataURL(imageFile);
    const img = await loadImage(imageUrl);

    // Create canvas with expanded dimensions
    const expandFactor = 1.5; // Expand by 50%
    const canvas = document.createElement('canvas');
    canvas.width = img.width * expandFactor;
    canvas.height = img.height * expandFactor;
    const ctx = canvas.getContext('2d');

    // Create a subtle pattern for the background
    createBackgroundPattern(ctx, canvas.width, canvas.height);

    // Draw the original image in the center
    const offsetX = (canvas.width - img.width) / 2;
    const offsetY = (canvas.height - img.height) / 2;
    ctx.drawImage(img, offsetX, offsetY, img.width, img.height);

    // Add a border to show the original image boundaries
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, img.width, img.height);

    // Add label
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Uncropped (API Error)', canvas.width - 10, canvas.height - 10);

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  }
};

/**
 * Remove background from an image
 * @param {File} imageFile - Image file to process
 * @returns {Promise<Blob>} - Image with background removed as blob
 */
export const removeBackground = async (imageFile) => {
  try {
    // Call the secure API proxy
    const imageBlob = await clipdropAPI.removeBackground(imageFile);
    return imageBlob;
  } catch (error) {
    // Create fallback background-removed image

    // Load the original image
    const imageUrl = await readFileAsDataURL(imageFile);
    const img = await loadImage(imageUrl);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Draw the image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Apply background removal algorithm
    removeBackgroundAlgorithm(data);

    // Put the modified image data back on the canvas
    ctx.putImageData(imageData, 0, 0);

    // Add label
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('Background Removed (API Error)', canvas.width - 10, canvas.height - 10);

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  }
};

/**
 * Convert blob to URL for display
 * @param {Blob} blob - Image blob
 * @returns {string} - Object URL
 */
export const blobToURL = (blob) => {
  return URL.createObjectURL(blob);
};

// Download functionality moved to utils/download.js

// ===== Helper Functions =====

/**
 * Read a file as data URL
 * @param {File} file - File to read
 * @returns {Promise<string>} - Data URL
 */
const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Load an image from URL
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>} - Loaded image
 */
const loadImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = url;
  });
};

/**
 * Apply sharpening filter to canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
const applySharpening = (ctx, width, height) => {
  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const dataBackup = new Uint8ClampedArray(data);

  // Simple sharpening kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  // Apply convolution
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const offset = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        let val = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            val += dataBackup[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        data[offset + c] = Math.max(0, Math.min(255, val));
      }
    }
  }

  // Put the modified image data back
  ctx.putImageData(imageData, 0, 0);
};

/**
 * Create a subtle background pattern
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
const createBackgroundPattern = (ctx, width, height) => {
  // Fill with a light color
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  // Add subtle grid pattern
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
  ctx.lineWidth = 0.5;

  const gridSize = 20;

  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

/**
 * Background removal algorithm
 * @param {Uint8ClampedArray} data - Image data array
 */
const removeBackgroundAlgorithm = (data) => {
  // Simple background removal based on color thresholds
  // This is a simplified version - real background removal is much more complex

  // Detect likely background colors
  const colorCounts = {};
  const samples = 1000;
  const step = Math.floor(data.length / 4 / samples);

  // Sample colors from the image edges
  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Create a simplified color key (reduce precision to group similar colors)
    const colorKey = `${Math.floor(r/10)},${Math.floor(g/10)},${Math.floor(b/10)}`;

    if (!colorCounts[colorKey]) {
      colorCounts[colorKey] = 0;
    }
    colorCounts[colorKey]++;
  }

  // Find the most common color (likely background)
  let maxCount = 0;
  let bgColorKey = '';

  for (const key in colorCounts) {
    if (colorCounts[key] > maxCount) {
      maxCount = colorCounts[key];
      bgColorKey = key;
    }
  }

  // Parse the background color
  const [rBg, gBg, bBg] = bgColorKey.split(',').map(v => parseInt(v) * 10);

  // Set threshold for color similarity
  const threshold = 30;

  // Make similar colors transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate color distance
    const distance = Math.sqrt(
      Math.pow(r - rBg, 2) +
      Math.pow(g - gBg, 2) +
      Math.pow(b - bBg, 2)
    );

    // If color is similar to background, make it transparent
    if (distance < threshold) {
      // Adjust alpha based on similarity
      const alpha = Math.min(255, Math.max(0, Math.floor(distance / threshold * 255)));
      data[i + 3] = alpha;
    }
  }
};
