/**
 * Gradient Generator
 *
 * Creates beautiful gradients with:
 * - Linear, radial, and conic gradients
 * - Multi-stop gradients
 * - Easing functions for smooth transitions
 * - Color interpolation
 * - Mesh gradients (for modern look)
 *
 * @module gradient-generator
 */

class GradientGenerator {
  constructor() {
    // Easing functions for smooth color transitions
    this.easings = {
      linear: t => t,
      easeInQuad: t => t * t,
      easeOutQuad: t => t * (2 - t),
      easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeInQuart: t => t * t * t * t,
      easeOutQuart: t => 1 - (--t) * t * t * t,
      easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
    };
  }

  /**
   * Generate linear gradient
   * @param {Array} colors - Array of hex colors
   * @param {number} angle - Gradient angle in degrees
   * @param {string} easing - Easing function name
   * @returns {Object} Gradient definition
   */
  generateLinear(colors, angle = 180, easing = 'linear') {
    const stops = this.distributeStops(colors, easing);

    return {
      type: 'linear',
      angle: angle,
      stops: stops,
      css: this.generateLinearCSS(stops, angle),
      svg: this.generateLinearSVG(stops, angle),
      indesign: this.generateInDesignGradient(stops, 'linear', angle)
    };
  }

  /**
   * Generate radial gradient
   * @param {Array} colors - Array of hex colors
   * @param {Object} position - {x, y} position (0-1)
   * @param {string} easing - Easing function name
   * @returns {Object} Gradient definition
   */
  generateRadial(colors, position = { x: 0.5, y: 0.5 }, easing = 'linear') {
    const stops = this.distributeStops(colors, easing);

    return {
      type: 'radial',
      position: position,
      stops: stops,
      css: this.generateRadialCSS(stops, position),
      svg: this.generateRadialSVG(stops, position),
      indesign: this.generateInDesignGradient(stops, 'radial', position)
    };
  }

  /**
   * Generate conic gradient
   * @param {Array} colors - Array of hex colors
   * @param {number} startAngle - Starting angle in degrees
   * @param {string} easing - Easing function name
   * @returns {Object} Gradient definition
   */
  generateConic(colors, startAngle = 0, easing = 'linear') {
    const stops = this.distributeStops(colors, easing);

    return {
      type: 'conic',
      startAngle: startAngle,
      stops: stops,
      css: this.generateConicCSS(stops, startAngle),
      svg: this.generateConicSVG(stops, startAngle)
    };
  }

