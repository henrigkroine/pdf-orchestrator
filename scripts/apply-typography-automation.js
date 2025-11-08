#!/usr/bin/env node

/**
 * Typography Automation CLI
 *
 * Command-line tool to apply automatic typography to documents
 *
 * Usage:
 *   node apply-typography-automation.js <input-file> [options]
 *   node apply-typography-automation.js --example
 */

const TypographyAutomation = require('./lib/typography-automation');
const fs = require('fs').promises;
const path = require('path');

// Parse command-line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--example') || args.includes('-e')) {
  runExample();
  process.exit(0);
}

// Main execution
main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

async function main() {
  const inputFile = args[0];

  // Parse options
  const options = {
    output: getOption('--output', '-o') || inputFile.replace('.json', '-optimized.json'),
    preventCutoffs: !args.includes('--no-cutoffs'),
    autoLineHeight: !args.includes('--no-line-height'),
    autoTracking: !args.includes('--no-tracking'),
    exportCSS: args.includes('--css'),
    exportInDesign: args.includes('--indesign'),
    verbose: args.includes('--verbose') || args.includes('-v')
  };

  if (options.verbose) {
    console.log('📋 Options:', options);
  }

  // Load input file
  console.log(`📖 Loading: ${inputFile}`);
  const inputData = JSON.parse(await fs.readFile(inputFile, 'utf8'));

  // Validate input
  if (!inputData.elements || !Array.isArray(inputData.elements)) {
    throw new Error('Input file must contain "elements" array');
  }

  // Initialize automation
  const automation = new TypographyAutomation({
    preventCutoffs: options.preventCutoffs,
    autoLineHeight: options.autoLineHeight,
    autoTracking: options.autoTracking
  });

  // Apply automatic typography
  console.log(`\n🎨 Processing ${inputData.elements.length} elements...`);
  const result = await automation.applyAutomaticTypography(inputData.elements);

  // Display results
  console.log('\n📊 Results:');
  console.log(`  Elements processed: ${result.stats.elementsProcessed}`);
  console.log(`  Cutoffs prevented: ${result.stats.cutoffsPrevented}`);
  console.log(`  Sizes optimized: ${result.stats.sizesOptimized}`);
  console.log(`  Average confidence: ${result.summary.averageConfidence}%`);

  console.log('\n📐 Hierarchy Distribution:');
  Object.entries(result.summary.hierarchyDistribution).forEach(([level, count]) => {
    console.log(`  ${level}: ${count}`);
  });

  // Save output
  console.log(`\n💾 Saving: ${options.output}`);
  await fs.writeFile(
    options.output,
    JSON.stringify(result, null, 2),
    'utf8'
  );

  // Export CSS if requested
  if (options.exportCSS) {
    const cssPath = options.output.replace('.json', '.css');
    const css = automation.exportCSS();
    await fs.writeFile(cssPath, css, 'utf8');
    console.log(`💾 CSS exported: ${cssPath}`);
  }

  // Export InDesign styles if requested
  if (options.exportInDesign) {
    const indesignPath = options.output.replace('.json', '-indesign.json');
    const styles = automation.exportInDesignStyles();
    await fs.writeFile(
      indesignPath,
      JSON.stringify(styles, null, 2),
      'utf8'
    );
    console.log(`💾 InDesign styles exported: ${indesignPath}`);
  }

  console.log('\n✅ Typography automation complete!');
}

function getOption(longForm, shortForm) {
  const longIndex = args.indexOf(longForm);
  const shortIndex = args.indexOf(shortForm);
  const index = Math.max(longIndex, shortIndex);

  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }

  return null;
}

function showHelp() {
  console.log(`
Typography Automation CLI

Automatically applies world-class typography to document elements

USAGE:
  node apply-typography-automation.js <input-file> [options]

ARGUMENTS:
  <input-file>    JSON file with document elements

OPTIONS:
  -o, --output <file>     Output file path (default: input-optimized.json)
  --css                   Export CSS stylesheet
  --indesign              Export InDesign paragraph styles
  --no-cutoffs            Disable cutoff prevention
  --no-line-height        Disable line height optimization
  --no-tracking           Disable tracking optimization
  -v, --verbose           Verbose output
  -e, --example           Run example demonstration
  -h, --help              Show this help

INPUT FILE FORMAT:
  {
    "elements": [
      {
        "type": "title|h2|h3|body|caption",
        "content": "Your text content",
        "frameWidth": 500,
        "frameHeight": 100,
        "importance": 85
      }
    ]
  }

EXAMPLES:
  # Apply automatic typography
  node apply-typography-automation.js document.json

  # Export CSS and InDesign styles
  node apply-typography-automation.js document.json --css --indesign

  # Custom output location
  node apply-typography-automation.js document.json -o optimized/result.json

  # Run example demonstration
  node apply-typography-automation.js --example

HIERARCHY TYPES:
  title       Document title (42pt Lora Bold)
  h2          Section header (28pt Lora SemiBold)
  h3          Subheading (18pt Roboto Flex Medium)
  body        Body text (11pt Roboto Flex Regular)
  caption     Caption text (9pt Roboto Flex Regular)

For full documentation, see:
  TYPOGRAPHY-AUTOMATION-README.md
  `);
}

async function runExample() {
  console.log('🎨 Typography Automation - Example\n');

  // Create sample elements
  const elements = [
    {
      type: 'title',
      content: 'TEEI AWS Partnership',
      frameWidth: 500,
      frameHeight: 100,
      importance: 95
    },
    {
      type: 'h2',
      content: 'Together for Ukraine Program',
      frameWidth: 500,
      frameHeight: 80,
      importance: 85
    },
    {
      type: 'h3',
      content: 'Cloud Education Initiative',
      frameWidth: 450,
      frameHeight: 60,
      importance: 75
    },
    {
      type: 'body',
      content: 'Through AWS cloud education, we empower displaced students with critical technical skills for careers in cloud computing, data analytics, and software development. Our comprehensive curriculum combines hands-on training with mentorship and career support.',
      frameWidth: 450,
      frameHeight: 200,
      importance: 50
    },
    {
      type: 'body',
      content: 'Students learn AWS services including EC2, S3, Lambda, RDS, and CloudFormation through real-world projects and industry-standard best practices.',
      frameWidth: 450,
      frameHeight: 150,
      importance: 50
    },
    {
      type: 'caption',
      content: 'Photo: Students learning AWS services in Kyiv, Ukraine',
      frameWidth: 300,
      frameHeight: 30,
      importance: 30
    },
    {
      type: 'h2',
      content: 'Program Impact',
      frameWidth: 500,
      frameHeight: 80,
      importance: 85
    },
    {
      type: 'body',
      content: '50,000+ students trained • 85% job placement rate • 40+ partner companies',
      frameWidth: 450,
      frameHeight: 100,
      importance: 60
    }
  ];

  // Initialize automation
  const automation = new TypographyAutomation();

  // Apply automatic typography
  console.log('Processing elements...\n');
  const result = await automation.applyAutomaticTypography(elements);

  // Display results
  console.log('📊 Results:');
  console.log(`  Elements processed: ${result.stats.elementsProcessed}`);
  console.log(`  Cutoffs prevented: ${result.stats.cutoffsPrevented}`);
  console.log(`  Sizes optimized: ${result.stats.sizesOptimized}`);
  console.log(`  Average confidence: ${result.summary.averageConfidence}%`);

  console.log('\n📐 Typography Applied:');
  result.elements.forEach((el, idx) => {
    const opt = el.optimized;
    console.log(`\n  ${idx + 1}. ${opt.hierarchyLevel}`);
    console.log(`     "${el.original.content.substring(0, 40)}${el.original.content.length > 40 ? '...' : ''}"`);
    console.log(`     ${opt.fontSize}pt ${opt.font} ${opt.weight}`);
    console.log(`     Line height: ${opt.lineHeight}, Tracking: ${opt.tracking}em`);
    if (opt.cutoffPrevented) {
      console.log(`     ⚠️  Cutoff prevented! (confidence: ${opt.confidence}%)`);
    }
  });

  console.log('\n📋 InDesign Paragraph Styles:');
  const styles = automation.exportInDesignStyles();
  styles.forEach(style => {
    console.log(`\n  ${style.name}:`);
    console.log(`    Font: ${style.pointSize}pt ${style.fontFamily} ${style.fontStyle}`);
    console.log(`    Leading: ${style.leading}pt`);
    console.log(`    Tracking: ${style.tracking}`);
    console.log(`    Spacing: ${style.spaceBefore}pt before, ${style.spaceAfter}pt after`);
  });

  console.log('\n💾 Sample CSS:');
  const css = automation.exportCSS();
  console.log(css.split('\n').slice(0, 15).join('\n'));
  console.log('  ...');

  // Save example output
  const exampleDir = path.join(__dirname, '..', 'examples', 'typography');
  await fs.mkdir(exampleDir, { recursive: true });

  const outputPath = path.join(exampleDir, 'example-output.json');
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), 'utf8');

  const cssPath = path.join(exampleDir, 'example-styles.css');
  await fs.writeFile(cssPath, css, 'utf8');

  const stylesPath = path.join(exampleDir, 'example-indesign-styles.json');
  await fs.writeFile(stylesPath, JSON.stringify(styles, null, 2), 'utf8');

  console.log(`\n✅ Example complete! Files saved to: ${exampleDir}`);
  console.log('  - example-output.json');
  console.log('  - example-styles.css');
  console.log('  - example-indesign-styles.json');
}
