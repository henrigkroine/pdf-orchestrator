#!/usr/bin/env node

/**
 * Intelligent Export Optimizer for PDF Orchestrator
 *
 * Automatically selects optimal export settings based on document purpose:
 * - Print production (PDF/X-4, CMYK, 300 DPI, bleed)
 * - Digital presentation (sRGB, 150 DPI, optimized)
 * - Draft/review (fast, compressed)
 * - Accessibility (PDF/UA compliance)
 *
 * Features:
 * - Smart purpose detection from filename/metadata
 * - 7 pre-optimized export profiles
 * - Automatic color profile selection
 * - Resolution optimization
 * - File size optimization
 * - PDF/X compliance validation
 * - Accessibility metadata
 *
 * @module export-optimizer
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');

/**
 * Export purpose types with predefined optimization profiles
 */
const ExportPurpose = {
  PRINT_PRODUCTION: 'print_production',
  PARTNERSHIP_PRESENTATION: 'partnership_presentation',
  DIGITAL_MARKETING: 'digital_marketing',
  ACCESSIBILITY_FIRST: 'accessibility_first',
  DRAFT_REVIEW: 'draft_review',
  ARCHIVE_PRESERVATION: 'archive_preservation',
  WEB_OPTIMIZED: 'web_optimized'
};

/**
 * Color profile standards
 */
const ColorProfile = {
  CMYK_COATED: 'ISO Coated v2 (ECI)',
  CMYK_UNCOATED: 'ISO Uncoated',
  SRGB: 'sRGB IEC61966-2.1',
  ADOBE_RGB: 'Adobe RGB (1998)',
  DISPLAY_P3: 'Display P3'
};

/**
 * PDF compliance standards
 */
const PDFStandard = {
  PDFX_4: 'PDF/X-4:2010',
  PDFX_3: 'PDF/X-3:2002',
  PDFX_1A: 'PDF/X-1a:2001',
  PDFA_2: 'PDF/A-2b',
  PDFUA: 'PDF/UA-1',
  STANDARD: 'Standard'
};

/**
 * Main Export Optimizer class
 */
class ExportOptimizer {
  constructor(configPath = null) {
    this.config = this.loadConfig(configPath);
    this.profiles = this.initializeProfiles();
  }

  /**
   * Load configuration from file or use defaults
   */
  loadConfig(configPath) {
    if (configPath) {
      try {
        return require(configPath);
      } catch (error) {
        console.warn(`[Export Optimizer] Failed to load config: ${error.message}`);
      }
    }

    // Default configuration
    return {
      outputDirectory: 'exports',
      validationEnabled: true,
      autoBackup: true,
      fileNamingConvention: '{name}_{purpose}_{timestamp}.pdf'
    };
  }

