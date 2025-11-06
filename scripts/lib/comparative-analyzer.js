/**
 * Comparative Analyzer - AI-Powered PDF Comparison Engine
 *
 * Core engine for comprehensive PDF comparison across versions, benchmarking
 * against industry standards, and intelligent insights generation.
 *
 * Features:
 * - Version comparison (visual, content, layout)
 * - Quality benchmarking (against A+ examples)
 * - Improvement tracking (progression, regressions)
 * - Multi-document analysis (brand consistency)
 * - AI-powered insights (GPT-5, Claude Opus 4.1, Gemini 2.5 Pro)
 * - Statistical analysis (trends, correlations)
 * - Competitive intelligence (competitor analysis)
 * - Report generation (HTML, PDF, JSON)
 *
 * @module comparative-analyzer
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

// Import comparison modules
const VersionDiffer = require('./version-differ');
const QualityBenchmark = require('./quality-benchmark');
const ImprovementTracker = require('./improvement-tracker');
const MultiDocumentAnalyzer = require('./multi-document-analyzer');
const AIInsightsGenerator = require('./ai-insights-generator');
const StatisticalAnalyzer = require('./statistical-analyzer');
const CompetitiveAnalyzer = require('./competitive-analyzer');
const ComparisonReportGenerator = require('./comparison-report-generator');

// Import AI reasoning (from Agent 9)
const ReasoningEngine = require('./reasoning-engine');

// Import validation systems (from previous agents)
const VisualRegressionTester = require('./visual-regression-tester');
const ContentValidator = require('./content-validator');
const BrandConsistencyChecker = require('./brand-consistency-checker');

/**
 * Comparison types
 */
const ComparisonType = {
  VERSION: 'version',           // Compare two versions of same document
  BENCHMARK: 'benchmark',       // Compare against industry standards
  COMPETITIVE: 'competitive',   // Compare against competitors
  HISTORICAL: 'historical',     // Compare against historical versions
  MULTI_DOCUMENT: 'multi_doc',  // Compare multiple related documents
  REGRESSION: 'regression'      // Detect quality regressions
};

/**
 * Analysis depth levels
 */
const AnalysisDepth = {
  QUICK: 'quick',           // Fast comparison (visual + content)
  STANDARD: 'standard',     // Standard comparison (+ layout + colors)
  COMPREHENSIVE: 'comprehensive', // Full comparison (all features)
  DEEP: 'deep'              // Deep analysis (+ AI insights + statistical)
};

/**
 * Comparison categories
 */
const ComparisonCategory = {
  VISUAL: 'visual',         // Pixel-perfect visual comparison
  CONTENT: 'content',       // Text content comparison
  LAYOUT: 'layout',         // Element position and spacing
  COLOR: 'color',           // Color usage and palette
  FONT: 'font',             // Typography and fonts
  IMAGE: 'image',           // Image comparison
  ACCESSIBILITY: 'accessibility', // Accessibility features
  BRAND: 'brand'            // Brand consistency
};

/**
 * Quality grade scale
 */
const QualityGrade = {
  A_PLUS: { grade: 'A+', score: 95, label: 'World-class' },
  A: { grade: 'A', score: 90, label: 'Excellent' },
  A_MINUS: { grade: 'A-', score: 85, label: 'Very good' },
  B_PLUS: { grade: 'B+', score: 80, label: 'Good' },
  B: { grade: 'B', score: 75, label: 'Above average' },
  B_MINUS: { grade: 'B-', score: 70, label: 'Average' },
  C_PLUS: { grade: 'C+', score: 65, label: 'Below average' },
  C: { grade: 'C', score: 60, label: 'Needs improvement' },
  C_MINUS: { grade: 'C-', score: 55, label: 'Poor' },
  D_PLUS: { grade: 'D+', score: 50, label: 'Very poor' },
  D: { grade: 'D', score: 45, label: 'Failing' },
  F: { grade: 'F', score: 0, label: 'Unacceptable' }
};

/**
 * Main Comparative Analyzer class
 */
