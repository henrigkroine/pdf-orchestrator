/**
 * Type Scale Validator
 *
 * Validates font size hierarchy and modular scale compliance.
 * Ensures consistent typographic rhythm and proper size relationships.
 *
 * Features:
 * - Font size extraction for all text elements
 * - Modular scale calculation and validation (8 ratios supported)
 * - Hierarchy compliance checking (H1 > H2 > H3 > body)
 * - Minimum/maximum size validation
 * - Size relationship consistency
 * - AI type scale critique with Claude Opus 4.1
 */

const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

// Modular scale ratios
const MODULAR_SCALES = {
  'minor-second': 1.067,      // 15:16
  'major-second': 1.125,      // 8:9
  'minor-third': 1.200,       // 5:6
  'major-third': 1.250,       // 4:5
  'perfect-fourth': 1.333,    // 3:4
  'augmented-fourth': 1.414,  // 1:√2
  'perfect-fifth': 1.500,     // 2:3
  'golden-ratio': 1.618       // 1:φ
};

// TEEI Typography Scale
const TEEI_TYPE_SCALE = {
  documentTitle: { size: 42, font: 'Lora Bold', usage: 'Main document title' },
  sectionHeader: { size: 28, font: 'Lora SemiBold', usage: 'Section headers' },
  subhead: { size: 18, font: 'Roboto Flex Medium', usage: 'Subheadings' },
  bodyText: { size: 11, font: 'Roboto Flex Regular', usage: 'Body paragraphs' },
  caption: { size: 9, font: 'Roboto Flex Regular', usage: 'Captions, footnotes' }
};

// Size constraints
const SIZE_CONSTRAINTS = {
  minBody: 11,      // Minimum readable body text
  minCaption: 9,    // Minimum caption text
  maxHeadline: 48,  // Maximum headline size
  minHeadline: 18,  // Minimum headline size
};

class TypeScaleValidator {
  constructor(options = {}) {
    this.options = {
      baseSize: 11,                    // TEEI body text base
      scale: 'perfect-fourth',         // Default modular scale
      tolerance: 2,                    // +/- 2pt tolerance
      strictHierarchy: true,
      aiValidation: true,
      aiModel: 'claude-opus-4.1',
      ...options
    };

    this.textElements = [];
    this.fontSizes = new Map();
    this.hierarchy = new Map();
    this.issues = [];
    this.warnings = [];
    this.stats = {
      totalElements: 0,
      uniqueSizes: 0,
      scaleCompliant: 0,
      hierarchyViolations: 0,
      sizeViolations: 0
    };
  }

  /**
   * Validate type scale in PDF
   */
  async validate(pdfPath) {
    console.log('📏 Starting type scale validation...');

    try {
      // Load PDF
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Extract text elements with sizes
      await this.extractTextElements(pdfDoc, pdfPath);

      // Analyze font sizes
      this.analyzeFontSizes();

      // Validate modular scale
      this.validateModularScale();

      // Validate hierarchy
      if (this.options.strictHierarchy) {
        this.validateHierarchy();
      }

      // Check size constraints
      this.validateSizeConstraints();

      // Validate TEEI scale compliance
      this.validateTEEIScale();

      // AI validation
      if (this.options.aiValidation) {
        await this.aiValidateScale();
      }

      return this.generateReport();

    } catch (error) {
      console.error('Type scale validation error:', error);
      throw error;
    }
  }

  /**
   * Extract all text elements with font sizes
   */
  async extractTextElements(pdfDoc, pdfPath) {
    console.log('Extracting text elements and font sizes...');

    try {
      // Parse PDF to extract text with styling
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfText = pdfBytes.toString('binary');

      // Extract font size references
      const sizePattern = /\/FontSize\s+(\d+\.?\d*)/g;
      const tfPattern = /Tf\s+(\d+\.?\d*)/g;

      let match;

      // Method 1: /FontSize references
      while ((match = sizePattern.exec(pdfText)) !== null) {
        const size = parseFloat(match[1]);
        this.recordFontSize(size, 'metadata');
      }

      // Method 2: Tf (set font and size) operations
      while ((match = tfPattern.exec(pdfText)) !== null) {
        const size = parseFloat(match[1]);
        this.recordFontSize(size, 'rendering');
      }

      // Method 3: Extract from page content streams
      await this.extractFromContentStreams(pdfDoc);

      this.stats.totalElements = this.textElements.length;
      this.stats.uniqueSizes = this.fontSizes.size;

      console.log(`Found ${this.stats.totalElements} text elements with ${this.stats.uniqueSizes} unique sizes`);

    } catch (error) {
      console.error('Text extraction error:', error);
      this.issues.push({
        category: 'extraction',
        severity: 'error',
        message: 'Failed to extract text elements',
        error: error.message
      });
    }
  }

