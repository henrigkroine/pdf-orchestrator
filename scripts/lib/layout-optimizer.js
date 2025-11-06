/**
 * Layout Optimizer
 *
 * AI-powered layout optimization engine that generates actionable suggestions
 * and auto-fix recommendations based on layout perfection analysis results.
 *
 * Features:
 * - AI-powered layout optimization suggestions
 * - Auto-fix alignment issues
 * - Grid snapping recommendations
 * - Spacing normalization
 * - Balance improvements
 * - Golden ratio application suggestions
 * - Priority-ranked action items
 * - Before/after layout comparisons
 *
 * @module layout-optimizer
 */

const fs = require('fs').promises;

class LayoutOptimizer {
  constructor(analysisResults, config = null) {
    this.results = analysisResults;
    this.config = config || this.loadDefaultConfig();
    this.optimizations = {
      alignment: [],
      spacing: [],
      gridSnapping: [],
      balance: [],
      goldenRatio: [],
      hierarchy: [],
      proximity: [],
      autoFixes: []
    };
  }

  loadDefaultConfig() {
    return {
      autoFix: {
        enabled: true,
        maxChanges: 50,
        minScoreImprovement: 5
      },
      priorities: {
        high: { weight: 3 },
        medium: { weight: 2 },
        low: { weight: 1 }
      }
    };
  }

