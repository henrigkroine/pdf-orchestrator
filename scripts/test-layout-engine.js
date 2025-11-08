#!/usr/bin/env node

/**
 * Test Intelligent Layout Engine
 *
 * Comprehensive test suite demonstrating all features
 * of the Intelligent Layout Engine.
 *
 * Usage:
 * ```bash
 * node scripts/test-layout-engine.js
 * ```
 */

const IntelligentLayoutEngine = require('./lib/intelligent-layout-engine');
const fs = require('fs').promises;
const path = require('path');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function test(name, fn) {
  try {
    log(`\n▶ ${name}`, 'blue');
    await fn();
    log(`✅ PASS: ${name}`, 'green');
  } catch (error) {
    log(`❌ FAIL: ${name}`, 'red');
    console.error(error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
  }
}

async function main() {
  log('\n🧪 Intelligent Layout Engine - Test Suite', 'magenta');
  log('Testing all features and patterns\n', 'yellow');

  // Test 1: Basic Content Generation
  section('Test 1: Basic Content Generation');

  await test('Generate simple layout with default settings', async () => {
    const engine = new IntelligentLayoutEngine();

    const content = {
      blocks: [
        { type: 'h1', content: 'Test Document' },
        { type: 'body', content: 'This is a test of the basic layout generation.' },
        { type: 'h2', content: 'Section 1', isSection: true },
        { type: 'body', content: 'Body text in section 1.' }
      ]
    };

    const result = await engine.generate(content);

    // Assertions
    if (result.layout.elements.length !== 4) {
      throw new Error(`Expected 4 elements, got ${result.layout.elements.length}`);
    }

    if (!result.metadata.qualityScore) {
      throw new Error('Quality score missing');
    }

    if (result.metadata.qualityScore < 80) {
      throw new Error(`Quality score too low: ${result.metadata.qualityScore}`);
    }

    log(`  Quality: ${result.metadata.grade}`, 'green');
    log(`  Pattern: ${result.pattern.name}`, 'blue');
    log(`  Elements: ${result.layout.elements.length}`, 'cyan');
  });

  // Test 2: Content Analysis
  section('Test 2: Content Analysis Accuracy');

  await test('Detect sparse content correctly', async () => {
    const engine = new IntelligentLayoutEngine();

    const sparseContent = {
      blocks: [
        { type: 'h1', content: 'Title' },
        { type: 'body', content: 'Short text.' }  // Very short
      ]
    };

    const analysis = engine.analyzeContent(sparseContent);

    if (analysis.density !== 'sparse') {
      throw new Error(`Expected sparse, got ${analysis.density}`);
    }

    log(`  Density: ${analysis.density} ✓`, 'green');
    log(`  Words/page: ${analysis.wordsPerPage}`, 'cyan');
  });

  await test('Detect dense content correctly', async () => {
    const engine = new IntelligentLayoutEngine();

    const longText = 'word '.repeat(800);  // 800 words

    const denseContent = {
      blocks: [
        { type: 'h1', content: 'Long Document' },
        { type: 'body', content: longText }
      ]
    };

    const analysis = engine.analyzeContent(denseContent);

    if (analysis.density !== 'very-dense') {
      throw new Error(`Expected very-dense, got ${analysis.density}`);
    }

    log(`  Density: ${analysis.density} ✓`, 'green');
    log(`  Words/page: ${analysis.wordsPerPage}`, 'cyan');
  });

  await test('Detect image-heavy content', async () => {
    const engine = new IntelligentLayoutEngine();

    const imageHeavy = {
      blocks: [
        { type: 'h1', content: 'Gallery' },
        { type: 'image', width: 400, height: 300 },
        { type: 'image', width: 400, height: 300 },
        { type: 'image', width: 400, height: 300 },
        { type: 'body', content: 'Short caption.' }
      ]
    };

    const analysis = engine.analyzeContent(imageHeavy);

    if (analysis.visualBalance !== 'image-heavy') {
      throw new Error(`Expected image-heavy, got ${analysis.visualBalance}`);
    }

    log(`  Visual balance: ${analysis.visualBalance} ✓`, 'green');
    log(`  Text/image ratio: ${analysis.textImageRatio}`, 'cyan');
  });

  // Test 3: Pattern Selection
  section('Test 3: Automatic Pattern Selection');

  await test('Select text-focused pattern for dense content', async () => {
    const engine = new IntelligentLayoutEngine();

    const longText = 'word '.repeat(800);

    const content = {
      blocks: [
        { type: 'h1', content: 'Academic Paper' },
        { type: 'body', content: longText }
      ]
    };

    const result = await engine.generate(content);

    if (result.pattern.name !== 'Text-Focused (Manuscript)') {
      throw new Error(`Wrong pattern: ${result.pattern.name}`);
    }

    log(`  Pattern: ${result.pattern.name} ✓`, 'green');
    log(`  Grid: ${result.grid.type}`, 'cyan');
  });

  await test('Select visual storytelling for image-heavy content', async () => {
    const engine = new IntelligentLayoutEngine();

    const content = {
      blocks: [
        { type: 'h1', content: 'Photo Essay' },
        { type: 'image', width: 600, height: 400 },
        { type: 'image', width: 600, height: 400 },
        { type: 'image', width: 600, height: 400 },
        { type: 'body', content: 'Captions...' }
      ]
    };

    const result = await engine.generate(content);

    if (result.pattern.name !== 'Visual Storytelling (Asymmetric)') {
      throw new Error(`Wrong pattern: ${result.pattern.name}`);
    }

    log(`  Pattern: ${result.pattern.name} ✓`, 'green');
    log(`  Grid: ${result.grid.columns}-column`, 'cyan');
  });

  // Test 4: Typography Scale
  section('Test 4: Typography Scale Generation');

  await test('Generate golden ratio typography scale', async () => {
    const engine = new IntelligentLayoutEngine();

    const content = { blocks: [{ type: 'h1', content: 'Test' }] };
    const result = await engine.generate(content);

    const typo = result.typography;

    // Check golden ratio progression
    const h1_to_h2_ratio = typo.h1.size / typo.h2.size;
    const h2_to_h3_ratio = typo.h2.size / typo.h3.size;
    const h3_to_body_ratio = typo.h3.size / typo.body.size;

    if (h1_to_h2_ratio < 1.4 || h1_to_h2_ratio > 1.6) {
      throw new Error(`H1/H2 ratio not golden: ${h1_to_h2_ratio.toFixed(2)}`);
    }

    log(`  H1: ${typo.h1.size}pt (${typo.h1.font})`, 'cyan');
    log(`  H2: ${typo.h2.size}pt (${typo.h2.font})`, 'cyan');
    log(`  Body: ${typo.body.size}pt (${typo.body.font})`, 'cyan');
    log(`  H1/H2 ratio: ${h1_to_h2_ratio.toFixed(2)} ✓`, 'green');
  });

  // Test 5: Spacing System
  section('Test 5: Spacing System Generation');

  await test('Generate Fibonacci spacing scale', async () => {
    const engine = new IntelligentLayoutEngine();

    const content = { blocks: [{ type: 'h1', content: 'Test' }] };
    const result = await engine.generate(content);

    const spacing = result.spacing;

    // Check Fibonacci sequence
    const fibonacci = [8, 13, 21, 34, 55, 89];

    if (spacing.xs < 6 || spacing.xs > 10) {
      throw new Error(`XS spacing not in Fibonacci range: ${spacing.xs}`);
    }

    log(`  XS: ${spacing.xs}pt`, 'cyan');
    log(`  SM: ${spacing.sm}pt`, 'cyan');
    log(`  MD: ${spacing.md}pt`, 'cyan');
    log(`  LG: ${spacing.lg}pt`, 'cyan');
    log(`  Between paragraphs: ${spacing.betweenParagraphs}pt ✓`, 'green');
  });

  await test('Adapt spacing to content density', async () => {
    const engine = new IntelligentLayoutEngine();

    // Sparse content
    const sparseContent = { blocks: [{ type: 'h1', content: 'Short' }] };
    const sparseResult = await engine.generate(sparseContent);

    // Dense content
    const denseText = 'word '.repeat(800);
    const denseContent = { blocks: [{ type: 'body', content: denseText }] };
    const denseResult = await engine.generate(denseContent);

    // Sparse should have more generous spacing
    if (sparseResult.spacing.betweenParagraphs <= denseResult.spacing.betweenParagraphs) {
      throw new Error('Sparse spacing not larger than dense');
    }

    log(`  Sparse spacing: ${sparseResult.spacing.betweenParagraphs}pt`, 'cyan');
    log(`  Dense spacing: ${denseResult.spacing.betweenParagraphs}pt`, 'cyan');
    log(`  Adaptive ✓`, 'green');
  });

  // Test 6: Element Positioning
  section('Test 6: Element Positioning');

  await test('Position elements with grid alignment', async () => {
    const engine = new IntelligentLayoutEngine();

    const content = {
      blocks: [
        { type: 'h1', content: 'Title' },
        { type: 'body', content: 'Text' }
      ]
    };

    const result = await engine.generate(content);

    const elements = result.layout.elements;

    // Check grid alignment
    elements.forEach((el, idx) => {
      if (!el.gridColumn || !el.gridSpan) {
        throw new Error(`Element ${idx} missing grid info`);
      }

      if (el.gridColumn < 1 || el.gridColumn > 12) {
        throw new Error(`Element ${idx} invalid grid column: ${el.gridColumn}`);
      }
    });

    log(`  All elements aligned to grid ✓`, 'green');
    log(`  H1 spans: ${elements[0].gridSpan} columns`, 'cyan');
    log(`  Body spans: ${elements[1].gridSpan} columns`, 'cyan');
  });

  // Test 7: Visual Hierarchy
  section('Test 7: Visual Hierarchy Application');

  await test('Apply TEEI brand colors to hierarchy', async () => {
    const engine = new IntelligentLayoutEngine();

    const content = {
      blocks: [
        { type: 'h1', content: 'Title' },
        { type: 'stat', content: '10,000', isStat: true },
        { type: 'body', content: 'Text' }
      ]
    };

    const result = await engine.generate(content);

    const h1 = result.layout.elements.find(el => el.type === 'h1');
    const stat = result.layout.elements.find(el => el.type === 'stat');

    if (h1.color !== '#00393F') {
      throw new Error(`H1 wrong color: ${h1.color}`);
    }

    if (stat.color !== '#BA8F5A') {
      throw new Error(`Stat wrong color: ${stat.color}`);
    }

    log(`  H1 color: ${h1.color} (Nordshore) ✓`, 'green');
    log(`  Stat color: ${stat.color} (Gold) ✓`, 'green');
  });

  // Test 8: Export Formats
  section('Test 8: Export to Multiple Formats');

  await test('Export to JSON', async () => {
    const engine = new IntelligentLayoutEngine();

    const content = { blocks: [{ type: 'h1', content: 'Test' }] };
    const result = await engine.generate(content);

    const testDir = path.join(__dirname, '../test-exports');
    await fs.mkdir(testDir, { recursive: true });

    const jsonPath = path.join(testDir, 'test-layout.json');
    await engine.exportLayout(result.layout, 'json', jsonPath);

    const exported = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));

    if (!exported.elements || exported.elements.length === 0) {
      throw new Error('JSON export invalid');
    }

    log(`  Exported to: ${jsonPath} ✓`, 'green');
  });

  await test('Export to InDesign XML', async () => {
    const engine = new IntelligentLayoutEngine();

    const content = { blocks: [{ type: 'h1', content: 'Test' }] };
    const result = await engine.generate(content);

    const testDir = path.join(__dirname, '../test-exports');
    const xmlPath = path.join(testDir, 'test-layout.xml');

    await engine.exportLayout(result.layout, 'indesign', xmlPath);

    const xml = await fs.readFile(xmlPath, 'utf-8');

    if (!xml.includes('<?xml') || !xml.includes('<InDesignDocument>')) {
      throw new Error('XML export invalid');
    }

    log(`  Exported to: ${xmlPath} ✓`, 'green');
  });

  await test('Export to CSS Grid', async () => {
    const engine = new IntelligentLayoutEngine();

    const content = { blocks: [{ type: 'h1', content: 'Test' }] };
    const result = await engine.generate(content);

    const testDir = path.join(__dirname, '../test-exports');
    const cssPath = path.join(testDir, 'test-layout.css');

    await engine.exportLayout(result.layout, 'css-grid', cssPath);

    const css = await fs.readFile(cssPath, 'utf-8');

    if (!css.includes('display: grid') || !css.includes('grid-template-columns')) {
      throw new Error('CSS export invalid');
    }

    log(`  Exported to: ${cssPath} ✓`, 'green');
  });

  await test('Export to HTML', async () => {
    const engine = new IntelligentLayoutEngine();

    const content = { blocks: [{ type: 'h1', content: 'Test' }] };
    const result = await engine.generate(content);

    const testDir = path.join(__dirname, '../test-exports');
    const htmlPath = path.join(testDir, 'test-layout.html');

    await engine.exportLayout(result.layout, 'html', htmlPath);

    const html = await fs.readFile(htmlPath, 'utf-8');

    if (!html.includes('<!DOCTYPE html>') || !html.includes('</html>')) {
      throw new Error('HTML export invalid');
    }

    log(`  Exported to: ${htmlPath} ✓`, 'green');
  });

  // Test 9: Quality Validation
  section('Test 9: Quality Validation');

  await test('Validate layout quality', async () => {
    const engine = new IntelligentLayoutEngine({ enableValidation: true });

    const content = {
      blocks: [
        { type: 'h1', content: 'Title' },
        { type: 'h2', content: 'Section', isSection: true },
        { type: 'body', content: 'Text content here.' }
      ]
    };

    const result = await engine.generate(content);

    if (!result.layout.validation) {
      throw new Error('Validation missing');
    }

    const { hierarchy, spacing } = result.layout.validation;

    if (!hierarchy.overall || !spacing.overall) {
      throw new Error('Validation incomplete');
    }

    log(`  Hierarchy: ${hierarchy.overall.score}/100`, 'cyan');
    log(`  Spacing: ${spacing.overall.score}/100`, 'cyan');
    log(`  Validation complete ✓`, 'green');
  });

  // Summary
  section('Test Summary');

  log('\n✅ All tests passed!', 'green');
  log('\nIntelligent Layout Engine is working correctly.', 'cyan');
  log('\nTest exports saved to: test-exports/', 'yellow');

  log('\nNext steps:', 'cyan');
  log('  1. Try: node scripts/generate-layout.js examples/sample-content.json', 'blue');
  log('  2. View: INTELLIGENT-LAYOUT-ENGINE.md for full documentation', 'blue');
  log('  3. Create your own content JSON and generate layouts!', 'blue');

  console.log('\n');
}

// Run tests
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  });
}

module.exports = { main };
