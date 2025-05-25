/**
 * Download utility for images
 * Handles downloading images with standardized resolution and format
 */

import { IMAGE_CONFIG } from '../constants';

// Target resolution for downloads
const TARGET_RESOLUTION = IMAGE_CONFIG.TARGET_RESOLUTION;

/**
 * Download an image from a blob in high quality at specified resolution
 * @param {Blob|string} blobOrUrl - The image blob or blob URL
 * @param {string} filename - The filename to save as
 */
export const downloadImage = (blobOrUrl, filename) => {
  try {
    // Handle if a URL string is passed instead of a blob
    if (typeof blobOrUrl === 'string') {
      // If it's a blob URL, fetch it first
      if (blobOrUrl.startsWith('blob:')) {
        fetch(blobOrUrl)
          .then(response => response.blob())
          .then(blob => downloadImage(blob, filename))
          .catch(error => {
            alert('Failed to download image. Please try again.');
          });
        return;
      }

      // If it's a regular URL, also fetch it
      fetch(blobOrUrl)
        .then(response => response.blob())
        .then(blob => downloadImage(blob, filename))
        .catch(error => {
          console.error('Error fetching URL:', error);
          alert('Failed to download image. Please try again.');
        });
      return;
    }

    // Ensure we have a valid blob
    const blob = blobOrUrl instanceof Blob ? blobOrUrl : new Blob([]);

    // For PNG blobs, use direct download to preserve quality
    if (blob.type === 'image/png') {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Clean up after a short delay to ensure the download starts
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      return;
    }

    // For non-PNG formats, convert to high-quality PNG
    const img = new Image();

    // Standard resolution for all downloaded images
    const TARGET_RESOLUTION = 1024;

    // Handle errors
    img.onerror = () => {
      alert('Failed to prepare image for download. Please try again.');

      // Fallback to direct download (original resolution)
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    };

    img.onload = () => {
      try {
        // Create a canvas with 1080x1080 dimensions
        const canvas = document.createElement('canvas');
        canvas.width = TARGET_RESOLUTION;
        canvas.height = TARGET_RESOLUTION;

        // Get the source dimensions
        const sourceWidth = img.width;
        const sourceHeight = img.height;

        // Calculate dimensions to maintain aspect ratio while filling the 1080x1080 canvas
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

        if (sourceWidth > sourceHeight) {
          // Landscape image
          drawHeight = TARGET_RESOLUTION;
          drawWidth = (sourceWidth / sourceHeight) * TARGET_RESOLUTION;
          offsetX = (TARGET_RESOLUTION - drawWidth) / 2;
        } else if (sourceHeight > sourceWidth) {
          // Portrait image
          drawWidth = TARGET_RESOLUTION;
          drawHeight = (sourceHeight / sourceWidth) * TARGET_RESOLUTION;
          offsetY = (TARGET_RESOLUTION - drawHeight) / 2;
        } else {
          // Square image
          drawWidth = TARGET_RESOLUTION;
          drawHeight = TARGET_RESOLUTION;
        }

        // Draw the image on the canvas with high quality
        const ctx = canvas.getContext('2d');

        // Fill with black background to ensure no transparency
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Enable high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the image centered
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Convert to high-quality PNG
        canvas.toBlob((highQualityBlob) => {
          if (!highQualityBlob) {
            console.error('Failed to create high-quality blob');
            // Fallback to original blob
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 100);
            return;
          }

          // Create download link for high-quality blob
          const url = URL.createObjectURL(highQualityBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();

          // Clean up
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }, 'image/png', 1.0); // Use maximum quality (1.0)
      } catch (error) {
        console.error('Error processing image for download:', error);
        // Fallback to direct download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }
    };

    // Create a blob URL
    const blobUrl = URL.createObjectURL(blob);

    // We need to be careful here because we've already defined an onload handler above
    // Instead of replacing it, we'll wrap it to ensure both handlers run
    const existingOnload = img.onload;

    img.onload = function() {
      // Clean up the blob URL after the image is loaded
      URL.revokeObjectURL(blobUrl);

      // Call the existing onload handler which contains our image processing logic
      if (existingOnload) {
        existingOnload.call(this);
      }
    };

    // Set the image source to trigger the load
    img.src = blobUrl;
  } catch (error) {
    alert('Failed to download image. Please try again.');
  }
};
