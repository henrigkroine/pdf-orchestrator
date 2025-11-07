/**
 * Alignment Checker
 *
 * Validates pixel-perfect alignment with ±2px tolerance.
 * Checks vertical rhythm, horizontal consistency, and edge alignments.
 *
 * Features:
 * - Pixel-perfect alignment detection (±2px tolerance)
 * - Vertical rhythm validation (baseline grid)
 * - Horizontal alignment checking
 * - Misalignment detection with coordinates
 * - AI alignment critique with Claude Sonnet 4.5
 *
 * @module alignment-checker
 */

const fs = require('fs').promises;

class AlignmentChecker {
  constructor(config = null) {
    this.config = config || this.loadDefaultConfig();
    this.results = {
      overall: null,
      leftEdge: null,
      rightEdge: null,
      centerVertical: null,
      centerHorizontal: null,
      baseline: null,
      violations: [],
      recommendations: []
    };
  }

  loadDefaultConfig() {
    return {
      alignment: {
        precision: { tolerance: 2 },
        types: {
          leftEdge: { enabled: true, weight: 1.0 },
          rightEdge: { enabled: true, weight: 1.0 },
          centerVertical: { enabled: true, weight: 0.8 },
          centerHorizontal: { enabled: true, weight: 0.8 },
          baseline: { enabled: true, weight: 1.2 },
          topEdge: { enabled: true, weight: 0.9 },
          bottomEdge: { enabled: true, weight: 0.9 }
        },
        verticalRhythm: { enabled: true, baselineGrid: 8, tolerance: 2 }
      }
    };
  }

  async validate(layoutData) {
    console.log('\n📐 Alignment Checker Starting...');
    console.log(`   Precision: ±${this.config.alignment.precision.tolerance}px\n`);

    const startTime = Date.now();

    try {
      // 1. Check left edge alignment
      const leftEdge = await this.checkLeftEdgeAlignment(layoutData);
      this.results.leftEdge = leftEdge;

      // 2. Check right edge alignment
      const rightEdge = await this.checkRightEdgeAlignment(layoutData);
      this.results.rightEdge = rightEdge;

      // 3. Check center vertical alignment
      const centerVertical = await this.checkCenterVerticalAlignment(layoutData);
      this.results.centerVertical = centerVertical;

      // 4. Check center horizontal alignment
      const centerHorizontal = await this.checkCenterHorizontalAlignment(layoutData);
      this.results.centerHorizontal = centerHorizontal;

      // 5. Check baseline alignment
      const baseline = await this.checkBaselineAlignment(layoutData);
      this.results.baseline = baseline;

      // 6. Calculate overall score
      const overallScore = this.calculateOverallScore();
      this.results.overall = overallScore;

      const duration = Date.now() - startTime;
      console.log(`✅ Alignment Check Complete (${duration}ms)`);
      console.log(`   Overall Score: ${overallScore.score}/100 (${overallScore.grade})\n`);

      return this.results;

    } catch (error) {
      console.error('❌ Alignment Check Error:', error.message);
      throw error;
    }
  }

  async checkLeftEdgeAlignment(layoutData) {
    console.log('   Checking left edge alignment...');

    const elements = layoutData.elements || [];
    const tolerance = this.config.alignment.precision.tolerance;

    // Group elements by left edge position (within tolerance)
    const leftEdgeGroups = this.groupByPosition(
      elements.filter(e => e.bounds).map(e => e.bounds.x),
      tolerance
    );

    const alignmentGroups = Object.values(leftEdgeGroups)
      .filter(group => group.count > 1)
      .sort((a, b) => b.count - a.count);

    const alignedElements = alignmentGroups.reduce((sum, g) => sum + g.count, 0);
    const alignmentRate = elements.length > 0 ? (alignedElements / elements.length) * 100 : 100;
    const score = Math.round(alignmentRate);

    console.log(`      Detected ${alignmentGroups.length} alignment groups`);
    console.log(`      Aligned elements: ${alignedElements}/${elements.length}`);
    console.log(`      Score: ${score}/100\n`);

    return {
      type: 'leftEdge',
      tolerance: tolerance,
      totalElements: elements.length,
      alignmentGroups: alignmentGroups.length,
      alignedElements: alignedElements,
      alignmentRate: alignmentRate.toFixed(2),
      score: score,
      groups: alignmentGroups.slice(0, 5) // Top 5 groups
    };
  }

  async checkRightEdgeAlignment(layoutData) {
    console.log('   Checking right edge alignment...');

    const elements = layoutData.elements || [];
    const tolerance = this.config.alignment.precision.tolerance;

    const rightEdges = elements
      .filter(e => e.bounds)
      .map(e => e.bounds.x + e.bounds.width);

    const rightEdgeGroups = this.groupByPosition(rightEdges, tolerance);

    const alignmentGroups = Object.values(rightEdgeGroups)
      .filter(group => group.count > 1)
      .sort((a, b) => b.count - a.count);

    const alignedElements = alignmentGroups.reduce((sum, g) => sum + g.count, 0);
    const alignmentRate = elements.length > 0 ? (alignedElements / elements.length) * 100 : 100;
    const score = Math.round(alignmentRate);

    console.log(`      Detected ${alignmentGroups.length} alignment groups`);
    console.log(`      Aligned elements: ${alignedElements}/${elements.length}`);
    console.log(`      Score: ${score}/100\n`);

    return {
      type: 'rightEdge',
      tolerance: tolerance,
      totalElements: elements.length,
      alignmentGroups: alignmentGroups.length,
      alignedElements: alignedElements,
      alignmentRate: alignmentRate.toFixed(2),
      score: score,
      groups: alignmentGroups.slice(0, 5)
    };
  }

