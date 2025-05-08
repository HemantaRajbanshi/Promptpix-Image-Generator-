import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Helper function to create canvas context with willReadFrequently set to true
const getOptimizedContext = (canvas) => {
  return canvas.getContext('2d', { willReadFrequently: true });
};

const ModernAdjustmentTool = ({ imageUrl, canvasRef, onSave }) => {
  // State
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [exposure, setExposure] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [loading, setLoading] = useState(false);

  // Refs
  const originalImageRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Load the original image when the component mounts
  useEffect(() => {
    if (!imageUrl) return;

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

  // Apply adjustments when values change
  useEffect(() => {
    if (!canvasRef.current || !originalImageRef.current) return;

    // Debounce the adjustments to avoid too many redraws
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      applyAdjustments();
    }, 100);
  }, [brightness, contrast, saturation, exposure, highlights, shadows]);

  // Apply all adjustments to the canvas
  const applyAdjustments = (callback) => {
    if (!canvasRef.current || !originalImageRef.current) return;

    setLoading(true);

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

      // If there's a callback, call it
      if (callback && typeof callback === 'function') {
        callback();
      }

      setLoading(false);
    } catch (error) {
      console.error('Error applying adjustments:', error);
      setLoading(false);
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

  // Handle save
  const handleSave = () => {
    if (!canvasRef.current) return;

    setLoading(true);

    // Apply adjustments and then save
    applyAdjustments(() => {
      try {
        // Convert canvas to blob and save
        canvasRef.current.toBlob((blob) => {
          if (blob && onSave) {
            onSave(blob);
          }
          setLoading(false);
        }, 'image/png', 0.95);
      } catch (error) {
        console.error('Error saving adjustment changes:', error);
        setLoading(false);
      }
    });
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
    <div className="modern-adjustment-tool">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Adjustments</h3>

        <motion.button
          onClick={handleReset}
          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset All
        </motion.button>
      </div>

      <div className="space-y-4 mb-4 max-h-[250px] overflow-y-auto pr-1">
        {adjustmentControls.map((control) => (
          <div key={control.id}>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {control.label}
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {control.value > 0 ? `+${control.value}` : control.value}
              </span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => control.setValue(Math.max(control.min, control.value - 5))}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                disabled={loading || control.value <= control.min}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                type="range"
                min={control.min}
                max={control.max}
                value={control.value}
                onChange={(e) => control.setValue(parseInt(e.target.value))}
                className="flex-1 h-2 mx-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                disabled={loading}
              />
              <button
                onClick={() => control.setValue(Math.min(control.max, control.value + 5))}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                disabled={loading || control.value >= control.max}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      <div className="flex justify-end">
        <motion.button
          onClick={handleSave}
          disabled={loading || (brightness === 0 && contrast === 0 && saturation === 0 && exposure === 0 && highlights === 0 && shadows === 0)}
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
              Apply Adjustments
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ModernAdjustmentTool;
