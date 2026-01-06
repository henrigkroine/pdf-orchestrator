/**
 * Test script for Advanced PDF Parser
 * Tests all extraction functions on real PDF
 */

import path from 'path';
import fs from 'fs';
import {
  extractTextBlocksWithBounds,
  extractColorsFromPDF,
  extractFontsFromPDF,
  extractPageDimensions,
  analyzePDF
} from './ai/utils/advancedPdfParser.js';

import logger from './ai/utils/logger.js';

// Test PDF path
const TEST_PDF = 'exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf';

/**
 * Test individual extraction functions
 */
async function testIndividualFunctions() {
  logger.section('Testing Individual Extraction Functions');

  // Test 1: Extract page dimensions
  logger.subsection('Test 1: Extract Page Dimensions');
  try {
    const dimensions = await extractPageDimensions(TEST_PDF);
    logger.success(`Extracted dimensions for ${dimensions.pageCount} pages`);
    dimensions.pages.forEach(p => {
      logger.info(`  Page ${p.page}: ${p.format} (${p.widthInches}" × ${p.heightInches}")`);
    });
  } catch (error) {
    logger.error(`Dimension extraction failed: ${error.message}`);
  }

  // Test 2: Extract text blocks
  logger.subsection('Test 2: Extract Text Blocks with Bounding Boxes');
  try {
    const textBlocks = await extractTextBlocksWithBounds(TEST_PDF);
    logger.success(`Extracted ${textBlocks.length} text blocks`);

    // Show sample text blocks from first page
    const page1Blocks = textBlocks.filter(b => b.page === 1).slice(0, 5);
    logger.info('Sample text blocks from page 1:');
    page1Blocks.forEach((block, i) => {
      logger.info(`  ${i + 1}. "${block.text.substring(0, 50)}..." at (${block.bbox.x}, ${block.bbox.y})`);
      logger.info(`     Size: ${block.bbox.width}×${block.bbox.height}, Font: ${block.fontSize}pt`);
    });

    // Text block statistics per page
    const blocksByPage = {};
    textBlocks.forEach(b => {
      if (!blocksByPage[b.page]) blocksByPage[b.page] = 0;
      blocksByPage[b.page]++;
    });

    logger.info('\nText blocks per page:');
    Object.keys(blocksByPage).sort((a, b) => a - b).forEach(page => {
      logger.info(`  Page ${page}: ${blocksByPage[page]} blocks`);
    });

  } catch (error) {
    logger.error(`Text extraction failed: ${error.message}`);
  }

  // Test 3: Extract colors
  logger.subsection('Test 3: Extract Colors');
  try {
    const colors = await extractColorsFromPDF(TEST_PDF);
    logger.success(`Extracted ${colors.length} unique colors`);

    // Show top 15 colors
    logger.info('Top 15 colors by usage:');
    colors.slice(0, 15).forEach((c, i) => {
      logger.info(`  ${i + 1}. ${c.color} - Used ${c.count}x for ${c.usage}`);
    });

    // Check for TEEI brand colors
    const teeiColors = {
      'Nordshore': '#00393F',
      'Sky': '#C9E4EC',
      'Sand': '#FFF1E2',
      'Beige': '#EFE1DC',
      'Moss': '#65873B',
      'Gold': '#BA8F5A',
      'Clay': '#913B2F'
    };

    logger.info('\nTEEI Brand Color Detection:');
    Object.entries(teeiColors).forEach(([name, hex]) => {
      const found = colors.find(c => c.color.toUpperCase() === hex.toUpperCase());
      if (found) {
        logger.success(`  ✓ ${name} (${hex}): Found (${found.count}x)`);
      } else {
        logger.warn(`  ✗ ${name} (${hex}): Not found`);
      }
    });

  } catch (error) {
    logger.error(`Color extraction failed: ${error.message}`);
  }

  // Test 4: Extract fonts
  logger.subsection('Test 4: Extract Fonts');
  try {
    const fonts = await extractFontsFromPDF(TEST_PDF);
    logger.success(`Extracted ${fonts.length} font+size combinations`);

    const uniqueFamilies = new Set(fonts.map(f => f.family));
    logger.info(`Unique font families: ${uniqueFamilies.size}`);

    // Group by font family
    const fontsByFamily = {};
    fonts.forEach(f => {
      if (!fontsByFamily[f.family]) {
        fontsByFamily[f.family] = [];
      }
      fontsByFamily[f.family].push(f);
    });

    logger.info('\nFonts by family:');
    Object.entries(fontsByFamily).forEach(([family, fontList]) => {
      const totalUsage = fontList.reduce((sum, f) => sum + f.usage_count, 0);
      logger.info(`  ${family}: ${fontList.length} sizes, ${totalUsage} total uses`);

      // Show sizes for this family
      fontList.slice(0, 5).forEach(f => {
        logger.info(`    - ${f.size}pt: ${f.usage_count}x on pages [${f.pages.join(', ')}]`);
      });
    });

    // Check for TEEI brand fonts
    logger.info('\nTEEI Brand Font Detection:');
    const hasLora = fonts.some(f => f.family.toLowerCase().includes('lora'));
    const hasRoboto = fonts.some(f => f.family.toLowerCase().includes('roboto'));

    if (hasLora) {
      logger.success('  ✓ Lora: Found (Headlines font)');
    } else {
      logger.warn('  ✗ Lora: Not found (should be used for headlines)');
    }

    if (hasRoboto) {
      logger.success('  ✓ Roboto/Roboto Flex: Found (Body text font)');
    } else {
      logger.warn('  ✗ Roboto/Roboto Flex: Not found (should be used for body text)');
    }

  } catch (error) {
    logger.error(`Font extraction failed: ${error.message}`);
  }
}

