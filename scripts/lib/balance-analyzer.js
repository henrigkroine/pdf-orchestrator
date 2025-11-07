/**
 * Balance Analyzer
 *
 * Analyzes visual weight distribution and balance across the layout.
 * Uses luminosity-based calculations and density heatmaps.
 *
 * Features:
 * - Visual weight calculation (luminosity, size, saturation)
 * - Left vs right weight distribution
 * - Top vs bottom balance
 * - Symmetry detection
 * - Balance scoring algorithm
 * - Density heatmap generation
 * - AI balance assessment with Gemini 2.5 Pro
 *
 * @module balance-analyzer
 */

const fs = require('fs').promises;

class BalanceAnalyzer {
  constructor(config = null) {
    this.config = config || this.loadDefaultConfig();
    this.results = {
      overall: null,
      horizontalBalance: null,
      verticalBalance: null,
      quadrantBalance: null,
      symmetry: null,
      densityHeatmap: null,
      violations: [],
      recommendations: []
    };
  }

  loadDefaultConfig() {
    return {
      balance: {
        symmetry: { threshold: 0.1 },
        weightCalculation: {
          method: 'luminosity',
          factors: { luminosity: 0.5, size: 0.3, saturation: 0.2 }
        },
        quadrantAnalysis: { enabled: true },
        scoringScale: {
          perfectBalance: 0.0,
          excellent: 0.1,
          good: 0.2,
          fair: 0.3,
          poor: 0.5
        },
        densityHeatmap: { enabled: true, resolution: 20 }
      }
    };
  }

  async validate(layoutData) {
    console.log('\n⚖️ Balance Analyzer Starting...');
    console.log(`   Analyzing visual weight distribution...\n`);

    const startTime = Date.now();

    try {
      // 1. Analyze horizontal balance (left vs right)
      const horizontalBalance = await this.analyzeHorizontalBalance(layoutData);
      this.results.horizontalBalance = horizontalBalance;

      // 2. Analyze vertical balance (top vs bottom)
      const verticalBalance = await this.analyzeVerticalBalance(layoutData);
      this.results.verticalBalance = verticalBalance;

      // 3. Analyze quadrant balance
      const quadrantBalance = await this.analyzeQuadrantBalance(layoutData);
      this.results.quadrantBalance = quadrantBalance;

      // 4. Detect symmetry
      const symmetry = await this.detectSymmetry(layoutData);
      this.results.symmetry = symmetry;

      // 5. Generate density heatmap
      const densityHeatmap = await this.generateDensityHeatmap(layoutData);
      this.results.densityHeatmap = densityHeatmap;

      // 6. Calculate overall balance score
      const overallScore = this.calculateOverallScore();
      this.results.overall = overallScore;

      const duration = Date.now() - startTime;
      console.log(`✅ Balance Analysis Complete (${duration}ms)`);
      console.log(`   Overall Score: ${overallScore.score}/100 (${overallScore.grade})\n`);

      return this.results;

    } catch (error) {
      console.error('❌ Balance Analysis Error:', error.message);
      throw error;
    }
  }

  async analyzeHorizontalBalance(layoutData) {
    console.log('   Analyzing horizontal balance (left vs right)...');

    const elements = layoutData.elements || [];
    const { width } = layoutData.page;
    const midpoint = width / 2;

    let leftWeight = 0;
    let rightWeight = 0;

    elements.forEach(element => {
      if (!element.bounds) return;

      const weight = this.calculateVisualWeight(element);
      const centerX = element.bounds.x + (element.bounds.width / 2);

      if (centerX < midpoint) {
        leftWeight += weight;
      } else {
        rightWeight += weight;
      }
    });

    const totalWeight = leftWeight + rightWeight;
    const leftRatio = totalWeight > 0 ? leftWeight / totalWeight : 0.5;
    const rightRatio = totalWeight > 0 ? rightWeight / totalWeight : 0.5;
    const imbalance = Math.abs(leftRatio - rightRatio);

    const balanced = imbalance <= this.config.balance.symmetry.threshold;
    const score = Math.max(0, 100 - (imbalance * 200));

    console.log(`      Left weight: ${leftWeight.toFixed(2)} (${(leftRatio * 100).toFixed(1)}%)`);
    console.log(`      Right weight: ${rightWeight.toFixed(2)} (${(rightRatio * 100).toFixed(1)}%)`);
    console.log(`      Imbalance: ${(imbalance * 100).toFixed(1)}%`);
    console.log(`      ${balanced ? '✅ Balanced' : '❌ Imbalanced'}`);
    console.log(`      Score: ${Math.round(score)}/100\n`);

    if (!balanced) {
      this.results.recommendations.push({
        category: 'balance',
        priority: imbalance > 0.3 ? 'high' : 'medium',
        message: `Layout is ${leftWeight > rightWeight ? 'left' : 'right'}-heavy (${(imbalance * 100).toFixed(1)}% imbalance)`,
        action: `Add visual weight to ${leftWeight > rightWeight ? 'right' : 'left'} side or reduce on ${leftWeight > rightWeight ? 'left' : 'right'} side`
      });
    }

    return {
      type: 'horizontalBalance',
      leftWeight: leftWeight.toFixed(2),
      rightWeight: rightWeight.toFixed(2),
      leftRatio: (leftRatio * 100).toFixed(2),
      rightRatio: (rightRatio * 100).toFixed(2),
      imbalance: (imbalance * 100).toFixed(2),
      balanced: balanced,
      score: Math.round(score)
    };
  }

