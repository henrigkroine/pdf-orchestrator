/**
 * Winner Selector - A/B Test Result Analyzer
 *
 * Analyzes multiple variant scorecards and selects the best performer
 * based on configurable weights for different quality metrics.
 */

class WinnerSelector {
  /**
   * Get default weights for winner selection
   * @returns {Object} Default weight configuration
   */
  getDefaultWeights() {
    return {
      totalScore: 0.5,      // 50% weight on overall quality score
      tfuScore: 0.3,        // 30% weight on TFU brand compliance
      visualDiff: 0.15,     // 15% weight on visual consistency (lower is better)
      passed: 0.05          // 5% weight on pass/fail status
    };
  }

  /**
   * Select winner from variant results
   * @param {Array} variantResults - Array of variant execution results
   * @param {Object} customWeights - Custom weight configuration (optional)
   * @returns {Object} Winner variant with detailed reasoning
   */
  selectWinner(variantResults, customWeights = null) {
    const weights = customWeights || this.getDefaultWeights();

    console.log('[WinnerSelector] Analyzing variants...');
    console.log(`[WinnerSelector] Weights: ${JSON.stringify(weights)}`);

    // Filter out failed variants
    const successfulVariants = variantResults.filter(v => v.success);

    if (successfulVariants.length === 0) {
      console.error('[WinnerSelector] No successful variants to analyze!');
      return {
        variant: null,
        reason: 'All variants failed',
        scores: []
      };
    }

    // Calculate composite scores for each variant
    const scoredVariants = successfulVariants.map(variant => {
      const compositeScore = this.calculateCompositeScore(variant, weights);

      return {
        variant: variant.variant,
        description: variant.description,
        jobId: variant.jobId,
        compositeScore: compositeScore,
        breakdown: {
          totalScore: variant.score || 0,
          tfuScore: variant.tfuScore || 0,
          visualDiff: variant.visualDiff || 0,
          passed: variant.passed || false,
          duration: variant.duration || 0
        }
      };
    });

    // Sort by composite score (descending)
    scoredVariants.sort((a, b) => b.compositeScore - a.compositeScore);

    // Select winner (highest composite score)
    const winner = scoredVariants[0];

    // Handle ties (within 0.1% of each other)
    const ties = scoredVariants.filter(v =>
      Math.abs(v.compositeScore - winner.compositeScore) < 0.001
    );

    let reason = this.generateReasoning(winner, scoredVariants, ties, weights);

    console.log(`\n[WinnerSelector] WINNER: Variant ${winner.variant}`);
    console.log(`[WinnerSelector] Composite Score: ${winner.compositeScore.toFixed(3)}`);
    console.log(`[WinnerSelector] ${reason}`);

    // If ties exist, use tiebreaker
    let tiebreaker = null;
    if (ties.length > 1) {
      tiebreaker = this.resolveTie(ties);
      console.log(`[WinnerSelector] Tiebreaker: ${tiebreaker}`);
    }

    return {
      variant: winner.variant,
      description: winner.description,
      jobId: winner.jobId,
      compositeScore: winner.compositeScore,
      breakdown: winner.breakdown,
      reason: reason,
      tiebreaker: tiebreaker,
      allScores: scoredVariants,
      weights: weights
    };
  }

  /**
   * Calculate composite score for a variant
   * @param {Object} variant - Variant result data
   * @param {Object} weights - Weight configuration
   * @returns {number} Composite score (0-1)
   */
  calculateCompositeScore(variant, weights) {
    const scorecard = variant.scorecard || {};

    // Normalize total score (0-150 → 0-1)
    const totalScoreNorm = Math.min((variant.score || 0) / 150, 1);

    // Normalize TFU score (0-25 → 0-1)
    const tfuScoreNorm = Math.min((variant.tfuScore || 0) / 25, 1);

    // Normalize visual diff (0-100% → 1-0, inverted because lower is better)
    const visualDiffNorm = Math.max(1 - ((variant.visualDiff || 0) / 100), 0);

    // Passed status (boolean → 0 or 1)
    const passedNorm = variant.passed ? 1 : 0;

    // Calculate weighted composite score
    const compositeScore = (
      (totalScoreNorm * weights.totalScore) +
      (tfuScoreNorm * weights.tfuScore) +
      (visualDiffNorm * weights.visualDiff) +
      (passedNorm * weights.passed)
    );

    return compositeScore;
  }

