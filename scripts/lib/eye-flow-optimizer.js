/**
 * Eye Flow Optimizer
 *
 * Optimizes layouts for natural eye movement patterns:
 * - Z-pattern (Western reading)
 * - F-pattern (text-heavy content)
 * - Gutenberg diagram (print layout)
 * - Eye-tracking heatmap simulation
 * - Reading gravity analysis
 *
 * Based on eye-tracking research and visual perception studies.
 *
 * @module eye-flow-optimizer
 */

class EyeFlowOptimizer {
  constructor(options = {}) {
    this.options = {
      pattern: options.pattern || 'auto',  // auto, z, f, gutenberg
      culture: options.culture || 'western',  // western, rtl (right-to-left)
      debug: options.debug || false
    };

    // Eye flow patterns
    this.patterns = {
      z: {
        name: 'Z-Pattern',
        description: 'Horizontal scanning for image-heavy layouts',
        points: [
          { x: 0.1, y: 0.1, strength: 1.0, label: 'Primary Entry' },
          { x: 0.9, y: 0.1, strength: 0.8, label: 'Top Right' },
          { x: 0.1, y: 0.5, strength: 0.6, label: 'Middle Left' },
          { x: 0.9, y: 0.9, strength: 0.9, label: 'CTA Zone' }
        ],
        bestFor: 'Landing pages, hero sections, image-heavy layouts'
      },
      f: {
        name: 'F-Pattern',
        description: 'Vertical scanning for text-heavy content',
        points: [
          { x: 0.1, y: 0.1, strength: 1.0, label: 'Start' },
          { x: 0.7, y: 0.1, strength: 0.9, label: 'Top Bar' },
          { x: 0.1, y: 0.25, strength: 0.8, label: 'Second Bar Start' },
          { x: 0.5, y: 0.25, strength: 0.7, label: 'Second Bar End' },
          { x: 0.1, y: 0.4, strength: 0.6, label: 'Stem Top' },
          { x: 0.1, y: 0.7, strength: 0.4, label: 'Stem Bottom' }
        ],
        bestFor: 'Text-heavy documents, articles, white papers'
      },
      gutenberg: {
        name: 'Gutenberg Diagram',
        description: 'Diagonal flow from top-left to bottom-right',
        zones: [
          { name: 'Primary', x: 0.05, y: 0.05, width: 0.45, height: 0.45, strength: 1.0 },
          { name: 'Strong Fallow', x: 0.5, y: 0.05, width: 0.45, height: 0.45, strength: 0.6 },
          { name: 'Weak Fallow', x: 0.05, y: 0.5, width: 0.45, height: 0.45, strength: 0.4 },
          { name: 'Terminal', x: 0.5, y: 0.5, width: 0.45, height: 0.45, strength: 0.8 }
        ],
        bestFor: 'Print layouts, books, traditional documents'
      }
    };

    // Heat zones (based on eye-tracking studies)
    this.heatZones = {
      hot: { threshold: 0.8, color: '#FF0000', label: 'High attention' },
      warm: { threshold: 0.6, color: '#FFA500', label: 'Medium attention' },
      cool: { threshold: 0.4, color: '#FFFF00', label: 'Low attention' },
      cold: { threshold: 0.0, color: '#0000FF', label: 'Rarely viewed' }
    };
  }

  /**
   * Optimize layout for eye flow
   */
  optimizeLayout(layout, pattern = 'auto') {
    const selectedPattern = pattern === 'auto'
      ? this.selectOptimalPattern(layout)
      : this.patterns[pattern];

    if (!selectedPattern) {
      throw new Error(`Unknown pattern: ${pattern}`);
    }

    // Generate heatmap
    const heatmap = this.generateHeatmap(layout, selectedPattern);

    // Score each element's position
    const scoredElements = layout.elements.map(element => ({
      ...element,
      eyeFlowScore: this.scoreElementPosition(element, heatmap, selectedPattern),
      attentionZone: this.getAttentionZone(element, heatmap)
    }));

    // Generate recommendations
    const recommendations = this.generateRecommendations(scoredElements, selectedPattern);

    return {
      ...layout,
      elements: scoredElements,
      eyeFlow: {
        pattern: selectedPattern.name,
        heatmap,
        averageScore: this.calculateAverageScore(scoredElements),
        recommendations
      }
    };
  }

