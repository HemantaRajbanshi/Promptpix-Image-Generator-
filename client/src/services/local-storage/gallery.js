import { generateId } from './index';
import { STORAGE_KEYS, IMAGE_CONFIG, UI_CONFIG } from '../../constants';

// Key for storing gallery items in localStorage
const GALLERY_STORAGE_KEY = STORAGE_KEYS.GALLERY;

/**
 * Get all gallery items
 * @returns {Array} Array of gallery items
 */
export const getGalleryItems = () => {
  try {
    const items = localStorage.getItem(GALLERY_STORAGE_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    return [];
  }
};

/**
 * Calculate the approximate size of a string in bytes
 * @param {string} str - The string to measure
 * @returns {number} Approximate size in bytes
 */
const getStringByteSize = (str) => {
  // Quick approximation: each character is ~2 bytes in UTF-16
  return str.length * 2;
};

/**
 * Save gallery items with adaptive storage management
 * @param {Array} items - Array of gallery items
 * @returns {boolean} Success status
 */
export const saveGalleryItems = (items) => {
  try {
    // Initial limit on number of items
    const MAX_ITEMS = 20;
    let itemsToSave = items.slice(0, MAX_ITEMS);

    // Try to save with progressively more aggressive strategies
    const strategies = [
      // Strategy 1: Just limit the number of items
      () => {
        return JSON.stringify(itemsToSave);
      },

      // Strategy 2: Reduce to fewer items
      () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Trying with fewer items...');
        }
        itemsToSave = items.slice(0, 10);
        return JSON.stringify(itemsToSave);
      },

      // Strategy 3: Further reduce image quality for all items
      () => {
        const reducedQualityItems = itemsToSave.map(item => {
          // Skip items without imageData
          if (!item.imageData || !item.imageData.startsWith('data:image')) {
            return item;
          }

          // For items with large image data, create a more compressed version
          if (item.imageData.length > 100000) {
            try {
              // Create an image from the data URL
              const img = document.createElement('img');
              img.src = item.imageData;

              // Create a canvas and draw the image at reduced quality
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d', { willReadFrequently: true });

              // Set smaller dimensions
              canvas.width = 400;
              canvas.height = 400;

              // Draw and compress
              ctx.drawImage(img, 0, 0, 400, 400);
              const compressedData = canvas.toDataURL('image/jpeg', 0.3);

              return { ...item, imageData: compressedData };
            } catch (e) {
              // If compression fails, just return the original item
              return item;
            }
          }

          return item;
        });

        return JSON.stringify(reducedQualityItems);
      },

      // Strategy 4: Last resort - keep only the most recent 5 items with minimal data
      () => {
        const minimalItems = items.slice(0, 5).map(item => ({
          id: item.id,
          createdAt: item.createdAt,
          type: item.type,
          prompt: item.prompt?.substring(0, 100) || 'Image',
          // Use a placeholder or very small thumbnail
          imageData: item.imageData?.substring(0, 1000) || null
        }));

        return JSON.stringify(minimalItems);
      }
    ];

    // Try each strategy in order until one works
    for (let i = 0; i < strategies.length; i++) {
      try {
        const serializedData = strategies[i]();

        // Check if the serialized data is too large (localStorage typically has ~5MB limit)
        if (getStringByteSize(serializedData) > 4000000) { // ~4MB safety threshold
          // Use less verbose logging in production
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`Strategy ${i+1} produced data too large for localStorage, trying next strategy...`);
          }
          continue;
        }

        localStorage.setItem(GALLERY_STORAGE_KEY, serializedData);
        if (i > 0 && process.env.NODE_ENV !== 'production') {
          console.log(`Successfully saved gallery items using strategy ${i+1}`);
        }
        return true;
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Strategy ${i+1} failed:`, e.message);
        }
        // Continue to next strategy
      }
    }

    // If we get here, all strategies failed
    console.error('All storage strategies failed. Unable to save gallery items.');
    return false;
  } catch (error) {
    console.error('Error saving gallery items:', error);
    return false;
  }
};

/**
 * Convert a Blob to a base64 string with adaptive resizing and compression
 * @param {Blob} blob - The blob to convert
 * @param {Object} options - Options for conversion
 * @param {number} options.maxWidth - Maximum width for the image
 * @param {number} options.maxHeight - Maximum height for the image
 * @param {number} options.quality - JPEG quality (0-1)
 * @returns {Promise<string>} A promise that resolves to the base64 string
 */
const blobToBase64 = async (blob, options = {}) => {
  // Default options with more aggressive compression
  const { maxWidth = 800, maxHeight = 800, quality = 0.7 } = options;

  // For non-image blobs, use direct conversion with size limit
  if (!blob.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        // If result is too large, reject
        if (result.length > 1000000) { // ~1MB limit for non-images
          reject(new Error('Non-image blob is too large for localStorage'));
        } else {
          resolve(result);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // For images, use adaptive compression based on size
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      // Determine compression level based on original dimensions
      let compressionLevel;
      const pixelCount = img.width * img.height;

      if (pixelCount > 1000000) { // > 1 megapixel
        compressionLevel = {
          maxWidth: Math.min(maxWidth, 600),
          maxHeight: Math.min(maxHeight, 600),
          quality: Math.min(quality, 0.5)
        };
      } else if (pixelCount > 500000) { // > 0.5 megapixel
        compressionLevel = {
          maxWidth: Math.min(maxWidth, 800),
          maxHeight: Math.min(maxHeight, 800),
          quality: Math.min(quality, 0.6)
        };
      } else {
        compressionLevel = {
          maxWidth,
          maxHeight,
          quality
        };
      }

      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > compressionLevel.maxWidth || height > compressionLevel.maxHeight) {
        const ratio = Math.min(compressionLevel.maxWidth / width, compressionLevel.maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      // Create canvas and resize image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with adaptive quality
      const dataUrl = canvas.toDataURL('image/jpeg', compressionLevel.quality);

      // If the result is still too large, try again with more aggressive compression
      if (dataUrl.length > 500000) { // ~500KB limit
        const moreCompressedDataUrl = canvas.toDataURL('image/jpeg', 0.3);
        resolve(moreCompressedDataUrl);
      } else {
        resolve(dataUrl);
      }
    };

    img.onerror = (error) => {
      // Clean up the blob URL on error with delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
      reject(error);
    };

    // Create a blob URL
    const blobUrl = URL.createObjectURL(blob);

    // Set up onload to clean up the blob URL after use with delay
    const originalOnload = img.onload;
    img.onload = function() {
      // Schedule cleanup after a delay to prevent race conditions
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000); // 1 second delay for internal blob URLs

      // Call the original onload handler
      if (originalOnload) {
        originalOnload.call(this);
      }
    };

    // Set the image source
    img.src = blobUrl;
  });
};

/**
 * Add a new item to the gallery
 * @param {Object} item - Gallery item to add
 * @param {string} item.imageUrl - URL or data URL of the image
 * @param {string} item.prompt - Prompt used to generate the image (optional)
 * @param {string} item.type - Type of image (text-to-image, upscale, etc.)
 * @param {string} item.userId - User ID who created the image
 * @param {Blob} item.blob - Image blob for downloading (optional)
 * @returns {Promise<Object>} Promise resolving to the added gallery item with ID and timestamp
 */
export const addGalleryItem = async (item) => {
  try {
    const items = getGalleryItems();

    const createdAt = new Date().toISOString();

    // Create new item with ID, timestamp, user association, and interaction tracking
    const newItem = {
      id: generateId(),
      createdAt,
      userId: item.userId || null, // Associate with user
      viewCount: 0, // Initialize view count for smart sorting
      lastViewed: createdAt, // Initialize last viewed to creation time
      ...item
    };

    // If we have a blob, convert it to base64 for persistent storage
    if (item.blob) {
      try {
        // Use adaptive compression based on image size
        const options = {
          maxWidth: item.blob.size > 2000000 ? 800 : 1200,
          maxHeight: item.blob.size > 2000000 ? 800 : 1200,
          quality: item.blob.size > 1000000 ? 0.5 : 0.7
        };

        // Convert blob to optimized base64 string
        const base64Image = await blobToBase64(item.blob, options);
        newItem.imageData = base64Image;

        // We don't need to store the blob in localStorage
        delete newItem.blob;

        // Keep the blob URL for gallery display - don't delete it from the item
        // The gallery component needs this URL to display the image
        if (newItem.imageUrl && newItem.imageUrl.startsWith('blob:')) {
          // Schedule cleanup after a longer delay to allow gallery navigation and rendering
          setTimeout(() => {
            URL.revokeObjectURL(newItem.imageUrl);
          }, 10000); // 10 second delay to ensure gallery has time to render
          // DON'T delete newItem.imageUrl - the gallery component needs it
        }
      } catch (conversionError) {
        console.error('Error converting image:', conversionError);

        // Fallback: store a reference to the image type without the actual data
        newItem.imageData = null;
        newItem.conversionError = true;
        newItem.errorMessage = 'Image was too large to store in gallery';

        // Clean up resources with delay but keep URL for gallery
        if (newItem.imageUrl && newItem.imageUrl.startsWith('blob:')) {
          // Schedule cleanup after a delay to allow navigation to complete
          setTimeout(() => {
            URL.revokeObjectURL(newItem.imageUrl);
          }, 10000); // Increased delay for error cases too
          // DON'T delete newItem.imageUrl - the gallery component needs it
        }
        delete newItem.blob;
      }
    }

    // Add to beginning of array (newest first)
    items.unshift(newItem);

    // Save updated items and handle potential failures
    const saveSuccess = saveGalleryItems(items);

    if (!saveSuccess) {
      // If saving failed, try to save just this item
      const singleItemSuccess = saveGalleryItems([newItem]);

      if (!singleItemSuccess) {
        // If that also failed, return a special error object
        return {
          ...newItem,
          saveError: true,
          errorMessage: 'Image was saved temporarily but could not be stored in gallery due to storage limitations'
        };
      }
    }

    return newItem;
  } catch (error) {
    console.error('Error adding gallery item:', error);
    return {
      id: generateId(),
      createdAt: new Date().toISOString(),
      type: item.type || 'unknown',
      prompt: item.prompt || 'Image',
      saveError: true,
      errorMessage: 'Failed to save image to gallery'
    };
  }
};

/**
 * Get gallery items for a specific user
 * @param {string} userId - User ID to filter by
 * @returns {Array} Array of gallery items for the user with backward compatibility
 */
export const getUserGalleryItems = (userId) => {
  try {
    if (!userId) return [];

    const items = getGalleryItems();
    return items
      .filter(item => item.userId === userId)
      .map(item => ({
        ...item,
        // Ensure backward compatibility with existing gallery items
        viewCount: item.viewCount || 0,
        lastViewed: item.lastViewed || item.createdAt
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
  } catch (error) {
    console.error('Error getting user gallery items:', error);
    return [];
  }
};

/**
 * Get user statistics from gallery items
 * @param {string} userId - User ID to calculate stats for
 * @returns {Object} User statistics object
 */
export const getUserStatistics = (userId) => {
  try {
    if (!userId) return { imagesGenerated: 0, imagesEdited: 0 };

    const userItems = getUserGalleryItems(userId);

    const imagesGenerated = userItems.filter(item =>
      item.type === 'text-to-image' ||
      item.type === 'upscale' ||
      item.type === 'remove-bg' ||
      item.type === 'uncrop'
    ).length;

    const imagesEdited = userItems.filter(item =>
      item.type === 'image-editor'
    ).length;

    return {
      imagesGenerated,
      imagesEdited,
      totalImages: userItems.length
    };
  } catch (error) {
    return { imagesGenerated: 0, imagesEdited: 0, totalImages: 0 };
  }
};

/**
 * Remove an item from the gallery
 * @param {string} itemId - ID of the item to remove
 * @returns {boolean} Success status
 */
export const removeGalleryItem = (itemId) => {
  try {
    const items = getGalleryItems();
    const updatedItems = items.filter(item => item.id !== itemId);

    // Save updated items
    saveGalleryItems(updatedItems);

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get a gallery item by ID
 * @param {string} itemId - ID of the item to get
 * @returns {Object|null} Gallery item or null if not found
 */
export const getGalleryItemById = (itemId) => {
  try {
    const items = getGalleryItems();
    return items.find(item => item.id === itemId) || null;
  } catch (error) {
    console.error('Error getting gallery item:', error);
    return null;
  }
};

/**
 * Update gallery item interaction (view count and last viewed timestamp)
 * @param {string} itemId - ID of the item to update
 * @returns {Object|null} Updated gallery item or null if not found
 */
export const updateGalleryItemInteraction = (itemId) => {
  try {
    const items = getGalleryItems();
    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return null;
    }

    // Update interaction data
    items[itemIndex] = {
      ...items[itemIndex],
      viewCount: (items[itemIndex].viewCount || 0) + 1,
      lastViewed: new Date().toISOString()
    };

    // Save updated items
    saveGalleryItems(items);

    return items[itemIndex];
  } catch (error) {
    console.error('Error updating gallery item interaction:', error);
    return null;
  }
};

/**
 * Update a gallery item
 * @param {string} itemId - ID of the item to update
 * @param {Object} updates - Updates to apply to the item
 * @returns {Object|null} Updated gallery item or null if not found
 */
export const updateGalleryItem = (itemId, updates) => {
  try {
    const items = getGalleryItems();
    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return null;
    }

    // Update item
    items[itemIndex] = {
      ...items[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Save updated items
    saveGalleryItems(items);

    return items[itemIndex];
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return null;
  }
};

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Levenshtein distance
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
};

/**
 * Check if a word matches a target with fuzzy matching
 * @param {string} word - Word to match
 * @param {string} target - Target string
 * @param {number} threshold - Maximum allowed distance (default: 2)
 * @returns {Object} Match result with score and type
 */
const fuzzyMatch = (word, target, threshold = 2) => {
  const wordLower = word.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact match (highest score)
  if (wordLower === targetLower) {
    return { matches: true, score: 100, type: 'exact' };
  }

  // Substring match (high score)
  if (targetLower.includes(wordLower) || wordLower.includes(targetLower)) {
    return { matches: true, score: 80, type: 'substring' };
  }

  // Fuzzy match using Levenshtein distance
  const distance = levenshteinDistance(wordLower, targetLower);
  if (distance <= threshold) {
    const score = Math.max(0, 60 - (distance * 20)); // Score decreases with distance
    return { matches: true, score, type: 'fuzzy' };
  }

  return { matches: false, score: 0, type: 'none' };
};

/**
 * Search gallery items with fuzzy pattern matching
 * @param {Array} items - Gallery items to search
 * @param {string} searchQuery - Search query
 * @returns {Array} Filtered and ranked search results
 */
export const searchGalleryItems = (items, searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '') {
    return items;
  }

  const query = searchQuery.trim().toLowerCase();
  const searchTokens = query.split(/\s+/).filter(token => token.length > 0);

  if (searchTokens.length === 0) {
    return items;
  }

  const results = [];

  // Performance optimization: limit complex operations for large galleries
  const maxItemsForFuzzySearch = 100;
  const shouldUseFuzzySearch = items.length <= maxItemsForFuzzySearch;

  for (const item of items) {
    const prompt = (item.prompt || '').toLowerCase();
    const type = (item.type || '').toLowerCase();
    const searchableText = `${prompt} ${type}`;

    let totalScore = 0;
    let matchedTokens = 0;
    const tokenMatches = [];

    // Check each search token against the item
    for (const token of searchTokens) {
      let bestMatch = { matches: false, score: 0, type: 'none' };

      // Split searchable text into words for token matching
      const words = searchableText.split(/\s+/).filter(word => word.length > 0);

      for (const word of words) {
        let match;

        if (shouldUseFuzzySearch) {
          // Use fuzzy matching for smaller galleries
          match = fuzzyMatch(token, word);
        } else {
          // Use only substring matching for larger galleries (performance)
          const tokenLower = token.toLowerCase();
          const wordLower = word.toLowerCase();

          if (wordLower === tokenLower) {
            match = { matches: true, score: 100, type: 'exact' };
          } else if (wordLower.includes(tokenLower) || tokenLower.includes(wordLower)) {
            match = { matches: true, score: 80, type: 'substring' };
          } else {
            match = { matches: false, score: 0, type: 'none' };
          }
        }

        if (match.matches && match.score > bestMatch.score) {
          bestMatch = match;
        }
      }

      if (bestMatch.matches) {
        matchedTokens++;
        totalScore += bestMatch.score;
        tokenMatches.push({ token, match: bestMatch });
      }
    }

    // Require at least 60% of tokens to match
    const matchPercentage = matchedTokens / searchTokens.length;
    if (matchPercentage >= 0.6) {
      // Calculate final score based on match quality and percentage
      const averageScore = totalScore / matchedTokens;
      const finalScore = averageScore * matchPercentage;

      results.push({
        ...item,
        searchScore: finalScore,
        matchedTokens,
        totalTokens: searchTokens.length,
        matchPercentage,
        tokenMatches
      });
    }
  }

  // Sort by search score (highest first)
  return results.sort((a, b) => b.searchScore - a.searchScore);
};

/**
 * Clear all gallery items
 * @returns {boolean} Success status
 */
export const clearGallery = () => {
  try {
    saveGalleryItems([]);
    return true;
  } catch (error) {
    console.error('Error clearing gallery:', error);
    return false;
  }
};