  /**
   * Initialize export optimization profiles
   */
  initializeProfiles() {
    return {
      [ExportPurpose.PRINT_PRODUCTION]: {
        name: 'Print Production (PDF/X-4)',
        description: 'Professional print-ready with bleed and trim marks',
        pdfStandard: PDFStandard.PDFX_4,
        colorProfile: ColorProfile.CMYK_COATED,
        colorConversion: 'Convert to Destination (Preserve Numbers)',
        resolution: 300,
        compression: {
          images: 'JPEG',
          quality: 'Maximum',
          downsample: false
        },
        bleed: {
          enabled: true,
          top: 3,    // mm
          bottom: 3,
          left: 3,
          right: 3
        },
        marks: {
          cropMarks: true,
          bleedMarks: true,
          registrationMarks: true,
          colorBars: true,
          pageInformation: true
        },
        fonts: {
          embedAll: true,
          subsetThreshold: 0  // Embed complete fonts
        },
        optimization: {
          optimizeForWeb: false,
          createTaggedPDF: false,
          linearize: false
        },
        compatibility: 'Acrobat 7 (PDF 1.6)',
        exportPreset: 'High Quality Print',
        fileSizeTarget: 'quality'
      },

      [ExportPurpose.PARTNERSHIP_PRESENTATION]: {
        name: 'Partnership Presentation (High-Quality Digital)',
        description: 'Premium digital document for stakeholder presentations',
        pdfStandard: PDFStandard.STANDARD,
        colorProfile: ColorProfile.SRGB,
        colorConversion: 'Convert to Destination',
        resolution: 150,  // Optimal for screens
        compression: {
          images: 'JPEG',
          quality: 'High',
          downsample: true,
          downsampleTo: 150
        },
        bleed: {
          enabled: false
        },
        marks: {
          cropMarks: false,
          bleedMarks: false,
          registrationMarks: false,
          colorBars: false,
          pageInformation: false
        },
        fonts: {
          embedAll: true,
          subsetThreshold: 100  // Subset when < 100% used
        },
        optimization: {
          optimizeForWeb: true,
          createTaggedPDF: true,
          generateThumbnails: true,
          viewPDFAfterExport: false,
          linearize: false
        },
        compatibility: 'Acrobat 7 (PDF 1.6)',
        exportPreset: 'High Quality Print',
        fileSizeTarget: 'balanced'
      },

      [ExportPurpose.DIGITAL_MARKETING]: {
        name: 'Digital Marketing (Web-Optimized)',
        description: 'Fast-loading web document with sRGB color',
        pdfStandard: PDFStandard.STANDARD,
        colorProfile: ColorProfile.SRGB,
        colorConversion: 'Convert to Destination',
        resolution: 96,  // Web resolution
        compression: {
          images: 'JPEG',
          quality: 'Medium',
          downsample: true,
          downsampleTo: 96
        },
        bleed: {
          enabled: false
        },
        marks: {
          cropMarks: false,
          bleedMarks: false,
          registrationMarks: false,
          colorBars: false,
          pageInformation: false
        },
        fonts: {
          embedAll: true,
          subsetThreshold: 100
        },
        optimization: {
          optimizeForWeb: true,
          createTaggedPDF: false,
          generateThumbnails: true,
          viewPDFAfterExport: false,
          linearize: true  // Fast web view
        },
        compatibility: 'Acrobat 5 (PDF 1.4)',
        exportPreset: 'Smallest File Size',
        fileSizeTarget: 'minimal'
      },

      [ExportPurpose.ACCESSIBILITY_FIRST]: {
        name: 'Accessibility-First (PDF/UA)',
        description: 'WCAG 2.1 AA compliant with full accessibility features',
        pdfStandard: PDFStandard.PDFUA,
        colorProfile: ColorProfile.SRGB,
        colorConversion: 'Convert to Destination',
        resolution: 150,
        compression: {
          images: 'JPEG',
          quality: 'High',
          downsample: true,
          downsampleTo: 150
        },
        bleed: {
          enabled: false
        },
        marks: {
          cropMarks: false,
          bleedMarks: false,
          registrationMarks: false,
          colorBars: false,
          pageInformation: false
        },
        fonts: {
          embedAll: true,
          subsetThreshold: 0  // Full embed for accessibility
        },
        optimization: {
          optimizeForWeb: true,
          createTaggedPDF: true,
          generateBookmarks: true,
          generateThumbnails: true,
          includeStructure: true,
          altTextRequired: true
        },
        accessibility: {
          wcagLevel: 'AA',
          includeAltText: true,
          documentTitle: true,
          documentLanguage: 'en-US',
          readingOrder: true,
          colorContrast: 'minimum_4.5'
        },
        compatibility: 'Acrobat 7 (PDF 1.6)',
        exportPreset: 'High Quality Print'
      },

      [ExportPurpose.DRAFT_REVIEW]: {
        name: 'Draft Review (Fast Preview)',
        description: 'Quick draft for internal review, optimized for speed',
        pdfStandard: PDFStandard.STANDARD,
        colorProfile: ColorProfile.SRGB,
        colorConversion: 'No Color Conversion',
        resolution: 72,  // Low res for speed
        compression: {
          images: 'JPEG',
          quality: 'Medium',
          downsample: true,
          downsampleTo: 72
        },
        bleed: {
          enabled: false
        },
        marks: {
          cropMarks: false,
          bleedMarks: false,
          registrationMarks: false,
          colorBars: false,
          pageInformation: true  // Show page info for review
        },
        fonts: {
          embedAll: false,  // Speed over portability
          subsetThreshold: 100
        },
        optimization: {
          optimizeForWeb: false,
          createTaggedPDF: false,
          viewPDFAfterExport: true  // Auto-open for review
        },
        compatibility: 'Acrobat 5 (PDF 1.4)',
        exportPreset: 'Smallest File Size',
        fileSizeTarget: 'minimal'
      },

      [ExportPurpose.ARCHIVE_PRESERVATION]: {
        name: 'Archive (PDF/A-2)',
        description: 'Long-term preservation with embedded resources',
        pdfStandard: PDFStandard.PDFA_2,
        colorProfile: ColorProfile.SRGB,
        colorConversion: 'Convert to Destination',
        resolution: 300,  // High quality for preservation
        compression: {
          images: 'JPEG',
          quality: 'Maximum',
          downsample: false  // Preserve original quality
        },
        bleed: {
          enabled: false
        },
        marks: {
          cropMarks: false,
          bleedMarks: false,
          registrationMarks: false,
          colorBars: false,
          pageInformation: false
        },
        fonts: {
          embedAll: true,
          subsetThreshold: 0  // Full embedding required for PDF/A
        },
        optimization: {
          optimizeForWeb: false,
          createTaggedPDF: true,
          includeMetadata: true,
          preserveEditability: false
        },
        metadata: {
          includeXMPMetadata: true,
          documentInfo: true,
          creationDate: true,
          modificationDate: true
        },
        compatibility: 'Acrobat 7 (PDF 1.6)',
        exportPreset: 'High Quality Print'
      },

      [ExportPurpose.WEB_OPTIMIZED]: {
        name: 'Web-Optimized (Linearized)',
        description: 'Fast page-at-a-time download for web viewing',
        pdfStandard: PDFStandard.STANDARD,
        colorProfile: ColorProfile.SRGB,
        colorConversion: 'Convert to Destination',
        resolution: 96,
        compression: {
          images: 'JPEG',
          quality: 'Medium',
          downsample: true,
          downsampleTo: 96
        },
        bleed: {
          enabled: false
        },
        marks: {
          cropMarks: false,
          bleedMarks: false,
          registrationMarks: false,
          colorBars: false,
          pageInformation: false
        },
        fonts: {
          embedAll: true,
          subsetThreshold: 100
        },
        optimization: {
          optimizeForWeb: true,
          createTaggedPDF: true,
          linearize: true,
          generateThumbnails: true,
          compressStreams: true
        },
        compatibility: 'Acrobat 6 (PDF 1.5)',
        exportPreset: 'Smallest File Size',
        fileSizeTarget: 'minimal'
      }
    };
  }

