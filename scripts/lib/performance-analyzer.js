#!/usr/bin/env node

/**
 * Performance Analyzer
 *
 * Comprehensive PDF performance analysis:
 * - File size breakdown
 * - Loading time estimation
 * - Rendering complexity scoring
 * - Bottleneck identification
 * - Performance score (0-100)
 * - Optimization recommendations
 */

const fs = require('fs').promises;
const path = require('path');

class PerformanceAnalyzer {
  constructor(options) {
    this.options = options;
    this.logger = options.logger || console;
    this.verbose = options.verbose || false;

    // Performance thresholds
    this.thresholds = options.performanceThresholds || {
      excellent: 95,
      veryGood: 90,
      good: 85,
      fair: 75,
      belowAverage: 60,
      poor: 0
    };
  }

  /**
   * Comprehensive performance analysis
   */
  async analyze(pdfPath, pdfDoc) {
    const analysis = {
      filePath: pdfPath,
      timestamp: new Date().toISOString(),

      // File metrics
      fileSize: 0,
      pageCount: 0,
      objectCount: 0,

      // Size breakdown
      breakdown: {
        images: 0,
        imagePercent: 0,
        fonts: 0,
        fontPercent: 0,
        content: 0,
        contentPercent: 0,
        metadata: 0,
        metadataPercent: 0,
        structure: 0,
        structurePercent: 0
      },

      // Asset counts
      imageCount: 0,
      fontCount: 0,
      embeddedFonts: 0,
      subsettedFonts: 0,
      interactiveElements: 0,

      // Structure analysis
      isLinearized: false,
      hasObjectStreams: false,
      xrefType: 'table',
      incrementalUpdates: 0,

      // Rendering complexity
      renderingComplexity: {
        paths: 0,
        complexPaths: 0,
        transparency: 0,
        layers: 0,
        formXObjects: 0,
        patterns: 0,
        gradients: 0,
        complexityLevel: 'simple'
      },

      // Performance scores (0-100)
      overallScore: 0,
      fileSizeScore: 0,
      loadingScore: 0,
      renderingScore: 0,
      imageOptimizationScore: 0,
      fontOptimizationScore: 0,

      // Estimated loading times (ms)
      loadingTimes: {
        '3G': 0,
        '4G': 0,
        'wifi': 0
      },

      // Bottlenecks and recommendations
      bottlenecks: [],
      recommendations: []
    };

    try {
      // 1. Basic file metrics
      const stats = await fs.stat(pdfPath);
      analysis.fileSize = stats.size;
      analysis.pageCount = pdfDoc.getPageCount();

      // 2. Count objects
      const context = pdfDoc.context;
      context.enumerateIndirectObjects().forEach(() => {
        analysis.objectCount++;
      });

      // 3. Analyze file size breakdown
      await this.analyzeFileSizeBreakdown(pdfDoc, analysis, context);

      // 4. Analyze structure
      await this.analyzeStructure(pdfDoc, analysis, context);

      // 5. Analyze rendering complexity
      await this.analyzeRenderingComplexity(pdfDoc, analysis, context);

      // 6. Estimate loading times
      this.estimateLoadingTimes(analysis);

      // 7. Calculate performance scores
      this.calculatePerformanceScores(analysis);

      // 8. Identify bottlenecks
      this.identifyBottlenecks(analysis);

      // 9. Generate recommendations
      this.generateRecommendations(analysis);

      return analysis;

    } catch (error) {
      this.logger.error('Performance analysis error:', error);
      return analysis;
    }
  }

