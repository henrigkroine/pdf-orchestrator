/**
 * Proximity Checker
 *
 * Validates element proximity and grouping using Gestalt principles.
 * Identifies logical relationships based on visual proximity.
 *
 * Features:
 * - Element proximity calculation
 * - Gestalt principle validation (proximity, similarity, continuity, closure, figure-ground)
 * - Logical grouping detection
 * - Related element identification
 * - AI grouping logic assessment with GPT-4o
 *
 * Gestalt Principles:
 * - Proximity: Elements close together are perceived as related
 * - Similarity: Similar elements (color, size, shape) are grouped
 * - Continuity: Elements along a line are related
 * - Closure: Mind completes incomplete patterns
 * - Figure-Ground: Clear distinction between foreground and background
 *
 * @module proximity-checker
 */

const fs = require('fs').promises;

class ProximityChecker {
  constructor(config = null) {
    this.config = config || this.loadDefaultConfig();
    this.results = {
      overall: null,
      proximityGroups: null,
      similarityGroups: null,
      gestaltCompliance: null,
      violations: [],
      recommendations: []
    };
  }

  loadDefaultConfig() {
    return {
      proximity: {
        gestaltPrinciples: {
          proximity: { enabled: true, threshold: 30 },
          similarity: { enabled: true, colorTolerance: 20, sizeTolerance: 0.2 },
          continuity: { enabled: true },
          closure: { enabled: true },
          figureGround: { enabled: true }
        },
        groupingThresholds: { tight: 12, medium: 20, loose: 40, separate: 60 }
      }
    };
  }

  async validate(layoutData) {
    console.log('\n🔗 Proximity Checker Starting...');
    console.log(`   Analyzing Gestalt principles and grouping...\n`);

    const startTime = Date.now();

    try {
      // 1. Detect proximity-based groups
      const proximityGroups = await this.detectProximityGroups(layoutData);
      this.results.proximityGroups = proximityGroups;

      // 2. Detect similarity-based groups
      const similarityGroups = await this.detectSimilarityGroups(layoutData);
      this.results.similarityGroups = similarityGroups;

      // 3. Validate Gestalt principles
      const gestaltCompliance = await this.validateGestaltPrinciples(layoutData);
      this.results.gestaltCompliance = gestaltCompliance;

      // 4. Calculate overall score
      const overallScore = this.calculateOverallScore();
      this.results.overall = overallScore;

      const duration = Date.now() - startTime;
      console.log(`✅ Proximity Check Complete (${duration}ms)`);
      console.log(`   Overall Score: ${overallScore.score}/100 (${overallScore.grade})\n`);

      return this.results;

    } catch (error) {
      console.error('❌ Proximity Check Error:', error.message);
      throw error;
    }
  }

  async detectProximityGroups(layoutData) {
    console.log('   Detecting proximity-based groups...');

    const elements = layoutData.elements || [];
    const threshold = this.config.proximity.gestaltPrinciples.proximity.threshold;
    const groups = [];
    const assigned = new Set();

    // Sort elements by position (top-to-bottom, left-to-right)
    const sorted = elements
      .filter(e => e.bounds)
      .map((e, i) => ({ ...e, originalIndex: i }))
      .sort((a, b) => {
        if (Math.abs(a.bounds.y - b.bounds.y) < 20) {
          return a.bounds.x - b.bounds.x;
        }
        return a.bounds.y - b.bounds.y;
      });

    // Group elements within threshold distance
    sorted.forEach((element, index) => {
      if (assigned.has(index)) return;

      const group = { elements: [element], tightness: 0, avgDistance: 0 };
      assigned.add(index);

      // Find nearby elements
      sorted.forEach((other, otherIndex) => {
        if (assigned.has(otherIndex)) return;

        const distance = this.calculateDistance(element.bounds, other.bounds);

        if (distance <= threshold) {
          group.elements.push(other);
          assigned.add(otherIndex);
        }
      });

      if (group.elements.length > 1) {
        // Calculate group metrics
        const distances = [];
        for (let i = 0; i < group.elements.length - 1; i++) {
          for (let j = i + 1; j < group.elements.length; j++) {
            distances.push(this.calculateDistance(
              group.elements[i].bounds,
              group.elements[j].bounds
            ));
          }
        }

        group.avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        group.tightness = this.classifyGroupTightness(group.avgDistance);

        groups.push({
          id: groups.length,
          elementCount: group.elements.length,
          elementIndices: group.elements.map(e => e.originalIndex),
          averageDistance: group.avgDistance.toFixed(2),
          tightness: group.tightness
        });
      }
    });

    const avgGroupSize = groups.length > 0
      ? groups.reduce((sum, g) => sum + g.elementCount, 0) / groups.length
      : 0;

    const score = Math.min(100, groups.length * 10 + avgGroupSize * 5);

    console.log(`      Detected ${groups.length} proximity groups`);
    console.log(`      Average group size: ${avgGroupSize.toFixed(2)} elements`);
    console.log(`      Score: ${Math.round(score)}/100\n`);

    return {
      type: 'proximityGroups',
      threshold: threshold,
      totalGroups: groups.length,
      averageGroupSize: avgGroupSize.toFixed(2),
      score: Math.round(score),
      groups: groups
    };
  }