  /**
   * Generate mesh gradient (advanced)
   * @param {Array} colorGrid - 2D array of colors
   * @returns {Object} Mesh gradient definition
   */
  generateMesh(colorGrid) {
    const rows = colorGrid.length;
    const cols = colorGrid[0].length;

    const patches = [];

    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < cols - 1; j++) {
        patches.push({
          topLeft: colorGrid[i][j],
          topRight: colorGrid[i][j + 1],
          bottomLeft: colorGrid[i + 1][j],
          bottomRight: colorGrid[i + 1][j + 1],
          position: {
            x: j / (cols - 1),
            y: i / (rows - 1)
          }
        });
      }
    }

    return {
      type: 'mesh',
      rows: rows,
      cols: cols,
      patches: patches,
      svg: this.generateMeshSVG(patches)
    };
  }

  /**
   * Distribute color stops with easing
   */
  distributeStops(colors, easingName = 'linear') {
    const easingFn = this.easings[easingName] || this.easings.linear;
    const stops = [];

    colors.forEach((color, i) => {
      const t = i / (colors.length - 1);
      const position = easingFn(t);

      stops.push({
        color: color,
        position: Math.round(position * 100),
        positionDecimal: position
      });
    });

    return stops;
  }

  /**
   * Generate CSS linear gradient
   */
  generateLinearCSS(stops, angle) {
    const stopStrings = stops.map(s => `${s.color} ${s.position}%`);
    return `linear-gradient(${angle}deg, ${stopStrings.join(', ')})`;
  }

  /**
   * Generate CSS radial gradient
   */
  generateRadialCSS(stops, position) {
    const stopStrings = stops.map(s => `${s.color} ${s.position}%`);
    const posX = Math.round(position.x * 100);
    const posY = Math.round(position.y * 100);
    return `radial-gradient(circle at ${posX}% ${posY}%, ${stopStrings.join(', ')})`;
  }

  /**
   * Generate CSS conic gradient
   */
  generateConicCSS(stops, startAngle) {
    const stopStrings = stops.map(s => `${s.color} ${s.position}%`);
    return `conic-gradient(from ${startAngle}deg, ${stopStrings.join(', ')})`;
  }

  /**
   * Generate SVG linear gradient
   */
  generateLinearSVG(stops, angle) {
    const rad = (angle - 90) * Math.PI / 180;
    const x1 = 50 + 50 * Math.cos(rad);
    const y1 = 50 + 50 * Math.sin(rad);
    const x2 = 50 - 50 * Math.cos(rad);
    const y2 = 50 - 50 * Math.sin(rad);

    const stopElements = stops.map((s, i) =>
      `<stop offset="${s.position}%" stop-color="${s.color}"/>`
    ).join('\n    ');

    return `<linearGradient id="gradient" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
    ${stopElements}
</linearGradient>`;
  }

  /**
   * Generate SVG radial gradient
   */
  generateRadialSVG(stops, position) {
    const cx = Math.round(position.x * 100);
    const cy = Math.round(position.y * 100);

    const stopElements = stops.map((s, i) =>
      `<stop offset="${s.position}%" stop-color="${s.color}"/>`
    ).join('\n    ');

    return `<radialGradient id="gradient" cx="${cx}%" cy="${cy}%">
    ${stopElements}
</radialGradient>`;
  }

  /**
   * Generate SVG conic gradient (approximation using multiple gradients)
   */
  generateConicSVG(stops, startAngle) {
    // Conic gradients require complex SVG, provide approximation
    return `<!-- Conic gradient requires complex SVG implementation -->
<!-- Use CSS conic-gradient for web, or convert to multiple linear gradients -->`;
  }

  /**
   * Generate SVG mesh gradient
   */
  generateMeshSVG(patches) {
    const meshPatches = patches.map((patch, i) => `
  <patch>
    <stop path="c ${patch.topLeft}" stop-color="${patch.topLeft}"/>
    <stop path="c ${patch.topRight}" stop-color="${patch.topRight}"/>
    <stop path="c ${patch.bottomRight}" stop-color="${patch.bottomRight}"/>
    <stop path="c ${patch.bottomLeft}" stop-color="${patch.bottomLeft}"/>
  </patch>`).join('\n');

    return `<meshgradient id="mesh" x="0" y="0" width="100" height="100">
  ${meshPatches}
</meshgradient>`;
  }

  /**
   * Generate InDesign gradient
   */
  generateInDesignGradient(stops, type, angleOrPosition) {
    const indesignStops = stops.map(s => ({
      color: this.hexToRGB(s.color),
      location: s.positionDecimal,
      midpoint: 50
    }));

    return {
      type: type === 'linear' ? 'Linear' : 'Radial',
      angle: type === 'linear' ? angleOrPosition : 0,
      center: type === 'radial' ?
        [angleOrPosition.x * 100, angleOrPosition.y * 100] :
        [50, 50],
      stops: indesignStops,
      script: this.generateInDesignScript(type, angleOrPosition, indesignStops)
    };
  }

  /**
   * Generate InDesign ExtendScript
   */
  generateInDesignScript(type, angleOrPosition, stops) {
    const stopCode = stops.map((s, i) => `
    var stop${i} = gradient.gradientStops.add();
    stop${i}.stopColor = [${s.color.r}, ${s.color.g}, ${s.color.b}];
    stop${i}.location = ${s.location};
    stop${i}.midpoint = ${s.midpoint};`).join('');

    if (type === 'linear') {
      return `// Apply linear gradient
var gradient = app.activeDocument.gradients.add();
gradient.type = GradientType.LINEAR;
${stopCode}

// Apply to selection
if (app.selection.length > 0) {
    var obj = app.selection[0];
    obj.fillColor = gradient.color;
    obj.gradientFillAngle = ${angleOrPosition};
}`;
    } else {
      return `// Apply radial gradient
var gradient = app.activeDocument.gradients.add();
gradient.type = GradientType.RADIAL;
${stopCode}

// Apply to selection
if (app.selection.length > 0) {
    var obj = app.selection[0];
    obj.fillColor = gradient.color;
    obj.gradientFillCenter = [${angleOrPosition.x * 100}, ${angleOrPosition.y * 100}];
}`;
    }
  }

  /**
   * Create gradient from color palette
   */
  createFromPalette(palette, type = 'linear') {
    const colors = [];

    // Extract base colors from palette
    if (palette.primary) colors.push(palette.primary.base);
    if (palette.secondary) colors.push(palette.secondary.base);
    if (palette.accent) colors.push(palette.accent.base);

    if (colors.length < 2) {
      throw new Error('Palette must have at least 2 colors');
    }

    switch (type) {
      case 'linear':
        return this.generateLinear(colors, 135, 'easeInOutQuad');
      case 'radial':
        return this.generateRadial(colors, { x: 0.5, y: 0.5 }, 'easeOutCubic');
      case 'conic':
        return this.generateConic(colors, 0, 'linear');
      default:
        return this.generateLinear(colors);
    }
  }

  /**
   * Interpolate between two colors
   */
  interpolateColors(color1, color2, steps = 10) {
    const rgb1 = this.hexToRGB(color1);
    const rgb2 = this.hexToRGB(color2);

    const interpolated = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;

      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * t);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * t);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * t);

      interpolated.push(this.rgbToHex({ r, g, b }));
    }

    return interpolated;
  }

  /**
   * Convert hex to RGB
   */
  hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Convert RGB to hex
   */
  rgbToHex(rgb) {
    const toHex = x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
  }

  /**
   * Generate preset gradients
   */
  getPresets() {
    return {
      sunset: this.generateLinear(
        ['#FF6B6B', '#FFA07A', '#FFD93D'],
        180,
        'easeInOutCubic'
      ),
      ocean: this.generateLinear(
        ['#006994', '#0099CC', '#66CCFF'],
        180,
        'easeOutQuad'
      ),
      forest: this.generateLinear(
        ['#2C5F2D', '#65873B', '#97BC62'],
        135,
        'easeInOutQuad'
      ),
      royal: this.generateLinear(
        ['#4A148C', '#7B1FA2', '#BA68C8'],
        180,
        'easeInOutCubic'
      ),
      warmth: this.generateRadial(
        ['#FFE5B4', '#FFD4A3', '#FFC38B'],
        { x: 0.5, y: 0.3 },
        'easeOutCubic'
      ),
      teei: this.generateLinear(
        ['#00393F', '#65873B', '#BA8F5A'],
        135,
        'easeInOutQuad'
      )
    };
  }

  /**
   * Generate gradient visualization HTML
   */
  generateVisualization(gradient, width = 600, height = 400) {
    let style = '';

    if (gradient.type === 'linear') {
      style = `background: ${gradient.css};`;
    } else if (gradient.type === 'radial') {
      style = `background: ${gradient.css};`;
    } else if (gradient.type === 'conic') {
      style = `background: ${gradient.css};`;
    }

    return `
<div class="gradient-preview" style="width: ${width}px; height: ${height}px; ${style}">
  <div class="gradient-info">
    <h3>${gradient.type.charAt(0).toUpperCase() + gradient.type.slice(1)} Gradient</h3>
    <div class="stops">
      ${gradient.stops.map(s => `
        <div class="stop">
          <span class="color" style="background: ${s.color}"></span>
          <span class="position">${s.position}%</span>
          <span class="hex">${s.color}</span>
        </div>
      `).join('')}
    </div>
  </div>
</div>

<style>
.gradient-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.gradient-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: rgba(255,255,255,0.9);
  padding: 20px;
  border-radius: 8px;
}

.gradient-info h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.stops {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stop {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.stop .color {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stop .position {
  font-weight: 600;
  min-width: 40px;
}

.stop .hex {
  color: #666;
  font-family: monospace;
}
</style>`;
  }
}

module.exports = GradientGenerator;
