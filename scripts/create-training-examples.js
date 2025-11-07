#!/usr/bin/env node

/**
 * Create Training Examples
 * Converts PDFs to high-resolution images and creates annotation templates
 * for few-shot learning
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const SchemaValidator = require('./lib/schema-validator');

class TrainingExampleCreator {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.trainingDir = path.join(projectRoot, 'training-examples');
    this.schemasDir = path.join(projectRoot, 'schemas');
    this.validator = new SchemaValidator();
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize browser for PDF conversion
   */
  async init() {
    console.log('🚀 Initializing training example creator...');
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();

    // Load schemas
    await this.validator.loadAllSchemas(this.schemasDir);

    console.log('✅ Initialized');
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Convert PDF to high-resolution images
   */
  async convertPDFToImages(pdfPath, outputDir, options = {}) {
    const {
      dpi = 300,
      format = 'png',
      prefix = 'page'
    } = options;

    console.log(`📄 Converting PDF to images (${dpi} DPI)...`);
    console.log(`   Input: ${pdfPath}`);
    console.log(`   Output: ${outputDir}`);

    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      // Load PDF in browser
      const pdfBuffer = await fs.readFile(pdfPath);
      const pdfBase64 = pdfBuffer.toString('base64');
      const dataUrl = `data:application/pdf;base64,${pdfBase64}`;

      await this.page.goto(dataUrl);

      // Wait for PDF to load
      await this.page.waitForTimeout(2000);

      // Get page count (simplified - assumes single page or will capture first page)
      // For multi-page PDFs, would need pdf-lib or similar to split pages first

      // Take high-resolution screenshot
      const screenshotPath = path.join(outputDir, `${prefix}-1.${format}`);

      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: format,
        scale: 'device'  // Use device DPI
      });

      console.log(`✅ Saved: ${screenshotPath}`);

      return [screenshotPath];
    } catch (error) {
      console.error(`❌ Failed to convert PDF:`, error.message);
      throw error;
    }
  }

  /**
   * Create annotation template
   */
  createAnnotationTemplate(documentId, documentName, category) {
    const template = {
      documentId,
      documentName,
      category,
      grade: category === 'good' ? 'A+' : 'F',
      overallScore: category === 'good' ? 10 : 0,
      confidence: 1.0,
      annotatedBy: 'human-expert',
      annotationDate: new Date().toISOString().split('T')[0],
      brandCompliance: {
        colors: {
          score: category === 'good' ? 10 : 0,
          pass: category === 'good',
          notes: 'TODO: Add specific notes about color usage',
          correctColors: [],
          incorrectColors: []
        },
        typography: {
          score: category === 'good' ? 10 : 0,
          pass: category === 'good',
          notes: 'TODO: Add specific notes about typography',
          correctFonts: [],
          incorrectFonts: []
        },
        layout: {
          score: category === 'good' ? 10 : 0,
          pass: category === 'good',
          notes: 'TODO: Add specific notes about layout',
          gridCompliance: category === 'good',
          spacingCorrect: category === 'good',
          textCutoffs: []
        },
        photography: {
          score: category === 'good' ? 10 : 0,
          pass: category === 'good',
          notes: 'TODO: Add specific notes about photography',
          hasPhotography: false,
          photographyQuality: 'none',
          warmTones: false,
          authentic: false
        },
        logos: {
          score: category === 'good' ? 10 : 0,
          pass: category === 'good',
          notes: 'TODO: Add specific notes about logos',
          clearspaceCorrect: category === 'good',
          logoQuality: 'high-resolution'
        }
      },
      violations: [
        // {
        //   type: 'color',
        //   severity: 'critical',
        //   description: 'TODO: Describe violation',
        //   location: 'TODO: Page 1, Section',
        //   recommendation: 'TODO: How to fix',
        //   specificIssue: 'TODO: Specific detail'
        // }
      ],
      strengths: [
        // 'TODO: List what this document does well'
      ],
      keyLearnings: [
        // 'TODO: What should AI learn from this example?'
      ],
      accessibilityNotes: {
        colorContrast: 'TODO: Notes on color contrast',
        textSize: 'TODO: Notes on text size',
        readingOrder: 'TODO: Notes on reading order'
      },
      usageInstructions: 'TODO: Instructions for using this example in few-shot prompts',
      metadata: {
        pageCount: 1,
        fileSize: 'TODO: File size',
        dimensions: '8.5 x 11 inches',
        resolution: '300 DPI'
      }
    };

    return template;
  }

  /**
   * Process PDF into training example
   */
  async processPDF(pdfPath, category, documentId, documentName) {
    console.log(`\n📦 Processing: ${documentName}`);
    console.log(`   Category: ${category}`);
    console.log(`   ID: ${documentId}`);

    // Determine output directories
    const categoryDir = path.join(this.trainingDir, `${category}-examples`);
    const annotationsDir = path.join(categoryDir, 'annotations');

    await fs.mkdir(categoryDir, { recursive: true });
    await fs.mkdir(annotationsDir, { recursive: true });

    // Convert PDF to image
    const imageOutputPath = path.join(categoryDir, `${documentId}.png`);

    try {
      // Convert PDF to image (300 DPI)
      await this.convertPDFToImages(pdfPath, categoryDir, {
        dpi: 300,
        format: 'png',
        prefix: documentId
      });

      // Rename to standard name if needed
      const generatedPath = path.join(categoryDir, `${documentId}-1.png`);
      try {
        await fs.rename(generatedPath, imageOutputPath);
      } catch (error) {
        // File might already be correctly named
      }

      console.log(`✅ Image: ${imageOutputPath}`);

      // Create annotation template
      const annotation = this.createAnnotationTemplate(documentId, documentName, category);

      // Save annotation template
      const annotationPath = path.join(annotationsDir, `${documentId}.json`);
      await fs.writeFile(annotationPath, JSON.stringify(annotation, null, 2), 'utf8');

      console.log(`✅ Annotation template: ${annotationPath}`);

      // Validate annotation template
      const validation = this.validator.validateTrainingAnnotation(annotation);

      if (validation.valid) {
        console.log(`✅ Annotation template is valid`);
      } else {
        console.warn(`⚠️  Annotation template has validation warnings:`);
        validation.formattedErrors.forEach(err => console.warn(`   ${err}`));
        console.warn(`   (This is OK for templates - fill in TODO items)`);
      }

      return {
        documentId,
        documentName,
        category,
        imagePath: imageOutputPath,
        annotationPath,
        valid: validation.valid
      };
    } catch (error) {
      console.error(`❌ Failed to process PDF:`, error.message);
      throw error;
    }
  }

  /**
   * Validate existing annotation
   */
  async validateAnnotation(annotationPath) {
    console.log(`\n🔍 Validating: ${annotationPath}`);

    try {
      const content = await fs.readFile(annotationPath, 'utf8');
      const annotation = JSON.parse(content);

      const validation = this.validator.validateTrainingAnnotation(annotation);

      if (validation.valid) {
        console.log(`✅ Annotation is valid`);
        return { valid: true, annotation };
      } else {
        console.error(`❌ Annotation has errors:`);
        validation.formattedErrors.forEach(err => console.error(`   ${err}`));
        return { valid: false, errors: validation.formattedErrors };
      }
    } catch (error) {
      console.error(`❌ Failed to validate annotation:`, error.message);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Validate all annotations in training-examples/
   */
  async validateAllAnnotations() {
    console.log(`\n🔍 Validating all training annotations...\n`);

    const results = {
      valid: [],
      invalid: [],
      total: 0
    };

    // Validate good examples
    const goodAnnotationsDir = path.join(this.trainingDir, 'good-examples', 'annotations');
    try {
      const goodFiles = await fs.readdir(goodAnnotationsDir);
      for (const file of goodFiles.filter(f => f.endsWith('.json'))) {
        results.total++;
        const filePath = path.join(goodAnnotationsDir, file);
        const result = await this.validateAnnotation(filePath);

        if (result.valid) {
          results.valid.push(filePath);
        } else {
          results.invalid.push({ path: filePath, errors: result.errors });
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not read good examples: ${error.message}`);
    }

    // Validate bad examples
    const badAnnotationsDir = path.join(this.trainingDir, 'bad-examples', 'annotations');
    try {
      const badFiles = await fs.readdir(badAnnotationsDir);
      for (const file of badFiles.filter(f => f.endsWith('.json'))) {
        results.total++;
        const filePath = path.join(badAnnotationsDir, file);
        const result = await this.validateAnnotation(filePath);

        if (result.valid) {
          results.valid.push(filePath);
        } else {
          results.invalid.push({ path: filePath, errors: result.errors });
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not read bad examples: ${error.message}`);
    }

    // Print summary
    console.log(`\n📊 Validation Summary:`);
    console.log(`   Total: ${results.total}`);
    console.log(`   Valid: ${results.valid.length} ✅`);
    console.log(`   Invalid: ${results.invalid.length} ❌`);

    if (results.invalid.length > 0) {
      console.log(`\n❌ Invalid annotations:`);
      results.invalid.forEach(item => {
        console.log(`\n   ${path.basename(item.path)}:`);
        item.errors.forEach(err => console.log(`     - ${err}`));
      });
    }

    return results;
  }

  /**
   * Package examples for model training
   */
  async packageExamples(outputPath) {
    console.log(`\n📦 Packaging training examples...`);

    const goodDir = path.join(this.trainingDir, 'good-examples');
    const badDir = path.join(this.trainingDir, 'bad-examples');

    const packageData = {
      created: new Date().toISOString(),
      version: '1.0.0',
      examples: {
        good: [],
        bad: []
      }
    };

    // Package good examples
    try {
      const goodAnnotationsDir = path.join(goodDir, 'annotations');
      const goodFiles = await fs.readdir(goodAnnotationsDir);

      for (const file of goodFiles.filter(f => f.endsWith('.json'))) {
        const annotationPath = path.join(goodAnnotationsDir, file);
        const content = await fs.readFile(annotationPath, 'utf8');
        const annotation = JSON.parse(content);

        const imagePath = path.join(goodDir, `${annotation.documentId}.png`);

        packageData.examples.good.push({
          annotation,
          imagePath: path.relative(this.projectRoot, imagePath)
        });
      }
    } catch (error) {
      console.warn(`⚠️  Could not package good examples: ${error.message}`);
    }

    // Package bad examples
    try {
      const badAnnotationsDir = path.join(badDir, 'annotations');
      const badFiles = await fs.readdir(badAnnotationsDir);

      for (const file of badFiles.filter(f => f.endsWith('.json'))) {
        const annotationPath = path.join(badAnnotationsDir, file);
        const content = await fs.readFile(annotationPath, 'utf8');
        const annotation = JSON.parse(content);

        const imagePath = path.join(badDir, `${annotation.documentId}.png`);

        packageData.examples.bad.push({
          annotation,
          imagePath: path.relative(this.projectRoot, imagePath)
        });
      }
    } catch (error) {
      console.warn(`⚠️  Could not package bad examples: ${error.message}`);
    }

    // Save package
    await fs.writeFile(outputPath, JSON.stringify(packageData, null, 2), 'utf8');

    console.log(`✅ Package saved: ${outputPath}`);
    console.log(`   Good examples: ${packageData.examples.good.length}`);
    console.log(`   Bad examples: ${packageData.examples.bad.length}`);

    return packageData;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const projectRoot = path.resolve(__dirname, '..');
  const creator = new TrainingExampleCreator(projectRoot);

  try {
    await creator.init();

    switch (command) {
      case 'process':
        {
          // Process PDF into training example
          // Usage: node create-training-examples.js process <pdf-path> <category> <document-id> <document-name>
          const [pdfPath, category, documentId, documentName] = args.slice(1);

          if (!pdfPath || !category || !documentId || !documentName) {
            console.error('Usage: process <pdf-path> <category> <document-id> <document-name>');
            console.error('Example: process exports/teei-aws-v1.pdf good teei-aws-approved-v1 "TEEI AWS Partnership (Approved)"');
            process.exit(1);
          }

          if (category !== 'good' && category !== 'bad') {
            console.error('Category must be "good" or "bad"');
            process.exit(1);
          }

          const result = await creator.processPDF(pdfPath, category, documentId, documentName);
          console.log(`\n✅ Created training example: ${result.documentId}`);
        }
        break;

      case 'validate':
        {
          // Validate annotation file or all annotations
          if (args[1]) {
            await creator.validateAnnotation(args[1]);
          } else {
            await creator.validateAllAnnotations();
          }
        }
        break;

      case 'package':
        {
          // Package examples for training
          const outputPath = args[1] || path.join(projectRoot, 'training-examples', 'training-package.json');
          await creator.packageExamples(outputPath);
        }
        break;

      case 'help':
      default:
        console.log(`
Training Example Creator - Few-Shot Learning System

USAGE:
  node create-training-examples.js <command> [options]

COMMANDS:
  process <pdf> <category> <id> <name>    Process PDF into training example
  validate [annotation-path]              Validate annotation(s)
  package [output-path]                   Package examples for training
  help                                    Show this help

EXAMPLES:
  # Process a good example
  node create-training-examples.js process exports/teei-aws-v1.pdf good teei-aws-approved-v1 "TEEI AWS Partnership (Approved)"

  # Process a bad example
  node create-training-examples.js process exports/old-draft.pdf bad teei-aws-draft-v1 "TEEI AWS Draft (Violations)"

  # Validate all annotations
  node create-training-examples.js validate

  # Validate specific annotation
  node create-training-examples.js validate training-examples/good-examples/annotations/example.json

  # Package examples
  node create-training-examples.js package training-examples/training-package.json
        `.trim());
        break;
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await creator.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = TrainingExampleCreator;
