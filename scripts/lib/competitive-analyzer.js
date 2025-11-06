/**
 * Competitive Analyzer - Competitive Intelligence for PDFs
 *
 * Features:
 * - Feature comparison matrix
 * - Competitive advantages/disadvantages
 * - Best practice extraction
 * - Market positioning analysis
 * - AI competitive analysis (Gemini 2.5 Pro)
 *
 * @module competitive-analyzer
 */

const fs = require('fs').promises;
const path = require('path');

class CompetitiveAnalyzer {
  constructor(config = {}) {
    this.config = {
      enableAI: true,
      aiModel: 'gemini-2.5-pro',
      ...config
    };
  }

  async compareFeatures(testAnalysis, competitorAnalyses) {
    const features = [
      'visual_design',
      'typography',
      'color_usage',
      'layout',
      'content_quality',
      'accessibility',
      'brand_consistency',
      'technical_quality'
    ];

    const matrix = {
      test: {},
      competitors: []
    };

    // Test document features
    for (const feature of features) {
      matrix.test[feature] = testAnalysis.categoryScores?.[feature] || 0;
    }

    // Competitor features
    for (const competitor of competitorAnalyses) {
      const scores = {};
      for (const feature of features) {
        scores[feature] = competitor.analysis.categoryScores?.[feature] || 0;
      }
      matrix.competitors.push({
        name: competitor.name,
        scores
      });
    }

    return matrix;
  }

  async identifyAdvantages(testAnalysis, competitorAnalyses) {
    const strengths = [];
    const weaknesses = [];
    const opportunities = [];

    // Calculate average competitor scores
    const avgScores = this._calculateAverageScores(competitorAnalyses);

    // Identify strengths (where test is above average)
    for (const [dimension, score] of Object.entries(testAnalysis.categoryScores || {})) {
      const avgScore = avgScores[dimension] || 0;

      if (score > avgScore + 10) {
        strengths.push({
          dimension,
          advantage: score - avgScore,
          description: `${dimension} is ${(score - avgScore).toFixed(1)} points above average`
        });
      } else if (score < avgScore - 10) {
        weaknesses.push({
          dimension,
          gap: avgScore - score,
          description: `${dimension} is ${(avgScore - score).toFixed(1)} points below average`
        });
      }

      // Opportunities (where everyone is low)
      if (avgScore < 70 && score < 70) {
        opportunities.push({
          dimension,
          description: `${dimension} is weak across the market - opportunity to lead`
        });
      }
    }

    return {
      strengths,
      weaknesses,
      opportunities
    };
  }

  async extractBestPractices(competitorAnalyses) {
    const bestPractices = [];

    // Find best performers in each dimension
    const dimensions = [
      'visual_design',
      'typography',
      'color_usage',
      'layout',
      'content_quality',
      'accessibility'
    ];

    for (const dimension of dimensions) {
      const best = this._findBestInDimension(competitorAnalyses, dimension);

      if (best && best.score > 85) {
        bestPractices.push({
          dimension,
          leader: best.name,
          score: best.score,
          practice: `Study ${best.name}'s approach to ${dimension}`
        });
      }
    }

    return bestPractices;
  }

  async analyzePositioning(testAnalysis, competitorAnalyses) {
    const allDocs = [
      { name: 'Test', analysis: testAnalysis },
      ...competitorAnalyses.map(c => ({ name: c.name, analysis: c.analysis }))
    ];

    // Sort by score
    const sorted = allDocs.sort((a, b) => b.analysis.score - a.analysis.score);
    const testRank = sorted.findIndex(d => d.name === 'Test') + 1;

    // Identify differentiators
    const differentiators = [];
    for (const [dimension, score] of Object.entries(testAnalysis.categoryScores || {})) {
      const maxCompetitorScore = Math.max(
        ...competitorAnalyses.map(c => c.analysis.categoryScores?.[dimension] || 0)
      );

      if (score > maxCompetitorScore + 5) {
        differentiators.push({
          dimension,
          advantage: score - maxCompetitorScore,
          description: `Market leader in ${dimension}`
        });
      }
    }

    return {
      rank: testRank,
      total: allDocs.length,
      percentile: ((allDocs.length - testRank + 1) / allDocs.length) * 100,
      differentiators,
      positioning: testRank === 1 ? 'market_leader' : testRank <= 3 ? 'top_tier' : 'mid_tier'
    };
  }

  _calculateAverageScores(competitorAnalyses) {
    const avgScores = {};
    const dimensions = new Set();

    // Collect all dimensions
    for (const competitor of competitorAnalyses) {
      for (const dimension of Object.keys(competitor.analysis.categoryScores || {})) {
        dimensions.add(dimension);
      }
    }

    // Calculate averages
    for (const dimension of dimensions) {
      const scores = competitorAnalyses.map(
        c => c.analysis.categoryScores?.[dimension] || 0
      );
      avgScores[dimension] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    return avgScores;
  }

  _findBestInDimension(competitorAnalyses, dimension) {
    let best = null;
    let maxScore = 0;

    for (const competitor of competitorAnalyses) {
      const score = competitor.analysis.categoryScores?.[dimension] || 0;
      if (score > maxScore) {
        maxScore = score;
        best = {
          name: competitor.name,
          score
        };
      }
    }

    return best;
  }
}

module.exports = CompetitiveAnalyzer;