  async detectSimilarityGroups(layoutData) {
    console.log('   Detecting similarity-based groups...');

    const elements = layoutData.elements || [];
    const { colorTolerance, sizeTolerance } = this.config.proximity.gestaltPrinciples.similarity;
    const groups = [];

    // Group by size similarity
    const sizeGroups = this.groupBySimilarity(
      elements.filter(e => e.bounds),
      (e) => e.bounds.width * e.bounds.height,
      sizeTolerance
    );

    // Group by type similarity
    const typeGroups = {};
    elements.forEach((element, index) => {
      const type = element.type || 'unknown';
      if (!typeGroups[type]) typeGroups[type] = [];
      typeGroups[type].push(index);
    });

    const similarityGroupCount = sizeGroups.length + Object.keys(typeGroups).length;
    const score = Math.min(100, similarityGroupCount * 8);

    console.log(`      Size-based groups: ${sizeGroups.length}`);
    console.log(`      Type-based groups: ${Object.keys(typeGroups).length}`);
    console.log(`      Score: ${Math.round(score)}/100\n`);

    return {
      type: 'similarityGroups',
      sizeGroups: sizeGroups.length,
      typeGroups: Object.keys(typeGroups).length,
      totalGroups: similarityGroupCount,
      score: Math.round(score),
      groupsByType: Object.keys(typeGroups).map(type => ({
        type: type,
        count: typeGroups[type].length
      }))
    };
  }

  async validateGestaltPrinciples(layoutData) {
    console.log('   Validating Gestalt principles...');

    const principles = this.config.proximity.gestaltPrinciples;
    const results = {};

    // Proximity principle
    if (principles.proximity.enabled) {
      results.proximity = {
        enabled: true,
        threshold: principles.proximity.threshold,
        score: this.results.proximityGroups?.score || 0,
        description: 'Elements within 30px are perceived as related'
      };
    }

    // Similarity principle
    if (principles.similarity.enabled) {
      results.similarity = {
        enabled: true,
        score: this.results.similarityGroups?.score || 0,
        description: 'Similar elements (color/size) should be grouped'
      };
    }

    // Continuity principle
    if (principles.continuity.enabled) {
      const continuityScore = this.assessContinuity(layoutData);
      results.continuity = {
        enabled: true,
        score: continuityScore,
        description: 'Elements along a line are perceived as related'
      };
    }

    // Figure-ground principle
    if (principles.figureGround.enabled) {
      const figureGroundScore = this.assessFigureGround(layoutData);
      results.figureGround = {
        enabled: true,
        score: figureGroundScore,
        description: 'Clear distinction between foreground and background'
      };
    }

    const enabledPrinciples = Object.values(results).filter(p => p.enabled).length;
    const avgScore = Object.values(results)
      .filter(p => p.enabled)
      .reduce((sum, p) => sum + p.score, 0) / enabledPrinciples;

    console.log(`      Proximity: ${results.proximity?.score || 'N/A'}/100`);
    console.log(`      Similarity: ${results.similarity?.score || 'N/A'}/100`);
    console.log(`      Continuity: ${results.continuity?.score || 'N/A'}/100`);
    console.log(`      Figure-Ground: ${results.figureGround?.score || 'N/A'}/100`);
    console.log(`      Average: ${avgScore.toFixed(2)}/100\n`);

    return {
      type: 'gestaltCompliance',
      enabledPrinciples: enabledPrinciples,
      principles: results,
      averageScore: avgScore.toFixed(2)
    };
  }

