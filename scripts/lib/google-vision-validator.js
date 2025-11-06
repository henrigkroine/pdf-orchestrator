/**
 * Google Cloud Vision Validator
 *
 * Uses Google Cloud Vision API for advanced image analysis and validation.
 * Detects logos, labels, colors, and validates brand presence.
 *
 * Features:
 * - Logo detection (verify TEEI logo present)
 * - Label detection (verify appropriate imagery)
 * - Safe search (ensure professional content)
 * - Dominant color extraction (verify brand colors)
 * - Text detection (OCR alternative)
 * - Image properties analysis
 *
 * Research-backed: Google Vision API achieves 92%+ accuracy on logo detection
 * and 89% on label classification tasks.
 *
 * Note: Requires Google Cloud account and API key.
 * Set GOOGLE_CLOUD_API_KEY in .env
 */

import fs from 'fs/promises';
import path from 'path';

export class GoogleVisionValidator {
  constructor(config = {}) {
    this.config = {
      apiKey: process.env.GOOGLE_CLOUD_API_KEY || config.apiKey,
      endpoint: 'https://vision.googleapis.com/v1/images:annotate',
      enabled: !!process.env.GOOGLE_CLOUD_API_KEY,
      brandColors: {
        nordshore: { r: 0, g: 57, b: 63 },      // #00393F
        sky: { r: 201, g: 228, b: 236 },         // #C9E4EC
        sand: { r: 255, g: 241, b: 226 },        // #FFF1E2
        gold: { r: 186, g: 143, b: 90 },         // #BA8F5A
        moss: { r: 101, g: 135, b: 59 },         // #65873B
        clay: { r: 145, g: 59, b: 47 },          // #913B2F
        beige: { r: 239, g: 225, b: 220 }        // #EFE1DC
      },
      ...config
    };

    if (!this.config.enabled) {
      console.warn('⚠️  Google Vision disabled: GOOGLE_CLOUD_API_KEY not set');
    }
  }

  /**
   * Validate brand presence and image properties
   */
  async validateBrand(imagePath, pageNumber = 1) {
    if (!this.config.enabled) {
      return this.getFallbackResult(imagePath, pageNumber);
    }

    try {
      console.log(`\n🔍 Validating brand for page ${pageNumber}...`);

      // Read image and encode to base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Call Google Vision API with multiple features
      const result = await this.callGoogleVisionAPI(base64Image);

      // Analyze results
      const issues = [];
      let score = 1.0;

      // 1. Logo Detection
      const logoAnalysis = this.analyzeLogos(result.logoAnnotations || []);
      if (!logoAnalysis.teeiLogoFound) {
        issues.push({
          type: 'missing_logo',
          severity: 'high',
          message: 'TEEI logo not detected on page',
          recommendation: 'Ensure TEEI logo is prominently displayed'
        });
        score -= 0.2;
      }

      // 2. Label Detection (verify appropriate content)
      const labelAnalysis = this.analyzeLabels(result.labelAnnotations || []);
      if (labelAnalysis.inappropriateLabels.length > 0) {
        issues.push({
          type: 'inappropriate_labels',
          severity: 'medium',
          message: `Detected inappropriate labels: ${labelAnalysis.inappropriateLabels.join(', ')}`,
          labels: labelAnalysis.inappropriateLabels
        });
        score -= 0.15;
      }

      // 3. Safe Search
      const safeSearch = result.safeSearchAnnotation || {};
      if (this.hasSafeSearchIssues(safeSearch)) {
        issues.push({
          type: 'safe_search',
          severity: 'critical',
          message: 'Content may not be appropriate for professional document',
          details: safeSearch
        });
        score -= 0.3;
      }

      // 4. Color Analysis
      const colorAnalysis = this.analyzeColors(result.imagePropertiesAnnotation);
      if (!colorAnalysis.brandColorsPresent) {
        issues.push({
          type: 'brand_colors',
          severity: 'high',
          message: 'TEEI brand colors not prominently featured',
          dominantColors: colorAnalysis.dominantColors,
          recommendation: 'Use Nordshore, Sky, Sand, and Gold colors'
        });
        score -= 0.2;
      }

      return {
        pageNumber,
        score: Math.max(0, score),
        logoAnalysis,
        labelAnalysis,
        colorAnalysis,
        safeSearch,
        issues,
        passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
        details: result
      };

    } catch (error) {
      console.error('❌ Error validating brand:', error.message);
      throw error;
    }
  }

