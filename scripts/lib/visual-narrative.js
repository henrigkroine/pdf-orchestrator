/**
 * Visual Narrative
 *
 * Maps content to story arcs and creates visual storytelling flows
 * that guide readers through an emotional journey.
 *
 * Implements:
 * - Classic story arc (5 acts)
 * - Hero's journey (12 stages)
 * - Problem-solution arc
 * - Emotional journey mapping
 * - Visual treatment per story stage
 *
 * @module visual-narrative
 */

const Anthropic = require('@anthropic-ai/sdk');

class VisualNarrative {
  constructor(options = {}) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Story arc templates
    this.storyArcs = {
      classic: {
        name: 'Classic 5-Act Structure',
        stages: ['exposition', 'rising', 'climax', 'falling', 'resolution'],
        description: 'Traditional narrative structure (Freytag\'s Pyramid)',
        bestFor: 'General purpose, educational content'
      },
      hero: {
        name: 'Hero\'s Journey',
        stages: [
          'ordinary-world', 'call-to-adventure', 'refusal', 'mentor',
          'threshold', 'tests', 'ordeal', 'reward',
          'road-back', 'resurrection', 'return', 'master'
        ],
        description: 'Joseph Campbell\'s monomyth (12 stages)',
        bestFor: 'Transformation stories, case studies'
      },
      problemSolution: {
        name: 'Problem-Solution-Benefit',
        stages: ['problem', 'agitation', 'solution', 'proof', 'call-to-action'],
        description: 'Marketing and persuasion framework',
        bestFor: 'Partnership proposals, sales documents'
      },
      before-after: {
        name: 'Before-After-Bridge',
        stages: ['before', 'after', 'bridge', 'call-to-action'],
        description: 'Show the transformation',
        bestFor: 'Case studies, impact reports'
      },
      educational: {
        name: 'Educational Arc',
        stages: ['hook', 'background', 'concepts', 'application', 'summary', 'next-steps'],
        description: 'Learning-focused structure',
        bestFor: 'White papers, guides, tutorials'
      }
    };

    // Visual treatments for each story stage
    this.visualTreatments = {
      // Classic arc treatments
      exposition: {
        layout: 'hero-full-width',
        imagery: 'large-impactful',
        typography: { headline: 42, body: 14 },
        color: 'brand-primary',
        mood: 'inviting',
        spacing: 'generous',
        contrast: 'high',
        visualWeight: 'heavy'
      },
      rising: {
        layout: 'two-column',
        imagery: 'supporting-medium',
        typography: { headline: 28, body: 11 },
        color: 'building-tension',
        mood: 'curious',
        spacing: 'balanced',
        contrast: 'medium',
        visualWeight: 'medium'
      },
      climax: {
        layout: 'centered-focus',
        imagery: 'hero-statement',
        typography: { headline: 48, body: 12 },
        color: 'high-contrast',
        mood: 'impactful',
        spacing: 'dramatic',
        contrast: 'very-high',
        visualWeight: 'very-heavy'
      },
      falling: {
        layout: 'asymmetric',
        imagery: 'supporting-small',
        typography: { headline: 24, body: 11 },
        color: 'cooling-down',
        mood: 'reflective',
        spacing: 'relaxed',
        contrast: 'medium',
        visualWeight: 'light'
      },
      resolution: {
        layout: 'balanced-grid',
        imagery: 'uplifting',
        typography: { headline: 32, body: 12 },
        color: 'warm-inviting',
        mood: 'hopeful',
        spacing: 'comfortable',
        contrast: 'medium-high',
        visualWeight: 'medium'
      },

      // Hero's journey treatments
      'ordinary-world': {
        layout: 'simple-centered',
        imagery: 'relatable',
        color: 'neutral',
        mood: 'familiar'
      },
      'call-to-adventure': {
        layout: 'dynamic',
        imagery: 'exciting',
        color: 'accent',
        mood: 'intriguing'
      },

      // Problem-solution treatments
      problem: {
        layout: 'heavy-text',
        imagery: 'challenging',
        color: 'muted',
        mood: 'concerned'
      },
      agitation: {
        layout: 'tense',
        imagery: 'urgent',
        color: 'intense',
        mood: 'urgent'
      },
      solution: {
        layout: 'clear-breakthrough',
        imagery: 'enlightening',
        color: 'bright',
        mood: 'relieved'
      },
      proof: {
        layout: 'data-driven',
        imagery: 'evidence',
        color: 'credible',
        mood: 'confident'
      },
      'call-to-action': {
        layout: 'focused-cta',
        imagery: 'motivating',
        color: 'action',
        mood: 'empowering'
      }
    };

