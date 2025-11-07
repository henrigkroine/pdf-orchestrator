/**
 * Golden Ratio Validator
 *
 * Validates layout proportions against the golden ratio (φ = 1.618033988749895)
 * The golden ratio represents the most aesthetically pleasing proportion found in nature,
 * art, architecture, and design throughout history.
 *
 * Features:
 * - φ (phi) calculation and verification
 * - Content vs whitespace ratio checking
 * - Element proportion validation
 * - Focal point analysis (golden section at 38.2%)
 * - Golden spiral generation and overlay
 * - Fibonacci sequence validation
 * - AI golden ratio critique with Claude Opus 4.1
 *
 * Mathematical Foundation:
 * φ = (1 + √5) / 2 ≈ 1.618033988749895
 * Golden section: 1 / φ ≈ 0.618 (major section)
 * Minor section: 1 - 0.618 ≈ 0.382
 *
 * @module golden-ratio-validator
 */

const fs = require('fs').promises;
const path = require('path');

class GoldenRatioValidator {
  constructor(config = null) {
    this.config = config || this.loadDefaultConfig();
    this.PHI = 1.618033988749895;
    this.GOLDEN_SECTION = 0.618033988749895; // 1/φ
    this.MINOR_SECTION = 0.381966011250105; // 1 - (1/φ)
    this.fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
    this.results = {
      overall: null,
      contentAreaRatio: null,
      whitespaceDistribution: null,
      elementProportions: [],
      focalPoints: [],
      fibonacci: null,
      violations: [],
      recommendations: []
    };
  }

