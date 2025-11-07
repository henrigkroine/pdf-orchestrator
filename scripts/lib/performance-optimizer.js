#!/usr/bin/env node

/**
 * PDF Performance Optimizer - Core Engine
 *
 * AI-powered PDF optimization system with multi-model integration:
 * - GPT-4o: File size and structure optimization
 * - GPT-5: Rendering optimization
 * - Claude Opus 4.1: Loading strategy and compatibility
 * - Claude Sonnet 4.5: Font optimization
 * - Gemini 2.5 Pro Vision: Image quality assessment
 *
 * 8 Optimization Categories:
 * 1. File Size Optimization
 * 2. Loading Performance
 * 3. Rendering Performance
 * 4. Image Optimization
 * 5. Font Optimization
 * 6. PDF Structure Optimization
 * 7. Interactive Element Optimization
 * 8. Compatibility vs Performance
 */

const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');

// Import specialized optimizers
const FileSizeOptimizer = require('./file-size-optimizer');
const LoadingOptimizer = require('./loading-optimizer');
const RenderingOptimizer = require('./rendering-optimizer');
const ImageOptimizer = require('./image-optimizer-advanced');
const FontOptimizer = require('./font-optimizer');
const PDFStructureOptimizer = require('./pdf-structure-optimizer');
const InteractiveOptimizer = require('./interactive-optimizer');
const PerformanceAnalyzer = require('./performance-analyzer');
const CompatibilityAnalyzer = require('./compatibility-analyzer');