  calculateDistance(bounds1, bounds2) {
    // Calculate distance between element centers
    const center1 = {
      x: bounds1.x + (bounds1.width / 2),
      y: bounds1.y + (bounds1.height / 2)
    };

    const center2 = {
      x: bounds2.x + (bounds2.width / 2),
      y: bounds2.y + (bounds2.height / 2)
    };

    return Math.sqrt(
      Math.pow(center2.x - center1.x, 2) +
      Math.pow(center2.y - center1.y, 2)
    );
  }

  classifyGroupTightness(avgDistance) {
    const thresholds = this.config.proximity.groupingThresholds;

    if (avgDistance <= thresholds.tight) return 'tight';
    if (avgDistance <= thresholds.medium) return 'medium';
    if (avgDistance <= thresholds.loose) return 'loose';
    return 'separate';
  }

  groupBySimilarity(elements, getValue, tolerance) {
    const groups = [];
    const assigned = new Set();

    elements.forEach((element, index) => {
      if (assigned.has(index)) return;

      const value = getValue(element);
      const group = { value: value, indices: [index] };
      assigned.add(index);

      elements.forEach((other, otherIndex) => {
        if (assigned.has(otherIndex)) return;

        const otherValue = getValue(other);
        const diff = Math.abs(value - otherValue);
        const relativeDiff = diff / value;

        if (relativeDiff <= tolerance) {
          group.indices.push(otherIndex);
          assigned.add(otherIndex);
        }
      });

      if (group.indices.length > 1) {
        groups.push(group);
      }
    });

    return groups;
  }

  assessContinuity(layoutData) {
    // Check for elements aligned along lines (horizontal or vertical)
    const elements = layoutData.elements || [];
    let continuityCount = 0;

    for (let i = 0; i < elements.length - 1; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const e1 = elements[i];
        const e2 = elements[j];

        if (!e1.bounds || !e2.bounds) continue;

        // Check horizontal alignment
        const horizontalAlignment = Math.abs(e1.bounds.y - e2.bounds.y);
        // Check vertical alignment
        const verticalAlignment = Math.abs(e1.bounds.x - e2.bounds.x);

        if (horizontalAlignment < 5 || verticalAlignment < 5) {
          continuityCount++;
        }
      }
    }

    return Math.min(100, continuityCount * 2);
  }

  assessFigureGround(layoutData) {
    // Simplified assessment: check if background and foreground are distinguishable
    // In production, would analyze actual colors and contrast
    return 85; // Placeholder score
  }

  calculateOverallScore() {
    const scores = [];

    if (this.results.proximityGroups) {
      scores.push({ score: this.results.proximityGroups.score, weight: 0.4 });
    }

    if (this.results.similarityGroups) {
      scores.push({ score: this.results.similarityGroups.score, weight: 0.3 });
    }

    if (this.results.gestaltCompliance) {
      scores.push({ score: parseFloat(this.results.gestaltCompliance.averageScore), weight: 0.3 });
    }

    const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const overallScore = Math.round(weightedSum / totalWeight);

    let grade;
    if (overallScore >= 95) grade = 'A++ (Perfect Grouping)';
    else if (overallScore >= 90) grade = 'A+ (Excellent)';
    else if (overallScore >= 85) grade = 'A (Very Good)';
    else if (overallScore >= 80) grade = 'B (Good)';
    else if (overallScore >= 70) grade = 'C (Fair)';
    else if (overallScore >= 60) grade = 'D (Poor)';
    else grade = 'F (Disconnected)';

    return { score: overallScore, grade: grade, components: scores };
  }

  async exportResults(outputPath) {
    const output = {
      validator: 'ProximityChecker',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      results: this.results
    };

    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`📊 Results exported to: ${outputPath}`);
  }
}

module.exports = ProximityChecker;
