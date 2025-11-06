/**
 * WCAG 2.2 Level AA Compliance Checker
 *
 * Comprehensive library for validating accessibility compliance according to
 * Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards.
 *
 * Key Features:
 * - Color contrast calculation (WCAG formula)
 * - Text size validation
 * - Touch target measurement
 * - Heading hierarchy analysis
 * - Color-blind simulations (protanopia, deuteranopia, tritanopia)
 * - Text spacing validation
 *
 * @module wcag-checker
 */

/**
 * WCAG 2.2 Level AA Requirements
 */
export const WCAG_REQUIREMENTS = {
  contrast: {
    normalText: 4.5,      // 1.4.3 Contrast (Minimum) - Normal text
    largeText: 3.0,       // 1.4.3 Contrast (Minimum) - Large text (18pt+ or 14pt+ bold)
    uiComponents: 3.0     // 1.4.11 Non-text Contrast - UI components and graphics
  },
  textSize: {
    minimumBody: 11,      // Minimum body text size (points)
    minimumHeading: 14,   // Minimum heading size (points)
    minimumCaption: 9     // Minimum caption size (points)
  },
  touchTarget: {
    minimum: 44,          // 2.5.5 Target Size (Level AAA, but best practice for AA)
    minimumAA: 24,        // 2.5.8 Target Size (Minimum) - Level AA requirement
    spacing: 8            // Minimum spacing between targets
  },
  textSpacing: {
    lineHeight: 1.5,      // 1.4.12 Text Spacing - Line height minimum
    paragraphSpacing: 2.0, // 1.4.12 Text Spacing - Paragraph spacing minimum (× font size)
    letterSpacing: 0.12,  // 1.4.12 Text Spacing - Letter spacing minimum (× font size)
    wordSpacing: 0.16     // 1.4.12 Text Spacing - Word spacing minimum (× font size)
  }
};

/**
 * Calculate relative luminance of an RGB color
 * Used in WCAG contrast ratio formula
 *
 * @param {number[]} rgb - RGB color array [r, g, b] (0-255)
 * @returns {number} Relative luminance (0-1)
 *
 * @see https://www.w3.org/TR/WCAG22/#dfn-relative-luminance
 */