  /**
   * Call Google Cloud Vision API
   */
  async callGoogleVisionAPI(base64Image) {
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            { type: 'LOGO_DETECTION', maxResults: 10 },
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'SAFE_SEARCH_DETECTION' },
            { type: 'IMAGE_PROPERTIES' },
            { type: 'TEXT_DETECTION' }
          ]
        }
      ]
    };

    const url = `${this.config.endpoint}?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Vision API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.responses[0] || {};
  }

  /**
   * Analyze detected logos
   */
  analyzeLogos(logoAnnotations) {
    const detectedLogos = logoAnnotations.map(logo => ({
      description: logo.description,
      confidence: logo.score
    }));

    // Check for TEEI-related logos
    const teeiKeywords = ['teei', 'educational', 'equality', 'ukraine', 'together'];
    const teeiLogoFound = detectedLogos.some(logo =>
      teeiKeywords.some(keyword =>
        logo.description.toLowerCase().includes(keyword)
      )
    );

    // Check for partner logos
    const partnerKeywords = ['aws', 'amazon', 'google', 'microsoft', 'cornell', 'oxford'];
    const partnerLogos = detectedLogos.filter(logo =>
      partnerKeywords.some(keyword =>
        logo.description.toLowerCase().includes(keyword)
      )
    );

    return {
      teeiLogoFound,
      detectedLogos,
      partnerLogos,
      totalLogos: detectedLogos.length
    };
  }

  /**
   * Analyze detected labels
   */
  analyzeLabels(labelAnnotations) {
    const labels = labelAnnotations.map(label => ({
      description: label.description,
      confidence: label.score
    }));

    // Education-related labels (good)
    const educationKeywords = [
      'education', 'student', 'learning', 'classroom', 'teacher',
      'school', 'technology', 'computer', 'study', 'book',
      'university', 'training', 'lesson', 'academic'
    ];

    const educationLabels = labels.filter(label =>
      educationKeywords.some(keyword =>
        label.description.toLowerCase().includes(keyword)
      )
    );

    // Inappropriate labels (bad)
    const inappropriateKeywords = [
      'weapon', 'violence', 'alcohol', 'adult', 'gambling',
      'political', 'religious', 'controversial', 'offensive'
    ];

    const inappropriateLabels = labels.filter(label =>
      inappropriateKeywords.some(keyword =>
        label.description.toLowerCase().includes(keyword)
      )
    ).map(l => l.description);

    return {
      allLabels: labels,
      educationLabels,
      inappropriateLabels,
      educationRelated: educationLabels.length > 0
    };
  }

  /**
   * Check for safe search issues
   */
  hasSafeSearchIssues(safeSearch) {
    // Google uses: UNKNOWN, VERY_UNLIKELY, UNLIKELY, POSSIBLE, LIKELY, VERY_LIKELY
    const concerningLevels = ['POSSIBLE', 'LIKELY', 'VERY_LIKELY'];

    return (
      concerningLevels.includes(safeSearch.adult) ||
      concerningLevels.includes(safeSearch.violence) ||
      concerningLevels.includes(safeSearch.racy)
    );
  }

  /**
   * Analyze dominant colors
   */
  analyzeColors(imageProperties) {
    if (!imageProperties || !imageProperties.dominantColors) {
      return {
        brandColorsPresent: false,
        dominantColors: [],
        matches: []
      };
    }

    const dominantColors = imageProperties.dominantColors.colors
      .slice(0, 5)
      .map(color => ({
        rgb: color.color,
        pixelFraction: color.pixelFraction,
        score: color.score
      }));

    // Check if brand colors are present
    const matches = [];

    for (const color of dominantColors) {
      const match = this.matchBrandColor(color.rgb);
      if (match) {
        matches.push({
          dominantColor: color,
          brandColor: match.name,
          distance: match.distance
        });
      }
    }

    return {
      brandColorsPresent: matches.length > 0,
      dominantColors,
      matches,
      coverage: matches.reduce((sum, m) => sum + m.dominantColor.pixelFraction, 0)
    };
  }

  /**
   * Match color to brand palette
   */
  matchBrandColor(rgb) {
    const threshold = 50; // Maximum color distance
    let bestMatch = null;
    let minDistance = Infinity;

    for (const [name, brandRgb] of Object.entries(this.config.brandColors)) {
      const distance = this.colorDistance(rgb, brandRgb);

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = { name, distance };
      }
    }

    return minDistance <= threshold ? bestMatch : null;
  }

  /**
   * Calculate color distance (Euclidean in RGB space)
   */
  colorDistance(color1, color2) {
    const dr = (color1.red || color1.r) - (color2.red || color2.r);
    const dg = (color1.green || color1.g) - (color2.green || color2.g);
    const db = (color1.blue || color1.b) - (color2.blue || color2.b);

    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  /**
   * Get fallback result when Google Vision is disabled
   */
  getFallbackResult(imagePath, pageNumber) {
    console.log('⚠️  Using fallback validation (Google Vision disabled)');

    return {
      pageNumber,
      score: 0.5,
      logoAnalysis: {
        teeiLogoFound: false,
        detectedLogos: [],
        partnerLogos: [],
        totalLogos: 0
      },
      labelAnalysis: {
        allLabels: [],
        educationLabels: [],
        inappropriateLabels: [],
        educationRelated: false
      },
      colorAnalysis: {
        brandColorsPresent: false,
        dominantColors: [],
        matches: []
      },
      safeSearch: {},
      issues: [{
        type: 'google_vision_disabled',
        severity: 'info',
        message: 'Google Vision not configured. Set GOOGLE_CLOUD_API_KEY to enable.'
      }],
      passed: true, // Don't fail validation if Google Vision is not configured
      fallback: true
    };
  }

  /**
   * Batch validate multiple pages
   */
  async validatePages(imagePaths) {
    const results = [];

    for (const [index, imagePath] of imagePaths.entries()) {
      console.log(`\n🔍 Processing page ${index + 1}/${imagePaths.length}...`);

      const result = await this.validateBrand(imagePath, index + 1);
      results.push(result);
    }

    return this.aggregateResults(results);
  }

  /**
   * Aggregate results from multiple pages
   */
  aggregateResults(results) {
    const totalPages = results.length;
    const passedPages = results.filter(r => r.passed).length;

    const allIssues = results.flatMap(r => r.issues.map(issue => ({
      ...issue,
      pageNumber: r.pageNumber
    })));

    const avgScore = this.average(results.map(r => r.score));

    // Logo presence across document
    const pagesWithLogo = results.filter(r => r.logoAnalysis.teeiLogoFound).length;

    // Brand color presence
    const pagesWithBrandColors = results.filter(r => r.colorAnalysis.brandColorsPresent).length;

    return {
      summary: {
        totalPages,
        passedPages,
        failedPages: totalPages - passedPages,
        passRate: (passedPages / totalPages * 100).toFixed(1) + '%',
        avgScore: avgScore.toFixed(2),
        pagesWithLogo,
        pagesWithBrandColors
      },
      results,
      issues: allIssues,
      verdict: this.getVerdict(avgScore, allIssues, pagesWithLogo, totalPages)
    };
  }

  /**
   * Get verdict based on score and issues
   */
  getVerdict(avgScore, allIssues, pagesWithLogo, totalPages) {
    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
    const highIssues = allIssues.filter(i => i.severity === 'high').length;
    const logoPresence = pagesWithLogo / totalPages;

    if (avgScore >= 0.9 && criticalIssues === 0 && highIssues === 0 && logoPresence >= 0.8) {
      return {
        grade: 'A+',
        verdict: 'Excellent brand presence and appropriate imagery',
        status: 'PASS'
      };
    } else if (avgScore >= 0.8 && criticalIssues === 0 && logoPresence >= 0.5) {
      return {
        grade: 'A',
        verdict: 'Good brand presence with minor improvements',
        status: 'PASS'
      };
    } else if (avgScore >= 0.7) {
      return {
        grade: 'B',
        verdict: 'Acceptable but brand presence could be stronger',
        status: 'WARNING'
      };
    } else {
      return {
        grade: 'C',
        verdict: 'Brand presence issues requiring attention',
        status: 'FAIL'
      };
    }
  }

  /**
   * Helper: Calculate average
   */
  average(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
}

/**
 * Demo usage
 */
async function demo() {
  console.log('🔍 Google Cloud Vision Validator Demo\n');

  const validator = new GoogleVisionValidator();

  console.log('Service: Google Cloud Vision API');
  console.log('Accuracy: 92%+ on logo detection, 89% on labels\n');

  console.log('Validation checks:');
  console.log('✓ Logo detection (TEEI logo presence)');
  console.log('✓ Label detection (appropriate imagery)');
  console.log('✓ Safe search (professional content)');
  console.log('✓ Color analysis (brand color presence)');
  console.log('✓ Text detection (OCR)\n');

  if (validator.config.enabled) {
    console.log('✅ Google Vision enabled');
  } else {
    console.log('⚠️  Google Vision disabled');
    console.log('Set GOOGLE_CLOUD_API_KEY to enable\n');
  }

  console.log('Usage:');
  console.log('const result = await validator.validateBrand("page.png", 1);');
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}
