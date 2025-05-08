import { getImages, saveImages, generateId } from './index';

/**
 * Convert data URL to blob
 * @param {string} dataUrl - Data URL of the image
 * @returns {Blob} - Blob representation of the data URL
 */
export const dataUrlToBlob = (dataUrl) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Save image metadata to localStorage
 * @param {string} userId - User ID
 * @param {Object} imageData - Image metadata
 * @returns {Promise<Object>} - Saved image data
 */
export const saveImageMetadata = async (userId, imageData) => {
  try {
    // Get all images
    const images = getImages();
    
    // Create new image
    const newImage = {
      id: generateId(),
      userId,
      prompt: imageData.prompt || '',
      toolType: imageData.toolType || 'text-to-image',
      imageUrl: imageData.imageUrl || '',
      dataUrl: imageData.dataUrl || '',
      fileName: imageData.fileName || `image_${Date.now()}.png`,
      metadata: imageData.metadata || {},
      createdAt: new Date().toISOString()
    };
    
    // Add image to images array
    images.push(newImage);
    
    // Save images to localStorage
    saveImages(images);
    
    return newImage;
  } catch (error) {
    console.error('Error saving image metadata:', error);
    throw error;
  }
};

/**
 * Get user images
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of user images
 */
export const getUserImages = async (userId) => {
  try {
    // Get all images
    const images = getImages();
    
    // Filter images by user ID and sort by createdAt (newest first)
    return images
      .filter(image => image.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error getting user images:', error);
    throw error;
  }
};

/**
 * Delete image
 * @param {string} imageId - Image ID
 * @returns {Promise<boolean>} - True if successful
 */
export const deleteImage = async (imageId) => {
  try {
    // Get all images
    const images = getImages();
    
    // Filter out the image to delete
    const updatedImages = images.filter(image => image.id !== imageId);
    
    // Save updated images to localStorage
    saveImages(updatedImages);
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Save a generated image
 * @param {string} userId - User ID
 * @param {Blob} imageBlob - Image blob
 * @param {Object} metadata - Image metadata
 * @returns {Promise<Object>} - Saved image data
 */
export const saveImage = async (userId, imageBlob, metadata) => {
  try {
    // Convert blob to data URL
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });
    reader.readAsDataURL(imageBlob);
    
    const dataUrl = await dataUrlPromise;
    
    // Save image metadata
    const imageData = {
      prompt: metadata.prompt || '',
      toolType: metadata.toolType || 'text-to-image',
      dataUrl: dataUrl,
      fileName: metadata.fileName || `image_${Date.now()}.png`,
      metadata: metadata
    };
    
    return await saveImageMetadata(userId, imageData);
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};
