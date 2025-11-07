/**
 * Layout Architect - AI-Powered Layout Optimization
 *
 * Creates world-class layouts using:
 * - Swiss grid systems (12-column)
 * - Golden ratio proportions
 * - Modular grids (8pt baseline)
 * - Fibonacci sequences
 * - AI-powered refinement
 *
 * @module layout-architect
 */

const Anthropic = require('@anthropic-ai/sdk');
const GoldenRatio = require('./golden-ratio');
const GridSystem = require('./grid-system');
const AlignmentEngine = require('./alignment-engine');

class LayoutArchitect {
  constructor(options = {}) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    this.goldenRatio = new GoldenRatio();
    this.gridSystem = new GridSystem();
    this.alignmentEngine = new AlignmentEngine();

    // Grid system presets
    this.grids = {
      swiss: {
        name: 'Swiss Grid',
        columns: 12,
        gutters: 20,
        margins: { top: 40, right: 40, bottom: 40, left: 40 },
        baseline: 8,
        description: 'Classic 12-column Swiss grid for maximum flexibility'
      },
      golden: {
        name: 'Golden Ratio',
        ratio: 1.618,
        description: 'Proportions based on the divine ratio'
      },
      modular: {
        name: 'Modular Grid',
        units: 8,
        columns: 6,
        rows: 12,
        description: '8pt baseline grid for vertical rhythm'
      },
      fibonacci: {
        name: 'Fibonacci Grid',
        sequence: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
        description: 'Organic proportions from nature'
      },
      manuscript: {
        name: 'Manuscript Grid',
        columns: 1,
        margins: { top: 72, right: 54, bottom: 72, left: 54 },
        description: 'Single-column for text-heavy documents'
      }
    };

    // Page dimensions (US Letter)
    this.page = {
      width: 612,  // 8.5 inches × 72 pts
      height: 792  // 11 inches × 72 pts
    };

    // Visual weight factors
    this.weightFactors = {
      size: 1.0,
      color: 0.8,
      contrast: 0.9,
      position: 0.7,
      imagery: 1.5,
      whitespace: -0.3  // Negative space reduces weight
    };

    // TEEI brand colors (for weight calculation)
    this.brandColors = {
      nordshore: { hex: '#00393F', weight: 1.0 },  // Dark = heavy
      sky: { hex: '#C9E4EC', weight: 0.4 },        // Light = lighter
      sand: { hex: '#FFF1E2', weight: 0.2 },       // Very light
      gold: { hex: '#BA8F5A', weight: 0.7 },       // Warm = heavier
      moss: { hex: '#65873B', weight: 0.6 },
      clay: { hex: '#913B2F', weight: 0.8 }
    };

