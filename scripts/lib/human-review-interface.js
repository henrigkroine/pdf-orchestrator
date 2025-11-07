/**
 * Human Review Interface
 *
 * CLI interface for human review of low-confidence AI findings
 * - Display AI analysis side-by-side with image
 * - Accept human corrections
 * - Feed corrections back to adaptive learning
 * - Track review progress
 *
 * Part of Phase 4: World-Class QA System
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const AdaptiveLearningSystem = require('../adaptive-learning');

class HumanReviewInterface {
  constructor(options = {}) {
    this.reportsDir = options.reportsDir || path.join(process.cwd(), 'exports', 'ai-validation-reports');
    this.reviewsDir = options.reviewsDir || path.join(process.cwd(), 'data', 'reviews');
    this.learningSystem = new AdaptiveLearningSystem();

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Confidence thresholds for review priority
    this.thresholds = {
      autoAccept: 0.90,  // > 0.90: Auto-accept
      review: 0.70,      // 0.70-0.90: Flag for review
      requireReview: 0.70 // < 0.70: Require human validation
    };
  }

  /**
   * Initialize the review interface
   */
  async initialize() {
    console.log('👤 Initializing Human Review Interface...\n');

    await fs.mkdir(this.reviewsDir, { recursive: true });
    await this.learningSystem.initialize();

    console.log('✅ Interface ready\n');
  }

  /**
   * Start review session
   */
  async startReviewSession(filterOptions = {}) {
    console.log('═'.repeat(80));
    console.log('  HUMAN REVIEW SESSION');
    console.log('═'.repeat(80));
    console.log('');

    // Load pending reviews
    const pendingReviews = await this.loadPendingReviews(filterOptions);

    if (pendingReviews.length === 0) {
      console.log('✅ No pending reviews! All validations have high confidence.');
      this.close();
      return;
    }

    console.log(`Found ${pendingReviews.length} validations requiring review:\n`);

    // Sort by priority (lowest confidence first)
    pendingReviews.sort((a, b) => (a.confidence || 0.5) - (b.confidence || 0.5));

    // Display priority breakdown
    const critical = pendingReviews.filter(r => (r.confidence || 0.5) < 0.70).length;
    const medium = pendingReviews.filter(r => {
      const conf = r.confidence || 0.5;
      return conf >= 0.70 && conf < 0.90;
    }).length;

    console.log(`Priority Breakdown:`);
    console.log(`  - Critical (confidence < 70%): ${critical}`);
    console.log(`  - Medium (confidence 70-90%): ${medium}`);
    console.log('');

    // Review each one
    let reviewedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < pendingReviews.length; i++) {
      const report = pendingReviews[i];

      console.log(`\n${'─'.repeat(80)}`);
      console.log(`Review ${i + 1} of ${pendingReviews.length}`);
      console.log('─'.repeat(80));

      const action = await this.reviewSingleReport(report);

      if (action === 'reviewed') {
        reviewedCount++;
      } else if (action === 'skipped') {
        skippedCount++;
      } else if (action === 'quit') {
        console.log('\n⏸️  Review session paused.');
        break;
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('  REVIEW SESSION COMPLETE');
    console.log('═'.repeat(80));
    console.log(`\nReviewed: ${reviewedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Remaining: ${pendingReviews.length - reviewedCount - skippedCount}\n`);

    this.close();
  }

  /**
   * Review a single report
   */
  async reviewSingleReport(report) {
    // Display AI analysis
    this.displayAIAnalysis(report);

    // Get human input
    const correction = await this.getHumanCorrection(report);

    if (correction.action === 'skip') {
      return 'skipped';
    } else if (correction.action === 'quit') {
      return 'quit';
    }

    // Record feedback in adaptive learning system
    await this.learningSystem.recordFeedback(
      report.validationId || report.timestamp,
      report,
      correction
    );

    // Save review
    await this.saveReview(report, correction);

    console.log('\n✅ Review recorded and learning system updated!');

    return 'reviewed';
  }

  /**
   * Display AI analysis to reviewer
   */
  displayAIAnalysis(report) {
    console.log('\n📄 Document:', path.basename(report.imagePath || 'Unknown'));
    console.log('🤖 AI Analysis:\n');

    console.log(`  Overall Score: ${report.overallScore || 0}/10`);
    console.log(`  Grade: ${report.gradeLevel || 'N/A'}`);
    console.log(`  Confidence: ${((report.confidence || 0.5) * 100).toFixed(1)}%`);
    console.log(`  Model: ${report.model || 'gemini-1.5-flash'}\n`);

    // Brand compliance
    if (report.brandCompliance) {
      console.log('  Brand Compliance:');
      console.log(`    - Colors: ${report.brandCompliance.colors || 'N/A'}`);
      console.log(`    - Typography: ${report.brandCompliance.typography || 'N/A'}`);
      console.log(`    - Spacing: ${report.brandCompliance.spacing || 'N/A'}`);
      console.log('');
    }

    // Critical violations
    if (report.criticalViolations && report.criticalViolations.length > 0) {
      console.log('  ⚠️  Critical Violations:');
      report.criticalViolations.slice(0, 5).forEach((v, i) => {
        console.log(`    ${i + 1}. [${v.category || 'General'}] ${v.issue || v}`);
      });
      if (report.criticalViolations.length > 5) {
        console.log(`    ... and ${report.criticalViolations.length - 5} more`);
      }
      console.log('');
    }

    // Recommendations
    if (report.recommendations && report.recommendations.length > 0) {
      console.log('  💡 Top Recommendations:');
      report.recommendations.slice(0, 3).forEach((r, i) => {
        console.log(`    ${i + 1}. [${r.priority || 'MEDIUM'}] ${r.issue || r.recommendation || r}`);
      });
      console.log('');
    }

    // Why review is needed
    const confidence = report.confidence || 0.5;
    let reason = '';

    if (confidence < 0.70) {
      reason = 'Low confidence - requires validation';
    } else if (confidence < 0.90) {
      reason = 'Medium confidence - recommended for spot-check';
    } else {
      reason = 'Borderline score or conflicting findings';
    }

    console.log(`  📋 Review Reason: ${reason}\n`);
  }

  /**
   * Get human correction
   */
  async getHumanCorrection(report) {
    console.log('─'.repeat(80));
    console.log('YOUR REVIEW:');
    console.log('─'.repeat(80));
    console.log('');

    // Ask for overall agreement
    const agreement = await this.ask(
      'Do you agree with the AI assessment? (y/n/skip/quit): '
    );

    if (agreement.toLowerCase() === 'quit' || agreement.toLowerCase() === 'q') {
      return { action: 'quit' };
    }

    if (agreement.toLowerCase() === 'skip' || agreement.toLowerCase() === 's') {
      return { action: 'skip' };
    }

    if (agreement.toLowerCase() === 'y' || agreement.toLowerCase() === 'yes') {
      // Quick agreement - just record confirmation
      return {
        action: 'reviewed',
        gradeLevel: report.gradeLevel,
        overallScore: report.overallScore,
        corrections: [],
        notes: 'Confirmed by human reviewer',
        agreementLevel: 'high'
      };
    }

    // Get detailed correction
    console.log('\nPlease provide corrected assessment:\n');

    const gradeLevel = await this.ask(
      `Correct Grade (current: ${report.gradeLevel || 'N/A'}) [A+, A, A-, B+, B, B-, C+, C, C-, D, F]: `
    );

    const overallScore = await this.ask(
      `Correct Score (current: ${report.overallScore || 0}/10) [0-10]: `
    );

    const corrections = await this.ask(
      'What did AI get wrong? (comma-separated issues): '
    );

    const notes = await this.ask(
      'Additional notes (optional): '
    );

    const learningPoints = await this.ask(
      'Learning points for future (optional): '
    );

    return {
      action: 'reviewed',
      gradeLevel: gradeLevel.trim() || report.gradeLevel,
      overallScore: parseFloat(overallScore) || report.overallScore,
      corrections: corrections ? corrections.split(',').map(c => c.trim()) : [],
      notes: notes || '',
      learningPoints: learningPoints ? learningPoints.split(',').map(lp => lp.trim()) : [],
      agreementLevel: 'corrected'
    };
  }

  /**
   * Load pending reviews
   */
  async loadPendingReviews(filterOptions = {}) {
    const reports = [];

    try {
      const files = await fs.readdir(this.reportsDir);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(this.reportsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const report = JSON.parse(content);

        // Check if already reviewed
        const reviewPath = path.join(
          this.reviewsDir,
          file.replace('.json', '-review.json')
        );

        try {
          await fs.access(reviewPath);
          continue; // Already reviewed, skip
        } catch {
          // Not reviewed yet
        }

        // Apply filters
        if (this.shouldReview(report, filterOptions)) {
          reports.push({
            ...report,
            filePath,
            validationId: path.basename(file, '.json')
          });
        }
      }

    } catch (error) {
      console.error(`Error loading reports: ${error.message}`);
    }

    return reports;
  }

  /**
   * Determine if report should be reviewed
   */
  shouldReview(report, filterOptions) {
    const confidence = report.confidence || 0.5;

    // Apply confidence filter
    if (filterOptions.minConfidence !== undefined) {
      if (confidence < filterOptions.minConfidence) return false;
    }

    if (filterOptions.maxConfidence !== undefined) {
      if (confidence > filterOptions.maxConfidence) return false;
    }

    // Default: review if confidence below auto-accept threshold
    if (filterOptions.onlyLowConfidence !== false) {
      return confidence < this.thresholds.autoAccept;
    }

    return true;
  }

  /**
   * Save review
   */
  async saveReview(report, correction) {
    const review = {
      timestamp: new Date().toISOString(),
      validationId: report.validationId,
      originalReport: {
        gradeLevel: report.gradeLevel,
        overallScore: report.overallScore,
        confidence: report.confidence,
        model: report.model
      },
      humanCorrection: correction,
      delta: Math.abs((report.overallScore || 0) - (correction.overallScore || 0)),
      agreementLevel: correction.agreementLevel
    };

    const filename = `${report.validationId}-review.json`;
    const filepath = path.join(this.reviewsDir, filename);

    await fs.writeFile(filepath, JSON.stringify(review, null, 2));
  }

  /**
   * Ask question and get user input
   */
  ask(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }

  /**
   * Close interface
   */
  close() {
    this.rl.close();
  }

  /**
   * Get review statistics
   */
  async getReviewStatistics() {
    try {
      const files = await fs.readdir(this.reviewsDir);
      const reviews = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        const content = await fs.readFile(path.join(this.reviewsDir, file), 'utf8');
        reviews.push(JSON.parse(content));
      }

      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageDelta: 0,
          agreementRate: 0,
          majorCorrections: 0
        };
      }

      const totalReviews = reviews.length;
      const averageDelta = reviews.reduce((sum, r) => sum + (r.delta || 0), 0) / totalReviews;
      const agreements = reviews.filter(r => r.agreementLevel === 'high').length;
      const agreementRate = (agreements / totalReviews) * 100;
      const majorCorrections = reviews.filter(r => (r.delta || 0) > 2.0).length;

      return {
        totalReviews,
        averageDelta: parseFloat(averageDelta.toFixed(2)),
        agreementRate: parseFloat(agreementRate.toFixed(2)),
        majorCorrections
      };

    } catch (error) {
      return {
        totalReviews: 0,
        averageDelta: 0,
        agreementRate: 0,
        majorCorrections: 0
      };
    }
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];

  const reviewInterface = new HumanReviewInterface();

  (async () => {
    await reviewInterface.initialize();

    if (command === 'start' || !command) {
      await reviewInterface.startReviewSession({
        onlyLowConfidence: true
      });

    } else if (command === 'all') {
      await reviewInterface.startReviewSession({
        onlyLowConfidence: false
      });

    } else if (command === 'stats') {
      const stats = await reviewInterface.getReviewStatistics();
      console.log('\n📊 Review Statistics:');
      console.log(`  Total Reviews: ${stats.totalReviews}`);
      console.log(`  Average Delta: ${stats.averageDelta}`);
      console.log(`  Agreement Rate: ${stats.agreementRate}%`);
      console.log(`  Major Corrections: ${stats.majorCorrections}\n`);

    } else {
      console.log('\nHuman Review Interface');
      console.log('\nCommands:');
      console.log('  start - Start review session (low confidence only)');
      console.log('  all   - Review all pending validations');
      console.log('  stats - Show review statistics');
      console.log('');
    }

    process.exit(0);
  })().catch(error => {
    console.error('❌ Error:', error.message);
    reviewInterface.close();
    process.exit(1);
  });
}

module.exports = HumanReviewInterface;
