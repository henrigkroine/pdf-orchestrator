#!/usr/bin/env node

/**
 * GENERATE INFOGRAPHICS CLI
 * Command-line interface for generating AI-powered infographics
 *
 * Usage:
 *   node scripts/generate-infographics.js <input-file> [options]
 *
 * Examples:
 *   node scripts/generate-infographics.js data.json
 *   node scripts/generate-infographics.js data.csv --style flat --size large
 *   node scripts/generate-infographics.js data.json --with-story --export png
 */

const fs = require('fs').promises;
const path = require('path');
const InfographicEngine = require('./lib/infographic-engine');
const DataStorytelling = require('./lib/data-storytelling');
const IconGenerator = require('./lib/icon-generator');

class InfographicCLI {
  constructor() {
    this.engine = new InfographicEngine();
    this.storytelling = new DataStorytelling();
    this.iconGenerator = new IconGenerator();
  }

  /**
   * Main entry point
   */
  async run(args) {
    console.log('🎨 INFOGRAPHIC GENERATOR\n');

    try {
      // Parse arguments
      const options = this.parseArguments(args);

      // Validate input
      if (!options.inputFile) {
        this.showHelp();
        process.exit(1);
      }

      // Load data
      console.log(`📂 Loading data from: ${options.inputFile}`);
      const data = await this.loadData(options.inputFile);
      console.log(`✅ Loaded ${Array.isArray(data) ? data.length : Object.keys(data).length} data points\n`);

      // Generate data story (if requested)
      let story = null;
      if (options.withStory) {
        console.log('📖 Generating data story...');
        story = await this.storytelling.generateDataStory(data, options.context);
        console.log(`✅ Story generated: "${story.narrative.title}"\n`);
      }

      // Generate infographic
      console.log('🎨 Generating infographic...');
      const infographic = await this.engine.generateInfographic(data, {
        ...options.context,
        size: options.size,
        style: options.style
      });
      console.log(`✅ Infographic generated: ${infographic.design.chart.type} chart\n`);

      // Generate icons (if requested)
      let icons = null;
      if (options.withIcons && options.concepts) {
        console.log('🎨 Generating custom icons...');
        icons = await this.iconGenerator.generateCustomIcons(options.concepts, {
          style: options.iconStyle || 'flat',
          colorScheme: 'warm'
        });
        console.log(`✅ Generated ${icons.length} icons\n`);
      }

      // Export results
      await this.exportResults({
        infographic,
        story,
        icons,
        data,
        options
      });

      // Show summary
      this.showSummary(infographic, story, icons, options);

      console.log('\n✅ All done!');

    } catch (error) {
      console.error('\n❌ Error:', error.message);
      if (process.env.DEBUG) {
        console.error(error);
      }
      process.exit(1);
    }
  }

  /**
   * Parse command-line arguments
   */
  parseArguments(args) {
    const options = {
      inputFile: null,
      outputDir: path.join(process.cwd(), 'exports', 'infographics'),
      format: 'svg',
      size: 'fullPage',
      style: 'flat',
      withStory: false,
      withIcons: false,
      iconStyle: 'flat',
      concepts: [],
      context: {
        purpose: 'General communication',
        audience: 'Professional stakeholders',
        message: 'Data insights'
      }
    };

    for (let i = 2; i < args.length; i++) {
      const arg = args[i];

      if (!arg.startsWith('-') && !options.inputFile) {
        options.inputFile = arg;
      } else if (arg === '--help' || arg === '-h') {
        this.showHelp();
        process.exit(0);
      } else if (arg === '--output' || arg === '-o') {
        options.outputDir = args[++i];
      } else if (arg === '--format' || arg === '-f') {
        options.format = args[++i];
      } else if (arg === '--size' || arg === '-s') {
        options.size = args[++i];
      } else if (arg === '--style') {
        options.style = args[++i];
      } else if (arg === '--with-story') {
        options.withStory = true;
      } else if (arg === '--with-icons') {
        options.withIcons = true;
      } else if (arg === '--icon-style') {
        options.iconStyle = args[++i];
      } else if (arg === '--concepts') {
        options.concepts = args[++i].split(',').map(c => c.trim());
      } else if (arg === '--purpose') {
        options.context.purpose = args[++i];
      } else if (arg === '--audience') {
        options.context.audience = args[++i];
      } else if (arg === '--message') {
        options.context.message = args[++i];
      } else if (arg === '--title') {
        options.context.title = args[++i];
      } else if (arg === '--subtitle') {
        options.context.subtitle = args[++i];
      }
    }

    return options;
  }

