/**
 * Pacing Engine
 *
 * Controls the rhythm and tempo of content flow through:
 * - Content density analysis
 * - Visual breathing points
 * - Rhythm and tempo calculation
 * - Page-turn anticipation
 * - Reading fatigue prevention
 *
 * Creates engaging documents that maintain reader attention.
 *
 * @module pacing-engine
 */

class PacingEngine {
  constructor(options = {}) {
    this.options = {
      targetReadingTime: options.targetReadingTime || null,  // minutes
      averageReadingSpeed: options.averageReadingSpeed || 250,  // words per minute
      debug: options.debug || false
    };

    // Pacing strategies
    this.strategies = {
      fast: {
        name: 'Fast Pacing',
        wordDensity: 'high',
        whitespace: 'minimal',
        imageRatio: 'low',
        description: 'High information density, minimal breaks',
        bestFor: 'News, updates, summaries'
      },
      moderate: {
        name: 'Moderate Pacing',
        wordDensity: 'balanced',
        whitespace: 'comfortable',
        imageRatio: 'balanced',
        description: 'Balanced rhythm with regular breathing points',
        bestFor: 'Reports, proposals, general documents'
      },
      slow: {
        name: 'Slow Pacing',
        wordDensity: 'low',
        whitespace: 'generous',
        imageRatio: 'high',
        description: 'Contemplative, spacious, image-rich',
        bestFor: 'Portfolios, art books, luxury content'
      },
      varied: {
        name: 'Varied Pacing',
        wordDensity: 'mixed',
        whitespace: 'dynamic',
        imageRatio: 'mixed',
        description: 'Alternating fast and slow to maintain engagement',
        bestFor: 'Long documents, books, magazines'
      }
    };

    // Tempo scale (1.0 = fast, 0.1 = very slow)
    this.tempoScale = {
      'very-fast': 1.0,
      'fast': 0.8,
      'moderate': 0.5,
      'slow': 0.3,
      'very-slow': 0.1
    };
  }

  /**
   * Analyze and optimize pacing for layout
   */
  optimizePacing(layout, options = {}) {
    if (this.options.debug) {
      console.log('⏱️  Analyzing pacing...');
    }

    // Step 1: Analyze current pacing
    const analysis = this.analyzePacing(layout);

    // Step 2: Select strategy
    const strategy = options.strategy || this.selectStrategy(analysis);

    // Step 3: Calculate page-by-page pacing
    const pagePacing = this.calculatePagePacing(layout, strategy);

    // Step 4: Identify breathing points
    const breathingPoints = this.identifyBreathingPoints(layout, pagePacing);

    // Step 5: Calculate rhythm
    const rhythm = this.calculateRhythm(pagePacing);

    // Step 6: Generate recommendations
    const recommendations = this.generateRecommendations(analysis, strategy, rhythm);

    return {
      ...layout,
      pacing: {
        strategy: strategy.name,
        analysis,
        pagePacing,
        breathingPoints,
        rhythm,
        recommendations,
        metrics: this.calculateMetrics(pagePacing, rhythm)
      }
    };
  }

  /**
   * Analyze current pacing
   */
  analyzePacing(layout) {
    const elements = layout.elements || [];

    // Content density
    const totalWords = this.estimateWordCount(elements);
    const pageArea = layout.page.width * layout.page.height;
    const contentArea = elements.reduce((sum, el) => sum + (el.area || 0), 0);
    const whitespaceRatio = (pageArea - contentArea) / pageArea;

    // Element distribution
    const textElements = elements.filter(el => el.type === 'text' || !el.image);
    const imageElements = elements.filter(el => el.type === 'image' || el.image);
    const textImageRatio = imageElements.length > 0
      ? textElements.length / imageElements.length
      : Infinity;

    // Reading time estimate
    const estimatedReadingTime = totalWords / this.options.averageReadingSpeed;

    // Complexity
    const avgElementsPerPage = elements.length;
    const complexityScore = this.calculateComplexity(elements);

    return {
      totalWords,
      contentDensity: contentArea / pageArea,
      whitespaceRatio,
      textImageRatio,
      estimatedReadingTime,
      avgElementsPerPage,
      complexityScore,
      classification: this.classifyPacing(whitespaceRatio, textImageRatio, complexityScore)
    };
  }

