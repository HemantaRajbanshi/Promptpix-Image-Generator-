import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import blobUrlManager from '../utils/blobUrlManager';

const FilterTool = ({ imageUrl, canvasRef, onSave }) => {
  // State
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [loading, setLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Filter definitions with color-based visual previews
  const filters = [
    {
      id: 'none',
      name: 'Original',
      preview: 'No filter applied',
      colorPreview: {
        type: 'gradient',
        colors: ['#f8f9fa', '#e9ecef', '#dee2e6'],
        pattern: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)'
      }
    },
    {
      id: 'grayscale',
      name: 'Grayscale',
      preview: 'Black and white effect',
      colorPreview: {
        type: 'gradient',
        colors: ['#ffffff', '#6c757d', '#212529'],
        pattern: 'linear-gradient(135deg, #ffffff 0%, #6c757d 50%, #212529 100%)'
      }
    },
    {
      id: 'sepia',
      name: 'Sepia',
      preview: 'Vintage brown tone',
      colorPreview: {
        type: 'gradient',
        colors: ['#f4e4bc', '#d4a574', '#8b6914'],
        pattern: 'linear-gradient(135deg, #f4e4bc 0%, #d4a574 50%, #8b6914 100%)'
      }
    },
    {
      id: 'blur',
      name: 'Blur',
      preview: 'Soft focus effect',
      colorPreview: {
        type: 'radial',
        colors: ['#e3f2fd', '#90caf9', '#42a5f5'],
        pattern: 'radial-gradient(circle, #e3f2fd 0%, #90caf9 50%, #42a5f5 100%)'
      }
    },
    {
      id: 'brightness',
      name: 'Bright',
      preview: 'Increased brightness',
      colorPreview: {
        type: 'gradient',
        colors: ['#fff9c4', '#ffeb3b', '#ffd54f'],
        pattern: 'linear-gradient(135deg, #fff9c4 0%, #ffeb3b 50%, #ffd54f 100%)'
      }
    },
    {
      id: 'contrast',
      name: 'Contrast',
      preview: 'Enhanced contrast',
      colorPreview: {
        type: 'split',
        colors: ['#ffffff', '#000000'],
        pattern: 'linear-gradient(90deg, #ffffff 0%, #ffffff 50%, #000000 50%, #000000 100%)'
      }
    },
    {
      id: 'saturate',
      name: 'Vibrant',
      preview: 'Boosted saturation',
      colorPreview: {
        type: 'rainbow',
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
        pattern: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 25%, #45b7d1 50%, #96ceb4 75%, #feca57 100%)'
      }
    },
    {
      id: 'hue-rotate',
      name: 'Hue Shift',
      preview: 'Color spectrum shift',
      colorPreview: {
        type: 'spectrum',
        colors: ['#667eea', '#764ba2', '#f093fb', '#667eea'],
        pattern: 'conic-gradient(from 0deg, #667eea 0%, #764ba2 33%, #f093fb 66%, #667eea 100%)'
      }
    },
    {
      id: 'invert',
      name: 'Invert',
      preview: 'Negative colors',
      colorPreview: {
        type: 'invert',
        colors: ['#000000', '#ffffff'],
        pattern: 'radial-gradient(circle, #000000 0%, #333333 50%, #ffffff 100%)'
      }
    },
    {
      id: 'vintage',
      name: 'Vintage',
      preview: 'Retro film look',
      colorPreview: {
        type: 'vintage',
        colors: ['#d4a574', '#8b6914', '#6d4c41', '#5d4037'],
        pattern: 'linear-gradient(135deg, #d4a574 0%, #8b6914 33%, #6d4c41 66%, #5d4037 100%)'
      }
    },
    {
      id: 'cool',
      name: 'Cool',
      preview: 'Blue tone enhancement',
      colorPreview: {
        type: 'cool',
        colors: ['#e1f5fe', '#74b9ff', '#0984e3', '#2d3436'],
        pattern: 'linear-gradient(135deg, #e1f5fe 0%, #74b9ff 33%, #0984e3 66%, #2d3436 100%)'
      }
    },
    {
      id: 'warm',
      name: 'Warm',
      preview: 'Orange tone enhancement',
      colorPreview: {
        type: 'warm',
        colors: ['#fff3e0', '#fd79a8', '#e84393', '#d63031'],
        pattern: 'linear-gradient(135deg, #fff3e0 0%, #fd79a8 33%, #e84393 66%, #d63031 100%)'
      }
    }
  ];

  // CSS filter mappings
  const getFilterCSS = (filterId) => {
    switch (filterId) {
      case 'none': return 'none';
      case 'grayscale': return 'grayscale(100%)';
      case 'sepia': return 'sepia(100%)';
      case 'blur': return 'blur(2px)';
      case 'brightness': return 'brightness(1.3)';
      case 'contrast': return 'contrast(1.3)';
      case 'saturate': return 'saturate(1.5)';
      case 'hue-rotate': return 'hue-rotate(90deg)';
      case 'invert': return 'invert(100%)';
      case 'vintage': return 'sepia(50%) contrast(1.2) brightness(1.1) saturate(0.8)';
      case 'cool': return 'hue-rotate(180deg) saturate(1.2) brightness(1.1)';
      case 'warm': return 'hue-rotate(30deg) saturate(1.3) brightness(1.1)';
      default: return 'none';
    }
  };

  // Apply filter to canvas
  const applyFilterToCanvas = async (filterId) => {
    if (!canvasRef.current || !imageUrl) return null;

    setLoading(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Create a new image element
      const img = new Image();
      img.crossOrigin = 'anonymous';

      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Set canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Apply CSS filter to context
            ctx.filter = getFilterCSS(filterId);

            // Clear and draw image with filter
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            // Reset filter
            ctx.filter = 'none';

            // Convert to blob
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create blob from canvas'));
              }
            }, 'image/png', 0.9);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error applying filter:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle filter selection
  const handleFilterSelect = async (filterId) => {
    setSelectedFilter(filterId);

    if (filterId === 'none') {
      // Clean up preview URL
      if (previewUrl) {
        blobUrlManager.revoke(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    // Apply filter and create preview
    const filteredBlob = await applyFilterToCanvas(filterId);
    if (filteredBlob) {
      // Clean up previous preview
      if (previewUrl) {
        blobUrlManager.revoke(previewUrl);
      }

      // Create new preview URL
      const newPreviewUrl = blobUrlManager.create(filteredBlob);
      setPreviewUrl(newPreviewUrl);
    }
  };

  // Handle apply filter
  const handleApplyFilter = async () => {
    if (selectedFilter === 'none') return;

    setIsApplying(true);
    try {
      const filteredBlob = await applyFilterToCanvas(selectedFilter);
      if (filteredBlob && onSave) {
        onSave(filteredBlob);
      }
    } catch (error) {
      console.error('Error applying filter:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        blobUrlManager.revoke(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="filter-tool h-full flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        className="flex items-center space-x-4 p-6 pb-4 flex-shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 10h6m-6 4h6" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-white via-violet-100 to-purple-100 bg-clip-text text-transparent">
            Filters
          </h3>
          <p className="text-white/70 text-xs font-medium">Apply creative effects</p>
        </div>
      </motion.div>

      {/* Filter Grid */}
      <div className="flex-1 px-6 pb-6 overflow-hidden">
        <motion.div
          className="bg-white/10 dark:bg-black/20 backdrop-blur-xl rounded-3xl p-5 border border-white/20 dark:border-violet-500/30 shadow-2xl h-full flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(139,92,246,0.1) 50%, rgba(168,85,247,0.1) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <h4 className="text-base font-semibold bg-gradient-to-r from-white via-violet-100 to-purple-100 bg-clip-text text-transparent mb-4 flex-shrink-0">
            Choose a Filter
          </h4>
          <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 pr-2">
          {filters.map((filter, index) => (
            <motion.button
              key={filter.id}
              onClick={() => handleFilterSelect(filter.id)}
              className={`group relative p-3 rounded-xl transition-all duration-300 text-center border backdrop-blur-sm ${
                selectedFilter === filter.id
                  ? 'bg-gradient-to-br from-violet-600/80 via-purple-600/80 to-indigo-600/80 text-white shadow-2xl border-white/30 scale-105'
                  : 'bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-violet-500/20 text-white border-white/20 hover:border-white/40'
              }`}
              whileHover={{ scale: selectedFilter === filter.id ? 1.05 : 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || !imageUrl}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              style={{
                boxShadow: selectedFilter === filter.id
                  ? '0 15px 35px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 8px 25px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Color-Based Visual Preview */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  {/* Main Color Preview */}
                  <div
                    className="w-12 h-12 rounded-xl border-2 border-white/30 shadow-lg relative overflow-hidden"
                    style={{ background: filter.colorPreview.pattern }}
                  >
                    {/* Overlay for special effects */}
                    {filter.colorPreview.type === 'blur' && (
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                    )}
                    {filter.colorPreview.type === 'contrast' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    )}
                    {filter.colorPreview.type === 'spectrum' && (
                      <div className="absolute inset-2 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                    )}
                  </div>

                  {/* Color Dots for Multi-Color Filters */}
                  {filter.colorPreview.colors.length > 2 && (
                    <motion.div
                      className="absolute -bottom-0.5 -right-0.5 flex space-x-0.5"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
                    >
                      {filter.colorPreview.colors.slice(0, 2).map((color, idx) => (
                        <motion.div
                          key={idx}
                          className="w-1.5 h-1.5 rounded-full border border-white/50 shadow-sm"
                          style={{ backgroundColor: color }}
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="w-full">
                  <div className={`font-semibold text-xs text-center mb-2 ${
                    selectedFilter === filter.id
                      ? 'text-white'
                      : 'text-white/90'
                  }`}>
                    {filter.name}
                  </div>

                  {/* Color Preview Bar */}
                  <div className="h-1 rounded-full overflow-hidden bg-white/10 relative">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: filter.colorPreview.pattern }}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.6, delay: index * 0.05 + 0.3, ease: "easeOut" }}
                    />
                    {/* Shimmer effect for selected filter */}
                    {selectedFilter === filter.id && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedFilter === filter.id && (
                <motion.div
                  className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </motion.button>
          ))}
          </div>
        </motion.div>
      </div>

      {/* Apply Button - Always visible at bottom */}
      <div className="px-6 pb-4 flex-shrink-0">
        <motion.button
          onClick={handleApplyFilter}
          disabled={isApplying || !imageUrl || selectedFilter === 'none'}
          className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          whileHover={{ scale: selectedFilter !== 'none' && !isApplying ? 1.02 : 1, y: selectedFilter !== 'none' && !isApplying ? -1 : 0 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            boxShadow: selectedFilter !== 'none'
              ? '0 12px 25px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              : '0 6px 15px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {isApplying ? (
            <>
              <LoadingSpinner size="h-4 w-4" color="text-white" />
              <span className="font-semibold text-sm">Applying Filter...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold text-sm">
                {selectedFilter === 'none' ? 'Select a Filter' : `Apply ${filters.find(f => f.id === selectedFilter)?.name} Filter`}
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default FilterTool;