/**
 * Test comprehensive analysis function
 */
async function testComprehensiveAnalysis() {
  logger.section('Testing Comprehensive Analysis');

  try {
    const analysis = await analyzePDF(TEST_PDF);

    // Save results to JSON file
    const outputPath = 'exports/advanced-pdf-analysis-results.json';
    fs.writeFileSync(
      outputPath,
      JSON.stringify(analysis, null, 2),
      'utf8'
    );

    logger.success(`Complete analysis saved to: ${outputPath}`);

    // Display summary
    logger.subsection('Analysis Summary');
    Object.entries(analysis.summary).forEach(([key, value]) => {
      logger.info(`  ${key}: ${value}`);
    });

  } catch (error) {
    logger.error(`Comprehensive analysis failed: ${error.message}`);
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  logger.section('Testing Error Handling');

  // Test 1: Non-existent file
  logger.subsection('Test 1: Non-existent File');
  try {
    await extractPageDimensions('nonexistent.pdf');
    logger.error('Should have thrown error for non-existent file');
  } catch (error) {
    logger.success(`Correctly caught error: ${error.message}`);
  }

  // Test 2: Invalid PDF (if we had one)
  logger.subsection('Test 2: Invalid File Type');
  try {
    // Create a fake PDF file
    const fakePdfPath = 'exports/fake-test.pdf';
    fs.writeFileSync(fakePdfPath, 'This is not a PDF file');

    await extractPageDimensions(fakePdfPath);
    logger.error('Should have thrown error for invalid PDF');

    // Clean up
    fs.unlinkSync(fakePdfPath);
  } catch (error) {
    logger.success(`Correctly caught error: ${error.message}`);

    // Clean up
    if (fs.existsSync('exports/fake-test.pdf')) {
      fs.unlinkSync('exports/fake-test.pdf');
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  logger.section('Advanced PDF Parser Test Suite');
  logger.info(`Test PDF: ${TEST_PDF}`);

  // Verify test PDF exists
  if (!fs.existsSync(TEST_PDF)) {
    logger.error(`Test PDF not found: ${TEST_PDF}`);
    logger.info('Please ensure the test PDF exists before running tests');
    process.exit(1);
  }

  const startTime = Date.now();

  try {
    // Run test suites
    await testIndividualFunctions();
    await testComprehensiveAnalysis();
    await testErrorHandling();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    logger.section('Test Suite Complete');
    logger.success(`All tests completed in ${duration}s`);
    logger.info('Check exports/advanced-pdf-analysis-results.json for full results');

  } catch (error) {
    logger.error(`Test suite failed: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Run tests if called directly
runTests().catch(error => {
  logger.error(`Fatal error: ${error.message}`);
  process.exit(1);
});

export { runTests };