export function getRelativeLuminance(rgb) {
  // Normalize RGB values to 0-1 range
  const [r, g, b] = rgb.map(val => {
    const normalized = val / 255;

    // Apply sRGB gamma correction
    // If value <= 0.03928, divide by 12.92
    // Otherwise, use power function
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  // Calculate relative luminance using WCAG formula
  // Weighted sum based on human perception of colors
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 *
 * WCAG Formula: (L1 + 0.05) / (L2 + 0.05)
 * where L1 is the lighter color's luminance and L2 is the darker
 *
 * @param {number[]} foreground - Foreground RGB color [r, g, b]
 * @param {number[]} background - Background RGB color [r, g, b]
 * @returns {number} Contrast ratio (1:1 to 21:1)
 *
 * @see https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */
export function calculateContrast(foreground, background) {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);

  // Lighter color should be in numerator
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  // WCAG contrast formula
  const contrast = (lighter + 0.05) / (darker + 0.05);

  return contrast;
}

/**
 * Check if contrast ratio meets WCAG requirements
 *
 * @param {number} contrast - Contrast ratio
 * @param {number} fontSize - Font size in points
 * @param {boolean} isBold - Whether text is bold
 * @param {string} level - WCAG level ('AA' or 'AAA')
 * @returns {Object} Compliance result
 */
export function checkContrastCompliance(contrast, fontSize = 11, isBold = false, level = 'AA') {
  // Determine if text is "large" per WCAG definition
  // Large text: 18pt+ or 14pt+ bold
  const isLargeText = fontSize >= 18 || (isBold && fontSize >= 14);

  // Get required contrast based on text size and level
  let required;
  if (level === 'AAA') {
    required = isLargeText ? 4.5 : 7.0;
  } else {
    required = isLargeText ? WCAG_REQUIREMENTS.contrast.largeText : WCAG_REQUIREMENTS.contrast.normalText;
  }

  const passes = contrast >= required;

  return {
    passes,
    contrast: parseFloat(contrast.toFixed(2)),
    required: parseFloat(required.toFixed(2)),
    isLargeText,
    level,
    ratio: `${contrast.toFixed(2)}:1`,
    requiredRatio: `${required.toFixed(1)}:1`,
    difference: parseFloat((contrast - required).toFixed(2))
  };
}

/**
 * Validate text size meets WCAG requirements
 *
 * @param {number} fontSize - Font size in points
 * @param {string} textType - Type of text ('body', 'heading', 'caption')
 * @returns {Object} Validation result
 */
export function validateTextSize(fontSize, textType = 'body') {
  let minimum;
  let recommended;

  switch (textType) {
    case 'heading':
      minimum = WCAG_REQUIREMENTS.textSize.minimumHeading;
      recommended = 18;
      break;
    case 'caption':
      minimum = WCAG_REQUIREMENTS.textSize.minimumCaption;
      recommended = 10;
      break;
    case 'body':
    default:
      minimum = WCAG_REQUIREMENTS.textSize.minimumBody;
      recommended = 12;
      break;
  }

  const passes = fontSize >= minimum;
  const meetsRecommended = fontSize >= recommended;

  return {
    passes,
    fontSize,
    minimum,
    recommended,
    meetsRecommended,
    difference: parseFloat((fontSize - minimum).toFixed(1)),
    message: passes
      ? `${fontSize}pt meets ${minimum}pt minimum`
      : `${fontSize}pt below ${minimum}pt minimum (needs +${(minimum - fontSize).toFixed(1)}pt)`
  };
}

/**
 * Validate touch target size meets WCAG requirements
 *
 * @param {number} width - Target width in pixels
 * @param {number} height - Target height in pixels
 * @param {string} level - Compliance level ('AA' or 'AAA')
 * @returns {Object} Validation result
 */
export function validateTouchTarget(width, height, level = 'AA') {
  const minimum = level === 'AAA'
    ? WCAG_REQUIREMENTS.touchTarget.minimum
    : WCAG_REQUIREMENTS.touchTarget.minimumAA;

  const meetsWidth = width >= minimum;
  const meetsHeight = height >= minimum;
  const passes = meetsWidth && meetsHeight;

  return {
    passes,
    width,
    height,
    minimum,
    level,
    meetsWidth,
    meetsHeight,
    area: width * height,
    minimumArea: minimum * minimum,
    message: passes
      ? `${width}×${height}px meets ${minimum}×${minimum}px minimum`
      : `${width}×${height}px below ${minimum}×${minimum}px minimum`
  };
}

/**
 * Validate text spacing meets WCAG 1.4.12 requirements
 *
 * @param {Object} spacing - Spacing measurements
 * @param {number} spacing.lineHeight - Line height (× font size)
 * @param {number} spacing.paragraphSpacing - Paragraph spacing (× font size)
 * @param {number} spacing.letterSpacing - Letter spacing (× font size)
 * @param {number} spacing.wordSpacing - Word spacing (× font size)
 * @returns {Object} Validation result
 */
export function validateTextSpacing(spacing) {
  const results = {
    passes: true,
    checks: {},
    violations: []
  };

  // Line height check
  const lineHeightPasses = spacing.lineHeight >= WCAG_REQUIREMENTS.textSpacing.lineHeight;
  results.checks.lineHeight = {
    passes: lineHeightPasses,
    value: spacing.lineHeight,
    required: WCAG_REQUIREMENTS.textSpacing.lineHeight,
    message: lineHeightPasses
      ? `Line height ${spacing.lineHeight}x meets 1.5x minimum`
      : `Line height ${spacing.lineHeight}x below 1.5x minimum`
  };
  if (!lineHeightPasses) {
    results.passes = false;
    results.violations.push('Line height too small');
  }

  // Paragraph spacing check
  const paragraphPasses = spacing.paragraphSpacing >= WCAG_REQUIREMENTS.textSpacing.paragraphSpacing;
  results.checks.paragraphSpacing = {
    passes: paragraphPasses,
    value: spacing.paragraphSpacing,
    required: WCAG_REQUIREMENTS.textSpacing.paragraphSpacing,
    message: paragraphPasses
      ? `Paragraph spacing ${spacing.paragraphSpacing}x meets 2.0x minimum`
      : `Paragraph spacing ${spacing.paragraphSpacing}x below 2.0x minimum`
  };
  if (!paragraphPasses) {
    results.passes = false;
    results.violations.push('Paragraph spacing too small');
  }

  // Letter spacing check (if provided)
  if (spacing.letterSpacing !== undefined) {
    const letterPasses = spacing.letterSpacing >= WCAG_REQUIREMENTS.textSpacing.letterSpacing;
    results.checks.letterSpacing = {
      passes: letterPasses,
      value: spacing.letterSpacing,
      required: WCAG_REQUIREMENTS.textSpacing.letterSpacing,
      message: letterPasses
        ? `Letter spacing ${spacing.letterSpacing}x meets 0.12x minimum`
        : `Letter spacing ${spacing.letterSpacing}x below 0.12x minimum`
    };
    if (!letterPasses) {
      results.passes = false;
      results.violations.push('Letter spacing too small');
    }
  }

  // Word spacing check (if provided)
  if (spacing.wordSpacing !== undefined) {
    const wordPasses = spacing.wordSpacing >= WCAG_REQUIREMENTS.textSpacing.wordSpacing;
    results.checks.wordSpacing = {
      passes: wordPasses,
      value: spacing.wordSpacing,
      required: WCAG_REQUIREMENTS.textSpacing.wordSpacing,
      message: wordPasses
        ? `Word spacing ${spacing.wordSpacing}x meets 0.16x minimum`
        : `Word spacing ${spacing.wordSpacing}x below 0.16x minimum`
    };
    if (!wordPasses) {
      results.passes = false;
      results.violations.push('Word spacing too small');
    }
  }

  return results;
}

/**
 * Validate heading hierarchy
 *
 * Checks for proper nesting (h1 → h2 → h3, no skipping levels)
 *
 * @param {Array} headings - Array of heading objects [{level, text, index}]
 * @returns {Object} Validation result
 */
export function validateHeadingHierarchy(headings) {
  const results = {
    passes: true,
    issues: [],
    structure: []
  };

  if (headings.length === 0) {
    results.issues.push('No headings found in document');
    results.passes = false;
    return results;
  }

  // Check for h1
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count === 0) {
    results.issues.push('Missing h1 heading (document should have exactly one h1)');
    results.passes = false;
  } else if (h1Count > 1) {
    results.issues.push(`Multiple h1 headings found (${h1Count}). Document should have exactly one h1.`);
    results.passes = false;
  }

  // Check for proper nesting (no skipped levels)
  for (let i = 0; i < headings.length - 1; i++) {
    const current = headings[i];
    const next = headings[i + 1];

    results.structure.push({
      level: current.level,
      text: current.text,
      index: current.index
    });

    // If next level jumps more than 1, that's a violation
    if (next.level > current.level + 1) {
      results.issues.push(
        `Skipped heading level: h${current.level} → h${next.level} ` +
        `(should be h${current.level + 1}). ` +
        `After "${current.text}"`
      );
      results.passes = false;
    }
  }

  // Add last heading to structure
  if (headings.length > 0) {
    const last = headings[headings.length - 1];
    results.structure.push({
      level: last.level,
      text: last.text,
      index: last.index
    });
  }

  return results;
}

/**
 * Simulate color blindness for accessibility testing
 *
 * Implements color transformation matrices for common types of color blindness
 *
 * @param {number[]} rgb - Original RGB color [r, g, b]
 * @param {string} type - Type of color blindness ('protanopia', 'deuteranopia', 'tritanopia')
 * @returns {number[]} Transformed RGB color
 *
 * @see https://www.color-blindness.com/color-name-hue/
 */
export function simulateColorBlindness(rgb, type = 'protanopia') {
  const [r, g, b] = rgb.map(v => v / 255); // Normalize to 0-1

  let transformed;

  switch (type) {
    case 'protanopia': // Red-blind
      // Protanopia transformation matrix
      transformed = [
        0.56667 * r + 0.43333 * g + 0.00000 * b,
        0.55833 * r + 0.44167 * g + 0.00000 * b,
        0.00000 * r + 0.24167 * g + 0.75833 * b
      ];
      break;

    case 'deuteranopia': // Green-blind
      // Deuteranopia transformation matrix
      transformed = [
        0.62500 * r + 0.37500 * g + 0.00000 * b,
        0.70000 * r + 0.30000 * g + 0.00000 * b,
        0.00000 * r + 0.30000 * g + 0.70000 * b
      ];
      break;

    case 'tritanopia': // Blue-blind
      // Tritanopia transformation matrix
      transformed = [
        0.95000 * r + 0.05000 * g + 0.00000 * b,
        0.00000 * r + 0.43333 * g + 0.56667 * b,
        0.00000 * r + 0.47500 * g + 0.52500 * b
      ];
      break;

    default:
      return rgb; // Return original if unknown type
  }

  // Convert back to 0-255 range and clamp
  return transformed.map(v => Math.round(Math.max(0, Math.min(255, v * 255))));
}

/**
 * Check if two colors are distinguishable for color-blind users
 *
 * @param {number[]} color1 - First RGB color
 * @param {number[]} color2 - Second RGB color
 * @param {string} type - Type of color blindness to test
 * @returns {Object} Distinguishability result
 */
export function checkColorBlindDistinguishability(color1, color2, type = 'protanopia') {
  // Simulate how colors appear to color-blind users
  const simulated1 = simulateColorBlindness(color1, type);
  const simulated2 = simulateColorBlindness(color2, type);

  // Calculate contrast between simulated colors
  const contrast = calculateContrast(simulated1, simulated2);

  // Colors should have at least 3:1 contrast to be distinguishable
  const isDistinguishable = contrast >= 3.0;

  return {
    isDistinguishable,
    contrast: parseFloat(contrast.toFixed(2)),
    type,
    originalColors: {
      color1,
      color2
    },
    simulatedColors: {
      color1: simulated1,
      color2: simulated2
    },
    message: isDistinguishable
      ? `Colors distinguishable for ${type} (${contrast.toFixed(2)}:1 contrast)`
      : `Colors NOT distinguishable for ${type} (${contrast.toFixed(2)}:1 contrast, needs 3.0:1)`
  };
}

/**
 * Convert hex color to RGB array
 *
 * @param {string} hex - Hex color string (#RRGGBB or RRGGBB)
 * @returns {number[]} RGB array [r, g, b]
 */
export function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return [r, g, b];
}

