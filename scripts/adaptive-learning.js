/**
 * Adaptive Learning System
 *
 * Continuously improves QA accuracy through:
 * - Recording human feedback and corrections
 * - Adjusting model weights based on accuracy
 * - Updating few-shot examples with corrections
 * - Retraining prompts with learned patterns
 * - Tracking improvement over time
 *
 * Part of Phase 4: World-Class QA System
 */

const fs = require('fs').promises;
const path = require('path');

class AdaptiveLearningSystem {
  constructor(options = {}) {
    this.dataDir = options.dataDir || path.join(process.cwd(), 'data');
    this.feedbackDir = path.join(this.dataDir, 'feedback');
    this.examplesDir = path.join(this.dataDir, 'few-shot-examples');
    this.weightsFile = path.join(this.dataDir, 'model-weights.json');
    this.learningLogFile = path.join(this.dataDir, 'learning-log.json');

    // Initial model weights (will be adjusted based on performance)
    this.modelWeights = {
      'gemini-1.5-flash': 0.40,
      'gemini-1.5-pro': 0.35,
      'claude-3.5-sonnet': 0.25
    };

    // Learning rate for weight updates
    this.learningRate = 0.05;

    // Feedback log (in-memory cache)
    this.feedbackLog = [];

    // Few-shot examples cache
    this.fewShotExamples = {
      excellent: [],
      good: [],
      poor: [],
      critical: []
    };
  }

  /**
   * Initialize the learning system
   */
  async initialize() {
    console.log('🧠 Initializing Adaptive Learning System...');

    try {
      // Create directories
      await fs.mkdir(this.feedbackDir, { recursive: true });
      await fs.mkdir(this.examplesDir, { recursive: true });

      // Load existing weights
      await this.loadModelWeights();

      // Load feedback log
      await this.loadFeedbackLog();

      // Load few-shot examples
      await this.loadFewShotExamples();

      console.log('✅ Adaptive Learning System initialized');
      console.log(`   - Model weights loaded: ${Object.keys(this.modelWeights).length} models`);
      console.log(`   - Feedback entries: ${this.feedbackLog.length}`);
      console.log(`   - Few-shot examples: ${this.getTotalExamples()}`);

    } catch (error) {
      console.error(`❌ Error initializing learning system: ${error.message}`);
      throw error;
    }
  }

  /**
   * Record human feedback for a validation
   */
  async recordFeedback(validationId, aiResult, humanCorrection) {
    console.log(`\n📝 Recording human feedback for validation: ${validationId}`);

    const feedback = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      validationId,
      model: aiResult.model || 'gemini-1.5-flash',
      aiGrade: aiResult.gradeLevel || aiResult.score,
      aiScore: aiResult.overallScore || aiResult.score,
      aiConfidence: aiResult.confidence || 0.5,
      humanGrade: humanCorrection.gradeLevel || humanCorrection.score,
      humanScore: humanCorrection.overallScore || humanCorrection.score,
      delta: Math.abs((aiResult.overallScore || 0) - (humanCorrection.overallScore || 0)),
      corrections: humanCorrection.corrections || [],
      agreementLevel: this.calculateAgreement(aiResult, humanCorrection),
      notes: humanCorrection.notes || ''
    };

    // Add to log
    this.feedbackLog.push(feedback);

    // Save feedback
    await this.saveFeedback(feedback);

    // If significant disagreement, add to few-shot examples
    if (feedback.delta > 1.5 || feedback.agreementLevel === 'low') {
      await this.addToFewShotExamples(validationId, aiResult, humanCorrection);
    }

    // Update model weights based on this feedback
    await this.updateModelWeights();

    // Log learning event
    await this.logLearningEvent({
      type: 'feedback_recorded',
      feedback,
      weightsUpdated: true
    });

    console.log(`✅ Feedback recorded (Agreement: ${feedback.agreementLevel}, Delta: ${feedback.delta.toFixed(2)})`);