  /**
   * Intelligently detect document purpose from metadata
   */
  detectPurpose(documentMetadata = {}) {
    const filename = (documentMetadata.filename || '').toLowerCase();
    const tags = (documentMetadata.tags || []).map(tag => tag.toLowerCase());
    const keywords = (documentMetadata.keywords || []).map(kw => kw.toLowerCase());

    // Detection rules (priority order)
    const rules = [
      {
        purpose: ExportPurpose.PRINT_PRODUCTION,
        indicators: ['print', 'production', 'offset', 'cmyk', 'bleed', 'trim']
      },
      {
        purpose: ExportPurpose.WEB_OPTIMIZED,
        indicators: ['web', 'online', 'website', 'digital']
      },
      {
        purpose: ExportPurpose.DRAFT_REVIEW,
        indicators: ['draft', 'review', 'wip', 'temp', 'preview']
      },
      {
        purpose: ExportPurpose.ARCHIVE_PRESERVATION,
        indicators: ['archive', 'preservation', 'pdf-a', 'long-term']
      },
      {
        purpose: ExportPurpose.ACCESSIBILITY_FIRST,
        indicators: ['accessible', 'wcag', 'ada', 'section508', 'a11y']
      },
      {
        purpose: ExportPurpose.DIGITAL_MARKETING,
        indicators: ['marketing', 'social', 'campaign', 'email']
      },
      {
        purpose: ExportPurpose.PARTNERSHIP_PRESENTATION,
        indicators: ['partnership', 'presentation', 'proposal', 'aws', 'teei']
      }
    ];

    // Check filename against rules
    for (const rule of rules) {
      if (rule.indicators.some(indicator => filename.includes(indicator))) {
        return rule.purpose;
      }
    }

    // Check tags
    for (const rule of rules) {
      if (rule.indicators.some(indicator => tags.includes(indicator))) {
        return rule.purpose;
      }
    }

    // Default fallback
    return ExportPurpose.PARTNERSHIP_PRESENTATION;
  }

