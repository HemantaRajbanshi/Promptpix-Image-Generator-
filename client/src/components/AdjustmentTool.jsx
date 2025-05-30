import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

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
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      originalImageRef.current = img;

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = getOptimizedContext(canvas);

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }
    };

    img.src = imageUrl;

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [imageUrl, canvasRef]);

  // Real-time preview when adjustment values change
  useEffect(() => {
    if (!canvasRef || !canvasRef.current || !originalImageData) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      applyAdjustmentPreview();
    }, 50);
  }, [brightness, contrast, saturation, exposure, highlights, shadows, originalImageData]);

  // Enhanced real-time preview function that handles ALL adjustments
  const applyAdjustmentPreview = () => {
    if (!canvasRef || !canvasRef.current || !originalImageData) return;

    const canvas = canvasRef.current;
    const ctx = getOptimizedContext(canvas);

    const hasAdjustments = brightness !== 0 || contrast !== 0 || saturation !== 0 ||
                          exposure !== 0 || highlights !== 0 || shadows !== 0;

    if (!hasAdjustments) {
      ctx.putImageData(originalImageData, 0, 0);
      return;
    }

    // Clone original image data for processing
    const imageData = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height
    );
    const data = imageData.data;

    // Apply all adjustments pixel by pixel for real-time preview
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Convert to HSL for exposure, highlights, shadows
      const hsl = rgbToHsl(r, g, b);

      // Apply saturation
      if (saturation !== 0) {
        hsl[1] = Math.max(0, Math.min(1, hsl[1] + (saturation / 100)));
      }

      // Apply exposure (affects lightness)
      if (exposure !== 0) {
        hsl[2] = Math.max(0, Math.min(1, hsl[2] * (1 + exposure / 100)));
      }

      // Apply highlights (affects light areas)
      if (highlights !== 0 && hsl[2] > 0.5) {
        hsl[2] = Math.max(0, Math.min(1, hsl[2] + (highlights / 200) * (hsl[2] - 0.5)));
      }

      // Apply shadows (affects dark areas)
      if (shadows !== 0 && hsl[2] < 0.5) {
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
      h = s = 0;
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
      r = g = b = l;
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

  // Apply all adjustments permanently
  const applyAdjustmentsPermanently = () => {
    if (!canvasRef || !canvasRef.current || !originalImageData) return;

    setIsApplying(true);

    try {
      const canvas = canvasRef.current;
      const ctx = getOptimizedContext(canvas);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(originalImageRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        const hsl = rgbToHsl(r, g, b);

        hsl[1] = Math.max(0, Math.min(1, hsl[1] + (saturation / 100)));
        hsl[2] = Math.max(0, Math.min(1, hsl[2] * (1 + exposure / 100)));

        if (hsl[2] > 0.5) {
          hsl[2] = Math.max(0, Math.min(1, hsl[2] + (highlights / 200) * (hsl[2] - 0.5)));
        }

        if (hsl[2] < 0.5) {
          hsl[2] = Math.max(0, Math.min(1, hsl[2] + (shadows / 200) * (0.5 - hsl[2])));
        }

        const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        r = rgb[0];
        g = rgb[1];
        b = rgb[2];

        if (brightness !== 0) {
          const brightnessFactor = 1 + brightness / 100;
          r = Math.min(255, Math.max(0, r * brightnessFactor));
          g = Math.min(255, Math.max(0, g * brightnessFactor));
          b = Math.min(255, Math.max(0, b * brightnessFactor));
        }

        if (contrast !== 0) {
          const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
          g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
          b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob && onSave) {
          onSave(blob);
          setOriginalImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
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
    <div className="adjustment-tool h-full flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between p-6 pb-4 flex-shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-white via-violet-100 to-purple-100 bg-clip-text text-transparent">
              Adjustments
            </h3>
            <p className="text-white/70 text-xs font-medium">Fine-tune properties</p>
          </div>
        </div>

        <motion.button
          onClick={handleReset}
          className="bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-violet-500/20 text-white border border-white/20 hover:border-white/40 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center space-x-2 backdrop-blur-xl shadow-lg"
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
          style={{
            boxShadow: '0 6px 15px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset</span>
        </motion.button>
      </motion.div>

      {/* Adjustment Controls */}
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
          <div className="space-y-5 overflow-y-auto flex-1 pr-2">
          {adjustmentControls.map((control, index) => (
            <motion.div
              key={control.id}
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-3">
                  {/* Control Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border backdrop-blur-sm transition-all duration-300 ${
                    control.value === 0
                      ? 'bg-white/10 border-white/20 text-white/60'
                      : control.value > 0
                      ? 'bg-green-500/20 border-green-400/30 text-green-300'
                      : 'bg-red-500/20 border-red-400/30 text-red-300'
                  }`}>
                    {control.id === 'brightness' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {control.id === 'contrast' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7zM7 7v10" />
                      </svg>
                    )}
                    {control.id === 'saturation' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7z" />
                      </svg>
                    )}
                    {control.id === 'exposure' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    {control.id === 'highlights' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                      </svg>
                    )}
                    {control.id === 'shadows' && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </div>

                  <label className="text-lg font-semibold text-white">
                    {control.label}
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Value Display */}
                  <span className={`text-sm font-bold px-3 py-2 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                    control.value === 0
                      ? 'text-white/70 bg-white/10 border-white/20'
                      : control.value > 0
                      ? 'text-green-300 bg-green-500/20 border-green-400/30'
                      : 'text-red-300 bg-red-500/20 border-red-400/30'
                  }`}>
                    {control.value > 0 ? `+${control.value}` : control.value}
                  </span>

                  {/* Reset Individual Control */}
                  {control.value !== 0 && (
                    <motion.button
                      onClick={() => control.setValue(0)}
                      className="w-6 h-6 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={`Reset ${control.label}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => control.setValue(Math.max(control.min, control.value - 5))}
                  className="w-10 h-10 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-violet-500/20 text-white rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 border border-white/20 backdrop-blur-sm shadow-lg"
                  whileHover={{ scale: 1.1, y: -1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={loading || control.value <= control.min}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </motion.button>

                <div className="flex-1 relative">
                  {/* Slider Track */}
                  <div className="relative h-4 bg-white/10 dark:bg-black/20 rounded-full border border-white/20 backdrop-blur-sm overflow-hidden">
                    {/* Background Gradient */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, rgba(139,92,246,0.2) 50%, rgba(168,85,247,0.2) 100%)'
                      }}
                    />

                    {/* Center Line */}
                    <div className="absolute top-1/2 left-1/2 w-0.5 h-full bg-white/30 transform -translate-x-1/2 -translate-y-1/2" />

                    {/* Value Fill */}
                    <div
                      className={`absolute top-0 h-full rounded-full transition-all duration-200 ${
                        control.value > 0
                          ? 'bg-gradient-to-r from-green-500/60 via-green-400/60 to-emerald-400/60'
                          : control.value < 0
                          ? 'bg-gradient-to-r from-red-500/60 via-red-400/60 to-rose-400/60'
                          : 'bg-transparent'
                      }`}
                      style={{
                        left: control.value < 0 ? `${50 + (control.value / control.min) * 50}%` : '50%',
                        width: control.value < 0 ? `${(-control.value / control.min) * 50}%` : `${(control.value / control.max) * 50}%`
                      }}
                    />
                  </div>

                  {/* Slider Input */}
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    value={control.value}
                    onChange={(e) => control.setValue(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-4 appearance-none cursor-pointer bg-transparent"
                    disabled={loading}
                    style={{
                      background: 'transparent'
                    }}
                  />

                  {/* Slider Thumb */}
                  <div
                    className={`absolute top-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 transition-all duration-200 pointer-events-none ${
                      control.value === 0
                        ? 'bg-white/90'
                        : control.value > 0
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                        : 'bg-gradient-to-br from-red-400 to-rose-500'
                    }`}
                    style={{
                      left: `calc(${((control.value - control.min) / (control.max - control.min)) * 100}% - 10px)`
                    }}
                  />
                </div>

                <motion.button
                  onClick={() => control.setValue(Math.min(control.max, control.value + 5))}
                  className="w-10 h-10 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-violet-500/20 text-white rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 border border-white/20 backdrop-blur-sm shadow-lg"
                  whileHover={{ scale: 1.1, y: -1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={loading || control.value >= control.max}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
          </div>
        </motion.div>
      </div>



      {/* Apply Adjustments Button */}
      <div className="px-6 pb-4 flex-shrink-0">
        <motion.button
          onClick={handleApplyAdjustments}
          disabled={isApplying || !imageUrl || (brightness === 0 && contrast === 0 && saturation === 0 && exposure === 0 && highlights === 0 && shadows === 0)}
          className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-xl font-semibold shadow-lg border border-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          whileHover={{ scale: (brightness !== 0 || contrast !== 0 || saturation !== 0 || exposure !== 0 || highlights !== 0 || shadows !== 0) ? 1.02 : 1, y: (brightness !== 0 || contrast !== 0 || saturation !== 0 || exposure !== 0 || highlights !== 0 || shadows !== 0) ? -1 : 0 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            boxShadow: (brightness !== 0 || contrast !== 0 || saturation !== 0 || exposure !== 0 || highlights !== 0 || shadows !== 0)
              ? '0 12px 25px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              : '0 6px 15px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {isApplying ? (
            <>
              <LoadingSpinner size="h-4 w-4" color="text-white" />
              <span className="font-semibold text-sm">Applying Adjustments...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold text-sm">
                {(brightness === 0 && contrast === 0 && saturation === 0 && exposure === 0 && highlights === 0 && shadows === 0) ? 'Make Adjustments' : 'Apply Adjustments'}
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default AdjustmentTool;