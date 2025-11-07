/**
 * Self-Improving System
 *
 * Learns from fix results and continuously improves automation accuracy.
 * Implements adaptive learning and strategy optimization.
 *
 * @module self-improvement
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Self-Improving System
 */
export class SelfImprovingSystem {
  constructor(options = {}) {
    this.options = {
      dbPath: options.dbPath || path.join(projectRoot, 'data', 'learning.db'),
      learningRate: options.learningRate || 0.1,
      minSamplesForUpdate: options.minSamplesForUpdate || 5,
      verbose: options.verbose || false,
      ...options
    };

    this.db = null;

    this.strategies = {
      'color_replace': {
        successRate: 0.95,
        avgTime: 2000,
        confidence: 0.8,
        improvements: []
      },
      'font_replace': {
        successRate: 0.92,
        avgTime: 3000,
        confidence: 0.85,
        improvements: []
      },
      'resize_frame': {
        successRate: 0.88,
        avgTime: 5000,
        confidence: 0.75,
        improvements: []
      },
      'ai_generation': {
        successRate: 0.70,
        avgTime: 8000,
        confidence: 0.60,
        improvements: []
      }
    };

    this.learningHistory = [];
  }

  /**
   * Initialize learning system
   */
  async initialize() {
    console.log('🎓 Initializing self-improvement system...');

    // Ensure data directory exists
    const dataDir = path.join(projectRoot, 'data');
    await fs.mkdir(dataDir, { recursive: true });

    // Open database
    this.db = await open({
      filename: this.options.dbPath,
      driver: sqlite3.Database
    });

    // Create tables
    await this.createTables();

    // Load existing strategies
    await this.loadStrategies();

    console.log('✅ Self-improvement system ready');
  }

