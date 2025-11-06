#!/usr/bin/env node

/**
 * Auto-Fix Document CLI
 *
 * Command-line tool for automated PDF violation fixing.
 * Supports interactive mode, batch mode, dry-run, and rollback.
 *
 * Usage:
 *   node auto-fix-document.js <pdf-path> [options]
 *
 * Options:
 *   --interactive     Interactive mode (approve each fix)
 *   --batch           Batch mode (fix all automatically)
 *   --dry-run         Dry run (show what would be fixed)
 *   --no-backup       Disable automatic backup
 *   --max-fixes <n>   Maximum fixes per run (default: 50)
 *   --report          Generate visual fix report
 *   --predict         Run prediction before fixing
 *   --learn           Enable learning from results
 *   --config <path>   Custom config file path
 *   --verbose         Verbose output
 *   --help            Show help
 */

import { ClosedLoopRemediation } from './lib/closed-loop-remediation.js';
import { AutoFixEngine } from './lib/auto-fix-engine.js';
import { ViolationDetector } from './lib/violation-detector.js';
import { SelfImprovingSystem } from './lib/self-improvement.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * CLI Application
 */
class AutoFixCLI {
  constructor() {
    this.args = process.argv.slice(2);
    this.options = this.parseArguments();
    this.config = null;
    this.rl = null;
  }

  /**
   * Parse command-line arguments
   */
  parseArguments() {
    const options = {
      pdfPath: null,
      interactive: false,
      batch: false,
      dryRun: false,
      backup: true,
      maxFixes: 50,
      report: false,
      predict: false,
      learn: true,
      configPath: path.join(projectRoot, 'config', 'auto-fix-config.json'),
      verbose: false,
      help: false
    };

    for (let i = 0; i < this.args.length; i++) {
      const arg = this.args[i];

      switch (arg) {
        case '--interactive':
        case '-i':
          options.interactive = true;
          break;

        case '--batch':
        case '-b':
          options.batch = true;
          break;

        case '--dry-run':
        case '-d':
          options.dryRun = true;
          break;

        case '--no-backup':
          options.backup = false;
          break;

        case '--max-fixes':
          options.maxFixes = parseInt(this.args[++i]) || 50;
          break;

        case '--report':
        case '-r':
          options.report = true;
          break;

        case '--predict':
        case '-p':
          options.predict = true;
          break;

        case '--learn':
        case '-l':
          options.learn = true;
          break;

        case '--no-learn':
          options.learn = false;
          break;

        case '--config':
        case '-c':
          options.configPath = this.args[++i];
          break;

        case '--verbose':
        case '-v':
          options.verbose = true;
          break;

        case '--help':
        case '-h':
          options.help = true;
          break;

        default:
          if (!arg.startsWith('-') && !options.pdfPath) {
            options.pdfPath = arg;
          }
      }
    }

    // Default to interactive if neither interactive nor batch specified
    if (!options.interactive && !options.batch) {
      options.interactive = true;
    }

    return options;
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log(`
Auto-Fix Document - Automated PDF Violation Fixing
==================================================

Usage:
  node auto-fix-document.js <pdf-path> [options]

Options:
  --interactive, -i       Interactive mode (approve each fix)
  --batch, -b             Batch mode (fix all automatically)
  --dry-run, -d           Dry run (show what would be fixed)
  --no-backup             Disable automatic backup
  --max-fixes <n>         Maximum fixes per run (default: 50)
  --report, -r            Generate visual fix report
  --predict, -p           Run prediction before fixing
  --learn, -l             Enable learning from results (default: on)
  --no-learn              Disable learning
  --config, -c <path>     Custom config file path
  --verbose, -v           Verbose output
  --help, -h              Show this help

Examples:
  # Interactive mode with prediction
  node auto-fix-document.js document.pdf --interactive --predict

  # Batch mode with report
  node auto-fix-document.js document.pdf --batch --report

  # Dry run to see what would be fixed
  node auto-fix-document.js document.pdf --dry-run

  # Limit fixes and generate report
  node auto-fix-document.js document.pdf --max-fixes 10 --report

Exit Codes:
  0 - Success (all fixes applied)
  1 - Partial success (some fixes failed)
  2 - Failure (no fixes applied)
  3 - Error (invalid input or configuration)
`);
  }