  /**
   * Select optimal eye flow pattern
   */
  selectOptimalPattern(layout) {
    const textImageRatio = this.calculateTextImageRatio(layout.elements);

    // Text-heavy → F-pattern
    if (textImageRatio > 3) {
      return this.patterns.f;
    }

    // Balanced → Z-pattern
    if (textImageRatio > 0.5) {
      return this.patterns.z;
    }

    // Print-style → Gutenberg
    if (layout.grid?.name?.includes('Manuscript')) {
      return this.patterns.gutenberg;
    }

    // Default: Z-pattern
    return this.patterns.z;
  }

  /**
   * Calculate text to image ratio
   */
  calculateTextImageRatio(elements) {
    const textElements = elements.filter(el => el.type === 'text' || !el.image);
    const imageElements = elements.filter(el => el.type === 'image' || el.image);

    if (imageElements.length === 0) return Infinity;
    return textElements.length / imageElements.length;
  }

  /**
   * Generate attention heatmap
   */
  generateHeatmap(layout, pattern) {
    const page = layout.page;
    const resolution = 20;  // Grid resolution

    const heatmap = [];

    for (let y = 0; y < resolution; y++) {
      const row = [];
      for (let x = 0; x < resolution; x++) {
        const relativeX = x / resolution;
        const relativeY = y / resolution;

        const heat = this.calculateHeatAtPoint(relativeX, relativeY, pattern, page);
        row.push(heat);
      }
      heatmap.push(row);
    }

    return {
      data: heatmap,
      resolution,
      width: page.width,
      height: page.height
    };
  }

  /**
   * Calculate attention heat at specific point
   */
  calculateHeatAtPoint(x, y, pattern, page) {
    if (pattern.points) {
      // Point-based pattern (Z, F)
      return this.calculatePointBasedHeat(x, y, pattern.points);
    }

    if (pattern.zones) {
      // Zone-based pattern (Gutenberg)
      return this.calculateZoneBasedHeat(x, y, pattern.zones);
    }

    return 0.5;  // Default medium heat
  }

  /**
   * Calculate heat from focal points
   */
  calculatePointBasedHeat(x, y, points) {
    let totalHeat = 0;
    let totalWeight = 0;

    points.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(x - point.x, 2) +
        Math.pow(y - point.y, 2)
      );

      // Heat decreases with distance (Gaussian falloff)
      const heat = point.strength * Math.exp(-distance * 3);

