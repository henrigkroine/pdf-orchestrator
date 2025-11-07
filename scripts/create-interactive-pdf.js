#!/usr/bin/env node

/**
 * Create Interactive PDF - CLI Tool
 * Add motion design and interactivity to PDFs
 *
 * Usage:
 *   node scripts/create-interactive-pdf.js input.pdf [options]
 *
 * Options:
 *   --navigation        Add page navigation buttons
 *   --forms             Add interactive form validation
 *   --animations        Add motion design animations
 *   --analytics         Add analytics tracking
 *   --output <path>     Output file path
 *   --config <path>     Configuration file
 */

const MotionDesigner = require('./lib/motion-designer');
const InteractionBuilder = require('./lib/interaction-builder');
const PDFJavaScriptInjector = require('./lib/pdf-javascript-injector');
const fs = require('fs').promises;
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const inputFile = args.find(arg => !arg.startsWith('--') && arg.endsWith('.pdf'));
if (!inputFile) {
  console.error('❌ Error: No PDF input file specified');
  console.log('Usage: node scripts/create-interactive-pdf.js input.pdf [options]');
  process.exit(1);
}

// Parse options
const options = {
  navigation: args.includes('--navigation'),
  forms: args.includes('--forms'),
  animations: args.includes('--animations'),
  analytics: args.includes('--analytics'),
  output: parseOption('--output'),
  config: parseOption('--config')
};

// If no specific options, enable all
if (!options.navigation && !options.forms && !options.animations && !options.analytics) {
  options.navigation = true;
  options.animations = true;
}

