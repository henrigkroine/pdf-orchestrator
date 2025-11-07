/**
 * Spacing Analyzer
 *
 * Validates spacing consistency and rhythm throughout the layout.
 * Detects spacing anomalies using statistical analysis.
 *
 * Features:
 * - Precise spacing measurement between elements
 * - Margin and padding consistency checking
 * - Spacing anomaly detection (outliers beyond 2.5σ)
 * - Spacing distribution statistics
 * - AI spacing optimization with GPT-5
 *
 * Target Spacing Scale (TEEI):
 * - XS: 4pt | SM: 8pt | MD: 12pt | LG: 20pt | XL: 40pt | XXL: 60pt
 *
 * @module spacing-analyzer
 */

const fs = require('fs').promises;

class SpacingAnalyzer {
  constructor(config = null) {
    this.config = config || this.loadDefaultConfig();
    this.results = {
      overall: null,
      margins: null,
      elementSpacing: null,
      sectionBreaks: null,
      paragraphSpacing: null,
      anomalies: [],
      violations: [],
      recommendations: []
    };
  }

  loadDefaultConfig() {
    return {
      spacing: {
        scale: { xs: 4, sm: 8, md: 12, lg: 20, xl: 40, xxl: 60 },
        targets: {
          pageMargins: 40,
          sectionBreaks: 60,
          elementSpacing: 20,
          paragraphSpacing: 12
        },
        consistency: { tolerance: 3, maxDeviation: 0.15 },
        anomalyDetection: { enabled: true, zScoreThreshold: 2.5 }
      }
    };
  }

  async validate(layoutData) {
    console.log('\n📏 Spacing Analyzer Starting...');
    console.log(`   Target scale: 4, 8, 12, 20, 40, 60pt\n`);

    const startTime = Date.now();

    try {
      // 1. Validate page margins
      const margins = await this.validateMargins(layoutData);
      this.results.margins = margins;

      // 2. Analyze element spacing
      const elementSpacing = await this.analyzeElementSpacing(layoutData);
      this.results.elementSpacing = elementSpacing;

      // 3. Detect section breaks
      const sectionBreaks = await this.detectSectionBreaks(layoutData);
      this.results.sectionBreaks = sectionBreaks;

      // 4. Analyze paragraph spacing
      const paragraphSpacing = await this.analyzeParagraphSpacing(layoutData);
      this.results.paragraphSpacing = paragraphSpacing;

      // 5. Detect anomalies
      const anomalies = await this.detectAnomalies(layoutData);
      this.results.anomalies = anomalies;

      // 6. Calculate overall score
      const overallScore = this.calculateOverallScore();
      this.results.overall = overallScore;

      const duration = Date.now() - startTime;
      console.log(`✅ Spacing Analysis Complete (${duration}ms)`);
      console.log(`   Overall Score: ${overallScore.score}/100 (${overallScore.grade})\n`);

      return this.results;

    } catch (error) {
      console.error('❌ Spacing Analysis Error:', error.message);
      throw error;
    }
  }

  async validateMargins(layoutData) {
    console.log('   Validating page margins...');

    const { margins } = layoutData.page;
    const target = this.config.spacing.targets.pageMargins;
    const tolerance = this.config.spacing.consistency.tolerance;

    const results = {
      target: target,
      tolerance: tolerance,
      margins: {},
      consistent: true,
      score: 100
    };

    ['top', 'right', 'bottom', 'left'].forEach(side => {
      const value = margins[side] || margins.all;
      const deviation = Math.abs(value - target);
      const compliant = deviation <= tolerance;

      results.margins[side] = {
        value: value,
        deviation: deviation.toFixed(2),
        compliant: compliant
      };

      if (!compliant) {
        results.consistent = false;
        results.score -= 15;

        this.results.violations.push({
          category: 'spacing',
          severity: deviation > 10 ? 'high' : 'medium',
          message: `${side} margin (${value}pt) deviates ${deviation.toFixed(1)}pt from target (${target}pt)`,
          recommendation: `Adjust ${side} margin to ${target}pt`
        });
      }
    });

    console.log(`      Top: ${results.margins.top.value}pt (${results.margins.top.compliant ? '✅' : '❌'})`);
    console.log(`      Right: ${results.margins.right.value}pt (${results.margins.right.compliant ? '✅' : '❌'})`);
    console.log(`      Bottom: ${results.margins.bottom.value}pt (${results.margins.bottom.compliant ? '✅' : '❌'})`);
    console.log(`      Left: ${results.margins.left.value}pt (${results.margins.left.compliant ? '✅' : '❌'})`);
    console.log(`      Score: ${results.score}/100\n`);

    return results;
  }