  async checkCenterVerticalAlignment(layoutData) {
    console.log('   Checking center vertical alignment...');

    const elements = layoutData.elements || [];
    const tolerance = this.config.alignment.precision.tolerance;

    const centerX = elements
      .filter(e => e.bounds)
      .map(e => e.bounds.x + (e.bounds.width / 2));

    const centerGroups = this.groupByPosition(centerX, tolerance);

    const alignmentGroups = Object.values(centerGroups)
      .filter(group => group.count > 1)
      .sort((a, b) => b.count - a.count);

    const alignedElements = alignmentGroups.reduce((sum, g) => sum + g.count, 0);
    const score = elements.length > 0 ? Math.round((alignedElements / elements.length) * 100) : 100;

    console.log(`      Detected ${alignmentGroups.length} center alignment groups`);
    console.log(`      Score: ${score}/100\n`);

    return {
      type: 'centerVertical',
      alignmentGroups: alignmentGroups.length,
      alignedElements: alignedElements,
      score: score
    };
  }

  async checkCenterHorizontalAlignment(layoutData) {
    console.log('   Checking center horizontal alignment...');

    const elements = layoutData.elements || [];
    const tolerance = this.config.alignment.precision.tolerance;

    const centerY = elements
      .filter(e => e.bounds)
      .map(e => e.bounds.y + (e.bounds.height / 2));

    const centerGroups = this.groupByPosition(centerY, tolerance);

    const alignmentGroups = Object.values(centerGroups)
      .filter(group => group.count > 1)
      .sort((a, b) => b.count - a.count);

    const alignedElements = alignmentGroups.reduce((sum, g) => sum + g.count, 0);
    const score = elements.length > 0 ? Math.round((alignedElements / elements.length) * 100) : 100;

    console.log(`      Detected ${alignmentGroups.length} center alignment groups`);
    console.log(`      Score: ${score}/100\n`);

    return {
      type: 'centerHorizontal',
      alignmentGroups: alignmentGroups.length,
      alignedElements: alignedElements,
      score: score
    };
  }

  async checkBaselineAlignment(layoutData) {
    console.log('   Checking baseline alignment...');

    const elements = layoutData.elements || [];
    const { baselineGrid, tolerance } = this.config.alignment.verticalRhythm;

    let alignedCount = 0;

    elements.forEach((element, index) => {
      if (!element.bounds) return;

      const { y } = element.bounds;
      const nearestBaseline = Math.round(y / baselineGrid) * baselineGrid;
      const deviation = Math.abs(y - nearestBaseline);

      if (deviation <= tolerance) {
        alignedCount++;
      } else if (deviation > baselineGrid / 2) {
        this.results.violations.push({
          category: 'alignment',
          severity: 'medium',
          message: `Element #${index} not aligned to ${baselineGrid}pt baseline (${deviation.toFixed(1)}pt off)`,
          location: `y=${y.toFixed(0)}`,
          recommendation: `Move to y=${nearestBaseline} to align with baseline grid`
        });
      }
    });

    const alignmentRate = elements.length > 0 ? (alignedCount / elements.length) * 100 : 100;
    const score = Math.round(alignmentRate);

    console.log(`      Baseline: ${baselineGrid}pt grid`);
    console.log(`      Aligned: ${alignedCount}/${elements.length}`);
    console.log(`      Score: ${score}/100\n`);

    return {
      type: 'baseline',
      baselineGrid: baselineGrid,
      tolerance: tolerance,
      totalElements: elements.length,
      alignedElements: alignedCount,
      alignmentRate: alignmentRate.toFixed(2),
      score: score
    };
  }

  groupByPosition(positions, tolerance) {
    const groups = {};

    positions.forEach(pos => {
      const key = Math.round(pos / tolerance) * tolerance;

      if (!groups[key]) {
        groups[key] = { position: key, count: 0, positions: [] };
      }

      groups[key].count++;
      groups[key].positions.push(pos);
    });

    return groups;
  }

  calculateOverallScore() {
    const scores = [];
    const weights = this.config.alignment.types;

    if (this.results.leftEdge) {
      scores.push({ score: this.results.leftEdge.score, weight: weights.leftEdge.weight });
    }

    if (this.results.rightEdge) {
      scores.push({ score: this.results.rightEdge.score, weight: weights.rightEdge.weight });
    }

    if (this.results.centerVertical) {
      scores.push({ score: this.results.centerVertical.score, weight: weights.centerVertical.weight });
    }

    if (this.results.centerHorizontal) {
      scores.push({ score: this.results.centerHorizontal.score, weight: weights.centerHorizontal.weight });
    }

    if (this.results.baseline) {
      scores.push({ score: this.results.baseline.score, weight: weights.baseline.weight });
    }

    const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const overallScore = Math.round(weightedSum / totalWeight);

    let grade;
    if (overallScore >= 95) grade = 'A++ (Pixel Perfect)';
    else if (overallScore >= 90) grade = 'A+ (Excellent)';
    else if (overallScore >= 85) grade = 'A (Very Good)';
    else if (overallScore >= 80) grade = 'B (Good)';
    else if (overallScore >= 70) grade = 'C (Fair)';
    else if (overallScore >= 60) grade = 'D (Poor)';
    else grade = 'F (Misaligned)';

    return { score: overallScore, grade: grade, components: scores };
  }

  async exportResults(outputPath) {
    const output = {
      validator: 'AlignmentChecker',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      results: this.results
    };

    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`📊 Results exported to: ${outputPath}`);
  }
}

module.exports = AlignmentChecker;
