#!/usr/bin/env node

/**
 * TEEI Continual Learning System
 *
 * Continuously improve TEEI models with validated feedback.
 * Updates LoRA adapters with new approved/rejected examples.
 *
 * Features:
 * - Collect validated documents as training examples
 * - Incremental LoRA retraining (fast!)
 * - A/B testing of model versions
 * - Automatic deployment of improved models
 * - Performance tracking over time
 *
 * Usage:
 *   node scripts/finetune/continual-learning.js
 *   node scripts/finetune/continual-learning.js --update-now
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import { spawn } from 'child_process';
import { TrainingExample } from './prepare-teei-dataset.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * Continual Learning Manager
 */
class ContinualLearningManager {
  constructor(options = {}) {
    this.modelPath = options.modelPath || 'models/teei-brand-lora';
    this.feedbackDir = path.join(ROOT_DIR, 'feedback');
    this.versionsDir = path.join(ROOT_DIR, 'models/versions');
    this.metricsPath = path.join(ROOT_DIR, 'models/continual-learning-metrics.json');
    this.retrainingThreshold = options.retrainingThreshold || 100;  // Retrain after 100 new examples
    this.minAccuracyImprovement = options.minAccuracyImprovement || 0.01;  // 1% minimum improvement
  }

  /**
   * Initialize system
   */
  async initialize() {
    console.log('🚀 Initializing Continual Learning System...\n');

    // Create directories
    await fs.mkdir(this.feedbackDir, { recursive: true });
    await fs.mkdir(this.versionsDir, { recursive: true });

    // Load or create metrics
    this.metrics = await this.loadMetrics();

    console.log('✅ System initialized\n');
  }