  /**
   * Load data from file
   */
  async loadData(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    const content = await fs.readFile(filepath, 'utf-8');

    if (ext === '.json') {
      return JSON.parse(content);
    } else if (ext === '.csv') {
      return this.parseCSV(content);
    } else {
      throw new Error(`Unsupported file format: ${ext}. Use .json or .csv`);
    }
  }

  /**
   * Parse CSV data
   */
  parseCSV(content) {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row = {};

      headers.forEach((header, i) => {
        const value = values[i];
        // Try to parse as number
        row[header] = isNaN(value) ? value : parseFloat(value);
      });

      return row;
    });
  }

  /**
   * Export results
   */
  async exportResults(results) {
    const { infographic, story, icons, data, options } = results;

    // Create output directory
    await fs.mkdir(options.outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const baseName = path.basename(options.inputFile, path.extname(options.inputFile));

    // Export infographic
    const infographicPath = path.join(
      options.outputDir,
      `${baseName}-infographic-${timestamp}.${options.format}`
    );
    await fs.writeFile(infographicPath, infographic.svg);
    console.log(`📊 Infographic saved: ${infographicPath}`);

    // Export story (if generated)
    if (story) {
      const storyPath = path.join(
        options.outputDir,
        `${baseName}-story-${timestamp}.json`
      );
      await fs.writeFile(storyPath, JSON.stringify(story, null, 2));
      console.log(`📖 Story saved: ${storyPath}`);

      // Export narrative as markdown
      const narrativePath = path.join(
        options.outputDir,
        `${baseName}-narrative-${timestamp}.md`
      );
      const markdown = this.generateMarkdownNarrative(story);
      await fs.writeFile(narrativePath, markdown);
      console.log(`📝 Narrative saved: ${narrativePath}`);
    }

    // Export icons (if generated)
    if (icons) {
      for (const icon of icons) {
        if (icon.processed) {
          const iconPath = path.join(
            options.outputDir,
            'icons',
            `${this.slugify(icon.concept)}.png`
          );
          await fs.mkdir(path.dirname(iconPath), { recursive: true });
          await fs.writeFile(iconPath, icon.processed.buffer);
        }
      }
      console.log(`🎨 Icons saved: ${options.outputDir}/icons/`);
    }

    // Export complete package
    const packagePath = path.join(
      options.outputDir,
      `${baseName}-package-${timestamp}.json`
    );

    await fs.writeFile(packagePath, JSON.stringify({
      data,
      infographic: {
        type: infographic.design.chart.type,
        metadata: infographic.metadata,
        file: path.basename(infographicPath)
      },
      story: story ? {
        title: story.narrative.title,
        insights: story.insights.length,
        file: path.basename(storyPath)
      } : null,
      icons: icons ? {
        count: icons.length,
        directory: 'icons/'
      } : null,
      generated: new Date().toISOString()
    }, null, 2));

    console.log(`📦 Package manifest saved: ${packagePath}`);
  }

  /**
   * Generate markdown narrative
   */
  generateMarkdownNarrative(story) {
    let md = `# ${story.narrative.title}\n\n`;

    if (story.narrative.subtitle) {
      md += `*${story.narrative.subtitle}*\n\n`;
    }

    md += `---\n\n`;

    // Executive summary
    if (story.summary) {
      md += `## Executive Summary\n\n`;
      md += `${story.summary.opening}\n\n`;
      md += `**Key Findings:**\n`;
      story.summary.keyFindings.forEach(finding => {
        md += `- ${finding}\n`;
      });
      md += `\n`;
      md += `**Implications:** ${story.summary.implications}\n\n`;
      md += `**Recommendation:** ${story.summary.recommendation}\n\n`;
      md += `---\n\n`;
    }

    // Narrative sections
    story.narrative.sections.forEach(section => {
      md += `## ${section.heading}\n\n`;
      md += `${section.content}\n\n`;
      if (section.keyPoint) {
        md += `> **Key Point:** ${section.keyPoint}\n\n`;
      }
    });

    // Conclusion
    if (story.narrative.conclusion) {
      md += `## Conclusion\n\n`;
      md += `${story.narrative.conclusion}\n\n`;
    }

    // Call to action
    if (story.narrative.callToAction) {
      md += `## Next Steps\n\n`;
      md += `${story.narrative.callToAction}\n\n`;
    }

    // Insights
    md += `---\n\n`;
    md += `## Detailed Insights\n\n`;
    story.insights
      .sort((a, b) => b.priority - a.priority)
      .forEach((insight, i) => {
        md += `### ${i + 1}. ${insight.statement}\n\n`;
        md += `**Data Support:** ${insight.dataSupport}\n\n`;
        md += `**Significance:** ${insight.significance}\n\n`;
        md += `**Priority:** ${'⭐'.repeat(insight.priority)}\n\n`;
      });

    return md;
  }

  /**
   * Show summary
   */
  showSummary(infographic, story, icons, options) {
    console.log('\n📊 GENERATION SUMMARY');
    console.log('═'.repeat(50));

    console.log('\nInfographic:');
    console.log(`  Chart Type: ${infographic.design.chart.type}`);
    console.log(`  Category: ${infographic.design.chart.category}`);
    console.log(`  Dimensions: ${infographic.metadata.dimensions.width}x${infographic.metadata.dimensions.height}`);
    console.log(`  Data Points: ${infographic.metadata.dataPoints}`);

    if (story) {
      console.log('\nData Story:');
      console.log(`  Title: ${story.narrative.title}`);
      console.log(`  Insights: ${story.insights.length}`);
      console.log(`  Framework: ${JSON.stringify(story.framework.structure)}`);
    }

    if (icons) {
      console.log('\nIcons:');
      console.log(`  Generated: ${icons.length}`);
      console.log(`  Concepts: ${icons.map(i => i.concept).join(', ')}`);
    }

    console.log('\nOutput:');
    console.log(`  Directory: ${options.outputDir}`);
    console.log(`  Format: ${options.format}`);
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`
🎨 INFOGRAPHIC GENERATOR - AI-Powered Data Visualizations

USAGE:
  node scripts/generate-infographics.js <input-file> [options]

INPUT:
  <input-file>         JSON or CSV file containing data

OPTIONS:
  -o, --output DIR     Output directory (default: exports/infographics)
  -f, --format FMT     Output format: svg, png (default: svg)
  -s, --size SIZE      Chart size: fullPage, halfPage, square, wide, tall
  --style STYLE        Chart style: flat, minimal, modern
  --with-story         Generate data storytelling narrative
  --with-icons         Generate custom icons
  --icon-style STYLE   Icon style: flat, minimal, outlined
  --concepts LIST      Comma-separated concepts for icons
  --purpose TEXT       Visualization purpose
  --audience TEXT      Target audience
  --message TEXT       Key message to communicate
  --title TEXT         Custom chart title
  --subtitle TEXT      Custom chart subtitle
  -h, --help           Show this help

EXAMPLES:

  Basic infographic:
    node scripts/generate-infographics.js data.json

  With data story:
    node scripts/generate-infographics.js data.json --with-story

  With custom icons:
    node scripts/generate-infographics.js data.json --with-icons \\
      --concepts "learning,growth,success"

  Full package:
    node scripts/generate-infographics.js data.csv \\
      --with-story --with-icons \\
      --size fullPage --format svg \\
      --purpose "Quarterly report" \\
      --audience "Executive team" \\
      --title "Q4 2024 Results"

INPUT FORMAT:

  JSON (array):
    [
      { "label": "Category A", "value": 100 },
      { "label": "Category B", "value": 150 }
    ]

  JSON (object):
    {
      "Category A": 100,
      "Category B": 150
    }

  CSV:
    label,value
    Category A,100
    Category B,150

OUTPUT:
  - Infographic SVG/PNG
  - Data story JSON + Markdown (with --with-story)
  - Custom icons (with --with-icons)
  - Package manifest JSON
`);
  }

  /**
   * Utility: slugify
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Run CLI
if (require.main === module) {
  const cli = new InfographicCLI();
  cli.run(process.argv).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = InfographicCLI;
