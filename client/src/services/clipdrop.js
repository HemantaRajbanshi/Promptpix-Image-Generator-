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
 */

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_CLIPDROP_API_KEY;
const BASE_URL = 'https://clipdrop-api.co';

// Log API key for debugging (first few characters only)
console.log('API Key (first 10 chars):', API_KEY ? API_KEY.substring(0, 10) + '...' : 'undefined');

/**
 * Generate an image from text prompt
 * @param {string} prompt - Text description of the image to generate
 * @param {Object} options - Additional options like negative prompt
 * @returns {Promise<Blob>} - Generated image as blob
 */
export const generateImage = async (prompt, options = {}) => {
  // Prepare form data
  const formData = new FormData();
  formData.append('prompt', prompt);

  // According to the API docs, negative_prompt is not supported
  // We'll just log this for debugging
  if (options.negativePrompt) {
    console.log('Note: negative_prompt is not supported by the API, ignoring:', options.negativePrompt);
  }

  try {
    console.log('Generating image with prompt:', prompt);
    console.log('API endpoint:', `${BASE_URL}/text-to-image/v1`);
    console.log('Using API key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'undefined');

    // Make API request with proper headers
    const response = await fetch(`${BASE_URL}/text-to-image/v1`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'image/png' // Explicitly request PNG format
      },
      body: formData,
    });

    // Log response details
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // For debugging - check if response is valid
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Get the image blob directly
    const imageBlob = await response.blob();
    console.log('Received image blob:', imageBlob.size, 'bytes, type:', imageBlob.type);

    return imageBlob;
  } catch (error) {
    console.error('Error generating image:', error);

    // Create fallback image if API call fails
    console.log('Creating fallback image...');

    // Create canvas for fallback image
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8a2be2'); // Purple
    gradient.addColorStop(1, '#4169e1'); // Royal Blue

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  // Prepare form data
  const formData = new FormData();
  formData.append('image_file', imageFile);

  // Add required target dimensions
  const targetWidth = Math.min(imageFile.width * 2 || 2048, 4096);
  const targetHeight = Math.min(imageFile.height * 2 || 2048, 4096);
  formData.append('target_width', targetWidth);
  formData.append('target_height', targetHeight);

  try {
    console.log('Upscaling image:', imageFile.name);
    console.log('API endpoint:', `${BASE_URL}/image-upscaling/v1/upscale`);
    console.log('Using API key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'undefined');

    // Make API request with proper headers
    const response = await fetch(`${BASE_URL}/image-upscaling/v1/upscale`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'image/*'
      },
      body: formData,
    });

    // Log response details
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // For debugging - check if response is valid
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Get the image blob directly
    const imageBlob = await response.blob();
    console.log('Received image blob:', imageBlob.size, 'bytes, type:', imageBlob.type);

    return imageBlob;
  } catch (error) {
    console.error('Error upscaling image:', error);

    // Create fallback upscaled image
    console.log('Creating fallback upscaled image...');

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
  // Prepare form data
  const formData = new FormData();
  formData.append('image_file', imageFile);

  // Add uncrop parameters - extend by 20% in all directions
  const extendPixels = 200; // Default extend amount
  formData.append('extend_left', extendPixels);
  formData.append('extend_right', extendPixels);
  formData.append('extend_up', extendPixels);
  formData.append('extend_down', extendPixels);

  try {
    console.log('Uncropping image:', imageFile.name);
    console.log('API endpoint:', `${BASE_URL}/uncrop/v1`);
    console.log('Using API key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'undefined');

    // Make API request with proper headers
    const response = await fetch(`${BASE_URL}/uncrop/v1`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'image/*'
      },
      body: formData,
    });

    // Log response details
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // For debugging - check if response is valid
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Get the image blob directly
    const imageBlob = await response.blob();
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
  // Prepare form data
  const formData = new FormData();
  formData.append('image_file', imageFile);

  try {
    console.log('Removing background from image:', imageFile.name);
    console.log('API endpoint:', `${BASE_URL}/remove-background/v1`);
    console.log('Using API key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'undefined');

    // Make API request with proper headers
    const response = await fetch(`${BASE_URL}/remove-background/v1`, {
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'image/png' // Explicitly request PNG for transparency
      },
      body: formData,
    });

    // Log response details
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // For debugging - check if response is valid
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // Get the image blob directly
    const imageBlob = await response.blob();
    console.log('Received image blob:', imageBlob.size, 'bytes, type:', imageBlob.type);

    return imageBlob;
  } catch (error) {
    console.error('Error removing background:', error);

    // Create fallback background-removed image
    console.log('Creating fallback background-removed image...');

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

/**
 * Download image to user's device
 * @param {Blob} blob - Image blob
 * @param {string} filename - Filename for download
 */
export const downloadImage = (blob, filename = 'promptpix-image.png') => {
  const url = blobToURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

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