  /**
   * Analyze file size breakdown
   */
  async analyzeFileSizeBreakdown(pdfDoc, analysis, context) {
    const breakdown = {
      images: 0,
      fonts: 0,
      content: 0,
      metadata: 0,
      structure: 0
    };

    try {
      let imageCount = 0;
      let fontCount = 0;

      context.enumerateIndirectObjects().forEach((ref, obj) => {
        const objType = obj.constructor.name;

        if (objType === 'PDFStream') {
          const dict = obj.dict;
          const subtype = dict.get(context.obj('Subtype'));
          const subtypeStr = subtype ? subtype.toString() : '';

          try {
            const contents = obj.getContents();
            const size = contents.length;

            if (subtypeStr === '/Image' || subtypeStr === 'Image') {
              breakdown.images += size;
              imageCount++;
            } else if (subtypeStr === '/Form') {
              breakdown.content += size;
            } else {
              // Content streams
              breakdown.content += size;
            }

          } catch (error) {
            // Error getting contents
          }

          // Check for font streams
          const type = dict.get(context.obj('Type'));
          if (type && type.toString() === '/Font') {
            breakdown.fonts += 1000; // Estimate
            fontCount++;
          }

        } else if (objType === 'PDFDict') {
          // Check for font dictionaries
          const type = obj.get(context.obj('Type'));
          if (type && type.toString() === '/Font') {
            fontCount++;

            // Try to get font file size
            const descriptor = obj.get(context.obj('FontDescriptor'));
            if (descriptor) {
              const descDict = context.lookup(descriptor);
              if (descDict) {
                const fontFile = descDict.get(context.obj('FontFile')) ||
                               descDict.get(context.obj('FontFile2')) ||
                               descDict.get(context.obj('FontFile3'));

                if (fontFile) {
                  const fileStream = context.lookup(fontFile);
                  if (fileStream) {
                    try {
                      const contents = fileStream.getContents();
                      breakdown.fonts += contents.length;
                    } catch (error) {
                      breakdown.fonts += 50000; // Default estimate
                    }
                  }
                }
              }
            }
          }

          // Metadata
          const metadata = obj.get(context.obj('Metadata'));
          if (metadata) {
            breakdown.metadata += 2000; // Typical XMP size
          }
        }
      });

      // Calculate structure overhead (xref, trailer, header, etc.)
      breakdown.structure = Math.max(
        analysis.fileSize - (breakdown.images + breakdown.fonts + breakdown.content + breakdown.metadata),
        10000
      );

      // Update analysis
      analysis.breakdown = breakdown;
      analysis.imageCount = imageCount;
      analysis.fontCount = fontCount;

      // Calculate percentages
      const total = analysis.fileSize;
      analysis.breakdown.imagePercent = (breakdown.images / total) * 100;
      analysis.breakdown.fontPercent = (breakdown.fonts / total) * 100;
      analysis.breakdown.contentPercent = (breakdown.content / total) * 100;
      analysis.breakdown.metadataPercent = (breakdown.metadata / total) * 100;
      analysis.breakdown.structurePercent = (breakdown.structure / total) * 100;

    } catch (error) {
      this.logger.warn('File size breakdown warning:', error.message);
    }
  }

  /**
   * Analyze PDF structure
   */
  async analyzeStructure(pdfDoc, analysis, context) {
    try {
      // Check for linearization
      // (Simplified - would need to parse PDF structure)
      analysis.isLinearized = false;

      // Check for object streams
      context.enumerateIndirectObjects().forEach((ref, obj) => {
        if (obj.constructor.name === 'PDFStream') {
          const dict = obj.dict;
          const type = dict.get(context.obj('Type'));
          if (type && type.toString() === '/ObjStm') {
            analysis.hasObjectStreams = true;
          }
        }
      });

      // Determine xref type
      analysis.xrefType = analysis.hasObjectStreams ? 'stream' : 'table';

      // Count interactive elements
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const annots = page.node.Annots();
        if (annots) {
          const annotsArray = context.lookup(annots);
          if (annotsArray && annotsArray.constructor.name === 'PDFArray') {
            const annotRefs = annotsArray.asArray();
            analysis.interactiveElements += annotRefs.length;
          }
        }
      });

      // Check for forms
      const catalog = pdfDoc.catalog;
      const acroForm = catalog.get(context.obj('AcroForm'));
      if (acroForm) {
        analysis.interactiveElements += 10; // Estimate
      }

