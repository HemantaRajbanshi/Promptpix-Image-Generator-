// downloadImage function moved to utils/download.js

/**
 * Reset canvas to original image
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {HTMLImageElement} image - The original image
 */
export const resetCanvas = (canvas, image) => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
};

/**
 * Adjust brightness of an image on canvas
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {number} value - Brightness adjustment value (-100 to 100)
 */
export const adjustBrightness = (canvas, value) => {
  if (value === 0) return; // No change needed

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert value to a multiplier (0.5 to 1.5)
  const factor = 1 + (value / 100);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] * factor));         // Red
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] * factor)); // Green
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] * factor)); // Blue
  }

  ctx.putImageData(imageData, 0, 0);
};

/**
 * Adjust contrast of an image on canvas
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {number} value - Contrast adjustment value (-100 to 100)
 */
export const adjustContrast = (canvas, value) => {
  if (value === 0) return; // No change needed

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert value to a factor (0.5 to 1.5)
  const factor = (259 * (value + 255)) / (255 * (259 - value));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));         // Red
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128)); // Green
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128)); // Blue
  }

  ctx.putImageData(imageData, 0, 0);
};

/**
 * Adjust saturation of an image on canvas
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {number} value - Saturation adjustment value (-100 to 100)
 */
export const adjustSaturation = (canvas, value) => {
  if (value === 0) return; // No change needed

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert value to a factor (0 to 2)
  const factor = 1 + (value / 100);

  for (let i = 0; i < data.length; i += 4) {
    // Convert RGB to HSL
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;

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
      }

      h /= 6;
    }

    // Adjust saturation
    s = Math.min(1, Math.max(0, s * factor));

    // Convert back to RGB
    let r1, g1, b1;

    if (s === 0) {
      r1 = g1 = b1 = l; // achromatic
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

      r1 = hue2rgb(p, q, h + 1/3);
      g1 = hue2rgb(p, q, h);
      b1 = hue2rgb(p, q, h - 1/3);
    }

    data[i] = Math.round(r1 * 255);
    data[i + 1] = Math.round(g1 * 255);
    data[i + 2] = Math.round(b1 * 255);
  }

  ctx.putImageData(imageData, 0, 0);
};

/**
 * Apply a filter to an image on canvas
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {string} filter - The filter to apply ('grayscale', 'sepia', etc.)
 */
export const applyFilter = (canvas, filter) => {
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
    alpha: false // Optimize for opaque images
  });

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const length = data.length;

  switch (filter) {
    case 'grayscale':
      for (let i = 0; i < length; i += 4) {
        // Use luminance formula for better grayscale conversion
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;     // Red
        data[i + 1] = gray; // Green
        data[i + 2] = gray; // Blue
      }
      break;

    case 'sepia':
      for (let i = 0; i < length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      }
      break;

    case 'invert':
      for (let i = 0; i < length; i += 4) {
        data[i] = 255 - data[i];         // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
      }
      break;

    case 'vintage':
      for (let i = 0; i < length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        data[i] = Math.min(255, (r * 0.9) + (g * 0.1) + (b * 0.1));
        data[i + 1] = Math.min(255, (r * 0.2) + (g * 0.7) + (b * 0.1));
        data[i + 2] = Math.min(255, (r * 0.1) + (g * 0.1) + (b * 0.9));
      }
      break;

    case 'cool':
      for (let i = 0; i < length; i += 4) {
        data[i + 2] = Math.min(255, data[i + 2] + 20); // Add blue
      }
      break;

    case 'warm':
      for (let i = 0; i < length; i += 4) {
        data[i] = Math.min(255, data[i] + 20); // Add red
        data[i + 1] = Math.min(255, data[i + 1] + 10); // Add green
      }
      break;

    case 'blur':
      // Simple box blur
      const tempData = new Uint8ClampedArray(data);
      const width = canvas.width;
      const height = canvas.height;

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;

          // Average the surrounding pixels
          for (let c = 0; c < 3; c++) {
            let sum = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const srcIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                sum += tempData[srcIdx];
              }
            }
            data[idx + c] = sum / 9;
          }
        }
      }
      break;

    case 'sharpen':
      // Simple sharpening filter
      const tempData2 = new Uint8ClampedArray(data);
      const width2 = canvas.width;
      const height2 = canvas.height;

      // Sharpening kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
      for (let y = 1; y < height2 - 1; y++) {
        for (let x = 1; x < width2 - 1; x++) {
          const idx = (y * width2 + x) * 4;

          for (let c = 0; c < 3; c++) {
            const center = tempData2[idx + c] * 5;
            const top = tempData2[((y - 1) * width2 + x) * 4 + c];
            const bottom = tempData2[((y + 1) * width2 + x) * 4 + c];
            const left = tempData2[(y * width2 + (x - 1)) * 4 + c];
            const right = tempData2[(y * width2 + (x + 1)) * 4 + c];

            data[idx + c] = Math.min(255, Math.max(0, center - top - bottom - left - right));
          }
        }
      }
      break;

    case 'emboss':
      // Emboss filter
      const tempData3 = new Uint8ClampedArray(data);
      const width3 = canvas.width;
      const height3 = canvas.height;

      // Emboss kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2]
      for (let y = 1; y < height3 - 1; y++) {
        for (let x = 1; x < width3 - 1; x++) {
          const idx = (y * width3 + x) * 4;

          for (let c = 0; c < 3; c++) {
            const val =
              -2 * tempData3[((y - 1) * width3 + (x - 1)) * 4 + c] +
              -1 * tempData3[((y - 1) * width3 + x) * 4 + c] +
              -1 * tempData3[(y * width3 + (x - 1)) * 4 + c] +
               1 * tempData3[(y * width3 + x) * 4 + c] +
               1 * tempData3[(y * width3 + (x + 1)) * 4 + c] +
               1 * tempData3[((y + 1) * width3 + x) * 4 + c] +
               2 * tempData3[((y + 1) * width3 + (x + 1)) * 4 + c];

            // Add 128 to shift to middle gray
            data[idx + c] = Math.min(255, Math.max(0, val + 128));
          }
        }
      }
      break;

    default:
      break;
  }

  ctx.putImageData(imageData, 0, 0);
};


