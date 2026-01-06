/**
 * Accessibility System Test Suite
 * Tests all accessibility modules with sample PDF
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AccessibilityAnalyzer from '../accessibility/accessibilityAnalyzer.js';
import AltTextGenerator from '../accessibility/altTextGenerator.js';
import StructureTagging from '../accessibility/structureTagging.js';
import ReadingOrderOptimizer from '../accessibility/readingOrderOptimizer.js';
import ContrastChecker from '../accessibility/contrastChecker.js';
import WCAGValidator from '../accessibility/wcagValidator.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AccessibilityTest {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Run all accessibility tests
   */
  async runAll() {
    logger.section('Accessibility System Test Suite');

    try {
      // Find a test PDF
      const testPdf = this.findTestPDF();
      if (!testPdf) {
        logger.error('No test PDF found in exports/');
        return false;
      }

      logger.info(`Test PDF: ${path.basename(testPdf)}`);

      // Run tests
      await this.testAccessibilityAnalyzer(testPdf);
      await this.testContrastChecker(testPdf);
      await this.testReadingOrderOptimizer(testPdf);
      await this.testStructureTagging(testPdf);
      await this.testWCAGValidator(testPdf);
      await this.testAltTextGenerator(); // Separate test (doesn't need PDF)

      // Print summary
      this.printSummary();

      return this.failedTests === 0;

    } catch (error) {
      logger.error(`Test suite failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Test AccessibilityAnalyzer
   */
  async testAccessibilityAnalyzer(pdfPath) {
    logger.subsection('Test: AccessibilityAnalyzer');

    try {
      const analyzer = new AccessibilityAnalyzer(pdfPath);
      const result = await analyzer.analyze();

      // Validate result structure
      this.assert('Analysis has issues object', typeof result.issues === 'object');
      this.assert('Analysis has stats object', typeof result.stats === 'object');
      this.assert('Analysis has compliance object', typeof result.compliance === 'object');
      this.assert('Compliance has wcag22AA score', typeof result.compliance.wcag22AA === 'number');
      this.assert('Total issues is a number', typeof result.totalIssues === 'number');

      logger.success('AccessibilityAnalyzer test passed');

    } catch (error) {
      this.fail('AccessibilityAnalyzer test', error.message);
    }
  }

  /**
   * Test ContrastChecker
   */
  async testContrastChecker(pdfPath) {
    logger.subsection('Test: ContrastChecker');

    try {
      const checker = new ContrastChecker(pdfPath);
      const result = await checker.checkContrast();

      // Validate result
      this.assert('Contrast result has colorPairs', Array.isArray(result.colorPairs));
      this.assert('Contrast result has issues', Array.isArray(result.issues));
      this.assert('Contrast result has passRate', typeof result.passRate === 'number');

      // Test auto-fix
      if (result.issues.length > 0) {
        const fixes = checker.autoFixContrast();
        this.assert('Auto-fix returns array', Array.isArray(fixes));
      }

      // Test report generation
      const report = checker.generateReport();
      this.assert('Report has summary', typeof report.summary === 'object');

      logger.success('ContrastChecker test passed');

    } catch (error) {
      this.fail('ContrastChecker test', error.message);
    }
  }

  /**
   * Test ReadingOrderOptimizer
   */
  async testReadingOrderOptimizer(pdfPath) {
    logger.subsection('Test: ReadingOrderOptimizer');

    try {
      const optimizer = new ReadingOrderOptimizer(pdfPath);
      const result = await optimizer.optimizeReadingOrder();

      // Validate result
      this.assert('Result has readingOrder', typeof result.readingOrder === 'object');
      this.assert('Result has issues array', Array.isArray(result.issues));
      this.assert('Result has totalBlocks', typeof result.totalBlocks === 'number');

      logger.success('ReadingOrderOptimizer test passed');

    } catch (error) {
      this.fail('ReadingOrderOptimizer test', error.message);
    }
  }

  /**
   * Test StructureTagging
   */
  async testStructureTagging(pdfPath) {
    logger.subsection('Test: StructureTagging');

    try {
      const tagger = new StructureTagging(pdfPath);
      const result = await tagger.addStructureTags();

      // Validate result
      this.assert('Result has pdfBytes', Buffer.isBuffer(result.pdfBytes));
      this.assert('Result has tagCount', typeof result.tagCount === 'number');
      this.assert('Result has structure', typeof result.structure === 'object');

      logger.success('StructureTagging test passed');

    } catch (error) {
      this.fail('StructureTagging test', error.message);
    }
  }

  /**
   * Test WCAGValidator
   */
  async testWCAGValidator(pdfPath) {
    logger.subsection('Test: WCAGValidator');

    try {
      const validator = new WCAGValidator(pdfPath);
      const result = await validator.validate();

      // Validate result
      this.assert('Result has results object', typeof result.results === 'object');
      this.assert('Result has compliance object', typeof result.compliance === 'object');
      this.assert('Results has levelA array', Array.isArray(result.results.levelA));
      this.assert('Results has levelAA array', Array.isArray(result.results.levelAA));
      this.assert('Total criteria is 45', result.results.totalCriteria === 45);
      this.assert('Compliance has score', typeof result.compliance.score === 'number');
      this.assert('Compliance has grade', typeof result.compliance.grade === 'string');

      logger.success('WCAGValidator test passed');

    } catch (error) {
      this.fail('WCAGValidator test', error.message);
    }
  }

  /**
   * Test AltTextGenerator (without PDF)
   */
  async testAltTextGenerator() {
    logger.subsection('Test: AltTextGenerator');

    try {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        logger.warn('OPENAI_API_KEY not set - skipping alt text generation test');
        this.skip('AltTextGenerator test', 'API key not configured');
        return;
      }

      const generator = new AltTextGenerator(apiKey);

      // Test validation
      const validAltText = "Students collaborating in classroom";
      const validation = generator.validateAltText(validAltText);
      this.assert('Validation returns object', typeof validation === 'object');
      this.assert('Validation has score', typeof validation.score === 'number');
      this.assert('Valid alt text passes', validation.isValid === true);

      // Test bad alt text
      const badAltText = "image of something";
      const badValidation = generator.validateAltText(badAltText);
      this.assert('Bad alt text has issues', badValidation.issues.length > 0);

      // Test stats
      const stats = generator.getStats();
      this.assert('Stats is object', typeof stats === 'object');

      logger.success('AltTextGenerator test passed');

    } catch (error) {
      this.fail('AltTextGenerator test', error.message);
    }
  }

  /**
   * Find a test PDF in exports/
   */
  findTestPDF() {
    const exportsDir = path.join(__dirname, '..', '..', 'exports');

    if (!fs.existsSync(exportsDir)) {
      return null;
    }

    const files = fs.readdirSync(exportsDir);
    const pdfFiles = files.filter(f => f.endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      return null;
    }

    // Prefer -DIGITAL.pdf files
    const digitalPdf = pdfFiles.find(f => f.includes('-DIGITAL.pdf'));
    if (digitalPdf) {
      return path.join(exportsDir, digitalPdf);
    }

    // Otherwise use first PDF
    return path.join(exportsDir, pdfFiles[0]);
  }

  /**
   * Assert helper
   */
  assert(name, condition) {
    if (condition) {
      this.passedTests++;
      this.testResults.push({ name, status: 'PASS' });
      logger.debug(`✓ ${name}`);
    } else {
      this.failedTests++;
      this.testResults.push({ name, status: 'FAIL' });
      logger.error(`✗ ${name}`);
    }
  }

  /**
   * Fail helper
   */
  fail(name, error) {
    this.failedTests++;
    this.testResults.push({ name, status: 'FAIL', error });
    logger.error(`✗ ${name}: ${error}`);
  }

  /**
   * Skip helper
   */
  skip(name, reason) {
    this.testResults.push({ name, status: 'SKIP', reason });
    logger.warn(`⊘ ${name}: ${reason}`);
  }

  /**
   * Print test summary
   */
  printSummary() {
    logger.section('Test Summary');
    logger.info(`Total tests: ${this.passedTests + this.failedTests}`);
    logger.info(`Passed: ${this.passedTests}`);
    logger.info(`Failed: ${this.failedTests}`);

    if (this.failedTests === 0) {
      logger.success('All tests passed!');
    } else {
      logger.error(`${this.failedTests} test(s) failed`);
    }
  }
}

// Run tests
async function main() {
  const test = new AccessibilityTest();
  const success = await test.runAll();
  process.exit(success ? 0 : 1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export default AccessibilityTest;
