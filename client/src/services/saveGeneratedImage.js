import { useAuth } from '../context/AuthContext';
import { saveImage } from '../services/local-storage/images';

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
 * Save a generated image to localStorage
 * @param {string} dataUrl - Data URL of the image
 * @param {Object} metadata - Image metadata (prompt, settings, etc.)
 * @returns {Promise<Object>} - Saved image data
 */
export const saveGeneratedImage = async (dataUrl, metadata) => {
  const { user } = useAuth();

  if (!user || !user.uid) {
    throw new Error('User not authenticated');
  }

  try {
    // Convert data URL to blob
    const blob = dataUrlToBlob(dataUrl);

    // Save image to localStorage
    const savedImage = await saveImage(user.uid, blob, metadata);

    return savedImage;
  } catch (error) {
    console.error('Error saving generated image:', error);
    throw error;
  }
};

/**
 * Hook to save a generated image to localStorage
 * @returns {Function} - Function to save an image
 */
export const useSaveGeneratedImage = () => {
  const { user } = useAuth();

  return async (dataUrl, metadata) => {
    if (!user || !user.uid) {
      throw new Error('User not authenticated');
    }

    try {
      return await saveGeneratedImage(dataUrl, metadata);
    } catch (error) {
      console.error('Error saving generated image:', error);
      throw error;
    }
  };
};