  async analyzeElementSpacing(layoutData) {
    console.log('   Analyzing element spacing...');

    const elements = layoutData.elements || [];
    const target = this.config.spacing.targets.elementSpacing;
    const tolerance = this.config.spacing.consistency.tolerance;
    const spacingValues = [];

    // Calculate vertical spacing between consecutive elements
    for (let i = 0; i < elements.length - 1; i++) {
      const current = elements[i];
      const next = elements[i + 1];

      if (!current.bounds || !next.bounds) continue;

      const spacing = next.bounds.y - (current.bounds.y + current.bounds.height);

      if (spacing > 0 && spacing < 200) {
        const nearestScale = this.findNearestSpacingScale(spacing);
        const deviation = Math.abs(spacing - nearestScale.value);
        const compliant = deviation <= tolerance;

        spacingValues.push({
          between: `Element ${i} and ${i + 1}`,
          actual: spacing.toFixed(2),
          nearestScale: nearestScale.value,
          scaleName: nearestScale.name,
          deviation: deviation.toFixed(2),
          compliant: compliant
        });
      }
    }

    const compliantCount = spacingValues.filter(s => s.compliant).length;
    const complianceRate = spacingValues.length > 0 ? (compliantCount / spacingValues.length) * 100 : 100;
    const avgSpacing = spacingValues.length > 0
      ? spacingValues.reduce((sum, s) => sum + parseFloat(s.actual), 0) / spacingValues.length
      : target;

    const score = Math.round(complianceRate);

    console.log(`      Measured ${spacingValues.length} spacing values`);
    console.log(`      Compliant: ${compliantCount}/${spacingValues.length} (${complianceRate.toFixed(1)}%)`);
    console.log(`      Average spacing: ${avgSpacing.toFixed(2)}pt`);
    console.log(`      Score: ${score}/100\n`);

    return {
      type: 'elementSpacing',
      target: target,
      totalMeasurements: spacingValues.length,
      compliant: compliantCount,
      complianceRate: complianceRate.toFixed(2),
      averageSpacing: avgSpacing.toFixed(2),
      score: score,
      values: spacingValues
    };
  }

  async detectSectionBreaks(layoutData) {
    console.log('   Detecting section breaks...');

    const elements = layoutData.elements || [];
    const target = this.config.spacing.targets.sectionBreaks;
    const sectionBreaks = [];

    // Detect large spacing (likely section breaks)
    for (let i = 0; i < elements.length - 1; i++) {
      const current = elements[i];
      const next = elements[i + 1];

      if (!current.bounds || !next.bounds) continue;

      const spacing = next.bounds.y - (current.bounds.y + current.bounds.height);

      if (spacing >= 40) { // Threshold for section break
        const deviation = Math.abs(spacing - target);
        const compliant = deviation <= 10; // Larger tolerance for section breaks

        sectionBreaks.push({
          between: `Element ${i} and ${i + 1}`,
          actual: spacing.toFixed(2),
          target: target,
          deviation: deviation.toFixed(2),
          compliant: compliant
        });
      }
    }

    const compliantCount = sectionBreaks.filter(s => s.compliant).length;
    const score = sectionBreaks.length > 0
      ? Math.round((compliantCount / sectionBreaks.length) * 100)
      : 100;

    console.log(`      Detected ${sectionBreaks.length} section breaks`);
    console.log(`      Target: ${target}pt`);
    console.log(`      Compliant: ${compliantCount}/${sectionBreaks.length}`);
    console.log(`      Score: ${score}/100\n`);

    return {
      type: 'sectionBreaks',
      target: target,
      totalBreaks: sectionBreaks.length,
      compliant: compliantCount,
      score: score,
      breaks: sectionBreaks
    };
  }

  async analyzeParagraphSpacing(layoutData) {
    console.log('   Analyzing paragraph spacing...');

    const elements = layoutData.elements || [];
    const target = this.config.spacing.targets.paragraphSpacing;
    const paragraphSpacings = [];

    // Detect paragraph-like spacing (small spacing between text blocks)
    for (let i = 0; i < elements.length - 1; i++) {
      const current = elements[i];
      const next = elements[i + 1];

      if (!current.bounds || !next.bounds) continue;
      if (current.type !== 'text' || next.type !== 'text') continue;

      const spacing = next.bounds.y - (current.bounds.y + current.bounds.height);

      if (spacing > 0 && spacing < 30) { // Paragraph spacing range
        const deviation = Math.abs(spacing - target);
        const compliant = deviation <= 3;

        paragraphSpacings.push({
          between: `Element ${i} and ${i + 1}`,
          actual: spacing.toFixed(2),
          target: target,
          deviation: deviation.toFixed(2),
          compliant: compliant
        });
      }
    }

    const compliantCount = paragraphSpacings.filter(s => s.compliant).length;
    const score = paragraphSpacings.length > 0
      ? Math.round((compliantCount / paragraphSpacings.length) * 100)
      : 100;

    console.log(`      Detected ${paragraphSpacings.length} paragraph spacings`);
    console.log(`      Target: ${target}pt`);
    console.log(`      Compliant: ${compliantCount}/${paragraphSpacings.length}`);
    console.log(`      Score: ${score}/100\n`);

    return {
      type: 'paragraphSpacing',
      target: target,
      totalParagraphs: paragraphSpacings.length,
      compliant: compliantCount,
      score: score,
      spacings: paragraphSpacings
    };
  }

