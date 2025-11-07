#!/usr/bin/env node

/**
 * Compatibility Analyzer
 *
 * Analyzes PDF compatibility and provides version optimization recommendations:
 * - PDF version detection (1.4, 1.5, 1.6, 1.7, 2.0)
 * - Feature compatibility analysis
 * - Reader-specific optimization
 * - Accessibility feature detection
 * - AI-powered compatibility analysis (Claude Opus 4.1)
 */

class CompatibilityAnalyzer {
  constructor(options, aiClients) {
    this.options = options;
    this.aiClients = aiClients;
    this.logger = options.logger || console;
    this.verbose = options.verbose || false;

    // Compatibility matrix
    this.matrix = options.compatibilityMatrix || {
      '1.4': { readers: ['all'], features: ['basic'] },
      '1.5': { readers: ['most'], features: ['objectStreams', 'crossRefStreams'] },
      '1.6': { readers: ['most'], features: ['objectStreams', 'crossRefStreams', 'AES'] },
      '1.7': { readers: ['modern'], features: ['all1.6', 'attachments', '3D'] },
      '2.0': { readers: ['latest'], features: ['all1.7', 'enhanced'] }
    };
  }

  /**
   * Main compatibility analysis
   */
  async analyze(pdfDoc) {
    const analysis = {
      version: '1.7',
      features: [],
      readerCompatibility: 'modern',
      accessibilityFeatures: [],
      modernFeatures: {
        objectStreams: false,
        crossRefStreams: false,
        encryption: false,
        attachments: false,
        layers: false,
        transparency: false,
        javascript: false,
        forms: false,
        signatures: false,
        multimedia: false,
        threeDContent: false
      },
      recommendedVersion: '1.7',
      optimizationOpportunities: [],
      compatibilityRisks: []
    };

    try {
      // 1. Detect PDF version
      this.detectVersion(pdfDoc, analysis);

      // 2. Analyze features
      await this.analyzeFeatures(pdfDoc, analysis);

      // 3. Determine reader compatibility
      this.determineReaderCompatibility(analysis);

      // 4. Check accessibility features
      this.checkAccessibility(pdfDoc, analysis);

      // 5. Recommend optimal version
      this.recommendVersion(analysis);

      // 6. Identify optimization opportunities
      this.identifyOptimizations(analysis);

      // 7. Assess compatibility risks
      this.assessCompatibilityRisks(analysis);

      return analysis;

    } catch (error) {
      this.logger.error('Compatibility analysis error:', error);
      return analysis;
    }
  }

  /**
   * Detect PDF version
   */
  detectVersion(pdfDoc, analysis) {
    try {
      const context = pdfDoc.context;

      // Get version from document (simplified - would parse header)
      // Default to 1.7 (most common)
      analysis.version = '1.7';

      // Check for PDF 2.0 features
      const catalog = pdfDoc.catalog;
      const version = catalog.get(context.obj('Version'));
      if (version) {
        const versionStr = version.toString();
        if (versionStr.includes('2.')) {
          analysis.version = '2.0';
        } else if (versionStr.includes('1.7')) {
          analysis.version = '1.7';
        } else if (versionStr.includes('1.6')) {
          analysis.version = '1.6';
        } else if (versionStr.includes('1.5')) {
          analysis.version = '1.5';
        } else if (versionStr.includes('1.4')) {
          analysis.version = '1.4';
        }
      }

      this.log(`  Detected PDF version: ${analysis.version}`);

    } catch (error) {
      this.logger.warn('Version detection warning:', error.message);
    }
  }