  /**
   * Create database tables
   */
  async createTables() {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS fix_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        strategy_type TEXT NOT NULL,
        violation_type TEXT NOT NULL,
        success BOOLEAN NOT NULL,
        time_elapsed INTEGER NOT NULL,
        error_message TEXT,
        attempted_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS strategy_performance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        strategy_type TEXT NOT NULL UNIQUE,
        success_rate REAL NOT NULL,
        avg_time INTEGER NOT NULL,
        confidence REAL NOT NULL,
        total_attempts INTEGER NOT NULL,
        last_updated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS learning_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        description TEXT NOT NULL,
        improvement_delta REAL,
        occurred_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS strategy_improvements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        strategy_type TEXT NOT NULL,
        improvement_type TEXT NOT NULL,
        description TEXT NOT NULL,
        impact_estimate REAL,
        implemented_at TEXT NOT NULL
      );
    `);
  }

  /**
   * Load existing strategies from database
   */
  async loadStrategies() {
    const storedStrategies = await this.db.all(
      'SELECT * FROM strategy_performance'
    );

    for (const stored of storedStrategies) {
      if (this.strategies[stored.strategy_type]) {
        this.strategies[stored.strategy_type] = {
          successRate: stored.success_rate,
          avgTime: stored.avg_time,
          confidence: stored.confidence,
          improvements: []
        };
      }
    }

    if (this.options.verbose) {
      console.log(`  Loaded ${storedStrategies.length} strategy profiles`);
    }
  }

  /**
   * Learn from fix results
   */
  async learnFromFixes(fixResults) {
    console.log('\n🎓 Learning from fix results...');

    const learningSession = {
      timestamp: new Date().toISOString(),
      fixesAnalyzed: fixResults.length,
      strategiesImproved: 0,
      accuracyGain: 0,
      insights: []
    };

    // Analyze successful fixes
    const successful = fixResults.filter(r => r.success);
    for (const result of successful) {
      await this.recordFixAttempt(result, true);
      await this.reinforceStrategy(result.fixStrategy);
    }

    // Analyze failed fixes
    const failed = fixResults.filter(r => !r.success);
    for (const result of failed) {
      await this.recordFixAttempt(result, false);
      await this.adjustStrategy(result.fixStrategy, result.error);
    }

    // Update all strategy profiles
    for (const strategyType of Object.keys(this.strategies)) {
      const updated = await this.updateStrategyProfile(strategyType);
      if (updated) {
        learningSession.strategiesImproved++;
      }
    }

    // Calculate overall accuracy gain
    learningSession.accuracyGain = await this.calculateAccuracyGain();

    // Generate insights
    learningSession.insights = await this.generateInsights(successful, failed);

    // Record learning event
    await this.recordLearningEvent({
      event_type: 'learning_session',
      description: `Learned from ${fixResults.length} fixes`,
      improvement_delta: learningSession.accuracyGain,
      occurred_at: learningSession.timestamp
    });

    this.learningHistory.push(learningSession);

    console.log('\n📚 Learning Session Complete:');
    console.log(`  Fixes analyzed: ${learningSession.fixesAnalyzed}`);
    console.log(`  Strategies improved: ${learningSession.strategiesImproved}`);
    console.log(`  Accuracy gain: +${learningSession.accuracyGain.toFixed(2)}%`);
    console.log(`  Insights generated: ${learningSession.insights.length}`);

    return learningSession;
  }

  /**
   * Record fix attempt
   */
  async recordFixAttempt(result, success) {
    await this.db.run(
      `INSERT INTO fix_attempts
       (strategy_type, violation_type, success, time_elapsed, error_message, attempted_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        result.fixStrategy?.type || 'unknown',
        result.violation?.type || 'unknown',
        success ? 1 : 0,
        result.timeElapsed || 0,
        result.error || null,
        new Date().toISOString()
      ]
    );
  }

  /**
   * Reinforce successful strategy
   */
  async reinforceStrategy(fixStrategy) {
    if (!fixStrategy || !fixStrategy.type) return;

    const strategyType = fixStrategy.type;

    if (!this.strategies[strategyType]) {
      // New strategy type discovered
      this.strategies[strategyType] = {
        successRate: 0.5,
        avgTime: 5000,
        confidence: 0.5,
        improvements: []
      };
    }

    // Positive reinforcement: increase success rate slightly
    const currentRate = this.strategies[strategyType].successRate;
    const newRate = Math.min(1.0, currentRate + (this.options.learningRate * (1 - currentRate)));

    this.strategies[strategyType].successRate = newRate;
    this.strategies[strategyType].confidence = Math.min(1.0, this.strategies[strategyType].confidence + 0.01);

    // Record improvement
    const improvement = {
      type: 'reinforcement',
      description: 'Success reinforced strategy',
      before: currentRate,
      after: newRate,
      delta: newRate - currentRate,
      timestamp: new Date().toISOString()
    };

    this.strategies[strategyType].improvements.push(improvement);

    if (this.options.verbose) {
      console.log(`  ✅ Reinforced ${strategyType}: ${(currentRate * 100).toFixed(1)}% → ${(newRate * 100).toFixed(1)}%`);
    }
  }

  /**
   * Adjust strategy based on failure
   */
  async adjustStrategy(fixStrategy, error) {
    if (!fixStrategy || !fixStrategy.type) return;

    const strategyType = fixStrategy.type;

    if (!this.strategies[strategyType]) return;

    // Negative adjustment: decrease success rate
    const currentRate = this.strategies[strategyType].successRate;
    const penalty = this.options.learningRate * currentRate;
    const newRate = Math.max(0.1, currentRate - penalty);

    this.strategies[strategyType].successRate = newRate;
    this.strategies[strategyType].confidence = Math.max(0.1, this.strategies[strategyType].confidence - 0.02);

    // Analyze error for improvement opportunities
    const improvement = this.analyzeFailure(strategyType, error);
    if (improvement) {
      this.strategies[strategyType].improvements.push(improvement);

      // Record improvement suggestion
      await this.db.run(
        `INSERT INTO strategy_improvements
         (strategy_type, improvement_type, description, impact_estimate, implemented_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          strategyType,
          improvement.type,
          improvement.description,
          improvement.estimatedImpact || 0.05,
          new Date().toISOString()
        ]
      );
    }

    if (this.options.verbose) {
      console.log(`  ⚠️  Adjusted ${strategyType}: ${(currentRate * 100).toFixed(1)}% → ${(newRate * 100).toFixed(1)}%`);
      if (improvement) {
        console.log(`     Suggestion: ${improvement.description}`);
      }
    }
  }

  /**
   * Analyze failure for improvement opportunities
   */
  analyzeFailure(strategyType, error) {
    if (!error) return null;

    const errorLower = error.toLowerCase();

    // Pattern matching for common errors
    if (errorLower.includes('timeout')) {
      return {
        type: 'timeout_handling',
        description: 'Increase timeout for this operation',
        estimatedImpact: 0.10,
        implementation: 'Add retry logic with exponential backoff'
      };
    }

    if (errorLower.includes('not found')) {
      return {
        type: 'validation',
        description: 'Add pre-check for resource existence',
        estimatedImpact: 0.15,
        implementation: 'Validate resources before attempting fix'
      };
    }

    if (errorLower.includes('permission') || errorLower.includes('access')) {
      return {
        type: 'permissions',
        description: 'Check permissions before operation',
        estimatedImpact: 0.08,
        implementation: 'Add permission check step'
      };
    }

    if (errorLower.includes('syntax') || errorLower.includes('parse')) {
      return {
        type: 'script_generation',
        description: 'Improve ExtendScript generation logic',
        estimatedImpact: 0.12,
        implementation: 'Add script validation before execution'
      };
    }

    // Generic improvement
    return {
      type: 'error_handling',
      description: `Handle "${error.substring(0, 50)}" error case`,
      estimatedImpact: 0.05,
      implementation: 'Add specific error handling'
    };
  }

  /**
   * Update strategy profile in database
   */
  async updateStrategyProfile(strategyType) {
    const strategy = this.strategies[strategyType];
    if (!strategy) return false;

    // Get recent performance data
    const recentData = await this.db.all(
      `SELECT success, time_elapsed
       FROM fix_attempts
       WHERE strategy_type = ?
       ORDER BY attempted_at DESC
       LIMIT 50`,
      [strategyType]
    );

    if (recentData.length < this.options.minSamplesForUpdate) {
      return false; // Not enough data yet
    }

    // Calculate actual success rate
    const successes = recentData.filter(d => d.success === 1).length;
    const actualSuccessRate = successes / recentData.length;

    // Calculate actual average time
    const actualAvgTime = recentData.reduce((sum, d) => sum + d.time_elapsed, 0) / recentData.length;

    // Update strategy with actual data
    strategy.successRate = actualSuccessRate;
    strategy.avgTime = Math.round(actualAvgTime);

    // Calculate confidence based on sample size
    strategy.confidence = Math.min(1.0, recentData.length / 100);

    // Save to database
    await this.db.run(
      `INSERT OR REPLACE INTO strategy_performance
       (strategy_type, success_rate, avg_time, confidence, total_attempts, last_updated)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        strategyType,
        strategy.successRate,
        strategy.avgTime,
        strategy.confidence,
        recentData.length,
        new Date().toISOString()
      ]
    );

    return true;
  }

  /**
   * Calculate overall accuracy gain
   */
  async calculateAccuracyGain() {
    // Compare current session to previous
    if (this.learningHistory.length === 0) return 0;

    const previousSession = this.learningHistory[this.learningHistory.length - 1];

    // Calculate weighted average success rate
    let currentAvgSuccess = 0;
    let previousAvgSuccess = previousSession.avgSuccessRate || 0;

    const strategyTypes = Object.keys(this.strategies);
    for (const type of strategyTypes) {
      currentAvgSuccess += this.strategies[type].successRate;
    }
    currentAvgSuccess /= strategyTypes.length;

    // Store for next comparison
    this.learningHistory[this.learningHistory.length - 1].avgSuccessRate = currentAvgSuccess;

    const gain = (currentAvgSuccess - previousAvgSuccess) * 100;
    return gain;
  }

  /**
   * Generate insights from results
   */
  async generateInsights(successful, failed) {
    const insights = [];

    // Success rate insight
    const totalFixes = successful.length + failed.length;
    const successRate = totalFixes > 0 ? (successful.length / totalFixes) * 100 : 0;

    insights.push({
      type: 'success_rate',
      insight: `Overall success rate: ${successRate.toFixed(1)}%`,
      severity: successRate >= 90 ? 'positive' : successRate >= 70 ? 'neutral' : 'concern'
    });

    // Time efficiency insight
    if (successful.length > 0) {
      const avgTime = successful.reduce((sum, s) => sum + (s.timeElapsed || 0), 0) / successful.length;
      const manualTime = 35 * 60 * 1000; // 35 minutes in ms

      const efficiency = ((manualTime - avgTime) / manualTime) * 100;

      insights.push({
        type: 'efficiency',
        insight: `${efficiency.toFixed(1)}% faster than manual fixing`,
        severity: 'positive'
      });
    }

    // Common failure patterns
    if (failed.length >= 3) {
      const errorTypes = {};
      for (const failure of failed) {
        const errorType = this.categorizeError(failure.error);
        errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
      }

      const mostCommon = Object.entries(errorTypes)
        .sort(([, a], [, b]) => b - a)[0];

      if (mostCommon) {
        insights.push({
          type: 'failure_pattern',
          insight: `Most common failure: ${mostCommon[0]} (${mostCommon[1]} occurrences)`,
          severity: 'concern',
          recommendation: `Prioritize fixing ${mostCommon[0]} issues`
        });
      }
    }

    // Strategy effectiveness
    const strategyPerformance = {};
    for (const result of [...successful, ...failed]) {
      const type = result.fixStrategy?.type || 'unknown';
      if (!strategyPerformance[type]) {
        strategyPerformance[type] = { success: 0, total: 0 };
      }
      strategyPerformance[type].total++;
      if (result.success) strategyPerformance[type].success++;
    }

    for (const [type, perf] of Object.entries(strategyPerformance)) {
      if (perf.total >= 3) {
        const rate = (perf.success / perf.total) * 100;
        insights.push({
          type: 'strategy_performance',
          insight: `${type}: ${rate.toFixed(1)}% success (${perf.total} attempts)`,
          severity: rate >= 80 ? 'positive' : rate >= 50 ? 'neutral' : 'concern'
        });
      }
    }

    return insights;
  }

  /**
   * Categorize error type
   */
  categorizeError(error) {
    if (!error) return 'unknown';

    const errorLower = error.toLowerCase();

    if (errorLower.includes('timeout')) return 'timeout';
    if (errorLower.includes('not found')) return 'resource_missing';
    if (errorLower.includes('permission') || errorLower.includes('access')) return 'permissions';
    if (errorLower.includes('syntax') || errorLower.includes('parse')) return 'script_error';
    if (errorLower.includes('connection')) return 'connection';

    return 'other';
  }

  /**
   * Record learning event
   */
  async recordLearningEvent(event) {
    await this.db.run(
      `INSERT INTO learning_events (event_type, description, improvement_delta, occurred_at)
       VALUES (?, ?, ?, ?)`,
      [
        event.event_type,
        event.description,
        event.improvement_delta || null,
        event.occurred_at
      ]
    );
  }

  /**
   * Get learning statistics
   */
  async getLearningStatistics() {
    const stats = {
      totalLearningEvents: 0,
      totalFixAttempts: 0,
      overallSuccessRate: 0,
      strategyPerformance: {},
      recentImprovements: [],
      learningVelocity: 0
    };

    // Total learning events
    const eventsCount = await this.db.get(
      'SELECT COUNT(*) as count FROM learning_events'
    );
    stats.totalLearningEvents = eventsCount.count;

    // Total fix attempts
    const attemptsCount = await this.db.get(
      'SELECT COUNT(*) as count FROM fix_attempts'
    );
    stats.totalFixAttempts = attemptsCount.count;

    // Overall success rate
    const successStats = await this.db.get(
      'SELECT AVG(CAST(success AS REAL)) as rate FROM fix_attempts'
    );
    stats.overallSuccessRate = (successStats.rate || 0) * 100;

    // Strategy performance
    for (const [type, strategy] of Object.entries(this.strategies)) {
      stats.strategyPerformance[type] = {
        successRate: (strategy.successRate * 100).toFixed(1) + '%',
        avgTime: strategy.avgTime + 'ms',
        confidence: (strategy.confidence * 100).toFixed(1) + '%'
      };
    }

    // Recent improvements
    const improvements = await this.db.all(
      `SELECT * FROM strategy_improvements
       ORDER BY implemented_at DESC
       LIMIT 10`
    );
    stats.recentImprovements = improvements;

    // Learning velocity (improvements per week)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentImprovements = await this.db.get(
      `SELECT COUNT(*) as count FROM strategy_improvements
       WHERE implemented_at > ?`,
      [weekAgo]
    );
    stats.learningVelocity = recentImprovements.count;

    return stats;
  }

  /**
   * Get best strategy for violation type
   */
  getBestStrategy(violationType) {
    // Map violation types to strategies
    const mapping = {
      'forbidden_color': 'color_replace',
      'color_mismatch': 'color_replace',
      'wrong_font_family': 'font_replace',
      'text_cutoff': 'resize_frame',
      'placeholder_text': 'ai_generation'
    };

    const strategyType = mapping[violationType];
    if (!strategyType) return null;

    return {
      type: strategyType,
      successRate: this.strategies[strategyType]?.successRate || 0,
      confidence: this.strategies[strategyType]?.confidence || 0,
      avgTime: this.strategies[strategyType]?.avgTime || 5000
    };
  }

  /**
   * Export learning data
   */
  async exportLearningData(outputPath) {
    const data = {
      strategies: this.strategies,
      history: this.learningHistory,
      stats: await this.getLearningStatistics(),
      exportedAt: new Date().toISOString()
    };

    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));

    console.log(`📊 Learning data exported to: ${outputPath}`);
    return data;
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      await this.db.close();
    }
  }
}

export default SelfImprovingSystem;
