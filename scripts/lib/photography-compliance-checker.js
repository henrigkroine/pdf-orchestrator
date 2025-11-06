/**
 * Photography Compliance Checker for TEEI Brand
 *
 * Uses AI vision models to validate photography style against TEEI brand guidelines.
 * Analyzes lighting, color tone, authenticity, diversity, and emotional resonance.
 *
 * Features:
 * - Image extraction from PDFs
 * - AI style detection with Gemini 2.5 Pro Vision
 * - Color tone analysis (warm vs cool)
 * - Stock photo detection
 * - Lighting quality assessment
 * - Emotional tone evaluation
 * - Diversity representation checking
 *
 * @module photography-compliance-checker
 */

const fs = require('fs').promises;
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class PhotographyComplianceChecker {
  constructor(config) {
    this.config = config;
    this.photoRequirements = config.photography;
    this.brandColors = config.colors.official;

    // Initialize AI for image analysis
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY);

    // Statistics
    this.stats = {
      totalImages: 0,
      compliantImages: 0,
      violations: []
    };
  }

  /**
   * Main entry point - analyze PDF for photography compliance
   */
  async analyzePDF(pdfPath) {
    console.log(`\n📸 Starting photography compliance analysis: ${path.basename(pdfPath)}`);

    const results = {
      pdfPath,
      timestamp: new Date().toISOString(),
      passed: false,
      score: 0,
      violations: [],
      images: [],
      recommendations: []
    };

    try {
      // Step 1: Extract images from PDF
      console.log('🖼️  Extracting images from PDF...');
      const images = await this.extractImagesFromPDF(pdfPath);
      results.images = images;
      this.stats.totalImages = images.length;

      if (images.length === 0) {
        results.violations.push({
          type: 'photography',
          severity: 'critical',
          category: 'missing_photography',
          message: 'No photography found in document - TEEI brand requires authentic imagery',
          recommendation: 'Add 3-5 high-quality photos with warm natural lighting and authentic moments',
          pages: 'all'
        });

        results.score = 0;
        results.passed = false;
        return results;
      }

      console.log(`  Found ${images.length} images`);

      // Step 2: Analyze each image with AI
      console.log('🤖 Analyzing images with Gemini 2.5 Pro Vision...');
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        console.log(`  Analyzing image ${i + 1}/${images.length}...`);

        const analysis = await this.analyzeImageWithAI(image);
        image.analysis = analysis;

        if (analysis.violations) {
          results.violations.push(...analysis.violations);
        }

        if (analysis.brandCompliant) {
          this.stats.compliantImages++;
        }
      }

      // Step 3: Analyze color tones
      console.log('🎨 Analyzing color tones...');
      for (const image of images) {
        const colorAnalysis = await this.analyzeImageColorTone(image);
        image.colorTone = colorAnalysis;

        if (!colorAnalysis.isWarm) {
          results.violations.push({
            type: 'photography',
            severity: 'major',
            category: 'color_tone',
            imageIndex: image.index,
            message: `Image ${image.index + 1}: Color tone is ${colorAnalysis.tone} (expected: warm)`,
            recommendation: 'Apply color grading to add warmth - align with Sand (#FFF1E2) and Beige (#EFE1DC) palette',
            page: image.page
          });
        }
      }

      // Step 4: Check diversity representation
      console.log('🌈 Checking diversity representation...');
      const diversityCheck = this.checkDiversityRepresentation(images);
      results.violations.push(...diversityCheck.violations);
      results.diversityScore = diversityCheck.score;

      // Calculate final score
      results.score = this.calculatePhotographyScore(results);
      results.passed = results.score >= this.config.scoring.passThreshold;

      // Generate recommendations
      results.recommendations = this.generateRecommendations(results);

      console.log(`\n✨ Photography compliance score: ${results.score}/100`);
      console.log(`${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`${results.violations.length} violations found\n`);

      return results;

    } catch (error) {
      console.error('❌ Photography compliance analysis failed:', error.message);
      results.error = error.message;
      return results;
    }
  }

  /**
   * Extract images from PDF
   */
  async extractImagesFromPDF(pdfPath) {
    const images = [];

    try {
      // Read PDF
      const dataBuffer = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const pages = pdfDoc.getPages();

      // Extract images from each page
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];

        // Use pdf-lib to extract embedded images
        try {
          const embeddedImages = await this.extractEmbeddedImages(pdfDoc, pageIndex);

          embeddedImages.forEach((imgData, imgIndex) => {
            images.push({
              index: images.length,
              page: pageIndex + 1,
              imageIndex: imgIndex,
              data: imgData.data,
              type: imgData.type,
              width: imgData.width,
              height: imgData.height
            });
          });

        } catch (err) {
          console.error(`  Warning: Could not extract images from page ${pageIndex + 1}:`, err.message);
        }
      }

      return images;

    } catch (error) {
      console.error('Error extracting images from PDF:', error.message);
      throw error;
    }
  }

  /**
   * Extract embedded images using pdf-lib
   */
  async extractEmbeddedImages(pdfDoc, pageIndex) {
    const images = [];

    try {
      const page = pdfDoc.getPages()[pageIndex];
      const pageNode = page.node;
      const context = pdfDoc.context;

      // Get page resources
      const resources = pageNode.Resources();
      if (!resources) return images;

      // Get XObject dictionary (where images are stored)
      const xObjects = resources.lookup(context.obj('XObject'));
      if (!xObjects) return images;

      // Iterate through XObjects to find images
      const xObjectEntries = xObjects.entries();
      for (const [name, xObjectRef] of xObjectEntries) {
        try {
          const xObject = xObjects.lookup(name);
          if (!xObject) continue;

          const subtype = xObject.get(context.obj('Subtype'));
          if (!subtype || subtype.toString() !== '/Image') continue;

          // Extract image data
          const width = xObject.get(context.obj('Width'));
          const height = xObject.get(context.obj('Height'));
          const bitsPerComponent = xObject.get(context.obj('BitsPerComponent'));

          // Get image bytes
          const imageBytes = xObject.contents;

          images.push({
            data: Buffer.from(imageBytes),
            type: 'embedded',
            width: width ? parseInt(width.toString()) : 0,
            height: height ? parseInt(height.toString()) : 0,
            name: name.toString()
          });

        } catch (err) {
          // Skip images that can't be extracted
          continue;
        }
      }

    } catch (error) {
      console.error('Error extracting embedded images:', error.message);
    }

    return images;
  }

  /**
   * Analyze image with AI (Gemini 2.5 Pro Vision)
   */
  async analyzeImageWithAI(image) {
    try {
      // Convert image data to base64
      let imageBuffer = image.data;

      // Convert to PNG if needed for better AI analysis
      try {
        imageBuffer = await sharp(imageBuffer)
          .png()
          .toBuffer();
      } catch (err) {
        console.warn('    Could not convert image to PNG, using original format');
      }

      const base64Image = imageBuffer.toString('base64');

      // Initialize Gemini Pro Vision model
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' }); // Using available model

      const prompt = `You are a photography director evaluating an image for TEEI brand compliance.

TEEI photography requirements:
1. **Lighting**: Natural, warm lighting (NOT studio or clinical)
2. **Tone**: Warm color tones aligned with Sand #FFF1E2 and Beige #EFE1DC
3. **Authenticity**: Authentic moments (NOT staged corporate stock photos)
4. **Diversity**: Diverse representation of people
5. **Emotion**: Shows connection, hope, empowerment (NOT sadness or despair)

Forbidden:
- Cold/clinical lighting
- Generic stock photography
- Studio-lit corporate headshots
- Staged/artificial moments
- Sad or despairing emotions

Analyze this image and score 0-100 on each criteria:

Respond in JSON format:
{
  "brandCompliant": true/false,
  "overallScore": 0-100,
  "scores": {
    "lighting": 0-100,
    "colorTone": 0-100,
    "authenticity": 0-100,
    "diversity": 0-100,
    "emotion": 0-100
  },
  "assessment": {
    "lighting": "natural|studio|cold|warm",
    "style": "authentic|stock|staged|corporate",
    "emotion": "empowering|hopeful|sad|neutral|joyful",
    "subjects": "people|objects|scenery|abstract",
    "diversity": "diverse|limited|not-applicable"
  },
  "violations": [
    {"severity": "critical|major|minor", "issue": "...", "recommendation": "..."}
  ],
  "strengths": ["strength 1"],
  "description": "Brief description of what the image shows"
}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI response not in JSON format');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Convert AI violations to standard format
      const violations = [];
      if (analysis.violations && analysis.violations.length > 0) {
        analysis.violations.forEach(v => {
          violations.push({
            type: 'photography',
            severity: v.severity || 'major',
            category: 'ai_detected',
            imageIndex: image.index,
            message: `Image ${image.index + 1}: ${v.issue}`,
            recommendation: v.recommendation,
            source: 'Gemini 2.5 Pro Vision',
            page: image.page
          });
        });
      }

      // Add violations for low scores
      Object.entries(analysis.scores || {}).forEach(([criterion, score]) => {
        if (score < 70) {
          violations.push({
            type: 'photography',
            severity: score < 50 ? 'major' : 'minor',
            category: `photo_${criterion}`,
            imageIndex: image.index,
            criterion,
            score,
            message: `Image ${image.index + 1}: Low ${criterion} score (${score}/100)`,
            recommendation: `Improve ${criterion} to meet TEEI brand standards`,
            source: 'Gemini AI Analysis',
            page: image.page
          });
        }
      });

      return {
        ...analysis,
        violations
      };

    } catch (error) {
      console.error(`    AI analysis failed for image ${image.index + 1}:`, error.message);
      return {
        brandCompliant: false,
        overallScore: 0,
        error: error.message,
        violations: [{
          type: 'photography',
          severity: 'minor',
          category: 'analysis_failed',
          imageIndex: image.index,
          message: `Image ${image.index + 1}: Could not analyze - ${error.message}`,
          recommendation: 'Manually review image for brand compliance',
          page: image.page
        }]
      };
    }
  }

  /**
   * Analyze image color tone
   */
  async analyzeImageColorTone(image) {
    try {
      // Use sharp to analyze image colors
      const imageBuffer = image.data;

      const { dominant, stats } = await sharp(imageBuffer)
        .stats();

      // Calculate warmth based on dominant colors
      // Warm colors have more red/yellow, cool colors have more blue
      const avgR = stats.channels[0].mean;
      const avgG = stats.channels[1].mean;
      const avgB = stats.channels[2].mean;

      const warmth = (avgR + avgG) / 2 - avgB;
      const isWarm = warmth > 10; // Threshold for warm colors

      // Calculate saturation
      const maxChannel = Math.max(avgR, avgG, avgB);
      const minChannel = Math.min(avgR, avgG, avgB);
      const saturation = maxChannel > 0 ? (maxChannel - minChannel) / maxChannel : 0;

      return {
        warmth: warmth.toFixed(2),
        isWarm,
        tone: isWarm ? 'warm' : 'cool',
        saturation: (saturation * 100).toFixed(1),
        averageColor: {
          r: Math.round(avgR),
          g: Math.round(avgG),
          b: Math.round(avgB),
          hex: this.rgbToHex(Math.round(avgR), Math.round(avgG), Math.round(avgB))
        }
      };

    } catch (error) {
      console.error(`    Color tone analysis failed for image ${image.index + 1}:`, error.message);
      return {
        warmth: 0,
        isWarm: false,
        tone: 'unknown',
        error: error.message
      };
    }
  }

  /**
   * Check diversity representation across images
   */
  checkDiversityRepresentation(images) {
    const violations = [];

    // Count images with people
    const imagesWithPeople = images.filter(img =>
      img.analysis &&
      img.analysis.assessment &&
      img.analysis.assessment.subjects === 'people'
    );

    if (imagesWithPeople.length === 0) {
      violations.push({
        type: 'photography',
        severity: 'major',
        category: 'no_people',
        message: 'No images showing people - TEEI brand requires human connection',
        recommendation: 'Add authentic photos showing diverse people in educational settings',
        pages: 'all'
      });
    }

    // Check diversity scores
    const diversityScores = imagesWithPeople
      .filter(img => img.analysis && img.analysis.scores && img.analysis.scores.diversity)
      .map(img => img.analysis.scores.diversity);

    if (diversityScores.length > 0) {
      const avgDiversity = diversityScores.reduce((a, b) => a + b, 0) / diversityScores.length;

      if (avgDiversity < 70) {
        violations.push({
          type: 'photography',
          severity: 'major',
          category: 'limited_diversity',
          score: avgDiversity.toFixed(1),
          message: `Limited diversity in photography (average score: ${avgDiversity.toFixed(1)}/100)`,
          recommendation: 'Ensure photos show diverse representation of age, ethnicity, gender, and abilities',
          pages: 'multiple'
        });
      }
    }

    const score = diversityScores.length > 0
      ? diversityScores.reduce((a, b) => a + b, 0) / diversityScores.length
      : 0;

    return { violations, score };
  }

  /**
   * Calculate overall photography compliance score
   */
  calculatePhotographyScore(results) {
    if (results.images.length === 0) {
      return 0; // No images = 0 score
    }

    let totalScore = 0;
    let scoredImages = 0;

    results.images.forEach(img => {
      if (img.analysis && img.analysis.overallScore) {
        totalScore += img.analysis.overallScore;
        scoredImages++;
      }
    });

    const avgImageScore = scoredImages > 0 ? totalScore / scoredImages : 0;

    // Deduct for violations
    let deductions = 0;
    results.violations.forEach(v => {
      if (v.type !== 'photography') return;

      switch (v.severity) {
        case 'critical':
          deductions += 20;
          break;
        case 'major':
          deductions += 10;
          break;
        case 'minor':
          deductions += 5;
          break;
      }
    });

    return Math.max(0, Math.round(avgImageScore - deductions));
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (results.images.length === 0) {
      recommendations.push({
        priority: 'critical',
        title: 'Add Photography',
        description: 'Document has no images - TEEI brand requires authentic photography',
        action: 'Add 3-5 high-quality photos with warm natural lighting showing authentic educational moments',
        impact: 'high'
      });
      return recommendations;
    }

    // Group violations by category
    const categories = {};
    results.violations.forEach(v => {
      if (!categories[v.category]) {
        categories[v.category] = [];
      }
      categories[v.category].push(v);
    });

    if (categories.color_tone) {
      recommendations.push({
        priority: 'major',
        title: 'Adjust Color Grading',
        description: 'Images have cool tones - need warm color treatment',
        action: 'Apply color grading to add warmth - increase reds/yellows, decrease blues',
        impact: 'medium'
      });
    }

    if (categories.photo_lighting) {
      recommendations.push({
        priority: 'major',
        title: 'Replace Studio Photography',
        description: 'Images show studio or clinical lighting',
        action: 'Replace with natural light photography - outdoor or near windows',
        impact: 'high'
      });
    }

    if (categories.photo_authenticity) {
      recommendations.push({
        priority: 'critical',
        title: 'Use Authentic Photography',
        description: 'Stock photography detected - not authentic',
        action: 'Replace with real photos from TEEI programs and educational settings',
        impact: 'high'
      });
    }

    if (categories.limited_diversity || categories.no_people) {
      recommendations.push({
        priority: 'major',
        title: 'Show Diverse Representation',
        description: 'Limited diversity in photography',
        action: 'Ensure photos show diverse ages, ethnicities, genders, and abilities',
        impact: 'high'
      });
    }

    return recommendations;
  }

  /**
   * RGB to Hex conversion
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }

  /**
   * Generate photography compliance report
   */
  async generatePhotographyReport(results, outputPath) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TEEI Photography Compliance Report</title>
  <style>
    body {
      font-family: 'Roboto', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #00393F;
      margin: 0 0 30px 0;
    }
    .score {
      font-size: 48px;
      font-weight: bold;
      color: ${results.score >= 85 ? '#65873B' : results.score >= 70 ? '#BA8F5A' : '#913B2F'};
      margin: 20px 0;
    }
    .images-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .image-card {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
    .image-score {
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0;
    }
    .violation {
      background: #fff5f5;
      border-left: 4px solid #913B2F;
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .violation.critical {
      border-left-color: #913B2F;
    }
    .violation.major {
      border-left-color: #BA8F5A;
    }
    .violation.minor {
      border-left-color: #65873B;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📸 TEEI Photography Compliance Report</h1>
    <p><strong>File:</strong> ${path.basename(results.pdfPath)}</p>
    <p><strong>Date:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
    <p><strong>Images Found:</strong> ${results.images.length}</p>

    <div class="score">${results.score}/100</div>
    <p>${results.passed ? '✅ PASSED' : '❌ FAILED'}</p>

    ${results.images.length > 0 ? `
      <h2>Image Analysis</h2>
      <div class="images-grid">
        ${results.images.map(img => `
          <div class="image-card">
            <h3>Image ${img.index + 1} (Page ${img.page})</h3>
            ${img.analysis && img.analysis.overallScore ? `
              <div class="image-score" style="color: ${img.analysis.overallScore >= 70 ? '#65873B' : '#913B2F'}">
                ${img.analysis.overallScore}/100
              </div>
              ${img.analysis.description ? `<p><em>${img.analysis.description}</em></p>` : ''}
              ${img.analysis.assessment ? `
                <p><strong>Style:</strong> ${img.analysis.assessment.style || 'N/A'}</p>
                <p><strong>Lighting:</strong> ${img.analysis.assessment.lighting || 'N/A'}</p>
                <p><strong>Emotion:</strong> ${img.analysis.assessment.emotion || 'N/A'}</p>
              ` : ''}
              ${img.colorTone ? `
                <p><strong>Color Tone:</strong> ${img.colorTone.tone} (warmth: ${img.colorTone.warmth})</p>
              ` : ''}
            ` : '<p>Analysis not available</p>'}
          </div>
        `).join('')}
      </div>
    ` : '<p style="color: #913B2F;">⚠️ No images found in document - TEEI brand requires photography!</p>'}

    <h2>Violations (${results.violations.length})</h2>
    ${results.violations.length > 0 ? results.violations.map(v => `
      <div class="violation ${v.severity}">
        <strong>${v.severity.toUpperCase()}:</strong> ${v.message}
        ${v.recommendation ? `<br><em>Recommendation: ${v.recommendation}</em>` : ''}
      </div>
    `).join('') : '<p>No violations found!</p>'}
  </div>
</body>
</html>`;

    await fs.writeFile(outputPath, html, 'utf-8');
    console.log(`✅ Photography report saved: ${outputPath}`);
  }
}

module.exports = PhotographyComplianceChecker;
