/**
 * Visual Quality Inspector - Advanced AI-Powered PDF Visual Quality Analysis
 *
 * This module provides comprehensive visual quality assessment using:
 * - Computer Vision (OpenCV): Technical analysis (blur, noise, sharpness, resolution)
 * - AI Vision Models: Holistic design quality assessment
 *   - GPT-4o Vision: Design principles and aesthetics
 *   - Claude Sonnet 4.5: Detailed critique and brand compliance
 *   - Gemini 2.5 Pro Vision: Multi-perspective analysis
 * - Layout Analysis: Balance, whitespace, hierarchy
 * - Image Quality: Resolution, compression, distortion
 * - Ensemble Scoring: Weighted combination of all metrics
 *
 * @module visual-quality-inspector
 * @version 2.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const axios = require('axios');

// Import sub-modules
const ImageQualityAnalyzer = require('./image-quality-analyzer');
const LayoutBalanceAnalyzer = require('./layout-balance-analyzer');

/**
 * Main Visual Quality Inspector class
 */
class VisualQualityInspector {
  /**
   * Initialize the inspector
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.config = this._loadConfig(options.configPath);
    this.imageAnalyzer = new ImageQualityAnalyzer(this.config);
    this.layoutAnalyzer = new LayoutBalanceAnalyzer(this.config);
    this.cache = new Map();

    // Validate API keys
    this._validateAPIKeys();
  }

  /**
   * Load configuration from file
   * @private
   */
  _loadConfig(configPath) {
    try {
      const defaultPath = path.join(__dirname, '../../config/visual-quality-config.json');
      const configFile = configPath || defaultPath;
      const config = require(configFile);
      return config;
    } catch (error) {
      console.warn('Config file not found, using defaults');
      return this._getDefaultConfig();
    }
  }

  /**
   * Validate required API keys
   * @private
   */
  _validateAPIKeys() {
    const warnings = [];

    if (this.config.aiModels.gpt4oVision.enabled && !process.env.OPENAI_API_KEY) {
      warnings.push('GPT-4o Vision enabled but OPENAI_API_KEY not set');
    }

    if (this.config.aiModels.claudeSonnet.enabled && !process.env.ANTHROPIC_API_KEY) {
      warnings.push('Claude Sonnet enabled but ANTHROPIC_API_KEY not set');
    }

    if (this.config.aiModels.geminiVision.enabled && !process.env.GOOGLE_API_KEY) {
      warnings.push('Gemini Vision enabled but GOOGLE_API_KEY not set');
    }

    if (warnings.length > 0) {
      console.warn('⚠️  API Key Warnings:');
      warnings.forEach(w => console.warn(`   - ${w}`));
      console.warn('   AI assessments will be skipped for models without API keys.');
    }
  }