  /**
   * Generate comprehensive optimization recommendations
   */
  async optimize() {
    console.log('\n🔧 Layout Optimizer Starting...');
    console.log('   Analyzing violations and generating optimization suggestions...\n');

    const startTime = Date.now();

    try {
      // 1. Generate alignment optimizations
      await this.generateAlignmentOptimizations();

      // 2. Generate spacing optimizations
      await this.generateSpacingOptimizations();

      // 3. Generate grid snapping recommendations
      await this.generateGridSnappingOptimizations();

      // 4. Generate balance optimizations
      await this.generateBalanceOptimizations();

      // 5. Generate golden ratio optimizations
      await this.generateGoldenRatioOptimizations();

      // 6. Generate hierarchy optimizations
      await this.generateHierarchyOptimizations();

      // 7. Generate proximity optimizations
      await this.generateProximityOptimizations();

      // 8. Generate auto-fix suggestions
      await this.generateAutoFixes();

      // 9. Prioritize and rank optimizations
      const rankedOptimizations = this.prioritizeOptimizations();

      // 10. Calculate estimated score improvement
      const estimatedImprovement = this.calculateEstimatedImprovement();

      const duration = Date.now() - startTime;

      console.log(`✅ Optimization Analysis Complete (${duration}ms)`);
      console.log(`   Generated ${rankedOptimizations.length} optimization suggestions`);
      console.log(`   Estimated score improvement: +${estimatedImprovement.toFixed(1)} points\n`);

      return {
        optimizations: this.optimizations,
        ranked: rankedOptimizations,
        estimatedImprovement: estimatedImprovement,
        currentScore: this.results.overall.score,
        projectedScore: Math.min(100, this.results.overall.score + estimatedImprovement),
        metadata: {
          duration: duration,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Optimization Error:', error.message);
      throw error;
    }
  }

  /**
   * Generate alignment optimization suggestions
   */
  async generateAlignmentOptimizations() {
    console.log('   [1/8] Alignment optimizations...');

    const alignmentResults = this.results.alignment;
    if (!alignmentResults) return;

    // Find elements that are almost aligned
    const leftEdgeGroups = alignmentResults.leftEdge?.groups || [];

    leftEdgeGroups.forEach(group => {
      if (group.count >= 2) {
        this.optimizations.alignment.push({
          type: 'align-left',
          priority: 'high',
          impact: 'high',
          description: `Align ${group.count} elements to left edge at x=${group.position}`,
          action: {
            type: 'align-elements',
            edge: 'left',
            position: group.position,
            elements: group.count
          },
          estimatedImprovement: 5
        });
      }
    });

    console.log(`      Generated ${this.optimizations.alignment.length} alignment suggestions`);
  }

  /**
   * Generate spacing optimization suggestions
   */
  async generateSpacingOptimizations() {
    console.log('   [2/8] Spacing optimizations...');

    const spacingResults = this.results.spacing;
    if (!spacingResults) return;

    // Check if spacing is inconsistent
    if (spacingResults.elementSpacing?.score < 80) {
      const avgSpacing = parseFloat(spacingResults.elementSpacing.averageSpacing);
      const nearestScale = this.findNearestSpacingValue(avgSpacing);

      this.optimizations.spacing.push({
        type: 'normalize-spacing',
        priority: 'high',
        impact: 'medium',
        description: `Normalize element spacing to ${nearestScale}pt (currently averaging ${avgSpacing.toFixed(1)}pt)`,
        action: {
          type: 'apply-spacing-scale',
          targetValue: nearestScale,
          currentAverage: avgSpacing
        },
        estimatedImprovement: 10
      });
    }

    // Check margin consistency
    if (!spacingResults.margins?.consistent) {
      this.optimizations.spacing.push({
        type: 'fix-margins',
        priority: 'high',
        impact: 'medium',
        description: 'Standardize page margins to 40pt all sides',
        action: {
          type: 'set-margins',
          target: 40,
          current: spacingResults.margins.margins
        },
        estimatedImprovement: 5
      });
    }

    console.log(`      Generated ${this.optimizations.spacing.length} spacing suggestions`);
  }

  /**
   * Generate grid snapping recommendations
   */
  async generateGridSnappingOptimizations() {
    console.log('   [3/8] Grid snapping optimizations...');

    const gridResults = this.results.gridAlignment;
    if (!gridResults) return;

    // Find misaligned elements
    const misalignedElements = gridResults.columnAlignment?.elements?.filter(e => e.status === 'misaligned') || [];

    if (misalignedElements.length > 0) {
      this.optimizations.gridSnapping.push({
        type: 'snap-to-grid',
        priority: 'high',
        impact: 'high',
        description: `Snap ${misalignedElements.length} elements to 12-column grid`,
        action: {
          type: 'grid-snap',
          elements: misalignedElements.length,
          gridColumns: 12
        },
        estimatedImprovement: 15
      });
    }

    // Check baseline alignment
    const baselineScore = gridResults.baselineAlignment?.score || 100;
    if (baselineScore < 80) {
      this.optimizations.gridSnapping.push({
        type: 'baseline-alignment',
        priority: 'medium',
        impact: 'medium',
        description: 'Align elements to 8pt baseline grid for vertical rhythm',
        action: {
          type: 'baseline-snap',
          baselineGrid: 8
        },
        estimatedImprovement: 8
      });
    }

    console.log(`      Generated ${this.optimizations.gridSnapping.length} grid snapping suggestions`);
  }

  /**
   * Generate balance optimization suggestions
   */
  async generateBalanceOptimizations() {
    console.log('   [4/8] Balance optimizations...');

    const balanceResults = this.results.balance;
    if (!balanceResults) return;

    // Check horizontal balance
    if (balanceResults.horizontalBalance && !balanceResults.horizontalBalance.balanced) {
      const imbalance = parseFloat(balanceResults.horizontalBalance.imbalance);
      const leftRatio = parseFloat(balanceResults.horizontalBalance.leftRatio);
      const heavySide = leftRatio > 50 ? 'left' : 'right';

      this.optimizations.balance.push({
        type: 'horizontal-balance',
        priority: imbalance > 20 ? 'high' : 'medium',
        impact: 'medium',
        description: `Layout is ${heavySide}-heavy by ${imbalance.toFixed(1)}%. Redistribute visual weight`,
        action: {
          type: 'rebalance',
          axis: 'horizontal',
          currentImbalance: imbalance,
          heavySide: heavySide
        },
        estimatedImprovement: 8
      });
    }

    // Check vertical balance
    if (balanceResults.verticalBalance && !balanceResults.verticalBalance.balanced) {
      const imbalance = parseFloat(balanceResults.verticalBalance.imbalance);

      this.optimizations.balance.push({
        type: 'vertical-balance',
        priority: 'medium',
        impact: 'low',
        description: `Improve vertical balance (${imbalance.toFixed(1)}% imbalance)`,
        action: {
          type: 'rebalance',
          axis: 'vertical',
          currentImbalance: imbalance
        },
        estimatedImprovement: 5
      });
    }

    console.log(`      Generated ${this.optimizations.balance.length} balance suggestions`);
  }

  /**
   * Generate golden ratio optimization suggestions
   */
  async generateGoldenRatioOptimizations() {
    console.log('   [5/8] Golden ratio optimizations...');

    const goldenRatioResults = this.results.goldenRatio;
    if (!goldenRatioResults) return;

    // Content area ratio
    if (goldenRatioResults.contentAreaRatio && !goldenRatioResults.contentAreaRatio.compliant) {
      this.optimizations.goldenRatio.push({
        type: 'content-area-ratio',
        priority: 'medium',
        impact: 'medium',
        description: goldenRatioResults.contentAreaRatio.recommendation,
        action: {
          type: 'adjust-content-area',
          currentRatio: goldenRatioResults.contentAreaRatio.actualRatio,
          targetRatio: 1.618
        },
        estimatedImprovement: 6
      });
    }

    // Fibonacci spacing
    if (goldenRatioResults.fibonacci && goldenRatioResults.fibonacci.score < 70) {
      const fibScale = [8, 13, 21, 34, 55, 89, 144];

      this.optimizations.goldenRatio.push({
        type: 'fibonacci-spacing',
        priority: 'low',
        impact: 'low',
        description: `Apply Fibonacci spacing scale: ${fibScale.join(', ')}pt`,
        action: {
          type: 'apply-fibonacci',
          scale: fibScale
        },
        estimatedImprovement: 4
      });
    }

    console.log(`      Generated ${this.optimizations.goldenRatio.length} golden ratio suggestions`);
  }

  /**
   * Generate hierarchy optimization suggestions
   */
  async generateHierarchyOptimizations() {
    console.log('   [6/8] Hierarchy optimizations...');

    const hierarchyResults = this.results.hierarchy;
    if (!hierarchyResults) return;

    // Size hierarchy
    if (hierarchyResults.sizeHierarchy?.ratioViolations?.length > 0) {
      hierarchyResults.sizeHierarchy.ratioViolations.forEach(violation => {
        this.optimizations.hierarchy.push({
          type: 'size-hierarchy',
          priority: 'high',
          impact: 'high',
          description: violation.recommendation,
          action: {
            type: 'adjust-hierarchy',
            levels: violation.levels,
            currentRatio: violation.actualRatio,
            targetRatio: violation.minimumRatio
          },
          estimatedImprovement: 7
        });
      });
    }

    // Color contrast
    if (hierarchyResults.colorHierarchy?.score < 70) {
      this.optimizations.hierarchy.push({
        type: 'color-contrast',
        priority: 'high',
        impact: 'high',
        description: 'Improve color contrast to meet WCAG AA standards (4.5:1 minimum)',
        action: {
          type: 'increase-contrast',
          targetRatio: 4.5
        },
        estimatedImprovement: 10
      });
    }

    console.log(`      Generated ${this.optimizations.hierarchy.length} hierarchy suggestions`);
  }

  /**
   * Generate proximity optimization suggestions
   */
  async generateProximityOptimizations() {
    console.log('   [7/8] Proximity optimizations...');

    const proximityResults = this.results.proximity;
    if (!proximityResults) return;

    // Check if enough grouping exists
    if (proximityResults.proximityGroups?.totalGroups < 3) {
      this.optimizations.proximity.push({
        type: 'increase-grouping',
        priority: 'medium',
        impact: 'low',
        description: 'Increase visual grouping by placing related elements closer (within 30pt)',
        action: {
          type: 'apply-proximity',
          threshold: 30
        },
        estimatedImprovement: 5
      });
    }

    console.log(`      Generated ${this.optimizations.proximity.length} proximity suggestions`);
  }

  /**
   * Generate auto-fix suggestions (changes that can be applied automatically)
   */
  async generateAutoFixes() {
    console.log('   [8/8] Auto-fix suggestions...');

    // Collect all optimizations that can be auto-fixed
    const allOptimizations = [
      ...this.optimizations.alignment,
      ...this.optimizations.spacing,
      ...this.optimizations.gridSnapping
    ];

    allOptimizations.forEach(opt => {
      if (this.isAutoFixable(opt)) {
        this.optimizations.autoFixes.push({
          ...opt,
          autoFixable: true,
          confidence: this.calculateAutoFixConfidence(opt)
        });
      }
    });

    console.log(`      Generated ${this.optimizations.autoFixes.length} auto-fixable suggestions`);
  }

  /**
   * Check if optimization can be auto-fixed
   */
  isAutoFixable(optimization) {
    const autoFixableTypes = [
      'align-left',
      'align-right',
      'normalize-spacing',
      'fix-margins',
      'snap-to-grid',
      'baseline-alignment'
    ];

    return autoFixableTypes.includes(optimization.type);
  }

  /**
   * Calculate confidence score for auto-fix
   */
  calculateAutoFixConfidence(optimization) {
    // High confidence for simple fixes
    const highConfidenceTypes = ['fix-margins', 'normalize-spacing'];
    if (highConfidenceTypes.includes(optimization.type)) {
      return 0.95;
    }

    // Medium confidence for alignment
    if (optimization.type.startsWith('align-')) {
      return 0.85;
    }

    // Lower confidence for complex changes
    return 0.7;
  }

  /**
   * Prioritize and rank all optimizations
   */
  prioritizeOptimizations() {
    const allOptimizations = [
      ...this.optimizations.alignment.map(o => ({ ...o, category: 'alignment' })),
      ...this.optimizations.spacing.map(o => ({ ...o, category: 'spacing' })),
      ...this.optimizations.gridSnapping.map(o => ({ ...o, category: 'gridSnapping' })),
      ...this.optimizations.balance.map(o => ({ ...o, category: 'balance' })),
      ...this.optimizations.goldenRatio.map(o => ({ ...o, category: 'goldenRatio' })),
      ...this.optimizations.hierarchy.map(o => ({ ...o, category: 'hierarchy' })),
      ...this.optimizations.proximity.map(o => ({ ...o, category: 'proximity' }))
    ];

    // Calculate priority score for each optimization
    allOptimizations.forEach(opt => {
      const priorityWeight = this.config.priorities[opt.priority]?.weight || 1;
      const impactMultiplier = opt.impact === 'high' ? 1.5 : opt.impact === 'medium' ? 1.0 : 0.5;

      opt.priorityScore = (opt.estimatedImprovement || 0) * priorityWeight * impactMultiplier;
    });

    // Sort by priority score (descending)
    allOptimizations.sort((a, b) => b.priorityScore - a.priorityScore);

    return allOptimizations;
  }

  /**
   * Calculate estimated score improvement if all optimizations applied
   */
  calculateEstimatedImprovement() {
    const allOptimizations = this.prioritizeOptimizations();

    // Sum estimated improvements (with diminishing returns)
    let totalImprovement = 0;
    let diminishingFactor = 1.0;

    allOptimizations.forEach(opt => {
      totalImprovement += (opt.estimatedImprovement || 0) * diminishingFactor;
      diminishingFactor *= 0.9; // Each subsequent fix has 90% of the impact
    });

    return Math.min(totalImprovement, 100 - this.results.overall.score);
  }

  /**
   * Find nearest spacing value from standard scale
   */
  findNearestSpacingValue(value) {
    const scale = [4, 8, 12, 20, 40, 60];
    let nearest = scale[0];
    let minDiff = Math.abs(value - scale[0]);

    scale.forEach(scaleValue => {
      const diff = Math.abs(value - scaleValue);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = scaleValue;
      }
    });

    return nearest;
  }

  /**
   * Export optimization recommendations
   */
  async exportOptimizations(outputPath) {
    const optimizationReport = await this.optimize();

    const output = {
      optimizer: 'LayoutOptimizer',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      currentScore: optimizationReport.currentScore,
      projectedScore: optimizationReport.projectedScore,
      estimatedImprovement: optimizationReport.estimatedImprovement,
      optimizations: optimizationReport.optimizations,
      rankedOptimizations: optimizationReport.ranked.slice(0, 20), // Top 20
      autoFixes: optimizationReport.optimizations.autoFixes,
      summary: {
        totalSuggestions: optimizationReport.ranked.length,
        autoFixable: optimizationReport.optimizations.autoFixes.length,
        byPriority: {
          high: optimizationReport.ranked.filter(o => o.priority === 'high').length,
          medium: optimizationReport.ranked.filter(o => o.priority === 'medium').length,
          low: optimizationReport.ranked.filter(o => o.priority === 'low').length
        },
        byCategory: {
          alignment: optimizationReport.optimizations.alignment.length,
          spacing: optimizationReport.optimizations.spacing.length,
          gridSnapping: optimizationReport.optimizations.gridSnapping.length,
          balance: optimizationReport.optimizations.balance.length,
          goldenRatio: optimizationReport.optimizations.goldenRatio.length,
          hierarchy: optimizationReport.optimizations.hierarchy.length,
          proximity: optimizationReport.optimizations.proximity.length
        }
      }
    };

    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`📊 Optimization report exported to: ${outputPath}`);

    return optimizationReport;
  }
}

module.exports = LayoutOptimizer;
