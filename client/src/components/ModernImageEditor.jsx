import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addGalleryItem } from '../services/local-storage/gallery';
import ModernRotateTool from './ModernRotateTool';
import ModernFilterTool from './ModernFilterTool';
import ModernAdjustmentTool from './ModernAdjustmentTool';
import blobURLManager from '../utils/blobURLManager';

const ModernImageEditor = ({ imageUrl, onClose, onSave }) => {
  // State
  const [activeTab, setActiveTab] = useState('filters');
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Refs
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const originalImageUrl = useRef(null);
  const savedMessageTimeoutRef = useRef(null);

  // Cleanup function for timeouts and async operations
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (savedMessageTimeoutRef.current) {
        clearTimeout(savedMessageTimeoutRef.current);
      }

      // Revoke all blob URLs to prevent memory leaks
      blobURLManager.revokeAll();
    };
  }, []);

  // Load the image when the component mounts
  useEffect(() => {
    if (imageUrl) {
      setCurrentImageUrl(imageUrl);
      originalImageUrl.current = imageUrl;

      // Initialize history with original image
      setHistory([imageUrl]);
      setHistoryIndex(0);
      setCanUndo(false);
      setCanRedo(false);

      // Load the image into the canvas
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Enable CORS to prevent tainted canvas

      // Handle image load errors
      img.onerror = (e) => {
        console.warn('Failed to load initial image:', e);
        // If this is a blob URL that failed, it might have been revoked
        if (imageUrl.startsWith('blob:')) {
          console.warn('Blob URL failed to load, it might have been revoked');
        }
      };

      img.onload = () => {
        // Store the original image URL for reference
        originalImageUrl.current = imageUrl;

        // Store reference to the image
        imageRef.current = img;

        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
      };

      // Start loading the image
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // Update canvas when currentImageUrl changes
  useEffect(() => {
    if (!currentImageUrl) return;

    // Create a new image element
    const img = new Image();

    // Handle errors to prevent console errors
    img.onerror = (e) => {
      console.warn('Failed to load image:', e);

      // Check if this is a blob URL that might have been revoked
      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        console.warn('Blob URL failed to load, it might have been revoked');

        // Remove it from the manager if it's invalid
        if (!blobURLManager.isValid(currentImageUrl)) {
          console.warn('Removing invalid blob URL from manager');
          blobURLManager.revoke(currentImageUrl);
        }
      }

      // If the current URL fails, try the original URL as fallback
      if (currentImageUrl !== imageUrl && imageUrl) {
        console.log('Trying original image URL as fallback');
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'Anonymous';
        fallbackImg.onload = () => {
          imageRef.current = fallbackImg;
          loadImageToCanvas(fallbackImg);
          // Update current URL to the original URL
          setCurrentImageUrl(imageUrl);
        };
        fallbackImg.onerror = () => console.error('Both current and original image URLs failed to load');
        fallbackImg.src = imageUrl;
      }
    };

    // Handle successful load
    img.onload = () => {
      // Store reference to the image
      imageRef.current = img;
      loadImageToCanvas(img);
    };

    // Start loading the image
    img.src = currentImageUrl;

    // Helper function to load image to canvas
    function loadImageToCanvas(imgElement) {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // Set canvas dimensions to match image
      canvas.width = imgElement.width;
      canvas.height = imgElement.height;

      // Draw image on canvas
      ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
    }

    // Cleanup function
    return () => {
      // Cancel image loading
      img.onload = null;
      img.onerror = null;
    };
  }, [currentImageUrl, imageUrl]);

  // Handle save to gallery
  const handleSaveToGallery = async () => {
    if (canvasRef.current) {
      setIsSaving(true);

      try {
        // Get the latest changes
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            try {
              // Create a temporary URL for preview
              const url = blobURLManager.create(blob);
              if (!url) {
                console.error('Failed to create blob URL for gallery image');
                setIsSaving(false);
                return;
              }

              // Save to gallery
              const result = await addGalleryItem({
                imageUrl: url,
                prompt: 'Edited image',
                type: 'image-editor',
                blob: blob
              });

              if (process.env.NODE_ENV !== 'production') {
                console.log('Saved to gallery:', result);
              }

              // Show saved message
              setShowSavedMessage(true);
              const timeoutId = setTimeout(() => setShowSavedMessage(false), 3000);

              // Store the timeout ID for cleanup
              savedMessageTimeoutRef.current = timeoutId;
            } catch (innerError) {
              console.error('Error in gallery save process:', innerError);
              alert('Failed to save to gallery. Please try again.');
            }

            setIsSaving(false);
          } else {
            console.error('No blob generated from canvas');
            setIsSaving(false);
            alert('Failed to save image. Please try again.');
          }
        }, 'image/png', 0.95);
      } catch (error) {
        console.error('Error saving to gallery:', error);
        setIsSaving(false);
        alert('Failed to save to gallery. Please try again.');
      }
    }
  };

  // Handle download
  const handleDownload = () => {
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `edited-image-${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 0.95);
    }
  };

  // State for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'filters', label: 'Filters', icon: '✨' },
    { id: 'adjust', label: 'Adjust', icon: '🔧' },
    { id: 'rotate', label: 'Rotate', icon: '🔄' }
  ];

  // Add to history
  const addToHistory = (imageData) => {
    // Limit history to 20 items
    const newHistory = [...history.slice(0, historyIndex + 1), imageData].slice(-20);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanUndo(newHistory.length > 1);
    setCanRedo(false);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentImageUrl(history[historyIndex - 1]);
      setCanUndo(historyIndex - 1 > 0);
      setCanRedo(true);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentImageUrl(history[historyIndex + 1]);
      setCanUndo(true);
      setCanRedo(historyIndex + 1 < history.length - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <motion.div
        className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mr-4">Image Editor</h2>

            <div className="flex space-x-1">
              <motion.button
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Undo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </motion.button>

              <motion.button
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-30"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Redo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <AnimatePresence>
              {showSavedMessage && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-green-500 text-sm font-medium"
                >
                  Saved to gallery!
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-md text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Download
            </motion.button>

            <motion.button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas area */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 overflow-auto p-4">
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[70vh] shadow-lg"
              />
            </div>
          </div>

          {/* Tools panel */}
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex overflow-x-auto p-1 bg-gray-50 dark:bg-gray-900">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  <span className="block text-center">{tab.icon}</span>
                  <span className="block text-center mt-1">{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Active tool */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'filters' && (
                <ModernFilterTool
                  imageUrl={currentImageUrl}
                  canvasRef={canvasRef}
                  onSave={(blob) => {
                    if (blob) {
                      // Update the current image with the filtered version
                      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
                        blobURLManager.revoke(currentImageUrl);
                      }

                      const url = blobURLManager.create(blob);
                      if (url) {
                        setCurrentImageUrl(url);
                        addToHistory(url);
                      } else {
                        console.error('Failed to create blob URL for filtered image');
                        return;
                      }

                      // Load the filtered image into the canvas
                      const img = new Image();
                      img.onload = () => {
                        if (canvasRef.current) {
                          const canvas = canvasRef.current;
                          const ctx = canvas.getContext('2d', { willReadFrequently: true });

                          // Set canvas dimensions to match image
                          canvas.width = img.width;
                          canvas.height = img.height;

                          // Draw image on canvas
                          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                          // Store reference to the image
                          imageRef.current = img;
                        }
                      };
                      img.src = url;
                    }
                  }}
                />
              )}

              {activeTab === 'adjust' && (
                <ModernAdjustmentTool
                  imageUrl={currentImageUrl}
                  canvasRef={canvasRef}
                  onSave={(blob) => {
                    if (blob) {
                      // Update the current image with the adjusted version
                      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
                        blobURLManager.revoke(currentImageUrl);
                      }

                      const url = blobURLManager.create(blob);
                      if (url) {
                        setCurrentImageUrl(url);
                        addToHistory(url);
                      } else {
                        console.error('Failed to create blob URL for adjusted image');
                        return;
                      }

                      // Load the adjusted image into the canvas
                      const img = new Image();
                      img.onload = () => {
                        if (canvasRef.current) {
                          const canvas = canvasRef.current;
                          const ctx = canvas.getContext('2d', { willReadFrequently: true });

                          // Set canvas dimensions to match image
                          canvas.width = img.width;
                          canvas.height = img.height;

                          // Draw image on canvas
                          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                          // Store reference to the image
                          imageRef.current = img;
                        }
                      };
                      img.src = url;
                    }
                  }}
                />
              )}

              {activeTab === 'rotate' && (
                <ModernRotateTool
                  imageUrl={currentImageUrl}
                  onSave={(blob) => {
                    if (blob) {
                      // Update the current image with the rotated version
                      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
                        blobURLManager.revoke(currentImageUrl);
                      }

                      const url = blobURLManager.create(blob);
                      if (url) {
                        setCurrentImageUrl(url);
                        addToHistory(url);
                      } else {
                        console.error('Failed to create blob URL for rotated image');
                        return;
                      }

                      // Load the rotated image into the canvas
                      const img = new Image();
                      img.onload = () => {
                        if (canvasRef.current) {
                          const canvas = canvasRef.current;
                          const ctx = canvas.getContext('2d', { willReadFrequently: true });

                          // Set canvas dimensions to match image
                          canvas.width = img.width;
                          canvas.height = img.height;

                          // Draw image on canvas
                          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                          // Store reference to the image
                          imageRef.current = img;

                          // Save the changes
                          if (onSave) {
                            onSave(blob);
                          }
                        }
                      };
                      img.src = url;
                    }
                  }}
                />
              )}
            </div>

            {/* Save to Gallery Button */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700 flex justify-center">
              <motion.button
                onClick={handleSaveToGallery}
                disabled={isSaving}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving to Gallery...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Save to Gallery
                  </>
                )}
              </motion.button>

              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="absolute right-3 top-3 p-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close editor"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernImageEditor;