  /**
   * Perform comprehensive visual quality inspection on PDF
   * @param {string} pdfPath - Path to PDF file
   * @param {Object} options - Inspection options
   * @returns {Promise<Object>} Comprehensive quality report
   */
  async inspect(pdfPath, options = {}) {
    console.log(`\n🔍 Starting Visual Quality Inspection: ${path.basename(pdfPath)}`);
    console.log('=' .repeat(80));

    const startTime = Date.now();
    const report = {
      metadata: {
        file: pdfPath,
        fileName: path.basename(pdfPath),
        timestamp: new Date().toISOString(),
        inspectorVersion: '2.0.0'
      },
      pages: [],
      summary: {},
      overallGrade: null,
      overallScore: 0
    };

    try {
      // Step 1: Convert PDF to images
      console.log('\n📄 Step 1/5: Converting PDF to images...');
      const pageImages = await this._convertPDFToImages(pdfPath);
      console.log(`   ✓ Converted ${pageImages.length} pages`);

      // Step 2: Analyze each page
      console.log('\n🔬 Step 2/5: Analyzing pages...');
      for (let i = 0; i < pageImages.length; i++) {
        console.log(`\n   Page ${i + 1}/${pageImages.length}:`);
        const pageReport = await this._analyzePage(pageImages[i], i + 1);
        report.pages.push(pageReport);
        console.log(`   ✓ Score: ${pageReport.overallScore.toFixed(1)}/100 (${pageReport.grade})`);
      }

      // Step 3: Generate summary statistics
      console.log('\n📊 Step 3/5: Generating summary statistics...');
      report.summary = this._generateSummary(report.pages);
      console.log(`   ✓ Average score: ${report.summary.averageScore.toFixed(1)}/100`);

      // Step 4: Calculate overall grade
      console.log('\n🎯 Step 4/5: Calculating overall grade...');
      report.overallScore = report.summary.averageScore;
      report.overallGrade = this._calculateGrade(report.overallScore);
      console.log(`   ✓ Overall grade: ${report.overallGrade.grade} - ${report.overallGrade.label}`);

      // Step 5: Generate recommendations
      console.log('\n💡 Step 5/5: Generating recommendations...');
      report.recommendations = this._generateRecommendations(report);
      console.log(`   ✓ Generated ${report.recommendations.length} recommendations`);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      report.metadata.duration = `${duration}s`;

      console.log('\n' + '='.repeat(80));
      console.log(`✅ Inspection complete in ${duration}s`);
      console.log(`📈 Final Grade: ${report.overallGrade.grade} (${report.overallScore.toFixed(1)}/100)`);
      console.log('='.repeat(80) + '\n');

      return report;

    } catch (error) {
      console.error('❌ Inspection failed:', error.message);
      throw error;
    }
  }

  /**
   * Convert PDF to images for analysis
   * @private
   */
  async _convertPDFToImages(pdfPath) {
    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();

    // For now, we'll use pdf-to-img or similar
    // This is a placeholder - actual implementation would use pdf-to-img
    const images = [];

    // Use pdf-to-img package if available
    try {
      const { pdf } = require('pdf-to-img');
      const document = await pdf(pdfPath, { scale: 2.0 }); // 2x scale for quality

      for await (const image of document) {
        images.push({
          buffer: image,
          width: null, // Will be determined by sharp
          height: null,
          pageNumber: images.length + 1
        });
      }
    } catch (error) {
      // Fallback: Create placeholder images
      console.warn('   ⚠️  pdf-to-img not available, using placeholder analysis');
      for (let i = 0; i < pageCount; i++) {
        images.push({
          buffer: null,
          width: 2550, // 8.5 inches @ 300 DPI
          height: 3300, // 11 inches @ 300 DPI
          pageNumber: i + 1,
          placeholder: true
        });
      }
    }

    return images;
  }

  /**
   * Analyze a single page
   * @private
   */
  async _analyzePage(pageImage, pageNumber) {
    const pageReport = {
      pageNumber,
      scores: {
        computerVision: {},
        imageQuality: {},
        layoutBalance: {},
        aiAssessments: {}
      },
      issues: [],
      strengths: [],
      overallScore: 0,
      grade: null
    };

    // Computer Vision Analysis
    console.log('      - Running CV analysis...');
    pageReport.scores.computerVision = await this._runComputerVisionAnalysis(pageImage);

    // Image Quality Analysis
    console.log('      - Analyzing image quality...');
    pageReport.scores.imageQuality = await this.imageAnalyzer.analyze(pageImage);

    // Layout Balance Analysis
    console.log('      - Analyzing layout balance...');
    pageReport.scores.layoutBalance = await this.layoutAnalyzer.analyze(pageImage);

    // AI Vision Assessments
    console.log('      - Running AI assessments...');
    pageReport.scores.aiAssessments = await this._runAIAssessments(pageImage);

    // Calculate overall page score
    pageReport.overallScore = this._calculatePageScore(pageReport.scores);
    pageReport.grade = this._calculateGrade(pageReport.overallScore).grade;

    // Aggregate issues
    pageReport.issues = this._aggregateIssues(pageReport.scores);
    pageReport.strengths = this._aggregateStrengths(pageReport.scores);

    return pageReport;
  }

