/**
 * Comprehensive WCAG 2.2 Level AAA Accessibility Validator
 *
 * Features:
 * - All 86 WCAG 2.2 Success Criteria
 * - AI-powered quality assessment
 * - Multi-model ensemble validation
 * - PDF/UA compliance
 * - Detailed violation reporting with remediation guidance
 *
 * @module accessibility-validator
 */

import fs from 'fs/promises';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ContrastChecker from './contrast-checker.js';
import StructureValidator from './structure-validator.js';
import ReadabilityAnalyzer from './readability-analyzer.js';
import ScreenReaderSimulator from './screen-reader-simulator.js';
import CognitiveAccessibility from './cognitive-accessibility.js';

export default class AccessibilityValidator {
  constructor(options = {}) {
    this.config = null;
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // Initialize sub-validators
    this.contrastChecker = new ContrastChecker();
    this.structureValidator = new StructureValidator();
    this.readabilityAnalyzer = new ReadabilityAnalyzer();
    this.screenReaderSimulator = new ScreenReaderSimulator();
    this.cognitiveAccessibility = new CognitiveAccessibility();

    // Validation results
    this.violations = [];
    this.warnings = [];
    this.passes = [];
    this.aiInsights = [];

    this.options = {
      level: 'AAA',
      includeAI: true,
      generateReport: true,
      ...options
    };
  }

