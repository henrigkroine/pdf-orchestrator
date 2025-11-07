/**
 * PHOTO SELECTOR
 * AI-powered image selection and quality evaluation
 *
 * Features:
 * - Evaluate image quality
 * - Match to brand aesthetics
 * - Detect inappropriate content
 * - Rank images by suitability
 * - Suggest alternatives
 */

const OpenAI = require('openai');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class PhotoSelector {
  constructor(config = {}) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || config.openaiKey
    });

    // TEEI brand criteria
    this.brandCriteria = {
      mood: ['hopeful', 'empowering', 'warm', 'authentic', 'inclusive'],
      subjects: ['students', 'teachers', 'learning', 'collaboration', 'education', 'technology'],
      avoid: ['staged', 'stock-photo-feel', 'artificial', 'corporate-stiff', 'dated'],
      lighting: ['natural', 'warm', 'soft', 'bright'],
      colors: ['warm tones', 'natural colors', 'cohesive palette'],
      composition: ['clean', 'balanced', 'professional', 'engaging']
    };

    // Quality criteria
    this.qualityCriteria = {
      technical: {
        sharpness: { min: 0.7, weight: 0.25 },
        exposure: { min: 0.6, weight: 0.20 },
        colorBalance: { min: 0.6, weight: 0.15 },
        composition: { min: 0.6, weight: 0.20 },
        resolution: { min: 1200, weight: 0.20 } // Min width in pixels
      },
      aesthetic: {
        brandAlignment: { min: 0.7, weight: 0.30 },
        emotionalImpact: { min: 0.6, weight: 0.25 },
        professionalism: { min: 0.7, weight: 0.25 },
        authenticity: { min: 0.6, weight: 0.20 }
      }
    };
  }

  /**
   * Evaluate and rank multiple images
   */
  async selectBestImages(imagePaths, options = {}) {
    console.log(`🖼️  Evaluating ${imagePaths.length} images...`);

    const evaluations = [];

    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      console.log(`\n[${i + 1}/${imagePaths.length}] Evaluating: ${path.basename(imagePath)}`);

      try {
        const evaluation = await this.evaluateImage(imagePath, options);
        evaluations.push({
          path: imagePath,
          filename: path.basename(imagePath),
          ...evaluation
        });
        console.log(`  Score: ${evaluation.overallScore.toFixed(1)}/100`);
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        evaluations.push({
          path: imagePath,
          filename: path.basename(imagePath),
          error: error.message,
          overallScore: 0
        });
      }
    }

    // Rank by score
    evaluations.sort((a, b) => b.overallScore - a.overallScore);

    // Select top N
    const topCount = options.selectTop || 5;
    const selected = evaluations.slice(0, topCount);

    console.log(`\n✅ Selection complete!`);
    console.log(`\nTop ${topCount} images:`);
    selected.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.filename} - ${img.overallScore.toFixed(1)}/100`);
    });

    return {
      selected,
      all: evaluations,
      summary: this.generateSelectionSummary(evaluations, selected)
    };
  }

  /**
   * Evaluate single image
   */
  async evaluateImage(imagePath, options = {}) {
    // 1. Technical analysis
    const technical = await this.analyzeTechnical(imagePath);

    // 2. AI aesthetic analysis
    const aesthetic = await this.analyzeAesthetic(imagePath, options);

    // 3. Content analysis
    const content = await this.analyzeContent(imagePath, options);

    // 4. Brand alignment
    const brandScore = await this.evaluateBrandAlignment(imagePath, aesthetic, content);

    // 5. Calculate overall score
    const overallScore = this.calculateOverallScore(technical, aesthetic, content, brandScore);

    return {
      overallScore,
      technical,
      aesthetic,
      content,
      brandAlignment: brandScore,
      recommendation: this.generateRecommendation(overallScore, technical, aesthetic, content),
      suitableFor: this.determineSuitability(overallScore, technical, aesthetic, content)
    };
  }

  /**
   * Technical analysis (sharpness, exposure, etc.)
   */
  async analyzeTechnical(imagePath) {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const stats = await image.stats();

    // Resolution score
    const resolutionScore = Math.min(
      metadata.width / this.qualityCriteria.technical.resolution.min,
      1.0
    );

    // Exposure score (based on brightness distribution)
    const avgBrightness = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length / 255;
    const exposureScore = 1 - Math.abs(avgBrightness - 0.5) * 2; // Best at 0.5 (mid-tone)

    // Contrast score (standard deviation)
    const avgContrast = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length / 255;
    const contrastScore = Math.min(avgContrast / 0.25, 1.0); // Good contrast at ~0.25

    // Color balance score (check for color casts)
    const rMean = stats.channels[0]?.mean || 0;
    const gMean = stats.channels[1]?.mean || 0;
    const bMean = stats.channels[2]?.mean || 0;
    const colorBalance = 1 - (Math.abs(rMean - gMean) + Math.abs(gMean - bMean) + Math.abs(bMean - rMean)) / (255 * 6);

    // Estimate sharpness (higher contrast = sharper, roughly)
    const sharpnessScore = Math.min(avgContrast / 0.2, 1.0);

    return {
      resolution: {
        width: metadata.width,
        height: metadata.height,
        score: resolutionScore,
        assessment: resolutionScore >= 1.0 ? 'excellent' :
                   resolutionScore >= 0.8 ? 'good' :
                   resolutionScore >= 0.6 ? 'adequate' : 'low'
      },
      sharpness: {
        score: sharpnessScore,
        assessment: sharpnessScore >= 0.8 ? 'sharp' :
                   sharpnessScore >= 0.6 ? 'acceptable' : 'soft'
      },
      exposure: {
        score: exposureScore,
        brightness: avgBrightness,
        assessment: exposureScore >= 0.8 ? 'excellent' :
                   exposureScore >= 0.6 ? 'good' : 'needs adjustment'
      },
      contrast: {
        score: contrastScore,
        assessment: contrastScore >= 0.8 ? 'good' :
                   contrastScore >= 0.5 ? 'acceptable' : 'flat'
      },
      colorBalance: {
        score: colorBalance,
        assessment: colorBalance >= 0.9 ? 'neutral' :
                   colorBalance >= 0.8 ? 'slight cast' : 'color cast present'
      },
      format: metadata.format,
      fileSize: metadata.size
    };
  }

  /**
   * AI aesthetic analysis
   */
  async analyzeAesthetic(imagePath, options) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);

      const prompt = `Evaluate this photograph's aesthetic qualities for use in professional educational materials:

