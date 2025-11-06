/**
 * Predictive Analytics System
 *
 * Uses machine learning to predict violations before they occur.
 * Learns from historical data to improve accuracy over time.
 *
 * @module predictive-analytics
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
 * Simple Logistic Regression Model
 */
class LogisticRegression {
  constructor() {
    this.weights = null;
    this.bias = 0;
    this.learningRate = 0.01;
    this.epochs = 1000;
    this.accuracy = 0;
  }

  /**
   * Sigmoid activation function
   */
  sigmoid(z) {
    return 1 / (1 + Math.exp(-z));
  }

  /**
   * Train the model
   */
  async train(features, labels) {
    const numFeatures = features[0].length;
    const numSamples = features.length;

    // Initialize weights
    this.weights = Array(numFeatures).fill(0).map(() => Math.random() * 0.01);

    // Training loop
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      let predictions = [];

      // Forward pass
      for (let i = 0; i < numSamples; i++) {
        const z = features[i].reduce((sum, x, j) => sum + x * this.weights[j], this.bias);
        predictions.push(this.sigmoid(z));
      }

      // Calculate gradients
      const weightGradients = Array(numFeatures).fill(0);
      let biasGradient = 0;

      for (let i = 0; i < numSamples; i++) {
        const error = predictions[i] - labels[i];

        for (let j = 0; j < numFeatures; j++) {
          weightGradients[j] += error * features[i][j];
        }

        biasGradient += error;
      }

      // Update weights
      for (let j = 0; j < numFeatures; j++) {
        this.weights[j] -= this.learningRate * (weightGradients[j] / numSamples);
      }

      this.bias -= this.learningRate * (biasGradient / numSamples);
    }

    // Calculate final accuracy
    let correct = 0;
    for (let i = 0; i < numSamples; i++) {
      const z = features[i].reduce((sum, x, j) => sum + x * this.weights[j], this.bias);
      const prediction = this.sigmoid(z) >= 0.5 ? 1 : 0;
      if (prediction === labels[i]) correct++;
    }

    this.accuracy = (correct / numSamples) * 100;
  }

  /**
   * Make predictions
   */
  async predict(features) {
    const predictions = [];

    for (const featureRow of features) {
      const z = featureRow.reduce((sum, x, j) => sum + x * this.weights[j], this.bias);
      const probability = this.sigmoid(z);

      predictions.push({
        probability: probability,
        prediction: probability >= 0.5 ? 1 : 0
      });
    }

    return predictions;
  }

  /**
   * Save model to file
   */
  async save(filePath) {
    const modelData = {
      weights: this.weights,
      bias: this.bias,
      accuracy: this.accuracy,
      timestamp: new Date().toISOString()
    };

    await fs.writeFile(filePath, JSON.stringify(modelData, null, 2));
  }

  /**
   * Load model from file
   */
  async load(filePath) {
    const data = await fs.readFile(filePath, 'utf-8');
    const modelData = JSON.parse(data);

    this.weights = modelData.weights;
    this.bias = modelData.bias;
    this.accuracy = modelData.accuracy;
  }
}

/**
 * Predictive Analytics Engine
 */
export class PredictiveAnalytics {
  constructor(options = {}) {
    this.options = {
      dbPath: options.dbPath || path.join(projectRoot, 'data', 'violations.db'),
      modelPath: options.modelPath || path.join(projectRoot, 'data', 'predictive-model.json'),
      confidenceThreshold: options.confidenceThreshold || 0.7,
      retrainFrequency: options.retrainFrequency || 'weekly',
      verbose: options.verbose || false,
      ...options
    };

    this.db = null;
    this.model = new LogisticRegression();
    this.featureNames = [
      'page_count',
      'color_count',
      'font_count',
      'image_count',
      'text_frame_count',
      'has_custom_colors',
      'has_custom_fonts',
      'complexity_score',
      'days_since_last_validation',
      'previous_violation_count'
    ];
  }

  /**
   * Initialize database
   */
  async initialize() {
    console.log('🔮 Initializing predictive analytics...');

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

    // Load or train model
    await this.loadOrTrainModel();

    console.log('✅ Predictive analytics ready');
  }

  /**
   * Create database tables
   */
  async createTables() {
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        created_at TEXT NOT NULL,
        page_count INTEGER,
        color_count INTEGER,
        font_count INTEGER,
        image_count INTEGER,
        text_frame_count INTEGER,
        has_custom_colors BOOLEAN,
        has_custom_fonts BOOLEAN,
        complexity_score REAL
      );