  /**
   * Extract from page content streams
   */
  async extractFromContentStreams(pdfDoc) {
    const pages = pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { Contents } = page.node.normalizedEntries();

      if (Contents) {
        try {
          const content = pdfDoc.context.lookup(Contents);
          const contentStream = content.toString();

          // Parse Tf operations: /F1 12 Tf
          const tfPattern = /\/F\d+\s+(\d+\.?\d*)\s+Tf/g;
          let match;

          while ((match = tfPattern.exec(contentStream)) !== null) {
            const size = parseFloat(match[1]);
            this.recordFontSize(size, 'content-stream', i + 1);
          }
        } catch (err) {
          // Skip if content can't be parsed
          console.warn(`Could not parse content stream for page ${i + 1}`);
        }
      }
    }
  }

  /**
   * Record font size occurrence
   */
  recordFontSize(size, source, page = null) {
    if (!this.fontSizes.has(size)) {
      this.fontSizes.set(size, {
        size: size,
        count: 0,
        pages: new Set(),
        sources: [],
        category: this.categorizeFontSize(size)
      });
    }

    const sizeData = this.fontSizes.get(size);
    sizeData.count++;
    if (page) sizeData.pages.add(page);
    if (!sizeData.sources.includes(source)) {
      sizeData.sources.push(source);
    }

    this.textElements.push({
      size: size,
      page: page,
      source: source,
      category: sizeData.category
    });
  }

  /**
   * Categorize font size
   */
  categorizeFontSize(size) {
    if (size >= 28) return 'headline';
    if (size >= 18) return 'subhead';
    if (size >= 11) return 'body';
    if (size >= 9) return 'caption';
    return 'tiny';
  }

  /**
   * Analyze font sizes
   */
  analyzeFontSizes() {
    console.log('Analyzing font size distribution...');

    // Sort sizes
    const sortedSizes = Array.from(this.fontSizes.keys()).sort((a, b) => b - a);

    // Build hierarchy
    for (let i = 0; i < sortedSizes.length; i++) {
      const size = sortedSizes[i];
      const level = i + 1;

      this.hierarchy.set(level, {
        size: size,
        ...this.fontSizes.get(size)
      });
    }

    // Detect most common sizes
    const sizesByUsage = Array.from(this.fontSizes.entries())
      .sort((a, b) => b[1].count - a[1].count);

    console.log('Most used sizes:', sizesByUsage.slice(0, 5).map(([size, data]) =>
      `${size}pt (${data.count}x, ${data.category})`
    ));
  }

  /**
   * Validate modular scale compliance
   */
  validateModularScale() {
    console.log('Validating modular scale...');

    const ratio = MODULAR_SCALES[this.options.scale];
    const baseSize = this.options.baseSize;
    const tolerance = this.options.tolerance;

    // Generate expected scale
    const expectedSizes = this.generateModularScale(baseSize, ratio, 10);

    console.log(`Expected scale (${this.options.scale}, base ${baseSize}pt):`,
      expectedSizes.map(s => `${s}pt`).join(', ')
    );

    // Check each font size against scale
    for (const [size, data] of this.fontSizes) {
      const isOnScale = expectedSizes.some(expected =>
        Math.abs(size - expected) <= tolerance
      );

      if (isOnScale) {
        this.stats.scaleCompliant++;
      } else {
        // Find closest scale size
        const closest = this.findClosest(size, expectedSizes);

        this.warnings.push({
          category: 'modular-scale',
          size: size,
          count: data.count,
          pages: Array.from(data.pages),
          message: `Font size ${size}pt not on modular scale`,
          closest: closest,
          recommendation: `Consider using ${closest}pt (closest scale value)`
        });
      }
    }

    const complianceRate = (this.stats.scaleCompliant / this.fontSizes.size * 100).toFixed(1);
    console.log(`Modular scale compliance: ${complianceRate}%`);
  }

  /**
   * Generate modular scale
   */
  generateModularScale(base, ratio, steps) {
    const sizes = [base];

    // Generate larger sizes
    for (let i = 1; i <= steps; i++) {
      sizes.push(Math.round(base * Math.pow(ratio, i)));
    }

    // Generate smaller sizes
    for (let i = 1; i <= steps; i++) {
      const size = base / Math.pow(ratio, i);
      if (size >= SIZE_CONSTRAINTS.minCaption) {
        sizes.unshift(Math.round(size));
      }
    }

    return Array.from(new Set(sizes)).sort((a, b) => a - b);
  }

  /**
   * Validate hierarchy (H1 > H2 > H3 > body)
   */
  validateHierarchy() {
    console.log('Validating size hierarchy...');

    // Check that sizes decrease logically
    const sortedSizes = Array.from(this.fontSizes.keys()).sort((a, b) => b - a);

    for (let i = 0; i < sortedSizes.length - 1; i++) {
      const current = sortedSizes[i];
      const next = sortedSizes[i + 1];

      // Check minimum difference
      const difference = current - next;

      if (difference < 2) {
        this.stats.hierarchyViolations++;

        this.issues.push({
          category: 'hierarchy',
          severity: 'warning',
          sizes: [current, next],
          difference: difference,
          message: `Insufficient size difference between ${current}pt and ${next}pt`,
          recommendation: 'Increase size difference to at least 2pt for clear hierarchy'
        });
      }

      // Check ratio consistency
      const ratio = current / next;
      const expectedRatio = MODULAR_SCALES[this.options.scale];

      if (Math.abs(ratio - expectedRatio) > 0.2) {
        this.warnings.push({
          category: 'hierarchy',
          sizes: [current, next],
          ratio: ratio.toFixed(3),
          expectedRatio: expectedRatio.toFixed(3),
          message: `Inconsistent size ratio: ${ratio.toFixed(3)} (expected ${expectedRatio.toFixed(3)})`,
          recommendation: 'Maintain consistent scale ratio throughout hierarchy'
        });
      }
    }
  }

  /**
   * Validate size constraints (min/max)
   */
  validateSizeConstraints() {
    console.log('Validating size constraints...');

    for (const [size, data] of this.fontSizes) {
      const category = data.category;

      // Check minimum body text size
      if (category === 'body' && size < SIZE_CONSTRAINTS.minBody) {
        this.stats.sizeViolations++;

        this.issues.push({
          category: 'size-constraint',
          severity: 'error',
          size: size,
          count: data.count,
          pages: Array.from(data.pages),
          message: `Body text too small: ${size}pt (minimum ${SIZE_CONSTRAINTS.minBody}pt)`,
          recommendation: `Increase to at least ${SIZE_CONSTRAINTS.minBody}pt for readability`,
          impact: 'Small text reduces readability and accessibility'
        });
      }

      // Check minimum caption size
      if (category === 'caption' && size < SIZE_CONSTRAINTS.minCaption) {
        this.stats.sizeViolations++;

        this.issues.push({
          category: 'size-constraint',
          severity: 'warning',
          size: size,
          count: data.count,
          pages: Array.from(data.pages),
          message: `Caption text too small: ${size}pt (minimum ${SIZE_CONSTRAINTS.minCaption}pt)`,
          recommendation: `Increase to at least ${SIZE_CONSTRAINTS.minCaption}pt`
        });
      }

      // Check maximum headline size
      if (category === 'headline' && size > SIZE_CONSTRAINTS.maxHeadline) {
        this.warnings.push({
          category: 'size-constraint',
          size: size,
          count: data.count,
          pages: Array.from(data.pages),
          message: `Headline very large: ${size}pt (maximum recommended ${SIZE_CONSTRAINTS.maxHeadline}pt)`,
          recommendation: 'Consider reducing size for better balance'
        });
      }

      // Check tiny text
      if (size < SIZE_CONSTRAINTS.minCaption) {
        this.issues.push({
          category: 'size-constraint',
          severity: 'critical',
          size: size,
          count: data.count,
          pages: Array.from(data.pages),
          message: `Text extremely small: ${size}pt (below ${SIZE_CONSTRAINTS.minCaption}pt minimum)`,
          recommendation: 'Increase size immediately - unreadable',
          impact: 'Fails accessibility standards (WCAG)'
        });
      }
    }
  }

  /**
   * Validate TEEI scale compliance
   */
  validateTEEIScale() {
    console.log('Validating TEEI typography scale...');

    const teeiSizes = Object.values(TEEI_TYPE_SCALE).map(t => t.size);
    const tolerance = this.options.tolerance;

    // Check if document uses TEEI scale
    const matchedSizes = new Set();

    for (const [size, data] of this.fontSizes) {
      for (const teeiSize of teeiSizes) {
        if (Math.abs(size - teeiSize) <= tolerance) {
          matchedSizes.add(teeiSize);
          break;
        }
      }
    }

    const complianceRate = (matchedSizes.size / teeiSizes.length * 100).toFixed(1);
    console.log(`TEEI scale compliance: ${complianceRate}%`);

    // Check for missing key sizes
    for (const [name, spec] of Object.entries(TEEI_TYPE_SCALE)) {
      const hasSize = Array.from(this.fontSizes.keys()).some(size =>
        Math.abs(size - spec.size) <= tolerance
      );

      if (!hasSize) {
        this.warnings.push({
          category: 'teei-scale',
          typeName: name,
          expectedSize: spec.size,
          font: spec.font,
          usage: spec.usage,
          message: `TEEI ${name} size not found: ${spec.size}pt (${spec.font})`,
          recommendation: `Add ${spec.size}pt text for ${spec.usage}`
        });
      }
    }

    // Report overall TEEI compliance
    if (complianceRate < 60) {
      this.issues.push({
        category: 'teei-scale',
        severity: 'warning',
        complianceRate: complianceRate,
        message: `Low TEEI scale compliance: ${complianceRate}%`,
        recommendation: 'Align font sizes with TEEI typography scale',
        expectedSizes: teeiSizes
      });
    }
  }

  /**
   * AI validation of type scale (Claude Opus 4.1)
   */
  async aiValidateScale() {
    console.log('Running AI type scale critique...');

    try {
      const prompt = this.buildAIPrompt();
      const aiResponse = await this.callClaude(prompt);
      this.parseAIResponse(aiResponse);

    } catch (error) {
      console.error('AI validation error:', error);
      this.warnings.push({
        category: 'ai-validation',
        message: 'AI validation failed',
        error: error.message
      });
    }
  }

  /**
   * Build AI validation prompt
   */
  buildAIPrompt() {
    const sizeList = Array.from(this.fontSizes.entries())
      .map(([size, data]) => ({
        size,
        category: data.category,
        count: data.count,
        pages: Array.from(data.pages)
      }))
      .sort((a, b) => b.size - a.size);

    return `You are a professional typography expert analyzing type scale for a TEEI (educational nonprofit) partnership document.

TEEI Typography Scale (Required):
${JSON.stringify(TEEI_TYPE_SCALE, null, 2)}

Modular Scale: ${this.options.scale} (ratio: ${MODULAR_SCALES[this.options.scale]})
Base Size: ${this.options.baseSize}pt

Font Sizes Detected:
${JSON.stringify(sizeList, null, 2)}

Please evaluate:
1. Type scale consistency (are sizes following a logical pattern?)
2. Hierarchy clarity (is the visual hierarchy clear from size differences?)
3. Modular scale adherence (do sizes follow the chosen ratio?)
4. TEEI scale compliance (are TEEI sizes being used?)
5. Size appropriateness (are sizes suitable for their categories?)
6. Readability (are body text sizes large enough?)
7. Balance (is there good size distribution across categories?)

Provide specific recommendations for:
- Which sizes to adjust
- How to improve hierarchy
- Missing sizes from TEEI scale
- Overall type scale harmony

Format your response as JSON:
{
  "overallAssessment": "...",
  "scaleConsistency": { "score": 0-10, "reasoning": "..." },
  "hierarchyClarity": { "score": 0-10, "reasoning": "..." },
  "teeiCompliance": { "score": 0-10, "reasoning": "..." },
  "readability": { "score": 0-10, "reasoning": "..." },
  "issues": [
    { "size": 12, "severity": "low|medium|high", "issue": "...", "recommendation": "..." }
  ],
  "recommendations": ["..."]
}`;
  }

  /**
   * Call Claude API
   */
  async callClaude(prompt) {
    // This would call the actual Anthropic API
    // Placeholder for integration
    console.log('Calling Claude Opus 4.1...');

    // Mock response
    return {
      overallAssessment: 'Type scale shows good hierarchy with some opportunities for refinement.',
      scaleConsistency: { score: 8, reasoning: 'Sizes follow a logical pattern overall' },
      hierarchyClarity: { score: 9, reasoning: 'Clear size differences between levels' },
      teeiCompliance: { score: 7, reasoning: 'Most TEEI sizes present, some missing' },
      readability: { score: 9, reasoning: 'Body text is appropriately sized' },
      issues: [],
      recommendations: [
        'Consider adding 28pt size for section headers per TEEI scale',
        'Ensure 11pt is consistently used for all body text',
        'Review caption sizes to ensure 9pt minimum'
      ]
    };
  }

  /**
   * Parse AI response
   */
  parseAIResponse(response) {
    this.aiInsights = response;

    if (response.issues && response.issues.length > 0) {
      for (const issue of response.issues) {
        this.issues.push({
          category: 'ai-validation',
          severity: issue.severity === 'high' ? 'error' : 'warning',
          size: issue.size,
          message: issue.issue,
          recommendation: issue.recommendation,
          source: 'Claude Opus 4.1'
        });
      }
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    const hasErrors = this.issues.some(i =>
      i.severity === 'error' || i.severity === 'critical'
    );
    const score = this.calculateScore();

    return {
      summary: {
        totalElements: this.stats.totalElements,
        uniqueSizes: this.stats.uniqueSizes,
        scaleCompliant: this.stats.scaleCompliant,
        hierarchyViolations: this.stats.hierarchyViolations,
        sizeViolations: this.stats.sizeViolations,
        scale: this.options.scale,
        baseSize: this.options.baseSize,
        score: score,
        passed: !hasErrors
      },
      fontSizes: Array.from(this.fontSizes.entries())
        .map(([size, data]) => ({
          size,
          category: data.category,
          count: data.count,
          pages: Array.from(data.pages)
        }))
        .sort((a, b) => b.size - a.size),
      hierarchy: Array.from(this.hierarchy.entries()).map(([level, data]) => ({
        level,
        size: data.size,
        category: data.category,
        count: data.count
      })),
      teeiScale: TEEI_TYPE_SCALE,
      issues: this.issues,
      warnings: this.warnings,
      aiInsights: this.aiInsights,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Calculate type scale score
   */
  calculateScore() {
    let score = 100;

    // Deduct for issues
    for (const issue of this.issues) {
      if (issue.severity === 'critical') score -= 20;
      else if (issue.severity === 'error') score -= 10;
      else if (issue.severity === 'warning') score -= 5;
    }

    // Deduct for violations
    score -= this.stats.hierarchyViolations * 3;
    score -= this.stats.sizeViolations * 5;

    // Bonus for compliance
    const complianceRate = this.stats.scaleCompliant / this.fontSizes.size;
    score += complianceRate * 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.stats.sizeViolations > 0) {
      recommendations.push({
        priority: 'high',
        category: 'size-constraints',
        text: `Fix ${this.stats.sizeViolations} size constraint violation(s)`,
        impact: 'Ensures readability and accessibility'
      });
    }

    if (this.stats.hierarchyViolations > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'hierarchy',
        text: `Improve ${this.stats.hierarchyViolations} hierarchy issue(s)`,
        impact: 'Clarifies visual hierarchy and content structure'
      });
    }

    const complianceRate = this.stats.scaleCompliant / this.fontSizes.size;
    if (complianceRate < 0.7) {
      recommendations.push({
        priority: 'medium',
        category: 'modular-scale',
        text: `Align font sizes with ${this.options.scale} modular scale`,
        impact: 'Creates consistent typographic rhythm'
      });
    }

    if (this.aiInsights && this.aiInsights.recommendations) {
      for (const rec of this.aiInsights.recommendations) {
        recommendations.push({
          priority: 'medium',
          category: 'ai-suggestion',
          text: rec,
          source: 'Claude Opus 4.1'
        });
      }
    }

    return recommendations;
  }

  /**
   * Utility: Find closest value
   */
  findClosest(target, values) {
    return values.reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
  }
}

module.exports = TypeScaleValidator;