BRAND CRITERIA:
- Mood: ${this.brandCriteria.mood.join(', ')}
- Lighting: ${this.brandCriteria.lighting.join(', ')}
- Colors: ${this.brandCriteria.colors.join(', ')}
- Composition: ${this.brandCriteria.composition.join(', ')}
- Avoid: ${this.brandCriteria.avoid.join(', ')}

Rate (0-10) and provide reasoning:
1. Brand alignment - Does it match TEEI warm, hopeful, authentic aesthetic?
2. Emotional impact - Does it create positive, empowering feelings?
3. Professionalism - Suitable for business/education documents?
4. Authenticity - Does it feel genuine vs. staged/stock?
5. Composition - Is it well-composed and visually balanced?
6. Color harmony - Are colors cohesive and appealing?

Return JSON:
{
  "brandAlignment": { "score": 0-10, "reasoning": "..." },
  "emotionalImpact": { "score": 0-10, "reasoning": "..." },
  "professionalism": { "score": 0-10, "reasoning": "..." },
  "authenticity": { "score": 0-10, "reasoning": "..." },
  "composition": { "score": 0-10, "reasoning": "..." },
  "colorHarmony": { "score": 0-10, "reasoning": "..." },
  "overallAssessment": "Brief overall assessment",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('  ⚠️ AI aesthetic analysis failed:', error.message);
      return this.fallbackAestheticAnalysis();
    }
  }

  /**
   * Fallback aesthetic analysis
   */
  fallbackAestheticAnalysis() {
    return {
      brandAlignment: { score: 7, reasoning: 'Unable to perform AI analysis' },
      emotionalImpact: { score: 7, reasoning: 'Unable to perform AI analysis' },
      professionalism: { score: 7, reasoning: 'Unable to perform AI analysis' },
      authenticity: { score: 7, reasoning: 'Unable to perform AI analysis' },
      composition: { score: 7, reasoning: 'Unable to perform AI analysis' },
      colorHarmony: { score: 7, reasoning: 'Unable to perform AI analysis' },
      overallAssessment: 'AI analysis unavailable, assuming moderate quality',
      strengths: [],
      weaknesses: ['Unable to perform detailed analysis']
    };
  }

  /**
   * Content analysis (what's in the image)
   */
  async analyzeContent(imagePath, options) {
    try {
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);

      const prompt = `Describe this image's content:

Identify:
- Main subjects (people, objects, settings)
- Setting/context
- Activities or interactions
- Emotional tone
- Educational relevance
- Diversity and inclusion
- Any concerning content (flag if inappropriate)

TEEI focuses on: ${this.brandCriteria.subjects.join(', ')}

Return JSON:
{
  "subjects": ["subject1", "subject2"],
  "setting": "description",
  "activities": ["activity1", "activity2"],
  "emotionalTone": "description",
  "educationalRelevance": { "score": 0-10, "reasoning": "..." },
  "diversityInclusion": { "score": 0-10, "notes": "..." },
  "appropriateness": {
    "appropriate": true/false,
    "concerns": ["concern1", "concern2"] or []
  },
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 800,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('  ⚠️ Content analysis failed:', error.message);
      return {
        subjects: ['unknown'],
        setting: 'unknown',
        activities: [],
        emotionalTone: 'neutral',
        educationalRelevance: { score: 5, reasoning: 'Analysis unavailable' },
        diversityInclusion: { score: 5, notes: 'Analysis unavailable' },
        appropriateness: { appropriate: true, concerns: [] },
        keywords: []
      };
    }
  }

  /**
   * Evaluate brand alignment
   */
  async evaluateBrandAlignment(imagePath, aesthetic, content) {
    // Combine aesthetic and content scores
    const aestheticBrandScore = aesthetic.brandAlignment?.score || 5;
    const contentRelevanceScore = content.educationalRelevance?.score || 5;
    const diversityScore = content.diversityInclusion?.score || 5;

    // Check for inappropriate content
    if (content.appropriateness && !content.appropriateness.appropriate) {
      return {
        score: 0,
        assessment: 'inappropriate',
        reason: 'Contains inappropriate content: ' + content.appropriateness.concerns.join(', ')
      };
    }

    // Weighted average
    const alignmentScore = (
      aestheticBrandScore * 0.4 +
      contentRelevanceScore * 0.35 +
      diversityScore * 0.25
    );

    return {
      score: alignmentScore,
      assessment: alignmentScore >= 8 ? 'excellent' :
                 alignmentScore >= 7 ? 'good' :
                 alignmentScore >= 6 ? 'acceptable' : 'poor',
      reason: `Aesthetic: ${aestheticBrandScore.toFixed(1)}, Relevance: ${contentRelevanceScore.toFixed(1)}, Diversity: ${diversityScore.toFixed(1)}`
    };
  }

  /**
   * Calculate overall score
   */
  calculateOverallScore(technical, aesthetic, content, brandAlignment) {
    const scores = {
      // Technical (30%)
      technical: (
        technical.resolution.score * 0.25 +
        technical.sharpness.score * 0.25 +
        technical.exposure.score * 0.20 +
        technical.contrast.score * 0.15 +
        technical.colorBalance.score * 0.15
      ) * 30,

      // Aesthetic (40%)
      aesthetic: (
        (aesthetic.brandAlignment?.score || 5) / 10 * 0.25 +
        (aesthetic.emotionalImpact?.score || 5) / 10 * 0.25 +
        (aesthetic.professionalism?.score || 5) / 10 * 0.20 +
        (aesthetic.authenticity?.score || 5) / 10 * 0.15 +
        (aesthetic.composition?.score || 5) / 10 * 0.15
      ) * 40,

      // Brand alignment (30%)
      brand: (brandAlignment.score / 10) * 30
    };

    return scores.technical + scores.aesthetic + scores.brand;
  }

  /**
   * Generate recommendation
   */
  generateRecommendation(score, technical, aesthetic, content) {
    if (score >= 85) {
      return {
        verdict: 'Excellent - Highly recommended',
        usage: 'Hero image, primary visuals, marketing materials',
        notes: 'Outstanding quality and brand alignment'
      };
    } else if (score >= 75) {
      return {
        verdict: 'Good - Recommended',
        usage: 'Primary content, document headers, presentations',
        notes: 'Strong quality, suitable for most uses'
      };
    } else if (score >= 65) {
      return {
        verdict: 'Acceptable - Use with caution',
        usage: 'Supporting images, backgrounds (with enhancement)',
        notes: 'May need enhancement or careful placement'
      };
    } else if (score >= 50) {
      return {
        verdict: 'Marginal - Consider alternatives',
        usage: 'Backup option only, or with significant editing',
        notes: 'Notable quality or alignment issues'
      };
    } else {
      return {
        verdict: 'Not recommended',
        usage: 'Do not use',
        notes: 'Does not meet quality or brand standards'
      };
    }
  }

  /**
   * Determine suitability for different uses
   */
  determineSuitability(score, technical, aesthetic, content) {
    return {
      heroImage: score >= 85 && technical.resolution.score >= 1.0,
      primaryContent: score >= 75 && technical.resolution.score >= 0.8,
      supportingImage: score >= 65,
      background: score >= 60 && technical.sharpness.score <= 0.7, // Slightly soft OK for backgrounds
      print: technical.resolution.score >= 1.0 && score >= 70,
      web: technical.resolution.score >= 0.6 && score >= 65,
      socialMedia: score >= 70 && aesthetic.emotionalImpact?.score >= 7
    };
  }

  /**
   * Generate selection summary
   */
  generateSelectionSummary(all, selected) {
    return {
      totalEvaluated: all.length,
      selected: selected.length,
      averageScore: (all.reduce((sum, img) => sum + img.overallScore, 0) / all.length).toFixed(1),
      selectedAverageScore: (selected.reduce((sum, img) => sum + img.overallScore, 0) / selected.length).toFixed(1),
      scoreDistribution: {
        excellent: all.filter(img => img.overallScore >= 85).length,
        good: all.filter(img => img.overallScore >= 75 && img.overallScore < 85).length,
        acceptable: all.filter(img => img.overallScore >= 65 && img.overallScore < 75).length,
        marginal: all.filter(img => img.overallScore >= 50 && img.overallScore < 65).length,
        poor: all.filter(img => img.overallScore < 50).length
      }
    };
  }

  /**
   * Get MIME type
   */
  getMimeType(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * Export selection report
   */
  async exportReport(results, outputPath) {
    const report = {
      generated: new Date().toISOString(),
      summary: results.summary,
      selected: results.selected.map(img => ({
        filename: img.filename,
        score: img.overallScore,
        recommendation: img.recommendation?.verdict,
        suitableFor: Object.entries(img.suitableFor || {})
          .filter(([_, suitable]) => suitable)
          .map(([use, _]) => use)
      })),
      allImages: results.all.map(img => ({
        filename: img.filename,
        score: img.overallScore,
        technical: {
          resolution: img.technical?.resolution?.assessment,
          sharpness: img.technical?.sharpness?.assessment,
          exposure: img.technical?.exposure?.assessment
        },
        aesthetic: {
          brandAlignment: img.aesthetic?.brandAlignment?.score,
          emotionalImpact: img.aesthetic?.emotionalImpact?.score,
          professionalism: img.aesthetic?.professionalism?.score
        }
      }))
    };

    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved: ${outputPath}`);
    return outputPath;
  }
}

module.exports = PhotoSelector;