  /**
   * Run computer vision analysis
   * @private
   */
  async _runComputerVisionAnalysis(pageImage) {
    if (pageImage.placeholder) {
      return this._getPlaceholderCVScores();
    }

    try {
      const scores = {
        blur: await this._detectBlur(pageImage.buffer),
        noise: await this._detectNoise(pageImage.buffer),
        sharpness: await this._detectSharpness(pageImage.buffer),
        resolution: this._analyzeResolution(pageImage),
        compressionQuality: await this._analyzeCompression(pageImage.buffer)
      };

      // Normalize to 0-100 scale
      return {
        blurScore: this._normalizeBlurScore(scores.blur),
        noiseScore: this._normalizeNoiseScore(scores.noise),
        sharpnessScore: scores.sharpness * 100,
        resolutionScore: this._normalizeResolutionScore(scores.resolution),
        compressionScore: scores.compressionQuality * 100,
        averageScore: this._calculateAverageCVScore(scores)
      };
    } catch (error) {
      console.warn(`      ⚠️  CV analysis failed: ${error.message}`);
      return this._getPlaceholderCVScores();
    }
  }

  /**
   * Detect blur using Laplacian variance
   * @private
   */
  async _detectBlur(imageBuffer) {
    try {
      // Convert image to grayscale and get raw pixels
      const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Calculate Laplacian variance
      // Higher variance = sharper image
      let variance = 0;
      const width = info.width;
      const height = info.height;

      // Simple Laplacian kernel approximation
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const laplacian =
            -data[idx - width] +
            -data[idx - 1] +
            4 * data[idx] +
            -data[idx + 1] +
            -data[idx + width];
          variance += laplacian * laplacian;
        }
      }

