/**
 * BlobURLManager - A utility to manage blob URLs and prevent memory leaks
 * 
 * This manager keeps track of all created blob URLs and provides methods to:
 * - Create new blob URLs
 * - Revoke specific blob URLs
 * - Revoke all blob URLs when they're no longer needed
 */

class BlobURLManager {
  constructor() {
    // Set to store all active blob URLs
    this.activeURLs = new Set();
  }

  /**
   * Create a blob URL and track it
   * @param {Blob} blob - The blob to create a URL for
   * @returns {string} The created blob URL
   */
  create(blob) {
    if (!blob) {
      console.warn('Attempted to create blob URL with invalid blob');
      return null;
    }

    try {
      const url = URL.createObjectURL(blob);
      this.activeURLs.add(url);
      return url;
    } catch (error) {
      console.error('Error creating blob URL:', error);
      return null;
    }
  }

  /**
   * Revoke a specific blob URL
   * @param {string} url - The blob URL to revoke
   */
  revoke(url) {
    if (!url || !url.startsWith('blob:')) {
      return;
    }

    try {
      URL.revokeObjectURL(url);
      this.activeURLs.delete(url);
    } catch (error) {
      console.error('Error revoking blob URL:', error);
    }
  }

  /**
   * Revoke all tracked blob URLs
   */
  revokeAll() {
    this.activeURLs.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error revoking blob URL:', error);
      }
    });
    this.activeURLs.clear();
  }

  /**
   * Check if a URL is a valid blob URL
   * @param {string} url - The URL to check
   * @returns {boolean} Whether the URL is a valid blob URL
   */
  isValid(url) {
    return url && url.startsWith('blob:') && this.activeURLs.has(url);
  }
}

// Create a singleton instance
const blobURLManager = new BlobURLManager();

export default blobURLManager;