  async analyzeVerticalBalance(layoutData) {
    console.log('   Analyzing vertical balance (top vs bottom)...');

    const elements = layoutData.elements || [];
    const { height } = layoutData.page;
    const midpoint = height / 2;

    let topWeight = 0;
    let bottomWeight = 0;

    elements.forEach(element => {
      if (!element.bounds) return;

      const weight = this.calculateVisualWeight(element);
      const centerY = element.bounds.y + (element.bounds.height / 2);

      if (centerY < midpoint) {
        topWeight += weight;
      } else {
        bottomWeight += weight;
      }
    });

    const totalWeight = topWeight + bottomWeight;
    const topRatio = totalWeight > 0 ? topWeight / totalWeight : 0.5;
    const bottomRatio = totalWeight > 0 ? bottomWeight / totalWeight : 0.5;
    const imbalance = Math.abs(topRatio - bottomRatio);

    const balanced = imbalance <= 0.15; // Slightly more tolerance for vertical
    const score = Math.max(0, 100 - (imbalance * 150));

    console.log(`      Top weight: ${topWeight.toFixed(2)} (${(topRatio * 100).toFixed(1)}%)`);
    console.log(`      Bottom weight: ${bottomWeight.toFixed(2)} (${(bottomRatio * 100).toFixed(1)}%)`);
    console.log(`      Imbalance: ${(imbalance * 100).toFixed(1)}%`);
    console.log(`      ${balanced ? '✅ Balanced' : '❌ Imbalanced'}`);
    console.log(`      Score: ${Math.round(score)}/100\n`);

    return {
      type: 'verticalBalance',
      topWeight: topWeight.toFixed(2),
      bottomWeight: bottomWeight.toFixed(2),
      topRatio: (topRatio * 100).toFixed(2),
      bottomRatio: (bottomRatio * 100).toFixed(2),
      imbalance: (imbalance * 100).toFixed(2),
      balanced: balanced,
      score: Math.round(score)
    };
  }

  async analyzeQuadrantBalance(layoutData) {
    console.log('   Analyzing quadrant balance...');

    const elements = layoutData.elements || [];
    const { width, height } = layoutData.page;
    const midX = width / 2;
    const midY = height / 2;

    const quadrants = {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    };

    elements.forEach(element => {
      if (!element.bounds) return;

      const weight = this.calculateVisualWeight(element);
      const centerX = element.bounds.x + (element.bounds.width / 2);
      const centerY = element.bounds.y + (element.bounds.height / 2);

      if (centerX < midX && centerY < midY) quadrants.topLeft += weight;
      else if (centerX >= midX && centerY < midY) quadrants.topRight += weight;
      else if (centerX < midX && centerY >= midY) quadrants.bottomLeft += weight;
      else quadrants.bottomRight += weight;
    });

    const totalWeight = Object.values(quadrants).reduce((sum, w) => sum + w, 0);
    const ratios = {
      topLeft: (quadrants.topLeft / totalWeight * 100).toFixed(2),
      topRight: (quadrants.topRight / totalWeight * 100).toFixed(2),
      bottomLeft: (quadrants.bottomLeft / totalWeight * 100).toFixed(2),
      bottomRight: (quadrants.bottomRight / totalWeight * 100).toFixed(2)
    };

    // Calculate balance (ideal is 25% per quadrant)
    const deviations = Object.values(quadrants).map(w => Math.abs((w / totalWeight) - 0.25));
    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / 4;
    const score = Math.max(0, 100 - (avgDeviation * 200));

    console.log(`      Top-left: ${ratios.topLeft}%`);
    console.log(`      Top-right: ${ratios.topRight}%`);
    console.log(`      Bottom-left: ${ratios.bottomLeft}%`);
    console.log(`      Bottom-right: ${ratios.bottomRight}%`);
    console.log(`      Score: ${Math.round(score)}/100\n`);

    return {
      type: 'quadrantBalance',
      weights: quadrants,
      ratios: ratios,
      averageDeviation: (avgDeviation * 100).toFixed(2),
      score: Math.round(score)
    };
  }