      // Count embedded and subsetted fonts
      context.enumerateIndirectObjects().forEach((ref, obj) => {
        if (obj.constructor.name === 'PDFDict') {
          const type = obj.get(context.obj('Type'));
          if (type && type.toString() === '/Font') {
            // Check if embedded
            const descriptor = obj.get(context.obj('FontDescriptor'));
            if (descriptor) {
              const descDict = context.lookup(descriptor);
              if (descDict) {
                const fontFile = descDict.get(context.obj('FontFile')) ||
                               descDict.get(context.obj('FontFile2')) ||
                               descDict.get(context.obj('FontFile3'));
                if (fontFile) {
                  analysis.embeddedFonts++;
                }
              }
            }

            // Check if subsetted
            const baseFont = obj.get(context.obj('BaseFont'));
            if (baseFont && baseFont.toString().includes('+')) {
              analysis.subsettedFonts++;
            }
          }
        }
      });

    } catch (error) {
      this.logger.warn('Structure analysis warning:', error.message);
    }
  }

  /**
   * Analyze rendering complexity
   */
  async analyzeRenderingComplexity(pdfDoc, analysis, context) {
    const complexity = {
      paths: 0,
      complexPaths: 0,
      transparency: 0,
      layers: 0,
      formXObjects: 0,
      patterns: 0,
      gradients: 0
    };

    try {
      const pages = pdfDoc.getPages();

      // Analyze page content
      pages.forEach(page => {
        const contents = page.node.Contents();
        if (contents) {
          const streams = [];

          if (contents.constructor.name === 'PDFArray') {
            const array = contents.asArray();
            array.forEach(item => {
              const stream = context.lookup(item);
              if (stream) streams.push(stream);
            });
          } else {
            streams.push(contents);
          }

          streams.forEach(stream => {
            try {
              const contentData = stream.getContents();
              const contentStr = contentData.toString('latin1');

              // Count paths
              const pathMatches = contentStr.match(/\s[mlcvyh]\s/g);
              if (pathMatches) {
                complexity.paths += pathMatches.length;
              }

              // Count complex paths (curves)
              const curveMatches = contentStr.match(/\s[cvy]\s/g);
              if (curveMatches) {
                complexity.complexPaths += curveMatches.length;
              }

              // Count transparency
              const gsMatches = contentStr.match(/\/GS\d+\sgs/g);
              if (gsMatches) {
                complexity.transparency += gsMatches.length;
              }

            } catch (error) {
              // Error analyzing stream
            }
          });
        }

        // Check for layers
        const resources = page.node.Resources();
        if (resources) {
          const properties = resources.get(context.obj('Properties'));
          if (properties) {
            complexity.layers++;
          }

          // Check for patterns
          const pattern = resources.get(context.obj('Pattern'));
          if (pattern) {
            complexity.patterns++;
          }

          // Check for shading
          const shading = resources.get(context.obj('Shading'));
          if (shading) {
            complexity.gradients++;
          }
        }
      });

      // Count Form XObjects
      context.enumerateIndirectObjects().forEach((ref, obj) => {
        if (obj.constructor.name === 'PDFStream') {
          const dict = obj.dict;
          const subtype = dict.get(context.obj('Subtype'));
          if (subtype && subtype.toString() === '/Form') {
            complexity.formXObjects++;
          }
        }
      });

      // Determine complexity level
      if (complexity.paths > 5000 || complexity.transparency > 100) {
        complexity.complexityLevel = 'very-complex';
      } else if (complexity.paths > 2000 || complexity.transparency > 50) {
        complexity.complexityLevel = 'complex';
      } else if (complexity.paths > 500 || complexity.transparency > 20) {
        complexity.complexityLevel = 'moderate';
      } else {
        complexity.complexityLevel = 'simple';
      }

      analysis.renderingComplexity = complexity;

    } catch (error) {
      this.logger.warn('Rendering complexity analysis warning:', error.message);
    }
  }

  /**
   * Estimate loading times for different network speeds
   */
  estimateLoadingTimes(analysis) {
    const fileSize = analysis.fileSize;
    const networkSpeeds = {
      '3G': 750 * 1024 / 8,  // 750 Kbps in bytes/second
      '4G': 4 * 1024 * 1024 / 8,  // 4 Mbps
      'wifi': 10 * 1024 * 1024 / 8  // 10 Mbps
    };

    Object.keys(networkSpeeds).forEach(network => {
      const speed = networkSpeeds[network];
      const downloadTime = (fileSize / speed) * 1000; // ms
      const parsingTime = analysis.objectCount * 0.5; // 0.5ms per object
      const renderingTime = analysis.pageCount * 10; // 10ms per page

      analysis.loadingTimes[network] = Math.round(downloadTime + parsingTime + renderingTime);
    });
  }

  /**
   * Calculate performance scores
   */
  calculatePerformanceScores(analysis) {
    // File size score (smaller is better)
    const targetSizePerPage = 500000; // 500 KB per page
    const actualSizePerPage = analysis.fileSize / analysis.pageCount;
    analysis.fileSizeScore = Math.max(0, Math.min(100,
      100 - ((actualSizePerPage - targetSizePerPage) / targetSizePerPage) * 50
    ));

    // Loading score (faster is better)
    const targetLoading4G = 3000; // 3 seconds on 4G
    const actualLoading4G = analysis.loadingTimes['4G'];
    analysis.loadingScore = Math.max(0, Math.min(100,
      100 - ((actualLoading4G - targetLoading4G) / targetLoading4G) * 50
    ));

    // Rendering score (simpler is better)
    const renderingLevels = {
      'simple': 95,
      'moderate': 80,
      'complex': 65,
      'very-complex': 45
    };
    analysis.renderingScore = renderingLevels[analysis.renderingComplexity.complexityLevel] || 50;

    // Image optimization score
    const imageRatio = analysis.breakdown.imagePercent / 100;
    if (imageRatio > 0.7) {
      analysis.imageOptimizationScore = 60; // Likely not optimized
    } else if (imageRatio > 0.5) {
      analysis.imageOptimizationScore = 75;
    } else if (imageRatio > 0.3) {
      analysis.imageOptimizationScore = 85;
    } else {
      analysis.imageOptimizationScore = 95;
    }

    // Font optimization score
    const fontRatio = analysis.subsettedFonts / Math.max(1, analysis.fontCount);
    analysis.fontOptimizationScore = Math.round(fontRatio * 100);
    if (analysis.fontOptimizationScore < 50) analysis.fontOptimizationScore = 50;

    // Overall score (weighted average)
    analysis.overallScore = Math.round(
      analysis.fileSizeScore * 0.3 +
      analysis.loadingScore * 0.25 +
      analysis.renderingScore * 0.2 +
      analysis.imageOptimizationScore * 0.15 +
      analysis.fontOptimizationScore * 0.1
    );
  }

  /**
   * Identify performance bottlenecks
   */
  identifyBottlenecks(analysis) {
    const bottlenecks = [];

    // File size bottlenecks
    if (analysis.breakdown.imagePercent > 70) {
      bottlenecks.push({
        category: 'fileSize',
        severity: 'high',
        issue: 'Images account for >70% of file size',
        impact: 'Large file size, slow loading',
        recommendation: 'Optimize image compression and resolution'
      });
    }

    if (analysis.breakdown.fontPercent > 30) {
      bottlenecks.push({
        category: 'fileSize',
        severity: 'medium',
        issue: 'Fonts account for >30% of file size',
        impact: 'Unnecessarily large file',
        recommendation: 'Apply font subsetting and deduplication'
      });
    }

    // Loading bottlenecks
    if (!analysis.isLinearized) {
      bottlenecks.push({
        category: 'loading',
        severity: 'medium',
        issue: 'PDF is not linearized',
        impact: 'Slow first-page display',
        recommendation: 'Enable linearization (Fast Web View)'
      });
    }

    if (!analysis.hasObjectStreams) {
      bottlenecks.push({
        category: 'loading',
        severity: 'low',
        issue: 'No object streams',
        impact: 'Larger file size, slower loading',
        recommendation: 'Enable object streams'
      });
    }

    // Rendering bottlenecks
    if (analysis.renderingComplexity.paths > 5000) {
      bottlenecks.push({
        category: 'rendering',
        severity: 'high',
        issue: `High path count: ${analysis.renderingComplexity.paths}`,
        impact: 'Slow rendering performance',
        recommendation: 'Simplify complex paths'
      });
    }

    if (analysis.renderingComplexity.transparency > 100) {
      bottlenecks.push({
        category: 'rendering',
        severity: 'medium',
        issue: `High transparency effects: ${analysis.renderingComplexity.transparency}`,
        impact: 'Slow rendering, especially on older devices',
        recommendation: 'Consider transparency flattening'
      });
    }

    // Font bottlenecks
    if (analysis.fontCount > 0 && analysis.subsettedFonts === 0) {
      bottlenecks.push({
        category: 'fonts',
        severity: 'medium',
        issue: 'No subsetted fonts',
        impact: 'Larger file size',
        recommendation: 'Enable font subsetting'
      });
    }

    analysis.bottlenecks = bottlenecks;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Priority recommendations based on bottlenecks
    analysis.bottlenecks.forEach(bottleneck => {
      if (bottleneck.severity === 'high') {
        recommendations.push({
          priority: 'high',
          category: bottleneck.category,
          title: bottleneck.issue,
          description: bottleneck.recommendation,
          estimatedImpact: '20-40% improvement'
        });
      }
    });

    // Additional recommendations
    if (analysis.fileSizeScore < 80) {
      recommendations.push({
        priority: 'high',
        category: 'fileSize',
        title: 'Reduce file size',
        description: 'Apply aggressive compression and optimization',
        estimatedImpact: '30-50% file size reduction'
      });
    }

    if (analysis.loadingScore < 80) {
      recommendations.push({
        priority: 'high',
        category: 'loading',
        title: 'Improve loading performance',
        description: 'Enable linearization and object streams',
        estimatedImpact: '30-40% faster loading'
      });
    }

    if (analysis.renderingScore < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'rendering',
        title: 'Reduce rendering complexity',
        description: 'Simplify paths and optimize transparency',
        estimatedImpact: '20-30% faster rendering'
      });
    }

    analysis.recommendations = recommendations;
  }
}

module.exports = PerformanceAnalyzer;