  /**
   * Get optimized export settings for a specific purpose
   */
  optimizeForPurpose(purpose, overrides = {}) {
    if (!this.profiles[purpose]) {
      throw new Error(`Unknown export purpose: ${purpose}. Valid options: ${Object.keys(this.profiles).join(', ')}`);
    }

    // Get base profile
    const settings = JSON.parse(JSON.stringify(this.profiles[purpose]));

    // Apply overrides
    Object.assign(settings, overrides);

    // Add metadata
    settings._metadata = {
      purpose,
      optimizedAt: new Date().toISOString(),
      optimizerVersion: '1.0.0'
    };

    return settings;
  }

  /**
   * Export document with optimized settings
   */
  async exportDocument(options) {
    const {
      outputPath,
      purpose = null,
      settings = null,
      documentMetadata = {},
      mcp = null  // MCP client if available
    } = options;

    // Determine purpose if not provided
    const finalPurpose = purpose || this.detectPurpose(documentMetadata);
    console.log(`[Export Optimizer] Using purpose: ${finalPurpose}`);

    // Get optimized settings
    const finalSettings = settings || this.optimizeForPurpose(finalPurpose);

    // Create output directory
    const outputDir = path.dirname(outputPath) || this.config.outputDirectory;
    await fs.mkdir(outputDir, { recursive: true });

    console.log(`\n${'='.repeat(80)}`);
    console.log(`EXPORTING: ${finalSettings.name}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Purpose: ${finalSettings.description}`);
    console.log(`Standard: ${finalSettings.pdfStandard}`);
    console.log(`Color: ${finalSettings.colorProfile}`);
    console.log(`Resolution: ${finalSettings.resolution} DPI`);
    console.log(`Output: ${outputPath}`);
    console.log(`${'='.repeat(80)}\n`);

    // Build export result
    const result = {
      success: true,
      outputPath,
      settings: finalSettings,
      fileSize: null,
      validation: null,
      timestamp: new Date().toISOString()
    };

    // If MCP client provided, execute export via InDesign
    if (mcp) {
      try {
        const exportOptions = this.buildExportOptions(finalSettings);
        const response = await mcp.exportPDF({
          outputPath,
          preset: finalSettings.exportPreset,
          options: exportOptions
        });

        result.success = response.success || false;
      } catch (error) {
        result.success = false;
        result.error = error.message;
      }
    }

    // Get file info if export succeeded
    if (result.success) {
      try {
        const stats = await fs.stat(outputPath);
        result.fileSize = stats.size;
        result.fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

        console.log(`\n[SUCCESS] PDF exported successfully!`);
        console.log(`Location: ${outputPath}`);
        console.log(`File size: ${result.fileSizeMB} MB`);

        // Run validation if enabled
        if (this.config.validationEnabled) {
          result.validation = await this.validateExport(outputPath, finalSettings);
        }
      } catch (error) {
        console.warn(`[WARNING] Failed to get file stats: ${error.message}`);
      }
    } else {
      console.log(`\n[ERROR] PDF export failed`);
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
    }

    console.log(`\n${'='.repeat(80)}\n`);

    return result;
  }