  /**
   * Analyze PDF features
   */
  async analyzeFeatures(pdfDoc, analysis) {
    try {
      const context = pdfDoc.context;
      const catalog = pdfDoc.catalog;

      // Check for object streams
      context.enumerateIndirectObjects().forEach((ref, obj) => {
        if (obj.constructor.name === 'PDFStream') {
          const dict = obj.dict;
          const type = dict.get(context.obj('Type'));

          if (type && type.toString() === '/ObjStm') {
            analysis.modernFeatures.objectStreams = true;
            analysis.features.push('Object Streams');
          }
        }
      });

      // Check for cross-reference streams
      if (analysis.modernFeatures.objectStreams) {
        analysis.modernFeatures.crossRefStreams = true;
        analysis.features.push('Cross-Reference Streams');
      }

      // Check for encryption
      const encrypt = catalog.get(context.obj('Encrypt'));
      if (encrypt) {
        analysis.modernFeatures.encryption = true;
        analysis.features.push('Encryption');
      }

      // Check for attachments
      const names = catalog.get(context.obj('Names'));
      if (names) {
        const namesDict = context.lookup(names);
        if (namesDict) {
          const embeddedFiles = namesDict.get(context.obj('EmbeddedFiles'));
          if (embeddedFiles) {
            analysis.modernFeatures.attachments = true;
            analysis.features.push('Attachments');
          }
        }
      }

      // Check for layers (Optional Content)
      const ocProperties = catalog.get(context.obj('OCProperties'));
      if (ocProperties) {
        analysis.modernFeatures.layers = true;
        analysis.features.push('Layers (Optional Content)');
      }

      // Check for transparency
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const resources = page.node.Resources();
        if (resources) {
          const extGState = resources.get(context.obj('ExtGState'));
          if (extGState) {
            analysis.modernFeatures.transparency = true;
          }
        }
      });

      if (analysis.modernFeatures.transparency) {
        analysis.features.push('Transparency');
      }

      // Check for JavaScript
      if (names) {
        const namesDict = context.lookup(names);
        if (namesDict) {
          const javascript = namesDict.get(context.obj('JavaScript'));
          if (javascript) {
            analysis.modernFeatures.javascript = true;
            analysis.features.push('JavaScript');
          }
        }
      }

      // Check for forms
      const acroForm = catalog.get(context.obj('AcroForm'));
      if (acroForm) {
        analysis.modernFeatures.forms = true;
        analysis.features.push('Forms (AcroForm)');
      }

      // Check for signatures
      if (acroForm) {
        const formDict = context.lookup(acroForm);
        if (formDict) {
          const sigFlags = formDict.get(context.obj('SigFlags'));
          if (sigFlags) {
            analysis.modernFeatures.signatures = true;
            analysis.features.push('Digital Signatures');
          }
        }
      }

      // Check for multimedia
      pages.forEach(page => {
        const annots = page.node.Annots();
        if (annots) {
          const annotsArray = context.lookup(annots);
          if (annotsArray && annotsArray.constructor.name === 'PDFArray') {
            const annotRefs = annotsArray.asArray();

            annotRefs.forEach(annotRef => {
              const annot = context.lookup(annotRef);
              if (annot) {
                const subtype = annot.get(context.obj('Subtype'));
                const subtypeStr = subtype ? subtype.toString() : '';

                if (subtypeStr === '/Screen' || subtypeStr === '/RichMedia') {
                  analysis.modernFeatures.multimedia = true;
                }
              }
            });
          }
        }
      });

      if (analysis.modernFeatures.multimedia) {
        analysis.features.push('Multimedia');
      }

      // Check for 3D content
      pages.forEach(page => {
        const annots = page.node.Annots();
        if (annots) {
          const annotsArray = context.lookup(annots);
          if (annotsArray && annotsArray.constructor.name === 'PDFArray') {
            const annotRefs = annotsArray.asArray();

            annotRefs.forEach(annotRef => {
              const annot = context.lookup(annotRef);
              if (annot) {
                const subtype = annot.get(context.obj('Subtype'));
                if (subtype && subtype.toString() === '/3D') {
                  analysis.modernFeatures.threeDContent = true;
                }
              }
            });
          }
        }
      });

      if (analysis.modernFeatures.threeDContent) {
        analysis.features.push('3D Content');
      }