/**
 * Convert RGB array to hex color
 *
 * @param {number[]} rgb - RGB array [r, g, b]
 * @returns {string} Hex color string (#RRGGBB)
 */
export function rgbToHex(rgb) {
  const [r, g, b] = rgb;
  return '#' + [r, g, b]
    .map(v => Math.round(v).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Get WCAG success criterion details
 *
 * @param {string} criterion - WCAG criterion number (e.g., '1.4.3')
 * @returns {Object} Criterion details
 */
export function getWCAGCriterion(criterion) {
  const criteria = {
    '1.4.3': {
      number: '1.4.3',
      name: 'Contrast (Minimum)',
      level: 'AA',
      description: 'Text and images of text have a contrast ratio of at least 4.5:1',
      url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'
    },
    '1.4.4': {
      number: '1.4.4',
      name: 'Resize Text',
      level: 'AA',
      description: 'Text can be resized up to 200% without loss of content or functionality',
      url: 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html'
    },
    '1.4.10': {
      number: '1.4.10',
      name: 'Reflow',
      level: 'AA',
      description: 'Content reflows to a single column at 320px width',
      url: 'https://www.w3.org/WAI/WCAG22/Understanding/reflow.html'
    },
    '1.4.11': {
      number: '1.4.11',
      name: 'Non-text Contrast',
      level: 'AA',
      description: 'UI components and graphical objects have a contrast ratio of at least 3:1',
      url: 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html'
    },
    '1.4.12': {
      number: '1.4.12',
      name: 'Text Spacing',
      level: 'AA',
      description: 'No loss of content when text spacing is adjusted',
      url: 'https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html'
    },
    '2.4.6': {
      number: '2.4.6',
      name: 'Headings and Labels',
      level: 'AA',
      description: 'Headings and labels describe topic or purpose',
      url: 'https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html'
    },
    '2.5.5': {
      number: '2.5.5',
      name: 'Target Size',
      level: 'AAA',
      description: 'Touch targets are at least 44×44 CSS pixels',
      url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size.html'
    },
    '2.5.8': {
      number: '2.5.8',
      name: 'Target Size (Minimum)',
      level: 'AA',
      description: 'Touch targets are at least 24×24 CSS pixels',
      url: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html'
    }
  };

  return criteria[criterion] || {
    number: criterion,
    name: 'Unknown Criterion',
    level: 'Unknown',
    description: 'Criterion details not found',
    url: 'https://www.w3.org/WAI/WCAG22/'
  };
}

export default {
  WCAG_REQUIREMENTS,
  getRelativeLuminance,
  calculateContrast,
  checkContrastCompliance,
  validateTextSize,
  validateTouchTarget,
  validateTextSpacing,
  validateHeadingHierarchy,
  simulateColorBlindness,
  checkColorBlindDistinguishability,
  hexToRgb,
  rgbToHex,
  getWCAGCriterion
};