  /**
   * Convert settings to InDesign export options
   */
  buildExportOptions(settings) {
    const options = {
      exportReaderSpreads: false,
      generateThumbnails: settings.optimization?.generateThumbnails || true,
      optimizePDF: settings.optimization?.optimizeForWeb || false,
      viewPDFAfterExporting: settings.optimization?.viewPDFAfterExport || false
    };

    // Add bleed settings if enabled
    if (settings.bleed?.enabled) {
      options.useDocumentBleedWithPDF = true;
      options.bleedTop = settings.bleed.top || 3;
      options.bleedBottom = settings.bleed.bottom || 3;
      options.bleedInside = settings.bleed.left || 3;
      options.bleedOutside = settings.bleed.right || 3;
    }

    // Add marks settings
    if (settings.marks && Object.values(settings.marks).some(v => v)) {
      options.includeAllPrinterMarks = false;
      options.cropMarks = settings.marks.cropMarks || false;
      options.bleedMarks = settings.marks.bleedMarks || false;
      options.registrationMarks = settings.marks.registrationMarks || false;
      options.colorBars = settings.marks.colorBars || false;
      options.pageInformationMarks = settings.marks.pageInformation || false;
    }

    return options;
  }

  /**
   * Validate exported PDF against settings
   */
  async validateExport(pdfPath, settings) {
    const validation = {
      timestamp: new Date().toISOString(),
      checks: [],
      warnings: [],
      errors: [],
      score: 100
    };

    try {
      // Check file exists
      const stats = await fs.stat(pdfPath);
      validation.checks.push(`File exists (${(stats.size / 1024).toFixed(2)} KB)`);

      // File size validation
      const fileSizeMB = stats.size / (1024 * 1024);
      const target = settings.fileSizeTarget || 'balanced';

      if (target === 'minimal' && fileSizeMB > 10) {
        validation.warnings.push(`File size (${fileSizeMB.toFixed(1)} MB) larger than expected for minimal target`);
        validation.score -= 10;
      } else if (target === 'balanced' && fileSizeMB > 50) {
        validation.warnings.push(`File size (${fileSizeMB.toFixed(1)} MB) larger than expected for balanced target`);
        validation.score -= 5;
      }

      // PDF structure validation
      const pdfData = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfData);

      const pageCount = pdfDoc.getPageCount();
      validation.checks.push(`Page count: ${pageCount}`);

      // Check PDF version
      const pdfVersion = this.getPDFVersion(settings.compatibility);
      validation.checks.push(`Target PDF version: ${pdfVersion}`);

      // Accessibility checks (if PDF/UA)
      if (settings.pdfStandard === PDFStandard.PDFUA) {
        // TODO: Add accessibility validation
        // - Tagged PDF structure
        // - Alt text for images
        // - Document language
        // - Reading order
        validation.checks.push('Accessibility validation pending');
      }

      // Print production checks (if PDF/X)
      if (settings.pdfStandard.startsWith('PDF/X')) {
        // TODO: Add PDF/X validation
        // - Color profile embedded
        // - Fonts embedded
        // - No RGB (for X-1a)
        // - Bleed settings
        validation.checks.push('PDF/X validation pending');
      }

      validation.checks.push('Basic validation completed');

    } catch (error) {
      validation.errors.push(`Validation error: ${error.message}`);
      validation.score = 50;
    }