  /**
   * Load metrics
   */
  async loadMetrics() {
    try {
      const data = await fs.readFile(this.metricsPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      // Initialize new metrics
      return {
        version: 1,
        models: [],
        feedback_count: 0,
        last_retrain: null,
        accuracy_history: []
      };
    }
  }

  /**
   * Save metrics
   */
  async saveMetrics() {
    await fs.writeFile(
      this.metricsPath,
      JSON.stringify(this.metrics, null, 2),
      'utf-8'
    );
  }

  /**
   * Collect feedback from validated documents
   */
  async collectFeedback() {
    console.log('📥 Collecting validation feedback...');

    const feedbackFiles = await this.findFeedbackFiles();

    console.log(`   Found ${feedbackFiles.length} feedback files\n`);

    const newExamples = [];

    for (const file of feedbackFiles) {
      const feedback = await this.loadFeedback(file);

      if (feedback && feedback.approved !== undefined) {
        const example = this.feedbackToTrainingExample(feedback);
        newExamples.push(example);
      }
    }

    console.log(`   Collected ${newExamples.length} new training examples\n`);

    return newExamples;
  }

  /**
   * Find feedback files
   */
  async findFeedbackFiles() {
    try {
      const files = await fs.readdir(this.feedbackDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(this.feedbackDir, f));
    } catch {
      return [];
    }
  }

  /**
   * Load feedback file
   */
  async loadFeedback(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Convert feedback to training example
   */
  feedbackToTrainingExample(feedback) {
    return new TrainingExample({
      type: feedback.approved ? 'good' : 'bad',
      grade: feedback.grade || (feedback.approved ? 'A' : 'D'),
      score: feedback.score || (feedback.approved ? 8.0 : 4.0),
      image_path: feedback.document_path,
      violations: feedback.violations || [],
      strengths: feedback.strengths || [],
      metadata: {
        ...feedback.metadata,
        feedback_date: feedback.timestamp,
        human_validated: true
      }
    });
  }

  /**
   * Check if retraining is needed
   */
  async shouldRetrain() {
    const feedbackCount = await this.getFeedbackCount();

    console.log('🔍 Checking retraining criteria...');
    console.log(`   New feedback: ${feedbackCount}`);
    console.log(`   Threshold: ${this.retrainingThreshold}`);
    console.log(`   Last retrain: ${this.metrics.last_retrain || 'Never'}\n`);

    if (feedbackCount >= this.retrainingThreshold) {
      console.log('✅ Retraining threshold met\n');
      return true;
    }

    console.log('⏳ Not enough feedback yet\n');
    return false;
  }

  /**
   * Get feedback count
   */
  async getFeedbackCount() {
    const files = await this.findFeedbackFiles();
    return files.length;
  }

  /**
   * Retrain model with new feedback
   */
  async retrain() {
    console.log('🏋️  Retraining model with new feedback...\n');

    // 1. Collect new training examples
    const newExamples = await this.collectFeedback();

    if (newExamples.length === 0) {
      console.log('⚠️  No new examples to train on');
      return null;
    }

    // 2. Append to training dataset
    await this.appendToDataset(newExamples);

    // 3. Backup current model
    await this.backupCurrentModel();

    // 4. Retrain LoRA
    const newModelPath = await this.runRetraining();

    // 5. Evaluate new model
    const evaluation = await this.evaluateModel(newModelPath);

    // 6. Decide whether to deploy
    const shouldDeploy = await this.shouldDeploy(evaluation);

    if (shouldDeploy) {
      await this.deployModel(newModelPath);
      console.log('✅ New model deployed!\n');
    } else {
      console.log('⚠️  New model did not meet improvement threshold, keeping current model\n');
    }

    // 7. Update metrics
    await this.updateMetrics(newExamples.length, evaluation, shouldDeploy);

    // 8. Archive processed feedback
    await this.archiveFeedback();

    return {
      examples_added: newExamples.length,
      evaluation,
      deployed: shouldDeploy
    };
  }

  /**
   * Append new examples to training dataset
   */
  async appendToDataset(newExamples) {
    console.log('📝 Appending new examples to training dataset...');

    const trainingPath = path.join(ROOT_DIR, 'training-data/teei-train.jsonl');

    // Convert to LoRA format
    const lines = newExamples.map(ex => JSON.stringify(ex.toLoRAFormat()));

    // Append to file
    await fs.appendFile(trainingPath, '\n' + lines.join('\n'), 'utf-8');

    console.log(`   ✅ Added ${newExamples.length} examples\n`);
  }

  /**
   * Backup current model
   */
  async backupCurrentModel() {
    console.log('💾 Backing up current model...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.versionsDir, `v${this.metrics.version}-${timestamp}`);

    await fs.cp(this.modelPath, backupPath, { recursive: true });

    console.log(`   ✅ Backed up to: ${backupPath}\n`);

    return backupPath;
  }

  /**
   * Run retraining
   */
  async runRetraining() {
    console.log('🔧 Running LoRA retraining...\n');

    return new Promise((resolve, reject) => {
      const pythonScript = path.join(ROOT_DIR, 'scripts/finetune/train-lora-model.py');
      const newVersion = this.metrics.version + 1;
      const outputName = `teei-brand-lora-v${newVersion}`;

      const args = [
        pythonScript,
        '--output', outputName,
        '--epochs', '2',  // Quick incremental training
        '--batch-size', '4',
        '--learning-rate', '1e-4'  // Lower LR for fine-tuning
      ];

      const python = spawn('python3', args);

      python.stdout.on('data', (data) => {
        process.stdout.write(data.toString());
      });

      python.stderr.on('data', (data) => {
        process.stderr.write(data.toString());
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Retraining failed with code ${code}`));
        } else {
          const modelPath = path.join(ROOT_DIR, 'models', outputName);
          console.log(`\n✅ Retraining complete: ${modelPath}\n`);
          resolve(modelPath);
        }
      });
    });
  }

  /**
   * Evaluate new model
   */
  async evaluateModel(modelPath) {
    console.log('📊 Evaluating new model...\n');

    // Run evaluation on validation set
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(ROOT_DIR, 'scripts/finetune/train-lora-model.py');
      const valPath = path.join(ROOT_DIR, 'training-data/teei-validation.jsonl');

      const args = [
        pythonScript,
        '--evaluate', modelPath,
        '--benchmark', valPath
      ];

      const python = spawn('python3', args);

      let stdout = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data.toString());
      });

      python.stderr.on('data', (data) => {
        process.stderr.write(data.toString());
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Evaluation failed with code ${code}`));
        } else {
          try {
            // Parse evaluation results from output
            const accuracyMatch = stdout.match(/Accuracy: ([\d.]+)%/);
            const accuracy = accuracyMatch ? parseFloat(accuracyMatch[1]) / 100 : 0;

            console.log(`\n✅ Evaluation complete: ${(accuracy * 100).toFixed(1)}% accuracy\n`);

            resolve({
              accuracy,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  /**
   * Decide whether to deploy new model
   */
  async shouldDeploy(evaluation) {
    console.log('🤔 Evaluating deployment criteria...');

    // Get previous accuracy
    const previousAccuracy = this.metrics.accuracy_history.length > 0
      ? this.metrics.accuracy_history[this.metrics.accuracy_history.length - 1].accuracy
      : 0;

    const improvement = evaluation.accuracy - previousAccuracy;

    console.log(`   Previous accuracy: ${(previousAccuracy * 100).toFixed(1)}%`);
    console.log(`   New accuracy: ${(evaluation.accuracy * 100).toFixed(1)}%`);
    console.log(`   Improvement: ${(improvement * 100).toFixed(2)}%`);
    console.log(`   Minimum required: ${(this.minAccuracyImprovement * 100).toFixed(2)}%\n`);

    if (improvement >= this.minAccuracyImprovement) {
      console.log('✅ Improvement threshold met\n');
      return true;
    }

    console.log('⚠️  Improvement below threshold\n');
    return false;
  }

  /**
   * Deploy new model
   */
  async deployModel(newModelPath) {
    console.log('🚀 Deploying new model...');

    // Remove old model
    try {
      await fs.rm(this.modelPath, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }

    // Copy new model to production path
    await fs.cp(newModelPath, this.modelPath, { recursive: true });

    console.log(`   ✅ Deployed to: ${this.modelPath}\n`);
  }

  /**
   * Update metrics
   */
  async updateMetrics(examplesAdded, evaluation, deployed) {
    this.metrics.version += 1;
    this.metrics.feedback_count += examplesAdded;
    this.metrics.last_retrain = new Date().toISOString();

    this.metrics.accuracy_history.push({
      version: this.metrics.version,
      accuracy: evaluation.accuracy,
      examples_added: examplesAdded,
      deployed,
      timestamp: evaluation.timestamp
    });

    this.metrics.models.push({
      version: this.metrics.version,
      accuracy: evaluation.accuracy,
      deployed,
      timestamp: evaluation.timestamp
    });

    await this.saveMetrics();

    console.log('📊 Metrics updated\n');
  }

  /**
   * Archive processed feedback
   */
  async archiveFeedback() {
    console.log('📦 Archiving processed feedback...');

    const archiveDir = path.join(this.feedbackDir, 'archived');
    await fs.mkdir(archiveDir, { recursive: true });

    const files = await this.findFeedbackFiles();

    for (const file of files) {
      const fileName = path.basename(file);
      const archivePath = path.join(archiveDir, fileName);
      await fs.rename(file, archivePath);
    }

    console.log(`   ✅ Archived ${files.length} files\n`);
  }

  /**
   * Print metrics
   */
  async printMetrics() {
    console.log('📊 Continual Learning Metrics:\n');

    console.log(`Version: ${this.metrics.version}`);
    console.log(`Total feedback: ${this.metrics.feedback_count}`);
    console.log(`Last retrain: ${this.metrics.last_retrain || 'Never'}\n`);

    if (this.metrics.accuracy_history.length > 0) {
      console.log('Accuracy History:');
      this.metrics.accuracy_history.forEach((entry, i) => {
        const deployed = entry.deployed ? '✅' : '⏸️';
        console.log(`   ${deployed} v${entry.version}: ${(entry.accuracy * 100).toFixed(1)}% (+${entry.examples_added} examples)`);
      });
      console.log();
    }

    if (this.metrics.models.length > 0) {
      const latestModel = this.metrics.models[this.metrics.models.length - 1];
      console.log(`Latest Model:`);
      console.log(`   Version: ${latestModel.version}`);
      console.log(`   Accuracy: ${(latestModel.accuracy * 100).toFixed(1)}%`);
      console.log(`   Deployed: ${latestModel.deployed ? 'Yes' : 'No'}`);
      console.log(`   Date: ${new Date(latestModel.timestamp).toLocaleString()}\n`);
    }
  }

  /**
   * Submit feedback for a validated document
   */
  async submitFeedback(documentPath, validation, approved, userComment = '') {
    console.log('📝 Submitting validation feedback...');

    const feedback = {
      document_path: documentPath,
      grade: validation.grade,
      score: validation.score,
      violations: validation.violations || [],
      strengths: validation.strengths || [],
      approved,
      user_comment: userComment,
      timestamp: new Date().toISOString(),
      metadata: {
        validator: 'human',
        model_version: this.metrics.version
      }
    };

    const feedbackPath = path.join(
      this.feedbackDir,
      `feedback-${Date.now()}.json`
    );

    await fs.writeFile(
      feedbackPath,
      JSON.stringify(feedback, null, 2),
      'utf-8'
    );

    console.log(`   ✅ Feedback saved: ${feedbackPath}\n`);

    return feedbackPath;
  }
}

/**
 * Main execution
 */
async function main() {
  program
    .name('continual-learning')
    .description('TEEI Continual Learning System')
    .option('-u, --update-now', 'Force model update now')
    .option('-m, --metrics', 'Show metrics only')
    .option('-t, --threshold <number>', 'Retraining threshold', '100')
    .option('--submit-feedback <path>', 'Submit feedback for a document');

  program.parse();

  const options = program.opts();

  const manager = new ContinualLearningManager({
    retrainingThreshold: parseInt(options.threshold)
  });

  await manager.initialize();

  // Show metrics
  if (options.metrics) {
    await manager.printMetrics();
    return;
  }

  // Submit feedback
  if (options.submitFeedback) {
    // This would need validation data
    console.log('⚠️  Submit feedback requires validation data');
    console.log('   Use: manager.submitFeedback(documentPath, validation, approved)');
    return;
  }

  // Update model
  if (options.updateNow || await manager.shouldRetrain()) {
    const result = await manager.retrain();

    if (result) {
      console.log('📊 Retraining Results:');
      console.log(`   Examples added: ${result.examples_added}`);
      console.log(`   New accuracy: ${(result.evaluation.accuracy * 100).toFixed(1)}%`);
      console.log(`   Deployed: ${result.deployed ? 'Yes' : 'No'}\n`);
    }
  } else {
    console.log('✅ No retraining needed at this time');
  }

  await manager.printMetrics();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { ContinualLearningManager };
