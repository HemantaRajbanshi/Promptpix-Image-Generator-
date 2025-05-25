import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import blobUrlManager from '../utils/blobUrlManager';

const FilterTool = ({ imageUrl, canvasRef, onSave }) => {
  // State
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [originalImageData, setOriginalImageData] = useState(null);

  // Filter options
  const filters = [
    { id: 'none', name: 'Original', cssFilter: '' },
    { id: 'grayscale', name: 'Grayscale', cssFilter: 'grayscale(100%)' },
    { id: 'sepia', name: 'Sepia', cssFilter: 'sepia(100%)' },
    { id: 'invert', name: 'Invert', cssFilter: 'invert(100%)' },
    { id: 'blur', name: 'Blur', cssFilter: 'blur(5px)' },
    { id: 'brightness', name: 'Bright', cssFilter: 'brightness(150%)' },
    { id: 'contrast', name: 'Contrast', cssFilter: 'contrast(150%)' },
    { id: 'hue-rotate', name: 'Hue', cssFilter: 'hue-rotate(90deg)' },
    { id: 'saturate', name: 'Saturate', cssFilter: 'saturate(200%)' },
    { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(50%) contrast(120%) brightness(90%)' },
    { id: 'cool', name: 'Cool', cssFilter: 'hue-rotate(180deg) saturate(120%)' },
    { id: 'warm', name: 'Warm', cssFilter: 'sepia(30%) saturate(140%) hue-rotate(20deg)' },
    { id: 'dramatic', name: 'Dramatic', cssFilter: 'contrast(150%) brightness(90%) grayscale(30%)' },
    { id: 'noir', name: 'Noir', cssFilter: 'grayscale(100%) contrast(150%) brightness(80%)' },
    { id: 'clarendon', name: 'Clarendon', cssFilter: 'contrast(120%) saturate(125%)' }
  ];

  // Store original image data when component mounts
  useEffect(() => {
    if (!imageUrl || !canvasRef || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Set canvas dimensions and draw original image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Store original image data for preview restoration
        setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
    };
    img.src = imageUrl;
  }, [imageUrl, canvasRef]);

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        blobUrlManager.revoke(previewUrl);
      }
    };
  }, [previewUrl]);

  // Real-time preview when filter or intensity changes
  useEffect(() => {
    if (!canvasRef || !canvasRef.current || !originalImageData) return;

    const applyFilterPreview = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // Restore original image
      ctx.putImageData(originalImageData, 0, 0);

      // Apply filter preview if not 'none'
      if (selectedFilter !== 'none') {
        const filter = filters.find(f => f.id === selectedFilter);
        if (filter) {
          const intensity = filterIntensity / 100;
          let cssFilter = '';

          // Adjust the filter based on intensity
          if (filter.cssFilter.includes('grayscale')) {
            cssFilter = `grayscale(${intensity * 100}%)`;
          } else if (filter.cssFilter.includes('sepia')) {
            cssFilter = `sepia(${intensity * 100}%)`;
          } else if (filter.cssFilter.includes('invert')) {
            cssFilter = `invert(${intensity * 100}%)`;
          } else if (filter.cssFilter.includes('blur')) {
            cssFilter = `blur(${intensity * 5}px)`;
          } else if (filter.cssFilter.includes('brightness')) {
            cssFilter = `brightness(${100 + intensity * 50}%)`;
          } else if (filter.cssFilter.includes('contrast')) {
            cssFilter = `contrast(${100 + intensity * 50}%)`;
          } else if (filter.cssFilter.includes('hue-rotate')) {
            cssFilter = `hue-rotate(${intensity * 360}deg)`;
          } else if (filter.cssFilter.includes('saturate')) {
            cssFilter = `saturate(${100 + intensity * 100}%)`;
          } else {
            // For complex filters, apply with intensity scaling
            cssFilter = filter.cssFilter;
          }

          // Apply filter to canvas
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');

          tempCtx.putImageData(originalImageData, 0, 0);

          // Clear main canvas and apply filter
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.filter = cssFilter;
          ctx.drawImage(tempCanvas, 0, 0);
          ctx.filter = 'none';
        }
      }
    };

    applyFilterPreview();
  }, [selectedFilter, filterIntensity, originalImageData]);

  // Handle apply filter (permanently apply the current preview)
  const handleApplyFilter = () => {
    if (!canvasRef || !canvasRef.current || selectedFilter === 'none') return;

    setIsApplying(true);

    try {
      // Convert current canvas state to blob and save
      canvasRef.current.toBlob((blob) => {
        if (blob && onSave) {
          onSave(blob);
          // Update original image data to the filtered version
          if (canvasRef && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
          }
          // Reset filter selection
          setSelectedFilter('none');
          setFilterIntensity(100);
        }
        setIsApplying(false);
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('Error applying filter:', error);
      setIsApplying(false);
    }
  };

  return (
    <div className="filter-tool space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2m-6 0h8m-8 0a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Apply creative effects</p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-gray-700/30">
        <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
          {filters.map((filter) => (
            <motion.button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`group relative p-3 rounded-2xl transition-all duration-300 ${
                selectedFilter === filter.id
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg ring-2 ring-violet-300 dark:ring-violet-700'
                  : 'bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {/* Filter Preview */}
              <div
                className="w-full h-16 mb-2 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center relative"
                style={{ filter: filter.cssFilter }}
              >
                {filter.id === 'none' ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Original</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-400 via-purple-500 to-pink-500" />
                )}

                {/* Selection Indicator */}
                {selectedFilter === filter.id && (
                  <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              <span className="text-xs font-medium">{filter.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Intensity Control */}
      {selectedFilter !== 'none' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-gray-700/30"
        >
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Filter Intensity
            </label>
            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-2 py-1 rounded-lg">
              {filterIntensity}%
            </span>
          </div>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={filterIntensity}
              onChange={(e) => setFilterIntensity(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer slider-violet"
              disabled={loading}
            />
            <div
              className="absolute top-0 left-0 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full pointer-events-none"
              style={{ width: `${filterIntensity}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2 text-violet-600 dark:text-violet-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">Applying filter...</span>
          </div>
        </div>
      )}

      {/* Preview Status */}
      {selectedFilter !== 'none' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 backdrop-blur-sm rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-blue-800 dark:text-blue-200 font-medium text-sm">Preview Mode</p>
              <p className="text-blue-600 dark:text-blue-300 text-xs">
                {filters.find(f => f.id === selectedFilter)?.name} filter at {filterIntensity}% intensity
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apply Filter Button */}
      <motion.button
        onClick={handleApplyFilter}
        disabled={isApplying || selectedFilter === 'none'}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isApplying ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Applying Filter...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Apply Filter</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default FilterTool;