      totalHeat += heat;
      totalWeight += point.strength;
    });

    // Normalize
    return Math.min(totalHeat / totalWeight, 1.0);
  }

  /**
   * Calculate heat from zones
   */
  calculateZoneBasedHeat(x, y, zones) {
    for (const zone of zones) {
      const inZone = (
        x >= zone.x &&
        x <= zone.x + zone.width &&
        y >= zone.y &&
        y <= zone.y + zone.height
      );

      if (inZone) {
        return zone.strength;
      }
    }

    return 0.1;  // Outside all zones
  }

  /**
   * Score element position relative to heatmap
   */
  scoreElementPosition(element, heatmap, pattern) {
    const centerX = (element.x + element.width / 2) / heatmap.width;
    const centerY = (element.y + element.height / 2) / heatmap.height;

    // Get heat at element center
    const gridX = Math.floor(centerX * heatmap.resolution);
    const gridY = Math.floor(centerY * heatmap.resolution);

    const heat = heatmap.data[gridY]?.[gridX] || 0;

    // Score based on element importance and heat
    const importance = element.hierarchyLevel ? (5 - element.hierarchyLevel) / 4 : 0.5;
    const positionScore = heat;

    // Good positioning: important elements in hot zones
    const alignmentScore = Math.min(importance, positionScore);

    return {
      heat,
      importance,
      alignment: alignmentScore,
      overall: (heat * 0.5 + alignmentScore * 0.5)
    };
  }

  /**
   * Get attention zone for element
   */
  getAttentionZone(element, heatmap) {
    const score = this.scoreElementPosition(element, heatmap, null);

    if (score.heat >= this.heatZones.hot.threshold) return 'hot';
    if (score.heat >= this.heatZones.warm.threshold) return 'warm';
    if (score.heat >= this.heatZones.cool.threshold) return 'cool';
    return 'cold';
  }

  /**
   * Calculate average eye flow score
   */
  calculateAverageScore(elements) {
    if (elements.length === 0) return 0;

    const total = elements.reduce((sum, el) => sum + el.eyeFlowScore.overall, 0);
    return total / elements.length;
  }

  /**
   * Generate eye flow recommendations
   */
  generateRecommendations(elements, pattern) {
    const recommendations = [];

    // Check important elements in hot zones
    const importantElements = elements.filter(el => el.hierarchyLevel <= 2);
    const importantInCold = importantElements.filter(el => el.attentionZone === 'cold');

    if (importantInCold.length > 0) {
      recommendations.push({
        type: 'positioning',
        severity: 'high',
        message: `${importantInCold.length} important elements in low-attention zones`,
        elements: importantInCold.map(el => el.id),
        suggestion: `Move important content to hot zones (${pattern.bestFor})`
      });
    }

    // Check CTA placement
    const ctaElements = elements.filter(el => el.type === 'cta' || el.content?.includes('CTA'));
    const ctaInHot = ctaElements.filter(el => el.attentionZone === 'hot' || el.attentionZone === 'warm');

    if (ctaElements.length > 0 && ctaInHot.length === 0) {
      recommendations.push({
        type: 'cta-placement',
        severity: 'high',
        message: 'Call-to-action not in high-attention zone',
        suggestion: pattern.name === 'Z-Pattern'
          ? 'Place CTA in bottom-right (natural end of Z-pattern)'
          : 'Place CTA in left column near top'
      });
    }

    // Check element distribution
    const hotElements = elements.filter(el => el.attentionZone === 'hot').length;
    const coldElements = elements.filter(el => el.attentionZone === 'cold').length;

    if (coldElements > hotElements) {
      recommendations.push({
        type: 'distribution',
        severity: 'medium',
        message: 'Too much content in low-attention areas',
        suggestion: 'Redistribute content toward primary eye flow path'
      });
    }

    // Check reading gravity
    const readingGravity = this.analyzeReadingGravity(elements);
    if (!readingGravity.balanced) {
      recommendations.push({
        type: 'reading-gravity',
        severity: 'low',
        message: readingGravity.message,
        suggestion: readingGravity.suggestion
      });
    }

    return recommendations;
  }

  /**
   * Analyze reading gravity (visual weight distribution)
   */
  analyzeReadingGravity(elements) {
    // Calculate center of visual mass
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    elements.forEach(el => {
      const weight = el.visualWeight?.total || 1;
      const centerX = el.x + el.width / 2;
      const centerY = el.y + el.height / 2;

      weightedX += centerX * weight;
      weightedY += centerY * weight;
      totalWeight += weight;
    });

    const centerOfMass = {
      x: weightedX / totalWeight,
      y: weightedY / totalWeight
    };

    // Check if center of mass is in good position
    // Optimal: slightly left and up from center (for Western reading)
    const optimalX = 0.45;  // 45% from left
    const optimalY = 0.40;  // 40% from top

    const page = { width: 612, height: 792 };  // US Letter
    const actualX = centerOfMass.x / page.width;
    const actualY = centerOfMass.y / page.height;

    const xDeviation = Math.abs(actualX - optimalX);
    const yDeviation = Math.abs(actualY - optimalY);

    const balanced = xDeviation < 0.1 && yDeviation < 0.1;

    return {
      balanced,
      centerOfMass,
      optimal: { x: optimalX * page.width, y: optimalY * page.height },
      message: balanced
        ? 'Reading gravity is well balanced'
        : `Reading gravity is off-center (X: ${(xDeviation * 100).toFixed(1)}%, Y: ${(yDeviation * 100).toFixed(1)}%)`,
      suggestion: balanced
        ? null
        : 'Redistribute visual weight toward upper-left quadrant'
    };
  }

  /**
   * Generate eye flow visualization
   */
  generateVisualization(layout, pattern) {
    const heatmap = this.generateHeatmap(layout, pattern);

    return {
      type: 'eye-flow-heatmap',
      heatmap,
      pattern: pattern.name,
      overlays: {
        focalPoints: pattern.points?.map(point => ({
          x: point.x * layout.page.width,
          y: point.y * layout.page.height,
          label: point.label,
          strength: point.strength
        })),
        zones: pattern.zones?.map(zone => ({
          x: zone.x * layout.page.width,
          y: zone.y * layout.page.height,
          width: zone.width * layout.page.width,
          height: zone.height * layout.page.height,
          name: zone.name,
          strength: zone.strength
        })),
        elements: layout.elements.map(el => ({
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          zone: el.attentionZone,
          score: el.eyeFlowScore?.overall
        }))
      }
    };
  }

  /**
   * Simulate eye tracking path
   */
  simulateEyeTracking(layout, pattern) {
    const path = [];

    if (pattern.points) {
      // Follow focal points in order
      pattern.points.forEach((point, idx) => {
        const x = point.x * layout.page.width;
        const y = point.y * layout.page.height;

        path.push({
          step: idx + 1,
          x,
          y,
          label: point.label,
          strength: point.strength,
          dwellTime: point.strength * 2000  // milliseconds
        });
      });
    }

    if (pattern.zones) {
      // Visit zones in reading order
      const orderedZones = ['Primary', 'Strong Fallow', 'Weak Fallow', 'Terminal'];
      orderedZones.forEach((zoneName, idx) => {
        const zone = pattern.zones.find(z => z.name === zoneName);
        if (zone) {
          const x = (zone.x + zone.width / 2) * layout.page.width;
          const y = (zone.y + zone.height / 2) * layout.page.height;

          path.push({
            step: idx + 1,
            x,
            y,
            label: zone.name,
            strength: zone.strength,
            dwellTime: zone.strength * 2000
          });
        }
      });
    }

    return {
      path,
      totalDuration: path.reduce((sum, p) => sum + p.dwellTime, 0),
      pattern: pattern.name
    };
  }

  /**
   * Generate eye flow report
   */
  generateReport(optimizedLayout) {
    const eyeFlow = optimizedLayout.eyeFlow;

    return {
      pattern: eyeFlow.pattern,
      averageScore: `${(eyeFlow.averageScore * 100).toFixed(1)}%`,
      elementDistribution: {
        hot: optimizedLayout.elements.filter(el => el.attentionZone === 'hot').length,
        warm: optimizedLayout.elements.filter(el => el.attentionZone === 'warm').length,
        cool: optimizedLayout.elements.filter(el => el.attentionZone === 'cool').length,
        cold: optimizedLayout.elements.filter(el => el.attentionZone === 'cold').length
      },
      recommendations: eyeFlow.recommendations,
      summary: this.generateSummary(eyeFlow)
    };
  }

  generateSummary(eyeFlow) {
    const score = eyeFlow.averageScore;
    const issues = eyeFlow.recommendations.filter(r => r.severity === 'high').length;

    if (score >= 0.8 && issues === 0) {
      return '✅ Excellent eye flow optimization - content guides reader naturally';
    }

    if (score >= 0.6) {
      return `⚠️  Good eye flow with ${issues} areas for improvement`;
    }

    return `❌ Eye flow needs optimization - ${issues} critical issues found`;
  }
}

module.exports = EyeFlowOptimizer;