// Main execution
(async () => {
  try {
    console.log('🎬 TEEI Interactive PDF Creator\n');

    // Check if input file exists
    try {
      await fs.access(inputFile);
    } catch (error) {
      console.error(`❌ Error: File not found: ${inputFile}`);
      process.exit(1);
    }

    await createInteractivePDF();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

/**
 * Create interactive PDF
 */
async function createInteractivePDF() {
  const injector = new PDFJavaScriptInjector();

  console.log(`📄 Input: ${path.basename(inputFile)}\n`);

  // Load configuration
  let config = {};
  if (options.config) {
    const configData = await fs.readFile(options.config, 'utf8');
    config = JSON.parse(configData);
  }

  // Build interaction options
  const interactionOptions = {
    navigation: options.navigation,
    outputPath: options.output || inputFile.replace('.pdf', '-interactive.pdf')
  };

  // Add form configuration if specified
  if (options.forms && config.form) {
    interactionOptions.form = config.form;
  }

  // Add custom buttons if specified
  if (config.buttons) {
    interactionOptions.buttons = config.buttons;
  }

  // Create interactive PDF
  console.log('🎨 Adding interactivity...');

  const result = await injector.createInteractivePDF(inputFile, interactionOptions);

  console.log('\n✅ Interactive PDF created successfully!');
  console.log(`\n📄 Output: ${result.path}`);
  console.log(`📊 Pages: ${result.pages}`);
  console.log(`🔘 Navigation: ${result.hasNavigation ? 'Yes' : 'No'}`);
  console.log(`📝 Forms: ${result.hasForm ? 'Yes' : 'No'}`);

  // Generate motion design assets if animations enabled
  if (options.animations) {
    await generateMotionAssets();
  }

  console.log('\n💡 Open the PDF in Adobe Acrobat Reader to see interactivity.');
  console.log('   (Interactive features may not work in all PDF viewers)');
}

/**
 * Generate motion design assets (HTML/CSS/JS)
 */
async function generateMotionAssets() {
  console.log('\n🎬 Generating motion design assets...');

  const motionDesigner = new MotionDesigner();
  const interactionBuilder = new InteractionBuilder();

  // Create document context
  const documentContext = {
    title: path.basename(inputFile, '.pdf'),
    elements: [] // Would be populated from PDF analysis
  };

  // Design motion system
  const motionSystem = await motionDesigner.designMotionSystem(documentContext);

  // Build interaction system
  const interactionSystem = await interactionBuilder.buildInteractionSystem(documentContext);

  // Save to assets directory
  const assetsDir = inputFile.replace('.pdf', '-interactive-assets');
  await fs.mkdir(assetsDir, { recursive: true });

  // Save motion system
  await motionDesigner.saveMotionSystem(motionSystem, assetsDir);

  // Save interaction system
  await interactionBuilder.saveInteractionSystem(interactionSystem, assetsDir);

  console.log(`   ✓ Motion assets saved to: ${assetsDir}`);
  console.log('   • motion.css - Animation styles');
  console.log('   • motion.js - Interactive behaviors');
  console.log('   • interactions.css - UI component styles');
  console.log('   • interactions.js - Interaction handlers');

  // Generate HTML preview
  await generateHTMLPreview(assetsDir);
}

/**
 * Generate HTML preview of interactive features
 */
async function generateHTMLPreview(assetsDir) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive PDF Preview</title>
  <link rel="stylesheet" href="motion.css">
  <link rel="stylesheet" href="interactions.css">
  <style>
    body {
      font-family: 'Roboto Flex', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #FFF1E2; /* TEEI Sand */
    }

    .header {
      background: #00393F; /* TEEI Nordshore */
      color: white;
      padding: 40px;
      border-radius: 8px;
      margin-bottom: 40px;
      animation: fadeUp 600ms cubic-bezier(0, 0, 0.58, 1);
    }

    .section {
      background: white;
      padding: 32px;
      border-radius: 8px;
      margin-bottom: 24px;
      border: 2px solid #C9E4EC; /* TEEI Sky */
    }

    .card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      border: 2px solid #C9E4EC;
      margin-bottom: 16px;
    }

    .btn-primary {
      margin-right: 12px;
      margin-bottom: 12px;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .metric-card {
      text-align: center;
      padding: 24px;
      background: linear-gradient(135deg, #00393F 0%, #BA8F5A 100%);
      color: white;
      border-radius: 8px;
    }

    .metric-number {
      font-size: 48px;
      font-weight: bold;
      font-family: 'Lora', serif;
    }

    .metric-label {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Interactive PDF Preview</h1>
    <p>This page demonstrates the interactive features and motion design that can be applied to your PDF.</p>
  </div>

  <div class="section">
    <h2>Button Interactions</h2>
    <p>Hover and click buttons to see microinteractions:</p>
    <button class="btn-primary">Primary Button</button>
    <button class="btn-secondary">Secondary Button</button>
    <button class="btn-cta">Call to Action</button>
  </div>

  <div class="section">
    <h2>Card Interactions</h2>
    <div class="demo-grid">
      <div class="card">
        <h3>Hover Me</h3>
        <p>Cards have subtle lift effects on hover.</p>
      </div>
      <div class="card">
        <h3>Interactive</h3>
        <p>Smooth transitions create engaging experiences.</p>
      </div>
      <div class="card">
        <h3>Professional</h3>
        <p>Aligned with TEEI brand personality.</p>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Animated Metrics</h2>
    <div class="demo-grid stagger-container">
      <div class="metric-card stagger-item">
        <div class="metric-number count-up" data-target="1000">0</div>
        <div class="metric-label">Students Reached</div>
      </div>
      <div class="metric-card stagger-item">
        <div class="metric-number count-up" data-target="50">0</div>
        <div class="metric-label">Partner Organizations</div>
      </div>
      <div class="metric-card stagger-item">
        <div class="metric-number count-up" data-target="98">0</div>
        <div class="metric-label">Success Rate %</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Form Elements</h2>
    <form class="form-group">
      <label class="form-label floating">Name</label>
      <input type="text" class="form-input" placeholder="Enter your name">
    </form>
    <form class="form-group" style="margin-top: 16px;">
      <label class="form-label floating">Email</label>
      <input type="email" class="form-input" placeholder="Enter your email">
    </form>
  </div>

  <script src="motion.js"></script>
  <script src="interactions.js"></script>
</body>
</html>`;

  await fs.writeFile(path.join(assetsDir, 'preview.html'), html);

  console.log('   ✓ HTML preview generated: preview.html');
  console.log(`   📱 Open in browser: file://${path.resolve(assetsDir)}/preview.html`);
}

/**
 * Parse command line option
 */
function parseOption(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;

  const value = args[index + 1];
  return (value && !value.startsWith('--')) ? value : undefined;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
🎬 TEEI Interactive PDF Creator

Add professional motion design and interactivity to your PDFs with
TEEI brand-aligned animations, smooth transitions, and interactive elements.

USAGE:
  node scripts/create-interactive-pdf.js <input.pdf> [options]

OPTIONS:
  --navigation        Add page navigation buttons (Next/Previous)
  --forms             Add interactive form validation
  --animations        Generate motion design assets (HTML/CSS/JS)
  --analytics         Add analytics tracking
  --output <path>     Specify output file path
  --config <path>     Load configuration from JSON file
  --help, -h          Show this help message

EXAMPLES:

  # Add navigation buttons
  node scripts/create-interactive-pdf.js document.pdf --navigation

  # Create interactive PDF with all features
  node scripts/create-interactive-pdf.js document.pdf

  # Generate motion design assets
  node scripts/create-interactive-pdf.js document.pdf --animations

  # Use custom configuration
  node scripts/create-interactive-pdf.js document.pdf --config config.json

CONFIGURATION FILE FORMAT:

{
  "form": {
    "fields": [
      {
        "name": "email",
        "type": "text",
        "scripts": {
          "validate": "validateEmail(event.value)"
        }
      }
    ]
  },
  "buttons": {
    "0": [
      {
        "name": "submitButton",
        "label": "Submit",
        "x": 250,
        "y": 50,
        "onClick": "submitForm()"
      }
    ]
  }
}

FEATURES:

  Navigation:
    • Next/Previous page buttons
    • Smooth page transitions
    • Keyboard navigation support

  Motion Design:
    • Page transitions (fade, slide, reveal)
    • Element animations (fade up, scale, slide)
    • Microinteractions (button hover, card lift)
    • Data animations (count up, progress bars)
    • Scroll-triggered reveals

  Interactions:
    • Button states (hover, active, disabled)
    • Form validation and feedback
    • Custom tooltips
    • Modal dialogs
    • Dropdown menus

  Brand Alignment:
    • TEEI color palette (Nordshore, Sky, Gold)
    • Professional timing (300ms standard)
    • Smooth easing functions
    • Warm, empowering personality

OUTPUT:

  Interactive PDF:
    • Works in Adobe Acrobat Reader
    • Embedded JavaScript for interactivity
    • Navigation buttons on each page
    • Form validation (if forms enabled)

  Motion Assets (with --animations):
    • motion.css - Animation styles
    • motion.js - Interactive behaviors
    • interactions.css - UI component styles
    • interactions.js - Interaction handlers
    • preview.html - Browser preview

COMPATIBILITY:

  PDF Interactivity:
    ✓ Adobe Acrobat Reader (full support)
    ✓ Adobe Acrobat Pro (full support)
    ⚠️ Browser PDF viewers (limited support)
    ✗ Most mobile PDF viewers (no JavaScript)

  Motion Assets:
    ✓ All modern browsers
    ✓ Responsive design
    ✓ Accessibility compliant

WORKFLOW:

  1. Create interactive PDF:
     node scripts/create-interactive-pdf.js document.pdf

  2. Open in Adobe Acrobat Reader to test

  3. Generate motion assets for web version:
     node scripts/create-interactive-pdf.js document.pdf --animations

  4. Preview in browser:
     open document-interactive-assets/preview.html

For more information, see: docs/MOTION-DESIGN-GUIDE.md
`);
}