  /**
   * Estimate word count from elements
   */
  estimateWordCount(elements) {
    let totalWords = 0;

    elements.forEach(el => {
      if (el.content) {
        // Count words in content
        const words = el.content.trim().split(/\s+/).length;
        totalWords += words;
      } else if (el.type === 'text') {
        // Estimate based on area (rough: 10 chars per square inch)
        const areaInches = (el.area || 0) / (72 * 72);  // 72 pts per inch
        const estimatedChars = areaInches * 10 * 66;  // 66 chars per line
        totalWords += estimatedChars / 5;  // Average 5 chars per word
      }
    });

    return Math.round(totalWords);
  }

  /**
   * Calculate content complexity
   */
  calculateComplexity(elements) {
    const factors = {
      elementCount: Math.min(elements.length / 10, 1.0),
      typeVariety: new Set(elements.map(el => el.type)).size / 5,
      hierarchyLevels: new Set(elements.map(el => el.hierarchyLevel)).size / 5
    };

    return (factors.elementCount + factors.typeVariety + factors.hierarchyLevels) / 3;
  }

  /**
   * Classify pacing based on metrics
   */
  classifyPacing(whitespaceRatio, textImageRatio, complexityScore) {
    // Dense text, low whitespace → fast
    if (whitespaceRatio < 0.3 && textImageRatio > 3) {
      return 'fast';
    }

    // Lots of whitespace, balanced content → slow
    if (whitespaceRatio > 0.5 && textImageRatio < 2) {
      return 'slow';
    }

    // Moderate whitespace → moderate
    if (whitespaceRatio >= 0.3 && whitespaceRatio <= 0.5) {
      return 'moderate';
    }

    // High complexity → varied
    if (complexityScore > 0.6) {
      return 'varied';
    }

    return 'moderate';
  }

  /**
   * Select optimal pacing strategy
   */
  selectStrategy(analysis) {
    const { classification, estimatedReadingTime } = analysis;

    // Short documents can be fast
    if (estimatedReadingTime < 3) {
      return this.strategies.fast;
    }

    // Long documents need variation
    if (estimatedReadingTime > 15) {
      return this.strategies.varied;
    }

    // Use classification
    return this.strategies[classification] || this.strategies.moderate;
  }

  /**
   * Calculate pacing for each page/section
   */
  calculatePagePacing(layout, strategy) {
    const elements = layout.elements || [];

    // Group elements by page/section (simplified: treat as single page)
    const pages = [{ elements }];

    return pages.map((page, idx) => {
      const wordCount = this.estimateWordCount(page.elements);
      const readingTime = wordCount / this.options.averageReadingSpeed;

      // Calculate tempo
      const density = this.calculatePageDensity(page.elements, layout.page);
      const tempo = this.calculateTempo(density, strategy);

      // Calculate visual breaks
      const visualBreaks = this.countVisualBreaks(page.elements);

      return {
        page: idx + 1,
        wordCount,
        readingTime,
        density,
        tempo,
        tempoLabel: this.getTempoLabel(tempo),
        visualBreaks,
        breathingPoints: visualBreaks > wordCount / 200  // One break per ~200 words
      };
    });
  }

  /**
   * Calculate page density
   */
  calculatePageDensity(elements, page) {
    const contentArea = elements.reduce((sum, el) => sum + (el.area || 0), 0);
    const pageArea = page.width * page.height;

    return contentArea / pageArea;
  }

  /**
   * Calculate tempo from density and strategy
   */
  calculateTempo(density, strategy) {
    // Base tempo from density
    let tempo = 0.5;

    if (density > 0.7) tempo = 0.9;  // Dense → fast
    else if (density > 0.5) tempo = 0.7;
    else if (density > 0.3) tempo = 0.5;
    else tempo = 0.3;  // Sparse → slow

    // Adjust for strategy
    const strategyModifier = {
      'Fast Pacing': 1.2,
      'Moderate Pacing': 1.0,
      'Slow Pacing': 0.7,
      'Varied Pacing': 1.0
    }[strategy.name] || 1.0;

    return Math.min(tempo * strategyModifier, 1.0);
  }

