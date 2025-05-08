import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ModernFilterTool = ({ imageUrl, canvasRef, onSave }) => {
  // State
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Apply filter when selected or intensity changes
  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    const applySelectedFilter = async () => {
      setLoading(true);

      try {
        // Get the canvas and context
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Load the image
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Enable CORS to prevent tainted canvas
        img.onload = () => {
          // Set canvas dimensions to match image
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the original image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Apply the selected filter
          if (selectedFilter !== 'none') {
            // Create a temporary canvas to apply CSS filters
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw the image on the temporary canvas
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

            // Get the filter CSS
            const filter = filters.find(f => f.id === selectedFilter);
            if (filter) {
              // Apply the filter using CSS filter
              const intensity = filterIntensity / 100;
              const filterDiv = document.createElement('div');

              // Adjust the filter based on intensity
              let cssFilter = '';
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
                // For complex filters, just use the original with intensity
                cssFilter = filter.cssFilter;
              }

              filterDiv.style.filter = cssFilter;

              // Create a new image with the filter applied
              const filteredImg = new Image();
              filteredImg.onload = () => {
                // Draw the filtered image on the canvas
                ctx.filter = cssFilter;
                ctx.drawImage(filteredImg, 0, 0, canvas.width, canvas.height);
                ctx.filter = 'none';

                // Create a preview URL
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                }

                canvas.toBlob((blob) => {
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);
                  }
                  setLoading(false);
                }, 'image/png', 0.95);
              };

              filteredImg.src = imageUrl;
            }
          } else {
            // No filter, just show the original image
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }
            setLoading(false);
          }
        };

        img.src = imageUrl;
      } catch (error) {
        console.error('Error applying filter:', error);
        setLoading(false);
      }
    };

    applySelectedFilter();
  }, [selectedFilter, filterIntensity, imageUrl, canvasRef]);

  // Handle save
  const handleSave = () => {
    if (!canvasRef.current) return;

    setLoading(true);

    try {
      // Convert canvas to blob and save
      canvasRef.current.toBlob((blob) => {
        if (blob && onSave) {
          onSave(blob);
        }
        setLoading(false);
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('Error saving filter changes:', error);
      setLoading(false);
    }
  };

  return (
    <div className="modern-filter-tool">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filters</h3>

      <div className="grid grid-cols-3 gap-2 mb-4 max-h-[200px] overflow-y-auto pr-1">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`p-2 rounded-md transition-all text-center ${
              selectedFilter === filter.id
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <div
              className="w-full h-12 mb-1 rounded overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center"
              style={{ filter: filter.cssFilter }}
            >
              {filter.id === 'none' ? (
                <span className="text-xs">Original</span>
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500" />
              )}
            </div>
            <span className="text-xs">{filter.name}</span>
          </motion.button>
        ))}
      </div>

      {selectedFilter !== 'none' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Intensity: {filterIntensity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={filterIntensity}
            onChange={(e) => setFilterIntensity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            disabled={loading}
          />
        </div>
      )}

      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      <div className="flex justify-end">
        <motion.button
          onClick={handleSave}
          disabled={loading || selectedFilter === 'none'}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Applying...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Apply Filter
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ModernFilterTool;