    this.options = {
      enableAI: options.enableAI !== false,
      model: options.model || 'claude-opus-4-20250514',
      thinkingBudget: options.thinkingBudget || 5000,
      debug: options.debug || false
    };
  }

  /**
   * Main optimization pipeline
   * Analyzes content and creates optimal layout
   */
  async optimizeLayout(documentContent, constraints = {}) {
    if (this.options.debug) {
      console.log('🎨 Layout Architect: Starting optimization...');
      console.log(`   Content blocks: ${documentContent.blocks?.length || 0}`);
      console.log(`   Constraints: ${JSON.stringify(constraints)}`);
    }

    try {
      // Step 1: Analyze content structure
      const analysis = this.analyzeContent(documentContent);

      // Step 2: Select optimal grid system
      const gridSystem = this.selectOptimalGrid(analysis, constraints);

      // Step 3: Apply golden ratio proportions
      const proportions = this.applyGoldenRatio(gridSystem, analysis);

      // Step 4: Balance visual weight
      const balanced = this.balanceVisualWeight(proportions, analysis);

      // Step 5: Create focal points
      const withFocal = this.createFocalPoints(balanced, analysis);

      // Step 6: Optimize whitespace
      const withWhitespace = this.optimizeWhitespace(withFocal, analysis);

      // Step 7: Apply alignment
      const aligned = this.alignmentEngine.alignElements(withWhitespace, gridSystem);

      // Step 8: AI refinement (optional)
      let final = aligned;
      if (this.options.enableAI) {
        final = await this.refineWithAI(aligned, analysis);
      }

      // Step 9: Calculate metrics
      final.metrics = this.calculateMetrics(final);

      if (this.options.debug) {
        console.log('✅ Layout optimization complete');
        console.log(`   Grid: ${final.grid.name}`);
        console.log(`   Balance score: ${final.metrics.balance.toFixed(2)}`);
        console.log(`   Harmony score: ${final.metrics.harmony.toFixed(2)}`);
      }

      return final;

    } catch (error) {
      console.error('❌ Layout optimization failed:', error.message);
      throw error;
    }
  }

  /**
   * Analyze content structure
   */
  analyzeContent(documentContent) {
    const blocks = documentContent.blocks || [];

    return {
      totalBlocks: blocks.length,
      blockTypes: this.categorizeBlocks(blocks),
      contentDensity: this.calculateContentDensity(blocks),
      textImageRatio: this.calculateTextImageRatio(blocks),
      complexity: this.calculateComplexity(blocks),
      hierarchy: this.extractHierarchy(blocks),
      recommendedGrid: null  // Will be determined
    };
  }

  /**
   * Categorize content blocks
   */
  categorizeBlocks(blocks) {
    const types = {
      hero: [],
      headline: [],
      subhead: [],
      body: [],
      image: [],
      quote: [],
      callout: [],
      cta: [],
      caption: [],
      sidebar: []
    };

    blocks.forEach((block, idx) => {
      const type = this.detectBlockType(block, idx);
      if (types[type]) {
        types[type].push(block);
      }
    });

    return types;
  }

  /**
   * Detect block type from content
   */
  detectBlockType(block, index) {
    // First block is likely hero
    if (index === 0 && block.size === 'large') {
      return 'hero';
    }

    // Image blocks
    if (block.type === 'image' || block.image) {
      return 'image';
    }

    // Text blocks by size/style
    if (block.size === 'xlarge' || block.fontSize > 32) {
      return 'headline';
    }

    if (block.size === 'large' || block.fontSize > 18) {
      return 'subhead';
    }

    if (block.style === 'quote' || block.type === 'quote') {
      return 'quote';
    }

    if (block.style === 'callout' || block.emphasis === 'high') {
      return 'callout';
    }

    if (block.type === 'cta' || block.action) {
      return 'cta';
    }

    if (block.size === 'small' || block.fontSize < 10) {
      return 'caption';
    }

    // Default to body text
    return 'body';
  }

  /**
   * Calculate content density (text per unit area)
   */
  calculateContentDensity(blocks) {
    const totalArea = this.page.width * this.page.height;
    const textBlocks = blocks.filter(b => b.type === 'text' || !b.type);
    const totalTextLength = textBlocks.reduce((sum, b) => sum + (b.content?.length || 0), 0);

    // Characters per square point
    const density = totalTextLength / totalArea;

    // Classify density
    if (density < 0.05) return 'sparse';
    if (density < 0.15) return 'balanced';
    if (density < 0.25) return 'dense';
    return 'very-dense';
  }

  /**
   * Calculate text to image ratio
   */
  calculateTextImageRatio(blocks) {
    const textBlocks = blocks.filter(b => b.type === 'text' || !b.type);
    const imageBlocks = blocks.filter(b => b.type === 'image' || b.image);

    if (imageBlocks.length === 0) return Infinity;
    return textBlocks.length / imageBlocks.length;
  }

  /**
   * Calculate content complexity
   */
  calculateComplexity(blocks) {
    const factors = {
      blockCount: Math.min(blocks.length / 10, 1.0),
      types: Object.keys(this.categorizeBlocks(blocks)).length / 10,
      nesting: this.calculateNestingDepth(blocks) / 5
    };

    const complexity = (factors.blockCount + factors.types + factors.nesting) / 3;

    if (complexity < 0.3) return 'simple';
    if (complexity < 0.6) return 'moderate';
    if (complexity < 0.8) return 'complex';
    return 'very-complex';
  }

  /**
   * Calculate nesting depth
   */
  calculateNestingDepth(blocks, depth = 0) {
    let maxDepth = depth;

    blocks.forEach(block => {
      if (block.children && block.children.length > 0) {
        const childDepth = this.calculateNestingDepth(block.children, depth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    });

    return maxDepth;
  }

  /**
   * Extract content hierarchy
   */
  extractHierarchy(blocks) {
    const hierarchy = [];
    let currentLevel = 0;

    blocks.forEach(block => {
      const level = this.determineHierarchyLevel(block);
      hierarchy.push({ block, level });
      currentLevel = level;
    });

    return hierarchy;
  }

  /**
   * Determine hierarchy level (1 = most important)
   */
  determineHierarchyLevel(block) {
    if (block.importance) return block.importance;

    // Size-based hierarchy
    if (block.fontSize) {
      if (block.fontSize >= 42) return 1;
      if (block.fontSize >= 28) return 2;
      if (block.fontSize >= 18) return 3;
      return 4;
    }

    // Type-based hierarchy
    const typeHierarchy = {
      hero: 1,
      headline: 1,
      subhead: 2,
      callout: 2,
      body: 3,
      caption: 4,
      sidebar: 5
    };

    return typeHierarchy[block.type] || 3;
  }

  /**
   * Select optimal grid system based on content
   */
  selectOptimalGrid(analysis, constraints = {}) {
    // User preference takes priority
    if (constraints.grid) {
      return this.grids[constraints.grid] || this.grids.swiss;
    }

    // Content-based selection
    const { contentDensity, complexity, textImageRatio } = analysis;

    // Very dense text → manuscript grid
    if (contentDensity === 'very-dense' && textImageRatio > 5) {
      return this.grids.manuscript;
    }

    // Complex layouts → Swiss grid (most flexible)
    if (complexity === 'complex' || complexity === 'very-complex') {
      return this.grids.swiss;
    }

    // Sparse content with images → golden ratio
    if (contentDensity === 'sparse' && textImageRatio < 2) {
      return this.grids.golden;
    }

    // Organic content → Fibonacci
    if (analysis.blockTypes.image.length > 3) {
      return this.grids.fibonacci;
    }

    // Default: Swiss grid (universal)
    return this.grids.swiss;
  }

  /**
   * Apply golden ratio proportions
   */
  applyGoldenRatio(gridSystem, analysis) {
    const phi = 1.618;
    const page = { ...this.page };

    // Calculate golden ratio divisions
    const goldenPoint = {
      x: page.width / phi,   // ~61.8% (378pt)
      y: page.height / phi   // ~61.8% (489pt)
    };

    // Create zones based on golden ratio
    const zones = {
      primary: {
        x: 0,
        y: 0,
        width: goldenPoint.x,
        height: page.height,
        importance: 1.0,
        description: 'Main content area (61.8%)'
      },
      secondary: {
        x: goldenPoint.x,
        y: 0,
        width: page.width - goldenPoint.x,
        height: page.height,
        importance: 0.618,
        description: 'Secondary area (38.2%)'
      },
      focal: {
        x: goldenPoint.x,
        y: goldenPoint.y,
        importance: 2.0,
        description: 'Golden ratio focal point'
      }
    };

    return {
      grid: gridSystem,
      page,
      phi,
      goldenPoint,
      zones,
      elements: []
    };
  }

  /**
   * Balance visual weight across layout
   */
  balanceVisualWeight(layout, analysis) {
    const blocks = analysis.hierarchy;

    // Assign visual weight to each block
    const elements = blocks.map((item, idx) => {
      const element = this.createElementFromBlock(item.block, idx);
      element.visualWeight = this.calculateVisualWeight(element);
      element.hierarchyLevel = item.level;
      return element;
    });

    // Position elements to balance weight
    const positioned = this.positionElementsBalanced(elements, layout);

    // Calculate quadrant weights
    const quadrants = this.calculateQuadrantWeights(positioned, layout.page);

    // Rebalance if needed
    const balanced = this.rebalanceQuadrants(positioned, quadrants, layout.page);

    return {
      ...layout,
      elements: balanced,
      quadrants
    };
  }

  /**
   * Create layout element from content block
   */
  createElementFromBlock(block, index) {
    return {
      id: `element-${index}`,
      type: block.type || 'text',
      content: block.content || '',
      fontSize: block.fontSize || 11,
      color: block.color || '#000000',
      hasImage: !!block.image,
      emphasis: block.emphasis || 'normal',
      width: block.width || 300,
      height: block.height || 100,
      area: (block.width || 300) * (block.height || 100),
      x: 0,
      y: 0,
      originalBlock: block
    };
  }

  /**
   * Calculate visual weight of element
   */
  calculateVisualWeight(element) {
    const weights = {
      size: (element.area / 10000) * this.weightFactors.size,
      color: this.getColorWeight(element.color) * this.weightFactors.color,
      contrast: this.getContrastWeight(element) * this.weightFactors.contrast,
      imagery: element.hasImage ? this.weightFactors.imagery : 1.0,
      emphasis: this.getEmphasisWeight(element.emphasis)
    };

    // Total weight is product of factors
    const total = weights.size * weights.color * weights.contrast * weights.imagery * weights.emphasis;

    return {
      ...weights,
      total,
      normalized: Math.min(total / 10, 1.0)  // Normalize to 0-1
    };
  }

  /**
   * Get weight from color (warmer = heavier)
   */
  getColorWeight(colorHex) {
    // Check brand colors
    for (const [name, color] of Object.entries(this.brandColors)) {
      if (color.hex.toLowerCase() === colorHex.toLowerCase()) {
        return color.weight;
      }
    }

    // Parse RGB
    const hex = colorHex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Lightness (lighter = less weight)
    const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    const darknessWeight = 1.0 - lightness;

    // Warmth (red/orange = more weight)
    const warmth = (r - b) / 2 + 0.5;

    return (darknessWeight * 0.6 + warmth * 0.4);
  }

  /**
   * Get contrast weight
   */
  getContrastWeight(element) {
    // High contrast = more weight
    const hasHighContrast = element.emphasis === 'high' || element.type === 'headline';
    return hasHighContrast ? 1.2 : 0.8;
  }

  /**
   * Get emphasis weight
   */
  getEmphasisWeight(emphasis) {
    const weights = {
      high: 1.5,
      medium: 1.0,
      low: 0.7,
      normal: 1.0
    };
    return weights[emphasis] || 1.0;
  }

  /**
   * Position elements for balanced weight
   */
  positionElementsBalanced(elements, layout) {
    const positioned = [];
    const grid = this.gridSystem.createGrid(layout.grid, layout.page);

    let currentY = layout.page.margins?.top || 40;

    elements.forEach((element, idx) => {
      // Determine optimal position based on weight and hierarchy
      const position = this.calculateOptimalPosition(element, positioned, layout, currentY);

      positioned.push({
        ...element,
        x: position.x,
        y: position.y,
        gridColumn: position.gridColumn,
        gridSpan: position.gridSpan
      });

      currentY = position.y + element.height + 20; // 20pt spacing
    });

    return positioned;
  }

  /**
   * Calculate optimal position for element
   */
  calculateOptimalPosition(element, existingElements, layout, currentY) {
    const grid = layout.grid;
    const margins = grid.margins || { left: 40, right: 40 };

    // High hierarchy → centered or left-aligned full-width
    if (element.hierarchyLevel === 1) {
      return {
        x: margins.left,
        y: currentY,
        gridColumn: 1,
        gridSpan: 12
      };
    }

    // Medium hierarchy → main content area
    if (element.hierarchyLevel <= 3) {
      return {
        x: margins.left,
        y: currentY,
        gridColumn: 1,
        gridSpan: 8  // 8 of 12 columns
      };
    }

    // Low hierarchy → sidebar or caption
    return {
      x: layout.page.width - margins.right - element.width,
      y: currentY,
      gridColumn: 9,
      gridSpan: 4
    };
  }

  /**
   * Calculate weight in each quadrant
   */
  calculateQuadrantWeights(elements, page) {
    const quadrants = {
      topLeft: { x: 0, y: 0, width: page.width / 2, height: page.height / 2, weight: 0 },
      topRight: { x: page.width / 2, y: 0, width: page.width / 2, height: page.height / 2, weight: 0 },
      bottomLeft: { x: 0, y: page.height / 2, width: page.width / 2, height: page.height / 2, weight: 0 },
      bottomRight: { x: page.width / 2, y: page.height / 2, width: page.width / 2, height: page.height / 2, weight: 0 }
    };

    elements.forEach(element => {
      // Determine which quadrant(s) element is in
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;

      if (centerX < page.width / 2) {
        if (centerY < page.height / 2) {
          quadrants.topLeft.weight += element.visualWeight.total;
        } else {
          quadrants.bottomLeft.weight += element.visualWeight.total;
        }
      } else {
        if (centerY < page.height / 2) {
          quadrants.topRight.weight += element.visualWeight.total;
        } else {
          quadrants.bottomRight.weight += element.visualWeight.total;
        }
      }
    });

    return quadrants;
  }

  /**
   * Rebalance quadrants if needed
   */
  rebalanceQuadrants(elements, quadrants, page) {
    // Calculate imbalance
    const weights = Object.values(quadrants).map(q => q.weight);
    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    const maxImbalance = Math.max(...weights.map(w => Math.abs(w - avgWeight)));

    // If imbalance > 30%, attempt rebalancing
    if (maxImbalance > avgWeight * 0.3) {
      // For now, return as-is (full rebalancing is complex)
      // In production, would use optimization algorithm
      console.warn('⚠️  Layout imbalance detected:', maxImbalance.toFixed(2));
    }

    return elements;
  }

  /**
   * Create focal points for eye guidance
   */
  createFocalPoints(layout, analysis) {
    // Z-pattern for Western reading (most common)
    const zPattern = [
      { x: 0.1, y: 0.1, strength: 1.0, name: 'Primary Entry' },   // Top left (start)
      { x: 0.9, y: 0.1, strength: 0.8, name: 'Secondary' },       // Top right
      { x: 0.1, y: 0.5, strength: 0.6, name: 'Middle Anchor' },   // Middle left
      { x: 0.9, y: 0.9, strength: 0.9, name: 'Call to Action' }   // Bottom right (CTA)
    ];

    // F-pattern for text-heavy content
    const fPattern = [
      { x: 0.1, y: 0.1, strength: 1.0, name: 'Start' },
      { x: 0.7, y: 0.1, strength: 0.8, name: 'Top Bar' },
      { x: 0.1, y: 0.3, strength: 0.7, name: 'Second Bar' },
      { x: 0.5, y: 0.3, strength: 0.6, name: 'Second Bar End' },
      { x: 0.1, y: 0.5, strength: 0.5, name: 'Stem' }
    ];

    // Select pattern based on content
    const pattern = analysis.textImageRatio > 3 ? fPattern : zPattern;

    // Map elements to focal points
    const withFocal = layout.elements.map((element, idx) => {
      const focalPoint = pattern[idx % pattern.length];

      return {
        ...element,
        focalPoint: {
          ...focalPoint,
          absoluteX: focalPoint.x * layout.page.width,
          absoluteY: focalPoint.y * layout.page.height
        },
        // Adjust position to be near focal point
        isNearFocal: this.isNearFocalPoint(element, focalPoint, layout.page)
      };
    });

    return {
      ...layout,
      elements: withFocal,
      eyeFlowPattern: pattern
    };
  }

  /**
   * Check if element is near focal point
   */
  isNearFocalPoint(element, focalPoint, page) {
    const elementCenterX = (element.x + element.width / 2) / page.width;
    const elementCenterY = (element.y + element.height / 2) / page.height;

    const distance = Math.sqrt(
      Math.pow(elementCenterX - focalPoint.x, 2) +
      Math.pow(elementCenterY - focalPoint.y, 2)
    );

    return distance < 0.2;  // Within 20% of focal point
  }

  /**
   * Optimize whitespace (breathing room)
   */
  optimizeWhitespace(layout, analysis) {
    const { contentDensity } = analysis;

    // Adjust spacing based on density
    const spacingMultiplier = {
      'sparse': 1.5,
      'balanced': 1.0,
      'dense': 0.75,
      'very-dense': 0.6
    }[contentDensity] || 1.0;

    const elements = layout.elements.map((element, idx) => {
      const nextElement = layout.elements[idx + 1];

      // Calculate optimal spacing
      const baseSpacing = 20;
      const spacing = baseSpacing * spacingMultiplier;

      // Add spacing based on hierarchy change
      let hierarchySpacing = 0;
      if (nextElement && nextElement.hierarchyLevel < element.hierarchyLevel) {
        hierarchySpacing = 40 * spacingMultiplier;  // More space before higher hierarchy
      }

      return {
        ...element,
        marginBottom: spacing + hierarchySpacing,
        whitespace: {
          top: idx === 0 ? layout.page.margins?.top || 40 : spacing,
          bottom: spacing + hierarchySpacing,
          breathing: spacingMultiplier
        }
      };
    });

    return {
      ...layout,
      elements,
      whitespaceStrategy: contentDensity
    };
  }

  /**
   * AI-powered layout refinement
   */
  async refineWithAI(layout, analysis) {
    if (this.options.debug) {
      console.log('🤖 Refining layout with AI...');
    }

    try {
      const prompt = this.buildLayoutCritiquePrompt(layout, analysis);

      const response = await this.anthropic.messages.create({
        model: this.options.model,
        max_tokens: 4000,
        thinking: {
          type: 'enabled',
          budget_tokens: this.options.thinkingBudget
        },
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Parse AI response
      const textContent = response.content.find(block => block.type === 'text');
      if (!textContent) {
        console.warn('⚠️  No text response from AI');
        return layout;
      }

      // Extract JSON from response
      const jsonMatch = textContent.text.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        console.warn('⚠️  No JSON found in AI response');
        return layout;
      }

      const suggestions = JSON.parse(jsonMatch[1]);

      // Apply suggestions
      const refined = this.applySuggestions(layout, suggestions);

      if (this.options.debug) {
        console.log('✅ AI refinement complete');
        console.log(`   Suggestions applied: ${suggestions.changes?.length || 0}`);
      }

      return refined;

    } catch (error) {
      console.error('❌ AI refinement failed:', error.message);
      return layout;  // Return original on error
    }
  }

  /**
   * Build prompt for AI layout critique
   */
  buildLayoutCritiquePrompt(layout, analysis) {
    return `You are a world-class layout designer and typography expert. Critique and improve this layout design.

**Current Layout:**
- Grid: ${layout.grid.name}
- Elements: ${layout.elements.length}
- Content Density: ${analysis.contentDensity}
- Complexity: ${analysis.complexity}

**Element Details:**
${layout.elements.map((el, idx) => `
${idx + 1}. ${el.type} (${el.hierarchyLevel} hierarchy)
   - Position: (${Math.round(el.x)}, ${Math.round(el.y)})
   - Size: ${Math.round(el.width)} × ${Math.round(el.height)}
   - Visual Weight: ${el.visualWeight.total.toFixed(2)}
   - Near Focal: ${el.isNearFocal ? 'Yes' : 'No'}
`).join('')}

**Design Principles to Consider:**
1. **Visual Hierarchy** - Most important elements should dominate
2. **Eye Flow** - Guide reader through content naturally (Z or F pattern)
3. **Balance** - Distribute visual weight evenly across quadrants
4. **Proximity** - Related elements should be grouped
5. **Whitespace** - Adequate breathing room between elements
6. **Alignment** - Elements should align to grid
7. **Contrast** - Important elements need strong contrast
8. **Rhythm** - Consistent spacing creates visual rhythm

**Your Task:**
1. Analyze the current layout for violations or opportunities
2. Suggest specific improvements (position, size, spacing)
3. Rate the layout on each principle (0-10)
4. Provide reasoning for each suggestion

**Return Format (JSON):**
\`\`\`json
{
  "scores": {
    "hierarchy": 8,
    "eyeFlow": 7,
    "balance": 6,
    "proximity": 9,
    "whitespace": 8,
    "alignment": 7,
    "contrast": 8,
    "rhythm": 7,
    "overall": 7.5
  },
  "strengths": ["Good use of whitespace", "Clear hierarchy"],
  "weaknesses": ["Imbalanced weight in top-right", "CTA too small"],
  "changes": [
    {
      "elementId": "element-3",
      "property": "y",
      "currentValue": 400,
      "suggestedValue": 420,
      "reason": "Add 20pt spacing for better breathing room"
    }
  ],
  "reasoning": "Overall solid layout with room for refinement..."
}
\`\`\`

Be specific and actionable. Focus on measurable improvements.`;
  }

  /**
   * Apply AI suggestions to layout
   */
  applySuggestions(layout, suggestions) {
    if (!suggestions.changes || suggestions.changes.length === 0) {
      return layout;
    }

    const elements = layout.elements.map(element => {
      // Find suggestions for this element
      const elementChanges = suggestions.changes.filter(
        change => change.elementId === element.id
      );

      if (elementChanges.length === 0) return element;

      // Apply changes
      const updated = { ...element };
      elementChanges.forEach(change => {
        updated[change.property] = change.suggestedValue;
      });

      return updated;
    });

    return {
      ...layout,
      elements,
      aiSuggestions: suggestions
    };
  }

  /**
   * Calculate layout quality metrics
   */
  calculateMetrics(layout) {
    return {
      balance: this.calculateBalanceScore(layout),
      harmony: this.calculateHarmonyScore(layout),
      hierarchy: this.calculateHierarchyScore(layout),
      whitespace: this.calculateWhitespaceScore(layout),
      alignment: this.calculateAlignmentScore(layout),
      overall: 0  // Will be calculated
    };
  }

  calculateBalanceScore(layout) {
    const quadrants = layout.quadrants || {};
    const weights = Object.values(quadrants).map(q => q.weight || 0);

    if (weights.length === 0) return 0;

    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;
    const variance = weights.reduce((sum, w) => sum + Math.pow(w - avgWeight, 2), 0) / weights.length;

    // Lower variance = better balance
    return Math.max(0, 10 - variance);
  }

  calculateHarmonyScore(layout) {
    // Check if golden ratio is used
    const hasGolden = layout.grid.name === 'Golden Ratio' || layout.phi;
    return hasGolden ? 9 : 7;
  }

  calculateHierarchyScore(layout) {
    // Check if hierarchy levels are properly distributed
    const hierarchyLevels = layout.elements.map(el => el.hierarchyLevel);
    const uniqueLevels = new Set(hierarchyLevels);

    // 3-5 hierarchy levels is optimal
    if (uniqueLevels.size >= 3 && uniqueLevels.size <= 5) {
      return 9;
    }
    return 6;
  }

  calculateWhitespaceScore(layout) {
    // Calculate whitespace ratio
    const totalArea = layout.page.width * layout.page.height;
    const contentArea = layout.elements.reduce((sum, el) => sum + el.area, 0);
    const whitespaceRatio = (totalArea - contentArea) / totalArea;

    // 30-50% whitespace is optimal
    if (whitespaceRatio >= 0.3 && whitespaceRatio <= 0.5) {
      return 9;
    }
    if (whitespaceRatio >= 0.2 && whitespaceRatio <= 0.6) {
      return 7;
    }
    return 5;
  }

  calculateAlignmentScore(layout) {
    // All elements should align to grid
    const grid = this.gridSystem.createGrid(layout.grid, layout.page);
    const alignedElements = layout.elements.filter(el =>
      el.gridColumn && el.gridSpan
    );

    const alignmentRatio = alignedElements.length / layout.elements.length;
    return Math.round(alignmentRatio * 10);
  }

  /**
   * Export layout to InDesign format
   */
  exportToInDesign(layout) {
    return {
      document: {
        width: layout.page.width,
        height: layout.page.height,
        margins: layout.grid.margins
      },
      grid: {
        columns: layout.grid.columns,
        gutters: layout.grid.gutters,
        baseline: layout.grid.baseline
      },
      elements: layout.elements.map(el => ({
        type: el.type,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        content: el.content,
        fontSize: el.fontSize,
        color: el.color,
        gridColumn: el.gridColumn,
        gridSpan: el.gridSpan
      }))
    };
  }

  /**
   * Generate layout report
   */
  generateReport(layout) {
    const metrics = layout.metrics || this.calculateMetrics(layout);

    return {
      summary: {
        grid: layout.grid.name,
        elements: layout.elements.length,
        pages: 1
      },
      metrics: {
        balance: `${metrics.balance.toFixed(1)}/10`,
        harmony: `${metrics.harmony.toFixed(1)}/10`,
        hierarchy: `${metrics.hierarchy.toFixed(1)}/10`,
        whitespace: `${metrics.whitespace.toFixed(1)}/10`,
        alignment: `${metrics.alignment.toFixed(1)}/10`
      },
      eyeFlow: layout.eyeFlowPattern?.map(fp => fp.name).join(' → '),
      aiSuggestions: layout.aiSuggestions?.changes?.length || 0,
      recommendations: this.generateRecommendations(layout, metrics)
    };
  }

  generateRecommendations(layout, metrics) {
    const recommendations = [];

    if (metrics.balance < 7) {
      recommendations.push('⚠️  Improve balance by redistributing visual weight');
    }

    if (metrics.whitespace < 7) {
      recommendations.push('⚠️  Add more whitespace for breathing room');
    }

    if (metrics.hierarchy < 7) {
      recommendations.push('⚠️  Strengthen visual hierarchy with better contrast');
    }

    if (metrics.alignment < 8) {
      recommendations.push('⚠️  Align more elements to grid for consistency');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Layout meets all quality standards');
    }

    return recommendations;
  }
}

module.exports = LayoutArchitect;