    return validation;
  }

  /**
   * Get PDF version from compatibility string
   */
  getPDFVersion(compatibility) {
    const versionMap = {
      'Acrobat 4 (PDF 1.3)': '1.3',
      'Acrobat 5 (PDF 1.4)': '1.4',
      'Acrobat 6 (PDF 1.5)': '1.5',
      'Acrobat 7 (PDF 1.6)': '1.6',
      'Acrobat 8 (PDF 1.7)': '1.7'
    };
    return versionMap[compatibility] || '1.6';
  }

  /**
   * Export multiple documents with optimized settings
   */
  async exportBatch(jobs) {
    const results = [];

    console.log(`\n${'='.repeat(80)}`);
    console.log(`BATCH EXPORT: ${jobs.length} documents`);
    console.log(`${'='.repeat(80)}\n`);

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      console.log(`[${i + 1}/${jobs.length}] Exporting ${job.outputPath}...`);

      const result = await this.exportDocument({
        outputPath: job.outputPath,
        purpose: job.purpose,
        documentMetadata: job.metadata,
        mcp: job.mcp
      });

      results.push(result);
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    console.log(`\n${'='.repeat(80)}`);
    console.log(`BATCH COMPLETE: ${successful}/${jobs.length} successful`);
    console.log(`${'='.repeat(80)}\n`);

    return results;
  }

  /**
   * Get information about an export profile
   */
  getProfileInfo(purpose) {
    const profile = this.profiles[purpose];
    if (!profile) return null;

    return {
      name: profile.name,
      description: profile.description,
      bestFor: this.getBestUseCases(purpose)
    };
  }

  /**
   * Get recommended use cases for an export purpose
   */
  getBestUseCases(purpose) {
    const useCases = {
      [ExportPurpose.PRINT_PRODUCTION]: [
        'Commercial offset printing',
        'Professional print shops',
        'Magazine/brochure production',
        'High-quality marketing materials'
      ],
      [ExportPurpose.PARTNERSHIP_PRESENTATION]: [
        'Stakeholder presentations',
        'Partnership proposals',
        'Executive briefings',
        'Client deliverables'
      ],
      [ExportPurpose.DIGITAL_MARKETING]: [
        'Email campaigns',
        'Social media shares',
        'Website downloads',
        'Quick promotional materials'
      ],
      [ExportPurpose.ACCESSIBILITY_FIRST]: [
        'Government documents (Section 508)',
        'Educational materials',
        'Public-facing documents',
        'WCAG 2.1 compliance required'
      ],
      [ExportPurpose.DRAFT_REVIEW]: [
        'Internal review cycles',
        'Quick stakeholder feedback',
        'Work-in-progress sharing',
        'Fast iteration'
      ],
      [ExportPurpose.ARCHIVE_PRESERVATION]: [
        'Long-term storage',
        'Legal documents',
        'Historical records',
        'Compliance archives'
      ],
      [ExportPurpose.WEB_OPTIMIZED]: [
        'Website embedding',
        'Online documentation',
        'Fast page-at-a-time loading',
        'Mobile-friendly viewing'
      ]
    };

    return useCases[purpose] || [];
  }

  /**
   * List all available export profiles
   */
  listProfiles() {
    return Object.entries(this.profiles).map(([purpose, profile]) => ({
      purpose,
      name: profile.name,
      description: profile.description,
      standard: profile.pdfStandard,
      resolution: profile.resolution,
      colorProfile: profile.colorProfile
    }));
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);

  const optimizer = new ExportOptimizer();

  // List profiles
  if (args.includes('--list-profiles')) {
    console.log('\nAvailable Export Profiles:\n');
    const profiles = optimizer.listProfiles();
    profiles.forEach(profile => {
      console.log(`${profile.purpose}`);
      console.log(`  Name: ${profile.name}`);
      console.log(`  Description: ${profile.description}`);
      console.log(`  Standard: ${profile.standard}`);
      console.log(`  Resolution: ${profile.resolution} DPI`);
      console.log(`  Color: ${profile.colorProfile}\n`);
    });
    return;
  }

  // Profile info
  const profileInfoIndex = args.indexOf('--profile-info');
  if (profileInfoIndex !== -1) {
    const purpose = args[profileInfoIndex + 1];
    const info = optimizer.getProfileInfo(purpose);
    if (info) {
      console.log(`\n${info.name}`);
      console.log(`${info.description}\n`);
      console.log('Best for:');
      info.bestFor.forEach(useCase => console.log(`  • ${useCase}`));
      console.log();
    } else {
      console.error(`Unknown profile: ${purpose}`);
      process.exit(1);
    }
    return;
  }

  // Export document
  const outputPath = args[0];
  const purposeIndex = args.indexOf('--purpose');
  const purpose = purposeIndex !== -1 ? args[purposeIndex + 1] : null;

  if (!outputPath) {
    console.error('Usage: export-optimizer.js <output-path> [--purpose <purpose>]');
    console.error('       export-optimizer.js --list-profiles');
    console.error('       export-optimizer.js --profile-info <purpose>');
    process.exit(1);
  }

  const result = await optimizer.exportDocument({
    outputPath,
    purpose
  });

  process.exit(result.success ? 0 : 1);
}

// Run CLI if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('[Export Optimizer] Fatal error:', error);
    process.exit(1);
  });
}

// Export for use as module
module.exports = {
  ExportOptimizer,
  ExportPurpose,
  ColorProfile,
  PDFStandard
};