  /**
   * Get tempo label
   */
  getTempoLabel(tempo) {
    if (tempo >= 0.8) return 'very-fast';
    if (tempo >= 0.6) return 'fast';
    if (tempo >= 0.4) return 'moderate';
    if (tempo >= 0.2) return 'slow';
    return 'very-slow';
  }

  /**
   * Count visual breaks (whitespace, images)
   */
  countVisualBreaks(elements) {
    let breaks = 0;

    elements.forEach((el, idx) => {
      // Images are breaks
      if (el.type === 'image' || el.image) {
        breaks++;
      }

      // Large whitespace is a break
      if (el.whitespace?.bottom > 40) {
        breaks++;
      }

      // Hierarchy changes are breaks
      const nextEl = elements[idx + 1];
      if (nextEl && nextEl.hierarchyLevel < el.hierarchyLevel) {
        breaks++;
      }
    });

    return breaks;
  }

  /**
   * Identify optimal breathing points
   */
  identifyBreathingPoints(layout, pagePacing) {
    const elements = layout.elements || [];
    const breathingPoints = [];

    let wordsSinceBreak = 0;
    const breakInterval = 200;  // One break per 200 words

    elements.forEach((el, idx) => {
      const elWordCount = this.estimateWordCount([el]);
      wordsSinceBreak += elWordCount;

      // Need a break?
      if (wordsSinceBreak >= breakInterval) {
        breathingPoints.push({
          afterElement: idx,
          wordsSince: wordsSinceBreak,
          type: 'needed',
          suggestion: 'Add whitespace, image, or section break'
        });
        wordsSinceBreak = 0;
      }

      // Natural breaks (images, large whitespace)
      if (el.type === 'image' || el.whitespace?.bottom > 40) {
        breathingPoints.push({
          afterElement: idx,
          wordsSince: wordsSinceBreak,
          type: 'natural',
          suggestion: null
        });
        wordsSinceBreak = 0;
      }
    });

    return breathingPoints;
  }

  /**
   * Calculate rhythm (pattern of fast/slow)
   */
  calculateRhythm(pagePacing) {
    if (pagePacing.length < 2) {
      return {
        pattern: 'constant',
        variation: 0,
        description: 'Single page - no rhythm'
      };
    }

    const tempos = pagePacing.map(p => p.tempo);

    // Calculate variation
    const mean = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    const variance = tempos.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / tempos.length;
    const stdDev = Math.sqrt(variance);

    // Detect pattern
    const pattern = this.detectRhythmPattern(tempos);

    return {
      pattern,
      variation: stdDev,
      mean,
      description: this.describeRhythm(pattern, stdDev)
    };
  }

  /**
   * Detect rhythm pattern
   */
  detectRhythmPattern(tempos) {
    const variance = this.calculateVariation(tempos);

    // Very low variation → constant
    if (variance < 0.1) return 'constant';

    // Check for alternating (fast-slow-fast-slow)
    let alternating = true;
    for (let i = 1; i < tempos.length - 1; i++) {
      const increasing = tempos[i] > tempos[i - 1];
      const nextIncreasing = tempos[i + 1] > tempos[i];

      if (increasing === nextIncreasing) {
        alternating = false;
        break;
      }
    }

    if (alternating) return 'alternating';

    // Check for crescendo (gradually faster)
    const overallTrend = tempos[tempos.length - 1] - tempos[0];
    if (overallTrend > 0.2) return 'crescendo';
    if (overallTrend < -0.2) return 'decrescendo';

    // Default: varied
    return 'varied';
  }

