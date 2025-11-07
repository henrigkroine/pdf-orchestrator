/**
 * Density Analyzer
 *
 * Analyzes content density and suggests optimizations
 *
 * Features:
 * - Content density heatmap
 * - Crowded area identification
 * - Content reduction suggestions
 * - Visual weight balancing
 * - Readability scoring
 *
 * @module density-analyzer
 */

const { createCanvas } = require('canvas');

class DensityAnalyzer {
  constructor(config = {}) {
    this.config = {
      gridSize: config.gridSize || 50, // Analyze in 50x50 pixel cells
      densityThreshold: config.densityThreshold || 0.7, // 70% content = crowded
      ...config
    };

    // Density thresholds
    this.thresholds = {
      sparse: 0.3,     // < 30% content
      comfortable: 0.5, // 30-60% content
      dense: 0.7,      // 60-80% content
      crowded: 0.8     // > 80% content
    };
  }

  /**
   * Analyze layout density
   * @param {Object} layout - Layout to analyze
   * @returns {Object} Density analysis results
   */
  analyzeDensity(layout) {
    console.log('\n📊 Analyzing Content Density...\n');

    // Calculate overall density
    const overallDensity = this.calculateOverallDensity(layout);
    console.log(`   Overall density: ${(overallDensity * 100).toFixed(1)}%`);

    // Generate density heatmap
    const heatmap = this.generateHeatmap(layout);
    console.log(`   Heatmap: ${heatmap.cells.length} cells analyzed`);

    // Identify crowded areas
    const crowdedAreas = this.identifyCrowdedAreas(heatmap);
    console.log(`   Crowded areas: ${crowdedAreas.length}`);

    // Calculate visual weight distribution
    const weightDistribution = this.calculateWeightDistribution(layout);

    // Assess readability
    const readability = this.assessReadability(layout, overallDensity);
    console.log(`   Readability score: ${readability.score}/10`);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      overallDensity,
      crowdedAreas,
      weightDistribution,
      readability
    );