      CREATE TABLE IF NOT EXISTS violations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        category TEXT NOT NULL,
        detected_at TEXT NOT NULL,
        fixed_at TEXT,
        fix_time_seconds INTEGER,
        FOREIGN KEY (document_id) REFERENCES documents(id)
      );

      CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        violation_type TEXT NOT NULL,
        probability REAL NOT NULL,
        predicted_at TEXT NOT NULL,
        was_correct BOOLEAN,
        FOREIGN KEY (document_id) REFERENCES documents(id)
      );

      CREATE TABLE IF NOT EXISTS model_training (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trained_at TEXT NOT NULL,
        accuracy REAL NOT NULL,
        samples_count INTEGER NOT NULL,
        features_used TEXT NOT NULL
      );
    `);
  }

  /**
   * Load or train model
   */
  async loadOrTrainModel() {
    try {
      // Try to load existing model
      await this.model.load(this.options.modelPath);
      console.log(`  Loaded model with ${this.model.accuracy.toFixed(1)}% accuracy`);

      // Check if retraining is needed
      const needsRetraining = await this.checkIfRetrainingNeeded();
      if (needsRetraining) {
        console.log('  Model needs retraining...');
        await this.trainPredictiveModel();
      }

    } catch (error) {
      // Model doesn't exist, train new one
      console.log('  Training new predictive model...');
      await this.trainPredictiveModel();
    }
  }

  /**
   * Check if retraining is needed
   */
  async checkIfRetrainingNeeded() {
    const lastTraining = await this.db.get(
      'SELECT trained_at FROM model_training ORDER BY trained_at DESC LIMIT 1'
    );

    if (!lastTraining) return true;

    const daysSinceTraining = (Date.now() - new Date(lastTraining.trained_at)) / (1000 * 60 * 60 * 24);

    if (this.options.retrainFrequency === 'daily' && daysSinceTraining > 1) return true;
    if (this.options.retrainFrequency === 'weekly' && daysSinceTraining > 7) return true;
    if (this.options.retrainFrequency === 'monthly' && daysSinceTraining > 30) return true;

    return false;
  }

  /**
   * Train predictive model
   */
  async trainPredictiveModel() {
    console.log('🎓 Training predictive model...');

    // Get historical data
    const historicalData = await this.getHistoricalData();

    if (historicalData.length < 10) {
      console.log('  ⚠️  Not enough historical data (need at least 10 samples)');
      console.log('  ℹ️  Model will use default predictions until more data is collected');
      return;
    }

    // Extract features and labels
    const { features, labels } = this.extractFeaturesAndLabels(historicalData);

    // Train model
    await this.model.train(features, labels);

    // Save model
    await this.model.save(this.options.modelPath);

    // Record training
    await this.db.run(
      'INSERT INTO model_training (trained_at, accuracy, samples_count, features_used) VALUES (?, ?, ?, ?)',
      [
        new Date().toISOString(),
        this.model.accuracy,
        historicalData.length,
        JSON.stringify(this.featureNames)
      ]
    );

    console.log(`  ✅ Model trained with ${this.model.accuracy.toFixed(1)}% accuracy`);
    console.log(`  📊 Training samples: ${historicalData.length}`);
  }

  /**
   * Get historical data from database
   */
  async getHistoricalData() {
    const data = await this.db.all(`
      SELECT
        d.*,
        COUNT(v.id) as violation_count,
        GROUP_CONCAT(v.type) as violation_types
      FROM documents d
      LEFT JOIN violations v ON d.id = v.document_id
      GROUP BY d.id
      ORDER BY d.created_at DESC
      LIMIT 1000
    `);

    return data;
  }

  /**
   * Extract features and labels from historical data
   */
  extractFeaturesAndLabels(data) {
    const features = [];
    const labels = [];

    for (const row of data) {
      features.push([
        row.page_count || 0,
        row.color_count || 0,
        row.font_count || 0,
        row.image_count || 0,
        row.text_frame_count || 0,
        row.has_custom_colors ? 1 : 0,
        row.has_custom_fonts ? 1 : 0,
        row.complexity_score || 0,
        this.calculateDaysSinceCreation(row.created_at),
        row.violation_count || 0
      ]);

      // Label: 1 if had violations, 0 if clean
      labels.push(row.violation_count > 0 ? 1 : 0);
    }

    return { features, labels };
  }

  /**
   * Predict violations for a document
   */
  async predictViolations(documentMetadata) {
    console.log('🔮 Predicting violations...');

    // Extract features from metadata
    const features = this.extractPredictionFeatures(documentMetadata);

    // Make predictions
    const predictions = await this.model.predict([features]);

    // Get likely violation types based on historical patterns
    const likelyViolations = await this.predictViolationTypes(documentMetadata, predictions[0].probability);

    // Record prediction
    if (documentMetadata.id) {
      for (const violation of likelyViolations) {
        await this.db.run(
          'INSERT INTO predictions (document_id, violation_type, probability, predicted_at) VALUES (?, ?, ?, ?)',
          [
            documentMetadata.id,
            violation.type,
            violation.probability,
            new Date().toISOString()
          ]
        );
      }
    }

    const result = {
      hasViolations: predictions[0].prediction === 1,
      confidence: predictions[0].probability,
      likelyViolations: likelyViolations.filter(v => v.probability > this.options.confidenceThreshold),
      recommendedChecks: this.recommendChecks(likelyViolations),
      preventionStrategies: this.generatePreventionStrategies(likelyViolations)
    };

    console.log(`  ${result.hasViolations ? '⚠️' : '✅'}  Prediction: ${result.hasViolations ? 'Violations likely' : 'Clean'} (${(result.confidence * 100).toFixed(1)}% confidence)`);
    console.log(`  🎯 ${result.likelyViolations.length} specific violations predicted`);

    return result;
  }

  /**
   * Extract prediction features
   */
  extractPredictionFeatures(metadata) {
    return [
      metadata.page_count || 0,
      metadata.color_count || 0,
      metadata.font_count || 0,
      metadata.image_count || 0,
      metadata.text_frame_count || 0,
      metadata.has_custom_colors ? 1 : 0,
      metadata.has_custom_fonts ? 1 : 0,
      this.calculateComplexityScore(metadata),
      0, // days_since_last_validation (new document)
      metadata.previous_violation_count || 0
    ];
  }

  /**
   * Predict specific violation types
   */
  async predictViolationTypes(metadata, overallProbability) {
    const violations = [];

    // Color violations
    if (metadata.has_custom_colors || metadata.color_count > 7) {
      violations.push({
        type: 'color_violation',
        probability: overallProbability * 0.8,
        reason: 'Document uses custom colors outside brand palette'
      });
    }

    // Typography violations
    if (metadata.has_custom_fonts || metadata.font_count > 2) {
      violations.push({
        type: 'typography_violation',
        probability: overallProbability * 0.7,
        reason: 'Document uses non-brand fonts'
      });
    }

    // Text cutoffs (more likely in complex layouts)
    if (metadata.complexity_score > 0.7) {
      violations.push({
        type: 'text_cutoff',
        probability: overallProbability * 0.6,
        reason: 'Complex layout increases risk of text cutoffs'
      });
    }

    // Page dimension issues
    if (metadata.page_count > 10) {
      violations.push({
        type: 'page_dimension',
        probability: overallProbability * 0.4,
        reason: 'Multi-page documents often have inconsistent dimensions'
      });
    }

    // Placeholder text
    if (metadata.text_frame_count > 20) {
      violations.push({
        type: 'placeholder_text',
        probability: overallProbability * 0.5,
        reason: 'Large documents often have forgotten placeholders'
      });
    }

    return violations.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Recommend specific checks based on predictions
   */
  recommendChecks(predictions) {
    const checks = [];

    for (const prediction of predictions) {
      if (prediction.probability < this.options.confidenceThreshold) continue;

      switch (prediction.type) {
        case 'color_violation':
          checks.push({
            priority: 'high',
            check: 'Verify all colors against brand palette',
            tool: 'color_validator',
            estimatedTime: 60
          });
          break;

        case 'typography_violation':
          checks.push({
            priority: 'high',
            check: 'Verify fonts are Lora (headlines) and Roboto Flex (body)',
            tool: 'font_validator',
            estimatedTime: 45
          });
          break;

        case 'text_cutoff':
          checks.push({
            priority: 'critical',
            check: 'Check all text frames for overflow/cutoff',
            tool: 'text_cutoff_detector',
            estimatedTime: 90
          });
          break;

        case 'placeholder_text':
          checks.push({
            priority: 'critical',
            check: 'Search for XX, TODO, and other placeholders',
            tool: 'placeholder_detector',
            estimatedTime: 30
          });
          break;
      }
    }

    return checks.sort((a, b) => {
      const priority = { critical: 0, high: 1, medium: 2, low: 3 };
      return priority[a.priority] - priority[b.priority];
    });
  }

  /**
   * Generate prevention strategies
   */
  generatePreventionStrategies(predictions) {
    const strategies = [];

    for (const prediction of predictions) {
      if (prediction.probability < 0.5) continue;

      strategies.push({
        violationType: prediction.type,
        prevention: this.getPreventionStrategy(prediction.type),
        timeSaved: this.estimateTimeSaved(prediction.type)
      });
    }

    return strategies;
  }

  /**
   * Get prevention strategy for violation type
   */
  getPreventionStrategy(violationType) {
    const strategies = {
      'color_violation': {
        action: 'Use only brand color swatches from template',
        steps: [
          'Load brand color palette in InDesign swatches',
          'Delete any custom colors',
          'Lock brand color swatches'
        ]
      },
      'typography_violation': {
        action: 'Use only brand-approved paragraph styles',
        steps: [
          'Load brand paragraph styles from template',
          'Apply styles instead of manual formatting',
          'Disable custom font selection'
        ]
      },
      'text_cutoff': {
        action: 'Enable text frame auto-sizing',
        steps: [
          'Set text frames to auto-height',
          'Add 20pt buffer to bottom margin',
          'Review at 150% zoom before export'
        ]
      },
      'placeholder_text': {
        action: 'Use data-driven placeholders',
        steps: [
          'Replace XX with actual data fields',
          'Run pre-export placeholder check',
          'Use InDesign data merge for dynamic content'
        ]
      }
    };

    return strategies[violationType] || {
      action: 'Review document carefully before export',
      steps: ['Manual review required']
    };
  }

  /**
   * Estimate time saved by prevention
   */
  estimateTimeSaved(violationType) {
    const timeSavings = {
      'color_violation': 10 * 60,      // 10 minutes
      'typography_violation': 15 * 60, // 15 minutes
      'text_cutoff': 20 * 60,          // 20 minutes
      'placeholder_text': 5 * 60,      // 5 minutes
      'page_dimension': 8 * 60         // 8 minutes
    };

    return timeSavings[violationType] || 5 * 60;
  }

  /**
   * Record actual violations for learning
   */
  async recordViolations(documentId, violations) {
    for (const violation of violations) {
      await this.db.run(
        'INSERT INTO violations (document_id, type, severity, category, detected_at) VALUES (?, ?, ?, ?, ?)',
        [
          documentId,
          violation.type,
          violation.severity,
          violation.category,
          new Date().toISOString()
        ]
      );
    }

    // Update prediction accuracy
    await this.updatePredictionAccuracy(documentId, violations);
  }

  /**
   * Update prediction accuracy
   */
  async updatePredictionAccuracy(documentId, actualViolations) {
    const predictions = await this.db.all(
      'SELECT * FROM predictions WHERE document_id = ? AND was_correct IS NULL',
      [documentId]
    );

    for (const prediction of predictions) {
      const wasCorrect = actualViolations.some(v => v.type === prediction.violation_type);

      await this.db.run(
        'UPDATE predictions SET was_correct = ? WHERE id = ?',
        [wasCorrect ? 1 : 0, prediction.id]
      );
    }
  }

  /**
   * Get model statistics
   */
  async getModelStatistics() {
    const trainingHistory = await this.db.all(
      'SELECT * FROM model_training ORDER BY trained_at DESC LIMIT 10'
    );

    const predictionAccuracy = await this.db.get(`
      SELECT
        COUNT(*) as total_predictions,
        SUM(CASE WHEN was_correct = 1 THEN 1 ELSE 0 END) as correct_predictions,
        AVG(probability) as avg_confidence
      FROM predictions
      WHERE was_correct IS NOT NULL
    `);

    const accuracyRate = predictionAccuracy.total_predictions > 0 ?
      (predictionAccuracy.correct_predictions / predictionAccuracy.total_predictions) * 100 : 0;

    return {
      currentAccuracy: this.model.accuracy,
      predictionAccuracy: accuracyRate,
      totalPredictions: predictionAccuracy.total_predictions,
      averageConfidence: predictionAccuracy.avg_confidence,
      trainingHistory: trainingHistory,
      improvementRate: this.calculateImprovementRate(trainingHistory)
    };
  }

  /**
   * Calculate improvement rate
   */
  calculateImprovementRate(trainingHistory) {
    if (trainingHistory.length < 2) return 0;

    const latest = trainingHistory[0].accuracy;
    const previous = trainingHistory[1].accuracy;

    return latest - previous;
  }

  // Utility methods

  calculateComplexityScore(metadata) {
    let score = 0;

    score += (metadata.page_count || 0) * 0.1;
    score += (metadata.color_count || 0) * 0.05;
    score += (metadata.font_count || 0) * 0.1;
    score += (metadata.image_count || 0) * 0.05;
    score += (metadata.text_frame_count || 0) * 0.02;

    return Math.min(score, 1.0);
  }

  calculateDaysSinceCreation(createdAt) {
    return (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24);
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

export default PredictiveAnalytics;