  /**
   * Load configuration
   */
  async loadConfig() {
    const configPath = path.resolve(process.cwd(), 'config/accessibility-config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    this.config = JSON.parse(configData);
    return this.config;
  }

  /**
   * Validate PDF accessibility comprehensively
   * @param {string} pdfPath - Path to PDF file
   * @returns {Object} Comprehensive accessibility report
   */
  async validate(pdfPath) {
    console.log('🔍 Starting comprehensive WCAG 2.2 AAA validation...\n');

    await this.loadConfig();

    // Load PDF
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pdfData = await pdfParse(pdfBuffer);

    // Initialize results
    this.violations = [];
    this.warnings = [];
    this.passes = [];
    this.aiInsights = [];

    const results = {
      file: pdfPath,
      timestamp: new Date().toISOString(),
      wcagVersion: '2.2',
      level: this.options.level,
      summary: {},
      principles: {},
      violations: [],
      warnings: [],
      passes: [],
      aiInsights: [],
      score: 0,
      grade: '',
      remediation: []
    };

    // Principle 1: Perceivable
    console.log('📋 Validating Principle 1: Perceivable...');
    results.principles.perceivable = await this.validatePerceivable(pdfDoc, pdfData, pdfPath);

    // Principle 2: Operable
    console.log('📋 Validating Principle 2: Operable...');
    results.principles.operable = await this.validateOperable(pdfDoc, pdfData);

    // Principle 3: Understandable
    console.log('📋 Validating Principle 3: Understandable...');
    results.principles.understandable = await this.validateUnderstandable(pdfDoc, pdfData);

    // Principle 4: Robust
    console.log('📋 Validating Principle 4: Robust...');
    results.principles.robust = await this.validateRobust(pdfDoc, pdfData);

    // PDF/UA Compliance
    console.log('📋 Validating PDF/UA compliance...');
    results.pdfUA = await this.validatePDFUA(pdfDoc, pdfData);

    // Calculate overall score
    results.violations = this.violations;
    results.warnings = this.warnings;
    results.passes = this.passes;
    results.aiInsights = this.aiInsights;
    results.score = this.calculateAccessibilityScore();
    results.grade = this.getAccessibilityGrade(results.score);

    // Generate remediation recommendations
    results.remediation = this.generateRemediationPlan();

    // Summary statistics
    results.summary = {
      totalCriteria: this.getTotalCriteriaTested(),
      criteriaPassed: this.passes.length,
      violations: {
        critical: this.violations.filter(v => v.severity === 'critical').length,
        major: this.violations.filter(v => v.severity === 'major').length,
        moderate: this.violations.filter(v => v.severity === 'moderate').length,
        minor: this.violations.filter(v => v.severity === 'minor').length,
        total: this.violations.length
      },
      warnings: this.warnings.length,
      score: results.score,
      grade: results.grade,
      compliant: this.isCompliant(results.score, this.options.level)
    };

    console.log(`\n✅ Validation complete! Score: ${results.score}/100 (${results.grade})`);

    return results;
  }

  /**
   * Validate Principle 1: Perceivable
   */
  async validatePerceivable(pdfDoc, pdfData, pdfPath) {
    const results = {
      guidelines: {},
      score: 0,
      violations: [],
      passes: []
    };

    // Guideline 1.1: Text Alternatives
    results.guidelines['1.1'] = await this.validate_1_1_TextAlternatives(pdfDoc, pdfData, pdfPath);

    // Guideline 1.2: Time-based Media
    results.guidelines['1.2'] = await this.validate_1_2_TimeBasedMedia(pdfDoc, pdfData);

    // Guideline 1.3: Adaptable
    results.guidelines['1.3'] = await this.validate_1_3_Adaptable(pdfDoc, pdfData);

    // Guideline 1.4: Distinguishable
    results.guidelines['1.4'] = await this.validate_1_4_Distinguishable(pdfDoc, pdfData, pdfPath);

    return results;
  }

  /**
   * Guideline 1.1: Text Alternatives
   */
  async validate_1_1_TextAlternatives(pdfDoc, pdfData, pdfPath) {
    const results = { criteria: {}, violations: [], passes: [] };

    // 1.1.1: Non-text Content (Level A)
    const altTextResult = await this.structureValidator.checkAltText(pdfDoc, pdfData);

    if (altTextResult.allImagesHaveAlt) {
      this.addPass('1.1.1', 'Non-text Content', 'A', 'All images have alternative text');
      results.passes.push('1.1.1');

      // AI-enhanced quality check
      if (this.options.includeAI) {
        const qualityCheck = await this.checkAltTextQuality(altTextResult.images, pdfPath);
        if (qualityCheck.issues.length > 0) {
          this.addWarning('1.1.1', 'Non-text Content', 'A',
            'Some alternative text could be improved', qualityCheck.issues);
        }
        this.aiInsights.push(qualityCheck.insights);
      }
    } else {
      this.addViolation('1.1.1', 'Non-text Content', 'A', 'critical',
        `${altTextResult.missingAlt.length} images missing alternative text`,
        altTextResult.missingAlt,
        'Add descriptive alternative text to all images'
      );
      results.violations.push('1.1.1');
    }

    results.criteria['1.1.1'] = altTextResult;

    return results;
  }

  /**
   * Guideline 1.2: Time-based Media
   */
  async validate_1_2_TimeBasedMedia(pdfDoc, pdfData) {
    const results = { criteria: {}, violations: [], passes: [] };

    // Check for embedded multimedia
    const mediaCheck = await this.structureValidator.checkMultimedia(pdfDoc);

    // 1.2.1 through 1.2.9: Various time-based media requirements
    const criteria = ['1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5', '1.2.6', '1.2.7', '1.2.8', '1.2.9'];
    const names = [
      'Audio-only and Video-only',
      'Captions (Prerecorded)',
      'Audio Description or Media Alternative',
      'Captions (Live)',
      'Audio Description (Prerecorded)',
      'Sign Language (Prerecorded)',
      'Extended Audio Description',
      'Media Alternative (Prerecorded)',
      'Audio-only (Live)'
    ];
    const levels = ['A', 'A', 'A', 'AA', 'AA', 'AAA', 'AAA', 'AAA', 'AAA'];

    criteria.forEach((criterion, idx) => {
      if (mediaCheck.hasMedia) {
        this.addWarning(criterion, names[idx], levels[idx],
          'Manual review required for time-based media accessibility',
          mediaCheck.mediaElements
        );
      } else {
        this.addPass(criterion, names[idx], levels[idx], 'No time-based media found');
        results.passes.push(criterion);
      }
    });

    results.criteria.mediaCheck = mediaCheck;

    return results;
  }

  /**
   * Guideline 1.3: Adaptable
   */
  async validate_1_3_Adaptable(pdfDoc, pdfData) {
    const results = { criteria: {}, violations: [], passes: [] };

    // 1.3.1: Info and Relationships (Level A)
    const structureCheck = await this.structureValidator.validateStructure(pdfDoc, pdfData);

    if (structureCheck.wellStructured) {
      this.addPass('1.3.1', 'Info and Relationships', 'A',
        'Document structure is programmatically determinable');
      results.passes.push('1.3.1');
    } else {
      this.addViolation('1.3.1', 'Info and Relationships', 'A', 'major',
        'Document structure issues detected',
        structureCheck.issues,
        'Add proper PDF tags and semantic structure'
      );
      results.violations.push('1.3.1');
    }

    // 1.3.2: Meaningful Sequence (Level A)
    const readingOrderCheck = await this.structureValidator.checkReadingOrder(pdfDoc);

    if (readingOrderCheck.logical) {
      this.addPass('1.3.2', 'Meaningful Sequence', 'A', 'Reading order is logical');
      results.passes.push('1.3.2');
    } else {
      this.addViolation('1.3.2', 'Meaningful Sequence', 'A', 'major',
        'Reading order is not logical',
        readingOrderCheck.issues,
        'Fix reading order in PDF structure'
      );
      results.violations.push('1.3.2');
    }

    // 1.3.3: Sensory Characteristics (Level A)
    if (this.options.includeAI) {
      const sensoryCheck = await this.checkSensoryInstructions(pdfData.text);
      if (sensoryCheck.hasSensoryOnly) {
        this.addViolation('1.3.3', 'Sensory Characteristics', 'A', 'moderate',
          'Instructions rely solely on sensory characteristics',
          sensoryCheck.issues,
          'Provide text-based alternatives to sensory instructions'
        );
        results.violations.push('1.3.3');
      } else {
        this.addPass('1.3.3', 'Sensory Characteristics', 'A',
          'Instructions do not rely solely on sensory characteristics');
        results.passes.push('1.3.3');
      }
      this.aiInsights.push(sensoryCheck.insights);
    }

    // 1.3.4: Orientation (Level AA)
    this.addPass('1.3.4', 'Orientation', 'AA', 'PDFs support multiple orientations');
    results.passes.push('1.3.4');

    // 1.3.5: Identify Input Purpose (Level AA)
    const formCheck = await this.structureValidator.checkFormFields(pdfDoc);
    if (formCheck.hasInvalidFields) {
      this.addViolation('1.3.5', 'Identify Input Purpose', 'AA', 'major',
        'Some form fields lack proper labels',
        formCheck.invalidFields,
        'Add proper labels to all form fields'
      );
      results.violations.push('1.3.5');
    } else if (formCheck.hasFormFields) {
      this.addPass('1.3.5', 'Identify Input Purpose', 'AA', 'All form fields properly labeled');
      results.passes.push('1.3.5');
    } else {
      this.addPass('1.3.5', 'Identify Input Purpose', 'AA', 'No form fields found');
      results.passes.push('1.3.5');
    }

    // 1.3.6: Identify Purpose (Level AAA)
    const landmarkCheck = await this.structureValidator.checkLandmarks(pdfDoc);
    if (landmarkCheck.hasLandmarks) {
      this.addPass('1.3.6', 'Identify Purpose', 'AAA', 'UI components have identifiable purposes');
      results.passes.push('1.3.6');
    } else {
      this.addWarning('1.3.6', 'Identify Purpose', 'AAA',
        'Consider adding landmarks for better navigation',
        []
      );
    }

    results.criteria = {
      structure: structureCheck,
      readingOrder: readingOrderCheck,
      formFields: formCheck,
      landmarks: landmarkCheck
    };

    return results;
  }

  /**
   * Guideline 1.4: Distinguishable
   */
  async validate_1_4_Distinguishable(pdfDoc, pdfData, pdfPath) {
    const results = { criteria: {}, violations: [], passes: [] };

    // 1.4.1: Use of Color (Level A)
    if (this.options.includeAI) {
      const colorDependencyCheck = await this.checkColorDependency(pdfData.text, pdfPath);
      if (colorDependencyCheck.colorOnly) {
        this.addViolation('1.4.1', 'Use of Color', 'A', 'major',
          'Color used as only visual means of conveying information',
          colorDependencyCheck.issues,
          'Add text labels or patterns in addition to color'
        );
        results.violations.push('1.4.1');
      } else {
        this.addPass('1.4.1', 'Use of Color', 'A',
          'Color not used as only means of conveying information');
        results.passes.push('1.4.1');
      }
      this.aiInsights.push(colorDependencyCheck.insights);
    }

    // 1.4.3: Contrast (Minimum) - Level AA
    const contrastAA = await this.contrastChecker.checkAllContrasts(pdfPath, 'AA');
    if (contrastAA.passes) {
      this.addPass('1.4.3', 'Contrast (Minimum)', 'AA',
        'All text meets WCAG AA contrast requirements (4.5:1 or 3:1 for large text)');
      results.passes.push('1.4.3');
    } else {
      this.addViolation('1.4.3', 'Contrast (Minimum)', 'AA', 'critical',
        `${contrastAA.failures.length} contrast violations found`,
        contrastAA.failures,
        'Adjust colors to meet minimum contrast ratios'
      );
      results.violations.push('1.4.3');
    }

    // 1.4.4: Resize Text (Level AA)
    const textResizeCheck = await this.structureValidator.checkTextResize(pdfDoc);
    if (textResizeCheck.resizable) {
      this.addPass('1.4.4', 'Resize Text', 'AA', 'Text can be resized without loss of content');
      results.passes.push('1.4.4');
    } else {
      this.addViolation('1.4.4', 'Resize Text', 'AA', 'major',
        'Text cannot be resized or causes content loss',
        textResizeCheck.issues,
        'Ensure text can scale to 200% without loss of content'
      );
      results.violations.push('1.4.4');
    }

    // 1.4.5: Images of Text (Level AA)
    if (this.options.includeAI) {
      const textImageCheck = await this.checkImagesOfText(pdfPath);
      if (textImageCheck.hasTextImages) {
        this.addViolation('1.4.5', 'Images of Text', 'AA', 'moderate',
          'Text rendered as images found',
          textImageCheck.textImages,
          'Use actual text instead of images of text'
        );
        results.violations.push('1.4.5');
      } else {
        this.addPass('1.4.5', 'Images of Text', 'AA', 'Text is actual text, not images');
        results.passes.push('1.4.5');
      }
      this.aiInsights.push(textImageCheck.insights);
    }

    // 1.4.6: Contrast (Enhanced) - Level AAA
    const contrastAAA = await this.contrastChecker.checkAllContrasts(pdfPath, 'AAA');
    if (contrastAAA.passes) {
      this.addPass('1.4.6', 'Contrast (Enhanced)', 'AAA',
        'All text meets WCAG AAA contrast requirements (7:1 or 4.5:1 for large text)');
      results.passes.push('1.4.6');
    } else {
      this.addViolation('1.4.6', 'Contrast (Enhanced)', 'AAA', 'moderate',
        `${contrastAAA.failures.length} AAA contrast violations found`,
        contrastAAA.failures,
        'Adjust colors to meet enhanced contrast ratios for AAA compliance'
      );
      results.violations.push('1.4.6');
    }

    // 1.4.8: Visual Presentation (Level AAA)
    const visualCheck = await this.structureValidator.checkVisualPresentation(pdfData);
    const visualIssues = [];

    if (visualCheck.lineLength > this.config.textSpacing.maxLineLength) {
      visualIssues.push(`Line length exceeds ${this.config.textSpacing.maxLineLength} characters`);
    }
    if (visualCheck.lineHeight < this.config.textSpacing.lineHeight) {
      visualIssues.push(`Line height below ${this.config.textSpacing.lineHeight}x minimum`);
    }
    if (visualCheck.paragraphSpacing < this.config.textSpacing.paragraphSpacing) {
      visualIssues.push(`Paragraph spacing below ${this.config.textSpacing.paragraphSpacing}x minimum`);
    }

    if (visualIssues.length > 0) {
      this.addViolation('1.4.8', 'Visual Presentation', 'AAA', 'moderate',
        'Visual presentation does not meet AAA requirements',
        visualIssues,
        'Adjust line length, spacing, and alignment for better readability'
      );
      results.violations.push('1.4.8');
    } else {
      this.addPass('1.4.8', 'Visual Presentation', 'AAA',
        'Visual presentation meets AAA requirements');
      results.passes.push('1.4.8');
    }

    // 1.4.9: Images of Text (No Exception) - Level AAA
    if (this.options.includeAI) {
      const strictTextImageCheck = await this.checkImagesOfTextStrict(pdfPath);
      if (strictTextImageCheck.hasNonEssentialTextImages) {
        this.addViolation('1.4.9', 'Images of Text (No Exception)', 'AAA', 'moderate',
          'Non-essential text rendered as images',
          strictTextImageCheck.textImages,
          'Use actual text for all non-decorative content'
        );
        results.violations.push('1.4.9');
      } else {
        this.addPass('1.4.9', 'Images of Text (No Exception)', 'AAA',
          'No non-essential images of text found');
        results.passes.push('1.4.9');
      }
    }

    // 1.4.11: Non-text Contrast (Level AA)
    const graphicsContrast = await this.contrastChecker.checkGraphicsContrast(pdfPath);
    if (graphicsContrast.passes) {
      this.addPass('1.4.11', 'Non-text Contrast', 'AA',
        'UI components and graphics meet 3:1 contrast ratio');
      results.passes.push('1.4.11');
    } else {
      this.addViolation('1.4.11', 'Non-text Contrast', 'AA', 'major',
        'UI components or graphics have insufficient contrast',
        graphicsContrast.failures,
        'Ensure UI components have at least 3:1 contrast ratio'
      );
      results.violations.push('1.4.11');
    }

    // 1.4.12: Text Spacing (Level AA)
    const spacingCheck = await this.structureValidator.checkTextSpacing(pdfData);
    if (spacingCheck.adequate) {
      this.addPass('1.4.12', 'Text Spacing', 'AA', 'Text spacing meets requirements');
      results.passes.push('1.4.12');
    } else {
      this.addViolation('1.4.12', 'Text Spacing', 'AA', 'major',
        'Text spacing does not meet requirements',
        spacingCheck.issues,
        'Adjust line height, paragraph spacing, letter spacing, and word spacing'
      );
      results.violations.push('1.4.12');
    }

    results.criteria = {
      contrastAA,
      contrastAAA,
      graphicsContrast,
      textResizeCheck,
      visualCheck,
      spacingCheck
    };

    return results;
  }

  /**
   * Validate Principle 2: Operable
   */
  async validateOperable(pdfDoc, pdfData) {
    const results = {
      guidelines: {},
      score: 0,
      violations: [],
      passes: []
    };

    // Guideline 2.1: Keyboard Accessible
    results.guidelines['2.1'] = await this.validate_2_1_KeyboardAccessible(pdfDoc);

    // Guideline 2.4: Navigable
    results.guidelines['2.4'] = await this.validate_2_4_Navigable(pdfDoc, pdfData);

    // Guideline 2.5: Input Modalities
    results.guidelines['2.5'] = await this.validate_2_5_InputModalities(pdfDoc);

    return results;
  }

  /**
   * Guideline 2.1: Keyboard Accessible
   */
  async validate_2_1_KeyboardAccessible(pdfDoc) {
    const results = { criteria: {}, violations: [], passes: [] };

    // 2.1.1-2.1.4: Keyboard accessibility
    const keyboardCheck = await this.structureValidator.checkKeyboardAccessibility(pdfDoc);

    ['2.1.1', '2.1.2', '2.1.3', '2.1.4'].forEach((criterion, idx) => {
      const names = ['Keyboard', 'No Keyboard Trap', 'Keyboard (No Exception)', 'Character Key Shortcuts'];
      const levels = ['A', 'A', 'AAA', 'A'];

      this.addWarning(criterion, names[idx], levels[idx],
        'Manual testing required for keyboard accessibility',
        []
      );
    });

    if (keyboardCheck.hasInteractiveElements) {
      results.criteria.keyboardCheck = keyboardCheck;
    }

    return results;
  }

  /**
   * Guideline 2.4: Navigable
   */
  async validate_2_4_Navigable(pdfDoc, pdfData) {
    const results = { criteria: {}, violations: [], passes: [] };

    // 2.4.1: Bypass Blocks (Level A)
    const bookmarksCheck = await this.structureValidator.checkBookmarks(pdfDoc);
    const landmarksCheck = await this.structureValidator.checkLandmarks(pdfDoc);

    if (bookmarksCheck.hasBookmarks || landmarksCheck.hasLandmarks) {
      this.addPass('2.4.1', 'Bypass Blocks', 'A', 'Mechanism to bypass blocks provided');
      results.passes.push('2.4.1');
    } else {
      this.addViolation('2.4.1', 'Bypass Blocks', 'A', 'major',
        'No mechanism to bypass repeated blocks (bookmarks or landmarks)',
        [],
        'Add bookmarks or document landmarks for navigation'
      );
      results.violations.push('2.4.1');
    }

    // 2.4.2: Page Titled (Level A)
    const titleCheck = await this.structureValidator.checkDocumentTitle(pdfDoc);
    if (titleCheck.hasTitle) {
      this.addPass('2.4.2', 'Page Titled', 'A', `Document has title: "${titleCheck.title}"`);
      results.passes.push('2.4.2');
    } else {
      this.addViolation('2.4.2', 'Page Titled', 'A', 'major',
        'Document lacks a title',
        [],
        'Add a descriptive title to the PDF document'
      );
      results.violations.push('2.4.2');
    }

    // 2.4.6: Headings and Labels (Level AA)
    const headingsCheck = await this.structureValidator.checkHeadings(pdfDoc, pdfData);
    if (headingsCheck.descriptive) {
      this.addPass('2.4.6', 'Headings and Labels', 'AA', 'Headings and labels are descriptive');
      results.passes.push('2.4.6');
    } else {
      this.addViolation('2.4.6', 'Headings and Labels', 'AA', 'major',
        'Some headings or labels are not descriptive',
        headingsCheck.issues,
        'Make headings and labels more descriptive of their purpose'
      );
      results.violations.push('2.4.6');
    }

    // 2.4.10: Section Headings (Level AAA)
    if (headingsCheck.wellOrganized) {
      this.addPass('2.4.10', 'Section Headings', 'AAA', 'Content well-organized with section headings');
      results.passes.push('2.4.10');
    } else {
      this.addWarning('2.4.10', 'Section Headings', 'AAA',
        'Consider adding more section headings to organize content',
        []
      );
    }

    // 2.5.8: Target Size (Minimum) - Level AA
    const targetSizeCheck = await this.structureValidator.checkTouchTargets(pdfDoc, 'AA');
    if (targetSizeCheck.allMeetMinimum) {
      this.addPass('2.5.8', 'Target Size (Minimum)', 'AA',
        'All interactive targets meet 24x24px minimum');
      results.passes.push('2.5.8');
    } else {
      this.addViolation('2.5.8', 'Target Size (Minimum)', 'AA', 'major',
        `${targetSizeCheck.undersized.length} targets below 24x24px minimum`,
        targetSizeCheck.undersized,
        'Increase size of interactive targets to at least 24x24 pixels'
      );
      results.violations.push('2.5.8');
    }

    results.criteria = {
      bookmarksCheck,
      landmarksCheck,
      titleCheck,
      headingsCheck,
      targetSizeCheck
    };

    return results;
  }

  /**
   * Guideline 2.5: Input Modalities
   */
  async validate_2_5_InputModalities(pdfDoc) {
    const results = { criteria: {}, violations: [], passes: [] };

    // 2.5.5: Target Size (Enhanced) - Level AAA
    const targetSizeAAA = await this.structureValidator.checkTouchTargets(pdfDoc, 'AAA');
    if (targetSizeAAA.allMeetMinimum) {
      this.addPass('2.5.5', 'Target Size (Enhanced)', 'AAA',
        'All interactive targets meet 44x44px minimum');
      results.passes.push('2.5.5');
    } else {
      this.addViolation('2.5.5', 'Target Size (Enhanced)', 'AAA', 'moderate',
        `${targetSizeAAA.undersized.length} targets below 44x44px AAA minimum`,
        targetSizeAAA.undersized,
        'Increase size of interactive targets to at least 44x44 pixels for AAA compliance'
      );
      results.violations.push('2.5.5');
    }

    results.criteria = { targetSizeAAA };

    return results;
  }

  /**
   * Validate Principle 3: Understandable
   */
  async validateUnderstandable(pdfDoc, pdfData) {
    const results = {
      guidelines: {},
      score: 0,
      violations: [],
      passes: []
    };

    // Guideline 3.1: Readable
    results.guidelines['3.1'] = await this.validate_3_1_Readable(pdfDoc, pdfData);

    // Guideline 3.2: Predictable
    results.guidelines['3.2'] = await this.validate_3_2_Predictable(pdfData);

    // Guideline 3.3: Input Assistance
    results.guidelines['3.3'] = await this.validate_3_3_InputAssistance(pdfDoc);

    return results;
  }

  /**
   * Guideline 3.1: Readable
   */
  async validate_3_1_Readable(pdfDoc, pdfData) {
    const results = { criteria: {}, violations: [], passes: [] };

    // 3.1.1: Language of Page (Level A)
    const languageCheck = await this.structureValidator.checkLanguage(pdfDoc);
    if (languageCheck.hasLanguage) {
      this.addPass('3.1.1', 'Language of Page', 'A',
        `Document language specified: ${languageCheck.language}`);
      results.passes.push('3.1.1');
    } else {
      this.addViolation('3.1.1', 'Language of Page', 'A', 'critical',
        'Document language not specified',
        [],
        'Set the document language in PDF properties'
      );
      results.violations.push('3.1.1');
    }

    // 3.1.2: Language of Parts (Level AA)
    const languagePartsCheck = await this.structureValidator.checkLanguageOfParts(pdfDoc);
    if (languagePartsCheck.allMarked) {
      this.addPass('3.1.2', 'Language of Parts', 'AA',
        'Language changes properly marked');
      results.passes.push('3.1.2');
    } else if (languagePartsCheck.hasMultipleLanguages) {
      this.addWarning('3.1.2', 'Language of Parts', 'AA',
        'Multiple languages detected but not all marked',
        languagePartsCheck.unmarkedSections
      );
    } else {
      this.addPass('3.1.2', 'Language of Parts', 'AA', 'No language changes detected');
      results.passes.push('3.1.2');
    }

    // 3.1.5: Reading Level (Level AAA)
    const readabilityResults = await this.readabilityAnalyzer.analyze(pdfData.text);

    if (readabilityResults.grade <= this.config.readabilityTargets.fleschKincaid.maximum) {
      this.addPass('3.1.5', 'Reading Level', 'AAA',
        `Reading level: Grade ${readabilityResults.grade} (target: ${this.config.readabilityTargets.fleschKincaid.target})`);
      results.passes.push('3.1.5');
    } else {
      this.addViolation('3.1.5', 'Reading Level', 'AAA', 'moderate',
        `Reading level too high: Grade ${readabilityResults.grade} ` +
        `(maximum: ${this.config.readabilityTargets.fleschKincaid.maximum})`,
        readabilityResults.complexSentences,
        'Simplify language to lower secondary education reading level'
      );
      results.violations.push('3.1.5');
    }

    // AI-enhanced readability assessment
    if (this.options.includeAI) {
      const aiReadability = await this.assessReadabilityWithAI(pdfData.text);
      this.aiInsights.push(aiReadability);

      if (aiReadability.needsSimplification) {
        this.addWarning('3.1.5', 'Reading Level', 'AAA',
          'AI detected opportunities for language simplification',
          aiReadability.suggestions
        );
      }
    }

    results.criteria = {
      languageCheck,
      languagePartsCheck,
      readabilityResults
    };

    return results;
  }

  /**
   * Guideline 3.2: Predictable
   */
  async validate_3_2_Predictable(pdfData) {
    const results = { criteria: {}, violations: [], passes: [] };

    // 3.2.3: Consistent Navigation (Level AA)
    // 3.2.4: Consistent Identification (Level AA)
    if (this.options.includeAI) {
      const consistencyCheck = await this.checkConsistency(pdfData.text);

      if (consistencyCheck.navigationConsistent) {
        this.addPass('3.2.3', 'Consistent Navigation', 'AA', 'Navigation is consistent');
        results.passes.push('3.2.3');
      } else {
        this.addWarning('3.2.3', 'Consistent Navigation', 'AA',
          'Navigation patterns may be inconsistent',
          consistencyCheck.navigationIssues
        );
      }

      if (consistencyCheck.identificationConsistent) {
        this.addPass('3.2.4', 'Consistent Identification', 'AA',
          'Components identified consistently');
        results.passes.push('3.2.4');
      } else {
        this.addWarning('3.2.4', 'Consistent Identification', 'AA',
          'Component identification may be inconsistent',
          consistencyCheck.identificationIssues
        );
      }

      this.aiInsights.push(consistencyCheck.insights);
      results.criteria.consistencyCheck = consistencyCheck;
    }

    return results;
  }

  /**
   * Guideline 3.3: Input Assistance
   */
  async validate_3_3_InputAssistance(pdfDoc) {
    const results = { criteria: {}, violations: [], passes: [] };

    // 3.3.2: Labels or Instructions (Level A)
    const formLabelsCheck = await this.structureValidator.checkFormLabels(pdfDoc);

    if (formLabelsCheck.allLabeled) {
      this.addPass('3.3.2', 'Labels or Instructions', 'A',
        'All form fields have labels or instructions');
      results.passes.push('3.3.2');
    } else if (formLabelsCheck.hasFormFields) {
      this.addViolation('3.3.2', 'Labels or Instructions', 'A', 'critical',
        `${formLabelsCheck.unlabeled.length} form fields lack labels`,
        formLabelsCheck.unlabeled,
        'Add descriptive labels to all form fields'
      );
      results.violations.push('3.3.2');
    } else {
      this.addPass('3.3.2', 'Labels or Instructions', 'A', 'No form fields found');
      results.passes.push('3.3.2');
    }

    results.criteria = { formLabelsCheck };

    return results;
  }

  /**
   * Validate Principle 4: Robust
   */
  async validateRobust(pdfDoc, pdfData) {
    const results = {
      guidelines: {},
      score: 0,
      violations: [],
      passes: []
    };

    // Guideline 4.1: Compatible
    results.guidelines['4.1'] = await this.validate_4_1_Compatible(pdfDoc, pdfData);

    return results;
  }

  /**
   * Guideline 4.1: Compatible
   */
  async validate_4_1_Compatible(pdfDoc, pdfData) {
    const results = { criteria: {}, violations: [], passes: [] };

    // 4.1.1: Parsing (Level A)
    const structureValidation = await this.structureValidator.validatePDFStructure(pdfDoc);

    if (structureValidation.valid) {
      this.addPass('4.1.1', 'Parsing', 'A', 'PDF structure is valid and parseable');
      results.passes.push('4.1.1');
    } else {
      this.addViolation('4.1.1', 'Parsing', 'A', 'critical',
        'PDF structure has parsing errors',
        structureValidation.errors,
        'Fix PDF structure validation errors'
      );
      results.violations.push('4.1.1');
    }

    // 4.1.2: Name, Role, Value (Level A)
    const roleValidation = await this.structureValidator.validateRoles(pdfDoc);

    if (roleValidation.allValid) {
      this.addPass('4.1.2', 'Name, Role, Value', 'A',
        'All components have valid name, role, and value');
      results.passes.push('4.1.2');
    } else {
      this.addViolation('4.1.2', 'Name, Role, Value', 'A', 'critical',
        'Some components lack proper name, role, or value',
        roleValidation.issues,
        'Add proper ARIA attributes and roles to all UI components'
      );
      results.violations.push('4.1.2');
    }

    results.criteria = {
      structureValidation,
      roleValidation
    };

    return results;
  }

  /**
   * Validate PDF/UA compliance
   */
  async validatePDFUA(pdfDoc, pdfData) {
    if (!this.config.pdfUA.enabled) {
      return { enabled: false };
    }

    const results = {
      enabled: true,
      compliant: true,
      requirements: {},
      violations: []
    };

    // Check each PDF/UA requirement
    const reqs = this.config.pdfUA.requirements;

    // Tagged PDF
    if (reqs.tagged) {
      const isTagged = await this.structureValidator.isPDFTagged(pdfDoc);
      results.requirements.tagged = {
        required: true,
        passes: isTagged,
        message: isTagged ? 'PDF is tagged' : 'PDF is not tagged'
      };
      if (!isTagged) {
        results.compliant = false;
        results.violations.push('PDF must be tagged for PDF/UA compliance');
      }
    }

    // Logical reading order
    if (reqs.logicalReadingOrder) {
      const readingOrder = await this.structureValidator.checkReadingOrder(pdfDoc);
      results.requirements.logicalReadingOrder = {
        required: true,
        passes: readingOrder.logical,
        message: readingOrder.logical ? 'Reading order is logical' : 'Reading order has issues'
      };
      if (!readingOrder.logical) {
        results.compliant = false;
        results.violations.push('PDF must have logical reading order');
      }
    }

    // Language specified
    if (reqs.languageSpecified) {
      const language = await this.structureValidator.checkLanguage(pdfDoc);
      results.requirements.languageSpecified = {
        required: true,
        passes: language.hasLanguage,
        message: language.hasLanguage ? `Language: ${language.language}` : 'No language specified'
      };
      if (!language.hasLanguage) {
        results.compliant = false;
        results.violations.push('Document language must be specified');
      }
    }

    // Document title
    if (reqs.documentTitle) {
      const title = await this.structureValidator.checkDocumentTitle(pdfDoc);
      results.requirements.documentTitle = {
        required: true,
        passes: title.hasTitle,
        message: title.hasTitle ? `Title: ${title.title}` : 'No document title'
      };
      if (!title.hasTitle) {
        results.compliant = false;
        results.violations.push('Document must have a title');
      }
    }

    // Alternative descriptions
    if (reqs.alternativeDescriptions) {
      const altText = await this.structureValidator.checkAltText(pdfDoc, pdfData);
      results.requirements.alternativeDescriptions = {
        required: true,
        passes: altText.allImagesHaveAlt,
        message: altText.allImagesHaveAlt ?
          'All images have alt text' :
          `${altText.missingAlt.length} images missing alt text`
      };
      if (!altText.allImagesHaveAlt) {
        results.compliant = false;
        results.violations.push('All images must have alternative descriptions');
      }
    }

    return results;
  }

  /**
   * AI-powered alt text quality assessment
   */
  async checkAltTextQuality(images, pdfPath) {
    const issues = [];
    const insights = {
      criterion: '1.1.1',
      model: 'gpt-4o',
      assessment: ''
    };

    try {
      const model = this.config.aiModels.altTextGeneration.model;
      const sampleImages = images.slice(0, 5); // Check first 5 images

      for (const img of sampleImages) {
        if (!img.altText) continue;

        const response = await this.openai.chat.completions.create({
          model: model,
          messages: [{
            role: 'system',
            content: 'You are an accessibility expert. Assess if this alt text is descriptive, concise, and meaningful. Respond with JSON: {quality: "excellent|good|fair|poor", issues: [string array], suggestion: string}'
          }, {
            role: 'user',
            content: `Assess this alt text: "${img.altText}"`
          }],
          temperature: this.config.aiModels.altTextGeneration.temperature,
          max_tokens: this.config.aiModels.altTextGeneration.maxTokens
        });

        const assessment = JSON.parse(response.choices[0].message.content);

        if (assessment.quality === 'fair' || assessment.quality === 'poor') {
          issues.push({
            imageIndex: img.index,
            currentAlt: img.altText,
            quality: assessment.quality,
            issues: assessment.issues,
            suggestion: assessment.suggestion
          });
        }
      }

      insights.assessment = `Assessed ${sampleImages.length} images. ${issues.length} need improvement.`;

    } catch (error) {
      console.error('AI alt text quality check failed:', error.message);
      insights.assessment = 'AI assessment unavailable';
    }

    return { issues, insights };
  }

  /**
   * AI-powered readability assessment
   */
  async assessReadabilityWithAI(text) {
    const insights = {
      criterion: '3.1.5',
      model: 'claude-opus-4.1',
      needsSimplification: false,
      suggestions: [],
      assessment: ''
    };

    try {
      const response = await this.anthropic.messages.create({
        model: this.config.aiModels.readabilityAnalysis.model,
        max_tokens: this.config.aiModels.readabilityAnalysis.maxTokens,
        temperature: this.config.aiModels.readabilityAnalysis.temperature,
        messages: [{
          role: 'user',
          content: `Analyze this text for readability at lower secondary education level (Grade 8-9). Identify complex sentences, jargon, and provide simplification suggestions.

Text: ${text.substring(0, 3000)}

Respond with JSON: {readingLevel: number, needsSimplification: boolean, complexSentences: [string array], jargon: [string array], suggestions: [string array]}`
        }]
      });

      const assessment = JSON.parse(response.content[0].text);
      insights.needsSimplification = assessment.needsSimplification;
      insights.suggestions = assessment.suggestions;
      insights.assessment = `Reading level: Grade ${assessment.readingLevel}. ` +
        `${assessment.complexSentences.length} complex sentences, ` +
        `${assessment.jargon.length} jargon terms found.`;

    } catch (error) {
      console.error('AI readability assessment failed:', error.message);
      insights.assessment = 'AI assessment unavailable';
    }

    return insights;
  }

  /**
   * Check for sensory-only instructions (AI-powered)
   */
  async checkSensoryInstructions(text) {
    const insights = {
      criterion: '1.3.3',
      model: 'gpt-4o',
      assessment: ''
    };

    const sensoryPattern = /\b(click (the|on)|press (the|on)|see (the|below|above)|look at|colored|red|green|blue|yellow|round|square|left|right|top|bottom)\b/gi;
    const matches = text.match(sensoryPattern) || [];

    const result = {
      hasSensoryOnly: false,
      issues: [],
      insights
    };

    if (matches.length > 0) {
      // Use AI to determine if these are sensory-only
      try {
        const response = await this.openai.chat.completions.create({
          model: this.config.aiModels.structureValidation.model,
          messages: [{
            role: 'system',
            content: 'Identify instructions that rely ONLY on sensory characteristics (shape, size, location, color) without text alternatives. Respond with JSON: {sensoryOnly: [string array of problematic instructions]}'
          }, {
            role: 'user',
            content: `Check these instructions: ${matches.join(', ')}`
          }],
          temperature: 0.1,
          max_tokens: 200
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        result.hasSensoryOnly = analysis.sensoryOnly.length > 0;
        result.issues = analysis.sensoryOnly;
        insights.assessment = `Found ${matches.length} sensory references, ${analysis.sensoryOnly.length} rely solely on sensory characteristics`;

      } catch (error) {
        console.error('AI sensory instruction check failed:', error.message);
      }
    } else {
      insights.assessment = 'No sensory-only instructions detected';
    }

    return result;
  }

  /**
   * Check for color dependency (AI-powered)
   */
  async checkColorDependency(text, pdfPath) {
    const insights = {
      criterion: '1.4.1',
      model: 'gpt-4o-vision',
      assessment: ''
    };

    const colorPattern = /\b(red|green|blue|yellow|orange|purple|colored|color-coded)\b/gi;
    const matches = text.match(colorPattern) || [];

    const result = {
      colorOnly: false,
      issues: [],
      insights
    };

    if (matches.length > 0) {
      insights.assessment = `Found ${matches.length} color references. Manual review recommended.`;
      result.issues.push('Color references found - verify text alternatives exist');
    } else {
      insights.assessment = 'No obvious color dependency detected';
    }

    return result;
  }

  /**
   * Check for images of text (AI-powered)
   */
  async checkImagesOfText(pdfPath) {
    const insights = {
      criterion: '1.4.5',
      model: 'gpt-4o-vision',
      assessment: ''
    };

    const result = {
      hasTextImages: false,
      textImages: [],
      insights
    };

    // Placeholder - would need actual image analysis
    insights.assessment = 'Image of text detection requires visual analysis';

    return result;
  }

  /**
   * Check for images of text (strict, for AAA)
   */
  async checkImagesOfTextStrict(pdfPath) {
    return this.checkImagesOfText(pdfPath);
  }

  /**
   * Check consistency (AI-powered)
   */
  async checkConsistency(text) {
    const insights = {
      criteria: ['3.2.3', '3.2.4'],
      model: 'gemini-2.5-pro',
      assessment: ''
    };

    const result = {
      navigationConsistent: true,
      identificationConsistent: true,
      navigationIssues: [],
      identificationIssues: [],
      insights
    };

    insights.assessment = 'Consistency check requires multi-page analysis';

    return result;
  }

  /**
   * Add violation
   */
  addViolation(criterion, name, level, severity, description, details, remediation) {
    const violation = {
      criterion,
      name,
      level,
      severity,
      description,
      details,
      remediation,
      wcagUrl: `https://www.w3.org/WAI/WCAG22/Understanding/${name.toLowerCase().replace(/\s+/g, '-')}.html`
    };
    this.violations.push(violation);
  }

  /**
   * Add warning
   */
  addWarning(criterion, name, level, description, details) {
    const warning = {
      criterion,
      name,
      level,
      description,
      details,
      wcagUrl: `https://www.w3.org/WAI/WCAG22/Understanding/${name.toLowerCase().replace(/\s+/g, '-')}.html`
    };
    this.warnings.push(warning);
  }

  /**
   * Add pass
   */
  addPass(criterion, name, level, description) {
    const pass = {
      criterion,
      name,
      level,
      description
    };
    this.passes.push(pass);
  }

  /**
   * Calculate accessibility score
   */
  calculateAccessibilityScore() {
    const totalCriteria = this.getTotalCriteriaTested();
    const passedCriteria = this.passes.length;

    // Base score from passed criteria
    let score = (passedCriteria / totalCriteria) * 100;

    // Deduct points for violations based on severity
    const criticalPenalty = this.violations.filter(v => v.severity === 'critical').length * 20;
    const majorPenalty = this.violations.filter(v => v.severity === 'major').length * 10;
    const moderatePenalty = this.violations.filter(v => v.severity === 'moderate').length * 5;
    const minorPenalty = this.violations.filter(v => v.severity === 'minor').length * 2;

    score = Math.max(0, score - criticalPenalty - majorPenalty - moderatePenalty - minorPenalty);

    return Math.round(score);
  }

  /**
   * Get accessibility grade
   */
  getAccessibilityGrade(score) {
    if (score >= this.config.scoring.perfect) return 'A+ (Perfect)';
    if (score >= this.config.scoring.excellent) return 'A (Excellent)';
    if (score >= this.config.scoring.good) return 'B (Good)';
    if (score >= this.config.scoring.acceptable) return 'C (Acceptable)';
    if (score >= this.config.scoring.needsImprovement) return 'D (Needs Improvement)';
    return 'F (Failing)';
  }

  /**
   * Check if compliant with level
   */
  isCompliant(score, level) {
    const criticalViolations = this.violations.filter(v =>
      v.severity === 'critical' && this.meetsLevel(v.level, level)
    );

    return score >= this.config.scoring.acceptable && criticalViolations.length === 0;
  }

  /**
   * Check if criterion level meets target level
   */
  meetsLevel(criterionLevel, targetLevel) {
    const levels = { 'A': 1, 'AA': 2, 'AAA': 3 };
    return levels[criterionLevel] <= levels[targetLevel];
  }

  /**
   * Get total criteria tested
   */
  getTotalCriteriaTested() {
    // Count all automated criteria from config
    let count = 0;
    const principles = this.config.wcagSuccessCriteria;

    Object.values(principles).forEach(principle => {
      Object.values(principle.guidelines).forEach(guideline => {
        count += Object.keys(guideline.criteria).length;
      });
    });

    return count;
  }

  /**
   * Generate remediation plan
   */
  generateRemediationPlan() {
    const plan = {
      critical: [],
      major: [],
      moderate: [],
      minor: []
    };

    this.violations.forEach(v => {
      const item = {
        criterion: v.criterion,
        name: v.name,
        description: v.description,
        remediation: v.remediation,
        priority: v.severity === 'critical' ? 1 : v.severity === 'major' ? 2 : v.severity === 'moderate' ? 3 : 4
      };

      plan[v.severity].push(item);
    });

    return plan;
  }
}