    return feedback;
  }

  /**
   * Calculate agreement level between AI and human
   */
  calculateAgreement(aiResult, humanCorrection) {
    const delta = Math.abs((aiResult.overallScore || 0) - (humanCorrection.overallScore || 0));

    if (delta <= 0.5) return 'high';
    if (delta <= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Update model weights based on accumulated feedback
   */
  async updateModelWeights() {
    if (this.feedbackLog.length < 5) {
      // Need at least 5 feedback entries to adjust weights
      return;
    }

    console.log('\n⚖️  Updating model weights based on performance...');

    // Calculate accuracy for each model
    const modelAccuracy = {};

    for (const feedback of this.feedbackLog) {
      const model = feedback.model;

      if (!modelAccuracy[model]) {
        modelAccuracy[model] = {
          total: 0,
          correct: 0,
          totalError: 0
        };
      }

      modelAccuracy[model].total++;

      // Consider "correct" if delta < 1.0
      if (feedback.delta < 1.0) {
        modelAccuracy[model].correct++;
      }

      modelAccuracy[model].totalError += feedback.delta;
    }

    // Calculate accuracy rates
    const accuracyRates = {};
    for (const [model, stats] of Object.entries(modelAccuracy)) {
      accuracyRates[model] = stats.correct / stats.total;
    }

    // Adjust weights using softmax-like normalization
    const totalAccuracy = Object.values(accuracyRates).reduce((a, b) => a + b, 0);

    const previousWeights = { ...this.modelWeights };

    for (const model of Object.keys(this.modelWeights)) {
      if (accuracyRates[model]) {
        // Gradual adjustment with learning rate
        const targetWeight = accuracyRates[model] / totalAccuracy;
        this.modelWeights[model] = this.modelWeights[model] * (1 - this.learningRate) +
                                    targetWeight * this.learningRate;
      }
    }

    // Normalize to sum to 1.0
    const weightSum = Object.values(this.modelWeights).reduce((a, b) => a + b, 0);
    for (const model of Object.keys(this.modelWeights)) {
      this.modelWeights[model] /= weightSum;
      this.modelWeights[model] = parseFloat(this.modelWeights[model].toFixed(3));
    }

    // Save updated weights
    await this.saveModelWeights();

    console.log('✅ Model weights updated:');
    for (const [model, weight] of Object.entries(this.modelWeights)) {
      const previous = previousWeights[model];
      const change = ((weight - previous) / previous * 100).toFixed(1);
      console.log(`   - ${model}: ${weight.toFixed(3)} (${change >= 0 ? '+' : ''}${change}%)`);
    }
  }

  /**
   * Add example to few-shot training set
   */
  async addToFewShotExamples(validationId, aiResult, humanCorrection) {
    console.log(`\n📚 Adding to few-shot examples...`);

    const example = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      validationId,
      imagePath: aiResult.imagePath,
      correctGrade: humanCorrection.gradeLevel || humanCorrection.score,
      correctScore: humanCorrection.overallScore || humanCorrection.score,
      aiGrade: aiResult.gradeLevel || aiResult.score,
      aiScore: aiResult.overallScore || aiResult.score,
      corrections: humanCorrection.corrections || [],
      learningPoints: humanCorrection.learningPoints || [],
      notes: humanCorrection.notes || ''
    };

    // Categorize by grade level
    const score = example.correctScore;
    let category = 'good';

    if (score >= 9.0) category = 'excellent';
    else if (score >= 7.0) category = 'good';
    else if (score >= 5.0) category = 'poor';
    else category = 'critical';

    this.fewShotExamples[category].push(example);

    // Limit to 20 examples per category (keep most recent)
    if (this.fewShotExamples[category].length > 20) {
      this.fewShotExamples[category] = this.fewShotExamples[category].slice(-20);
    }

    // Save examples
    await this.saveFewShotExamples();

    console.log(`✅ Example added to '${category}' category (${this.fewShotExamples[category].length} total)`);

    return example;
  }

  /**
   * Retrain with accumulated feedback
   */
  async retrainWithFeedback() {
    console.log('\n🔄 Retraining with accumulated feedback...');

    // Get recent feedback (last 50 entries)
    const recentFeedback = this.feedbackLog.slice(-50);

    if (recentFeedback.length < 10) {
      console.log('⚠️  Not enough feedback for retraining (need at least 10 entries)');
      return null;
    }

    // Update few-shot examples with recent feedback
    for (const feedback of recentFeedback) {
      if (feedback.delta > 1.0) {
        // Significant correction - add to examples
        const validationData = await this.loadValidationData(feedback.validationId);
        if (validationData) {
          await this.addToFewShotExamples(
            feedback.validationId,
            { ...validationData, model: feedback.model },
            {
              gradeLevel: feedback.humanGrade,
              overallScore: feedback.humanScore,
              corrections: feedback.corrections,
              notes: feedback.notes
            }
          );
        }
      }
    }

    // Generate updated prompt with examples
    const updatedPrompt = await this.generateUpdatedPrompt();

    // Log retraining event
    await this.logLearningEvent({
      type: 'retrain',
      feedbackCount: recentFeedback.length,
      exampleCount: this.getTotalExamples(),
      timestamp: new Date().toISOString()
    });

    console.log('✅ Retraining complete');
    console.log(`   - Feedback processed: ${recentFeedback.length}`);
    console.log(`   - Examples updated: ${this.getTotalExamples()}`);

    return {
      prompt: updatedPrompt,
      feedbackCount: recentFeedback.length,
      exampleCount: this.getTotalExamples()
    };
  }

  /**
   * Generate updated prompt with few-shot examples
   */
  async generateUpdatedPrompt() {
    const examples = [];

    // Add examples from each category
    const categories = ['excellent', 'good', 'poor', 'critical'];

    for (const category of categories) {
      const categoryExamples = this.fewShotExamples[category].slice(-3); // Last 3 from each

      for (const example of categoryExamples) {
        examples.push({
          grade: example.correctGrade,
          score: example.correctScore,
          notes: example.notes,
          learningPoints: example.learningPoints
        });
      }
    }

    const promptAddition = `\n\nHere are validated examples for reference:\n\n${
      examples.map((ex, i) => `
Example ${i + 1} - Grade: ${ex.grade} (${ex.score}/10)
${ex.learningPoints?.map(lp => `  - ${lp}`).join('\n') || ''}
${ex.notes ? `Notes: ${ex.notes}` : ''}
      `).join('\n')
    }\n\nUse these examples to calibrate your analysis.`;

    return promptAddition;
  }

  /**
   * Get model weights for ensemble voting
   */
  getModelWeights() {
    return { ...this.modelWeights };
  }

  /**
   * Get current learning statistics
   */
  async getLearningStatistics() {
    const totalFeedback = this.feedbackLog.length;

    if (totalFeedback === 0) {
      return {
        totalFeedback: 0,
        averageAgreement: 0,
        averageDelta: 0,
        improvementRate: 0,
        modelWeights: this.modelWeights
      };
    }

    // Calculate statistics
    const agreements = this.feedbackLog.filter(f => f.agreementLevel === 'high').length;
    const averageAgreement = (agreements / totalFeedback) * 100;

    const averageDelta = this.feedbackLog.reduce((sum, f) => sum + f.delta, 0) / totalFeedback;

    // Calculate improvement rate (last 30 vs previous 30)
    let improvementRate = 0;
    if (totalFeedback >= 60) {
      const recent30 = this.feedbackLog.slice(-30);
      const previous30 = this.feedbackLog.slice(-60, -30);

      const recentAvgDelta = recent30.reduce((sum, f) => sum + f.delta, 0) / 30;
      const previousAvgDelta = previous30.reduce((sum, f) => sum + f.delta, 0) / 30;

      improvementRate = ((previousAvgDelta - recentAvgDelta) / previousAvgDelta) * 100;
    }

    return {
      totalFeedback,
      averageAgreement: parseFloat(averageAgreement.toFixed(2)),
      averageDelta: parseFloat(averageDelta.toFixed(3)),
      improvementRate: parseFloat(improvementRate.toFixed(2)),
      modelWeights: this.modelWeights,
      exampleCounts: {
        excellent: this.fewShotExamples.excellent.length,
        good: this.fewShotExamples.good.length,
        poor: this.fewShotExamples.poor.length,
        critical: this.fewShotExamples.critical.length
      }
    };
  }

  /**
   * Calculate model accuracy from feedback
   */
  calculateModelAccuracy(modelName) {
    const modelFeedback = this.feedbackLog.filter(f => f.model === modelName);

    if (modelFeedback.length === 0) return 0;

    const correct = modelFeedback.filter(f => f.delta < 1.0).length;
    return (correct / modelFeedback.length) * 100;
  }

  /**
   * Save feedback to disk
   */
  async saveFeedback(feedback) {
    const filename = `feedback-${feedback.id}.json`;
    const filepath = path.join(this.feedbackDir, filename);
    await fs.writeFile(filepath, JSON.stringify(feedback, null, 2));
  }

  /**
   * Load feedback log
   */
  async loadFeedbackLog() {
    try {
      const files = await fs.readdir(this.feedbackDir);
      this.feedbackLog = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const filepath = path.join(this.feedbackDir, file);
        const content = await fs.readFile(filepath, 'utf8');
        this.feedbackLog.push(JSON.parse(content));
      }

      // Sort by timestamp
      this.feedbackLog.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    } catch (error) {
      // Directory doesn't exist yet
      this.feedbackLog = [];
    }
  }

  /**
   * Save model weights
   */
  async saveModelWeights() {
    const data = {
      weights: this.modelWeights,
      lastUpdated: new Date().toISOString(),
      feedbackCount: this.feedbackLog.length
    };

    await fs.writeFile(this.weightsFile, JSON.stringify(data, null, 2));
  }

  /**
   * Load model weights
   */
  async loadModelWeights() {
    try {
      const content = await fs.readFile(this.weightsFile, 'utf8');
      const data = JSON.parse(content);
      this.modelWeights = data.weights;
    } catch (error) {
      // Use default weights
    }
  }

  /**
   * Save few-shot examples
   */
  async saveFewShotExamples() {
    const filepath = path.join(this.examplesDir, 'examples.json');
    await fs.writeFile(filepath, JSON.stringify(this.fewShotExamples, null, 2));
  }

  /**
   * Load few-shot examples
   */
  async loadFewShotExamples() {
    try {
      const filepath = path.join(this.examplesDir, 'examples.json');
      const content = await fs.readFile(filepath, 'utf8');
      this.fewShotExamples = JSON.parse(content);
    } catch (error) {
      // Use default empty examples
    }
  }

  /**
   * Log learning event
   */
  async logLearningEvent(event) {
    let log = [];

    try {
      const content = await fs.readFile(this.learningLogFile, 'utf8');
      log = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet
    }

    log.push({
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    });

    // Keep last 1000 events
    if (log.length > 1000) {
      log = log.slice(-1000);
    }

    await fs.writeFile(this.learningLogFile, JSON.stringify(log, null, 2));
  }

  /**
   * Load validation data
   */
  async loadValidationData(validationId) {
    // Look in reports directory
    const reportsDir = path.join(process.cwd(), 'exports', 'ai-validation-reports');
    try {
      const files = await fs.readdir(reportsDir);
      for (const file of files) {
        if (file.includes(validationId)) {
          const content = await fs.readFile(path.join(reportsDir, file), 'utf8');
          return JSON.parse(content);
        }
      }
    } catch (error) {
      // Not found
    }
    return null;
  }

  /**
   * Get total example count
   */
  getTotalExamples() {
    return Object.values(this.fewShotExamples).reduce((sum, arr) => sum + arr.length, 0);
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];

  const learningSystem = new AdaptiveLearningSystem();

  (async () => {
    await learningSystem.initialize();

    if (command === 'stats') {
      const stats = await learningSystem.getLearningStatistics();
      console.log('\n📊 Learning Statistics:');
      console.log(JSON.stringify(stats, null, 2));

    } else if (command === 'retrain') {
      const result = await learningSystem.retrainWithFeedback();
      if (result) {
        console.log('\n✅ Retraining complete!');
        console.log(`Examples: ${result.exampleCount}`);
      }

    } else if (command === 'weights') {
      const weights = learningSystem.getModelWeights();
      console.log('\n⚖️  Current Model Weights:');
      console.log(JSON.stringify(weights, null, 2));

    } else {
      console.log('\nAdaptive Learning System');
      console.log('\nCommands:');
      console.log('  stats    - Show learning statistics');
      console.log('  retrain  - Retrain with accumulated feedback');
      console.log('  weights  - Show current model weights');
    }

    process.exit(0);
  })().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = AdaptiveLearningSystem;
