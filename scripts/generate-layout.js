#!/usr/bin/env node

/**
 * Layout Generation CLI
 *
 * Quick command-line tool to generate professional layouts.
 *
 * Usage:
 * ```bash
 * # Generate from content file
 * node scripts/generate-layout.js examples/content.json --output exports/layout.json
 *
 * # Generate with specific style
 * node scripts/generate-layout.js examples/content.json --style nonprofit-modern
 *
 * # Generate and export to multiple formats
 * node scripts/generate-layout.js examples/content.json --export-all
 * ```
 */

const IntelligentLayoutEngine = require('./lib/intelligent-layout-engine');
const fs = require('fs').promises;
const path = require('path');

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  const contentFile = args[0];
  const options = parseArgs(args.slice(1));

  console.log('🎨 Intelligent Layout Generator');
  console.log('================================\n');

  try {
    // Load content
    console.log(`📖 Loading content from: ${contentFile}`);
    const contentJSON = await fs.readFile(contentFile, 'utf-8');
    const content = JSON.parse(contentJSON);

    // Initialize engine
    const engine = new IntelligentLayoutEngine({
      debug: options.debug,
      enableAI: options.enableAI
    });

    // Generate layout
    const result = await engine.generate(content, {
      style: options.style,
      pattern: options.pattern,
      density: options.density
    });

    // Output to JSON
    const outputPath = options.output || 'exports/generated-layout.json';
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n💾 Layout saved to: ${outputPath}`);

    // Export to additional formats
    if (options.exportAll) {
      const basePath = outputPath.replace('.json', '');

      await engine.exportLayout(result.layout, 'indesign', `${basePath}.xml`);
      await engine.exportLayout(result.layout, 'css-grid', `${basePath}.css`);
      await engine.exportLayout(result.layout, 'html', `${basePath}.html`);

      console.log(`📦 Exported to XML, CSS, and HTML`);
    }

    // Print summary
    console.log('\n📊 Layout Summary:');
    console.log(`   Quality: ${result.metadata.grade}`);
    console.log(`   Pattern: ${result.pattern.name}`);
    console.log(`   Elements: ${result.layout.elements.length}`);
    console.log(`   Grid: ${result.grid.columns}-column ${result.grid.type}`);
    console.log(`   Content Density: ${result.analysis.density}`);

    // Print quality breakdown
    console.log('\n📈 Quality Breakdown:');
    Object.entries(result.metadata.qualityFactors).forEach(([factor, score]) => {
      const label = factor.replace(/([A-Z])/g, ' $1').trim();
      console.log(`   ${label}: ${score}/100`);
    });

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (options.debug) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function parseArgs(args) {
  const options = {
    output: null,
    style: null,
    pattern: null,
    density: 'auto',
    exportAll: false,
    debug: false,
    enableAI: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--style':
      case '-s':
        options.style = args[++i];
        break;
      case '--pattern':
      case '-p':
        options.pattern = args[++i];
        break;
      case '--density':
      case '-d':
        options.density = args[++i];
        break;
      case '--export-all':
        options.exportAll = true;
        break;
      case '--debug':
        options.debug = true;
        break;
      case '--no-ai':
        options.enableAI = false;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
🎨 Intelligent Layout Generator

USAGE:
  node scripts/generate-layout.js <content-file> [options]

OPTIONS:
  -o, --output <path>       Output path (default: exports/generated-layout.json)
  -s, --style <style>       Design style (see styles below)
  -p, --pattern <pattern>   Force specific pattern (see patterns below)
  -d, --density <density>   Content density: sparse|balanced|dense|very-dense|auto
  --export-all              Export to all formats (JSON, XML, CSS, HTML)
  --debug                   Enable debug output
  --no-ai                   Disable AI refinement
  --help                    Show this help

STYLES:
  nonprofit-modern          Balanced, warm aesthetics (default)
  corporate                 Professional, clean
  editorial                 Magazine-style
  minimal                   Simple, lots of whitespace

PATTERNS:
  nonprofit-modern          12-column flexible (default)
  text-focused              Single column for dense text
  visual-storytelling       Image-heavy asymmetric
  swiss-flexible            12-column maximum flexibility
  editorial-magazine        3-column magazine style
  modular-sections          Modular grid with rows

EXAMPLES:
  # Basic usage
  node scripts/generate-layout.js examples/content.json

  # Generate nonprofit style with all exports
  node scripts/generate-layout.js examples/content.json --style nonprofit-modern --export-all

  # Force visual storytelling pattern
  node scripts/generate-layout.js examples/content.json --pattern visual-storytelling

  # Debug mode
  node scripts/generate-layout.js examples/content.json --debug

CONTENT FILE FORMAT:
  {
    "blocks": [
      { "type": "h1", "content": "Document Title" },
      { "type": "body", "content": "Body text..." },
      { "type": "image", "width": 400, "height": 300 }
    ]
  }

BLOCK TYPES:
  h1, h2, h3           - Headings
  body                 - Body text
  image                - Images
  quote                - Pull quotes
  stat                 - Large numbers/metrics
  callout              - Callout boxes
  cta                  - Call to action
  caption              - Small text
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