  /**
   * Generate reasoning for winner selection
   * @param {Object} winner - Winning variant
   * @param {Array} allScored - All scored variants
   * @param {Array} ties - Tied variants
   * @param {Object} weights - Weight configuration
   * @returns {string} Human-readable reasoning
   */
  generateReasoning(winner, allScored, ties, weights) {
    const breakdown = winner.breakdown;
    const reasons = [];

    // Check what made this variant win
    if (breakdown.totalScore >= 140) {
      reasons.push(`Exceptional quality score (${breakdown.totalScore}/150)`);
    } else if (breakdown.totalScore >= 120) {
      reasons.push(`Strong quality score (${breakdown.totalScore}/150)`);
    } else {
      reasons.push(`Quality score: ${breakdown.totalScore}/150`);
    }

    if (breakdown.tfuScore >= 23) {
      reasons.push(`Excellent TFU compliance (${breakdown.tfuScore}/25)`);
    } else if (breakdown.tfuScore >= 20) {
      reasons.push(`Good TFU compliance (${breakdown.tfuScore}/25)`);
    }

    if (breakdown.visualDiff <= 5) {
      reasons.push(`Low visual regression (${breakdown.visualDiff.toFixed(1)}%)`);
    } else if (breakdown.visualDiff <= 10) {
      reasons.push(`Moderate visual changes (${breakdown.visualDiff.toFixed(1)}%)`);
    }

    if (breakdown.passed) {
      reasons.push('Passed all QA gates');
    }

    // Compare to runner-up if available
    if (allScored.length > 1) {
      const runnerUp = allScored[1];
      const margin = winner.compositeScore - runnerUp.compositeScore;
      const marginPercent = (margin * 100).toFixed(1);

      if (margin > 0.1) {
        reasons.push(`Clear winner by ${marginPercent}% margin`);
      } else if (margin > 0.01) {
        reasons.push(`Narrow win by ${marginPercent}% margin`);
      }
    }

    // Add tie notice if applicable
    if (ties.length > 1) {
      reasons.push(`TIED with ${ties.length - 1} other variant(s)`);
    }

    return reasons.join('. ');
  }

  /**
   * Resolve tie between variants
   * @param {Array} tiedVariants - Variants with identical composite scores
   * @returns {string} Tiebreaker reasoning
   */
  resolveTie(tiedVariants) {
    // Tiebreaker priority:
    // 1. Highest total score
    // 2. Highest TFU score
    // 3. Lowest visual diff
    // 4. Fastest execution

    // Sort by total score
    const byTotalScore = [...tiedVariants].sort((a, b) =>
      b.breakdown.totalScore - a.breakdown.totalScore
    );

    if (byTotalScore[0].breakdown.totalScore > byTotalScore[1].breakdown.totalScore) {
      return `Highest total score (${byTotalScore[0].breakdown.totalScore}/150)`;
    }

    // Sort by TFU score
    const byTfuScore = [...tiedVariants].sort((a, b) =>
      b.breakdown.tfuScore - a.breakdown.tfuScore
    );

    if (byTfuScore[0].breakdown.tfuScore > byTfuScore[1].breakdown.tfuScore) {
      return `Highest TFU score (${byTfuScore[0].breakdown.tfuScore}/25)`;
    }

    // Sort by visual diff (lower is better)
    const byVisualDiff = [...tiedVariants].sort((a, b) =>
      a.breakdown.visualDiff - b.breakdown.visualDiff
    );

    if (byVisualDiff[0].breakdown.visualDiff < byVisualDiff[1].breakdown.visualDiff) {
      return `Lowest visual diff (${byVisualDiff[0].breakdown.visualDiff.toFixed(1)}%)`;
    }

    // Sort by duration (faster is better)
    const byDuration = [...tiedVariants].sort((a, b) =>
      a.breakdown.duration - b.breakdown.duration
    );

    if (byDuration[0].breakdown.duration < byDuration[1].breakdown.duration) {
      return `Fastest execution (${byDuration[0].breakdown.duration.toFixed(1)}s)`;
    }

    // If still tied, just pick the first one
    return 'First variant (arbitrary tiebreaker)';
  }

  /**
   * Print detailed comparison table
   * @param {Array} scoredVariants - All scored variants
   */
  printComparisonTable(scoredVariants) {
    console.log('\n[WinnerSelector] Variant Comparison Table:');
    console.log('─'.repeat(100));
    console.log(
      'Variant'.padEnd(10) +
      'Description'.padEnd(25) +
      'Total'.padEnd(10) +
      'TFU'.padEnd(8) +
      'Diff%'.padEnd(10) +
      'Pass'.padEnd(8) +
      'Composite'
    );
    console.log('─'.repeat(100));

    scoredVariants.forEach(v => {
      console.log(
        `${v.variant}`.padEnd(10) +
        v.description.substring(0, 23).padEnd(25) +
        `${v.breakdown.totalScore}/150`.padEnd(10) +
        `${v.breakdown.tfuScore}/25`.padEnd(8) +
        `${v.breakdown.visualDiff.toFixed(1)}%`.padEnd(10) +
        (v.breakdown.passed ? '✓' : '✗').padEnd(8) +
        v.compositeScore.toFixed(3)
      );
    });

    console.log('─'.repeat(100));
  }
}

module.exports = WinnerSelector;
