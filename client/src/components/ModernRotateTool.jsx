import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const ModernRotateTool = ({ imageUrl, onSave }) => {
  // State
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Refs
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Load the image when the component mounts
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Enable CORS to prevent tainted canvas
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);

      if (canvasRef.current) {
        drawImage();
      }
    };

    img.src = imageUrl;
  }, [imageUrl]);

  // Draw the image with current transformations
  const drawImage = () => {
    if (!canvasRef.current || !imageRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const img = imageRef.current;

      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set canvas dimensions based on rotation
      const rotationNormalized = ((rotation % 360) + 360) % 360; // Ensure positive value
      if (rotationNormalized % 180 === 0) {
        canvas.width = img.width;
        canvas.height = img.height;
      } else {
        canvas.width = img.height;
        canvas.height = img.width;
      }

      // Save the context state
      ctx.save();

      // Move to the center of the canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Rotate
      ctx.rotate((rotationNormalized * Math.PI) / 180);

      // Flip
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);

      // Draw the image centered
      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );

      // Restore the context state
      ctx.restore();
    } catch (error) {
      console.error('Error drawing image:', error);
    }
  };

  // Update canvas when transformations change
  useEffect(() => {
    if (imageLoaded) {
      drawImage();
    }
  }, [rotation, flipHorizontal, flipVertical, imageLoaded]);

  // Handle rotation
  const handleRotateLeft = () => {
    setRotation((prev) => {
      const newRotation = (prev - 90) % 360;
      return newRotation < 0 ? newRotation + 360 : newRotation;
    });
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Handle precise rotation
  const handlePreciseRotation = (e) => {
    setRotation(parseInt(e.target.value));
  };

  // Handle flipping
  const handleFlipHorizontal = () => {
    setFlipHorizontal((prev) => !prev);
  };

  const handleFlipVertical = () => {
    setFlipVertical((prev) => !prev);
  };

  // Apply transformations
  const handleApplyTransformations = () => {
    if (!canvasRef.current) {
      console.error('Canvas reference is not available');
      return;
    }

    setLoading(true);

    try {
      // Force a redraw to ensure the canvas is up to date
      drawImage();

      // Convert canvas to blob and save
      canvasRef.current.toBlob(
        (blob) => {
          if (blob && onSave) {
            onSave(blob);
          } else {
            console.error('Failed to create blob or onSave is not available');
          }
          setLoading(false);
        },
        'image/png',
        0.95
      );
    } catch (error) {
      console.error('Error applying transformations:', error);
      setLoading(false);
    }
  };

  return (
    <div className="modern-rotate-tool overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rotate & Flip</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <motion.button
            onClick={handleRotateLeft}
            className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!imageLoaded}
            title="Rotate 90° Left"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-xs">Rotate Left</span>
          </motion.button>

          <motion.button
            onClick={handleRotateRight}
            className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!imageLoaded}
            title="Rotate 90° Right"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="text-xs">Rotate Right</span>
          </motion.button>

          <motion.button
            onClick={handleFlipHorizontal}
            className={`p-3 rounded-md transition-colors flex flex-col items-center ${
              flipHorizontal
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!imageLoaded}
            title="Flip Horizontal"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-xs">Flip Horizontal</span>
          </motion.button>

          <motion.button
            onClick={handleFlipVertical}
            className={`p-3 rounded-md transition-colors flex flex-col items-center ${
              flipVertical
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!imageLoaded}
            title="Flip Vertical"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span className="text-xs">Flip Vertical</span>
          </motion.button>
        </div>

        {/* Quick Rotation Presets */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Quick Rotation</h4>
          <div className="grid grid-cols-4 gap-2">
            {[0, 90, 180, 270].map((angle) => (
              <motion.button
                key={angle}
                onClick={() => setRotation(angle)}
                className={`p-2 ${rotation === angle ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!imageLoaded}
              >
                <span className="text-xs">{angle}°</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Precise Rotation: {rotation}°
          </label>
          <input
            type="range"
            min="0"
            max="359"
            value={rotation}
            onChange={handlePreciseRotation}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            disabled={!imageLoaded}
          />
        </div>
      </div>

      {/* Preview Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Preview</h3>
        <div className="relative bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden border-2 border-purple-500 dark:border-purple-400 mb-4 p-2">
          <div className="text-xs text-white absolute top-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded">
            Rotation: {rotation}° | Flip: {flipHorizontal ? 'H' : ''}{flipVertical ? 'V' : ''}{!flipHorizontal && !flipVertical ? 'None' : ''}
          </div>
          <div
            className="relative"
            style={{
              width: '100%',
              height: '300px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            )}

            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-2 pb-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <motion.button
            onClick={() => {
              setRotation(0);
              setFlipHorizontal(false);
              setFlipVertical(false);
            }}
            disabled={loading || !imageLoaded}
            className="px-3 py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 flex items-center text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </motion.button>

          <motion.button
            onClick={handleApplyTransformations}
            disabled={loading || !imageLoaded}
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
                Apply Rotation
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ModernRotateTool;
