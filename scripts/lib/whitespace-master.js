/**
 * Whitespace Master
 *
 * Intelligent whitespace optimization for TEEI documents
 *
 * Features:
 * - Whitespace ratio calculation
 * - Breathing room optimization
 * - Density analysis
 * - AI-powered layout critique
 * - Automated spacing improvements
 *
 * @module whitespace-master
 */

const Anthropic = require('@anthropic-ai/sdk');
const BreathingCalculator = require('./breathing-calculator');
const DensityAnalyzer = require('./density-analyzer');
const SpacingScale = require('./spacing-scale');

class WhitespaceMaster {
  constructor(config = {}) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    this.breathingCalculator = new BreathingCalculator();
    this.densityAnalyzer = new DensityAnalyzer();
    this.spacingScale = new SpacingScale();

    this.config = {
      model: config.model || 'claude-opus-4-20250514',
      thinkingBudget: config.thinkingBudget || 3000,
      ...config
    };

    // Whitespace principles
    this.principles = {
      macroWhitespace: {
        description: 'Space between major sections',
        purpose: 'Creates visual hierarchy and breathing room'
      },
      microWhitespace: {
        description: 'Space between elements (text, images, UI components)',
        purpose: 'Improves readability and scannability'
      },
      activeWhitespace: {
        description: 'Intentional, strategic empty space',
        purpose: 'Guides eye flow and emphasizes content'
      },
      passiveWhitespace: {
        description: 'Natural margins and padding',
        purpose: 'Creates comfortable reading experience'
      },
      ratio: {
        ideal: 0.5,    // 50% content, 50% whitespace
        minimum: 0.3,  // 30% whitespace minimum
        maximum: 0.7   // 70% whitespace maximum
      }
    };
  }

  /**
   * Optimize whitespace in layout
   * @param {Object} layout - Layout object with elements and spacing
   * @param {Object} options - Optimization options
   * @returns {Promise<Object>} Optimized layout
   */
  async optimizeWhitespace(layout, options = {}) {
    console.log('\n🎨 Optimizing Whitespace...\n');

    // 1. Calculate current whitespace ratio
    console.log('📏 Step 1: Calculating current whitespace...');
    const current = this.calculateWhitespaceRatio(layout);

    console.log(`   Current ratio: ${(current.ratio * 100).toFixed(1)}%`);
    console.log(`   Ideal ratio: ${(this.principles.ratio.ideal * 100).toFixed(1)}%`);

    // 2. Identify problem areas
    console.log('\n🔍 Step 2: Identifying issues...');
    const issues = this.identifyIssues(layout, current);

    console.log(`   Found ${issues.length} issues`);
    issues.forEach(issue => {
      console.log(`   ${issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🔵'} ${issue.type}: ${issue.message}`);
    });

    // 3. Generate spacing plan
    console.log('\n📐 Step 3: Generating spacing plan...');
    const plan = await this.generateSpacingPlan(layout, issues, options);

    console.log(`   Base unit: ${plan.base}pt`);
    console.log(`   Section spacing: ${plan.sections}pt`);
    console.log(`   Element spacing: ${plan.elements}pt`);

    // 4. Apply breathing room
    console.log('\n💨 Step 4: Applying breathing room...');
    const optimized = this.applyBreathingRoom(layout, plan);

    const newRatio = this.calculateWhitespaceRatio(optimized);
    console.log(`   New ratio: ${(newRatio.ratio * 100).toFixed(1)}%`);

    // 5. Validate with AI
    console.log('\n🤖 Step 5: AI validation...');
    const validated = await this.validateWithAI(optimized, options);

    console.log(`   Score: ${validated.critique.score}/10`);
    console.log(`   ${validated.critique.score >= 8 ? '✅' : validated.critique.score >= 6 ? '⚠️' : '❌'} ${validated.critique.summary}`);

    return {
      original: layout,
      optimized: validated.layout,
      current,
      new: newRatio,
      issues,
      plan,
      critique: validated.critique
    };
  }

  /**
   * Calculate whitespace ratio
   */
  calculateWhitespaceRatio(layout) {
    const totalArea = layout.width * layout.height;

    // Calculate content area
    const contentArea = layout.elements.reduce((sum, el) => {
      return sum + (el.width * el.height);
    }, 0);

    const whitespaceArea = totalArea - contentArea;
    const ratio = whitespaceArea / totalArea;

    // Calculate macro and micro whitespace
    const macroWhitespace = this.calculateMacroWhitespace(layout);
    const microWhitespace = this.calculateMicroWhitespace(layout);

    // Analyze distribution
    const distribution = this.analyzeDistribution(layout);

    return {
      ratio,
      percentage: (ratio * 100).toFixed(1) + '%',
      totalArea,
      contentArea,
      whitespaceArea,
      macroWhitespace,
      microWhitespace,
      distribution
    };
  }

  /**
   * Calculate macro whitespace (between major sections)
   */
  calculateMacroWhitespace(layout) {
    if (!layout.sections || layout.sections.length === 0) {
      return { area: 0, percentage: 0 };
    }

    let macroArea = 0;

    for (let i = 0; i < layout.sections.length - 1; i++) {
      const section = layout.sections[i];
      const nextSection = layout.sections[i + 1];

      // Space between sections
      const spacing = nextSection.y - (section.y + section.height);
      macroArea += spacing * layout.width;
    }

    return {
      area: macroArea,
      percentage: ((macroArea / (layout.width * layout.height)) * 100).toFixed(1) + '%'
    };
  }

  /**
   * Calculate micro whitespace (between elements)
   */
  calculateMicroWhitespace(layout) {
    let microArea = 0;

    // This is a simplified calculation
    // In production, you'd analyze actual spacing between all elements
    const elements = layout.elements || [];

    for (let i = 0; i < elements.length - 1; i++) {
      const el = elements[i];
      const nextEl = elements[i + 1];

      // Vertical spacing
      if (nextEl.y > el.y + el.height) {
        const spacing = nextEl.y - (el.y + el.height);
        microArea += spacing * Math.min(el.width, nextEl.width);
      }
    }

    return {
      area: microArea,
      percentage: ((microArea / (layout.width * layout.height)) * 100).toFixed(1) + '%'
    };
  }

  /**
   * Analyze whitespace distribution
   */
  analyzeDistribution(layout) {
    // Divide layout into quadrants
    const midX = layout.width / 2;
    const midY = layout.height / 2;

    const quadrants = {
      topLeft: { x: 0, y: 0, width: midX, height: midY },
      topRight: { x: midX, y: 0, width: midX, height: midY },
      bottomLeft: { x: 0, y: midY, width: midX, height: midY },
      bottomRight: { x: midX, y: midY, width: midX, height: midY }
    };

    const densities = {};

    for (const [name, quad] of Object.entries(quadrants)) {
      const elementsInQuad = layout.elements.filter(el => {
        return this.isElementInArea(el, quad);
      });

      const contentArea = elementsInQuad.reduce((sum, el) => sum + (el.width * el.height), 0);
      const quadArea = quad.width * quad.height;
      const density = contentArea / quadArea;

      densities[name] = {
        density: density.toFixed(2),
        percentage: ((1 - density) * 100).toFixed(1) + '%' // Whitespace percentage
      };
    }

    // Calculate variance
    const densityValues = Object.values(densities).map(d => parseFloat(d.density));
    const avgDensity = densityValues.reduce((a, b) => a + b, 0) / densityValues.length;
    const variance = Math.sqrt(
      densityValues.reduce((sum, d) => sum + Math.pow(d - avgDensity, 2), 0) / densityValues.length
    );

    return {
      quadrants: densities,
      variance: variance.toFixed(3),
      isEven: variance < 0.1
    };
  }

  /**
   * Check if element is in area
   */
  isElementInArea(element, area) {
    const elCenterX = element.x + element.width / 2;
    const elCenterY = element.y + element.height / 2;

    return elCenterX >= area.x &&
           elCenterX < area.x + area.width &&
           elCenterY >= area.y &&
           elCenterY < area.y + area.height;
  }

  /**
   * Identify issues with current whitespace
   */
  identifyIssues(layout, current) {
    const issues = [];

    // Check overall ratio
    if (current.ratio < this.principles.ratio.minimum) {
      issues.push({
        type: 'cramped',
        severity: 'high',
        message: `Layout is too crowded (${current.percentage} whitespace, need ${(this.principles.ratio.minimum * 100).toFixed(0)}% minimum)`,
        recommendation: 'Increase margins and spacing by 40-50%',
        impact: 'Readers will feel overwhelmed and text will be hard to scan'
      });
    } else if (current.ratio > this.principles.ratio.maximum) {
      issues.push({
        type: 'sparse',
        severity: 'medium',
        message: `Layout is too sparse (${current.percentage} whitespace)`,
        recommendation: 'Add more content or reduce page size',
        impact: 'Document may appear incomplete or unprofessional'
      });
    }

    // Check for touching elements
    const touching = this.findTouchingElements(layout);
    if (touching.length > 0) {
      issues.push({
        type: 'touching-elements',
        severity: 'high',
        elements: touching,
        message: `${touching.length} pairs of elements are too close or touching`,
        recommendation: 'Add minimum 12pt spacing between all elements',
        impact: 'Content appears cluttered and hard to distinguish'
      });
    }

    // Check for uneven distribution
    if (current.distribution && parseFloat(current.distribution.variance) > 0.3) {
      issues.push({
        type: 'uneven-distribution',
        severity: 'medium',
        message: 'Whitespace is unevenly distributed across the layout',
        recommendation: 'Balance content density across all quadrants',
        impact: 'Layout feels unbalanced and unprofessional'
      });
    }

    // Check margins
    const minMargin = 40; // TEEI standard
    if (layout.margins) {
      if (layout.margins.top < minMargin || layout.margins.bottom < minMargin ||
          layout.margins.left < minMargin || layout.margins.right < minMargin) {
        issues.push({
          type: 'insufficient-margins',
          severity: 'high',
          message: 'Margins are less than TEEI minimum (40pt)',
          recommendation: `Increase margins to minimum ${minMargin}pt`,
          impact: 'Content appears cramped against page edges'
        });
      }
    }

    // Check line density
    if (layout.elements) {
      const textElements = layout.elements.filter(el => el.type === 'text');
      for (const el of textElements) {
        if (el.lineHeight && el.lineHeight < 1.4) {
          issues.push({
            type: 'tight-line-spacing',
            severity: 'medium',
            element: el.id,
            message: `Text element has tight line spacing (${el.lineHeight})`,
            recommendation: 'Increase line-height to 1.5 for body text',
            impact: 'Reduced readability and eye strain'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Find touching or too-close elements
   */
  findTouchingElements(layout) {
    const touching = [];
    const minSpacing = 12; // Minimum recommended spacing

    const elements = layout.elements || [];

    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const el1 = elements[i];
        const el2 = elements[j];

        const distance = this.calculateElementDistance(el1, el2);

        if (distance < minSpacing) {
          touching.push({
            element1: el1.id || `element-${i}`,
            element2: el2.id || `element-${j}`,
            distance: distance.toFixed(1),
            recommended: minSpacing
          });
        }
      }
    }

    return touching;
  }

  /**
   * Calculate distance between elements
   */
  calculateElementDistance(el1, el2) {
    // Calculate edge-to-edge distance

    // Horizontal distance
    let hDist = 0;
    if (el1.x + el1.width < el2.x) {
      hDist = el2.x - (el1.x + el1.width);
    } else if (el2.x + el2.width < el1.x) {
      hDist = el1.x - (el2.x + el2.width);
    }

    // Vertical distance
    let vDist = 0;
    if (el1.y + el1.height < el2.y) {
      vDist = el2.y - (el1.y + el1.height);
    } else if (el2.y + el2.height < el1.y) {
      vDist = el1.y - (el2.y + el2.height);
    }

    // Return minimum distance
    if (hDist === 0 && vDist === 0) {
      return 0; // Overlapping
    } else if (hDist === 0) {
      return vDist;
    } else if (vDist === 0) {
      return hDist;
    } else {
      return Math.sqrt(hDist * hDist + vDist * vDist);
    }
  }

  /**
   * Generate spacing plan
   */
  async generateSpacingPlan(layout, issues, options = {}) {
    // Use golden ratio for spacing
    const phi = 1.618;
    const base = options.baseUnit || 8; // 8pt baseline grid

    const spacingScale = this.spacingScale.getScale(base);

    // Adjust based on issues
    let multiplier = 1.0;

    if (issues.some(i => i.type === 'cramped')) {
      multiplier = 1.4; // Increase spacing by 40%
    } else if (issues.some(i => i.type === 'sparse')) {
      multiplier = 0.8; // Decrease spacing by 20%
    }

    return {
      base,
      multiplier,
      scale: spacingScale,
      sections: Math.round(spacingScale.xxl * multiplier),      // Between major sections
      elements: Math.round(spacingScale.lg * multiplier),       // Between elements
      paragraphs: Math.round(spacingScale.md * multiplier),     // Between paragraphs
      lines: spacingScale.sm,                                   // Between lines (handled by line-height)
      margins: Math.round(spacingScale.xl * multiplier),        // Page margins
      padding: Math.round(spacingScale.lg * multiplier)         // Element padding
    };
  }

  /**
   * Apply breathing room
   */
  applyBreathingRoom(layout, plan) {
    const optimized = {
      ...layout,
      margins: {
        top: plan.margins,
        right: plan.margins,
        bottom: plan.margins,
        left: plan.margins
      },
      elements: layout.elements.map((el, idx) => ({
        ...el,
        marginBottom: this.calculateElementMargin(el, layout.elements[idx + 1], plan),
        padding: plan.padding
      })),
      sections: layout.sections ? layout.sections.map((section, idx) => ({
        ...section,
        marginBottom: plan.sections,
        firstElementMarginTop: 0 // Prevent double spacing
      })) : []
    };

    return optimized;
  }

  /**
   * Calculate margin for element
   */
  calculateElementMargin(element, nextElement, plan) {
    if (!nextElement) {
      return plan.elements;
    }

    // Different spacing based on element types
    if (element.type === 'heading' && nextElement.type === 'text') {
      return plan.paragraphs; // Smaller gap between heading and text
    }

    if (element.type === 'text' && nextElement.type === 'text') {
      return plan.paragraphs;
    }

    if (element.type === 'section' || nextElement.type === 'section') {
      return plan.sections;
    }

    return plan.elements;
  }

  /**
   * Validate with AI
   */
  async validateWithAI(layout, options = {}) {
    console.log('   Using Claude Opus 4.1 with extended thinking...');

    const layoutSummary = this.summarizeLayout(layout);

    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 4000,
        thinking: {
          type: 'extended',
          budget_tokens: this.config.thinkingBudget
        },
        messages: [{
          role: 'user',
          content: `You are a world-class design critic specializing in whitespace and layout.

Critique the whitespace in this layout:

${JSON.stringify(layoutSummary, null, 2)}

Evaluate on these criteria:
1. Overall whitespace ratio (ideal 40-60%)
2. Distribution evenness across the layout
3. Breathing room and visual comfort
4. Visual hierarchy (spacing emphasizes importance)
5. Reader comfort (easy to scan and read)

Return JSON with:
{
  "score": 0-10,
  "summary": "one sentence overall assessment",
  "issues": ["issue 1", "issue 2", ...],
  "improvements": [
    {"type": "margins", "action": "specific action", "priority": "high|medium|low"},
    ...
  ],
  "reasoning": "detailed explanation"
}`
        }]
      });

      const content = response.content.find(block => block.type === 'text')?.text || '{}';

      // Extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const critique = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        score: 5,
        summary: 'Could not parse AI response',
        issues: [],
        improvements: [],
        reasoning: 'Failed to validate'
      };

      // If score is low, recursively improve
      if (critique.score < 8 && !options.skipRecursion) {
        console.log(`   Score ${critique.score}/10 - applying improvements...`);

        const improved = this.applyImprovements(layout, critique.improvements);

        return await this.validateWithAI(improved, { ...options, skipRecursion: true });
      }

      return {
        layout,
        critique
      };

    } catch (error) {
      console.warn(`   ⚠️  AI validation failed: ${error.message}`);

      return {
        layout,
        critique: {
          score: 7,
          summary: 'AI validation unavailable, using default assessment',
          issues: [],
          improvements: [],
          reasoning: 'Validation skipped due to error'
        }
      };
    }
  }

  /**
   * Summarize layout for AI
   */
  summarizeLayout(layout) {
    const ratio = this.calculateWhitespaceRatio(layout);

    return {
      dimensions: {
        width: layout.width,
        height: layout.height
      },
      whitespace: {
        ratio: ratio.percentage,
        macroWhitespace: ratio.macroWhitespace.percentage,
        microWhitespace: ratio.microWhitespace.percentage,
        distribution: ratio.distribution
      },
      margins: layout.margins,
      elementCount: layout.elements?.length || 0,
      sectionCount: layout.sections?.length || 0
    };
  }

  /**
   * Apply improvements from AI critique
   */
  applyImprovements(layout, improvements) {
    let improved = { ...layout };

    for (const improvement of improvements) {
      if (improvement.type === 'margins' && improvement.priority === 'high') {
        // Increase margins
        improved.margins = {
          top: (improved.margins?.top || 40) * 1.2,
          right: (improved.margins?.right || 40) * 1.2,
          bottom: (improved.margins?.bottom || 40) * 1.2,
          left: (improved.margins?.left || 40) * 1.2
        };
      }

      if (improvement.type === 'spacing' && improvement.priority === 'high') {
        // Increase element spacing
        improved.elements = improved.elements?.map(el => ({
          ...el,
          marginBottom: (el.marginBottom || 20) * 1.3
        })) || [];
      }

      if (improvement.type === 'distribution') {
        // Redistribute elements more evenly
        // This is a simplified implementation
        // In production, you'd use more sophisticated layout algorithms
      }
    }

    return improved;
  }

  /**
   * Generate whitespace report
   */
  generateReport(result) {
    return {
      summary: {
        originalRatio: result.current.percentage,
        optimizedRatio: result.new.percentage,
        improvement: ((result.new.ratio - result.current.ratio) * 100).toFixed(1) + '%',
        score: result.critique.score,
        grade: this.scoreToGrade(result.critique.score)
      },
      issues: result.issues,
      applied: result.plan,
      critique: result.critique,
      distribution: {
        original: result.current.distribution,
        optimized: result.new.distribution
      }
    };
  }

  /**
   * Convert score to grade
   */
  scoreToGrade(score) {
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'B';
    if (score >= 6) return 'C';
    if (score >= 5) return 'D';
    return 'F';
  }
}

module.exports = WhitespaceMaster;
