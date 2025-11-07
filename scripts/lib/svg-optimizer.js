/**
 * SVG Optimizer
 *
 * SVG cleanup, optimization, and manipulation for TEEI brand graphics
 *
 * Features:
 * - SVG minification and optimization
 * - Path simplification
 * - Curve optimization
 * - File size reduction
 * - Color palette normalization
 * - Accessibility improvements
 *
 * @module svg-optimizer
 */

const { optimize } = require('svgo');
const fs = require('fs').promises;
const path = require('path');

class SVGOptimizer {
  constructor(config = {}) {
    this.config = {
      precision: config.precision || 2,
      removeComments: config.removeComments !== false,
      removeMetadata: config.removeMetadata !== false,
      removeUselessDefs: config.removeUselessDefs !== false,
      cleanupIDs: config.cleanupIDs !== false,
      convertColors: config.convertColors !== false,
      ...config
    };

    // TEEI brand colors for normalization
    this.teeiColors = {
      '#00393F': 'nordshore',
      '#C9E4EC': 'sky',
      '#FFF1E2': 'sand',
      '#EFE1DC': 'beige',
      '#65873B': 'moss',
      '#BA8F5A': 'gold',
      '#913B2F': 'clay'
    };
  }

  /**
   * Optimize SVG file
   * @param {string} inputPath - Path to input SVG
   * @param {string} outputPath - Path to output SVG (optional)
   * @param {Object} options - Optimization options
   * @returns {Promise<Object>} Optimization results
   */
  async optimizeSVG(inputPath, outputPath = null, options = {}) {
    console.log(`\n🔧 Optimizing SVG: ${path.basename(inputPath)}`);

    try {
      // Read SVG file
      const svgString = await fs.readFile(inputPath, 'utf8');
      const originalSize = Buffer.byteLength(svgString, 'utf8');

      console.log(`📏 Original size: ${this.formatBytes(originalSize)}`);

      // Optimize
      const result = await this.optimize(svgString, options);

      // Save optimized version
      if (!outputPath) {
        outputPath = inputPath.replace('.svg', '-optimized.svg');
      }

      await fs.writeFile(outputPath, result.data, 'utf8');

      const optimizedSize = Buffer.byteLength(result.data, 'utf8');
      const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

      console.log(`✅ Optimized size: ${this.formatBytes(optimizedSize)} (${savings}% reduction)`);
      console.log(`💾 Saved to: ${outputPath}`);

      return {
        inputPath,
        outputPath,
        originalSize,
        optimizedSize,
        savings: parseFloat(savings),
        data: result.data
      };

    } catch (error) {
      console.error(`❌ Optimization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Optimize SVG string
   */
  async optimize(svgString, options = {}) {
    const config = {
      ...this.getDefaultConfig(),
      ...options
    };

    return optimize(svgString, config);
  }

  /**
   * Get default SVGO configuration
   */
  getDefaultConfig() {
    return {
      multipass: true,
      floatPrecision: this.config.precision,
      plugins: [
        // Remove unnecessary elements
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeMetadata',
        'removeEditorsNSData',
        'cleanupAttrs',
        'mergeStyles',
        'inlineStyles',

        // Cleanup IDs
        {
          name: 'cleanupIds',
          params: {
            remove: true,
            minify: true,
            preserve: [],
            preservePrefixes: [],
            force: false
          }
        },

        // Remove empty elements
        'removeEmptyAttrs',
        'removeEmptyText',
        'removeEmptyContainers',

        // Optimize paths
        {
          name: 'convertPathData',
          params: {
            applyTransforms: true,
            applyTransformsStroked: true,
            makeArcs: {
              threshold: 2.5,
              tolerance: 0.5
            },
            straightCurves: true,
            lineShorthands: true,
            curveSmoothShorthands: true,
            floatPrecision: this.config.precision,
            transformPrecision: this.config.precision,
            removeUseless: true,
            collapseRepeated: true,
            utilizeAbsolute: true,
            leadingZero: true,
            negativeExtraSpace: true
          }
        },

        // Optimize transforms
        {
          name: 'convertTransform',
          params: {
            convertToShorts: true,
            floatPrecision: this.config.precision,
            transformPrecision: this.config.precision,
            matrixToTransform: true,
            shortTranslate: true,
            shortScale: true,
            shortRotate: true,
            removeUseless: true,
            collapseIntoOne: true,
            leadingZero: true,
            negativeExtraSpace: false
          }
        },

        // Remove hidden elements
        'removeHiddenElems',
        'removeNonInheritableGroupAttrs',
        'removeUselessStrokeAndFill',

        // Cleanup numeric values
        {
          name: 'cleanupNumericValues',
          params: {
            floatPrecision: this.config.precision,
            leadingZero: true,
            defaultPx: true,
            convertToPx: true
          }
        },

        // Merge paths
        'mergePaths',

        // Convert colors
        {
          name: 'convertColors',
          params: {
            currentColor: true,
            names2hex: true,
            rgb2hex: true,
            shorthex: true,
            shortname: true
          }
        },

        // Sort attributes
        'sortAttrs',

        // Remove unnecessary attributes
        'removeUselessDefs',
        'removeUnusedNS',
        'removeDesc',
        'removeTitle'
      ]
    };
  }

  /**
   * Simplify paths in SVG
   */
  async simplifyPaths(svgString, tolerance = 1.0) {
    console.log(`🔄 Simplifying paths (tolerance: ${tolerance})`);

    const config = {
      plugins: [
        {
          name: 'convertPathData',
          params: {
            applyTransforms: true,
            applyTransformsStroked: true,
            makeArcs: {
              threshold: tolerance,
              tolerance: tolerance
            },
            straightCurves: true,
            curveSmoothShorthands: true,
            floatPrecision: this.config.precision,
            removeUseless: true,
            collapseRepeated: true
          }
        }
      ]
    };

    return optimize(svgString, config);
  }

  /**
   * Normalize colors to TEEI palette
   */
  async normalizeColors(svgString, mapToTeei = true) {
    console.log('🎨 Normalizing colors...');

    let normalized = svgString;

    if (mapToTeei) {
      // Map similar colors to TEEI palette
      const colorMap = {
        // Teal/dark blues -> Nordshore
        '#003': '#00393F',
        '#006': '#00393F',
        '#036': '#00393F',
        '#004040': '#00393F',
        '#003333': '#00393F',

        // Light blues -> Sky
        '#C0E': '#C9E4EC',
        '#CCE': '#C9E4EC',
        '#CEF': '#C9E4EC',

        // Beiges/creams -> Sand or Beige
        '#FFF0E0': '#FFF1E2',
        '#FFE': '#FFF1E2',
        '#EEE0D0': '#EFE1DC',

        // Greens -> Moss
        '#690': '#65873B',
        '#6A0': '#65873B',
        '#585': '#65873B',

        // Browns/golds -> Gold or Clay
        '#BA8': '#BA8F5A',
        '#B95': '#BA8F5A',
        '#921': '#913B2F',
        '#831': '#913B2F'
      };

      for (const [oldColor, newColor] of Object.entries(colorMap)) {
        const regex = new RegExp(oldColor, 'gi');
        normalized = normalized.replace(regex, newColor);
      }
    }

    return normalized;
  }

  /**
   * Add accessibility attributes
   */
  async addAccessibility(svgString, options = {}) {
    const {
      title = '',
      description = '',
      role = 'img',
      ariaLabel = ''
    } = options;

    console.log('♿ Adding accessibility attributes...');

    // Parse SVG
    let accessible = svgString;

    // Add role
    if (role && !accessible.includes('role=')) {
      accessible = accessible.replace('<svg', `<svg role="${role}"`);
    }

    // Add aria-label
    if (ariaLabel && !accessible.includes('aria-label=')) {
      accessible = accessible.replace('<svg', `<svg aria-label="${ariaLabel}"`);
    }

    // Add title element
    if (title && !accessible.includes('<title>')) {
      accessible = accessible.replace(
        /(<svg[^>]*>)/,
        `$1\n  <title>${title}</title>`
      );
    }

    // Add desc element
    if (description && !accessible.includes('<desc>')) {
      accessible = accessible.replace(
        /(<svg[^>]*>)/,
        `$1\n  <desc>${description}</desc>`
      );
    }

    return accessible;
  }

  /**
   * Batch optimize directory
   */
  async optimizeDirectory(inputDir, outputDir = null, options = {}) {
    console.log(`\n📂 Batch optimizing: ${inputDir}`);

    if (!outputDir) {
      outputDir = path.join(inputDir, 'optimized');
    }

    await fs.mkdir(outputDir, { recursive: true });

    // Find all SVG files
    const files = await fs.readdir(inputDir);
    const svgFiles = files.filter(f => f.endsWith('.svg'));

    console.log(`📋 Found ${svgFiles.length} SVG files`);

    const results = [];
    let totalOriginal = 0;
    let totalOptimized = 0;

    for (let i = 0; i < svgFiles.length; i++) {
      const file = svgFiles[i];
      console.log(`\n[${i + 1}/${svgFiles.length}] ${file}`);

      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, file);

      try {
        const result = await this.optimizeSVG(inputPath, outputPath, options);
        results.push(result);

        totalOriginal += result.originalSize;
        totalOptimized += result.optimizedSize;
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        results.push({
          inputPath,
          error: error.message
        });
      }
    }

    const totalSavings = ((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1);

    console.log(`\n📊 Batch Optimization Summary:`);
    console.log(`   Files processed: ${svgFiles.length}`);
    console.log(`   Total original: ${this.formatBytes(totalOriginal)}`);
    console.log(`   Total optimized: ${this.formatBytes(totalOptimized)}`);
    console.log(`   Total savings: ${totalSavings}%`);

    return {
      inputDir,
      outputDir,
      filesProcessed: svgFiles.length,
      totalOriginal,
      totalOptimized,
      totalSavings: parseFloat(totalSavings),
      results
    };
  }

  /**
   * Convert colors to specific palette
   */
  async convertColorPalette(svgString, colorMap) {
    console.log('🎨 Converting color palette...');

    let converted = svgString;

    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      const regex = new RegExp(oldColor, 'gi');
      converted = converted.replace(regex, newColor);
    }

    return converted;
  }

  /**
   * Remove specific elements
   */
  async removeElements(svgString, selectors = []) {
    console.log(`🗑️  Removing elements: ${selectors.join(', ')}`);

    let cleaned = svgString;

    for (const selector of selectors) {
      // Simple regex-based removal (for production, use proper XML parser)
      const regex = new RegExp(`<${selector}[^>]*>.*?</${selector}>`, 'gs');
      cleaned = cleaned.replace(regex, '');
    }

    return cleaned;
  }

  /**
   * Get SVG info
   */
  async getInfo(svgPath) {
    const svgString = await fs.readFile(svgPath, 'utf8');
    const size = Buffer.byteLength(svgString, 'utf8');

    // Extract viewBox
    const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : null;

    // Extract dimensions
    const widthMatch = svgString.match(/width="([^"]+)"/);
    const heightMatch = svgString.match(/height="([^"]+)"/);

    // Count elements
    const pathCount = (svgString.match(/<path/g) || []).length;
    const circleCount = (svgString.match(/<circle/g) || []).length;
    const rectCount = (svgString.match(/<rect/g) || []).length;
    const groupCount = (svgString.match(/<g/g) || []).length;

    return {
      path: svgPath,
      size: this.formatBytes(size),
      sizeBytes: size,
      viewBox,
      width: widthMatch ? widthMatch[1] : null,
      height: heightMatch ? heightMatch[1] : null,
      elements: {
        paths: pathCount,
        circles: circleCount,
        rectangles: rectCount,
        groups: groupCount,
        total: pathCount + circleCount + rectCount
      }
    };
  }

  /**
   * Format bytes
   */
  formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Validate SVG
   */
  async validate(svgString) {
    const issues = [];

    // Check for basic SVG structure
    if (!svgString.includes('<svg')) {
      issues.push({ severity: 'error', message: 'Missing <svg> element' });
    }

    // Check for closing tag
    if (!svgString.includes('</svg>')) {
      issues.push({ severity: 'error', message: 'Missing </svg> closing tag' });
    }

    // Check for viewBox or dimensions
    if (!svgString.includes('viewBox') && !svgString.includes('width=')) {
      issues.push({ severity: 'warning', message: 'Missing viewBox and dimensions' });
    }

    // Check for accessibility
    if (!svgString.includes('role=') && !svgString.includes('aria-label=')) {
      issues.push({ severity: 'warning', message: 'Missing accessibility attributes' });
    }

    if (!svgString.includes('<title>')) {
      issues.push({ severity: 'info', message: 'Missing title element for accessibility' });
    }

    // Check file size
    const size = Buffer.byteLength(svgString, 'utf8');
    if (size > 100000) {
      issues.push({ severity: 'warning', message: `Large file size: ${this.formatBytes(size)}` });
    }

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues
    };
  }
}

module.exports = SVGOptimizer;
