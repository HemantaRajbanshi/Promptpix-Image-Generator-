import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const RotateTool = ({ imageUrl, canvasRef, onSave }) => {
  // State
  const [selectedRotation, setSelectedRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [originalImageData, setOriginalImageData] = useState(null);

  // Refs
  const originalImageRef = useRef(null);

  // Load the image when the component mounts
  useEffect(() => {
    if (!imageUrl || !canvasRef || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Enable CORS to prevent tainted canvas
    img.onload = () => {
      originalImageRef.current = img;

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Set canvas dimensions and draw original image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Store original image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setOriginalImageData(imageData);
      }
    };

    img.onerror = (e) => {
      console.error('RotateTool: Failed to load image', e);
    };

    img.src = imageUrl;
  }, [imageUrl, canvasRef]);

  // Apply rotation preview when selected rotation changes
  useEffect(() => {
    if (!canvasRef || !canvasRef.current || !originalImageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = originalImageRef.current;

    try {
      // Calculate canvas dimensions based on rotation
      const rotationNormalized = selectedRotation % 360;
      const isRotated90or270 = rotationNormalized === 90 || rotationNormalized === 270;

      // Set canvas dimensions based on rotation
      const newWidth = isRotated90or270 ? img.height : img.width;
      const newHeight = isRotated90or270 ? img.width : img.height;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save the context state
      ctx.save();

      // Move to the center of the canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Rotate
      ctx.rotate((rotationNormalized * Math.PI) / 180);

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
      console.error('Error drawing rotated image:', error);
    }
  }, [selectedRotation]);

  // Handle rotation selection
  const handleRotationSelect = (angle) => {
    setSelectedRotation(angle);
  };

  // Apply rotation permanently
  const handleApplyRotation = () => {
    if (!canvasRef || !canvasRef.current || selectedRotation === 0) return;

    setLoading(true);

    try {
      // Convert current canvas state to blob and save
      canvasRef.current.toBlob((blob) => {
        if (blob && onSave) {
          onSave(blob);
          // Update original image data to the rotated version
          if (canvasRef && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
          }
          // Reset rotation selection
          setSelectedRotation(0);
        }
        setLoading(false);
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('Error applying rotation:', error);
      setLoading(false);
    }
  };

  return (
    <div className="rotate-tool space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Rotation</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Rotate your image in preset angles</p>
        </div>
      </div>

      {/* Quick Rotation Presets */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-gray-700/30">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Select Rotation Angle</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { angle: 0, label: '0°', icon: '↑' },
            { angle: 90, label: '90°', icon: '→' },
            { angle: 180, label: '180°', icon: '↓' },
            { angle: 270, label: '270°', icon: '←' }
          ].map(({ angle, label, icon }) => (
            <motion.button
              key={angle}
              onClick={() => handleRotationSelect(angle)}
              className={`p-4 rounded-2xl transition-all duration-300 text-center font-medium border ${
                selectedRotation === angle
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg border-violet-300 dark:border-violet-700'
                  : 'bg-white/70 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-white/30 dark:border-gray-600/30'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!imageUrl}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl ${
                  selectedRotation === angle
                    ? 'bg-white/20 text-white'
                    : 'bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 text-violet-600 dark:text-violet-400'
                }`}>
                  {icon}
                </div>
                <span className="text-sm">{label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preview Status */}
      {selectedRotation !== 0 && (
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
                Image rotated {selectedRotation}° - click Apply to save changes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apply Rotation Button */}
      <motion.button
        onClick={handleApplyRotation}
        disabled={loading || selectedRotation === 0}
        className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Applying Rotation...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Apply Rotation</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default RotateTool;
