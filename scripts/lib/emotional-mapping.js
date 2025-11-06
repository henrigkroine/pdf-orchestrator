/**
 * Emotional Mapping
 *
 * Maps emotional journey throughout document and applies
 * appropriate visual treatments to evoke target emotions.
 *
 * Uses color psychology, typography, imagery, and spacing
 * to create emotional resonance with readers.
 *
 * @module emotional-mapping
 */

class EmotionalMapping {
  constructor(options = {}) {
    this.options = {
      targetAudience: options.targetAudience || 'general',
      culturalContext: options.culturalContext || 'western',
      debug: options.debug || false
    };

    // Core emotions and their visual expressions
    this.emotions = {
      trust: {
        name: 'Trust',
        colors: ['#00393F', '#C9E4EC', '#EFE1DC'],  // Nordshore, Sky, Beige
        colorPsychology: 'Blue = stability, teal = professional',
        typography: {
          family: 'serif',
          weight: 'regular',
          style: 'clear-honest',
          letterSpacing: 'normal'
        },
        imagery: 'authentic-people-handshakes',
        whitespace: 'comfortable',
        shapes: 'rounded-stable',
        texture: 'smooth-polished',
        intensity: 0.6
      },

      hope: {
        name: 'Hope',
        colors: ['#C9E4EC', '#FFF1E2', '#BA8F5A'],  // Sky, Sand, Gold
        colorPsychology: 'Light blues = optimism, warm tones = possibility',
        typography: {
          family: 'sans-serif',
          weight: 'light',
          style: 'open-flowing',
          letterSpacing: 'loose'
        },
        imagery: 'upward-sunrise-growth',
        whitespace: 'generous',
        shapes: 'organic-flowing',
        texture: 'soft-airy',
        intensity: 0.7
      },

      urgency: {
        name: 'Urgency',
        colors: ['#913B2F', '#BA8F5A', '#00393F'],  // Clay, Gold, Nordshore
        colorPsychology: 'Warm reds = action, contrast = attention',
        typography: {
          family: 'sans-serif',
          weight: 'bold',
          style: 'strong-direct',
          letterSpacing: 'tight'
        },
        imagery: 'sharp-focused-clock',
        whitespace: 'minimal',
        shapes: 'angular-dynamic',
        texture: 'rough-energetic',
        intensity: 1.0
      },

      calm: {
        name: 'Calm',
        colors: ['#C9E4EC', '#FFF1E2', '#EFE1DC'],  // Sky, Sand, Beige
        colorPsychology: 'Pastels = peace, neutrals = quiet',
        typography: {
          family: 'serif',
          weight: 'light',
          style: 'gentle-flowing',
          letterSpacing: 'loose'
        },
        imagery: 'soft-nature-peaceful',
        whitespace: 'abundant',
        shapes: 'organic-rounded',
        texture: 'soft-matte',
        intensity: 0.3
      },

      excitement: {
        name: 'Excitement',
        colors: ['#BA8F5A', '#C9E4EC', '#65873B'],  // Gold, Sky, Moss
        colorPsychology: 'Bright colors = energy, variety = stimulation',
        typography: {
          family: 'sans-serif',
          weight: 'bold',
          style: 'bold-expressive',
          letterSpacing: 'varied'
        },
        imagery: 'dynamic-celebration-action',
        whitespace: 'balanced',
        shapes: 'dynamic-varied',
        texture: 'vibrant-glossy',
        intensity: 0.9
      },

      concern: {
        name: 'Concern',
        colors: ['#00393F', '#65873B', '#913B2F'],  // Nordshore, Moss, Clay
        colorPsychology: 'Dark tones = seriousness, earth tones = grounding',
        typography: {
          family: 'serif',
          weight: 'medium',
          style: 'solid-weighted',
          letterSpacing: 'normal'
        },
        imagery: 'serious-problem-challenge',
        whitespace: 'tight',
        shapes: 'structured-rigid',
        texture: 'solid-heavy',
        intensity: 0.7
      },

      empowerment: {
        name: 'Empowerment',
        colors: ['#BA8F5A', '#00393F', '#C9E4EC'],  // Gold, Nordshore, Sky
        colorPsychology: 'Gold = achievement, strong contrast = confidence',
        typography: {
          family: 'sans-serif',
          weight: 'semibold',
          style: 'confident-clear',
          letterSpacing: 'normal'
        },
        imagery: 'success-achievement-leadership',
        whitespace: 'structured',
        shapes: 'strong-geometric',
        texture: 'premium-refined',
        intensity: 0.8
      },

      joy: {
        name: 'Joy',
        colors: ['#FFF1E2', '#C9E4EC', '#BA8F5A'],  // Sand, Sky, Gold
        colorPsychology: 'Warm pastels = happiness, brightness = positivity',
        typography: {
          family: 'sans-serif',
          weight: 'regular',
          style: 'friendly-warm',
          letterSpacing: 'loose'
        },
        imagery: 'smiles-celebration-connection',
        whitespace: 'generous',
        shapes: 'rounded-playful',
        texture: 'warm-inviting',
        intensity: 0.8
      }
    };

    // Emotional journey templates
    this.journeys = {
      persuasion: {
        name: 'Persuasion Journey',
        stages: [
          { emotion: 'concern', description: 'Identify problem' },
          { emotion: 'urgency', description: 'Amplify need' },
          { emotion: 'hope', description: 'Present solution' },
          { emotion: 'trust', description: 'Build credibility' },
          { emotion: 'empowerment', description: 'Call to action' }
        ]
      },
      transformation: {
        name: 'Transformation Journey',
        stages: [
          { emotion: 'calm', description: 'Starting point' },
          { emotion: 'concern', description: 'Challenge arises' },
          { emotion: 'hope', description: 'Path forward' },
          { emotion: 'excitement', description: 'Progress made' },
          { emotion: 'joy', description: 'Success achieved' }
        ]
      },
      educational: {
        name: 'Educational Journey',
        stages: [
          { emotion: 'calm', description: 'Introduction' },
          { emotion: 'trust', description: 'Build foundation' },
          { emotion: 'excitement', description: 'New concepts' },
          { emotion: 'empowerment', description: 'Application' },
          { emotion: 'hope', description: 'Next steps' }
        ]
      }
    };
  }