  calculateVariation(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Describe rhythm in human terms
   */
  describeRhythm(pattern, variation) {
    const descriptions = {
      constant: 'Steady, unchanging pace throughout',
      alternating: 'Dynamic alternating rhythm (fast-slow-fast)',
      crescendo: 'Gradually building tension and speed',
      decrescendo: 'Gradually slowing and calming',
      varied: 'Varied rhythm with multiple tempo changes'
    };

    const intensity = variation > 0.3
      ? ' with strong contrast'
      : variation > 0.15
      ? ' with moderate variation'
      : ' with subtle changes';

    return descriptions[pattern] + intensity;
  }

  /**
   * Generate pacing recommendations
   */
  generateRecommendations(analysis, strategy, rhythm) {
    const recommendations = [];

    // Check for reading fatigue risk
    if (analysis.estimatedReadingTime > 10 && rhythm.variation < 0.1) {
      recommendations.push({
        type: 'fatigue-risk',
        severity: 'medium',
        message: 'Long document with constant pacing may cause reader fatigue',
        suggestion: 'Add visual breaks every 2-3 minutes of reading'
      });
    }

    // Check whitespace ratio
    if (analysis.whitespaceRatio < 0.25) {
      recommendations.push({
        type: 'dense-content',
        severity: 'high',
        message: 'Very dense content with minimal whitespace',
        suggestion: 'Increase whitespace to 30-40% for better readability'
      });
    }

    // Check text-image balance
    if (analysis.textImageRatio > 5 && analysis.estimatedReadingTime > 5) {
      recommendations.push({
        type: 'visual-breaks',
        severity: 'medium',
        message: 'Text-heavy document lacks visual breaks',
        suggestion: 'Add images or graphics every 300-500 words'
      });
    }

    // Check rhythm appropriateness
    if (strategy.name === 'Varied Pacing' && rhythm.pattern === 'constant') {
      recommendations.push({
        type: 'rhythm-mismatch',
        severity: 'low',
        message: 'Strategy calls for varied pacing but rhythm is constant',
        suggestion: 'Vary content density and whitespace across sections'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'optimal',
        severity: 'none',
        message: '✅ Pacing is well optimized',
        suggestion: null
      });
    }

    return recommendations;
  }

  /**
   * Calculate pacing metrics
   */
  calculateMetrics(pagePacing, rhythm) {
    const avgTempo = pagePacing.reduce((sum, p) => sum + p.tempo, 0) / pagePacing.length;
    const avgDensity = pagePacing.reduce((sum, p) => sum + p.density, 0) / pagePacing.length;
    const totalReadingTime = pagePacing.reduce((sum, p) => sum + p.readingTime, 0);

    return {
      averageTempo: avgTempo,
      averageDensity: avgDensity,
      totalReadingTime: `${totalReadingTime.toFixed(1)} minutes`,
      rhythmVariation: rhythm.variation,
      engagementScore: this.calculateEngagementScore(avgTempo, rhythm.variation, avgDensity)
    };
  }

  /**
   * Calculate engagement score (0-10)
   */
  calculateEngagementScore(avgTempo, rhythmVariation, avgDensity) {
    // Optimal: moderate tempo, varied rhythm, balanced density
    const tempoScore = 10 - Math.abs(avgTempo - 0.5) * 20;  // Best at 0.5
    const rhythmScore = Math.min(rhythmVariation * 30, 10);  // More variation is better (to a point)
    const densityScore = 10 - Math.abs(avgDensity - 0.45) * 20;  // Best around 0.45

    const overall = (tempoScore * 0.3 + rhythmScore * 0.4 + densityScore * 0.3);

    return Math.max(0, Math.min(overall, 10));
  }

  /**
   * Generate pacing report
   */
  generateReport(optimizedLayout) {
    const pacing = optimizedLayout.pacing;

    return {
      strategy: pacing.strategy,
      readingTime: pacing.analysis.estimatedReadingTime.toFixed(1) + ' minutes',
      wordCount: pacing.analysis.totalWords,
      rhythm: pacing.rhythm.description,
      metrics: {
        contentDensity: `${(pacing.analysis.contentDensity * 100).toFixed(1)}%`,
        whitespace: `${(pacing.analysis.whitespaceRatio * 100).toFixed(1)}%`,
        engagement: `${pacing.metrics.engagementScore.toFixed(1)}/10`
      },
      breathingPoints: {
        total: pacing.breathingPoints.length,
        natural: pacing.breathingPoints.filter(bp => bp.type === 'natural').length,
        needed: pacing.breathingPoints.filter(bp => bp.type === 'needed').length
      },
      recommendations: pacing.recommendations.map(r => ({
        message: r.message,
        suggestion: r.suggestion
      }))
    };
  }
}

module.exports = PacingEngine;