      this.log(`  Detected ${analysis.features.length} features`);

    } catch (error) {
      this.logger.warn('Feature analysis warning:', error.message);
    }
  }

  /**
   * Determine reader compatibility
   */
  determineReaderCompatibility(analysis) {
    const version = analysis.version;

    if (this.matrix[version]) {
      const readers = this.matrix[version].readers[0];
      analysis.readerCompatibility = readers;
    }

    // Adjust based on features
    if (analysis.modernFeatures.threeDContent || analysis.modernFeatures.multimedia) {
      analysis.readerCompatibility = 'latest (Acrobat)';
    } else if (analysis.modernFeatures.layers || analysis.modernFeatures.signatures) {
      analysis.readerCompatibility = 'modern';
    } else if (analysis.modernFeatures.objectStreams) {
      analysis.readerCompatibility = 'most';
    }

    this.log(`  Reader compatibility: ${analysis.readerCompatibility}`);
  }

  /**
   * Check accessibility features
   */
  checkAccessibility(pdfDoc, analysis) {
    try {
      const context = pdfDoc.context;
      const catalog = pdfDoc.catalog;

      // Check for Tagged PDF
      const markInfo = catalog.get(context.obj('MarkInfo'));
      if (markInfo) {
        const markInfoDict = context.lookup(markInfo);
        if (markInfoDict) {
          const marked = markInfoDict.get(context.obj('Marked'));
          if (marked && marked.toString() === 'true') {
            analysis.accessibilityFeatures.push('Tagged PDF');
          }
        }
      }

      // Check for StructTreeRoot
      const structTreeRoot = catalog.get(context.obj('StructTreeRoot'));
      if (structTreeRoot) {
        analysis.accessibilityFeatures.push('Document Structure');
      }

      // Check for language
      const lang = catalog.get(context.obj('Lang'));
      if (lang) {
        analysis.accessibilityFeatures.push('Language Specified');
      }

      // Check for metadata
      const metadata = catalog.get(context.obj('Metadata'));
      if (metadata) {
        analysis.accessibilityFeatures.push('XMP Metadata');
      }

      if (analysis.accessibilityFeatures.length > 0) {
        this.log(`  Accessibility features: ${analysis.accessibilityFeatures.length}`);
      }

    } catch (error) {
      this.logger.warn('Accessibility check warning:', error.message);
    }
  }

  /**
   * Recommend optimal PDF version
   */
  recommendVersion(analysis) {
    // Start with minimum version needed for features
    let recommendedVersion = '1.4'; // Baseline

    if (analysis.modernFeatures.threeDContent || analysis.modernFeatures.multimedia) {
      recommendedVersion = '1.7';
    } else if (analysis.modernFeatures.layers || analysis.modernFeatures.encryption) {
      recommendedVersion = '1.6';
    } else if (analysis.modernFeatures.objectStreams || analysis.modernFeatures.transparency) {
      recommendedVersion = '1.5';
    }

    // For optimization, prefer 1.7 (best compatibility + features)
    if (recommendedVersion === '1.4' || recommendedVersion === '1.5') {
      recommendedVersion = '1.7'; // Modern standard
    }

    analysis.recommendedVersion = recommendedVersion;

    if (analysis.version !== recommendedVersion) {
      this.log(`  Recommended version: ${recommendedVersion} (current: ${analysis.version})`);
    }
  }

  /**
   * Identify optimization opportunities
   */
  identifyOptimizations(analysis) {
    const opportunities = [];

    // Object streams
    if (!analysis.modernFeatures.objectStreams && parseFloat(analysis.version) >= 1.5) {
      opportunities.push({
        feature: 'Object Streams',
        benefit: 'Reduced file size (10-20%)',
        requiredVersion: '1.5',
        compatible: true
      });
    }

    // Cross-reference streams
    if (!analysis.modernFeatures.crossRefStreams && parseFloat(analysis.version) >= 1.5) {
      opportunities.push({
        feature: 'Cross-Reference Streams',
        benefit: 'Faster parsing, smaller file',
        requiredVersion: '1.5',
        compatible: true
      });
    }

    // Version upgrade
    if (parseFloat(analysis.version) < 1.7) {
      opportunities.push({
        feature: 'Upgrade to PDF 1.7',
        benefit: 'Access to modern optimization features',
        requiredVersion: '1.7',
        compatible: true
      });
    }

    // Linearization
    opportunities.push({
      feature: 'Linearization',
      benefit: 'Fast web view, progressive loading',
      requiredVersion: analysis.version,
      compatible: true
    });

    analysis.optimizationOpportunities = opportunities;

    if (opportunities.length > 0) {
      this.log(`  Identified ${opportunities.length} optimization opportunities`);
    }
  }

  /**
   * Assess compatibility risks
   */
  assessCompatibilityRisks(analysis) {
    const risks = [];

    // PDF 2.0 compatibility
    if (analysis.version === '2.0') {
      risks.push({
        severity: 'medium',
        issue: 'PDF 2.0 limited support',
        impact: 'May not open in older readers',
        mitigation: 'Consider downgrading to 1.7 for wider compatibility'
      });
    }

    // 3D content
    if (analysis.modernFeatures.threeDContent) {
      risks.push({
        severity: 'high',
        issue: '3D content requires Acrobat',
        impact: 'Will not display in most PDF readers',
        mitigation: 'Provide 2D fallback images'
      });
    }

    // Multimedia
    if (analysis.modernFeatures.multimedia) {
      risks.push({
        severity: 'medium',
        issue: 'Multimedia limited support',
        impact: 'May not play in all readers',
        mitigation: 'Test across target readers'
      });
    }

    // JavaScript
    if (analysis.modernFeatures.javascript) {
      risks.push({
        severity: 'low',
        issue: 'JavaScript may be disabled',
        impact: 'Interactive features may not work',
        mitigation: 'Provide non-JavaScript fallbacks'
      });
    }

    // Encryption
    if (analysis.modernFeatures.encryption) {
      risks.push({
        severity: 'low',
        issue: 'Encryption may limit optimization',
        impact: 'Some optimization techniques unavailable',
        mitigation: 'Remove encryption before optimization'
      });
    }

    analysis.compatibilityRisks = risks;

    if (risks.length > 0) {
      this.log(`  Identified ${risks.length} compatibility risks`);
    }
  }

  /**
   * Get AI compatibility recommendations
   */
  async getAIRecommendations(analysis) {
    if (!this.aiClients.anthropic) {
      return null;
    }

    const prompt = `Analyze this PDF's compatibility profile and provide recommendations:

PDF Version: ${analysis.version}
Features: ${analysis.features.join(', ')}
Reader Compatibility: ${analysis.readerCompatibility}
Accessibility: ${analysis.accessibilityFeatures.join(', ')}

Modern Features:
- Object Streams: ${analysis.modernFeatures.objectStreams ? 'Yes' : 'No'}
- Transparency: ${analysis.modernFeatures.transparency ? 'Yes' : 'No'}
- Forms: ${analysis.modernFeatures.forms ? 'Yes' : 'No'}
- JavaScript: ${analysis.modernFeatures.javascript ? 'Yes' : 'No'}
- Multimedia: ${analysis.modernFeatures.multimedia ? 'Yes' : 'No'}

Provide 3-5 specific compatibility and optimization recommendations. For each:
1. Recommendation (feature or version change)
2. Benefit (performance, compatibility, file size)
3. Compatibility impact (which readers affected)
4. Implementation complexity (easy/moderate/complex)
5. Priority (high/medium/low)

Balance modern optimization features with broad reader compatibility.`;

    try {
      const response = await this.aiClients.anthropic.messages.create({
        model: 'claude-opus-4.1',
        max_tokens: 2500,
        temperature: 0.2,
        system: 'You are a PDF compatibility expert with deep knowledge of PDF versions, features, and reader support.',
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      return response.content[0].text;

    } catch (error) {
      this.logger.warn('AI compatibility recommendations error:', error.message);
      return null;
    }
  }

  /**
   * Log with verbose mode
   */
  log(message) {
    if (this.verbose || this.options.logging?.level !== 'silent') {
      this.logger.log(message);
    }
  }
}

module.exports = CompatibilityAnalyzer;