  /**
   * Map emotional journey for document
   */
  mapEmotionalJourney(documentContent, targetJourney = null) {
    if (this.options.debug) {
      console.log('😊 Mapping emotional journey...');
    }

    // Select journey template
    const journey = targetJourney
      ? this.journeys[targetJourney]
      : this.detectJourney(documentContent);

    if (!journey) {
      throw new Error(`Unknown journey: ${targetJourney}`);
    }

    // Map content to emotional stages
    const stages = this.mapContentToStages(documentContent, journey);

    // Apply visual treatments
    const withVisuals = this.applyVisualTreatments(stages);

    // Calculate emotional intensity curve
    const intensityCurve = this.calculateIntensityCurve(withVisuals);

    // Generate transitions
    const withTransitions = this.createEmotionalTransitions(withVisuals);

    return {
      journey: journey.name,
      stages: withTransitions,
      intensityCurve,
      metrics: this.calculateEmotionalMetrics(withTransitions, intensityCurve)
    };
  }

  /**
   * Detect emotional journey from content
   */
  detectJourney(documentContent) {
    const content = JSON.stringify(documentContent).toLowerCase();

    // Persuasion indicators
    if (content.includes('problem') && content.includes('solution')) {
      return this.journeys.persuasion;
    }

    // Transformation indicators
    if (content.includes('before') && content.includes('after')) {
      return this.journeys.transformation;
    }

    // Educational indicators
    if (content.includes('learn') || content.includes('understand')) {
      return this.journeys.educational;
    }

    // Default: persuasion (most versatile)
    return this.journeys.persuasion;
  }

  /**
   * Map content to emotional stages
   */
  mapContentToStages(documentContent, journey) {
    const blocks = documentContent.blocks || [];
    const stages = journey.stages;

    const blocksPerStage = Math.ceil(blocks.length / stages.length);

    return stages.map((stage, idx) => {
      const startIdx = idx * blocksPerStage;
      const endIdx = Math.min(startIdx + blocksPerStage, blocks.length);
      const stageBlocks = blocks.slice(startIdx, endIdx);

      return {
        stageNumber: idx + 1,
        emotion: stage.emotion,
        emotionName: this.emotions[stage.emotion]?.name || stage.emotion,
        description: stage.description,
        blocks: stageBlocks,
        content: stageBlocks.map(b => b.content).join('\n')
      };
    });
  }

  /**
   * Apply visual treatments based on emotions
   */
  applyVisualTreatments(stages) {
    return stages.map(stage => {
      const emotion = this.emotions[stage.emotion] || this.emotions.trust;

      return {
        ...stage,
        visualTreatment: {
          colors: emotion.colors,
          primaryColor: emotion.colors[0],
          secondaryColor: emotion.colors[1],
          accentColor: emotion.colors[2],
          typography: emotion.typography,
          imagery: emotion.imagery,
          whitespace: emotion.whitespace,
          shapes: emotion.shapes,
          texture: emotion.texture
        },
        intensity: emotion.intensity,
        colorPsychology: emotion.colorPsychology
      };
    });
  }

