#!/usr/bin/env node

/**
 * ENHANCE PHOTOS CLI
 * Command-line interface for AI-powered photo enhancement
 *
 * Usage:
 *   node scripts/enhance-photos.js <command> [options]
 *
 * Commands:
 *   enhance <files...>     Enhance photos with AI recommendations
 *   select <files...>      Select best photos from collection
 *   grade <files...>       Apply color grading
 *   analyze <file>         Analyze composition and quality
 *   batch <directory>      Batch process directory
 *
 * Examples:
 *   node scripts/enhance-photos.js enhance photo.jpg --preset teei-warm
 *   node scripts/enhance-photos.js select *.jpg --top 5
 *   node scripts/enhance-photos.js grade photo.jpg --preset golden-hour
 *   node scripts/enhance-photos.js batch ./photos --preset teei-warm
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const PhotoEnhancer = require('./lib/photo-enhancer');
const PhotoSelector = require('./lib/photo-selector');
const PhotoComposition = require('./lib/photo-composition');
const ColorGrading = require('./lib/color-grading');

class PhotoEnhancerCLI {
  constructor() {
    this.enhancer = new PhotoEnhancer();
    this.selector = new PhotoSelector();
    this.composition = new PhotoComposition();
    this.grading = new ColorGrading();
  }

  /**
   * Main entry point
   */
  async run(args) {
    console.log('📸 PHOTO ENHANCER & SELECTOR\n');

    try {
      const command = args[2];
      const commandArgs = args.slice(3);

      if (!command || command === '--help' || command === '-h') {
        this.showHelp();
        return;
      }

      switch (command) {
        case 'enhance':
          await this.enhanceCommand(commandArgs);
          break;
        case 'select':
          await this.selectCommand(commandArgs);
          break;
        case 'grade':
          await this.gradeCommand(commandArgs);
          break;
        case 'analyze':
          await this.analyzeCommand(commandArgs);
          break;
        case 'batch':
          await this.batchCommand(commandArgs);
          break;
        case 'presets':
          this.listPresets();
          break;
        default:
          console.error(`❌ Unknown command: ${command}`);
          console.log('Use --help to see available commands');
          process.exit(1);
      }

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
  }

  /**
   * ENHANCE command
   */
  async enhanceCommand(args) {
    const options = this.parseOptions(args);

    if (!options.files || options.files.length === 0) {
      console.error('❌ No files specified');
      console.log('Usage: enhance <files...> [options]');
      return;
    }

    console.log(`📸 Enhancing ${options.files.length} photo(s)...\n`);

    const outputDir = options.output || path.join(process.cwd(), 'exports', 'enhanced-photos');
    await fs.mkdir(outputDir, { recursive: true });

    const results = [];

    for (let i = 0; i < options.files.length; i++) {
      const file = options.files[i];
      console.log(`\n[${i + 1}/${options.files.length}] ${path.basename(file)}`);

      try {
        const result = await this.enhancer.enhancePhoto(file, {
          preset: options.preset || 'teei-warm',
          autoCrop: options.autoCrop,
          format: options.format || 'jpeg',
          quality: options.quality || 90,
          maxWidth: options.maxWidth,
          maxHeight: options.maxHeight
        });

        // Save enhanced photo
        const filename = path.basename(file, path.extname(file));
        const outputPath = path.join(outputDir, `${filename}-enhanced.${options.format || 'jpg'}`);

        await fs.writeFile(outputPath, result.enhanced);
        console.log(`  ✅ Saved: ${outputPath}`);

        // Save before/after comparison (if requested)
        if (options.comparison) {
          const comparisonPath = path.join(outputDir, `${filename}-comparison.jpg`);
          await this.enhancer.createBeforeAfter(file, result.enhanced, comparisonPath);
          console.log(`  📊 Comparison: ${comparisonPath}`);
        }

        results.push({
          success: true,
          original: file,
          enhanced: outputPath,
          ...result
        });

      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        results.push({
          success: false,
          original: file,
          error: error.message
        });
      }
    }

    // Generate report
    await this.saveEnhancementReport(results, outputDir);

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Enhancement complete: ${successCount}/${options.files.length} successful`);
  }

  /**
   * SELECT command
   */
  async selectCommand(args) {
    const options = this.parseOptions(args);

    if (!options.files || options.files.length === 0) {
      console.error('❌ No files specified');
      console.log('Usage: select <files...> [--top N]');
      return;
    }

    console.log(`🖼️  Selecting best photos from ${options.files.length} candidates...\n`);

    const results = await this.selector.selectBestImages(options.files, {
      selectTop: options.top || 5,
      purpose: options.purpose,
      target: options.target
    });

    // Display results
    console.log('\n📊 SELECTION RESULTS');
    console.log('═'.repeat(60));

    console.log('\n🏆 Selected Images:');
    results.selected.forEach((img, i) => {
      console.log(`\n${i + 1}. ${img.filename}`);
      console.log(`   Score: ${img.overallScore.toFixed(1)}/100`);
      console.log(`   Verdict: ${img.recommendation?.verdict}`);
      console.log(`   Best for: ${img.recommendation?.usage}`);

      if (img.aesthetic) {
        console.log(`   Brand Alignment: ${img.aesthetic.brandAlignment?.score}/10`);
        console.log(`   Emotional Impact: ${img.aesthetic.emotionalImpact?.score}/10`);
      }
    });

    console.log('\n📈 Summary:');
    console.log(`   Total evaluated: ${results.summary.totalEvaluated}`);
    console.log(`   Average score: ${results.summary.averageScore}/100`);
    console.log(`   Selected average: ${results.summary.selectedAverageScore}/100`);

    // Export report
    const outputDir = options.output || path.join(process.cwd(), 'exports', 'photo-selection');
    await fs.mkdir(outputDir, { recursive: true });

    const reportPath = path.join(outputDir, 'selection-report.json');
    await this.selector.exportReport(results, reportPath);
    console.log(`\n📄 Report saved: ${reportPath}`);
  }

  /**
   * GRADE command
   */
  async gradeCommand(args) {
    const options = this.parseOptions(args);

    if (!options.files || options.files.length === 0) {
      console.error('❌ No files specified');
      console.log('Usage: grade <files...> [--preset NAME]');
      return;
    }

    const preset = options.preset || 'teei-warm';
    console.log(`🎨 Applying ${preset} color grading...\n`);

    const outputDir = options.output || path.join(process.cwd(), 'exports', 'graded-photos');
    await fs.mkdir(outputDir, { recursive: true });

    for (let i = 0; i < options.files.length; i++) {
      const file = options.files[i];
      console.log(`[${i + 1}/${options.files.length}] ${path.basename(file)}`);

      try {
        const graded = await this.grading.applyGrading(file, preset);

        const filename = path.basename(file, path.extname(file));
        const outputPath = path.join(outputDir, `${filename}-${preset}.jpg`);

        await this.grading.exportGraded(graded, outputPath, 'jpeg', options.quality || 95);

        // Create comparison (if requested)
        if (options.comparison) {
          const comparisonPath = path.join(outputDir, `${filename}-comparison.jpg`);
          await this.grading.createComparison(file, graded, comparisonPath);
          console.log(`  📊 Comparison: ${comparisonPath}`);
        }

      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
      }
    }

    console.log(`\n✅ Color grading complete!`);
  }

  /**
   * ANALYZE command
   */
  async analyzeCommand(args) {
    const options = this.parseOptions(args);

    if (!options.files || options.files.length === 0) {
      console.error('❌ No file specified');
      console.log('Usage: analyze <file>');
      return;
    }

    const file = options.files[0];
    console.log(`🔍 Analyzing: ${path.basename(file)}\n`);

    // Composition analysis
    console.log('📐 Composition Analysis...');
    const composition = await this.composition.analyzeComposition(file);

    console.log(`\n📊 Composition Score: ${composition.score.toFixed(1)}/10\n`);

    console.log('Visual Balance:', composition.visualBalance.assessment);
    console.log('  Horizontal:', (composition.visualBalance.horizontalBalance * 100).toFixed(1) + '%');
    console.log('  Vertical:', (composition.visualBalance.verticalBalance * 100).toFixed(1) + '%');

    console.log('\nLeading Lines:', composition.leadingLines.present ? 'Present' : 'Not detected');
    console.log('  Score:', composition.leadingLines.score + '/10');

    console.log('\nSymmetry:', composition.symmetry.type);
    console.log('  Score:', composition.symmetry.score + '/10');

    if (composition.suggestions.length > 0) {
      console.log('\n💡 Improvement Suggestions:');
      composition.suggestions.slice(0, 3).forEach((suggestion, i) => {
        console.log(`\n${i + 1}. [${suggestion.priority.toUpperCase()}] ${suggestion.area}`);
        console.log(`   Issue: ${suggestion.issue}`);
        console.log(`   Suggestion: ${suggestion.suggestion}`);
      });
    }

    // Quality analysis
    console.log('\n\n📊 Technical Quality...');
    const enhancement = await this.enhancer.enhancePhoto(file, { preset: 'teei-warm' });

    console.log('\nResolution:', enhancement.analysis.dimensions.width + 'x' + enhancement.analysis.dimensions.height);
    console.log('  Assessment:', enhancement.analysis.brightness.assessment);

    console.log('\nBrightness:', (enhancement.analysis.brightness.score * 100).toFixed(1) + '%');
    console.log('Contrast:', enhancement.analysis.contrast.assessment);
    console.log('Temperature:', enhancement.analysis.temperature.assessment);

    // Visualize grid (if requested)
    if (options.visualize) {
      const outputDir = options.output || path.join(process.cwd(), 'exports', 'analysis');
      await fs.mkdir(outputDir, { recursive: true });

      const filename = path.basename(file, path.extname(file));
      const gridPath = path.join(outputDir, `${filename}-grid.jpg`);

      await this.composition.visualizeGrid(file, gridPath, 'rule-of-thirds');
      console.log(`\n📐 Grid visualization: ${gridPath}`);
    }
  }

  /**
   * BATCH command
   */
  async batchCommand(args) {
    const options = this.parseOptions(args);

    if (!options.directory) {
      console.error('❌ No directory specified');
      console.log('Usage: batch <directory> [options]');
      return;
    }

    const dir = options.directory;
    console.log(`📁 Batch processing: ${dir}\n`);

    // Find all image files
    const patterns = ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp'];
    let files = [];

    for (const pattern of patterns) {
      const matches = await glob(path.join(dir, pattern));
      files = files.concat(matches);
    }

    if (files.length === 0) {
      console.log('No image files found');
      return;
    }

    console.log(`Found ${files.length} images\n`);

    // Process based on mode
    if (options.mode === 'select') {
      // Selection mode
      await this.selectCommand([...files, ...args.slice(1)]);
    } else {
      // Enhancement mode (default)
      await this.enhanceCommand([...files, ...args.slice(1)]);
    }
  }

  /**
   * List presets
   */
  listPresets() {
    console.log('🎨 AVAILABLE PRESETS\n');
    console.log('Color Grading Presets:');
    console.log('═'.repeat(60));

    const presets = this.grading.listPresets();

    presets.forEach(preset => {
      console.log(`\n${preset.name} (${preset.key})`);
      console.log(`  ${preset.description}`);
      console.log(`  Best for: ${preset.bestFor}`);
    });

    console.log('\n\nEnhancement Presets:');
    console.log('═'.repeat(60));
    Object.entries(this.enhancer.presets).forEach(([key, preset]) => {
      console.log(`\n${preset.name} (${key})`);
      console.log(`  ${preset.description}`);
    });

    console.log('\n\nUsage:');
    console.log('  enhance photo.jpg --preset teei-warm');
    console.log('  grade photo.jpg --preset golden-hour');
  }

  /**
   * Parse command-line options
   */
  parseOptions(args) {
    const options = {
      files: [],
      directory: null,
      preset: null,
      output: null,
      format: 'jpeg',
      quality: 90,
      autoCrop: false,
      comparison: false,
      visualize: false,
      top: 5,
      mode: 'enhance'
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (!arg.startsWith('-')) {
        options.files.push(arg);
      } else if (arg === '--preset' || arg === '-p') {
        options.preset = args[++i];
      } else if (arg === '--output' || arg === '-o') {
        options.output = args[++i];
      } else if (arg === '--format' || arg === '-f') {
        options.format = args[++i];
      } else if (arg === '--quality' || arg === '-q') {
        options.quality = parseInt(args[++i]);
      } else if (arg === '--auto-crop') {
        options.autoCrop = true;
      } else if (arg === '--comparison' || arg === '-c') {
        options.comparison = true;
      } else if (arg === '--visualize' || arg === '-v') {
        options.visualize = true;
      } else if (arg === '--top' || arg === '-t') {
        options.top = parseInt(args[++i]);
      } else if (arg === '--max-width') {
        options.maxWidth = parseInt(args[++i]);
      } else if (arg === '--max-height') {
        options.maxHeight = parseInt(args[++i]);
      } else if (arg === '--purpose') {
        options.purpose = args[++i];
      } else if (arg === '--target') {
        options.target = args[++i];
      } else if (arg === '--mode') {
        options.mode = args[++i];
      }
    }

    // Handle directory for batch
    if (options.files.length === 1 && !options.files[0].includes('*')) {
      const stat = require('fs').statSync(options.files[0]);
      if (stat.isDirectory()) {
        options.directory = options.files[0];
        options.files = [];
      }
    }

    return options;
  }

  /**
   * Save enhancement report
   */
  async saveEnhancementReport(results, outputDir) {
    const report = this.enhancer.generateReport(results);

    const reportPath = path.join(outputDir, 'enhancement-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 Report saved: ${reportPath}`);
    return reportPath;
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`
📸 PHOTO ENHANCER & SELECTOR - AI-Powered Photo Processing

USAGE:
  node scripts/enhance-photos.js <command> [options]

COMMANDS:
  enhance <files...>     Enhance photos with AI recommendations
  select <files...>      Select best photos from collection
  grade <files...>       Apply color grading presets
  analyze <file>         Analyze composition and quality
  batch <directory>      Batch process entire directory
  presets                List available presets

OPTIONS:
  -o, --output DIR       Output directory
  -p, --preset NAME      Enhancement/grading preset
  -f, --format FMT       Output format: jpeg, png, webp
  -q, --quality NUM      JPEG quality (1-100, default: 90)
  -c, --comparison       Generate before/after comparison
  -v, --visualize        Visualize composition grid
  -t, --top N            Select top N photos (default: 5)
  --auto-crop            Apply intelligent cropping
  --max-width PX         Maximum width in pixels
  --max-height PX        Maximum height in pixels
  --purpose TEXT         Photo purpose (for selection)
  --target TEXT          Target use (print/web)
  --mode MODE            Batch mode: enhance|select

EXAMPLES:

  Enhance single photo:
    node scripts/enhance-photos.js enhance photo.jpg --preset teei-warm

  Enhance with comparison:
    node scripts/enhance-photos.js enhance photo.jpg --comparison

  Select best photos:
    node scripts/enhance-photos.js select *.jpg --top 5

  Apply color grading:
    node scripts/enhance-photos.js grade photo.jpg --preset golden-hour

  Analyze composition:
    node scripts/enhance-photos.js analyze photo.jpg --visualize

  Batch enhance directory:
    node scripts/enhance-photos.js batch ./photos --preset teei-warm

  Batch select best:
    node scripts/enhance-photos.js batch ./photos --mode select --top 10

  List presets:
    node scripts/enhance-photos.js presets

PRESETS:

  Enhancement:
    - teei-warm (default)     TEEI brand warm look
    - natural                 Subtle natural enhancement
    - vibrant                 Bold eye-catching colors
    - professional            Clean corporate look

  Color Grading:
    - teei-warm               Signature TEEI look
    - natural-enhanced        Enhanced natural tones
    - golden-hour             Warm sunset aesthetic
    - clean-corporate         Professional cool tones
    - vibrant-pop             Bold saturated colors
`);
  }
}

// Run CLI
if (require.main === module) {
  const cli = new PhotoEnhancerCLI();
  cli.run(process.argv).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = PhotoEnhancerCLI;
