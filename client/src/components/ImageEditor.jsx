import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterTool from './FilterTool';
import AdjustmentTool from './AdjustmentTool';
import RotateTool from './RotateTool';
import { addGalleryItem } from '../services/local-storage/gallery';
import blobUrlManager from '../utils/blobUrlManager';
import { downloadImage } from '../utils/download';
import { useAuth } from '../context/AuthContext';

const ImageEditor = ({ imageUrl, onClose, onSave }) => {
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState('filters');
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Refs
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const originalImageUrl = useRef(null);
  const savedMessageTimeoutRef = useRef(null);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Add to history
  const addToHistory = (url) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevUrl = history[prevIndex];
      setCurrentImageUrl(prevUrl);
      setHistoryIndex(prevIndex);

      // Load the previous image into canvas
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          imageRef.current = img;
        }
      };
      img.src = prevUrl;
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextUrl = history[nextIndex];
      setCurrentImageUrl(nextUrl);
      setHistoryIndex(nextIndex);

      // Load the next image into canvas
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          imageRef.current = img;
        }
      };
      img.src = nextUrl;
    }
  };

  // Initialize the editor
  useEffect(() => {
    if (!imageUrl) {
      setError('No image provided');
      setIsInitializing(false);
      return;
    }

    const initializeEditor = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        // Store original image URL
        originalImageUrl.current = imageUrl;

        // Set current image URL
        setCurrentImageUrl(imageUrl);

        // Initialize history with original image
        setHistory([imageUrl]);
        setHistoryIndex(0);

        // Load image into canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';

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

            setIsImageLoaded(true);
            setIsInitializing(false);
          }
        };

        img.onerror = () => {
          setError('Failed to load image');
          setIsInitializing(false);
        };

        img.src = imageUrl;
      } catch (err) {
        setError('Failed to initialize image editor');
        setIsInitializing(false);
      }
    };

    initializeEditor();

    // Cleanup function
    return () => {
      // Clear any pending timeouts
      if (savedMessageTimeoutRef.current) {
        clearTimeout(savedMessageTimeoutRef.current);
      }

      // Clean up blob URLs from history (except original)
      history.forEach(url => {
        if (url !== originalImageUrl.current && url.startsWith('blob:')) {
          blobUrlManager.revoke(url);
        }
      });
    };
  }, [imageUrl]);

  // Handle save to gallery
  const handleSaveToGallery = async () => {
    if (!canvasRef.current || isSaving) return;

    setIsSaving(true);

    try {
      // Get the latest changes
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          try {
            // Create a temporary URL for preview
            const url = blobUrlManager.create(blob);
            if (!url) {
              console.error('Failed to create blob URL for gallery image');
              setIsSaving(false);
              return;
            }

            // Save to gallery with user ID
            const result = await addGalleryItem({
              imageUrl: url,
              prompt: 'Edited image',
              type: 'image-editor',
              userId: user?.id || user?._id, // Associate with current user
              blob: blob
            });

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('galleryUpdated'));

            if (process.env.NODE_ENV !== 'production') {
              console.log('Saved to gallery:', result);
            }

            // Show success message
            setShowSavedMessage(true);
            savedMessageTimeoutRef.current = setTimeout(() => {
              setShowSavedMessage(false);
            }, 3000);

            // Call onSave callback if provided
            if (onSave) {
              onSave(blob);
            }
          } catch (error) {
            console.error('Error saving to gallery:', error);
            alert('Failed to save image to gallery. Please try again.');
          } finally {
            setIsSaving(false);
          }
        } else {
          console.error('Failed to create blob from canvas');
          setIsSaving(false);
        }
      }, 'image/png', 0.9);
    } catch (error) {
      console.error('Error in handleSaveToGallery:', error);
      setIsSaving(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        downloadImage(blob, `edited-image-${Date.now()}.png`);
      }
    }, 'image/png', 0.9);
  };

  // Handle reset
  const handleReset = () => {
    if (!originalImageUrl.current || !canvasRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      imageRef.current = img;
      setCurrentImageUrl(originalImageUrl.current);

      // Reset history
      setHistory([originalImageUrl.current]);
      setHistoryIndex(0);
    };
    img.src = originalImageUrl.current;
  };

  // Tab configuration
  const tabs = [
    { id: 'filters', label: 'Filters', icon: '🎨' },
    { id: 'adjust', label: 'Adjust', icon: '⚙️' },
    { id: 'rotate', label: 'Rotate', icon: '🔄' }
  ];

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/30">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Loading Image Editor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/30 max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Loading Image</h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors"
            >
              Close Editor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Success Message */}
      <AnimatePresence>
        {showSavedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-60 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg font-medium"
          >
            ✅ Image saved to gallery successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Editor Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full h-full max-w-7xl max-h-[95vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 backdrop-blur-xl p-6 border-b border-white/20 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Image Editor</h2>
                <p className="text-gray-600 dark:text-gray-400">Edit and enhance your images with professional tools</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Undo/Redo buttons */}
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-3 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Undo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-3 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Redo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                  </svg>
                </motion.button>
              </div>

              {/* Download button */}
              <motion.button
                onClick={handleDownload}
                className="p-3 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Download"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </motion.button>

              {/* Reset button */}
              <motion.button
                onClick={handleReset}
                className="p-3 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reset to Original"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>

              {/* Close button */}
              <motion.button
                onClick={onClose}
                className="p-3 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 min-h-0">
          {/* Canvas area */}
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="relative max-w-full max-h-full">
              {/* Canvas Container */}
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-white/30 dark:border-gray-700/30 shadow-2xl p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-3xl" />
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[70vh] rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tools panel */}
          <div className="w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/30 flex flex-col">
            {/* Tool tabs */}
            <div className="flex-shrink-0 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 backdrop-blur-xl p-4 border-b border-white/20 dark:border-gray-700/30">
              <div className="grid grid-cols-3 gap-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`p-3 rounded-xl font-medium transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-base">{tab.icon}</span>
                      <span className="text-xs">{tab.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Active tool */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">

              {activeTab === 'filters' && (
                <FilterTool
                  imageUrl={currentImageUrl}
                  canvasRef={canvasRef}
                  onSave={(blob) => {
                    if (blob) {
                      // Update the current image with the filtered version
                      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
                        blobUrlManager.revoke(currentImageUrl);
                      }

                      const url = blobUrlManager.create(blob);
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
                <AdjustmentTool
                  imageUrl={currentImageUrl}
                  canvasRef={canvasRef}
                  onSave={(blob) => {
                    if (blob) {
                      // Update the current image with the adjusted version
                      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
                        blobUrlManager.revoke(currentImageUrl);
                      }

                      const url = blobUrlManager.create(blob);
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
                <RotateTool
                  imageUrl={currentImageUrl}
                  canvasRef={canvasRef}
                  onSave={(blob) => {
                    if (blob) {
                      // Update the current image with the rotated version
                      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
                        blobUrlManager.revoke(currentImageUrl);
                      }

                      const url = blobUrlManager.create(blob);
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

            {/* Modern Save to Gallery Button */}
            <div className="flex-shrink-0 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 backdrop-blur-xl p-4 border-t border-white/20 dark:border-gray-700/30">
              <motion.button
                onClick={handleSaveToGallery}
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving to Gallery...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Save to Gallery</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageEditor;