  /**
   * Load configuration
   */
  async loadConfiguration() {
    try {
      const configData = await fs.readFile(this.options.configPath, 'utf-8');
      this.config = JSON.parse(configData);

      if (this.options.verbose) {
        console.log(`✅ Loaded configuration from: ${this.options.configPath}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not load config file, using defaults`);
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      auto_fix: {
        enabled: true,
        require_approval: true,
        max_fixes_per_run: 50,
        rollback_on_failure: true
      },
      fixable_violations: {
        color: { auto: true, risk: 'low' },
        typography: { auto: true, risk: 'low' },
        layout: { auto: true, risk: 'medium' },
        spacing: { auto: true, risk: 'medium' },
        content: { auto: false, risk: 'high' }
      },
      predictive: {
        enabled: true,
        confidence_threshold: 0.7,
        retrain_frequency: 'weekly'
      }
    };
  }

  /**
   * Validate PDF path
   */
  async validatePdfPath() {
    if (!this.options.pdfPath) {
      console.error('❌ Error: PDF path is required');
      console.log('Run with --help for usage information');
      return false;
    }

    try {
      await fs.access(this.options.pdfPath);
      return true;
    } catch (error) {
      console.error(`❌ Error: PDF file not found: ${this.options.pdfPath}`);
      return false;
    }
  }

  /**
   * Run the CLI application
   */
  async run() {
    // Show help if requested
    if (this.options.help) {
      this.showHelp();
      return 0;
    }

    // Print banner
    this.printBanner();

    // Validate input
    if (!await this.validatePdfPath()) {
      return 3;
    }

    // Load configuration
    await this.loadConfiguration();

    // Merge config with options
    const engineOptions = {
      requireApproval: this.options.interactive,
      maxFixesPerRun: this.options.maxFixes,
      rollbackOnFailure: this.config.auto_fix?.rollback_on_failure !== false,
      useAI: true,
      verbose: this.options.verbose,
      dryRun: this.options.dryRun
    };

    try {
      let result;

      // Choose execution mode
      if (this.options.batch && !this.options.interactive) {
        // Full closed-loop remediation
        result = await this.runClosedLoopRemediation(engineOptions);
      } else {
        // Interactive or simple auto-fix
        result = await this.runInteractiveAutoFix(engineOptions);
      }

      // Generate report if requested
      if (this.options.report) {
        await this.generateReport(result);
      }

      // Learn from results if enabled
      if (this.options.learn && !this.options.dryRun) {
        await this.learnFromResults(result);
      }

      // Determine exit code
      return this.determineExitCode(result);

    } catch (error) {
      console.error('\n❌ Fatal error:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      return 2;
    }
  }

  /**
   * Run closed-loop remediation (batch mode)
   */
  async runClosedLoopRemediation(options) {
    console.log('\n🔄 Running closed-loop remediation...\n');

    const remediation = new ClosedLoopRemediation({
      ...options,
      enableLearning: this.options.learn,
      enablePrediction: this.options.predict
    });

    const result = await remediation.remediateDocument(this.options.pdfPath);

    return {
      mode: 'closed_loop',
      result: result,
      success: result.success
    };
  }

  /**
   * Run interactive auto-fix
   */
  async runInteractiveAutoFix(options) {
    console.log('\n🔧 Running interactive auto-fix...\n');

    const detector = new ViolationDetector({ verbose: options.verbose });
    const autoFix = new AutoFixEngine(options);

    // Detect violations
    const detection = await detector.detectAllViolations(this.options.pdfPath);

    // Generate fix plan
    const fixPlan = await autoFix.generateFixPlan(this.options.pdfPath);

    // Interactive approval
    if (this.options.interactive && !this.options.dryRun) {
      await this.interactiveApproval(fixPlan);
    }

    // Execute fixes
    const execution = await autoFix.executeFixPlan(fixPlan);

    return {
      mode: 'interactive',
      detection: detection,
      fixPlan: fixPlan,
      execution: execution,
      success: execution.stats.fixesSuccessful > 0
    };
  }

  /**
   * Interactive approval of fixes
   */
  async interactiveApproval(fixPlan) {
    if (fixPlan.automatedFixes.length === 0) {
      console.log('\n✅ No automated fixes needed!');
      return;
    }

    console.log('\n' + '='.repeat(70));
    console.log('INTERACTIVE FIX APPROVAL');
    console.log('='.repeat(70));

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(`\nFound ${fixPlan.automatedFixes.length} automated fixes to apply.\n`);

    // Show all fixes
    for (let i = 0; i < fixPlan.automatedFixes.length; i++) {
      const fix = fixPlan.automatedFixes[i];
      console.log(`${i + 1}. [${fix.priority.toUpperCase()}] ${fix.action}`);
      console.log(`   Violation: ${fix.violation.description}`);
      console.log(`   Risk: ${fix.risk} | Time: ~${fix.estimatedTime}s\n`);
    }

    const answer = await this.question(
      `\nApply all ${fixPlan.automatedFixes.length} fixes? (yes/no/selective): `
    );

    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      console.log('✅ All fixes approved');
    } else if (answer.toLowerCase() === 'no' || answer.toLowerCase() === 'n') {
      console.log('⏭️  Skipping all fixes');
      fixPlan.executionOrder = [];
    } else if (answer.toLowerCase() === 'selective' || answer.toLowerCase() === 's') {
      await this.selectiveFixes(fixPlan);
    }

    this.rl.close();
  }

  /**
   * Selective fix approval
   */
  async selectiveFixes(fixPlan) {
    console.log('\n📋 Selective fix approval:\n');

    const approved = [];

    for (const fix of fixPlan.automatedFixes) {
      const answer = await this.question(
        `Apply: ${fix.action}? (y/n): `
      );

      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        approved.push(fix.id);
      }
    }

    // Update execution order with only approved fixes
    fixPlan.executionOrder = fixPlan.executionOrder.filter(id => approved.includes(id));

    console.log(`\n✅ ${approved.length} fixes approved`);
  }