  /**
   * Calculate emotional intensity curve
   */
  calculateIntensityCurve(stages) {
    const curve = stages.map((stage, idx) => ({
      stage: idx + 1,
      emotion: stage.emotionName,
      intensity: stage.intensity,
      position: idx / (stages.length - 1)  // 0 to 1
    }));

    // Calculate smoothness
    const changes = [];
    for (let i = 1; i < curve.length; i++) {
      changes.push(Math.abs(curve[i].intensity - curve[i - 1].intensity));
    }

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

    return {
      curve,
      smoothness: 1 - avgChange,  // Lower change = smoother
      peakIntensity: Math.max(...curve.map(c => c.intensity)),
      valleyIntensity: Math.min(...curve.map(c => c.intensity)),
      range: Math.max(...curve.map(c => c.intensity)) - Math.min(...curve.map(c => c.intensity))
    };
  }

  /**
   * Create transitions between emotional stages
   */
  createEmotionalTransitions(stages) {
    return stages.map((stage, idx) => {
      const nextStage = stages[idx + 1];

      if (!nextStage) {
        return { ...stage, transition: null };
      }

      const transition = {
        from: stage.emotion,
        to: nextStage.emotion,
        type: this.determineTransitionType(stage, nextStage),
        technique: this.selectTransitionTechnique(stage, nextStage),
        duration: this.calculateTransitionDuration(stage, nextStage)
      };

      return { ...stage, transition };
    });
  }

  /**
   * Determine transition type
   */
  determineTransitionType(fromStage, toStage) {
    const intensityChange = toStage.intensity - fromStage.intensity;

    if (Math.abs(intensityChange) < 0.2) {
      return 'subtle';  // Similar emotions
    }

    if (intensityChange > 0.4) {
      return 'amplifying';  // Building intensity
    }

    if (intensityChange < -0.4) {
      return 'calming';  // Reducing intensity
    }

    return 'shifting';  // Different emotions, similar intensity
  }

  /**
   * Select transition technique
   */
  selectTransitionTechnique(fromStage, toStage) {
    const type = this.determineTransitionType(fromStage, toStage);

    const techniques = {
      subtle: 'color-gradient',
      amplifying: 'progressive-reveal',
      calming: 'fade-dissolve',
      shifting: 'cross-dissolve'
    };

    return techniques[type];
  }

  /**
   * Calculate transition duration (visual pacing)
   */
  calculateTransitionDuration(fromStage, toStage) {
    const intensityChange = Math.abs(toStage.intensity - fromStage.intensity);

    // Bigger emotional shifts need more gradual transitions
    if (intensityChange > 0.5) {
      return 'long';  // Multiple paragraphs
    }

    if (intensityChange > 0.3) {
      return 'medium';  // One paragraph
    }

    return 'short';  // Single sentence or visual element
  }

  /**
   * Apply emotion to layout element
   */
  applyEmotionToElement(element, emotion) {
    const emotionData = this.emotions[emotion] || this.emotions.trust;

    return {
      ...element,
      color: emotionData.colors[0],
      fontFamily: emotionData.typography.family === 'serif' ? 'Lora' : 'Roboto Flex',
      fontWeight: this.mapTypographyWeight(emotionData.typography.weight),
      letterSpacing: this.mapLetterSpacing(emotionData.typography.letterSpacing),
      emotionalTone: emotion,
      visualIntensity: emotionData.intensity
    };
  }

  /**
   * Map typography weight to actual values
   */
  mapTypographyWeight(weight) {
    const weights = {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    };

    return weights[weight] || 400;
  }

  /**
   * Map letter spacing to actual values
   */
  mapLetterSpacing(spacing) {
    const spacings = {
      tight: -0.5,
      normal: 0,
      loose: 1.0,
      varied: 0.5
    };

    return spacings[spacing] || 0;
  }

