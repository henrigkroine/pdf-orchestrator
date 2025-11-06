/**
 * PHOTO COMPOSITION ANALYZER
 * Advanced composition analysis using visual design principles
 *
 * Features:
 * - Rule of thirds analysis
 * - Golden ratio composition
 * - Leading lines detection
 * - Visual balance scoring
 * - Composition improvement suggestions
 */

const sharp = require('sharp');
const OpenAI = require('openai');

class PhotoComposition {
  constructor(config = {}) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || config.openaiKey
    });

    // Composition rules
    this.rules = {
      ruleOfThirds: {
        name: 'Rule of Thirds',
        description: 'Key elements aligned on 1/3 lines',
        weight: 0.30
      },
      goldenRatio: {
        name: 'Golden Ratio',
        description: 'Elements follow 1.618 proportions',
        weight: 0.25
      },
      visualBalance: {
        name: 'Visual Balance',
        description: 'Balanced weight distribution',
        weight: 0.20
      },
      leadingLines: {
        name: 'Leading Lines',
        description: 'Lines guide viewer attention',
        weight: 0.15
      },
      symmetry: {
        name: 'Symmetry/Asymmetry',
        description: 'Intentional balance or asymmetry',
        weight: 0.10
      }
    };
  }

  /**
   * Analyze composition comprehensively
   */
  async analyzeComposition(imagePath) {
    console.log('📐 Analyzing composition...');

    // Get image metadata
    const metadata = await sharp(imagePath).metadata();

    // Calculate compositional elements
    const ruleOfThirds = this.calculateRuleOfThirds(metadata);
    const goldenRatio = this.calculateGoldenRatio(metadata);
    const visualBalance = await this.analyzeVisualBalance(imagePath, metadata);

    // Get AI analysis for subjective elements
    const aiAnalysis = await this.getAICompositionAnalysis(imagePath);

    // Calculate overall composition score
    const score = this.calculateCompositionScore({
      ruleOfThirds,
      goldenRatio,
      visualBalance,
      leadingLines: aiAnalysis.leadingLines,
      symmetry: aiAnalysis.symmetry
    });

    // Generate improvement suggestions
    const suggestions = await this.generateImprovementSuggestions(
      { ruleOfThirds, goldenRatio, visualBalance },
      aiAnalysis,
      score
    );

    return {
      score,
      ruleOfThirds,
      goldenRatio,
      visualBalance,
      leadingLines: aiAnalysis.leadingLines,
      symmetry: aiAnalysis.symmetry,
      suggestions,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        aspectRatio: (metadata.width / metadata.height).toFixed(2)
      }
    };
  }

  /**
   * Calculate rule of thirds grid points
   */
  calculateRuleOfThirds(metadata) {
    const { width, height } = metadata;

    // Calculate intersection points (power points)
    const thirds = {
      vertical: [width / 3, (2 * width) / 3],
      horizontal: [height / 3, (2 * height) / 3],
      powerPoints: [
        { x: width / 3, y: height / 3 },         // Top-left
        { x: (2 * width) / 3, y: height / 3 },   // Top-right
        { x: width / 3, y: (2 * height) / 3 },   // Bottom-left
        { x: (2 * width) / 3, y: (2 * height) / 3 } // Bottom-right
      ]
    };

    return {
      grid: thirds,
      description: 'Divide image into 9 equal parts. Place key elements at intersections.',
      powerPoints: thirds.powerPoints
    };
  }

  /**
   * Calculate golden ratio (phi = 1.618) points
   */
  calculateGoldenRatio(metadata) {
    const { width, height } = metadata;
    const phi = 1.618;

    // Golden spiral focal point
    const goldenPoint = {
      x: width / phi,
      y: height / phi
    };

    // Golden ratio divisions
    const divisions = {
      vertical: [width / phi, width - (width / phi)],
      horizontal: [height / phi, height - (height / phi)]
    };

    return {
      focalPoint: goldenPoint,
      divisions,
      description: 'Golden ratio (1.618) creates naturally pleasing proportions.',
      phi: phi
    };
  }

  /**
   * Analyze visual balance
   */
  async analyzeVisualBalance(imagePath, metadata) {
    try {
      // Get image statistics
      const stats = await sharp(imagePath).stats();

      // Analyze brightness distribution across quadrants
      const quadrants = await this.analyzeQuadrants(imagePath, metadata);

      // Calculate balance scores
      const horizontalBalance = 1 - Math.abs(
        (quadrants.left.avgBrightness - quadrants.right.avgBrightness) / 255
      );

      const verticalBalance = 1 - Math.abs(
        (quadrants.top.avgBrightness - quadrants.bottom.avgBrightness) / 255
      );

      const overallBalance = (horizontalBalance + verticalBalance) / 2;

      return {
        score: overallBalance,
        horizontalBalance,
        verticalBalance,
        quadrants,
        assessment: overallBalance >= 0.8 ? 'well-balanced' :
                   overallBalance >= 0.6 ? 'moderately balanced' :
                   'unbalanced'
      };

    } catch (error) {
      return {
        score: 0.7,
        assessment: 'unable to analyze',
        error: error.message
      };
    }
  }

  /**
   * Analyze image quadrants
   */
  async analyzeQuadrants(imagePath, metadata) {
    const { width, height } = metadata;
    const halfWidth = Math.floor(width / 2);
    const halfHeight = Math.floor(height / 2);

    const analyzeRegion = async (left, top, w, h) => {
      const region = await sharp(imagePath)
        .extract({ left, top, width: w, height: h })
        .stats();

      const avgBrightness = region.channels.reduce((sum, ch) => sum + ch.mean, 0) / region.channels.length;

      return { avgBrightness };
    };

    return {
      topLeft: await analyzeRegion(0, 0, halfWidth, halfHeight),
      topRight: await analyzeRegion(halfWidth, 0, halfWidth, halfHeight),
      bottomLeft: await analyzeRegion(0, halfHeight, halfWidth, halfHeight),
      bottomRight: await analyzeRegion(halfWidth, halfHeight, halfWidth, halfHeight),
      left: await analyzeRegion(0, 0, halfWidth, height),
      right: await analyzeRegion(halfWidth, 0, halfWidth, height),
      top: await analyzeRegion(0, 0, width, halfHeight),
      bottom: await analyzeRegion(0, halfHeight, width, halfHeight)
    };
  }

  /**
   * Get AI composition analysis
   */
  async getAICompositionAnalysis(imagePath) {
    try {
      const fs = require('fs').promises;
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const prompt = `Analyze this photograph's composition:

Evaluate:
1. Leading lines - Are there lines guiding viewer attention?
2. Symmetry - Is it symmetrical, asymmetrical, or balanced?
3. Focal point - Where does the eye naturally go?
4. Depth - Is there foreground/background separation?
5. Framing - Are elements well-framed?
6. Negative space - Is empty space used effectively?

Return JSON:
{
  "leadingLines": {
    "present": true/false,
    "score": 0-10,
    "description": "..."
  },
  "symmetry": {
    "type": "symmetrical|asymmetrical|balanced",
    "score": 0-10,
    "description": "..."
  },
  "focalPoint": {
    "clear": true/false,
    "location": "center|rule-of-thirds|golden-ratio|off-center",
    "description": "..."
  },
  "depth": {
    "score": 0-10,
    "description": "..."
  },
  "negativeSpace": {
    "score": 0-10,
    "description": "..."
  },
  "overallComposition": "Brief assessment"
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
                  url: `data:image/jpeg;base64,${base64Image}`,
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
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('  ⚠️ AI composition analysis failed:', error.message);
      return {
        leadingLines: { present: false, score: 5, description: 'Unable to analyze' },
        symmetry: { type: 'balanced', score: 5, description: 'Unable to analyze' },
        focalPoint: { clear: true, location: 'center', description: 'Unable to analyze' },
        depth: { score: 5, description: 'Unable to analyze' },
        negativeSpace: { score: 5, description: 'Unable to analyze' },
        overallComposition: 'Analysis unavailable'
      };
    }
  }

  /**
   * Calculate overall composition score
   */
  calculateCompositionScore(analysis) {
    const scores = {
      ruleOfThirds: 7, // Baseline score (would need subject detection)
      goldenRatio: 7,   // Baseline score
      visualBalance: analysis.visualBalance.score * 10,
      leadingLines: analysis.leadingLines?.score || 5,
      symmetry: analysis.symmetry?.score || 5
    };

    // Weighted average
    const weighted = Object.entries(this.rules).reduce((sum, [key, rule]) => {
      const score = scores[key] || 5;
      return sum + (score * rule.weight);
    }, 0);

    return Math.round(weighted * 10) / 10; // Round to 1 decimal
  }

  /**
   * Generate improvement suggestions
   */
  async generateImprovementSuggestions(geometric, aiAnalysis, score) {
    const suggestions = [];

    // Visual balance suggestions
    if (geometric.visualBalance.score < 0.7) {
      suggestions.push({
        priority: 'high',
        area: 'Visual Balance',
        issue: `Image is ${geometric.visualBalance.assessment}`,
        suggestion: 'Consider cropping to balance light/dark areas, or adjust exposure regionally',
        technique: 'Use gradient adjustments or vignetting to balance composition'
      });
    }

    // Leading lines
    if (!aiAnalysis.leadingLines?.present && score < 7) {
      suggestions.push({
        priority: 'medium',
        area: 'Leading Lines',
        issue: 'No strong leading lines detected',
        suggestion: 'Look for natural lines (roads, fences, architecture) to guide viewer attention',
        technique: 'Position camera to emphasize diagonal or converging lines'
      });
    }

    // Focal point
    if (aiAnalysis.focalPoint && !aiAnalysis.focalPoint.clear) {
      suggestions.push({
        priority: 'high',
        area: 'Focal Point',
        issue: 'Unclear focal point',
        suggestion: 'Use selective focus, lighting, or cropping to emphasize main subject',
        technique: 'Apply rule of thirds - place subject at power points'
      });
    }

    // Symmetry
    if (aiAnalysis.symmetry?.type === 'asymmetrical' && score < 7) {
      suggestions.push({
        priority: 'low',
        area: 'Balance',
        issue: 'Asymmetrical composition',
        suggestion: 'Either embrace asymmetry intentionally or balance with counterweights',
        technique: 'Add visual interest on the lighter side, or crop to center subject'
      });
    }

    // Negative space
    if (aiAnalysis.negativeSpace?.score < 6) {
      suggestions.push({
        priority: 'medium',
        area: 'Negative Space',
        issue: 'Poor use of empty space',
        suggestion: 'Allow breathing room around subject, avoid clutter',
        technique: 'Crop to simplify composition or use wider angle'
      });
    }

    // General improvement if score is low
    if (score < 6) {
      suggestions.push({
        priority: 'high',
        area: 'Overall Composition',
        issue: 'Below-average composition',
        suggestion: 'Consider complete recomposition or crop to stronger focal point',
        technique: 'Apply rule of thirds grid overlay and reframe'
      });
    }

    return suggestions.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.priority] - priority[a.priority];
    });
  }

  /**
   * Suggest crop for better composition
   */
  async suggestCrop(imagePath, composition) {
    const metadata = await sharp(imagePath).metadata();

    // Default: no crop needed if composition is good
    if (composition.score >= 7.5) {
      return {
        recommended: false,
        reason: 'Composition is already good',
        crop: null
      };
    }

    // Suggest rule of thirds crop
    const width = metadata.width;
    const height = metadata.height;

    // Find which power point to center on (would need subject detection)
    // For now, suggest general centered crop
    const cropWidth = Math.round(width * 0.9);
    const cropHeight = Math.round(height * 0.9);

    return {
      recommended: true,
      reason: 'Crop to improve composition and focus',
      crop: {
        left: Math.round((width - cropWidth) / 2),
        top: Math.round((height - cropHeight) / 2),
        width: cropWidth,
        height: cropHeight
      },
      technique: 'Centered crop to remove distracting edges'
    };
  }

  /**
   * Visualize composition grid
   */
  async visualizeGrid(imagePath, outputPath, gridType = 'rule-of-thirds') {
    const metadata = await sharp(imagePath).metadata();
    const { width, height } = metadata;

    // Create grid overlay SVG
    let gridSvg = `<svg width="${width}" height="${height}">`;

    if (gridType === 'rule-of-thirds') {
      const thirds = this.calculateRuleOfThirds(metadata);

      // Vertical lines
      thirds.grid.vertical.forEach(x => {
        gridSvg += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-dasharray="10,5"/>`;
      });

      // Horizontal lines
      thirds.grid.horizontal.forEach(y => {
        gridSvg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-dasharray="10,5"/>`;
      });

      // Power points
      thirds.powerPoints.forEach(point => {
        gridSvg += `<circle cx="${point.x}" cy="${point.y}" r="10" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="3"/>`;
      });

    } else if (gridType === 'golden-ratio') {
      const golden = this.calculateGoldenRatio(metadata);

      // Golden ratio lines
      golden.divisions.vertical.forEach(x => {
        gridSvg += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(255,215,0,0.7)" stroke-width="2" stroke-dasharray="10,5"/>`;
      });

      golden.divisions.horizontal.forEach(y => {
        gridSvg += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(255,215,0,0.7)" stroke-width="2" stroke-dasharray="10,5"/>`;
      });

      // Focal point
      gridSvg += `<circle cx="${golden.focalPoint.x}" cy="${golden.focalPoint.y}" r="15" fill="none" stroke="rgba(255,215,0,0.9)" stroke-width="3"/>`;
    }

    gridSvg += `</svg>`;

    // Composite grid over image
    const gridBuffer = Buffer.from(gridSvg);

    await sharp(imagePath)
      .composite([{
        input: gridBuffer,
        blend: 'over'
      }])
      .toFile(outputPath);

    console.log(`✅ Grid visualization saved: ${outputPath}`);
    return outputPath;
  }
}

module.exports = PhotoComposition;
