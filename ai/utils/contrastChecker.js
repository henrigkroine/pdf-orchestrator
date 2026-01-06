/**
 * WCAG Contrast Ratio Calculator
 * Based on WCAG 2.1 guidelines
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color (e.g., "#00393F" or "00393F")
 * @returns {Object} { r, g, b } values 0-255
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

/**
 * Calculate relative luminance of a color
 * Formula from WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @param {Object} rgb - { r, g, b } values 0-255
 * @returns {number} Relative luminance 0-1
 */
function calculateLuminance({ r, g, b }) {
  // Convert to 0-1 scale
  let [rs, gs, bs] = [r / 255, g / 255, b / 255];

  // Apply gamma correction
  rs = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  gs = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  bs = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Formula from WCAG 2.1: (L1 + 0.05) / (L2 + 0.05)
 * where L1 is lighter color and L2 is darker
 * @param {string} color1 - Hex color (foreground)
 * @param {string} color2 - Hex color (background)
 * @returns {number} Contrast ratio (1-21)
 */
function calculateContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const lum1 = calculateLuminance(rgb1);
  const lum2 = calculateLuminance(rgb2);

  // Ensure L1 is lighter
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG level
 * @param {number} ratio - Contrast ratio
 * @param {string} textType - "normal" or "large" (large = 18pt+ or 14pt+ bold)
 * @returns {Object} { aa: boolean, aaa: boolean, level: string }
 */
function checkWCAGLevel(ratio, textType = "normal") {
  const thresholds = {
    normal: { aa: 4.5, aaa: 7.0 },
    large: { aa: 3.0, aaa: 4.5 }
  };

  const { aa, aaa } = thresholds[textType] || thresholds.normal;

  const passAA = ratio >= aa;
  const passAAA = ratio >= aaa;

  let level;
  if (passAAA) level = "AAA";
  else if (passAA) level = "AA";
  else level = "Fail";

  return {
    aa: passAA,
    aaa: passAAA,
    level
  };
}

/**
 * Analyze contrast ratio and provide detailed result
 * @param {string} foreground - Foreground hex color
 * @param {string} background - Background hex color
 * @param {string} textType - "normal" or "large"
 * @param {string} location - Where this color combination appears
 * @returns {Object} Complete contrast analysis
 */
function analyzeContrast(foreground, background, textType = "normal", location = "") {
  const ratio = calculateContrastRatio(foreground, background);
  const wcag = checkWCAGLevel(ratio, textType);

  return {
    foreground,
    background,
    ratio: parseFloat(ratio.toFixed(2)),
    textType,
    wcagLevel: wcag.level,
    passAA: wcag.aa,
    passAAA: wcag.aaa,
    location
  };
}

/**
 * Check if a color is within tolerance of a target color
 * @param {string} color - Hex color to check
 * @param {string} target - Target hex color
 * @param {number} tolerance - Tolerance in RGB distance (default: 10)
 * @returns {boolean} True if colors are similar within tolerance
 */
function isColorSimilar(color, target, tolerance = 10) {
  const rgb1 = hexToRgb(color);
  const rgb2 = hexToRgb(target);

  const distance = Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );

  return distance <= tolerance;
}

/**
 * Normalize hex color format (ensure # prefix, uppercase)
 * @param {string} color - Hex color
 * @returns {string} Normalized hex color
 */
function normalizeHex(color) {
  color = color.trim();
  if (!color.startsWith('#')) color = '#' + color;
  return color.toUpperCase();
}

export {
  hexToRgb,
  calculateLuminance,
  calculateContrastRatio,
  checkWCAGLevel,
  analyzeContrast,
  isColorSimilar,
  normalizeHex
};