  /**
   * Ask question and get answer
   */
  question(prompt) {
    return new Promise(resolve => {
      this.rl.question(prompt, answer => {
        resolve(answer);
      });
    });
  }

  /**
   * Generate fix report
   */
  async generateReport(result) {
    console.log('\n📊 Generating fix report...');

    const reportPath = path.join(
      projectRoot,
      'exports',
      'fix-reports',
      `fix-report-${Date.now()}.json`
    );

    await fs.mkdir(path.dirname(reportPath), { recursive: true });

    const report = {
      document: this.options.pdfPath,
      mode: result.mode,
      timestamp: new Date().toISOString(),
      options: this.options,
      result: result
    };

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Fix report saved to: ${reportPath}`);
  }

  /**
   * Learn from results
   */
  async learnFromResults(result) {
    console.log('\n🎓 Learning from results...');

    const learner = new SelfImprovingSystem({ verbose: this.options.verbose });
    await learner.initialize();

    // Extract fix results
    let fixResults = [];

    if (result.mode === 'closed_loop') {
      fixResults = [
        ...result.result.loop.deploy.results.success,
        ...result.result.loop.deploy.results.failed
      ];
    } else if (result.mode === 'interactive') {
      fixResults = [
        ...result.execution.results.success,
        ...result.execution.results.failed
      ];
    }

    if (fixResults.length > 0) {
      await learner.learnFromFixes(fixResults);

      // Get and display learning stats
      const stats = await learner.getLearningStatistics();
      console.log('\n📈 Learning Statistics:');
      console.log(`  Overall success rate: ${stats.overallSuccessRate.toFixed(1)}%`);
      console.log(`  Recent improvements: ${stats.learningVelocity} this week`);
    }

    await learner.close();
  }

  /**
   * Determine exit code based on results
   */
  determineExitCode(result) {
    if (this.options.dryRun) {
      return 0; // Dry run always succeeds
    }

    if (result.mode === 'closed_loop') {
      const improvement = result.result.metrics.violationsBefore - result.result.metrics.violationsAfter;
      const improvementPercent = result.result.metrics.violationsBefore > 0 ?
        (improvement / result.result.metrics.violationsBefore) * 100 : 0;

      if (improvementPercent >= 80) return 0; // Complete success
      if (improvementPercent >= 50) return 1; // Partial success
      return 2; // Limited success
    }

    if (result.mode === 'interactive') {
      const stats = result.execution.stats;

      if (stats.fixesFailed === 0) return 0; // All succeeded
      if (stats.fixesSuccessful > stats.fixesFailed) return 1; // More succeeded than failed
      return 2; // More failed than succeeded
    }

    return 0;
  }

  /**
   * Print banner
   */
  printBanner() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                     AUTO-FIX DOCUMENT                             ║
║                Automated PDF Violation Fixing                     ║
╚═══════════════════════════════════════════════════════════════════╝
`);

    console.log(`Document: ${this.options.pdfPath}`);
    console.log(`Mode: ${this.options.batch ? 'Batch' : 'Interactive'}`);
    console.log(`Dry Run: ${this.options.dryRun ? 'Yes' : 'No'}`);
    console.log(`Max Fixes: ${this.options.maxFixes}`);
    console.log(`Learning: ${this.options.learn ? 'Enabled' : 'Disabled'}`);
    console.log(`Prediction: ${this.options.predict ? 'Enabled' : 'Disabled'}`);
    console.log('');
  }
}

/**
 * Main execution
 */
async function main() {
  const cli = new AutoFixCLI();
  const exitCode = await cli.run();
  process.exit(exitCode);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(2);
  });
}

export default AutoFixCLI;
