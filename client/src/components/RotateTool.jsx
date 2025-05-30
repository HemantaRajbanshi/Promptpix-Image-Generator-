import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

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
    <div className="rotate-tool h-full flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        className="flex items-center space-x-4 p-6 pb-4 flex-shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-white via-violet-100 to-purple-100 bg-clip-text text-transparent">
            Quick Rotation
          </h3>
          <p className="text-white/70 text-xs font-medium">Rotate in preset angles</p>
        </div>
      </motion.div>

      {/* Quick Rotation Presets */}
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
            Select Rotation Angle
          </h4>
          <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto">
          {[
            {
              angle: 0,
              label: '0°',
              description: 'No rotation',
              gradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              arrowDirection: 'rotate-0'
            },
            {
              angle: 90,
              label: '90°',
              description: 'Quarter turn right',
              gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              arrowDirection: 'rotate-90'
            },
            {
              angle: 180,
              label: '180°',
              description: 'Half turn',
              gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              arrowDirection: 'rotate-180'
            },
            {
              angle: 270,
              label: '270°',
              description: 'Quarter turn left',
              gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              arrowDirection: '-rotate-90'
            }
          ].map(({ angle, label, description, gradient, arrowDirection }, index) => (
            <motion.button
              key={angle}
              onClick={() => handleRotationSelect(angle)}
              className={`group relative p-4 rounded-xl transition-all duration-300 text-center font-semibold border backdrop-blur-sm ${
                selectedRotation === angle
                  ? 'bg-gradient-to-br from-violet-600/80 via-purple-600/80 to-indigo-600/80 text-white shadow-2xl border-white/30 scale-105'
                  : 'bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-violet-500/20 text-white border-white/20 hover:border-white/40'
              }`}
              whileHover={{ scale: selectedRotation === angle ? 1.05 : 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={!imageUrl}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              style={{
                boxShadow: selectedRotation === angle
                  ? '0 12px 25px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  : '0 6px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex flex-col items-center space-y-2">
                {/* Rotation Visual Indicator */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg relative overflow-hidden"
                  style={{ background: gradient }}
                >
                  {/* Rotation Arrow */}
                  <div className={`transform transition-transform duration-300 ${arrowDirection}`}>
                    <svg className="w-4 h-4 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>

                  {/* Rotation Indicator Dots */}
                  <div className="absolute inset-1 rounded-lg border border-white/20">
                    <div className={`absolute w-0.5 h-0.5 bg-white/60 rounded-full transition-all duration-300 ${
                      angle === 0 ? 'top-0 left-1/2 transform -translate-x-1/2' :
                      angle === 90 ? 'right-0 top-1/2 transform -translate-y-1/2' :
                      angle === 180 ? 'bottom-0 left-1/2 transform -translate-x-1/2' :
                      'left-0 top-1/2 transform -translate-y-1/2'
                    }`} />
                  </div>
                </div>

                <div className="text-center">
                  <div className={`text-xs font-bold mb-1 ${
                    selectedRotation === angle ? 'text-white' : 'text-white/90'
                  }`}>
                    {label}
                  </div>
                  <div className={`text-xs ${
                    selectedRotation === angle ? 'text-white/70' : 'text-white/50'
                  }`}>
                    {description}
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedRotation === angle && (
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



      {/* Apply Rotation Button */}
      <div className="px-6 pb-4 flex-shrink-0">
        <motion.button
          onClick={handleApplyRotation}
          disabled={loading || !imageUrl || selectedRotation === 0}
          className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          whileHover={{ scale: selectedRotation !== 0 ? 1.02 : 1, y: selectedRotation !== 0 ? -1 : 0 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            boxShadow: selectedRotation !== 0
              ? '0 12px 25px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              : '0 6px 15px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {loading ? (
            <>
              <LoadingSpinner size="h-4 w-4" color="text-white" />
              <span className="font-semibold text-sm">Applying Rotation...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold text-sm">
                {selectedRotation === 0 ? 'Select Rotation Angle' : `Apply ${selectedRotation}° Rotation`}
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default RotateTool;
