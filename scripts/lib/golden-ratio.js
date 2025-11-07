/**
 * Golden Ratio Calculator
 *
 * Implements the golden ratio (φ = 1.618033988749895)
 * for creating harmonious proportions in layouts.
 *
 * The golden ratio appears throughout nature and creates
 * visually pleasing proportions that feel "just right".
 *
 * @module golden-ratio
 */

class GoldenRatio {
  constructor() {
    // The golden ratio constant
    this.phi = 1.618033988749895;

    // Inverse (conjugate) of phi
    this.phiInverse = 0.618033988749895;  // 1/φ

    // Fibonacci sequence (approximates golden ratio)
    this.fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597];
  }

  /**
   * Divide a value by golden ratio
   * Returns [larger, smaller] parts
   */
  divide(value) {
    const larger = value / this.phi;    // 61.8%
    const smaller = value - larger;     // 38.2%

    return {
      larger: larger,
      smaller: smaller,
      ratio: larger / smaller,
      percentages: {
        larger: 61.8,
        smaller: 38.2
      }
    };
  }

  /**
   * Create golden rectangle from width
   */
  rectangle(width) {
    const height = width / this.phi;

    return {
      width,
      height,
      ratio: width / height,
      area: width * height,
      isGolden: true
    };
  }

  /**
   * Create golden rectangle from height
   */
  rectangleFromHeight(height) {
    const width = height * this.phi;

    return {
      width,
      height,
      ratio: width / height,
      area: width * height,
      isGolden: true
    };
  }

  /**
   * Find golden point in rectangle
   * Returns the focal point at (61.8%, 61.8%)
   */
  focalPoint(width, height) {
    return {
      x: width / this.phi,
      y: height / this.phi,
      percentX: 61.8,
      percentY: 61.8,
      description: 'Golden ratio focal point - natural eye attraction'
    };
  }

  /**
   * Create golden spiral coordinates
   * Based on Fibonacci squares
   */
  spiral(maxSize = 1000) {
    const points = [];
    const squares = [];

    let x = 0;
    let y = 0;
    let direction = 'right';

    // Build Fibonacci squares
    for (let i = 0; i < Math.min(this.fibonacci.length, 10); i++) {
      const size = this.fibonacci[i];

      squares.push({ x, y, size, direction });

      // Calculate spiral curve through this square
      const curve = this.spiralCurve(x, y, size, direction);
      points.push(...curve);

      // Move to next square position
      ({ x, y, direction } = this.nextSquarePosition(x, y, size, direction));

      if (size > maxSize) break;
    }

    return {
      points,
      squares,
      equation: 'r = φ^(θ/90°)'
    };
  }

  /**
   * Generate spiral curve points within a square
   */
  spiralCurve(x, y, size, direction) {
    const points = [];
    const steps = 20;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * Math.PI / 2;  // 90° arc

      let px, py;

      switch (direction) {
        case 'right':
          px = x + size - Math.cos(angle) * size;
          py = y + size - Math.sin(angle) * size;
          break;
        case 'down':
          px = x + Math.sin(angle) * size;
          py = y + size - Math.cos(angle) * size;
          break;
        case 'left':
          px = x + Math.cos(angle) * size;
          py = y + Math.sin(angle) * size;
          break;
        case 'up':
          px = x + size - Math.sin(angle) * size;
          py = y + Math.cos(angle) * size;
          break;
      }

      points.push({ x: px, y: py, angle: angle * 180 / Math.PI });
    }

    return points;
  }

  /**
   * Calculate next square position in spiral
   */
  nextSquarePosition(x, y, size, direction) {
    const directions = ['right', 'down', 'left', 'up'];
    const currentIndex = directions.indexOf(direction);
    const nextDirection = directions[(currentIndex + 1) % 4];

    let nextX = x;
    let nextY = y;

    switch (nextDirection) {
      case 'right':
        nextX = x + size;
        nextY = y;
        break;
      case 'down':
        nextX = x;
        nextY = y + size;
        break;
      case 'left':
        nextX = x - size;
        nextY = y;
        break;
      case 'up':
        nextX = x;
        nextY = y - size;
        break;
    }

    return {
      x: nextX,
      y: nextY,
      direction: nextDirection
    };
  }

  /**
   * Create typography scale based on golden ratio
   */
  typographyScale(baseSize = 16) {
    const scale = [];
    let size = baseSize;

    // Generate sizes from base
    for (let i = -3; i <= 6; i++) {
      size = baseSize * Math.pow(this.phi, i);
      scale.push({
        level: i,
        size: Math.round(size * 10) / 10,
        usage: this.getTypographyUsage(i)
      });
    }

    return scale;
  }

  /**
   * Get suggested usage for typography level
   */
  getTypographyUsage(level) {
    const usages = {
      '-3': 'Fine print',
      '-2': 'Captions',
      '-1': 'Small text',
      '0': 'Body text',
      '1': 'Large body / Small headings',
      '2': 'Subheadings',
      '3': 'Section headings',
      '4': 'Page titles',
      '5': 'Display text',
      '6': 'Hero text'
    };

    return usages[level.toString()] || 'Custom size';
  }

  /**
   * Create spacing scale based on golden ratio
   */
  spacingScale(baseSpacing = 8) {
    const scale = [];

    for (let i = 0; i <= 8; i++) {
      const spacing = baseSpacing * Math.pow(this.phi, i);
      scale.push({
        level: i,
        spacing: Math.round(spacing),
        usage: this.getSpacingUsage(i)
      });
    }

    return scale;
  }

  /**
   * Get suggested usage for spacing level
   */
  getSpacingUsage(level) {
    const usages = {
      0: 'Inline elements',
      1: 'Small gaps',
      2: 'Default spacing',
      3: 'Between paragraphs',
      4: 'Between sections',
      5: 'Major sections',
      6: 'Page margins',
      7: 'Large separations',
      8: 'Maximum spacing'
    };

    return usages[level] || 'Custom spacing';
  }

  /**
   * Calculate golden grid divisions
   */
  gridDivisions(totalSize, levels = 3) {
    const divisions = [];
    let remaining = totalSize;

    for (let i = 0; i < levels; i++) {
      const div = this.divide(remaining);
      divisions.push({
        level: i + 1,
        size: div.larger,
        percentage: (div.larger / totalSize) * 100,
        remaining: div.smaller
      });
      remaining = div.smaller;
    }

    return divisions;
  }

  /**
   * Check if a ratio is close to golden ratio
   */
  isGoldenRatio(width, height, tolerance = 0.05) {
    const ratio = width / height;
    const diff = Math.abs(ratio - this.phi);
    const percentDiff = (diff / this.phi) * 100;

    return {
      isGolden: diff < tolerance,
      ratio: ratio,
      phi: this.phi,
      difference: diff,
      percentDifference: percentDiff,
      closeness: Math.max(0, 100 - percentDiff * 20)  // 0-100 score
    };
  }

  /**
   * Get closest Fibonacci number
   */
  closestFibonacci(value) {
    let closest = this.fibonacci[0];
    let minDiff = Math.abs(value - closest);

    for (const fib of this.fibonacci) {
      const diff = Math.abs(value - fib);
      if (diff < minDiff) {
        minDiff = diff;
        closest = fib;
      }
    }

    return {
      value: closest,
      difference: minDiff,
      ratio: value / closest
    };
  }

  /**
   * Create golden grid overlay
   */
  gridOverlay(width, height) {
    const focal = this.focalPoint(width, height);
    const divisions = this.gridDivisions(width, 4);

    // Vertical divisions
    const verticalLines = divisions.map(div => ({
      x: div.size,
      label: `${div.percentage.toFixed(1)}%`,
      level: div.level
    }));

    // Horizontal divisions
    const horizontalDivisions = this.gridDivisions(height, 4);
    const horizontalLines = horizontalDivisions.map(div => ({
      y: div.size,
      label: `${div.percentage.toFixed(1)}%`,
      level: div.level
    }));

    return {
      width,
      height,
      focal,
      vertical: verticalLines,
      horizontal: horizontalLines,
      grid: this.createGridIntersections(verticalLines, horizontalLines)
    };
  }

  /**
   * Create grid intersection points
   */
  createGridIntersections(verticalLines, horizontalLines) {
    const intersections = [];

    verticalLines.forEach(vLine => {
      horizontalLines.forEach(hLine => {
        intersections.push({
          x: vLine.x,
          y: hLine.y,
          importance: (vLine.level + hLine.level) / 2,
          isFocal: Math.abs(vLine.x - vLine.x * 0.618) < 10 &&
                   Math.abs(hLine.y - hLine.y * 0.618) < 10
        });
      });
    });

    return intersections;
  }

  /**
   * Apply golden ratio to margins
   */
  margins(pageWidth, pageHeight) {
    // Classical book margins using golden ratio
    // Top margin smaller, bottom larger
    // Inner margin smaller, outer larger

    const horizontalMargin = pageWidth / (2 * this.phi + 2);
    const verticalMargin = pageHeight / (2 * this.phi + 2);

    return {
      top: verticalMargin,
      right: horizontalMargin * this.phi,
      bottom: verticalMargin * this.phi,
      left: horizontalMargin,
      description: 'Classical golden ratio margins',
      contentArea: {
        width: pageWidth - horizontalMargin * (1 + this.phi),
        height: pageHeight - verticalMargin * (1 + this.phi)
      }
    };
  }

  /**
   * Create column widths using golden ratio
   */
  columns(totalWidth, count = 2) {
    if (count === 1) {
      return [{ width: totalWidth, percentage: 100 }];
    }

    if (count === 2) {
      // Classic 2-column: 61.8% / 38.2%
      const div = this.divide(totalWidth);
      return [
        { width: div.larger, percentage: 61.8, type: 'primary' },
        { width: div.smaller, percentage: 38.2, type: 'secondary' }
      ];
    }

    if (count === 3) {
      // 3-column: primary (61.8% of total), then divide remainder
      const div1 = this.divide(totalWidth);
      const div2 = this.divide(div1.smaller);

      return [
        { width: div1.larger, percentage: 61.8, type: 'primary' },
        { width: div2.larger, percentage: 23.6, type: 'secondary' },
        { width: div2.smaller, percentage: 14.6, type: 'tertiary' }
      ];
    }

    // For more columns, use equal widths (not ideal for golden ratio)
    const colWidth = totalWidth / count;
    return Array(count).fill(null).map((_, i) => ({
      width: colWidth,
      percentage: 100 / count,
      type: i === 0 ? 'primary' : 'equal'
    }));
  }

  /**
   * Get golden ratio facts and properties
   */
  properties() {
    return {
      value: this.phi,
      decimal: '1.618033988749895...',
      formula: '(1 + √5) / 2',
      reciprocal: this.phiInverse,
      uniqueProperty: 'φ² = φ + 1',
      fibonacci: 'Ratio of consecutive Fibonacci numbers → φ',
      nature: [
        'Spiral shells (nautilus)',
        'Flower petals',
        'Pinecones',
        'Tree branches',
        'Human body proportions',
        'DNA molecule'
      ],
      art: [
        'Parthenon (Greece)',
        'Pyramids of Giza',
        'Mona Lisa (Da Vinci)',
        'The Last Supper (Da Vinci)',
        'Notre Dame (Paris)'
      ],
      design: [
        'Apple logo',
        'Twitter logo',
        'Pepsi logo',
        'National Geographic',
        'Toyota'
      ]
    };
  }

  /**
   * Generate visual grid for InDesign
   */
  inDesignGrid(pageWidth, pageHeight) {
    const margins = this.margins(pageWidth, pageHeight);
    const contentWidth = margins.contentArea.width;

    // 12-column grid within content area
    const gutterWidth = 20;
    const columnWidth = (contentWidth - (11 * gutterWidth)) / 12;

    return {
      document: {
        width: pageWidth,
        height: pageHeight
      },
      margins: {
        top: margins.top,
        right: margins.right,
        bottom: margins.bottom,
        left: margins.left
      },
      grid: {
        columns: 12,
        columnWidth: columnWidth,
        gutterWidth: gutterWidth
      },
      baseline: {
        grid: 8,  // 8pt baseline for vertical rhythm
        start: margins.top
      },
      guides: {
        vertical: this.gridOverlay(pageWidth, pageHeight).vertical,
        horizontal: this.gridOverlay(pageWidth, pageHeight).horizontal
      }
    };
  }

  /**
   * Calculate optimal image size using golden ratio
   */
  imageSize(containerWidth, containerHeight, orientation = 'landscape') {
    if (orientation === 'landscape') {
      // Width based on golden ratio of container
      const width = containerWidth / this.phi;
      const height = width / this.phi;

      return {
        width,
        height,
        aspectRatio: this.phi,
        orientation: 'landscape'
      };
    }

    if (orientation === 'portrait') {
      // Height based on golden ratio of container
      const height = containerHeight / this.phi;
      const width = height / this.phi;

      return {
        width,
        height,
        aspectRatio: this.phi,
        orientation: 'portrait'
      };
    }

    // Square (not golden, but useful)
    const size = Math.min(containerWidth, containerHeight) / this.phi;
    return {
      width: size,
      height: size,
      aspectRatio: 1,
      orientation: 'square'
    };
  }

  /**
   * Generate layout recommendations
   */
  layoutRecommendations(pageWidth, pageHeight) {
    const focal = this.focalPoint(pageWidth, pageHeight);
    const margins = this.margins(pageWidth, pageHeight);
    const cols = this.columns(margins.contentArea.width, 2);

    return {
      focalPoint: {
        x: focal.x,
        y: focal.y,
        usage: 'Place your most important content here (hero image, headline, or CTA)'
      },
      margins: {
        values: margins,
        usage: 'Use these margins for classical, balanced layouts'
      },
      columns: {
        twoColumn: {
          primary: cols[0],
          secondary: cols[1],
          usage: 'Primary column (61.8%) for main content, secondary (38.2%) for sidebar/images'
        }
      },
      typography: {
        scale: this.typographyScale(11),  // 11pt base (TEEI body text)
        usage: 'Use this scale for harmonious font sizes'
      },
      spacing: {
        scale: this.spacingScale(8),  // 8pt base (TEEI baseline)
        usage: 'Use this scale for consistent spacing throughout'
      }
    };
  }
}

module.exports = GoldenRatio;