    return {
      overallDensity: {
        value: overallDensity,
        percentage: (overallDensity * 100).toFixed(1) + '%',
        classification: this.classifyDensity(overallDensity)
      },
      heatmap,
      crowdedAreas,
      weightDistribution,
      readability,
      recommendations
    };
  }

  /**
   * Calculate overall density
   */
  calculateOverallDensity(layout) {
    const totalArea = layout.width * layout.height;

    if (!layout.elements || layout.elements.length === 0) {
      return 0;
    }

    const contentArea = layout.elements.reduce((sum, el) => {
      return sum + (el.width * el.height);
    }, 0);

    return contentArea / totalArea;
  }

  /**
   * Generate density heatmap
   */
  generateHeatmap(layout) {
    const cellSize = this.config.gridSize;
    const cols = Math.ceil(layout.width / cellSize);
    const rows = Math.ceil(layout.height / cellSize);

    const cells = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellSize;
        const y = row * cellSize;

        const cell = {
          row,
          col,
          x,
          y,
          width: Math.min(cellSize, layout.width - x),
          height: Math.min(cellSize, layout.height - y)
        };

        // Calculate density for this cell
        cell.density = this.calculateCellDensity(cell, layout.elements);
        cell.classification = this.classifyDensity(cell.density);

        cells.push(cell);
      }
    }

    return {
      cols,
      rows,
      cellSize,
      cells,
      averageDensity: cells.reduce((sum, c) => sum + c.density, 0) / cells.length
    };
  }

  /**
   * Calculate density for single cell
   */
  calculateCellDensity(cell, elements) {
    const cellArea = cell.width * cell.height;

    // Find elements that overlap with this cell
    let overlapArea = 0;

    for (const el of elements) {
      const overlap = this.calculateOverlap(cell, el);
      overlapArea += overlap;
    }

    return overlapArea / cellArea;
  }

  /**
   * Calculate overlap between two rectangles
   */
  calculateOverlap(rect1, rect2) {
    const xOverlap = Math.max(0,
      Math.min(rect1.x + rect1.width, rect2.x + rect2.width) -
      Math.max(rect1.x, rect2.x)
    );

    const yOverlap = Math.max(0,
      Math.min(rect1.y + rect1.height, rect2.y + rect2.height) -
      Math.max(rect1.y, rect2.y)
    );

    return xOverlap * yOverlap;
  }

  /**
   * Classify density level
   */
  classifyDensity(density) {
    if (density < this.thresholds.sparse) {
      return 'sparse';
    } else if (density < this.thresholds.comfortable) {
      return 'comfortable';
    } else if (density < this.thresholds.dense) {
      return 'dense';
    } else if (density < this.thresholds.crowded) {
      return 'crowded';
    } else {
      return 'overcrowded';
    }
  }

  /**
   * Identify crowded areas
   */
  identifyCrowdedAreas(heatmap) {
    const crowded = heatmap.cells.filter(cell =>
      cell.density >= this.thresholds.dense
    );

    // Group adjacent crowded cells into regions
    const regions = this.groupCells(crowded);

    return regions.map(region => ({
      cells: region,
      area: {
        x: Math.min(...region.map(c => c.x)),
        y: Math.min(...region.map(c => c.y)),
        width: (Math.max(...region.map(c => c.x + c.width)) - Math.min(...region.map(c => c.x))),
        height: (Math.max(...region.map(c => c.y + c.height)) - Math.min(...region.map(c => c.y)))
      },
      averageDensity: region.reduce((sum, c) => sum + c.density, 0) / region.length,
      severity: this.calculateSeverity(region)
    }));
  }

  /**
   * Group adjacent cells
   */
  groupCells(cells) {
    if (cells.length === 0) return [];

    const regions = [];
    const visited = new Set();

    for (const cell of cells) {
      const key = `${cell.row},${cell.col}`;

      if (visited.has(key)) continue;

      const region = [];
      const queue = [cell];

      while (queue.length > 0) {
        const current = queue.shift();
        const currentKey = `${current.row},${current.col}`;

        if (visited.has(currentKey)) continue;

        visited.add(currentKey);
        region.push(current);

        // Find adjacent cells
        const adjacent = cells.filter(c =>
          !visited.has(`${c.row},${c.col}`) &&
          Math.abs(c.row - current.row) <= 1 &&
          Math.abs(c.col - current.col) <= 1 &&
          !(c.row === current.row && c.col === current.col)
        );

        queue.push(...adjacent);
      }

      if (region.length > 0) {
        regions.push(region);
      }
    }

    return regions;
  }

  /**
   * Calculate severity of crowded region
   */
  calculateSeverity(region) {
    const avgDensity = region.reduce((sum, c) => sum + c.density, 0) / region.length;
    const size = region.length;

    if (avgDensity > 0.9 || size > 20) {
      return 'critical';
    } else if (avgDensity > 0.8 || size > 10) {
      return 'high';
    } else if (avgDensity > 0.7 || size > 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Calculate visual weight distribution
   */
  calculateWeightDistribution(layout) {
    // Divide layout into quadrants
    const midX = layout.width / 2;
    const midY = layout.height / 2;

    const quadrants = {
      topLeft: { x: 0, y: 0, width: midX, height: midY, weight: 0 },
      topRight: { x: midX, y: 0, width: midX, height: midY, weight: 0 },
      bottomLeft: { x: 0, y: midY, width: midX, height: midY, weight: 0 },
      bottomRight: { x: midX, y: midY, width: midX, height: midY, weight: 0 }
    };

    // Calculate weight for each quadrant
    for (const el of layout.elements || []) {
      const elWeight = this.calculateElementWeight(el);

      // Distribute weight to quadrants based on overlap
      for (const [name, quad] of Object.entries(quadrants)) {
        const overlap = this.calculateOverlap(quad, el);
        const overlapRatio = overlap / (el.width * el.height);
        quad.weight += elWeight * overlapRatio;
      }
    }

    // Calculate balance
    const totalWeight = Object.values(quadrants).reduce((sum, q) => sum + q.weight, 0);
    const avgWeight = totalWeight / 4;

    const variance = Math.sqrt(
      Object.values(quadrants).reduce((sum, q) =>
        sum + Math.pow(q.weight - avgWeight, 2), 0
      ) / 4
    );

    const isBalanced = variance < avgWeight * 0.3; // Within 30% of average

    return {
      quadrants: Object.fromEntries(
        Object.entries(quadrants).map(([name, q]) => [
          name,
          {
            weight: q.weight.toFixed(2),
            percentage: ((q.weight / totalWeight) * 100).toFixed(1) + '%'
          }
        ])
      ),
      totalWeight: totalWeight.toFixed(2),
      averageWeight: avgWeight.toFixed(2),
      variance: variance.toFixed(2),
      isBalanced,
      recommendation: isBalanced ?
        'Visual weight is well balanced' :
        'Consider redistributing content for better balance'
    };
  }

  /**
   * Calculate element visual weight
   */
  calculateElementWeight(element) {
    let weight = element.width * element.height; // Base: area

    // Adjust for type
    const typeWeights = {
      'heading': 1.5,
      'image': 1.3,
      'text': 1.0,
      'icon': 0.8
    };

    weight *= typeWeights[element.type] || 1.0;

    // Adjust for color/contrast
    if (element.color && element.color.toLowerCase().includes('dark')) {
      weight *= 1.2; // Darker elements have more visual weight
    }

    // Adjust for font size (for text elements)
    if (element.fontSize) {
      weight *= (element.fontSize / 12); // Normalize to 12pt
    }

    return weight;
  }

  /**
   * Assess readability
   */
  assessReadability(layout, density) {
    let score = 10;
    const issues = [];

    // Check overall density
    if (density > this.thresholds.crowded) {
      score -= 3;
      issues.push('Overall density is too high - content feels cramped');
    } else if (density > this.thresholds.dense) {
      score -= 1.5;
      issues.push('Density is on the high side - could use more breathing room');
    } else if (density < this.thresholds.sparse) {
      score -= 1;
      issues.push('Content is sparse - may appear incomplete');
    }

    // Check text elements
    const textElements = (layout.elements || []).filter(el => el.type === 'text');

    for (const el of textElements) {
      // Check line length
      if (el.width > 700) {
        score -= 0.5;
        issues.push(`Text block is too wide (${el.width}pt) - hard to read long lines`);
      }

      // Check line height
      if (el.lineHeight && el.lineHeight < 1.4) {
        score -= 0.5;
        issues.push(`Line height too tight (${el.lineHeight})`);
      }

      // Check font size
      if (el.fontSize && el.fontSize < 10) {
        score -= 0.5;
        issues.push(`Font size too small (${el.fontSize}pt)`);
      }
    }

    // Check element spacing
    if (layout.elements && layout.elements.length > 1) {
      let touchingCount = 0;

      for (let i = 0; i < layout.elements.length - 1; i++) {
        const el1 = layout.elements[i];
        const el2 = layout.elements[i + 1];

        const distance = this.calculateDistance(el1, el2);

        if (distance < 8) {
          touchingCount++;
        }
      }

      if (touchingCount > 0) {
        score -= Math.min(2, touchingCount * 0.5);
        issues.push(`${touchingCount} pairs of elements too close together`);
      }
    }

    score = Math.max(0, Math.min(10, score));

    return {
      score: score.toFixed(1),
      grade: this.scoreToGrade(score),
      issues,
      recommendation: score >= 8 ?
        'Excellent readability' :
        score >= 6 ?
        'Good readability with room for improvement' :
        'Readability needs significant improvement'
    };
  }

  /**
   * Calculate distance between elements
   */
  calculateDistance(el1, el2) {
    // Calculate closest edge-to-edge distance

    let hDist = 0;
    if (el1.x + el1.width < el2.x) {
      hDist = el2.x - (el1.x + el1.width);
    } else if (el2.x + el2.width < el1.x) {
      hDist = el1.x - (el2.x + el2.width);
    }

    let vDist = 0;
    if (el1.y + el1.height < el2.y) {
      vDist = el2.y - (el1.y + el1.height);
    } else if (el2.y + el2.height < el1.y) {
      vDist = el1.y - (el2.y + el2.height);
    }

    if (hDist === 0 && vDist === 0) {
      return 0;
    } else if (hDist === 0) {
      return vDist;
    } else if (vDist === 0) {
      return hDist;
    } else {
      return Math.sqrt(hDist * hDist + vDist * vDist);
    }
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(density, crowdedAreas, weightDistribution, readability) {
    const recommendations = [];

    // Density recommendations
    if (density > this.thresholds.crowded) {
      recommendations.push({
        priority: 'high',
        category: 'density',
        issue: 'Content is overcrowded',
        action: 'Reduce content by 20-30% or increase page size',
        benefit: 'Improved readability and visual comfort'
      });
    } else if (density > this.thresholds.dense) {
      recommendations.push({
        priority: 'medium',
        category: 'density',
        issue: 'Content density is high',
        action: 'Increase spacing between elements by 30-40%',
        benefit: 'Better breathing room and scannability'
      });
    } else if (density < this.thresholds.sparse) {
      recommendations.push({
        priority: 'low',
        category: 'density',
        issue: 'Content is sparse',
        action: 'Add more content or reduce page size',
        benefit: 'More professional and complete appearance'
      });
    }

    // Crowded areas
    if (crowdedAreas.length > 0) {
      const critical = crowdedAreas.filter(a => a.severity === 'critical');
      const high = crowdedAreas.filter(a => a.severity === 'high');

      if (critical.length > 0) {
        recommendations.push({
          priority: 'critical',
          category: 'crowding',
          issue: `${critical.length} critically crowded area(s)`,
          action: 'Redistribute content or split into multiple sections',
          benefit: 'Prevents reader overwhelm and improves focus'
        });
      } else if (high.length > 0) {
        recommendations.push({
          priority: 'high',
          category: 'crowding',
          issue: `${high.length} highly crowded area(s)`,
          action: 'Increase whitespace in crowded regions',
          benefit: 'Improved visual clarity and emphasis'
        });
      }
    }

    // Weight distribution
    if (!weightDistribution.isBalanced) {
      recommendations.push({
        priority: 'medium',
        category: 'balance',
        issue: 'Visual weight is unbalanced',
        action: 'Redistribute content for better balance across quadrants',
        benefit: 'More professional and harmonious appearance'
      });
    }

    // Readability
    if (parseFloat(readability.score) < 7) {
      recommendations.push({
        priority: 'high',
        category: 'readability',
        issue: readability.issues.join('; '),
        action: 'Address readability issues: proper line length, spacing, font size',
        benefit: 'Significantly improved reading experience'
      });
    }

    return recommendations;
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

module.exports = DensityAnalyzer;
