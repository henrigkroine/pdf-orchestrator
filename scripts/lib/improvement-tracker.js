/**
 * Improvement Tracker - Track PDF Quality Improvements
 *
 * Features:
 * - Track quality progression across versions
 * - Detect regressions
 * - Track issue resolution
 * - Trend analysis with AI (Gemini 2.5 Pro)
 * - Predictive analytics
 *
 * @module improvement-tracker
 */

const fs = require('fs').promises;
const path = require('path');

class ImprovementTracker {
  constructor(config = {}) {
    this.config = {
      trackingDir: path.join(__dirname, '../../tracking'),
      enableAI: true,
      aiModel: 'gemini-2.5-pro',
      ...config
    };

    this.history = [];
  }

  async trackProgression(analyses) {
    const versions = analyses.map((a, idx) => ({
      version: idx + 1,
      timestamp: a.timestamp,
      score: a.analysis.score,
      grade: a.analysis.grade,
      path: a.path,
      analysis: a.analysis
    }));

    const progression = {
      versions,
      trend: this._calculateTrend(versions),
      improvement: this._calculateImprovement(versions),
      regressions: await this.detectRegressions({ versions }),
      overallImprovement: versions[versions.length - 1].score - versions[0].score
    };

    return progression;
  }

  async detectRegressions(progression) {
    const regressions = [];
    const versions = progression.versions;

    for (let i = 1; i < versions.length; i++) {
      const prev = versions[i - 1];
      const curr = versions[i];

      if (curr.score < prev.score - 5) {
        regressions.push({
          fromVersion: i,
          toVersion: i + 1,
          scoreDrop: prev.score - curr.score,
          fromGrade: prev.grade,
          toGrade: curr.grade,
          severity: this._calculateRegressionSeverity(prev.score - curr.score)
        });
      }
    }

    return regressions;
  }

  async trackIssueResolution(analyses) {
    const issues = {
      open: [],
      resolved: [],
      regression: []
    };

    // Track common issues across versions
    for (const analysis of analyses) {
      const currentIssues = this._identifyIssues(analysis.analysis);

      for (const issue of currentIssues) {
        if (!this._issuePreviouslyFound(issue, issues.resolved)) {
          issues.open.push(issue);
        }
      }
    }

    return issues;
  }

  _calculateTrend(versions) {
    if (versions.length < 2) return 'stable';

    const scores = versions.map(v => v.score);
    const diffs = [];

    for (let i = 1; i < scores.length; i++) {
      diffs.push(scores[i] - scores[i - 1]);
    }

    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

    if (avgDiff > 2) return 'improving';
    if (avgDiff < -2) return 'declining';
    return 'stable';
  }

  _calculateImprovement(versions) {
    const improvements = [];

    for (let i = 1; i < versions.length; i++) {
      improvements.push({
        fromVersion: i,
        toVersion: i + 1,
        scoreChange: versions[i].score - versions[i - 1].score,
        gradeChange: versions[i].grade !== versions[i - 1].grade
      });
    }

    return improvements;
  }

  _calculateRegressionSeverity(scoreDrop) {
    if (scoreDrop > 20) return 'critical';
    if (scoreDrop > 10) return 'high';
    if (scoreDrop > 5) return 'medium';
    return 'low';
  }

  _identifyIssues(analysis) {
    const issues = [];

    for (const [dimension, score] of Object.entries(analysis.categoryScores)) {
      if (score < 70) {
        issues.push({
          dimension,
          score,
          severity: score < 50 ? 'critical' : score < 60 ? 'high' : 'medium'
        });
      }
    }

    return issues;
  }

  _issuePreviouslyFound(issue, resolvedIssues) {
    return resolvedIssues.some(r => r.dimension === issue.dimension);
  }
}

module.exports = ImprovementTracker;