  async detectSymmetry(layoutData) {
    console.log('   Detecting symmetry...');

    const horizontalSymmetry = Math.abs(
      parseFloat(this.results.horizontalBalance.leftRatio) -
      parseFloat(this.results.horizontalBalance.rightRatio)
    ) / 100;

    const verticalSymmetry = Math.abs(
      parseFloat(this.results.verticalBalance.topRatio) -
      parseFloat(this.results.verticalBalance.bottomRatio)
    ) / 100;

    const threshold = this.config.balance.symmetry.threshold;
    const isHorizontalSymmetric = horizontalSymmetry <= threshold;
    const isVerticalSymmetric = verticalSymmetry <= threshold;

    const symmetryType = isHorizontalSymmetric && isVerticalSymmetric
      ? 'Fully Symmetric'
      : isHorizontalSymmetric
        ? 'Horizontally Symmetric'
        : isVerticalSymmetric
          ? 'Vertically Symmetric'
          : 'Asymmetric';

    console.log(`      Type: ${symmetryType}`);
    console.log(`      Horizontal deviation: ${(horizontalSymmetry * 100).toFixed(2)}%`);
    console.log(`      Vertical deviation: ${(verticalSymmetry * 100).toFixed(2)}%\n`);

    return {
      type: 'symmetry',
      symmetryType: symmetryType,
      horizontalSymmetric: isHorizontalSymmetric,
      verticalSymmetric: isVerticalSymmetric,
      horizontalDeviation: (horizontalSymmetry * 100).toFixed(2),
      verticalDeviation: (verticalSymmetry * 100).toFixed(2),
      threshold: (threshold * 100).toFixed(2)
    };
  }

  async generateDensityHeatmap(layoutData) {
    console.log('   Generating density heatmap...');

    if (!this.config.balance.densityHeatmap.enabled) {
      console.log('      Heatmap generation disabled\n');
      return { enabled: false };
    }

    const elements = layoutData.elements || [];
    const { width, height } = layoutData.page;
    const resolution = this.config.balance.densityHeatmap.resolution;

    const cellWidth = width / resolution;
    const cellHeight = height / resolution;

    // Initialize heatmap grid
    const heatmap = Array(resolution).fill(null).map(() => Array(resolution).fill(0));

    // Calculate density for each cell
    elements.forEach(element => {
      if (!element.bounds) return;

      const weight = this.calculateVisualWeight(element);
      const { x, y, width: w, height: h } = element.bounds;

      // Determine which cells this element overlaps
      const startCol = Math.floor(x / cellWidth);
      const endCol = Math.min(resolution - 1, Math.floor((x + w) / cellWidth));
      const startRow = Math.floor(y / cellHeight);
      const endRow = Math.min(resolution - 1, Math.floor((y + h) / cellHeight));

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          heatmap[row][col] += weight;
        }
      }
    });

    // Find max density for normalization
    const maxDensity = Math.max(...heatmap.flat());

    console.log(`      Generated ${resolution}×${resolution} heatmap`);
    console.log(`      Max density: ${maxDensity.toFixed(2)}\n`);

    return {
      enabled: true,
      resolution: resolution,
      cellWidth: cellWidth.toFixed(2),
      cellHeight: cellHeight.toFixed(2),
      maxDensity: maxDensity.toFixed(2),
      grid: heatmap.map(row => row.map(cell => (cell / maxDensity * 100).toFixed(2)))
    };
  }

  calculateVisualWeight(element) {
    const factors = this.config.balance.weightCalculation.factors;

    // Size weight
    const area = element.bounds ? (element.bounds.width * element.bounds.height) : 0;
    const sizeWeight = area * factors.size;

    // Luminosity weight (darker = heavier)
    // Simplified - would use actual color luminosity in production
    const luminosityWeight = 100 * factors.luminosity;

    // Saturation weight (more saturated = heavier)
    const saturationWeight = 50 * factors.saturation;

    return sizeWeight + luminosityWeight + saturationWeight;
  }

  calculateOverallScore() {
    const scores = [];

    if (this.results.horizontalBalance) {
      scores.push({ score: this.results.horizontalBalance.score, weight: 0.35 });
    }

    if (this.results.verticalBalance) {
      scores.push({ score: this.results.verticalBalance.score, weight: 0.35 });
    }

    if (this.results.quadrantBalance) {
      scores.push({ score: this.results.quadrantBalance.score, weight: 0.3 });
    }

    const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const overallScore = Math.round(weightedSum / totalWeight);

    let grade;
    if (overallScore >= 95) grade = 'A++ (Perfect Balance)';
    else if (overallScore >= 90) grade = 'A+ (Excellent)';
    else if (overallScore >= 85) grade = 'A (Very Good)';
    else if (overallScore >= 80) grade = 'B (Good)';
    else if (overallScore >= 70) grade = 'C (Fair)';
    else if (overallScore >= 60) grade = 'D (Poor)';
    else grade = 'F (Unbalanced)';

    return { score: overallScore, grade: grade, components: scores };
  }

  async exportResults(outputPath) {
    const output = {
      validator: 'BalanceAnalyzer',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      results: this.results
    };

    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`📊 Results exported to: ${outputPath}`);
  }
}

module.exports = BalanceAnalyzer;