class ComparativeAnalyzer extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      // Comparison settings
      comparisonType: ComparisonType.VERSION,
      analysisDepth: AnalysisDepth.COMPREHENSIVE,
      categories: Object.values(ComparisonCategory),

      // AI settings
      enableAI: true,
      aiModels: {
        changeImpact: 'gpt-5',              // GPT-5 for change analysis
        benchmarking: 'claude-opus-4.1',    // Claude Opus 4.1 for benchmarking
        insights: 'claude-opus-4.1',        // Claude Opus 4.1 for insights
        consistency: 'gpt-4o',              // GPT-4o for consistency
        trends: 'gemini-2.5-pro',           // Gemini 2.5 Pro for trends
        competitive: 'gemini-2.5-pro',      // Gemini 2.5 Pro for competitive
        statistics: 'gpt-5',                // GPT-5 for statistics
        reporting: 'claude-sonnet-4.5'      // Claude Sonnet 4.5 for reports
      },

      // Reasoning settings (from Agent 9)
      enableReasoning: true,
      reasoningDepth: 'deep',

      // Statistical settings
      confidenceLevel: 0.95,
      significanceThreshold: 0.05,

      // Benchmarking settings
      benchmarkPath: path.join(__dirname, '../../benchmarks'),
      targetGrade: 'A+',

      // Report settings
      reportFormat: ['html', 'json'],
      includeVisuals: true,
      includeStatistics: true,
      includeRecommendations: true,

      // Performance settings
      parallel: true,
      maxConcurrency: 4,
      cacheResults: true,

      // Output settings
      outputDir: path.join(__dirname, '../../comparisons'),
      tempDir: path.join(__dirname, '../../temp/comparisons'),

      ...config
    };

    // Initialize modules
    this.versionDiffer = new VersionDiffer(this.config);
    this.qualityBenchmark = new QualityBenchmark(this.config);
    this.improvementTracker = new ImprovementTracker(this.config);
    this.multiDocAnalyzer = new MultiDocumentAnalyzer(this.config);
    this.aiInsights = new AIInsightsGenerator(this.config);
    this.statisticalAnalyzer = new StatisticalAnalyzer(this.config);
    this.competitiveAnalyzer = new CompetitiveAnalyzer(this.config);
    this.reportGenerator = new ComparisonReportGenerator(this.config);

    // Initialize reasoning engine (from Agent 9)
    this.reasoningEngine = new ReasoningEngine({
      defaultStrategy: 'comparative-analysis',
      enableChainOfThought: true,
      enableTreeOfThoughts: true
    });

    // Initialize validation systems
    this.visualTester = new VisualRegressionTester();
    this.contentValidator = new ContentValidator();
    this.brandChecker = new BrandConsistencyChecker();

    // Comparison cache
    this.cache = new Map();

    // Statistics
    this.stats = {
      comparisonsRun: 0,
      benchmarksPerformed: 0,
      insightsGenerated: 0,
      regressionsDetected: 0,
      improvementsTracked: 0
    };
  }

  /**
   * Compare two PDF versions
   */
  async compareVersions(pdf1Path, pdf2Path, options = {}) {
    const startTime = Date.now();
    this.emit('comparison-start', { type: 'version', pdf1: pdf1Path, pdf2: pdf2Path });

    try {
      // Generate comparison ID
      const comparisonId = this._generateComparisonId('version', pdf1Path, pdf2Path);

      // Check cache
      if (this.config.cacheResults && this.cache.has(comparisonId)) {
        this.emit('comparison-cached', { comparisonId });
        return this.cache.get(comparisonId);
      }

      // Phase 1: Version diffing
      this.emit('phase-start', { phase: 'diffing', categories: this.config.categories });
      const diffResults = await this.versionDiffer.diff(pdf1Path, pdf2Path, {
        categories: options.categories || this.config.categories,
        depth: options.depth || this.config.analysisDepth
      });

      // Phase 2: AI reasoning about changes (if enabled)
      let reasoningResults = null;
      if (this.config.enableReasoning) {
        this.emit('phase-start', { phase: 'reasoning' });
        reasoningResults = await this.reasoningEngine.analyze({
          task: 'analyze-pdf-changes',
          context: {
            pdf1: pdf1Path,
            pdf2: pdf2Path,
            diffResults
          },
          strategy: 'comparative-analysis',
          depth: this.config.reasoningDepth
        });
      }

      // Phase 3: Quality comparison
      this.emit('phase-start', { phase: 'quality-comparison' });
      const qualityComparison = await this._compareQuality(pdf1Path, pdf2Path, diffResults);

      // Phase 4: Impact analysis (AI-powered)
      let impactAnalysis = null;
      if (this.config.enableAI) {
        this.emit('phase-start', { phase: 'impact-analysis' });
        impactAnalysis = await this.aiInsights.analyzeChangeImpact(
          diffResults,
          this.config.aiModels.changeImpact
        );
      }

      // Phase 5: Statistical significance
      this.emit('phase-start', { phase: 'statistical-analysis' });
      const statisticalResults = await this.statisticalAnalyzer.analyzeChanges(
        diffResults,
        qualityComparison
      );

      // Phase 6: Regression detection
      this.emit('phase-start', { phase: 'regression-detection' });
      const regressions = await this._detectRegressions(diffResults, qualityComparison);

      if (regressions.length > 0) {
        this.stats.regressionsDetected += regressions.length;
        this.emit('regressions-detected', { count: regressions.length, regressions });
      }

      // Compile results
      const results = {
        comparisonId,
        type: ComparisonType.VERSION,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,

        documents: {
          baseline: {
            path: pdf1Path,
            name: path.basename(pdf1Path)
          },
          test: {
            path: pdf2Path,
            name: path.basename(pdf2Path)
          }
        },

        differences: diffResults,
        reasoning: reasoningResults,
        qualityComparison,
        impactAnalysis,
        statisticalResults,
        regressions,

        summary: {
          totalChanges: this._countChanges(diffResults),
          significantChanges: statisticalResults.significantChanges || 0,
          qualityDelta: qualityComparison.delta,
          grade: {
            baseline: qualityComparison.baseline.grade,
            test: qualityComparison.test.grade,
            improved: qualityComparison.delta > 0
          },
          regressionCount: regressions.length
        },

        recommendations: await this._generateRecommendations(
          diffResults,
          qualityComparison,
          impactAnalysis,
          regressions
        )
      };

      // Cache results
      if (this.config.cacheResults) {
        this.cache.set(comparisonId, results);
      }

      this.stats.comparisonsRun++;
      this.emit('comparison-complete', results);

      return results;

    } catch (error) {
      this.emit('comparison-error', { error: error.message, stack: error.stack });
      throw new Error(`Version comparison failed: ${error.message}`);
    }
  }

  /**
   * Benchmark PDF against industry standards
   */
  async benchmarkQuality(pdfPath, options = {}) {
    const startTime = Date.now();
    this.emit('benchmark-start', { pdf: pdfPath });

    try {
      // Phase 1: Load benchmark standards
      this.emit('phase-start', { phase: 'loading-benchmarks' });
      const benchmarks = await this.qualityBenchmark.loadBenchmarks(
        options.targetGrade || this.config.targetGrade
      );

      // Phase 2: Analyze test document
      this.emit('phase-start', { phase: 'analyzing-document' });
      const analysis = await this.qualityBenchmark.analyze(pdfPath);

      // Phase 3: Compare against benchmarks
      this.emit('phase-start', { phase: 'comparing-benchmarks' });
      const comparison = await this.qualityBenchmark.compare(analysis, benchmarks);

      // Phase 4: AI benchmarking insights (Claude Opus 4.1)
      let aiInsights = null;
      if (this.config.enableAI) {
        this.emit('phase-start', { phase: 'ai-benchmarking' });
        aiInsights = await this.aiInsights.generateBenchmarkInsights(
          comparison,
          this.config.aiModels.benchmarking
        );
      }

      // Phase 5: Gap analysis
      this.emit('phase-start', { phase: 'gap-analysis' });
      const gaps = await this.qualityBenchmark.analyzeGaps(comparison, benchmarks);

      // Phase 6: Improvement roadmap
      this.emit('phase-start', { phase: 'roadmap-generation' });
      const roadmap = await this._generateImprovementRoadmap(gaps, comparison);

      const results = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,

        document: {
          path: pdfPath,
          name: path.basename(pdfPath)
        },

        currentGrade: comparison.grade,
        targetGrade: options.targetGrade || this.config.targetGrade,
        score: comparison.score,
        targetScore: this._getTargetScore(options.targetGrade || this.config.targetGrade),
        gap: this._getTargetScore(options.targetGrade || this.config.targetGrade) - comparison.score,

        benchmarks: comparison.benchmarks,
        analysis: comparison.analysis,
        aiInsights,
        gaps,
        roadmap,

        summary: {
          strengthAreas: gaps.strengths,
          improvementAreas: gaps.weaknesses,
          criticalGaps: gaps.critical,
          timeToTarget: roadmap.estimatedWeeks
        }
      };

      this.stats.benchmarksPerformed++;
      this.emit('benchmark-complete', results);

      return results;

    } catch (error) {
      this.emit('benchmark-error', { error: error.message, stack: error.stack });
      throw new Error(`Benchmarking failed: ${error.message}`);
    }
  }

  /**
   * Track improvements across multiple versions
   */
  async trackImprovements(versions, options = {}) {
    const startTime = Date.now();
    this.emit('tracking-start', { versionCount: versions.length });

    try {
      // Sort versions by timestamp or version number
      const sortedVersions = await this._sortVersions(versions);

      // Phase 1: Analyze each version
      this.emit('phase-start', { phase: 'analyzing-versions' });
      const analyses = await this._analyzeVersions(sortedVersions);

      // Phase 2: Track quality progression
      this.emit('phase-start', { phase: 'quality-progression' });
      const progression = await this.improvementTracker.trackProgression(analyses);

      // Phase 3: Identify trends (AI-powered with Gemini 2.5 Pro)
      let trends = null;
      if (this.config.enableAI) {
        this.emit('phase-start', { phase: 'trend-analysis' });
        trends = await this.aiInsights.analyzeTrends(
          progression,
          this.config.aiModels.trends
        );
      }

      // Phase 4: Regression detection
      this.emit('phase-start', { phase: 'regression-detection' });
      const regressions = await this.improvementTracker.detectRegressions(progression);

      // Phase 5: Issue resolution tracking
      this.emit('phase-start', { phase: 'issue-tracking' });
      const issueTracking = await this.improvementTracker.trackIssueResolution(analyses);

      // Phase 6: Statistical analysis
      this.emit('phase-start', { phase: 'statistical-analysis' });
      const statistics = await this.statisticalAnalyzer.analyzeProgression(progression);

      // Phase 7: Predictions
      this.emit('phase-start', { phase: 'predictive-analysis' });
      const predictions = await this._predictFutureQuality(progression, statistics);

      const results = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,

        versionCount: versions.length,
        versions: sortedVersions.map(v => ({
          path: v.path,
          version: v.version,
          timestamp: v.timestamp
        })),

        progression,
        trends,
        regressions,
        issueTracking,
        statistics,
        predictions,

        summary: {
          initialGrade: progression.versions[0].grade,
          currentGrade: progression.versions[progression.versions.length - 1].grade,
          improvement: progression.overallImprovement,
          regressionCount: regressions.length,
          resolvedIssues: issueTracking.resolved.length,
          openIssues: issueTracking.open.length,
          projectedGrade: predictions.projectedGrade,
          weeksToTarget: predictions.weeksToTarget
        }
      };

      this.stats.improvementsTracked++;
      this.emit('tracking-complete', results);

      return results;

    } catch (error) {
      this.emit('tracking-error', { error: error.message, stack: error.stack });
      throw new Error(`Improvement tracking failed: ${error.message}`);
    }
  }

  /**
   * Analyze multiple documents for brand consistency
   */
  async analyzeMultiDocument(documents, options = {}) {
    const startTime = Date.now();
    this.emit('multi-doc-start', { documentCount: documents.length });

    try {
      // Phase 1: Analyze each document
      this.emit('phase-start', { phase: 'analyzing-documents' });
      const analyses = await this._analyzeDocuments(documents);

      // Phase 2: Brand consistency analysis
      this.emit('phase-start', { phase: 'brand-consistency' });
      const brandConsistency = await this.multiDocAnalyzer.analyzeBrandConsistency(analyses);

      // Phase 3: Cross-document color usage
      this.emit('phase-start', { phase: 'color-consistency' });
      const colorConsistency = await this.multiDocAnalyzer.analyzeColorConsistency(analyses);

      // Phase 4: Typography consistency
      this.emit('phase-start', { phase: 'typography-consistency' });
      const typographyConsistency = await this.multiDocAnalyzer.analyzeTypographyConsistency(analyses);

      // Phase 5: Template usage validation
      this.emit('phase-start', { phase: 'template-validation' });
      const templateUsage = await this.multiDocAnalyzer.analyzeTemplateUsage(analyses);

      // Phase 6: AI consistency analysis (GPT-4o)
      let aiConsistency = null;
      if (this.config.enableAI) {
        this.emit('phase-start', { phase: 'ai-consistency-analysis' });
        aiConsistency = await this.aiInsights.analyzeConsistency(
          analyses,
          this.config.aiModels.consistency
        );
      }

      const results = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,

        documentCount: documents.length,
        documents: documents.map(d => ({
          path: d,
          name: path.basename(d)
        })),

        brandConsistency,
        colorConsistency,
        typographyConsistency,
        templateUsage,
        aiConsistency,

        summary: {
          overallConsistency: this._calculateOverallConsistency(
            brandConsistency,
            colorConsistency,
            typographyConsistency
          ),
          inconsistencies: [
            ...brandConsistency.violations,
            ...colorConsistency.violations,
            ...typographyConsistency.violations
          ],
          recommendations: await this._generateConsistencyRecommendations(
            brandConsistency,
            colorConsistency,
            typographyConsistency
          )
        }
      };

      this.emit('multi-doc-complete', results);

      return results;

    } catch (error) {
      this.emit('multi-doc-error', { error: error.message, stack: error.stack });
      throw new Error(`Multi-document analysis failed: ${error.message}`);
    }
  }

  /**
   * Competitive analysis against competitor documents
   */
  async analyzeCompetitive(testPdf, competitorPdfs, options = {}) {
    const startTime = Date.now();
    this.emit('competitive-start', { test: testPdf, competitorCount: competitorPdfs.length });

    try {
      // Phase 1: Analyze test document
      this.emit('phase-start', { phase: 'analyzing-test-document' });
      const testAnalysis = await this.qualityBenchmark.analyze(testPdf);

      // Phase 2: Analyze competitor documents
      this.emit('phase-start', { phase: 'analyzing-competitors' });
      const competitorAnalyses = await this._analyzeDocuments(competitorPdfs);

      // Phase 3: Feature comparison
      this.emit('phase-start', { phase: 'feature-comparison' });
      const featureComparison = await this.competitiveAnalyzer.compareFeatures(
        testAnalysis,
        competitorAnalyses
      );

      // Phase 4: Competitive advantages/disadvantages
      this.emit('phase-start', { phase: 'advantage-analysis' });
      const advantages = await this.competitiveAnalyzer.identifyAdvantages(
        testAnalysis,
        competitorAnalyses
      );

      // Phase 5: Best practice extraction
      this.emit('phase-start', { phase: 'best-practices' });
      const bestPractices = await this.competitiveAnalyzer.extractBestPractices(
        competitorAnalyses
      );

      // Phase 6: Market positioning
      this.emit('phase-start', { phase: 'market-positioning' });
      const positioning = await this.competitiveAnalyzer.analyzePositioning(
        testAnalysis,
        competitorAnalyses
      );

      // Phase 7: AI competitive insights (Gemini 2.5 Pro)
      let aiInsights = null;
      if (this.config.enableAI) {
        this.emit('phase-start', { phase: 'ai-competitive-analysis' });
        aiInsights = await this.aiInsights.generateCompetitiveInsights(
          testAnalysis,
          competitorAnalyses,
          this.config.aiModels.competitive
        );
      }

      const results = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,

        testDocument: {
          path: testPdf,
          name: path.basename(testPdf),
          score: testAnalysis.score,
          grade: testAnalysis.grade
        },

        competitors: competitorPdfs.map((pdf, idx) => ({
          path: pdf,
          name: path.basename(pdf),
          score: competitorAnalyses[idx].score,
          grade: competitorAnalyses[idx].grade
        })),

        featureComparison,
        advantages,
        bestPractices,
        positioning,
        aiInsights,

        summary: {
          ranking: this._calculateRanking(testAnalysis, competitorAnalyses),
          strengthAreas: advantages.strengths,
          weaknessAreas: advantages.weaknesses,
          opportunities: advantages.opportunities,
          differentiation: positioning.differentiators
        }
      };

      this.emit('competitive-complete', results);

      return results;

    } catch (error) {
      this.emit('competitive-error', { error: error.message, stack: error.stack });
      throw new Error(`Competitive analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate comprehensive comparison report
   */
  async generateReport(comparisonResults, options = {}) {
    const startTime = Date.now();
    this.emit('report-start', { type: comparisonResults.type });

    try {
      const formats = options.formats || this.config.reportFormat;
      const reports = {};

      for (const format of formats) {
        this.emit('report-format', { format });

        switch (format) {
          case 'html':
            reports.html = await this.reportGenerator.generateHTML(comparisonResults, options);
            break;
          case 'pdf':
            reports.pdf = await this.reportGenerator.generatePDF(comparisonResults, options);
            break;
          case 'json':
            reports.json = await this.reportGenerator.generateJSON(comparisonResults, options);
            break;
          case 'markdown':
            reports.markdown = await this.reportGenerator.generateMarkdown(comparisonResults, options);
            break;
        }
      }

      // Save reports
      const outputDir = options.outputDir || this.config.outputDir;
      const reportPaths = {};

      for (const [format, content] of Object.entries(reports)) {
        const filename = `comparison-report-${Date.now()}.${format}`;
        const filepath = path.join(outputDir, filename);

        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(filepath, content);

        reportPaths[format] = filepath;
        this.emit('report-saved', { format, path: filepath });
      }

      const result = {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        formats,
        paths: reportPaths,
        size: await this._calculateReportSize(reportPaths)
      };

      this.emit('report-complete', result);

      return result;

    } catch (error) {
      this.emit('report-error', { error: error.message, stack: error.stack });
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  /**
   * Private helper methods
   */

  _generateComparisonId(type, ...args) {
    const crypto = require('crypto');
    const data = [type, ...args, Date.now()].join('|');
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async _compareQuality(pdf1, pdf2, diffResults) {
    const baseline = await this.qualityBenchmark.analyze(pdf1);
    const test = await this.qualityBenchmark.analyze(pdf2);

    return {
      baseline: {
        score: baseline.score,
        grade: baseline.grade,
        details: baseline
      },
      test: {
        score: test.score,
        grade: test.grade,
        details: test
      },
      delta: test.score - baseline.score,
      improved: test.score > baseline.score,
      categoryDeltas: this._calculateCategoryDeltas(baseline, test)
    };
  }

  _calculateCategoryDeltas(baseline, test) {
    const categories = Object.keys(baseline.categoryScores || {});
    const deltas = {};

    for (const category of categories) {
      const baselineScore = baseline.categoryScores[category] || 0;
      const testScore = test.categoryScores[category] || 0;
      deltas[category] = testScore - baselineScore;
    }

    return deltas;
  }

  async _detectRegressions(diffResults, qualityComparison) {
    const regressions = [];

    // Quality score regression
    if (qualityComparison.delta < -5) {
      regressions.push({
        type: 'quality',
        severity: 'high',
        description: `Quality score decreased by ${Math.abs(qualityComparison.delta)} points`,
        before: qualityComparison.baseline.score,
        after: qualityComparison.test.score
      });
    }

    // Category regressions
    for (const [category, delta] of Object.entries(qualityComparison.categoryDeltas)) {
      if (delta < -10) {
        regressions.push({
          type: 'category',
          category,
          severity: delta < -20 ? 'high' : 'medium',
          description: `${category} score decreased by ${Math.abs(delta)} points`,
          before: qualityComparison.baseline.details.categoryScores[category],
          after: qualityComparison.test.details.categoryScores[category]
        });
      }
    }

    // Visual regressions
    if (diffResults.visual && diffResults.visual.similarity < 90) {
      regressions.push({
        type: 'visual',
        severity: 'medium',
        description: 'Significant visual changes detected',
        similarity: diffResults.visual.similarity
      });
    }

    // Content regressions (text removed)
    if (diffResults.content && diffResults.content.deletions > 100) {
      regressions.push({
        type: 'content',
        severity: 'medium',
        description: 'Significant content removed',
        deletions: diffResults.content.deletions
      });
    }

    return regressions;
  }

  _countChanges(diffResults) {
    let count = 0;

    if (diffResults.visual) count += diffResults.visual.changes || 0;
    if (diffResults.content) count += (diffResults.content.additions || 0) + (diffResults.content.deletions || 0);
    if (diffResults.layout) count += diffResults.layout.changes || 0;
    if (diffResults.color) count += diffResults.color.changes || 0;
    if (diffResults.font) count += diffResults.font.changes || 0;
    if (diffResults.image) count += diffResults.image.changes || 0;

    return count;
  }

  async _generateRecommendations(diffResults, qualityComparison, impactAnalysis, regressions) {
    const recommendations = [];

    // Address regressions first
    if (regressions.length > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'regressions',
        title: 'Fix Quality Regressions',
        description: `${regressions.length} regression(s) detected that need immediate attention`,
        actions: regressions.map(r => ({
          action: `Fix ${r.type} regression: ${r.description}`,
          impact: r.severity
        }))
      });
    }

    // Quality improvement recommendations
    if (qualityComparison.test.score < 90) {
      const gaps = await this.qualityBenchmark.analyzeGaps(
        qualityComparison.test.details,
        await this.qualityBenchmark.loadBenchmarks('A+')
      );

      recommendations.push({
        priority: 'high',
        category: 'quality',
        title: 'Improve Quality Score',
        description: `Current score: ${qualityComparison.test.score}, Target: 95+ (A+ grade)`,
        actions: gaps.critical.map(gap => ({
          action: gap.recommendation,
          impact: 'high'
        }))
      });
    }

    // AI-powered recommendations
    if (impactAnalysis && impactAnalysis.recommendations) {
      recommendations.push(...impactAnalysis.recommendations);
    }

    return recommendations;
  }

  _getTargetScore(grade) {
    const gradeMap = {
      'A+': 95,
      'A': 90,
      'A-': 85,
      'B+': 80,
      'B': 75,
      'B-': 70,
      'C+': 65,
      'C': 60
    };
    return gradeMap[grade] || 90;
  }

  async _generateImprovementRoadmap(gaps, comparison) {
    const tasks = [];

    // Critical gaps (Week 1)
    for (const gap of gaps.critical || []) {
      tasks.push({
        priority: 'critical',
        week: 1,
        task: gap.title,
        description: gap.description,
        estimatedHours: gap.estimatedHours || 8
      });
    }

    // High priority gaps (Week 2)
    for (const gap of gaps.high || []) {
      tasks.push({
        priority: 'high',
        week: 2,
        task: gap.title,
        description: gap.description,
        estimatedHours: gap.estimatedHours || 4
      });
    }

    // Medium priority gaps (Week 3)
    for (const gap of gaps.medium || []) {
      tasks.push({
        priority: 'medium',
        week: 3,
        task: gap.title,
        description: gap.description,
        estimatedHours: gap.estimatedHours || 2
      });
    }

    const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const estimatedWeeks = Math.ceil(totalHours / 40);

    return {
      tasks,
      totalTasks: tasks.length,
      totalHours,
      estimatedWeeks,
      phases: this._groupTasksByWeek(tasks)
    };
  }

  _groupTasksByWeek(tasks) {
    const phases = {};

    for (const task of tasks) {
      if (!phases[task.week]) {
        phases[task.week] = [];
      }
      phases[task.week].push(task);
    }

    return phases;
  }

  async _sortVersions(versions) {
    // Sort by timestamp if available, otherwise by version number
    return versions.sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return new Date(a.timestamp) - new Date(b.timestamp);
      }
      if (a.version && b.version) {
        return this._compareVersionNumbers(a.version, b.version);
      }
      return 0;
    });
  }

  _compareVersionNumbers(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 !== p2) return p1 - p2;
    }

    return 0;
  }

  async _analyzeVersions(versions) {
    const analyses = [];

    for (const version of versions) {
      const analysis = await this.qualityBenchmark.analyze(version.path);
      analyses.push({
        ...version,
        analysis
      });
    }

    return analyses;
  }

  async _analyzeDocuments(documents) {
    const analyses = [];

    for (const doc of documents) {
      const analysis = await this.qualityBenchmark.analyze(doc);
      analyses.push({
        path: doc,
        name: path.basename(doc),
        analysis
      });
    }

    return analyses;
  }

  async _predictFutureQuality(progression, statistics) {
    // Linear regression prediction
    const versions = progression.versions;
    const scores = versions.map(v => v.analysis.score);
    const n = scores.length;

    if (n < 2) {
      return {
        projectedGrade: versions[n - 1].analysis.grade,
        weeksToTarget: null,
        confidence: 'low'
      };
    }

    // Calculate trend line
    const xValues = Array.from({ length: n }, (_, i) => i);
    const trend = this._calculateLinearRegression(xValues, scores);

    // Project to target grade (A+ = 95)
    const currentScore = scores[n - 1];
    const targetScore = 95;
    const scoreGap = targetScore - currentScore;

    if (trend.slope <= 0) {
      return {
        projectedGrade: versions[n - 1].analysis.grade,
        weeksToTarget: null,
        confidence: 'low',
        trend: 'declining'
      };
    }

    const versionsToTarget = scoreGap / trend.slope;
    const weeksToTarget = Math.ceil(versionsToTarget * 2); // Assuming 2 weeks per version

    return {
      projectedGrade: 'A+',
      weeksToTarget,
      confidence: trend.r2 > 0.8 ? 'high' : trend.r2 > 0.5 ? 'medium' : 'low',
      trend: 'improving',
      slope: trend.slope,
      r2: trend.r2
    };
  }

  _calculateLinearRegression(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => {
      const prediction = slope * x[i] + intercept;
      return sum + Math.pow(yi - prediction, 2);
    }, 0);
    const r2 = 1 - (ssResidual / ssTotal);

    return { slope, intercept, r2 };
  }

  _calculateOverallConsistency(brandConsistency, colorConsistency, typographyConsistency) {
    const scores = [
      brandConsistency.score || 0,
      colorConsistency.score || 0,
      typographyConsistency.score || 0
    ];

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  async _generateConsistencyRecommendations(brandConsistency, colorConsistency, typographyConsistency) {
    const recommendations = [];

    // Brand violations
    if (brandConsistency.violations && brandConsistency.violations.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'brand',
        title: 'Fix Brand Consistency Issues',
        violations: brandConsistency.violations,
        actions: brandConsistency.violations.map(v => ({
          action: `Fix ${v.type}: ${v.description}`,
          impact: 'high'
        }))
      });
    }

    // Color violations
    if (colorConsistency.violations && colorConsistency.violations.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'color',
        title: 'Standardize Color Usage',
        violations: colorConsistency.violations,
        actions: colorConsistency.violations.map(v => ({
          action: `Standardize ${v.color} usage across documents`,
          impact: 'medium'
        }))
      });
    }

    // Typography violations
    if (typographyConsistency.violations && typographyConsistency.violations.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'typography',
        title: 'Standardize Typography',
        violations: typographyConsistency.violations,
        actions: typographyConsistency.violations.map(v => ({
          action: `Standardize ${v.fontFamily} usage: ${v.description}`,
          impact: 'medium'
        }))
      });
    }

    return recommendations;
  }

  _calculateRanking(testAnalysis, competitorAnalyses) {
    const all = [testAnalysis, ...competitorAnalyses];
    const sorted = all.sort((a, b) => b.score - a.score);
    const testRank = sorted.findIndex(a => a === testAnalysis) + 1;

    return {
      rank: testRank,
      total: all.length,
      percentile: ((all.length - testRank + 1) / all.length) * 100,
      topPerformer: sorted[0] === testAnalysis
    };
  }

  async _calculateReportSize(reportPaths) {
    let totalSize = 0;

    for (const filepath of Object.values(reportPaths)) {
      const stats = await fs.stat(filepath);
      totalSize += stats.size;
    }

    return {
      bytes: totalSize,
      kb: (totalSize / 1024).toFixed(2),
      mb: (totalSize / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      cacheSize: this.cache.size
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.emit('cache-cleared');
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.clearCache();
    this.removeAllListeners();
  }
}

/**
 * Exports
 */
module.exports = {
  ComparativeAnalyzer,
  ComparisonType,
  AnalysisDepth,
  ComparisonCategory,
  QualityGrade
};