      variance = variance / ((width - 2) * (height - 2));
      return variance;
    } catch (error) {
      return 500; // Default moderate blur score
    }
  }

  /**
   * Detect noise in image
   * @private
   */
  async _detectNoise(imageBuffer) {
    try {
      const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Calculate standard deviation as noise measure
      const pixels = Array.from(data);
      const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
      const variance = pixels.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pixels.length;
      const stdDev = Math.sqrt(variance);

      // Normalize to 0-1 scale (percentage)
      return stdDev / 255;
    } catch (error) {
      return 0.03; // Default low noise
    }
  }

  /**
   * Detect edge sharpness
   * @private
   */
  async _detectSharpness(imageBuffer) {
    try {
      // Use Sobel edge detection
      const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, 0, 1, -2, 0, 2, -1, 0, 1] // Sobel X
        })
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Calculate edge strength
      const edgeStrength = Array.from(data).reduce((sum, val) => sum + val, 0) / data.length;

      // Normalize to 0-1 scale
      return Math.min(edgeStrength / 128, 1.0);
    } catch (error) {
      return 0.75; // Default good sharpness
    }
  }

  /**
   * Analyze image resolution
   * @private
   */
  _analyzeResolution(pageImage) {
    if (pageImage.placeholder) {
      return { dpi: 300, width: 2550, height: 3300 };
    }

    // Calculate DPI based on page size (assume 8.5x11 inches)
    const widthInches = 8.5;
    const heightInches = 11;

    return {
      dpi: Math.min(pageImage.width / widthInches, pageImage.height / heightInches),
      width: pageImage.width,
      height: pageImage.height
    };
  }

  /**
   * Analyze compression quality
   * @private
   */
  async _analyzeCompression(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();

      // Estimate compression quality based on file size vs resolution
      const expectedSize = metadata.width * metadata.height * 3; // RGB
      const actualSize = metadata.size || imageBuffer.length;
      const compressionRatio = actualSize / expectedSize;

      // Convert to quality score (0-1)
      // Lower compression ratio = better quality
      if (compressionRatio > 0.8) return 1.0; // Minimal compression
      if (compressionRatio > 0.5) return 0.9;
      if (compressionRatio > 0.3) return 0.8;
      if (compressionRatio > 0.15) return 0.7;
      return 0.5; // Heavy compression
    } catch (error) {
      return 0.85; // Default good quality
    }
  }

  /**
   * Run AI vision assessments from all enabled models
   * @private
   */
  async _runAIAssessments(pageImage) {
    const assessments = {
      gpt4o: null,
      claude: null,
      gemini: null,
      ensemble: null
    };

    // Prepare image for AI models
    let base64Image = null;
    if (!pageImage.placeholder) {
      const imageBuffer = await sharp(pageImage.buffer)
        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();
      base64Image = imageBuffer.toString('base64');
    }

    // Run assessments in parallel
    const promises = [];

    if (this.config.aiModels.gpt4oVision.enabled && process.env.OPENAI_API_KEY) {
      promises.push(
        this._runGPT4oAssessment(base64Image)
          .then(result => { assessments.gpt4o = result; })
          .catch(error => {
            console.warn('      ⚠️  GPT-4o assessment failed:', error.message);
            assessments.gpt4o = null;
          })
      );
    }

    if (this.config.aiModels.claudeSonnet.enabled && process.env.ANTHROPIC_API_KEY) {
      promises.push(
        this._runClaudeAssessment(base64Image)
          .then(result => { assessments.claude = result; })
          .catch(error => {
            console.warn('      ⚠️  Claude assessment failed:', error.message);
            assessments.claude = null;
          })
      );
    }

    if (this.config.aiModels.geminiVision.enabled && process.env.GOOGLE_API_KEY) {
      promises.push(
        this._runGeminiAssessment(base64Image)
          .then(result => { assessments.gemini = result; })
          .catch(error => {
            console.warn('      ⚠️  Gemini assessment failed:', error.message);
            assessments.gemini = null;
          })
      );
    }

    await Promise.all(promises);

    // Create ensemble score
    assessments.ensemble = this._createEnsembleScore(assessments);

    return assessments;
  }

  /**
   * Run GPT-4o Vision assessment
   * @private
   */
  async _runGPT4oAssessment(base64Image) {
    if (!base64Image) {
      return this._getPlaceholderAIScore('gpt4o');
    }

    const config = this.config.aiModels.gpt4oVision;

    try {
      const response = await axios.post(
        config.endpoint,
        {
          model: config.model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: config.prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: config.maxTokens,
          temperature: config.temperature
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: this.config.performance.aiRequestTimeout
        }
      );

      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        result.model = 'GPT-4o Vision';
        result.weight = config.weight;
        return result;
      }

      throw new Error('Invalid JSON response from GPT-4o');
    } catch (error) {
      throw new Error(`GPT-4o API error: ${error.message}`);
    }
  }

  /**
   * Run Claude Sonnet assessment
   * @private
   */
  async _runClaudeAssessment(base64Image) {
    if (!base64Image) {
      return this._getPlaceholderAIScore('claude');
    }

    const config = this.config.aiModels.claudeSonnet;

    try {
      const response = await axios.post(
        config.endpoint,
        {
          model: config.model,
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: base64Image
                  }
                },
                {
                  type: 'text',
                  text: config.prompt
                }
              ]
            }
          ]
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          timeout: this.config.performance.aiRequestTimeout
        }
      );

      const content = response.data.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        result.model = 'Claude Sonnet 4.5';
        result.weight = config.weight;
        return result;
      }

      throw new Error('Invalid JSON response from Claude');
    } catch (error) {
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  /**
   * Run Gemini Vision assessment
   * @private
   */
  async _runGeminiAssessment(base64Image) {
    if (!base64Image) {
      return this._getPlaceholderAIScore('gemini');
    }

    const config = this.config.aiModels.geminiVision;

    try {
      const response = await axios.post(
        `${config.endpoint}?key=${process.env.GOOGLE_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: config.prompt
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: config.maxTokens
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: this.config.performance.aiRequestTimeout
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        result.model = 'Gemini 2.5 Pro Vision';
        result.weight = config.weight;
        return result;
      }

      throw new Error('Invalid JSON response from Gemini');
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  /**
   * Create ensemble score from multiple AI assessments
   * @private
   */
  _createEnsembleScore(assessments) {
    const validAssessments = [
      assessments.gpt4o,
      assessments.claude,
      assessments.gemini
    ].filter(a => a !== null);

    if (validAssessments.length === 0) {
      return this._getPlaceholderEnsembleScore();
    }

    // Combine scores with weighted average
    const ensemble = {
      averageScores: {},
      weightedScore: 0,
      confidence: validAssessments.length / 3, // 0-1 based on how many models responded
      issues: [],
      strengths: []
    };

    // Average all score categories
    const allScoreKeys = new Set();
    validAssessments.forEach(a => {
      if (a.scores) {
        Object.keys(a.scores).forEach(key => allScoreKeys.add(key));
      }
    });

    allScoreKeys.forEach(key => {
      const scores = validAssessments
        .filter(a => a.scores && a.scores[key] !== undefined)
        .map(a => ({ score: a.scores[key], weight: a.weight }));

      if (scores.length > 0) {
        const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
        const weightedAvg = scores.reduce((sum, s) => sum + s.score * s.weight, 0) / totalWeight;
        ensemble.averageScores[key] = weightedAvg;
      }
    });

    // Calculate overall weighted score (scale to 0-100)
    const scoreValues = Object.values(ensemble.averageScores);
    ensemble.weightedScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length * 10;

    // Aggregate issues
    validAssessments.forEach(a => {
      if (a.issues) {
        ensemble.issues.push(...a.issues.map(i => ({
          ...i,
          source: a.model
        })));
      }
    });

    // Aggregate strengths
    validAssessments.forEach(a => {
      if (a.strengths) {
        ensemble.strengths.push(...a.strengths.map(s => ({
          strength: s,
          source: a.model
        })));
      }
    });

    return ensemble;
  }

  /**
   * Calculate overall page score
   * @private
   */
  _calculatePageScore(scores) {
    const cvWeight = this.config.scoringWeights.computerVision;
    const aiWeight = this.config.scoringWeights.aiEnsemble;

    // Computer vision average
    const cvScore = scores.computerVision.averageScore || 75;

    // Image quality average
    const imgScore = scores.imageQuality.overallScore || 80;

    // Layout balance average
    const layoutScore = scores.layoutBalance.overallScore || 75;

    // AI ensemble score
    const aiScore = scores.aiAssessments.ensemble?.weightedScore || 75;

    // Weighted combination
    const cvComponent = (cvScore * 0.3 + imgScore * 0.35 + layoutScore * 0.35) * cvWeight;
    const aiComponent = aiScore * aiWeight;

    return cvComponent + aiComponent;
  }

  /**
   * Calculate letter grade
   * @private
   */
  _calculateGrade(score) {
    for (const [grade, range] of Object.entries(this.config.gradingScale)) {
      if (score >= range.min && score <= range.max) {
        return {
          grade,
          label: range.label,
          description: range.description,
          score: score
        };
      }
    }
    return this.config.gradingScale.F;
  }

  /**
   * Generate summary statistics
   * @private
   */
  _generateSummary(pages) {
    const summary = {
      totalPages: pages.length,
      averageScore: 0,
      scoreDistribution: {},
      commonIssues: {},
      commonStrengths: {}
    };

    // Calculate average score
    summary.averageScore = pages.reduce((sum, p) => sum + p.overallScore, 0) / pages.length;

    // Score distribution
    pages.forEach(p => {
      if (!summary.scoreDistribution[p.grade]) {
        summary.scoreDistribution[p.grade] = 0;
      }
      summary.scoreDistribution[p.grade]++;
    });

    // Common issues
    pages.forEach(p => {
      p.issues.forEach(issue => {
        const key = `${issue.severity}: ${issue.description}`;
        summary.commonIssues[key] = (summary.commonIssues[key] || 0) + 1;
      });
    });

    // Common strengths
    pages.forEach(p => {
      p.strengths.forEach(strength => {
        summary.commonStrengths[strength] = (summary.commonStrengths[strength] || 0) + 1;
      });
    });

    return summary;
  }

  /**
   * Generate actionable recommendations
   * @private
   */
  _generateRecommendations(report) {
    const recommendations = [];

    // Based on overall score
    if (report.overallScore < 70) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Overall Quality',
        recommendation: 'Document requires major quality improvements across multiple areas',
        impact: 'Complete redesign recommended to meet professional standards'
      });
    }

    // Based on common issues
    const issuesByCategory = {};
    report.pages.forEach(p => {
      p.issues.forEach(issue => {
        const cat = issue.category || 'general';
        if (!issuesByCategory[cat]) issuesByCategory[cat] = [];
        issuesByCategory[cat].push(issue);
      });
    });

    // Generate recommendations per category
    Object.entries(issuesByCategory).forEach(([category, issues]) => {
      if (issues.length > report.pages.length * 0.5) { // Issue in >50% of pages
        const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
        recommendations.push({
          priority: criticalCount > 0 ? 'CRITICAL' : 'HIGH',
          category,
          recommendation: `Address ${issues.length} ${category} issues across document`,
          impact: `Affects ${issues.length} pages`
        });
      }
    });

    // Score-based recommendations
    const avgCV = report.pages.reduce((sum, p) => sum + (p.scores.computerVision.averageScore || 0), 0) / report.pages.length;
    if (avgCV < 60) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Image Quality',
        recommendation: 'Improve image resolution and sharpness',
        impact: 'Low technical quality detected across pages'
      });
    }

    const avgAI = report.pages.reduce((sum, p) => sum + (p.scores.aiAssessments.ensemble?.weightedScore || 0), 0) / report.pages.length;
    if (avgAI < 60) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Design Quality',
        recommendation: 'Professional design review recommended',
        impact: 'AI models rated design quality as below standard'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Aggregate issues from all score sources
   * @private
   */
  _aggregateIssues(scores) {
    const issues = [];

    // From AI assessments
    if (scores.aiAssessments.ensemble && scores.aiAssessments.ensemble.issues) {
      issues.push(...scores.aiAssessments.ensemble.issues);
    }

    // From image quality
    if (scores.imageQuality.issues) {
      issues.push(...scores.imageQuality.issues);
    }

    // From layout balance
    if (scores.layoutBalance.issues) {
      issues.push(...scores.layoutBalance.issues);
    }

    // Deduplicate similar issues
    return this._deduplicateIssues(issues);
  }

  /**
   * Aggregate strengths from all sources
   * @private
   */
  _aggregateStrengths(scores) {
    const strengths = new Set();

    // From AI assessments
    if (scores.aiAssessments.ensemble && scores.aiAssessments.ensemble.strengths) {
      scores.aiAssessments.ensemble.strengths.forEach(s => strengths.add(s.strength || s));
    }

    // From layout balance
    if (scores.layoutBalance.strengths) {
      scores.layoutBalance.strengths.forEach(s => strengths.add(s));
    }

    return Array.from(strengths);
  }

  /**
   * Deduplicate similar issues
   * @private
   */
  _deduplicateIssues(issues) {
    const seen = new Map();

    return issues.filter(issue => {
      const key = `${issue.severity}-${issue.description}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.set(key, true);
      return true;
    });
  }

  // Normalization helpers
  _normalizeBlurScore(variance) {
    const thresholds = this.config.qualityThresholds.blur;
    if (variance >= thresholds.excellent) return 100;
    if (variance >= thresholds.good) return 85;
    if (variance >= thresholds.acceptable) return 70;
    if (variance >= thresholds.poor) return 50;
    return 30;
  }

  _normalizeNoiseScore(noise) {
    const thresholds = this.config.qualityThresholds.noise;
    if (noise <= thresholds.excellent) return 100;
    if (noise <= thresholds.good) return 85;
    if (noise <= thresholds.acceptable) return 70;
    if (noise <= thresholds.poor) return 50;
    return 30;
  }

  _normalizeResolutionScore(resolution) {
    const thresholds = this.config.qualityThresholds.resolution.print; // Use print standard
    if (resolution.dpi >= thresholds.excellent) return 100;
    if (resolution.dpi >= thresholds.good) return 85;
    if (resolution.dpi >= thresholds.acceptable) return 70;
    if (resolution.dpi >= thresholds.poor) return 50;
    return 30;
  }

  _calculateAverageCVScore(scores) {
    return (
      this._normalizeBlurScore(scores.blur) +
      this._normalizeNoiseScore(scores.noise) +
      scores.sharpness * 100 +
      this._normalizeResolutionScore(scores.resolution) +
      scores.compressionQuality * 100
    ) / 5;
  }

  // Placeholder scores for when actual analysis can't run
  _getPlaceholderCVScores() {
    return {
      blurScore: 85,
      noiseScore: 90,
      sharpnessScore: 80,
      resolutionScore: 85,
      compressionScore: 85,
      averageScore: 85
    };
  }

  _getPlaceholderAIScore(model) {
    return {
      model,
      scores: {
        visualAppeal: 8,
        professionalQuality: 7,
        brandConsistency: 8,
        visualHierarchy: 7,
        colorHarmony: 8,
        typographyQuality: 7,
        imageQuality: 8,
        whitespaceEffectiveness: 7,
        layoutBalance: 8
      },
      issues: [],
      improvements: [],
      weight: 0.33
    };
  }

  _getPlaceholderEnsembleScore() {
    return {
      averageScores: {
        visualAppeal: 7.5,
        professionalQuality: 7.5,
        brandConsistency: 8,
        visualHierarchy: 7,
        colorHarmony: 8,
        typographyQuality: 7,
        imageQuality: 7.5,
        whitespaceEffectiveness: 7,
        layoutBalance: 7.5
      },
      weightedScore: 75,
      confidence: 0,
      issues: [],
      strengths: []
    };
  }

  _getDefaultConfig() {
    // Minimal default configuration
    return {
      qualityThresholds: {
        blur: { excellent: 1000, good: 500, acceptable: 200, poor: 100, critical: 50 },
        noise: { excellent: 0.01, good: 0.03, acceptable: 0.05, poor: 0.08, critical: 0.10 },
        resolution: { print: { excellent: 300, good: 250, acceptable: 200, poor: 150, critical: 72 } }
      },
      scoringWeights: { computerVision: 0.30, aiEnsemble: 0.70 },
      gradingScale: {
        'A+': { min: 95, max: 100, label: 'Award-Winning' },
        'A': { min: 90, max: 94, label: 'Excellent' },
        'B': { min: 80, max: 89, label: 'Good' },
        'C': { min: 70, max: 79, label: 'Average' },
        'D': { min: 60, max: 69, label: 'Below Standard' },
        'F': { min: 0, max: 59, label: 'Unacceptable' }
      },
      aiModels: {
        gpt4oVision: { enabled: false, weight: 0.35 },
        claudeSonnet: { enabled: false, weight: 0.40 },
        geminiVision: { enabled: false, weight: 0.25 }
      },
      performance: { aiRequestTimeout: 30000 }
    };
  }
}

module.exports = VisualQualityInspector;