  /**
   * Analyze emotional impact
   */
  analyzeEmotionalImpact(content) {
    const words = content.toLowerCase().split(/\s+/);

    // Emotion keywords
    const keywords = {
      hope: ['future', 'possibility', 'dream', 'aspire', 'achieve', 'better', 'improve'],
      concern: ['problem', 'challenge', 'difficult', 'struggle', 'crisis', 'issue', 'concern'],
      urgency: ['now', 'immediately', 'critical', 'urgent', 'quick', 'fast', 'deadline'],
      trust: ['reliable', 'proven', 'trusted', 'authentic', 'honest', 'transparent'],
      excitement: ['amazing', 'incredible', 'fantastic', 'exciting', 'breakthrough'],
      empowerment: ['power', 'control', 'enable', 'empower', 'strengthen', 'capable'],
      joy: ['happy', 'joy', 'celebrate', 'smile', 'delighted', 'wonderful'],
      calm: ['peace', 'calm', 'serene', 'quiet', 'gentle', 'soft']
    };

    const scores = {};

    Object.entries(keywords).forEach(([emotion, emotionWords]) => {
      const matches = words.filter(word =>
        emotionWords.some(kw => word.includes(kw))
      ).length;

      scores[emotion] = matches / words.length;
    });

    // Find dominant emotion
    const dominant = Object.entries(scores).reduce((max, [emotion, score]) =>
      score > max.score ? { emotion, score } : max
    , { emotion: 'trust', score: 0 });

    return {
      scores,
      dominant: dominant.emotion,
      dominantScore: dominant.score,
      emotionalRange: Object.values(scores).filter(s => s > 0).length
    };
  }

  /**
   * Calculate emotional metrics
   */
  calculateEmotionalMetrics(stages, intensityCurve) {
    const emotions = stages.map(s => s.emotion);
    const uniqueEmotions = new Set(emotions);

    return {
      emotionalRange: uniqueEmotions.size,
      averageIntensity: stages.reduce((sum, s) => sum + s.intensity, 0) / stages.length,
      peakEmotion: stages.find(s => s.intensity === intensityCurve.peakIntensity)?.emotionName,
      curveSmoothness: intensityCurve.smoothness,
      emotionalVariety: uniqueEmotions.size / Object.keys(this.emotions).length,
      resonanceScore: this.calculateResonanceScore(stages, intensityCurve)
    };
  }

  /**
   * Calculate emotional resonance score (0-10)
   */
  calculateResonanceScore(stages, intensityCurve) {
    // Good resonance = clear arc, appropriate variety, smooth transitions
    const rangeScore = Math.min(intensityCurve.range / 0.7, 1.0) * 10;  // 0.7 range is ideal
    const smoothnessScore = intensityCurve.smoothness * 10;
    const varietyScore = Math.min(stages.length / 5, 1.0) * 10;  // 5 stages is ideal

    return (rangeScore * 0.4 + smoothnessScore * 0.3 + varietyScore * 0.3);
  }

  /**
   * Generate color palette from emotions
   */
  generateColorPalette(emotions) {
    const allColors = [];

    emotions.forEach(emotion => {
      const emotionData = this.emotions[emotion];
      if (emotionData) {
        allColors.push(...emotionData.colors);
      }
    });

    // Deduplicate and select dominant colors
    const uniqueColors = [...new Set(allColors)];

    return {
      primary: uniqueColors[0] || '#00393F',
      secondary: uniqueColors[1] || '#C9E4EC',
      accent: uniqueColors[2] || '#BA8F5A',
      all: uniqueColors
    };
  }

  /**
   * Generate emotional mapping report
   */
  generateReport(emotionalJourney) {
    return {
      journey: emotionalJourney.journey,
      stages: emotionalJourney.stages.map((stage, idx) => ({
        stage: idx + 1,
        emotion: stage.emotionName,
        description: stage.description,
        intensity: stage.intensity,
        colors: stage.visualTreatment.colors,
        transition: stage.transition?.type || 'none'
      })),
      curve: {
        smoothness: `${(emotionalJourney.intensityCurve.smoothness * 100).toFixed(1)}%`,
        range: emotionalJourney.intensityCurve.range.toFixed(2),
        peak: emotionalJourney.metrics.peakEmotion
      },
      metrics: {
        emotionalRange: emotionalJourney.metrics.emotionalRange,
        averageIntensity: emotionalJourney.metrics.averageIntensity.toFixed(2),
        resonanceScore: `${emotionalJourney.metrics.resonanceScore.toFixed(1)}/10`,
        variety: `${(emotionalJourney.metrics.emotionalVariety * 100).toFixed(1)}%`
      },
      summary: this.generateSummary(emotionalJourney)
    };
  }

  generateSummary(journey) {
    const score = journey.metrics.resonanceScore;

    if (score >= 8) {
      return '✅ Exceptional emotional journey - will create strong reader connection';
    }

    if (score >= 6) {
      return '⚠️  Good emotional arc with room for enhancement';
    }

    return '❌ Emotional journey needs refinement for better impact';
  }
}

module.exports = EmotionalMapping;