    // Emotion-to-visual mappings
    this.emotionMappings = {
      hope: {
        colors: ['#C9E4EC', '#FFF1E2', '#BA8F5A'],  // Sky, Sand, Gold
        imagery: 'upward-light',
        whitespace: 'generous',
        typography: 'open-flowing'
      },
      concern: {
        colors: ['#00393F', '#65873B'],  // Nordshore, Moss
        imagery: 'serious-grounded',
        whitespace: 'tight',
        typography: 'solid-weighted'
      },
      excitement: {
        colors: ['#BA8F5A', '#C9E4EC'],  // Gold, Sky
        imagery: 'dynamic-energetic',
        whitespace: 'balanced',
        typography: 'bold-expressive'
      },
      trust: {
        colors: ['#00393F', '#C9E4EC'],  // Nordshore, Sky
        imagery: 'stable-authentic',
        whitespace: 'comfortable',
        typography: 'clear-honest'
      },
      urgency: {
        colors: ['#913B2F', '#BA8F5A'],  // Clay, Gold
        imagery: 'sharp-focused',
        whitespace: 'minimal',
        typography: 'strong-direct'
      },
      calm: {
        colors: ['#C9E4EC', '#FFF1E2'],  // Sky, Sand
        imagery: 'soft-peaceful',
        whitespace: 'abundant',
        typography: 'gentle-flowing'
      }
    };