  async detectAnomalies(layoutData) {
    console.log('   Detecting spacing anomalies...');

    if (!this.config.spacing.anomalyDetection.enabled) {
      console.log('      Anomaly detection disabled\n');
      return { enabled: false, anomalies: [] };
    }

    const allSpacings = [];

    // Collect all spacing measurements
    if (this.results.elementSpacing?.values) {
      this.results.elementSpacing.values.forEach(v => {
        allSpacings.push(parseFloat(v.actual));
      });
    }

    if (allSpacings.length < 3) {
      console.log('      Insufficient data for anomaly detection\n');
      return { enabled: true, anomalies: [], insufficientData: true };
    }

    // Calculate mean and standard deviation
    const mean = allSpacings.reduce((sum, v) => sum + v, 0) / allSpacings.length;
    const variance = allSpacings.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / allSpacings.length;
    const stdDev = Math.sqrt(variance);

    // Detect outliers (z-score > threshold)
    const threshold = this.config.spacing.anomalyDetection.zScoreThreshold;
    const anomalies = [];

    allSpacings.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);

      if (zScore > threshold) {
        anomalies.push({
          index: index,
          value: value.toFixed(2),
          mean: mean.toFixed(2),
          stdDev: stdDev.toFixed(2),
          zScore: zScore.toFixed(2),
          severity: zScore > 3 ? 'high' : 'medium'
        });

        this.results.violations.push({
          category: 'spacing',
          severity: zScore > 3 ? 'high' : 'medium',
          message: `Spacing anomaly detected: ${value.toFixed(1)}pt (${zScore.toFixed(1)}σ from mean)`,
          recommendation: `Normalize spacing to ${mean.toFixed(0)}pt ± ${(stdDev * 2).toFixed(0)}pt`
        });
      }
    });

    console.log(`      Mean spacing: ${mean.toFixed(2)}pt`);
    console.log(`      Std deviation: ${stdDev.toFixed(2)}pt`);
    console.log(`      Anomalies detected: ${anomalies.length} (z > ${threshold})\n`);

    return {
      enabled: true,
      threshold: threshold,
      statistics: {
        mean: mean.toFixed(2),
        stdDev: stdDev.toFixed(2),
        variance: variance.toFixed(2)
      },
      anomalies: anomalies
    };
  }

  findNearestSpacingScale(value) {
    const scale = this.config.spacing.scale;
    const values = Object.values(scale);
    const names = Object.keys(scale);

    let nearestValue = values[0];
    let nearestName = names[0];
    let minDiff = Math.abs(value - values[0]);

    values.forEach((scaleValue, index) => {
      const diff = Math.abs(value - scaleValue);
      if (diff < minDiff) {
        minDiff = diff;
        nearestValue = scaleValue;
        nearestName = names[index];
      }
    });

    return { value: nearestValue, name: nearestName };
  }

  calculateOverallScore() {
    const scores = [];

    if (this.results.margins) {
      scores.push({ score: this.results.margins.score, weight: 0.2 });
    }

    if (this.results.elementSpacing) {
      scores.push({ score: this.results.elementSpacing.score, weight: 0.4 });
    }

    if (this.results.sectionBreaks) {
      scores.push({ score: this.results.sectionBreaks.score, weight: 0.2 });
    }

    if (this.results.paragraphSpacing) {
      scores.push({ score: this.results.paragraphSpacing.score, weight: 0.2 });
    }

    const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const overallScore = Math.round(weightedSum / totalWeight);

    let grade;
    if (overallScore >= 95) grade = 'A++ (Perfect Rhythm)';
    else if (overallScore >= 90) grade = 'A+ (Excellent)';
    else if (overallScore >= 85) grade = 'A (Very Good)';
    else if (overallScore >= 80) grade = 'B (Good)';
    else if (overallScore >= 70) grade = 'C (Fair)';
    else if (overallScore >= 60) grade = 'D (Poor)';
    else grade = 'F (Chaotic)';

    return { score: overallScore, grade: grade, components: scores };
  }

  async exportResults(outputPath) {
    const output = {
      validator: 'SpacingAnalyzer',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      results: this.results
    };

    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`📊 Results exported to: ${outputPath}`);
  }
}

module.exports = SpacingAnalyzer;