// AI Integration
const { OpenAI } = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class PerformanceOptimizer {
  constructor(options = {}) {
    this.options = this.loadConfiguration(options);
    this.preset = options.preset || 'balanced';
    this.presetConfig = this.options.optimizationPresets[this.preset];

    // Initialize AI clients
    this.initializeAI();

    // Initialize specialized optimizers
    this.fileSizeOptimizer = new FileSizeOptimizer(this.options, this.aiClients);
    this.loadingOptimizer = new LoadingOptimizer(this.options, this.aiClients);
    this.renderingOptimizer = new RenderingOptimizer(this.options, this.aiClients);
    this.imageOptimizer = new ImageOptimizer(this.options, this.aiClients);
    this.fontOptimizer = new FontOptimizer(this.options, this.aiClients);
    this.structureOptimizer = new PDFStructureOptimizer(this.options, this.aiClients);
    this.interactiveOptimizer = new InteractiveOptimizer(this.options, this.aiClients);
    this.performanceAnalyzer = new PerformanceAnalyzer(this.options);
    this.compatibilityAnalyzer = new CompatibilityAnalyzer(this.options, this.aiClients);

    // Optimization metrics
    this.metrics = {
      originalSize: 0,
      optimizedSize: 0,
      reductionBytes: 0,
      reductionPercent: 0,
      startTime: null,
      endTime: null,
      duration: 0,
      optimizations: {},
      aiRecommendations: [],
      performanceScore: {
        before: 0,
        after: 0,
        improvement: 0
      }
    };

    // Logging
    this.logger = options.logger || console;
    this.verbose = options.verbose || false;
  }

  /**
   * Load configuration from file
   */
  loadConfiguration(options) {
    try {
      const configPath = path.join(__dirname, '../../config/performance-config.json');
      const configData = require(configPath);
      return { ...configData, ...options };
    } catch (error) {
      this.logger.warn('Could not load performance config, using defaults:', error.message);
      return options;
    }
  }

  /**
   * Initialize AI clients
   */
  initializeAI() {
    this.aiClients = {};

    try {
      // OpenAI (GPT-4o, GPT-5)
      if (process.env.OPENAI_API_KEY) {
        this.aiClients.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        });
      }

      // Anthropic (Claude Opus 4.1, Sonnet 4.5)
      if (process.env.ANTHROPIC_API_KEY) {
        this.aiClients.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });
      }

      // Google (Gemini 2.5 Pro Vision)
      if (process.env.GOOGLE_API_KEY) {
        this.aiClients.google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      }

      this.log('AI clients initialized successfully');
    } catch (error) {
      this.logger.warn('AI initialization warning:', error.message);
    }
  }

  /**
   * Main optimization entry point
   */
  async optimize(pdfPath, outputPath = null) {
    this.metrics.startTime = Date.now();

    try {
      this.log('\n=== PDF Performance Optimization Started ===');
      this.log(`Preset: ${this.preset}`);
      this.log(`Input: ${pdfPath}`);

      // Step 1: Load and analyze PDF
      this.log('\n[1/9] Loading and analyzing PDF...');
      const pdfData = await fs.readFile(pdfPath);
      this.metrics.originalSize = pdfData.length;
      this.log(`Original size: ${this.formatBytes(this.metrics.originalSize)}`);

      const pdfDoc = await PDFDocument.load(pdfData, {
        updateMetadata: false,
        ignoreEncryption: true
      });

      // Step 2: Performance analysis (baseline)
      this.log('\n[2/9] Analyzing baseline performance...');
      const baselineAnalysis = await this.performanceAnalyzer.analyze(pdfPath, pdfDoc);
      this.metrics.performanceScore.before = baselineAnalysis.overallScore;
      this.log(`Baseline performance score: ${baselineAnalysis.overallScore}/100`);
      this.logPerformanceBreakdown(baselineAnalysis);

      // Step 3: Compatibility analysis
      this.log('\n[3/9] Analyzing compatibility requirements...');
      const compatibilityAnalysis = await this.compatibilityAnalyzer.analyze(pdfDoc);
      this.log(`PDF Version: ${compatibilityAnalysis.version}`);
      this.log(`Compatibility: ${compatibilityAnalysis.readerCompatibility}`);

      // Step 4: Get AI optimization strategy
      if (this.presetConfig.aiAssistance === 'full') {
        this.log('\n[4/9] Requesting AI optimization strategy...');
        await this.getAIOptimizationStrategy(baselineAnalysis, compatibilityAnalysis);
      } else {
        this.log('\n[4/9] Using preset-based optimization strategy...');
      }

      // Step 5: Image optimization
      this.log('\n[5/9] Optimizing images...');
      const imageResults = await this.imageOptimizer.optimizeImages(pdfDoc, this.presetConfig);
      this.metrics.optimizations.images = imageResults;
      this.log(`Images optimized: ${imageResults.optimized}/${imageResults.total}`);
      this.log(`Image size reduction: ${this.formatBytes(imageResults.bytesReduced)}`);

      // Step 6: Font optimization
      this.log('\n[6/9] Optimizing fonts...');
      const fontResults = await this.fontOptimizer.optimizeFonts(pdfDoc, this.presetConfig);
      this.metrics.optimizations.fonts = fontResults;
      this.log(`Fonts optimized: ${fontResults.optimized}/${fontResults.total}`);
      this.log(`Font size reduction: ${this.formatBytes(fontResults.bytesReduced)}`);

      // Step 7: Structure optimization
      this.log('\n[7/9] Optimizing PDF structure...');
      const structureResults = await this.structureOptimizer.optimizeStructure(pdfDoc, this.presetConfig);
      this.metrics.optimizations.structure = structureResults;
      this.log(`Objects optimized: ${structureResults.objectsOptimized}`);
      this.log(`Structure size reduction: ${this.formatBytes(structureResults.bytesReduced)}`);

      // Step 8: Rendering optimization
      this.log('\n[8/9] Optimizing rendering performance...');
      const renderingResults = await this.renderingOptimizer.optimizeRendering(pdfDoc, this.presetConfig);
      this.metrics.optimizations.rendering = renderingResults;
      this.log(`Paths simplified: ${renderingResults.pathsSimplified}`);
      this.log(`Transparency optimized: ${renderingResults.transparencyOptimized}`);

      // Step 9: Interactive element optimization
      if (baselineAnalysis.interactiveElements > 0) {
        this.log('\n[9/9] Optimizing interactive elements...');
        const interactiveResults = await this.interactiveOptimizer.optimizeInteractive(pdfDoc, this.presetConfig);
        this.metrics.optimizations.interactive = interactiveResults;
        this.log(`Forms optimized: ${interactiveResults.formsOptimized}`);
        this.log(`JavaScript optimized: ${interactiveResults.scriptsOptimized}`);
      } else {
        this.log('\n[9/9] No interactive elements to optimize');
      }

      // Apply loading optimization (linearization, object streams)
      this.log('\nApplying loading optimizations...');
      await this.loadingOptimizer.optimizeLoading(pdfDoc, this.presetConfig);

      // Save optimized PDF
      this.log('\nSaving optimized PDF...');
      const optimizedData = await pdfDoc.save({
        useObjectStreams: this.presetConfig.objectStreams,
        addDefaultPage: false,
        objectsPerTick: 50
      });

      // Determine output path
      if (!outputPath) {
        const parsedPath = path.parse(pdfPath);
        outputPath = path.join(
          parsedPath.dir,
          `${parsedPath.name}-optimized-${this.preset}${parsedPath.ext}`
        );
      }

      await fs.writeFile(outputPath, optimizedData);
      this.metrics.optimizedSize = optimizedData.length;

      // Apply post-processing optimizations (linearization via ghostscript if needed)
      if (this.presetConfig.linearization && this.options.useGhostscript) {
        this.log('\nApplying linearization (Fast Web View)...');
        await this.applyLinearization(outputPath);
      }

      // Final metrics
      this.metrics.endTime = Date.now();
      this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
      this.metrics.reductionBytes = this.metrics.originalSize - this.metrics.optimizedSize;
      this.metrics.reductionPercent = (this.metrics.reductionBytes / this.metrics.originalSize) * 100;

      // Analyze optimized performance
      this.log('\nAnalyzing optimized performance...');
      const optimizedPdfDoc = await PDFDocument.load(optimizedData);
      const optimizedAnalysis = await this.performanceAnalyzer.analyze(outputPath, optimizedPdfDoc);
      this.metrics.performanceScore.after = optimizedAnalysis.overallScore;
      this.metrics.performanceScore.improvement =
        optimizedAnalysis.overallScore - baselineAnalysis.overallScore;

      // Generate report
      const report = this.generateReport(baselineAnalysis, optimizedAnalysis);

      this.log('\n=== Optimization Complete ===');
      this.log(`Output: ${outputPath}`);
      this.log(`Final size: ${this.formatBytes(this.metrics.optimizedSize)}`);
      this.log(`Reduction: ${this.formatBytes(this.metrics.reductionBytes)} (${this.metrics.reductionPercent.toFixed(1)}%)`);
      this.log(`Performance score: ${baselineAnalysis.overallScore} → ${optimizedAnalysis.overallScore} (+${this.metrics.performanceScore.improvement.toFixed(1)})`);
      this.log(`Duration: ${(this.metrics.duration / 1000).toFixed(2)}s`);

      return {
        success: true,
        outputPath,
        metrics: this.metrics,
        report,
        baselineAnalysis,
        optimizedAnalysis
      };

    } catch (error) {
      this.logger.error('Optimization failed:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered optimization strategy
   */
  async getAIOptimizationStrategy(baselineAnalysis, compatibilityAnalysis) {
    const recommendations = [];

    try {
      // File size optimization strategy (GPT-4o)
      if (this.aiClients.openai && baselineAnalysis.fileSizeScore < 85) {
        this.log('  Consulting GPT-4o for file size strategy...');
        const fileSizeStrategy = await this.getFileSizeStrategy(baselineAnalysis);
        recommendations.push({
          category: 'fileSize',
          model: 'gpt-4o',
          recommendations: fileSizeStrategy
        });
      }

      // Rendering optimization strategy (GPT-5)
      if (this.aiClients.openai && baselineAnalysis.renderingScore < 85) {
        this.log('  Consulting GPT-5 for rendering strategy...');
        const renderingStrategy = await this.getRenderingStrategy(baselineAnalysis);
        recommendations.push({
          category: 'rendering',
          model: 'gpt-5',
          recommendations: renderingStrategy
        });
      }

      // Loading optimization strategy (Claude Opus 4.1)
      if (this.aiClients.anthropic && baselineAnalysis.loadingScore < 85) {
        this.log('  Consulting Claude Opus 4.1 for loading strategy...');
        const loadingStrategy = await this.getLoadingStrategy(baselineAnalysis, compatibilityAnalysis);
        recommendations.push({
          category: 'loading',
          model: 'claude-opus-4.1',
          recommendations: loadingStrategy
        });
      }

      // Font optimization strategy (Claude Sonnet 4.5)
      if (this.aiClients.anthropic && baselineAnalysis.fontOptimizationScore < 85) {
        this.log('  Consulting Claude Sonnet 4.5 for font strategy...');
        const fontStrategy = await this.getFontStrategy(baselineAnalysis);
        recommendations.push({
          category: 'fonts',
          model: 'claude-sonnet-4.5',
          recommendations: fontStrategy
        });
      }

      // Image optimization strategy (Gemini 2.5 Pro Vision)
      if (this.aiClients.google && baselineAnalysis.imageOptimizationScore < 85) {
        this.log('  Consulting Gemini 2.5 Pro Vision for image strategy...');
        const imageStrategy = await this.getImageStrategy(baselineAnalysis);
        recommendations.push({
          category: 'images',
          model: 'gemini-2.5-pro-vision',
          recommendations: imageStrategy
        });
      }

      this.metrics.aiRecommendations = recommendations;
      this.log(`  Received ${recommendations.length} AI recommendations`);

    } catch (error) {
      this.logger.warn('AI strategy generation warning:', error.message);
    }
  }

  /**
   * Get file size optimization strategy from GPT-4o
   */
  async getFileSizeStrategy(analysis) {
    const prompt = `Analyze this PDF and provide specific file size optimization strategies:

PDF Statistics:
- Total file size: ${this.formatBytes(analysis.fileSize)}
- Image data: ${this.formatBytes(analysis.breakdown.images)} (${analysis.breakdown.imagePercent}%)
- Font data: ${this.formatBytes(analysis.breakdown.fonts)} (${analysis.breakdown.fontPercent}%)
- Content streams: ${this.formatBytes(analysis.breakdown.content)} (${analysis.breakdown.contentPercent}%)
- Metadata: ${this.formatBytes(analysis.breakdown.metadata)} (${analysis.breakdown.metadataPercent}%)
- Number of images: ${analysis.imageCount}
- Number of fonts: ${analysis.fontCount}
- Number of pages: ${analysis.pageCount}

Current Preset: ${this.preset}
Target Reduction: ${this.presetConfig.targetReduction}%

Provide 3-5 specific optimization recommendations prioritized by expected file size reduction. For each recommendation:
1. Optimization technique
2. Expected size reduction (%)
3. Quality impact (minimal/moderate/significant)
4. Implementation priority (high/medium/low)`;

    try {
      const response = await this.aiClients.openai.chat.completions.create({
        model: this.options.aiModels.fileSize.model,
        messages: [
          {
            role: 'system',
            content: this.options.aiModels.fileSize.systemPrompt
          },
          { role: 'user', content: prompt }
        ],
        temperature: this.options.aiModels.fileSize.temperature,
        max_tokens: this.options.aiModels.fileSize.maxTokens
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.warn('GPT-4o file size strategy error:', error.message);
      return null;
    }
  }

  /**
   * Get rendering optimization strategy from GPT-5
   */
  async getRenderingStrategy(analysis) {
    const prompt = `Analyze this PDF's rendering complexity and provide optimization strategies:

Rendering Statistics:
- Total paths: ${analysis.renderingComplexity.paths}
- Transparency effects: ${analysis.renderingComplexity.transparency}
- Layers: ${analysis.renderingComplexity.layers}
- Form XObjects: ${analysis.renderingComplexity.formXObjects}
- Complexity score: ${analysis.renderingScore}/100

Current Preset: ${this.preset}
Transparency flattening: ${this.presetConfig.transparencyFlattening ? 'enabled' : 'disabled'}
Path simplification: ${this.presetConfig.pathSimplification ? 'enabled' : 'disabled'}

Provide 3-5 specific rendering optimization recommendations. For each:
1. Optimization technique (path simplification, transparency flattening, layer merging, etc.)
2. Expected rendering time improvement (%)
3. Visual quality impact (minimal/moderate/significant)
4. Compatibility considerations
5. Implementation priority (high/medium/low)`;

    try {
      const response = await this.aiClients.openai.chat.completions.create({
        model: this.options.aiModels.rendering.model,
        messages: [
          {
            role: 'system',
            content: this.options.aiModels.rendering.systemPrompt
          },
          { role: 'user', content: prompt }
        ],
        temperature: this.options.aiModels.rendering.temperature,
        max_tokens: this.options.aiModels.rendering.maxTokens
      });

      return response.choices[0].message.content;
    } catch (error) {
      this.logger.warn('GPT-5 rendering strategy error:', error.message);
      return null;
    }
  }

  /**
   * Get loading optimization strategy from Claude Opus 4.1
   */
  async getLoadingStrategy(analysis, compatibilityAnalysis) {
    const prompt = `Analyze this PDF's loading performance and provide optimization strategies:

Loading Statistics:
- File size: ${this.formatBytes(analysis.fileSize)}
- Page count: ${analysis.pageCount}
- Linearized: ${analysis.isLinearized ? 'Yes' : 'No'}
- Object streams: ${analysis.hasObjectStreams ? 'Yes' : 'No'}
- Cross-reference type: ${analysis.xrefType}
- Loading score: ${analysis.loadingScore}/100

Compatibility:
- PDF version: ${compatibilityAnalysis.version}
- Target readers: ${compatibilityAnalysis.readerCompatibility}

Network Targets:
- 4G: ${this.options.loadingTimeTargets['4G'].targetTime}ms
- WiFi: ${this.options.loadingTimeTargets.wifi.targetTime}ms

Current Preset: ${this.preset}
Linearization: ${this.presetConfig.linearization ? 'enabled' : 'disabled'}
Object streams: ${this.presetConfig.objectStreams ? 'enabled' : 'disabled'}

Provide 3-5 specific loading optimization recommendations considering compatibility. For each:
1. Optimization technique (linearization, object streams, page order, etc.)
2. Expected loading time improvement (ms or %)
3. Compatibility impact (which readers/versions)
4. Implementation complexity (easy/moderate/complex)
5. Priority (high/medium/low)`;

    try {
      const response = await this.aiClients.anthropic.messages.create({
        model: this.options.aiModels.loading.model,
        max_tokens: this.options.aiModels.loading.maxTokens,
        temperature: this.options.aiModels.loading.temperature,
        system: this.options.aiModels.loading.systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      return response.content[0].text;
    } catch (error) {
      this.logger.warn('Claude Opus 4.1 loading strategy error:', error.message);
      return null;
    }
  }

  /**
   * Get font optimization strategy from Claude Sonnet 4.5
   */
  async getFontStrategy(analysis) {
    const prompt = `Analyze this PDF's font usage and provide optimization strategies:

Font Statistics:
- Total fonts: ${analysis.fontCount}
- Total font data: ${this.formatBytes(analysis.breakdown.fonts)}
- Embedded fonts: ${analysis.embeddedFonts}
- Subsetted fonts: ${analysis.subsettedFonts}
- Font optimization score: ${analysis.fontOptimizationScore}/100

Current Preset: ${this.preset}
Font subsetting: ${this.presetConfig.fontSubsetting ? 'enabled' : 'disabled'}
Font deduplication: ${this.presetConfig.fontDeduplication ? 'enabled' : 'disabled'}

Provide 3-5 specific font optimization recommendations. For each:
1. Optimization technique (subsetting, deduplication, format optimization, etc.)
2. Expected size reduction (bytes or %)
3. Text quality impact (minimal/moderate/significant)
4. Accessibility considerations
5. Priority (high/medium/low)`;

    try {
      const response = await this.aiClients.anthropic.messages.create({
        model: this.options.aiModels.fonts.model,
        max_tokens: this.options.aiModels.fonts.maxTokens,
        temperature: this.options.aiModels.fonts.temperature,
        system: this.options.aiModels.fonts.systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      return response.content[0].text;
    } catch (error) {
      this.logger.warn('Claude Sonnet 4.5 font strategy error:', error.message);
      return null;
    }
  }

  /**
   * Get image optimization strategy from Gemini 2.5 Pro Vision
   */
  async getImageStrategy(analysis) {
    const prompt = `Analyze this PDF's image usage and provide optimization strategies:

Image Statistics:
- Total images: ${analysis.imageCount}
- Total image data: ${this.formatBytes(analysis.breakdown.images)}
- Average image size: ${this.formatBytes(analysis.breakdown.images / Math.max(1, analysis.imageCount))}
- Image optimization score: ${analysis.imageOptimizationScore}/100

Current Preset: ${this.preset}
Target DPI (color): ${this.presetConfig.imageDPI.color}
Target JPEG quality: ${this.presetConfig.imageQuality}

Provide 3-5 specific image optimization recommendations. For each:
1. Optimization technique (compression, downsampling, format conversion, etc.)
2. Expected size reduction (%)
3. Perceptual quality impact (minimal/moderate/significant)
4. Recommended settings (DPI, quality, format)
5. Priority (high/medium/low)

Consider both file size reduction and visual quality maintenance.`;

    try {
      const model = this.aiClients.google.getGenerativeModel({
        model: this.options.aiModels.images.model
      });

      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: this.options.aiModels.images.temperature,
          maxOutputTokens: this.options.aiModels.images.maxTokens
        },
        systemInstruction: this.options.aiModels.images.systemPrompt
      });

      return result.response.text();
    } catch (error) {
      this.logger.warn('Gemini 2.5 Pro Vision image strategy error:', error.message);
      return null;
    }
  }

  /**
   * Apply linearization using ghostscript
   */
  async applyLinearization(pdfPath) {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      const tempPath = pdfPath.replace('.pdf', '-temp.pdf');
      await fs.rename(pdfPath, tempPath);

      const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.7 -dFastWebView=true -dNOPAUSE -dBATCH -dQUIET -sOutputFile="${pdfPath}" "${tempPath}"`;

      await execAsync(command);
      await fs.unlink(tempPath);

      this.log('  Linearization applied successfully');
    } catch (error) {
      this.logger.warn('Linearization warning:', error.message);
    }
  }

  /**
   * Generate optimization report
   */
  generateReport(baselineAnalysis, optimizedAnalysis) {
    const report = {
      timestamp: new Date().toISOString(),
      preset: this.preset,

      summary: {
        originalSize: this.metrics.originalSize,
        optimizedSize: this.metrics.optimizedSize,
        reductionBytes: this.metrics.reductionBytes,
        reductionPercent: this.metrics.reductionPercent,
        duration: this.metrics.duration
      },

      performance: {
        before: {
          overallScore: baselineAnalysis.overallScore,
          fileSizeScore: baselineAnalysis.fileSizeScore,
          loadingScore: baselineAnalysis.loadingScore,
          renderingScore: baselineAnalysis.renderingScore,
          imageOptimizationScore: baselineAnalysis.imageOptimizationScore,
          fontOptimizationScore: baselineAnalysis.fontOptimizationScore
        },
        after: {
          overallScore: optimizedAnalysis.overallScore,
          fileSizeScore: optimizedAnalysis.fileSizeScore,
          loadingScore: optimizedAnalysis.loadingScore,
          renderingScore: optimizedAnalysis.renderingScore,
          imageOptimizationScore: optimizedAnalysis.imageOptimizationScore,
          fontOptimizationScore: optimizedAnalysis.fontOptimizationScore
        },
        improvement: {
          overall: optimizedAnalysis.overallScore - baselineAnalysis.overallScore,
          fileSize: optimizedAnalysis.fileSizeScore - baselineAnalysis.fileSizeScore,
          loading: optimizedAnalysis.loadingScore - baselineAnalysis.loadingScore,
          rendering: optimizedAnalysis.renderingScore - baselineAnalysis.renderingScore,
          images: optimizedAnalysis.imageOptimizationScore - baselineAnalysis.imageOptimizationScore,
          fonts: optimizedAnalysis.fontOptimizationScore - baselineAnalysis.fontOptimizationScore
        }
      },

      optimizations: {
        images: this.metrics.optimizations.images || {},
        fonts: this.metrics.optimizations.fonts || {},
        structure: this.metrics.optimizations.structure || {},
        rendering: this.metrics.optimizations.rendering || {},
        interactive: this.metrics.optimizations.interactive || {}
      },

      aiRecommendations: this.metrics.aiRecommendations,

      loadingEstimates: {
        before: {
          '3G': this.estimateLoadingTime(baselineAnalysis.fileSize, '3G'),
          '4G': this.estimateLoadingTime(baselineAnalysis.fileSize, '4G'),
          wifi: this.estimateLoadingTime(baselineAnalysis.fileSize, 'wifi')
        },
        after: {
          '3G': this.estimateLoadingTime(optimizedAnalysis.fileSize, '3G'),
          '4G': this.estimateLoadingTime(optimizedAnalysis.fileSize, '4G'),
          wifi: this.estimateLoadingTime(optimizedAnalysis.fileSize, 'wifi')
        }
      }
    };

    return report;
  }

  /**
   * Estimate loading time for different network speeds
   */
  estimateLoadingTime(fileSize, networkType) {
    const targets = this.options.loadingTimeTargets[networkType];
    if (!targets) return null;

    // Parse speed (e.g., "4 Mbps" -> 4000000 bps)
    const speedMatch = targets.speed.match(/([0-9.]+)\s*(Kbps|Mbps)/);
    if (!speedMatch) return null;

    const speedValue = parseFloat(speedMatch[1]);
    const speedUnit = speedMatch[2];
    const bps = speedUnit === 'Mbps' ? speedValue * 1000000 : speedValue * 1000;

    // Calculate time (bytes * 8 bits/byte / bps * 1000 ms/s)
    const estimatedTime = Math.round((fileSize * 8 / bps) * 1000);

    return {
      estimatedMs: estimatedTime,
      targetMs: targets.targetTime,
      meetsTarget: estimatedTime <= targets.targetTime
    };
  }

  /**
   * Log performance breakdown
   */
  logPerformanceBreakdown(analysis) {
    this.log(`  File size: ${analysis.fileSizeScore}/100`);
    this.log(`  Loading: ${analysis.loadingScore}/100`);
    this.log(`  Rendering: ${analysis.renderingScore}/100`);
    this.log(`  Images: ${analysis.imageOptimizationScore}/100`);
    this.log(`  Fonts: ${analysis.fontOptimizationScore}/100`);
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Log with optional verbose mode
   */
  log(message) {
    if (this.verbose || this.options.logging?.level !== 'silent') {
      this.logger.log(message);
    }
  }
}

module.exports = PerformanceOptimizer;
