#!/usr/bin/env node

/**
 * Generate Brand Graphics CLI
 *
 * Command-line tool for generating TEEI brand icons and illustrations
 *
 * Usage:
 *   npm run generate:icons -- --concept "cloud computing" --style flat
 *   npm run generate:illustrations -- --scene "students learning" --mood inspiring
 *   node scripts/generate-brand-graphics.js icon-set --theme "AWS partnership"
 *
 * @module generate-brand-graphics
 */

const { Command } = require('commander');
const IconIllustrationGenerator = require('./lib/icon-illustration-generator');
const IllustrationLibrary = require('./lib/illustration-library');
const SVGOptimizer = require('./lib/svg-optimizer');
const StyleConsistency = require('./lib/style-consistency');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config();

const program = new Command();

program
  .name('generate-brand-graphics')
  .description('Generate TEEI brand icons and illustrations')
  .version('1.0.0');

/**
 * Generate single icon
 */
program
  .command('icon')
  .description('Generate a single icon')
  .requiredOption('-c, --concept <concept>', 'Icon concept')
  .option('-s, --style <style>', 'Icon style (flat, line, isometric, duotone, gradient, handDrawn)', 'flat')
  .option('-o, --output <dir>', 'Output directory', 'assets/generated')
  .option('--optimize', 'Optimize SVG output', true)
  .action(async (options) => {
    console.log('\n🎨 TEEI Brand Icon Generator\n');

    try {
      const generator = new IconIllustrationGenerator({
        outputDir: options.output
      });

      const icon = await generator.generateIcon(
        options.concept,
        options.style
      );

      console.log('\n✅ Icon Generated Successfully!\n');
      console.log(`   Concept: ${icon.concept}`);
      console.log(`   Style: ${icon.style}`);
      console.log(`   PNG: ${icon.paths.png}`);
      console.log(`   SVG: ${icon.paths.svg || 'N/A'}`);

      // Optimize SVG if requested
      if (options.optimize && icon.paths.svg) {
        console.log('\n🔧 Optimizing SVG...');

        const optimizer = new SVGOptimizer();
        const result = await optimizer.optimizeSVG(icon.paths.svg);

        console.log(`   Reduced by ${result.savings}%`);
      }

      // Save metadata
      const metadataPath = path.join(
        options.output,
        'icons',
        `${path.basename(icon.paths.png, '.png')}-metadata.json`
      );

      await fs.writeFile(metadataPath, JSON.stringify(icon, null, 2));
      console.log(`\n📄 Metadata: ${metadataPath}`);

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Generate icon set
 */
program
  .command('icon-set')
  .description('Generate a cohesive icon set')
  .requiredOption('-t, --theme <theme>', 'Icon set theme')
  .requiredOption('-c, --concepts <concepts...>', 'Icon concepts (space-separated)')
  .option('-s, --style <style>', 'Icon style (auto-detected if not specified)')
  .option('-o, --output <dir>', 'Output directory', 'assets/generated')
  .option('--check-consistency', 'Check style consistency', true)
  .action(async (options) => {
    console.log('\n🎨 TEEI Brand Icon Set Generator\n');

    try {
      const generator = new IconIllustrationGenerator({
        outputDir: options.output
      });

      const iconSet = await generator.generateIconSet(
        options.concepts,
        options.theme,
        { style: options.style }
      );

      console.log('\n✅ Icon Set Generated Successfully!\n');
      console.log(`   Theme: ${options.theme}`);
      console.log(`   Icons: ${iconSet.icons.length}`);
      console.log(`   Style: ${iconSet.styleGuide.recommendedStyle}`);

      // Check consistency if requested
      if (options.checkConsistency) {
        console.log('\n🔍 Checking Style Consistency...\n');

        const checker = new StyleConsistency();
        const iconPaths = iconSet.icons
          .filter(i => i.paths && i.paths.png)
          .map(i => i.paths.png);

        const consistency = await checker.checkIconSetConsistency(iconPaths);

        console.log(`   Overall Score: ${consistency.consistency.overallScore}/10`);
        console.log(`   Grade: ${consistency.report.summary.grade}`);

        if (consistency.report.recommendations.length > 0) {
          console.log('\n📋 Recommendations:');
          consistency.report.recommendations.forEach(rec => {
            console.log(`   ${rec.priority === 'high' ? '🔴' : '🟡'} ${rec.action}`);
          });
        }

        // Save consistency report
        const reportPath = path.join(
          options.output,
          'icons',
          `${options.theme}-consistency-report.json`
        );

        await fs.writeFile(reportPath, JSON.stringify(consistency.report, null, 2));
        console.log(`\n📊 Consistency Report: ${reportPath}`);
      }

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Generate illustration
 */
program
  .command('illustration')
  .description('Generate a custom illustration')
  .requiredOption('-s, --scene <scene>', 'Scene description')
  .requiredOption('-m, --mood <mood>', 'Desired mood')
  .option('--size <size>', 'Image size', '1792x1024')
  .option('-o, --output <dir>', 'Output directory', 'assets/generated')
  .option('--alternatives <count>', 'Generate alternative versions', '2')
  .action(async (options) => {
    console.log('\n🎨 TEEI Brand Illustration Generator\n');

    try {
      const generator = new IconIllustrationGenerator({
        outputDir: options.output
      });

      const illustration = await generator.generateIllustration(
        options.scene,
        options.mood,
        { size: options.size }
      );

      console.log('\n✅ Illustration Generated Successfully!\n');
      console.log(`   Scene: ${illustration.scene}`);
      console.log(`   Mood: ${illustration.mood}`);
      console.log(`   Path: ${illustration.path}`);

      if (illustration.placement) {
        console.log('\n📍 Placement Suggestions:');
        console.log(`   Page: ${illustration.placement.page}`);
        console.log(`   Position: ${illustration.placement.placement}`);
        console.log(`   Size: ${illustration.placement.size}`);
      }

      if (illustration.alternatives && illustration.alternatives.length > 0) {
        console.log(`\n🎨 ${illustration.alternatives.length} Alternative Versions Generated`);
        illustration.alternatives.forEach((alt, i) => {
          console.log(`   ${i + 1}. ${alt.variation}: ${alt.path}`);
        });
      }

      // Save metadata
      const metadataPath = path.join(
        options.output,
        'illustrations',
        `${path.basename(illustration.path, '.png')}-metadata.json`
      );

      await fs.writeFile(metadataPath, JSON.stringify(illustration, null, 2));
      console.log(`\n📄 Metadata: ${metadataPath}`);

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Use template
 */
program
  .command('template')
  .description('Generate illustration from library template')
  .requiredOption('-c, --category <category>', 'Template category (hero, people, technology, education, impact, abstract)')
  .requiredOption('-t, --template <template>', 'Template name')
  .option('--customize <json>', 'Customization JSON')
  .option('-o, --output <dir>', 'Output directory', 'assets/generated')
  .action(async (options) => {
    console.log('\n🎨 TEEI Template Illustration Generator\n');

    try {
      const library = new IllustrationLibrary();
      const generator = new IconIllustrationGenerator({
        outputDir: options.output
      });

      // Get template
      let template = library.getSceneTemplate(options.category, options.template);

      if (!template) {
        console.error(`❌ Template not found: ${options.category}/${options.template}`);
        console.log('\nAvailable categories:');
        library.getCategories().forEach(cat => {
          console.log(`   - ${cat.key}: ${cat.name} (${cat.templateCount} templates)`);
        });
        process.exit(1);
      }

      // Apply customizations if provided
      if (options.customize) {
        const customizations = JSON.parse(options.customize);
        template = library.customizeTemplate(options.category, options.template, customizations);
      }

      console.log(`   Category: ${options.category}`);
      console.log(`   Template: ${template.name}`);
      console.log(`   Mood: ${template.mood}`);

      // Generate illustration
      const illustration = await generator.generateIllustration(
        template.prompt,
        template.mood
      );

      console.log('\n✅ Template Illustration Generated Successfully!\n');
      console.log(`   Path: ${illustration.path}`);

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * List templates
 */
program
  .command('list-templates')
  .description('List all available illustration templates')
  .option('-c, --category <category>', 'Filter by category')
  .option('-s, --search <query>', 'Search templates')
  .action(async (options) => {
    const library = new IllustrationLibrary();

    console.log('\n📚 TEEI Illustration Templates\n');

    if (options.search) {
      const results = library.searchTemplates(options.search);

      if (results.length === 0) {
        console.log(`   No templates found for: "${options.search}"`);
      } else {
        console.log(`   Found ${results.length} templates:\n`);
        results.forEach(t => {
          console.log(`   ${t.categoryName} > ${t.name}`);
          console.log(`   ${t.prompt.substring(0, 80)}...`);
          console.log(`   Mood: ${t.mood}\n`);
        });
      }
    } else if (options.category) {
      const categoryData = library.getTemplatesByCategory(options.category);

      if (!categoryData) {
        console.log(`   Category not found: ${options.category}`);
      } else {
        console.log(`   ${categoryData.name}\n   ${categoryData.description}\n`);

        Object.entries(categoryData.templates).forEach(([key, template]) => {
          console.log(`   ${template.name}`);
          console.log(`   Key: ${key}`);
          console.log(`   ${template.prompt.substring(0, 80)}...`);
          console.log(`   Mood: ${template.mood}\n`);
        });
      }
    } else {
      const categories = library.getCategories();

      categories.forEach(cat => {
        console.log(`   ${cat.name} (${cat.templateCount} templates)`);
        console.log(`   ${cat.description}`);
        console.log(`   Key: ${cat.key}\n`);
      });

      console.log(`\nUse --category <key> to see templates in a category`);
      console.log(`Use --search <query> to search templates`);
    }
  });

/**
 * Optimize SVG files
 */
program
  .command('optimize-svg')
  .description('Optimize SVG files')
  .argument('<input>', 'Input SVG file or directory')
  .option('-o, --output <path>', 'Output path (file or directory)')
  .option('--batch', 'Batch process directory')
  .action(async (input, options) => {
    console.log('\n🔧 SVG Optimizer\n');

    try {
      const optimizer = new SVGOptimizer();

      if (options.batch) {
        const result = await optimizer.optimizeDirectory(input, options.output);

        console.log('\n✅ Batch Optimization Complete!\n');
        console.log(`   Files processed: ${result.filesProcessed}`);
        console.log(`   Total savings: ${result.totalSavings}%`);
      } else {
        const result = await optimizer.optimizeSVG(input, options.output);

        console.log('\n✅ SVG Optimized!\n');
        console.log(`   Savings: ${result.savings}%`);
        console.log(`   Output: ${result.outputPath}`);
      }

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Get statistics
 */
program
  .command('stats')
  .description('Show generation statistics')
  .option('-o, --output <dir>', 'Output directory', 'assets/generated')
  .action(async (options) => {
    console.log('\n📊 Generation Statistics\n');

    try {
      const generator = new IconIllustrationGenerator({
        outputDir: options.output
      });

      const stats = await generator.getStats();

      console.log(`   Icons: ${stats.icons.total} (${stats.icons.svg} SVG)`);
      console.log(`   Illustrations: ${stats.illustrations.total}`);
      console.log(`   Output Directory: ${stats.outputDir}`);

      if (stats.error) {
        console.log(`\n   ⚠️  ${stats.error}`);
      }

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
