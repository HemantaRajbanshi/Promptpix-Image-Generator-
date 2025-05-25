import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Helper function to create canvas context with willReadFrequently set to true
const getOptimizedContext = (canvas) => {
  return canvas.getContext('2d', { willReadFrequently: true });
};

const AdjustmentTool = ({ imageUrl, canvasRef, onSave }) => {
  // State
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [originalImageData, setOriginalImageData] = useState(null);

  // Refs
  const originalImageRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Load the original image when the component mounts
  useEffect(() => {
    if (!imageUrl || !canvasRef || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Enable CORS to prevent tainted canvas
    img.onload = () => {
      originalImageRef.current = img;

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = getOptimizedContext(canvas);

        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Store original image data for real-time preview
        setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
    };

    img.src = imageUrl;

    // Clean up
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [imageUrl, canvasRef]);

  // Real-time preview when adjustment values change
  useEffect(() => {
    if (!canvasRef || !canvasRef.current || !originalImageData) return;

    // Debounce the adjustments to avoid too many redraws
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      applyAdjustmentPreview();
    }, 50); // Faster debounce for real-time feel
  }, [brightness, contrast, saturation, exposure, highlights, shadows, originalImageData]);

  // Real-time preview function
  const applyAdjustmentPreview = () => {
    if (!canvasRef || !canvasRef.current || !originalImageData) return;

    const canvas = canvasRef.current;
    const ctx = getOptimizedContext(canvas);

    // Restore original image data
    ctx.putImageData(originalImageData, 0, 0);

    // Apply adjustments using CSS filters for real-time preview
    const filters = [];

    if (brightness !== 0) {
      filters.push(`brightness(${100 + brightness}%)`);
    }
    if (contrast !== 0) {
      filters.push(`contrast(${100 + contrast}%)`);
    }
    if (saturation !== 0) {
      filters.push(`saturate(${100 + saturation}%)`);
    }

    // Apply combined filter
    if (filters.length > 0) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');

      tempCtx.putImageData(originalImageData, 0, 0);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = filters.join(' ');
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.filter = 'none';
    }
  };

  // Apply all adjustments permanently
  const applyAdjustmentsPermanently = () => {
    if (!canvasRef || !canvasRef.current || !originalImageData) return;

    setIsApplying(true);

    try {
      const canvas = canvasRef.current;
      const ctx = getOptimizedContext(canvas);

      // Reset canvas with original image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(originalImageRef.current, 0, 0, canvas.width, canvas.height);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply adjustments
      for (let i = 0; i < data.length; i += 4) {
        // Get RGB values
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Convert to HSL
        const hsl = rgbToHsl(r, g, b);

        // Apply saturation
        hsl[1] = Math.max(0, Math.min(1, hsl[1] + (saturation / 100)));

        // Apply exposure (affects lightness)
        hsl[2] = Math.max(0, Math.min(1, hsl[2] * (1 + exposure / 100)));

        // Apply highlights (affects light areas)
        if (hsl[2] > 0.5) {
          hsl[2] = Math.max(0, Math.min(1, hsl[2] + (highlights / 200) * (hsl[2] - 0.5)));
        }

        // Apply shadows (affects dark areas)
        if (hsl[2] < 0.5) {
          hsl[2] = Math.max(0, Math.min(1, hsl[2] + (shadows / 200) * (0.5 - hsl[2])));
        }

        // Convert back to RGB
        const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];

        // Apply brightness
        if (brightness !== 0) {
          const brightnessFactor = 1 + brightness / 100;
          r = Math.min(255, Math.max(0, r * brightnessFactor));
          g = Math.min(255, Math.max(0, g * brightnessFactor));
          b = Math.min(255, Math.max(0, b * brightnessFactor));
        }

        // Apply contrast
        if (contrast !== 0) {
          const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
          g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
          b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
        }

        // Update pixel data
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      // Put the modified image data back
      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to blob and save
      canvas.toBlob((blob) => {
        if (blob && onSave) {
          onSave(blob);
          // Update original image data to the adjusted version
          setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
          // Reset all adjustments
          setBrightness(0);
          setContrast(0);
          setSaturation(0);
          setExposure(0);
          setHighlights(0);
          setShadows(0);
        }
        setIsApplying(false);
      }, 'image/png', 0.95);
    } catch (error) {
      console.error('Error applying adjustments:', error);
      setIsApplying(false);
    }
  };

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }

      h /= 6;
    }

    return [h, s, l];
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // Reset all adjustments
  const handleReset = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setExposure(0);
    setHighlights(0);
    setShadows(0);
  };

  // Handle apply adjustments
  const handleApplyAdjustments = () => {
    if (!canvasRef || !canvasRef.current || !originalImageData) return;

    // Check if any adjustments are made
    const hasAdjustments = brightness !== 0 || contrast !== 0 || saturation !== 0 ||
                          exposure !== 0 || highlights !== 0 || shadows !== 0;

    if (!hasAdjustments) return;

    applyAdjustmentsPermanently();
  };

  // Adjustment controls
  const adjustmentControls = [
    { id: 'brightness', label: 'Brightness', value: brightness, setValue: setBrightness, min: -100, max: 100 },
    { id: 'contrast', label: 'Contrast', value: contrast, setValue: setContrast, min: -100, max: 100 },
    { id: 'saturation', label: 'Saturation', value: saturation, setValue: setSaturation, min: -100, max: 100 },
    { id: 'exposure', label: 'Exposure', value: exposure, setValue: setExposure, min: -100, max: 100 },
    { id: 'highlights', label: 'Highlights', value: highlights, setValue: setHighlights, min: -100, max: 100 },
    { id: 'shadows', label: 'Shadows', value: shadows, setValue: setShadows, min: -100, max: 100 }
  ];

  return (
    <div className="adjustment-tool space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adjustments</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Fine-tune image properties</p>
          </div>
        </div>

        <motion.button
          onClick={handleReset}
          className="bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 text-violet-600 dark:text-violet-400 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-1 border border-violet-200 dark:border-violet-800"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset</span>
        </motion.button>
      </div>

      {/* Adjustment Controls */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-gray-700/30">
        <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2">
          {adjustmentControls.map((control) => (
            <motion.div
              key={control.id}
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: adjustmentControls.indexOf(control) * 0.1 }}
            >
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  {control.label}
                </label>
                <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                  control.value === 0
                    ? 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700'
                    : control.value > 0
                    ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                    : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
                }`}>
                  {control.value > 0 ? `+${control.value}` : control.value}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => control.setValue(Math.max(control.min, control.value - 5))}
                  className="w-8 h-8 bg-white/70 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={loading || control.value <= control.min}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </motion.button>

                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    value={control.value}
                    onChange={(e) => control.setValue(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 dark:bg-gray-600 rounded-full appearance-none cursor-pointer slider-violet"
                    disabled={loading}
                  />
                  <div
                    className="absolute top-0 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full pointer-events-none"
                    style={{
                      left: control.value < 0 ? `${50 + (control.value / control.min) * 50}%` : '50%',
                      width: control.value < 0 ? `${(-control.value / control.min) * 50}%` : `${(control.value / control.max) * 50}%`
                    }}
                  />
                  <div className="absolute top-1/2 left-1/2 w-1 h-5 bg-gray-400 dark:bg-gray-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <motion.button
                  onClick={() => control.setValue(Math.min(control.max, control.value + 5))}
                  className="w-8 h-8 bg-white/70 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={loading || control.value >= control.max}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview Status */}
      {(brightness !== 0 || contrast !== 0 || saturation !== 0 || exposure !== 0 || highlights !== 0 || shadows !== 0) && (
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
                Live preview of adjustments - click Apply to save changes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Apply Adjustments Button */}
      <motion.button
        onClick={handleApplyAdjustments}
        disabled={isApplying || (brightness === 0 && contrast === 0 && saturation === 0 && exposure === 0 && highlights === 0 && shadows === 0)}
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
            <span>Applying Adjustments...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Apply Adjustments</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default AdjustmentTool;
