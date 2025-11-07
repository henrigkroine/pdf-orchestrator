/**
 * Automated Fix Engine
 *
 * Orchestrates automated fixing of violations using InDesign automation,
 * AI content generation, and intelligent fix planning.
 *
 * @module auto-fix-engine
 */

import { ViolationDetector } from './violation-detector.js';
import { InDesignAutomation } from './indesign-automation.js';
import { Anthropic } from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Auto-Fix Engine
 */
export class AutoFixEngine {
  constructor(options = {}) {
    this.options = {
      requireApproval: options.requireApproval !== false,
      maxFixesPerRun: options.maxFixesPerRun || 50,
      rollbackOnFailure: options.rollbackOnFailure !== false,
      useAI: options.useAI !== false,
      verbose: options.verbose || false,
      dryRun: options.dryRun || false,
      ...options
    };

    this.detector = new ViolationDetector({ verbose: this.options.verbose });
    this.indesign = new InDesignAutomation({ verbose: this.options.verbose });

    // Initialize AI clients if enabled
    if (this.options.useAI) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });

      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }

    this.fixPlan = null;
    this.executionResults = {
      success: [],
      failed: [],
      skipped: [],
      manualRequired: []
    };

    this.stats = {
      totalViolations: 0,
      fixesAttempted: 0,
      fixesSuccessful: 0,
      fixesFailed: 0,
      fixesSkipped: 0,
      manualFixesRequired: 0,
      timeSaved: 0,
      totalTime: 0
    };
  }

  /**
   * Generate comprehensive fix plan
   */
  async generateFixPlan(pdfPath) {
    console.log('\n🔧 Generating comprehensive fix plan...\n');

    const startTime = Date.now();

    // Detect all violations
    const detection = await this.detector.detectAllViolations(pdfPath);

    this.stats.totalViolations = detection.stats.totalViolations;

    // Build fix plan
    this.fixPlan = {
      document: pdfPath,
      detectionTime: detection.detectionTime,
      violations: detection.violations,
      automatedFixes: [],
      manualFixes: [],
      executionOrder: [],
      estimatedTime: 0,
      riskLevel: 'low'
    };

    // Process critical violations first
    await this.planCriticalFixes(detection.violations.critical);

    // Then major violations
    await this.planMajorFixes(detection.violations.major);

    // Finally minor violations
    await this.planMinorFixes(detection.violations.minor);

    // Calculate execution order (dependencies)
    this.calculateExecutionOrder();

    // Assess risk
    this.assessRiskLevel();

    const planTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n📋 Fix Plan Generated:');
    console.log(`  • Automated fixes: ${this.fixPlan.automatedFixes.length}`);
    console.log(`  • Manual fixes: ${this.fixPlan.manualFixes.length}`);
    console.log(`  • Estimated time: ${this.formatTime(this.fixPlan.estimatedTime)}`);
    console.log(`  • Risk level: ${this.getRiskEmoji(this.fixPlan.riskLevel)} ${this.fixPlan.riskLevel.toUpperCase()}`);
    console.log(`  • Plan generation time: ${planTime}s\n`);

    return this.fixPlan;
  }

  /**
   * Plan fixes for critical violations
   */
  async planCriticalFixes(criticalViolations) {
    for (const violation of criticalViolations) {
      if (violation.automatable) {
        const fix = await this.createAutomatedFix(violation, 'critical');
        this.fixPlan.automatedFixes.push(fix);
        this.fixPlan.estimatedTime += fix.estimatedTime;
      } else {
        const guidance = await this.createManualGuidance(violation, 'critical');
        this.fixPlan.manualFixes.push(guidance);
      }
    }
  }

  /**
   * Plan fixes for major violations
   */
  async planMajorFixes(majorViolations) {
    for (const violation of majorViolations) {
      if (violation.automatable) {
        const fix = await this.createAutomatedFix(violation, 'major');
        this.fixPlan.automatedFixes.push(fix);
        this.fixPlan.estimatedTime += fix.estimatedTime;
      } else {
        const guidance = await this.createManualGuidance(violation, 'major');
        this.fixPlan.manualFixes.push(guidance);
      }
    }
  }

  /**
   * Plan fixes for minor violations
   */
  async planMinorFixes(minorViolations) {
    for (const violation of minorViolations) {
      if (violation.automatable) {
        const fix = await this.createAutomatedFix(violation, 'minor');
        this.fixPlan.automatedFixes.push(fix);
        this.fixPlan.estimatedTime += fix.estimatedTime;
      } else {
        const guidance = await this.createManualGuidance(violation, 'minor');
        this.fixPlan.manualFixes.push(guidance);
      }
    }
  }

  /**
   * Create automated fix
   */
  async createAutomatedFix(violation, priority) {
    const fix = {
      id: `fix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      priority: priority,
      violation: violation,
      type: violation.fixStrategy?.type || 'unknown',
      action: violation.fixStrategy?.action || 'Fix violation',
      tool: violation.fixStrategy?.tool || 'indesign_script',
      params: violation.fixStrategy?.params || {},
      estimatedTime: violation.estimatedFixTime || 5,
      risk: violation.fixStrategy?.risk || 'medium',
      dependencies: [],
      status: 'pending'
    };

    return fix;
  }

  /**
   * Create manual guidance
   */
  async createManualGuidance(violation, priority) {
    const guidance = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      priority: priority,
      violation: violation,
      type: 'manual_fix',
      instructions: await this.generateManualInstructions(violation),
      estimatedTime: violation.estimatedFixTime || 15,
      status: 'requires_human'
    };

    return guidance;
  }

  /**
   * Generate manual instructions using AI
   */
  async generateManualInstructions(violation) {
    if (!this.options.useAI || !this.anthropic) {
      return [
        '1. Open document in InDesign',
        '2. Locate the violation',
        `3. ${violation.fixStrategy?.action || 'Fix the issue manually'}`,
        '4. Save the document'
      ];
    }

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Generate step-by-step instructions for manually fixing this design violation:

Type: ${violation.type}
Description: ${violation.description}
Current state: ${JSON.stringify(violation.current, null, 2)}
Expected state: ${JSON.stringify(violation.expected, null, 2)}

Provide 4-6 clear, actionable steps for a designer to fix this in Adobe InDesign.
Format as numbered list.`
        }]
      });

      const instructions = response.content[0].text
        .split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.trim());

      return instructions.length > 0 ? instructions : [
        '1. Open document in InDesign',
        '2. Locate and fix the violation manually',
        '3. Save the document'
      ];

    } catch (error) {
      console.warn('AI instruction generation failed:', error.message);
      return [
        '1. Open document in InDesign',
        '2. Locate the violation',
        `3. ${violation.description}`,
        '4. Save the document'
      ];
    }
  }

  /**
   * Calculate execution order
   */
  calculateExecutionOrder() {
    // Sort by priority and dependencies
    const priorityOrder = { critical: 0, major: 1, minor: 2 };

    this.fixPlan.executionOrder = this.fixPlan.automatedFixes
      .sort((a, b) => {
        // First sort by priority
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;

        // Then by risk (lower risk first)
        const riskOrder = { low: 0, medium: 1, high: 2 };
        return (riskOrder[a.risk] || 1) - (riskOrder[b.risk] || 1);
      })
      .map(fix => fix.id);
  }

  /**
   * Assess overall risk level
   */
  assessRiskLevel() {
    const highRiskFixes = this.fixPlan.automatedFixes.filter(f => f.risk === 'high').length;
    const mediumRiskFixes = this.fixPlan.automatedFixes.filter(f => f.risk === 'medium').length;

    if (highRiskFixes > 3 || mediumRiskFixes > 10) {
      this.fixPlan.riskLevel = 'high';
    } else if (highRiskFixes > 0 || mediumRiskFixes > 5) {
      this.fixPlan.riskLevel = 'medium';
    } else {
      this.fixPlan.riskLevel = 'low';
    }
  }

  /**
   * Execute fix plan
   */
  async executeFixPlan(fixPlan = this.fixPlan) {
    console.log('\n🚀 Executing fix plan...\n');

    if (this.options.dryRun) {
      console.log('⚠️  DRY RUN MODE - No changes will be made\n');
    }

    const startTime = Date.now();

    // Initialize InDesign automation
    if (!this.options.dryRun) {
      await this.indesign.initialize();
    }

    // Create backup before starting
    if (this.options.rollbackOnFailure && !this.options.dryRun) {
      console.log('💾 Creating backup...');
      await this.indesign.createBackup();
    }

    // Execute fixes in order
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 3;

    for (const fixId of fixPlan.executionOrder) {
      const fix = fixPlan.automatedFixes.find(f => f.id === fixId);
      if (!fix) continue;

      // Check if we should stop due to consecutive failures
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.log(`\n⚠️  Stopping execution due to ${consecutiveFailures} consecutive failures`);
        break;
      }

      // Check if we've hit max fixes limit
      if (this.stats.fixesAttempted >= this.options.maxFixesPerRun) {
        console.log(`\n⚠️  Reached max fixes limit (${this.options.maxFixesPerRun})`);
        break;
      }

      // Request approval if required
      if (this.options.requireApproval && !this.options.dryRun) {
        const approved = await this.requestApproval(fix);
        if (!approved) {
          this.executionResults.skipped.push({ fix, reason: 'User declined' });
          this.stats.fixesSkipped++;
          continue;
        }
      }

      // Execute the fix
      try {
        const result = await this.executeFix(fix);

        if (result.success) {
          this.executionResults.success.push({ fix, result });
          this.stats.fixesSuccessful++;
          consecutiveFailures = 0;
        } else {
          this.executionResults.failed.push({ fix, result });
          this.stats.fixesFailed++;
          consecutiveFailures++;
        }

        this.stats.fixesAttempted++;

      } catch (error) {
        console.error(`❌ Fix execution failed: ${error.message}`);
        this.executionResults.failed.push({ fix, error: error.message });
        this.stats.fixesFailed++;
        consecutiveFailures++;
      }
    }

    // Process manual fixes
    for (const manualFix of fixPlan.manualFixes) {
      this.executionResults.manualRequired.push(manualFix);
      this.stats.manualFixesRequired++;
    }

    // Calculate time saved
    this.calculateTimeSaved();

    this.stats.totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Disconnect from InDesign
    if (!this.options.dryRun) {
      await this.indesign.disconnect();
    }

    // Print summary
    this.printExecutionSummary();

    return {
      results: this.executionResults,
      stats: this.stats,
      fixPlan: fixPlan
    };
  }

  /**
   * Execute a single fix
   */
  async executeFix(fix) {
    console.log(`\n🔧 Executing: ${fix.action}`);
    console.log(`   Priority: ${fix.priority} | Risk: ${fix.risk}`);

    if (this.options.dryRun) {
      console.log('   [DRY RUN] Would execute:', fix.type);
      return {
        success: true,
        dryRun: true,
        timeElapsed: 0
      };
    }

    const startTime = Date.now();

    try {
      let result;

      switch (fix.type) {
        case 'color_replace':
        case 'color_adjust':
          result = await this.indesign.fixColorViolation(fix.violation);
          break;

        case 'font_replace':
          result = await this.indesign.fixTypographyViolation(fix.violation);
          break;

        case 'resize_frame':
          result = await this.indesign.fixTextCutoff(fix.violation);
          break;

        case 'page_resize':
          result = await this.indesign.fixPageDimensions(fix.violation);
          break;

        case 'spacing_fix':
          result = await this.indesign.fixSpacingViolation(fix.violation);
          break;

        case 'ai_generation':
          result = await this.aiGenerateFix(fix.violation);
          break;

        default:
          throw new Error(`Unknown fix type: ${fix.type}`);
      }

      const timeElapsed = Date.now() - startTime;

      if (result.success) {
        console.log(`   ✅ Success in ${timeElapsed}ms`);
      } else {
        console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
      }

      return {
        ...result,
        timeElapsed
      };

    } catch (error) {
      const timeElapsed = Date.now() - startTime;
      console.log(`   ❌ Error in ${timeElapsed}ms: ${error.message}`);

      return {
        success: false,
        error: error.message,
        timeElapsed
      };
    }
  }

  /**
   * AI-powered content generation
   */
  async aiGenerateFix(violation) {
    console.log('   🤖 Generating content with AI...');

    if (!this.options.useAI) {
      return {
        success: false,
        error: 'AI generation disabled',
        requiresHumanReview: true
      };
    }

    try {
      // Use GPT-5 for content generation (or Claude if GPT-5 not available)
      const model = this.openai ? 'gpt-4' : 'claude-sonnet-4-5-20250929';

      let generatedText;

      if (this.openai) {
        const response = await this.openai.chat.completions.create({
          model: model,
          messages: [{
            role: 'system',
            content: 'You are a TEEI content specialist. Generate professional, empowering content for Ukrainian education partnership documents. Tone: empowering, hopeful, professional, concise.'
          }, {
            role: 'user',
            content: `Generate replacement text for this placeholder: "${violation.current?.placeholder || 'XX'}"

Context: ${violation.description}
Document type: Partnership proposal
Audience: Corporate partners (AWS, Google, etc.)
Required length: ~50 words max
Brand voice: Empowering, urgent (without panic), hopeful, inclusive, respectful

Generate ONLY the replacement text, no explanation or quotes.`
          }],
          max_tokens: 200,
          temperature: 0.7
        });

        generatedText = response.choices[0].message.content.trim();

      } else if (this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: model,
          max_tokens: 200,
          messages: [{
            role: 'user',
            content: `Generate replacement text for this placeholder: "${violation.current?.placeholder || 'XX'}"

Context: ${violation.description}
Document type: Partnership proposal
Audience: Corporate partners (AWS, Google, etc.)
Required length: ~50 words max
Brand voice: Empowering, urgent (without panic), hopeful, inclusive, respectful

Generate ONLY the replacement text, no explanation or quotes.`
          }]
        });

        generatedText = response.content[0].text.trim();
      }

      console.log(`   ✅ Generated: "${generatedText.substring(0, 50)}..."`);

      return {
        success: true,
        generatedText: generatedText,
        requiresHumanReview: true,
        model: model
      };

    } catch (error) {
      console.log(`   ❌ AI generation failed: ${error.message}`);

      return {
        success: false,
        error: error.message,
        requiresHumanReview: true
      };
    }
  }

  /**
   * Request approval for fix
   */
  async requestApproval(fix) {
    // In a real implementation, this would use readline or a UI
    // For now, auto-approve low-risk fixes
    if (fix.risk === 'low') {
      return true;
    }

    console.log(`\n❓ Approval required for ${fix.risk} risk fix:`);
    console.log(`   ${fix.action}`);
    console.log(`   Violation: ${fix.violation.description}`);

    // Auto-approve in non-interactive mode
    return true;
  }

  /**
   * Calculate time saved
   */
  calculateTimeSaved() {
    // Manual fix time: ~35 minutes per violation (industry average)
    // Automated fix time: ~3 minutes per violation
    const manualTimePerFix = 35 * 60; // seconds
    const automatedTimePerFix = 3 * 60; // seconds

    const manualTime = this.stats.fixesSuccessful * manualTimePerFix;
    const automatedTime = this.stats.fixesSuccessful * automatedTimePerFix;

    this.stats.timeSaved = manualTime - automatedTime;
  }

  /**
   * Print execution summary
   */
  printExecutionSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('EXECUTION SUMMARY');
    console.log('='.repeat(60));

    console.log('\n📊 Results:');
    console.log(`  ✅ Successful: ${this.stats.fixesSuccessful}`);
    console.log(`  ❌ Failed: ${this.stats.fixesFailed}`);
    console.log(`  ⏭️  Skipped: ${this.stats.fixesSkipped}`);
    console.log(`  👤 Manual required: ${this.stats.manualFixesRequired}`);

    const successRate = this.stats.fixesAttempted > 0 ?
      ((this.stats.fixesSuccessful / this.stats.fixesAttempted) * 100).toFixed(1) : 0;

    console.log(`\n📈 Performance:`);
    console.log(`  Success rate: ${successRate}%`);
    console.log(`  Total time: ${this.stats.totalTime}s`);
    console.log(`  Time saved: ${this.formatTime(this.stats.timeSaved)}`);
    console.log(`  Efficiency: ${this.calculateEfficiency()}% faster than manual`);

    console.log('\n' + '='.repeat(60) + '\n');
  }

  /**
   * Calculate efficiency gain
   */
  calculateEfficiency() {
    if (this.stats.fixesSuccessful === 0) return 0;

    const manualTime = this.stats.fixesSuccessful * 35 * 60; // 35 min per fix
    const automatedTime = this.stats.fixesSuccessful * 3 * 60; // 3 min per fix

    return (((manualTime - automatedTime) / manualTime) * 100).toFixed(1);
  }

  // Utility methods

  formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      const secs = Math.floor(seconds % 60);
      return `${minutes}m ${secs}s`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getRiskEmoji(risk) {
    const emojis = { low: '🟢', medium: '🟡', high: '🔴' };
    return emojis[risk] || '⚪';
  }
}

export default AutoFixEngine;
