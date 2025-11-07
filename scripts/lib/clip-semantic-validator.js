/**
 * CLIP Semantic Validator
 *
 * Uses CLIP (Contrastive Language-Image Pre-training) to validate
 * semantic alignment between images and text in TEEI documents.
 *
 * Features:
 * - Image-text alignment validation
 * - Authenticity detection (real vs stock photos)
 * - Inappropriate content detection
 * - Message consistency checking
 *
 * Research-backed: CLIP achieves 76.2% zero-shot accuracy on ImageNet,
 * demonstrating strong semantic understanding of image-text relationships.
 */

import { pipeline } from '@xenova/transformers';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export class CLIPSemanticValidator {
  constructor(config = {}) {
    this.config = {
      model: 'Xenova/clip-vit-base-patch32',
      device: config.device || 'auto',
      threshold: {
        authentic: 0.6,    // Minimum score for authentic imagery
        stockPhoto: 0.4,   // Maximum acceptable stock photo score
        alignment: 0.5     // Minimum image-text alignment
      },
      ...config
    };

    this.model = null;
    this.initialized = false;
  }

  /**
   * Initialize CLIP model (lazy loading)
   */
  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🔄 Loading CLIP model...');

      this.classifier = await pipeline(
        'zero-shot-image-classification',
        this.config.model
      );

      this.initialized = true;
      console.log('✅ CLIP model loaded successfully');

    } catch (error) {
      console.error('❌ Error loading CLIP model:', error.message);
      throw error;
    }
  }

  /**
   * Validate image-text semantic alignment
   */
  async validateImageTextAlignment(imagePath, expectedMessage) {
    await this.initialize();

    try {
      console.log(`\n🔍 Validating semantic alignment for: ${path.basename(imagePath)}`);

      // Define authenticity candidates
      const authenticCandidates = [
        'authentic Ukrainian students learning together',
        'real diverse education environment',
        'empowering education technology in classroom',
        'natural classroom setting with students',
        'genuine educational moment'
      ];

      const stockPhotoCandidates = [
        'generic corporate stock photo',
        'staged artificial setting',
        'professional studio photography',
        'posed model shoot',
        'stock image library photo'
      ];

      const inappropriateCandidates = [
        'unrelated imagery',
        'commercial product',
        'entertainment content',
        'irrelevant scene',
        'off-brand content'
      ];

      // Analyze image authenticity
      const authenticityResult = await this.classifier(imagePath, authenticCandidates);
      const stockPhotoResult = await this.classifier(imagePath, stockPhotoCandidates);
      const inappropriateResult = await this.classifier(imagePath, inappropriateCandidates);

      // Calculate scores
      const authenticityScore = authenticityResult
        .reduce((sum, item) => sum + item.score, 0) / authenticityResult.length;

      const stockPhotoScore = stockPhotoResult
        .reduce((sum, item) => sum + item.score, 0) / stockPhotoResult.length;

      const inappropriateScore = inappropriateResult
        .reduce((sum, item) => sum + item.score, 0) / inappropriateResult.length;

      // Validate against expected message
      const messageAlignment = await this.validateMessageAlignment(
        imagePath,
        expectedMessage
      );

      // Determine overall assessment
      const issues = [];
      const recommendations = [];

      if (authenticityScore < this.config.threshold.authentic) {
        issues.push({
          type: 'authenticity',
          severity: 'high',
          message: `Low authenticity score: ${(authenticityScore * 100).toFixed(1)}%`,
          score: authenticityScore
        });
        recommendations.push('Use authentic program photos showing real Ukrainian students');
      }

      if (stockPhotoScore > this.config.threshold.stockPhoto) {
        issues.push({
          type: 'stock_photo',
          severity: 'medium',
          message: `High stock photo likelihood: ${(stockPhotoScore * 100).toFixed(1)}%`,
          score: stockPhotoScore
        });
        recommendations.push('Replace with genuine program photography (not staged or stock)');
      }

      if (inappropriateScore > 0.3) {
        issues.push({
          type: 'inappropriate',
          severity: 'critical',
          message: `Image may be inappropriate or off-brand: ${(inappropriateScore * 100).toFixed(1)}%`,
          score: inappropriateScore
        });
        recommendations.push('Review image relevance to TEEI educational mission');
      }

      if (messageAlignment.score < this.config.threshold.alignment) {
        issues.push({
          type: 'message_misalignment',
          severity: 'high',
          message: `Image doesn't align with message: ${(messageAlignment.score * 100).toFixed(1)}%`,
          score: messageAlignment.score
        });
        recommendations.push('Choose image that better represents the text message');
      }

      // Overall verdict
      const passed = issues.length === 0;
      const overallScore = (
        authenticityScore * 0.4 +
        (1 - stockPhotoScore) * 0.3 +
        (1 - inappropriateScore) * 0.2 +
        messageAlignment.score * 0.1
      );

      return {
        passed,
        overallScore,
        scores: {
          authenticity: authenticityScore,
          stockPhoto: stockPhotoScore,
          inappropriate: inappropriateScore,
          messageAlignment: messageAlignment.score
        },
        details: {
          authenticityResult,
          stockPhotoResult,
          inappropriateResult,
          messageAlignment
        },
        issues,
        recommendations,
        verdict: this.getVerdict(overallScore, issues)
      };

    } catch (error) {
      console.error('❌ Error validating semantic alignment:', error.message);
      throw error;
    }
  }

  /**
   * Validate message alignment specifically
   */
  async validateMessageAlignment(imagePath, expectedMessage) {
    await this.initialize();

    try {
      // Extract key themes from message
      const themes = this.extractThemes(expectedMessage);

      // Create candidates from themes
      const candidates = themes.map(theme => theme.description);

      // Add generic positive/negative candidates
      candidates.push(
        'perfectly represents the message',
        'somewhat related to the topic',
        'unrelated to the message'
      );

      const result = await this.classifier(imagePath, candidates);

      // Calculate alignment score
      const themeScores = result.slice(0, themes.length);
      const alignmentScore = themeScores.reduce((sum, item) => sum + item.score, 0) / themeScores.length;

      return {
        score: alignmentScore,
        themes,
        matches: result,
        bestMatch: result[0]
      };

    } catch (error) {
      console.error('Error validating message alignment:', error);
      throw error;
    }
  }

  /**
   * Extract themes from text message
   */
  extractThemes(message) {
    const themes = [];

    // TEEI-specific themes
    const teeiKeywords = {
      'Ukrainian students': 'Ukrainian students learning and studying',
      'education': 'educational environment and learning',
      'technology': 'educational technology and digital tools',
      'partnership': 'collaborative partnership and teamwork',
      'empowerment': 'empowering students and educators',
      'diversity': 'diverse students and inclusive education',
      'AWS': 'cloud technology and AWS services',
      'cloud': 'cloud computing and technology infrastructure',
      'transformation': 'educational transformation and innovation',
      'refugee': 'refugee students and displaced learners'
    };

    // Check for keywords in message
    const lowerMessage = message.toLowerCase();

    for (const [keyword, description] of Object.entries(teeiKeywords)) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        themes.push({
          keyword,
          description,
          relevance: 'high'
        });
      }
    }

    // Add default theme if none found
    if (themes.length === 0) {
      themes.push({
        keyword: 'education',
        description: 'general educational setting',
        relevance: 'medium'
      });
    }

    return themes;
  }

  /**
   * Batch validate all images in document
   */
  async validateDocumentImages(imageData) {
    const results = [];

    for (const [index, data] of imageData.entries()) {
      console.log(`\n📸 Validating image ${index + 1}/${imageData.length}...`);

      const result = await this.validateImageTextAlignment(
        data.imagePath,
        data.context || data.caption || 'Educational content'
      );

      results.push({
        imageId: data.id || `image-${index + 1}`,
        imagePath: data.imagePath,
        context: data.context,
        ...result
      });
    }

    return this.aggregateResults(results);
  }

  /**
   * Aggregate results from multiple images
   */
  aggregateResults(results) {
    const totalImages = results.length;
    const passedImages = results.filter(r => r.passed).length;
    const failedImages = totalImages - passedImages;

    // Calculate average scores
    const avgScores = {
      authenticity: this.average(results.map(r => r.scores.authenticity)),
      stockPhoto: this.average(results.map(r => r.scores.stockPhoto)),
      inappropriate: this.average(results.map(r => r.scores.inappropriate)),
      messageAlignment: this.average(results.map(r => r.scores.messageAlignment)),
      overall: this.average(results.map(r => r.overallScore))
    };

    // Collect all issues
    const allIssues = results.flatMap(r => r.issues.map(issue => ({
      ...issue,
      imageId: r.imageId,
      imagePath: r.imagePath
    })));

    // Collect all recommendations
    const allRecommendations = [...new Set(results.flatMap(r => r.recommendations))];

    return {
      summary: {
        totalImages,
        passedImages,
        failedImages,
        passRate: (passedImages / totalImages * 100).toFixed(1) + '%'
      },
      averageScores: avgScores,
      results,
      issues: allIssues,
      recommendations: allRecommendations,
      overallVerdict: this.getOverallVerdict(avgScores.overall, allIssues)
    };
  }

  /**
   * Get verdict based on score and issues
   */
  getVerdict(score, issues) {
    if (score >= 0.8 && issues.length === 0) {
      return 'EXCELLENT - Authentic, appropriate imagery with strong message alignment';
    } else if (score >= 0.7 && issues.filter(i => i.severity === 'critical').length === 0) {
      return 'GOOD - Generally appropriate with minor improvements recommended';
    } else if (score >= 0.6) {
      return 'ACCEPTABLE - Some issues detected, improvements recommended';
    } else if (score >= 0.5) {
      return 'POOR - Significant issues detected, consider replacing imagery';
    } else {
      return 'CRITICAL - Major issues detected, imagery replacement required';
    }
  }

  /**
   * Get overall verdict for document
   */
  getOverallVerdict(avgScore, allIssues) {
    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
    const highIssues = allIssues.filter(i => i.severity === 'high').length;

    if (avgScore >= 0.8 && criticalIssues === 0 && highIssues === 0) {
      return {
        grade: 'A',
        verdict: 'World-class imagery authenticity and alignment',
        status: 'PASS'
      };
    } else if (avgScore >= 0.7 && criticalIssues === 0) {
      return {
        grade: 'B',
        verdict: 'Good imagery with minor improvements recommended',
        status: 'PASS'
      };
    } else if (avgScore >= 0.6) {
      return {
        grade: 'C',
        verdict: 'Acceptable but improvements needed',
        status: 'WARNING'
      };
    } else {
      return {
        grade: 'D',
        verdict: 'Significant issues requiring attention',
        status: 'FAIL'
      };
    }
  }

  /**
   * Helper: Calculate average
   */
  average(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
}

/**
 * Demo usage
 */
async function demo() {
  console.log('🔍 CLIP Semantic Validator Demo\n');

  const validator = new CLIPSemanticValidator();

  console.log('Model: Xenova/clip-vit-base-patch32');
  console.log('Capabilities: Zero-shot image classification');
  console.log('\nValidation checks:');
  console.log('✓ Authenticity (vs stock photos)');
  console.log('✓ Image-text message alignment');
  console.log('✓ Inappropriate content detection');
  console.log('✓ Brand relevance verification\n');

  console.log('Usage:');
  console.log('const result = await validator.validateImageTextAlignment(');
  console.log('  "path/to/image.jpg",');
  console.log('  "Expected message about Ukrainian students learning"');
  console.log(');\n');

  console.log('Research: CLIP achieves 76.2% zero-shot accuracy on ImageNet');
  console.log('Perfect for detecting authentic vs stock photography');
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}