    this.options = {
      enableAI: options.enableAI !== false,
      model: options.model || 'claude-opus-4-20250514',
      debug: options.debug || false
    };
  }

  /**
   * Create narrative flow from document content
   */
  async createNarrativeFlow(documentContent, options = {}) {
    if (this.options.debug) {
      console.log('📖 Creating narrative flow...');
    }

    try {
      // Step 1: Select story arc
      const arc = this.selectStoryArc(documentContent, options.preferredArc);

      // Step 2: Map content to arc stages
      const mapping = await this.mapContentToArc(documentContent, arc);

      // Step 3: Design visual treatment for each stage
      const visualFlow = this.designVisualFlow(mapping, arc);

      // Step 4: Create transitions between stages
      const withTransitions = this.designTransitions(visualFlow);

      // Step 5: Map emotional journey
      const emotionalJourney = this.mapEmotionalJourney(withTransitions);

      // Step 6: Optimize pacing
      const withPacing = this.optimizePacing(withTransitions, emotionalJourney);

      // Step 7: AI refinement (optional)
      let final = withPacing;
      if (this.options.enableAI && options.refineWithAI !== false) {
        final = await this.refineWithAI(withPacing, documentContent);
      }

      return {
        arc: arc.name,
        stages: final.pages.length,
        pages: final.pages,
        emotionalJourney,
        overallPacing: final.pacing,
        metrics: this.calculateNarrativeMetrics(final)
      };

    } catch (error) {
      console.error('❌ Narrative flow creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Select optimal story arc based on content
   */
  selectStoryArc(documentContent, preferredArc = null) {
    // User preference takes priority
    if (preferredArc && this.storyArcs[preferredArc]) {
      return this.storyArcs[preferredArc];
    }

    // Analyze content to determine best arc
    const { type, purpose, tone } = this.analyzeContent(documentContent);

    // Partnership proposals → problem-solution
    if (purpose === 'partnership' || purpose === 'proposal') {
      return this.storyArcs.problemSolution;
    }

    // Case studies → hero's journey or before-after
    if (type === 'case-study' || purpose === 'transformation') {
      return this.storyArcs.hero;
    }

    // Educational content → educational arc
    if (type === 'educational' || purpose === 'teaching') {
      return this.storyArcs.educational;
    }

    // Default: classic 5-act structure (most versatile)
    return this.storyArcs.classic;
  }

  /**
   * Analyze content characteristics
   */
  analyzeContent(documentContent) {
    const content = JSON.stringify(documentContent).toLowerCase();

    // Detect type
    let type = 'general';
    if (content.includes('case study') || content.includes('success story')) {
      type = 'case-study';
    } else if (content.includes('learn') || content.includes('guide')) {
      type = 'educational';
    } else if (content.includes('report') || content.includes('analysis')) {
      type = 'analytical';
    }

    // Detect purpose
    let purpose = 'inform';
    if (content.includes('partnership') || content.includes('collaborate')) {
      purpose = 'partnership';
    } else if (content.includes('before') && content.includes('after')) {
      purpose = 'transformation';
    } else if (content.includes('learn') || content.includes('understand')) {
      purpose = 'teaching';
    }

    // Detect tone
    let tone = 'neutral';
    if (content.includes('urgent') || content.includes('critical')) {
      tone = 'urgent';
    } else if (content.includes('hope') || content.includes('empowering')) {
      tone = 'inspiring';
    } else if (content.includes('professional') || content.includes('business')) {
      tone = 'formal';
    }

    return { type, purpose, tone };
  }

  /**
   * Map content blocks to story arc stages
   */
  async mapContentToArc(documentContent, arc) {
    const blocks = documentContent.blocks || [];
    const stages = arc.stages;

    // Simple mapping: divide blocks evenly across stages
    const blocksPerStage = Math.ceil(blocks.length / stages.length);

    const mapping = stages.map((stageName, idx) => {
      const startIdx = idx * blocksPerStage;
      const endIdx = Math.min(startIdx + blocksPerStage, blocks.length);
      const stageBlocks = blocks.slice(startIdx, endIdx);

      return {
        stage: stageName,
        stageNumber: idx + 1,
        totalStages: stages.length,
        blocks: stageBlocks,
        content: stageBlocks.map(b => b.content).join('\n')
      };
    });

    return mapping;
  }

  /**
   * Design visual flow for each stage
   */
  designVisualFlow(mapping, arc) {
    const pages = mapping.map((stage, idx) => {
      const treatment = this.visualTreatments[stage.stage] || this.visualTreatments.exposition;

      return {
        pageNumber: idx + 1,
        stage: stage.stage,
        stageName: this.humanizeStage(stage.stage),
        blocks: stage.blocks,
        visualTreatment: treatment,
        emotionalTone: this.determineEmotionalTone(stage.stage),
        narrativePosition: idx / mapping.length,  // 0 to 1
        importance: this.calculateStageImportance(stage.stage, arc)
      };
    });

    return { pages, arc: arc.name };
  }

  /**
   * Humanize stage name
   */
  humanizeStage(stageName) {
    return stageName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Determine emotional tone for stage
   */
  determineEmotionalTone(stageName) {
    const emotionMap = {
      exposition: 'hope',
      rising: 'concern',
      climax: 'excitement',
      falling: 'trust',
      resolution: 'hope',
      problem: 'concern',
      agitation: 'urgency',
      solution: 'excitement',
      proof: 'trust',
      'call-to-action': 'hope',
      'ordinary-world': 'calm',
      'call-to-adventure': 'excitement'
    };

    return emotionMap[stageName] || 'neutral';
  }

  /**
   * Calculate stage importance (for visual weight)
   */
  calculateStageImportance(stageName, arc) {
    // Climax and resolution are most important
    const importanceMap = {
      exposition: 0.8,
      rising: 0.6,
      climax: 1.0,
      falling: 0.5,
      resolution: 0.9,
      problem: 0.7,
      agitation: 0.8,
      solution: 1.0,
      proof: 0.9,
      'call-to-action': 1.0
    };

    return importanceMap[stageName] || 0.5;
  }

  /**
   * Design transitions between stages
   */
  designTransitions(visualFlow) {
    const pages = visualFlow.pages.map((page, idx) => {
      const nextPage = visualFlow.pages[idx + 1];

      if (!nextPage) {
        return { ...page, transition: null };
      }

      const transition = {
        type: this.selectTransitionType(page, nextPage),
        visual: this.createVisualBridge(page, nextPage),
        colorProgression: this.progressColor(page, nextPage),
        pacingShift: this.calculatePacingShift(page, nextPage)
      };

      return { ...page, transition };
    });

    return { ...visualFlow, pages };
  }

  /**
   * Select transition type
   */
  selectTransitionType(currentPage, nextPage) {
    const currentEmotion = currentPage.emotionalTone;
    const nextEmotion = nextPage.emotionalTone;

    // Same emotion → subtle
    if (currentEmotion === nextEmotion) {
      return 'subtle-flow';
    }

    // Intensifying → build
    if (this.isIntensifying(currentEmotion, nextEmotion)) {
      return 'build-tension';
    }

    // De-intensifying → release
    if (this.isDeintensifying(currentEmotion, nextEmotion)) {
      return 'release-tension';
    }

    // Contrast → dramatic
    return 'dramatic-shift';
  }

  isIntensifying(from, to) {
    const intensity = {
      calm: 1,
      hope: 2,
      concern: 3,
      trust: 2,
      urgency: 4,
      excitement: 4
    };

    return intensity[to] > intensity[from];
  }

  isDeintensifying(from, to) {
    const intensity = {
      calm: 1,
      hope: 2,
      concern: 3,
      trust: 2,
      urgency: 4,
      excitement: 4
    };

    return intensity[to] < intensity[from];
  }

  /**
   * Create visual bridge between pages
   */
  createVisualBridge(currentPage, nextPage) {
    return {
      element: 'gradient-overlay',
      fromColor: this.getStageColor(currentPage.emotionalTone),
      toColor: this.getStageColor(nextPage.emotionalTone),
      technique: 'color-bleed',
      description: `Transition from ${currentPage.stageName} to ${nextPage.stageName}`
    };
  }

  /**
   * Get color for emotional tone
   */
  getStageColor(emotionalTone) {
    const mapping = this.emotionMappings[emotionalTone] || this.emotionMappings.calm;
    return mapping.colors[0];
  }

  /**
   * Progress color between stages
   */
  progressColor(currentPage, nextPage) {
    const currentColors = this.emotionMappings[currentPage.emotionalTone]?.colors || ['#000000'];
    const nextColors = this.emotionMappings[nextPage.emotionalTone]?.colors || ['#000000'];

    return {
      from: currentColors[0],
      to: nextColors[0],
      steps: 5,  // Gradual transition
      method: 'linear-interpolation'
    };
  }

  /**
   * Calculate pacing shift
   */
  calculatePacingShift(currentPage, nextPage) {
    const currentImportance = currentPage.importance;
    const nextImportance = nextPage.importance;

    const shift = nextImportance - currentImportance;

    if (shift > 0.2) return 'accelerate';
    if (shift < -0.2) return 'decelerate';
    return 'maintain';
  }

  /**
   * Map emotional journey across document
   */
  mapEmotionalJourney(visualFlow) {
    return visualFlow.pages.map((page, idx) => {
      const emotion = page.emotionalTone;
      const intensity = this.calculateEmotionalIntensity(page, idx, visualFlow.pages.length);

      const visualExpression = this.emotionMappings[emotion] || this.emotionMappings.calm;

      return {
        page: page.pageNumber,
        stage: page.stageName,
        emotion,
        intensity,
        visualExpression: {
          colors: visualExpression.colors,
          imagery: visualExpression.imagery,
          whitespace: visualExpression.whitespace,
          typography: visualExpression.typography
        },
        narrativePosition: page.narrativePosition
      };
    });
  }

  /**
   * Calculate emotional intensity (0-1)
   */
  calculateEmotionalIntensity(page, index, totalPages) {
    const baseIntensity = {
      hope: 0.6,
      concern: 0.7,
      excitement: 0.9,
      trust: 0.5,
      urgency: 1.0,
      calm: 0.3
    }[page.emotionalTone] || 0.5;

    // Climax pages get intensity boost
    const climaxBoost = page.importance > 0.8 ? 0.2 : 0;

    // Narrative position affects intensity
    const positionFactor = Math.sin(page.narrativePosition * Math.PI);  // 0 → 1 → 0 (arc shape)

    return Math.min(baseIntensity + climaxBoost + (positionFactor * 0.2), 1.0);
  }

  /**
   * Optimize pacing across narrative
   */
  optimizePacing(visualFlow, emotionalJourney) {
    const pages = visualFlow.pages.map((page, idx) => {
      const emotion = emotionalJourney[idx];
      const pacing = this.calculatePagePacing(page, emotion, idx, visualFlow.pages.length);

      return {
        ...page,
        pacing
      };
    });

    // Calculate overall pacing curve
    const pacingCurve = pages.map(p => p.pacing.tempo);
    const avgTempo = pacingCurve.reduce((a, b) => a + b, 0) / pacingCurve.length;

    return {
      ...visualFlow,
      pages,
      pacing: {
        averageTempo: avgTempo,
        curve: pacingCurve,
        variation: this.calculateVariation(pacingCurve)
      }
    };
  }

  /**
   * Calculate pacing for individual page
   */
  calculatePagePacing(page, emotion, index, totalPages) {
    // Tempo: fast (1.0) to slow (0.3)
    const baseTempo = {
      hope: 0.6,
      concern: 0.5,
      excitement: 0.9,
      trust: 0.5,
      urgency: 1.0,
      calm: 0.3
    }[emotion.emotion] || 0.5;

    // Content density affects pacing
    const contentDensity = page.blocks?.length || 1;
    const densityFactor = Math.min(contentDensity / 5, 1.0);  // More content = slower

    const tempo = baseTempo * (1 - densityFactor * 0.3);

    return {
      tempo,
      contentDensity: densityFactor,
      breathingRoom: 1 - densityFactor,
      description: tempo > 0.7 ? 'Fast' : tempo > 0.5 ? 'Moderate' : 'Slow'
    };
  }

  /**
   * Calculate variation in pacing
   */
  calculateVariation(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Refine narrative with AI
   */
  async refineWithAI(visualFlow, documentContent) {
    if (this.options.debug) {
      console.log('🤖 Refining narrative with AI...');
    }

    try {
      const prompt = this.buildNarrativeCritiquePrompt(visualFlow, documentContent);

      const response = await this.anthropic.messages.create({
        model: this.options.model,
        max_tokens: 4000,
        thinking: { type: 'enabled', budget_tokens: 5000 },
        messages: [{ role: 'user', content: prompt }]
      });

      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent) return visualFlow;

      const jsonMatch = textContent.text.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) return visualFlow;

      const suggestions = JSON.parse(jsonMatch[1]);

      return this.applyNarrativeSuggestions(visualFlow, suggestions);

    } catch (error) {
      console.error('❌ AI refinement failed:', error.message);
      return visualFlow;
    }
  }

  /**
   * Build prompt for AI narrative critique
   */
  buildNarrativeCritiquePrompt(visualFlow, documentContent) {
    return `You are an expert storyteller and visual narrative designer. Critique and improve this visual narrative flow.

**Story Arc:** ${visualFlow.arc}
**Total Pages:** ${visualFlow.pages.length}

**Page-by-Page Breakdown:**
${visualFlow.pages.map((page, idx) => `
Page ${page.pageNumber}: ${page.stageName}
- Emotional Tone: ${page.emotionalTone}
- Importance: ${page.importance}
- Pacing: ${page.pacing?.description || 'N/A'}
- Visual Treatment: ${JSON.stringify(page.visualTreatment, null, 2)}
- Transition: ${page.transition?.type || 'None'}
`).join('\n')}

**Narrative Principles:**
1. **Emotional Arc** - Journey should have clear emotional progression
2. **Pacing** - Vary tempo to maintain engagement (fast → slow → fast)
3. **Visual Hierarchy** - Important stages need stronger visual treatment
4. **Transitions** - Smooth flow between stages
5. **Climax** - Peak emotional and visual impact
6. **Resolution** - Satisfying conclusion with clear next step

**Your Task:**
Analyze this narrative flow and suggest improvements for:
- Emotional journey progression
- Visual treatment appropriateness
- Pacing optimization
- Transition effectiveness
- Overall storytelling impact

Return JSON with specific, actionable suggestions.`;
  }

  /**
   * Apply AI suggestions to narrative
   */
  applyNarrativeSuggestions(visualFlow, suggestions) {
    // Apply suggestions (simplified for now)
    return {
      ...visualFlow,
      aiSuggestions: suggestions
    };
  }

  /**
   * Calculate narrative metrics
   */
  calculateNarrativeMetrics(visualFlow) {
    return {
      emotionalRange: this.calculateEmotionalRange(visualFlow),
      pacingVariation: visualFlow.pacing?.variation || 0,
      narrativeClarity: this.calculateNarrativeClarity(visualFlow),
      visualHarmony: this.calculateVisualHarmony(visualFlow),
      overallQuality: 0  // Will be calculated
    };
  }

  calculateEmotionalRange(visualFlow) {
    const emotions = visualFlow.pages.map(p => p.emotionalTone);
    const uniqueEmotions = new Set(emotions);
    return uniqueEmotions.size / 6;  // 6 possible emotions
  }

  calculateNarrativeClarity(visualFlow) {
    // Check if story arc is clear
    const hasBeginning = visualFlow.pages[0]?.importance > 0.7;
    const hasClimax = visualFlow.pages.some(p => p.importance >= 0.9);
    const hasEnd = visualFlow.pages[visualFlow.pages.length - 1]?.importance > 0.7;

    return (hasBeginning + hasClimax + hasEnd) / 3;
  }

  calculateVisualHarmony(visualFlow) {
    // Check if visual treatments progress smoothly
    let harmonyScore = 1.0;

    for (let i = 1; i < visualFlow.pages.length; i++) {
      const prev = visualFlow.pages[i - 1];
      const curr = visualFlow.pages[i];

      // Penalize abrupt changes
      if (prev.emotionalTone !== curr.emotionalTone &&
          prev.transition?.type === 'dramatic-shift') {
        harmonyScore -= 0.1;
      }
    }

    return Math.max(harmonyScore, 0);
  }
}

module.exports = VisualNarrative;