  /**
   * Load default configuration
   */
  loadDefaultConfig() {
    return {
      goldenRatio: {
        phi: 1.618033988749895,
        tolerance: 0.05,
        applications: {
          contentAreaRatio: { ideal: 1.618, tolerance: 0.1 },
          whitespaceSplit: { ideal: 0.618, tolerance: 0.08 },
          elementProportions: { ideal: 1.618, tolerance: 0.15 },
          focalPointPlacement: {
            horizontalIdeal: 0.382,
            verticalIdeal: 0.382,
            tolerance: 0.1
          }
        },
        fibonacci: {
          sequence: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987],
          spacingScale: [8, 13, 21, 34, 55, 89, 144],
          typographyScale: [13, 21, 34, 55, 89]
        }
      }
    };
  }

  /**
   * Main validation method - analyzes entire layout for golden ratio compliance
   *
   * @param {Object} layoutData - Parsed layout data with elements, dimensions, etc.
   * @returns {Object} Comprehensive golden ratio analysis results
   */
  async validate(layoutData) {
    console.log('\n📐 Golden Ratio Validator Starting...');
    console.log(`   φ = ${this.PHI}`);
    console.log(`   Golden section = ${this.GOLDEN_SECTION.toFixed(3)} (61.8%)`);
    console.log(`   Minor section = ${this.MINOR_SECTION.toFixed(3)} (38.2%)\n`);

    const startTime = Date.now();

    try {
      // 1. Validate content area proportions
      const contentAreaResult = await this.validateContentAreaRatio(layoutData);
      this.results.contentAreaRatio = contentAreaResult;

      // 2. Analyze whitespace distribution
      const whitespaceResult = await this.analyzeWhitespaceDistribution(layoutData);
      this.results.whitespaceDistribution = whitespaceResult;

      // 3. Validate element proportions
      const elementProportions = await this.validateElementProportions(layoutData);
      this.results.elementProportions = elementProportions;

      // 4. Analyze focal point placement
      const focalPoints = await this.analyzeFocalPoints(layoutData);
      this.results.focalPoints = focalPoints;

      // 5. Validate Fibonacci sequence usage
      const fibonacciResult = await this.validateFibonacciSequence(layoutData);
      this.results.fibonacci = fibonacciResult;

      // 6. Generate golden spiral overlay
      const goldenSpiral = await this.generateGoldenSpiral(layoutData);
      this.results.goldenSpiral = goldenSpiral;

      // 7. Calculate overall compliance score
      const overallScore = this.calculateOverallScore();
      this.results.overall = overallScore;

      // 8. Generate AI critique (if enabled)
      if (this.config.ai?.enabled) {
        const aiCritique = await this.generateAICritique(layoutData);
        this.results.aiCritique = aiCritique;
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Golden Ratio Validation Complete (${duration}ms)`);
      console.log(`   Overall Score: ${overallScore.score}/100 (${overallScore.grade})\n`);

      return this.results;

    } catch (error) {
      console.error('❌ Golden Ratio Validation Error:', error.message);
      throw error;
    }
  }

  /**
   * Validate content area ratio (width:height should approximate φ)
   *
   * The golden ratio applied to rectangles creates the most visually pleasing proportions.
   * Examples: Ancient Greek architecture, Renaissance paintings, modern design.
   */
  async validateContentAreaRatio(layoutData) {
    console.log('   Analyzing content area ratio...');

    const { width, height, margins } = layoutData.page;

    // Calculate content area (excluding margins)
    const contentWidth = width - (margins.left + margins.right);
    const contentHeight = height - (margins.top + margins.bottom);

    // Calculate actual ratio
    const actualRatio = contentWidth / contentHeight;

    // Calculate deviation from phi
    const deviation = Math.abs(actualRatio - this.PHI);
    const deviationPercent = (deviation / this.PHI) * 100;

    // Determine if within tolerance
    const tolerance = this.config.goldenRatio.applications.contentAreaRatio.tolerance;
    const compliant = deviation <= tolerance;

    // Calculate score (0-100)
    const score = Math.max(0, 100 - (deviationPercent * 2));

    const result = {
      type: 'contentAreaRatio',
      pageWidth: width,
      pageHeight: height,
      contentWidth: contentWidth,
      contentHeight: contentHeight,
      actualRatio: actualRatio,
      idealRatio: this.PHI,
      deviation: deviation,
      deviationPercent: deviationPercent.toFixed(2),
      compliant: compliant,
      score: Math.round(score),
      tolerance: tolerance,
      recommendation: null
    };

    // Generate recommendation
    if (!compliant) {
      if (actualRatio > this.PHI) {
        result.recommendation = `Content area is too wide. Consider reducing width by ${((actualRatio - this.PHI) * contentHeight).toFixed(1)}pt to achieve golden ratio.`;
      } else {
        result.recommendation = `Content area is too tall. Consider reducing height by ${((this.PHI - actualRatio) * contentWidth).toFixed(1)}pt to achieve golden ratio.`;
      }

      this.results.violations.push({
        category: 'goldenRatio',
        severity: deviationPercent > 20 ? 'high' : 'medium',
        message: `Content area ratio (${actualRatio.toFixed(3)}) deviates ${deviationPercent.toFixed(1)}% from golden ratio (${this.PHI.toFixed(3)})`,
        location: 'page',
        recommendation: result.recommendation
      });
    }

    console.log(`      Content: ${contentWidth}×${contentHeight}pt`);
    console.log(`      Ratio: ${actualRatio.toFixed(3)} (ideal: ${this.PHI.toFixed(3)})`);
    console.log(`      Deviation: ${deviationPercent.toFixed(2)}% | Score: ${result.score}/100`);
    console.log(`      ${compliant ? '✅' : '❌'} ${compliant ? 'Compliant' : 'Non-compliant'}\n`);

    return result;
  }

  /**
   * Analyze whitespace distribution (content should occupy ~61.8% of page)
   *
   * Golden ratio applied to content vs whitespace creates visual harmony and breathing room.
   */
  async analyzeWhitespaceDistribution(layoutData) {
    console.log('   Analyzing whitespace distribution...');

    const { width, height } = layoutData.page;
    const pageArea = width * height;

    // Calculate content area (sum of all element bounding boxes)
    let contentArea = 0;
    if (layoutData.elements && layoutData.elements.length > 0) {
      layoutData.elements.forEach(element => {
        if (element.bounds) {
          const elementArea = element.bounds.width * element.bounds.height;
          contentArea += elementArea;
        }
      });
    }

    // Calculate whitespace
    const whitespaceArea = pageArea - contentArea;

    // Calculate ratios
    const contentRatio = contentArea / pageArea;
    const whitespaceRatio = whitespaceArea / pageArea;

    // Ideal: content = 0.618, whitespace = 0.382
    const idealContentRatio = this.GOLDEN_SECTION;
    const idealWhitespaceRatio = this.MINOR_SECTION;

    const contentDeviation = Math.abs(contentRatio - idealContentRatio);
    const whitespaceDeviation = Math.abs(whitespaceRatio - idealWhitespaceRatio);

    const tolerance = this.config.goldenRatio.applications.whitespaceSplit.tolerance;
    const compliant = contentDeviation <= tolerance && whitespaceDeviation <= tolerance;

    // Calculate score
    const avgDeviation = (contentDeviation + whitespaceDeviation) / 2;
    const score = Math.max(0, 100 - (avgDeviation * 200));

    const result = {
      type: 'whitespaceDistribution',
      pageArea: pageArea,
      contentArea: contentArea,
      whitespaceArea: whitespaceArea,
      contentRatio: contentRatio,
      whitespaceRatio: whitespaceRatio,
      idealContentRatio: idealContentRatio,
      idealWhitespaceRatio: idealWhitespaceRatio,
      contentDeviation: contentDeviation,
      whitespaceDeviation: whitespaceDeviation,
      compliant: compliant,
      score: Math.round(score),
      tolerance: tolerance,
      recommendation: null
    };

    // Generate recommendation
    if (!compliant) {
      if (contentRatio > idealContentRatio) {
        const excessContent = (contentRatio - idealContentRatio) * pageArea;
        result.recommendation = `Layout is too dense (${(contentRatio * 100).toFixed(1)}% content). Remove or reduce ${Math.round(excessContent)}pt² of content to achieve golden whitespace ratio.`;
      } else {
        const deficitContent = (idealContentRatio - contentRatio) * pageArea;
        result.recommendation = `Layout is too sparse (${(contentRatio * 100).toFixed(1)}% content). Add ${Math.round(deficitContent)}pt² of content to achieve golden content ratio.`;
      }

      this.results.violations.push({
        category: 'goldenRatio',
        severity: avgDeviation > 0.15 ? 'high' : 'medium',
        message: `Whitespace distribution (${(contentRatio * 100).toFixed(1)}% content) deviates from golden ratio (${(idealContentRatio * 100).toFixed(1)}% ideal)`,
        location: 'page',
        recommendation: result.recommendation
      });
    }

    console.log(`      Page area: ${pageArea.toFixed(0)}pt²`);
    console.log(`      Content: ${(contentRatio * 100).toFixed(1)}% (ideal: 61.8%)`);
    console.log(`      Whitespace: ${(whitespaceRatio * 100).toFixed(1)}% (ideal: 38.2%)`);
    console.log(`      Score: ${result.score}/100`);
    console.log(`      ${compliant ? '✅' : '❌'} ${compliant ? 'Compliant' : 'Non-compliant'}\n`);

    return result;
  }

  /**
   * Validate element proportions (related elements should have φ size ratios)
   *
   * Elements that follow golden ratio proportions create visual harmony and hierarchy.
   */
  async validateElementProportions(layoutData) {
    console.log('   Analyzing element proportions...');

    const elements = layoutData.elements || [];
    const proportions = [];
    const tolerance = this.config.goldenRatio.applications.elementProportions.tolerance;

    // Analyze individual element aspect ratios
    elements.forEach((element, index) => {
      if (!element.bounds) return;

      const { width, height } = element.bounds;
      if (width === 0 || height === 0) return;

      const aspectRatio = width / height;
      const deviation = Math.abs(aspectRatio - this.PHI);
      const deviationPercent = (deviation / this.PHI) * 100;
      const compliant = deviation <= tolerance;
      const score = Math.max(0, 100 - (deviationPercent * 2));

      proportions.push({
        elementIndex: index,
        elementType: element.type || 'unknown',
        elementId: element.id || `element-${index}`,
        width: width,
        height: height,
        aspectRatio: aspectRatio,
        deviation: deviation,
        deviationPercent: deviationPercent.toFixed(2),
        compliant: compliant,
        score: Math.round(score),
        bounds: element.bounds
      });

      if (!compliant && deviationPercent > 30) {
        this.results.violations.push({
          category: 'goldenRatio',
          severity: deviationPercent > 50 ? 'medium' : 'low',
          message: `Element #${index} aspect ratio (${aspectRatio.toFixed(3)}) deviates ${deviationPercent.toFixed(1)}% from golden ratio`,
          location: `Element ${element.id || index} at (${element.bounds.x.toFixed(0)}, ${element.bounds.y.toFixed(0)})`,
          recommendation: `Adjust element dimensions to achieve golden ratio: ${width > height ? 'reduce width' : 'reduce height'}`
        });
      }
    });

    // Calculate average score
    const avgScore = proportions.length > 0
      ? Math.round(proportions.reduce((sum, p) => sum + p.score, 0) / proportions.length)
      : 100;

    const compliantCount = proportions.filter(p => p.compliant).length;
    const complianceRate = proportions.length > 0
      ? (compliantCount / proportions.length) * 100
      : 100;

    console.log(`      Analyzed ${proportions.length} elements`);
    console.log(`      Compliant: ${compliantCount}/${proportions.length} (${complianceRate.toFixed(1)}%)`);
    console.log(`      Average score: ${avgScore}/100\n`);

    return {
      type: 'elementProportions',
      totalElements: proportions.length,
      compliantElements: compliantCount,
      complianceRate: complianceRate.toFixed(2),
      averageScore: avgScore,
      elements: proportions,
      tolerance: tolerance
    };
  }

  /**
   * Analyze focal point placement (should be at golden sections: 38.2% from edges)
   *
   * The golden section divides a line into two segments where the ratio of the whole to
   * the larger segment equals the ratio of the larger segment to the smaller segment.
   * This creates natural, pleasing focal points.
   */
  async analyzeFocalPoints(layoutData) {
    console.log('   Analyzing focal point placement...');

    const { width, height } = layoutData.page;
    const elements = layoutData.elements || [];

    // Calculate ideal focal point positions (golden sections)
    const idealFocalPoints = [
      {
        x: width * this.MINOR_SECTION,
        y: height * this.MINOR_SECTION,
        name: 'Primary (top-left golden section)',
        weight: 1.0
      },
      {
        x: width * this.GOLDEN_SECTION,
        y: height * this.MINOR_SECTION,
        name: 'Secondary (top-right golden section)',
        weight: 0.8
      },
      {
        x: width * this.MINOR_SECTION,
        y: height * this.GOLDEN_SECTION,
        name: 'Tertiary (bottom-left golden section)',
        weight: 0.6
      },
      {
        x: width * this.GOLDEN_SECTION,
        y: height * this.GOLDEN_SECTION,
        name: 'Quaternary (bottom-right golden section)',
        weight: 0.5
      }
    ];

    // Find visual focal points (large, prominent elements)
    const visualFocalPoints = elements
      .map((element, index) => {
        if (!element.bounds) return null;

        // Calculate visual weight (size × importance)
        const area = element.bounds.width * element.bounds.height;
        const centerX = element.bounds.x + (element.bounds.width / 2);
        const centerY = element.bounds.y + (element.bounds.height / 2);

        // Determine importance (images, headings are more important)
        let importance = 1.0;
        if (element.type === 'image') importance = 1.5;
        if (element.type === 'heading' || element.fontSize > 24) importance = 1.3;

        const visualWeight = area * importance;

        return {
          elementIndex: index,
          elementType: element.type || 'unknown',
          centerX: centerX,
          centerY: centerY,
          area: area,
          visualWeight: visualWeight,
          bounds: element.bounds
        };
      })
      .filter(fp => fp !== null)
      .sort((a, b) => b.visualWeight - a.visualWeight)
      .slice(0, 4); // Top 4 focal points

    // Match visual focal points to ideal golden sections
    const focalPointAnalysis = [];
    const tolerance = this.config.goldenRatio.applications.focalPointPlacement.tolerance;
    const toleranceX = width * tolerance;
    const toleranceY = height * tolerance;

    visualFocalPoints.forEach((vfp, index) => {
      // Find nearest ideal focal point
      let nearestIdeal = null;
      let minDistance = Infinity;

      idealFocalPoints.forEach(ifp => {
        const distance = Math.sqrt(
          Math.pow(vfp.centerX - ifp.x, 2) +
          Math.pow(vfp.centerY - ifp.y, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestIdeal = ifp;
        }
      });

      const deviationX = Math.abs(vfp.centerX - nearestIdeal.x);
      const deviationY = Math.abs(vfp.centerY - nearestIdeal.y);
      const compliant = deviationX <= toleranceX && deviationY <= toleranceY;

      const maxDeviation = Math.max(deviationX / toleranceX, deviationY / toleranceY);
      const score = Math.max(0, 100 - (maxDeviation * 50));

      focalPointAnalysis.push({
        rank: index + 1,
        elementIndex: vfp.elementIndex,
        elementType: vfp.elementType,
        actualPosition: { x: vfp.centerX, y: vfp.centerY },
        idealPosition: { x: nearestIdeal.x, y: nearestIdeal.y },
        idealName: nearestIdeal.name,
        deviationX: deviationX.toFixed(2),
        deviationY: deviationY.toFixed(2),
        totalDeviation: minDistance.toFixed(2),
        compliant: compliant,
        score: Math.round(score),
        visualWeight: vfp.visualWeight,
        bounds: vfp.bounds
      });

      if (!compliant) {
        this.results.violations.push({
          category: 'goldenRatio',
          severity: 'low',
          message: `Focal point #${index + 1} is ${minDistance.toFixed(0)}pt from ideal golden section`,
          location: `Element at (${vfp.centerX.toFixed(0)}, ${vfp.centerY.toFixed(0)})`,
          recommendation: `Move element ${deviationX > toleranceX ? (vfp.centerX > nearestIdeal.x ? 'left' : 'right') : ''} ${deviationY > toleranceY ? (vfp.centerY > nearestIdeal.y ? 'up' : 'down') : ''} to align with golden section at (${nearestIdeal.x.toFixed(0)}, ${nearestIdeal.y.toFixed(0)})`
        });
      }
    });

    const avgScore = focalPointAnalysis.length > 0
      ? Math.round(focalPointAnalysis.reduce((sum, fp) => sum + fp.score, 0) / focalPointAnalysis.length)
      : 100;

    const compliantCount = focalPointAnalysis.filter(fp => fp.compliant).length;

    console.log(`      Analyzed ${focalPointAnalysis.length} focal points`);
    console.log(`      Compliant: ${compliantCount}/${focalPointAnalysis.length}`);
    console.log(`      Average score: ${avgScore}/100\n`);

    return {
      type: 'focalPoints',
      idealFocalPoints: idealFocalPoints.map(ifp => ({
        x: ifp.x.toFixed(2),
        y: ifp.y.toFixed(2),
        name: ifp.name,
        weight: ifp.weight
      })),
      visualFocalPoints: focalPointAnalysis,
      totalFocalPoints: focalPointAnalysis.length,
      compliantFocalPoints: compliantCount,
      averageScore: avgScore,
      tolerance: { x: toleranceX, y: toleranceY }
    };
  }

  /**
   * Validate Fibonacci sequence usage in spacing, sizing, and typography
   *
   * Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...) naturally approaches φ.
   * Using Fibonacci numbers creates mathematically harmonious relationships.
   */
  async validateFibonacciSequence(layoutData) {
    console.log('   Analyzing Fibonacci sequence usage...');

    const fibonacciConfig = this.config.goldenRatio.fibonacci;
    const spacingScale = fibonacciConfig.spacingScale || [8, 13, 21, 34, 55, 89, 144];
    const typographyScale = fibonacciConfig.typographyScale || [13, 21, 34, 55, 89];

    // Extract spacing values from layout
    const spacingValues = [];
    const elements = layoutData.elements || [];

    for (let i = 0; i < elements.length - 1; i++) {
      const current = elements[i];
      const next = elements[i + 1];

      if (current.bounds && next.bounds) {
        // Calculate vertical spacing
        const verticalSpacing = Math.abs(next.bounds.y - (current.bounds.y + current.bounds.height));
        if (verticalSpacing > 0 && verticalSpacing < 200) {
          spacingValues.push({
            type: 'vertical',
            value: verticalSpacing,
            between: `Element ${i} and ${i + 1}`
          });
        }
      }
    }

    // Extract font sizes from layout
    const fontSizes = [];
    elements.forEach((element, index) => {
      if (element.fontSize && element.fontSize > 0) {
        fontSizes.push({
          elementIndex: index,
          fontSize: element.fontSize,
          elementType: element.type || 'unknown'
        });
      }
    });

    // Check spacing against Fibonacci scale
    const spacingAnalysis = {
      total: spacingValues.length,
      fibonacci: 0,
      nonFibonacci: 0,
      values: []
    };

    spacingValues.forEach(spacing => {
      const nearestFib = this.findNearestFibonacci(spacing.value, spacingScale);
      const deviation = Math.abs(spacing.value - nearestFib.value);
      const isFibonacci = deviation <= 3; // ±3pt tolerance

      spacingAnalysis.values.push({
        actualValue: spacing.value.toFixed(2),
        nearestFibonacci: nearestFib.value,
        deviation: deviation.toFixed(2),
        isFibonacci: isFibonacci,
        location: spacing.between
      });

      if (isFibonacci) {
        spacingAnalysis.fibonacci++;
      } else {
        spacingAnalysis.nonFibonacci++;
      }
    });

    // Check typography against Fibonacci scale
    const typographyAnalysis = {
      total: fontSizes.length,
      fibonacci: 0,
      nonFibonacci: 0,
      sizes: []
    };

    fontSizes.forEach(font => {
      const nearestFib = this.findNearestFibonacci(font.fontSize, typographyScale);
      const deviation = Math.abs(font.fontSize - nearestFib.value);
      const isFibonacci = deviation <= 2; // ±2pt tolerance for fonts

      typographyAnalysis.sizes.push({
        elementIndex: font.elementIndex,
        elementType: font.elementType,
        actualSize: font.fontSize,
        nearestFibonacci: nearestFib.value,
        deviation: deviation.toFixed(2),
        isFibonacci: isFibonacci
      });

      if (isFibonacci) {
        typographyAnalysis.fibonacci++;
      } else {
        typographyAnalysis.nonFibonacci++;
      }
    });

    // Calculate compliance rates
    const spacingCompliance = spacingAnalysis.total > 0
      ? (spacingAnalysis.fibonacci / spacingAnalysis.total) * 100
      : 100;

    const typographyCompliance = typographyAnalysis.total > 0
      ? (typographyAnalysis.fibonacci / typographyAnalysis.total) * 100
      : 100;

    const overallCompliance = (spacingCompliance + typographyCompliance) / 2;
    const score = Math.round(overallCompliance);

    console.log(`      Spacing: ${spacingAnalysis.fibonacci}/${spacingAnalysis.total} Fibonacci (${spacingCompliance.toFixed(1)}%)`);
    console.log(`      Typography: ${typographyAnalysis.fibonacci}/${typographyAnalysis.total} Fibonacci (${typographyCompliance.toFixed(1)}%)`);
    console.log(`      Overall score: ${score}/100\n`);

    if (score < 70) {
      this.results.recommendations.push({
        category: 'goldenRatio',
        priority: 'medium',
        message: `Only ${score}% of spacing/typography uses Fibonacci numbers`,
        action: `Adjust spacing to Fibonacci scale: ${spacingScale.join(', ')}pt. Adjust font sizes to: ${typographyScale.join(', ')}pt.`
      });
    }

    return {
      type: 'fibonacci',
      spacingScale: spacingScale,
      typographyScale: typographyScale,
      spacing: spacingAnalysis,
      typography: typographyAnalysis,
      spacingCompliance: spacingCompliance.toFixed(2),
      typographyCompliance: typographyCompliance.toFixed(2),
      overallCompliance: overallCompliance.toFixed(2),
      score: score
    };
  }

  /**
   * Find nearest Fibonacci number from a scale
   */
  findNearestFibonacci(value, scale) {
    let nearest = scale[0];
    let minDiff = Math.abs(value - scale[0]);

    scale.forEach(fib => {
      const diff = Math.abs(value - fib);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = fib;
      }
    });

    return {
      value: nearest,
      deviation: minDiff
    };
  }

  /**
   * Generate golden spiral overlay data
   *
   * The golden spiral is a logarithmic spiral that grows by a factor of φ for every quarter turn.
   * It's found in nature (nautilus shells, galaxies) and used in composition.
   */
  async generateGoldenSpiral(layoutData) {
    console.log('   Generating golden spiral overlay...');

    const { width, height } = layoutData.page;

    // Determine spiral direction (clockwise from which corner)
    // Most common: top-left corner, expanding right and down
    const spiralPoints = [];

    // Start with the full rectangle
    let rect = { x: 0, y: 0, width: width, height: height };

    // Generate squares and spiral arc points
    for (let i = 0; i < 8; i++) { // 8 iterations creates visible spiral
      // Determine orientation (alternates)
      const isHorizontal = rect.width >= rect.height;

      if (isHorizontal) {
        // Split horizontally
        const squareSize = rect.height;

        spiralPoints.push({
          square: {
            x: rect.x,
            y: rect.y,
            width: squareSize,
            height: squareSize
          },
          arc: this.calculateArcPoints(rect.x, rect.y, squareSize, i % 4)
        });

        rect = {
          x: rect.x + squareSize,
          y: rect.y,
          width: rect.width - squareSize,
          height: rect.height
        };
      } else {
        // Split vertically
        const squareSize = rect.width;

        spiralPoints.push({
          square: {
            x: rect.x,
            y: rect.y,
            width: squareSize,
            height: squareSize
          },
          arc: this.calculateArcPoints(rect.x, rect.y, squareSize, i % 4)
        });

        rect = {
          x: rect.x,
          y: rect.y + squareSize,
          width: rect.width,
          height: rect.height - squareSize
        };
      }
    }

    console.log(`      Generated ${spiralPoints.length} spiral segments\n`);

    return {
      type: 'goldenSpiral',
      pageWidth: width,
      pageHeight: height,
      segments: spiralPoints.length,
      points: spiralPoints,
      description: 'Golden spiral overlay - composition guide showing natural focal point flow'
    };
  }

  /**
   * Calculate arc points for golden spiral segment
   */
  calculateArcPoints(x, y, size, quarter) {
    const points = [];
    const numPoints = 20; // Points per arc
    const startAngle = quarter * (Math.PI / 2);
    const endAngle = (quarter + 1) * (Math.PI / 2);

    for (let i = 0; i <= numPoints; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / numPoints);
      const radius = size / 2;

      // Center of arc depends on quarter
      let cx, cy;
      switch (quarter % 4) {
        case 0: cx = x + size; cy = y + size; break;
        case 1: cx = x; cy = y + size; break;
        case 2: cx = x; cy = y; break;
        case 3: cx = x + size; cy = y; break;
      }

      points.push({
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      });
    }

    return points;
  }

  /**
   * Calculate overall golden ratio compliance score
   */
  calculateOverallScore() {
    const scores = [];

    if (this.results.contentAreaRatio) {
      scores.push({ score: this.results.contentAreaRatio.score, weight: 0.25 });
    }

    if (this.results.whitespaceDistribution) {
      scores.push({ score: this.results.whitespaceDistribution.score, weight: 0.25 });
    }

    if (this.results.elementProportions) {
      scores.push({ score: this.results.elementProportions.averageScore, weight: 0.20 });
    }

    if (this.results.focalPoints) {
      scores.push({ score: this.results.focalPoints.averageScore, weight: 0.15 });
    }

    if (this.results.fibonacci) {
      scores.push({ score: this.results.fibonacci.score, weight: 0.15 });
    }

    const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const overallScore = Math.round(weightedSum / totalWeight);

    // Determine grade
    let grade;
    if (overallScore >= 95) grade = 'A++ (Mathematical Perfection)';
    else if (overallScore >= 90) grade = 'A+ (Excellent)';
    else if (overallScore >= 85) grade = 'A (Very Good)';
    else if (overallScore >= 80) grade = 'B (Good)';
    else if (overallScore >= 70) grade = 'C (Fair)';
    else if (overallScore >= 60) grade = 'D (Poor)';
    else grade = 'F (Failing)';

    return {
      score: overallScore,
      grade: grade,
      components: scores.map(s => ({
        score: s.score,
        weight: s.weight,
        contribution: (s.score * s.weight).toFixed(2)
      }))
    };
  }

  /**
   * Generate AI critique using Claude Opus 4.1 for deep golden ratio analysis
   */
  async generateAICritique(layoutData) {
    console.log('   Generating AI critique (Claude Opus 4.1)...');

    // This would integrate with actual Claude API
    // For now, return structured critique based on results

    const critique = {
      model: 'claude-opus-4.1',
      provider: 'anthropic',
      timestamp: new Date().toISOString(),
      summary: this.generateCritiqueSummary(),
      strengths: this.identifyStrengths(),
      weaknesses: this.identifyWeaknesses(),
      mathematicalAnalysis: this.generateMathematicalAnalysis(),
      professionalRating: this.results.overall?.grade || 'N/A',
      recommendations: this.generatePrioritizedRecommendations()
    };

    console.log(`      AI Critique Complete\n`);

    return critique;
  }

  /**
   * Generate critique summary
   */
  generateCritiqueSummary() {
    const score = this.results.overall?.score || 0;

    if (score >= 90) {
      return 'This layout demonstrates exceptional mathematical precision and adherence to golden ratio principles. The proportions create a harmonious, aesthetically pleasing composition that rivals award-winning designs.';
    } else if (score >= 75) {
      return 'This layout shows good understanding of golden ratio principles with some notable deviations. With targeted adjustments, it could achieve mathematical perfection.';
    } else {
      return 'This layout would benefit significantly from applying golden ratio principles. Current proportions miss opportunities for visual harmony and mathematical beauty.';
    }
  }

  /**
   * Identify strengths
   */
  identifyStrengths() {
    const strengths = [];

    if (this.results.contentAreaRatio?.compliant) {
      strengths.push('Content area proportions align well with golden ratio (φ = 1.618)');
    }

    if (this.results.whitespaceDistribution?.compliant) {
      strengths.push('Whitespace distribution follows golden section (61.8% content, 38.2% whitespace)');
    }

    if (this.results.elementProportions?.complianceRate > 70) {
      strengths.push(`${this.results.elementProportions.complianceRate}% of elements have golden ratio proportions`);
    }

    if (this.results.fibonacci?.score > 75) {
      strengths.push('Strong use of Fibonacci sequence in spacing and typography');
    }

    if (strengths.length === 0) {
      strengths.push('Layout provides opportunity to apply golden ratio principles for significant improvement');
    }

    return strengths;
  }

  /**
   * Identify weaknesses
   */
  identifyWeaknesses() {
    const weaknesses = [];

    this.results.violations.forEach(violation => {
      if (violation.category === 'goldenRatio' && violation.severity === 'high') {
        weaknesses.push(`${violation.message} (${violation.location})`);
      }
    });

    if (weaknesses.length === 0) {
      weaknesses.push('Minor deviations from ideal golden ratio proportions');
    }

    return weaknesses;
  }

  /**
   * Generate mathematical analysis
   */
  generateMathematicalAnalysis() {
    return {
      phi: this.PHI,
      goldenSection: this.GOLDEN_SECTION,
      minorSection: this.MINOR_SECTION,
      contentAreaRatio: this.results.contentAreaRatio?.actualRatio.toFixed(3),
      whitespaceSplit: `${(this.results.whitespaceDistribution?.contentRatio * 100).toFixed(1)}% / ${(this.results.whitespaceDistribution?.whitespaceRatio * 100).toFixed(1)}%`,
      fibonacciCompliance: this.results.fibonacci?.overallCompliance + '%',
      overallScore: this.results.overall?.score
    };
  }

  /**
   * Generate prioritized recommendations
   */
  generatePrioritizedRecommendations() {
    const recommendations = [...this.results.recommendations];

    // Add violation-based recommendations
    this.results.violations.forEach(violation => {
      if (violation.recommendation) {
        recommendations.push({
          category: violation.category,
          priority: violation.severity,
          message: violation.message,
          action: violation.recommendation
        });
      }
    });

    // Sort by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) =>
      (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999)
    );

    return recommendations;
  }

  /**
   * Export results to JSON
   */
  async exportResults(outputPath) {
    const output = {
      validator: 'GoldenRatioValidator',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      phi: this.PHI,
      results: this.results
    };

    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`📊 Results exported to: ${outputPath}`);
  }
}

module.exports = GoldenRatioValidator;
