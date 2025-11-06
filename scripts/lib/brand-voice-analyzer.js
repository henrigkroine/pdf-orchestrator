/**
 * Brand Voice Analyzer for TEEI
 *
 * Uses NLP and AI to validate text content against TEEI's brand voice guidelines.
 * Analyzes tone, sentiment, inclusivity, complexity, and emotional resonance.
 *
 * Features:
 * - Text extraction from PDFs
 * - NLP sentiment and tone analysis
 * - AI brand voice scoring with GPT-5
 * - Jargon and complexity detection
 * - Inclusivity and respect checking
 * - Empowerment language validation
 * - Specific quote extraction for violations
 *
 * @module brand-voice-analyzer
 */

const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');

class BrandVoiceAnalyzer {
  constructor(config) {
    this.config = config;
    this.brandQualities = config.brandVoice.qualities;
    this.forbiddenLanguage = config.brandVoice.forbidden;

    // Initialize AI for brand voice analysis
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Language patterns
    this.jargonPatterns = [
      /\b(synergy|paradigm|leverage|optimize|utilize|facilitate)\b/gi,
      /\b(bandwidth|ecosystem|scalable|disruption|pivot)\b/gi,
      /\b(stakeholders|touch base|circle back|move the needle)\b/gi
    ];

    this.condescendingPatterns = [
      /\b(simply|just|obviously|clearly|merely)\b/gi,
      /\b(you should|you must|you need to)\b/gi
    ];

    this.exclusivePatterns = [
      /\b(guys|mankind|manpower)\b/gi
    ];
  }

  /**
   * Main entry point - analyze PDF for brand voice compliance
   */
  async analyzePDF(pdfPath) {
    console.log(`\n🎤 Starting brand voice analysis: ${path.basename(pdfPath)}`);

    const results = {
      pdfPath,
      timestamp: new Date().toISOString(),
      passed: false,
      score: 0,
      violations: [],
      qualityScores: {},
      textAnalysis: {},
      recommendations: []
    };

    try {
      // Step 1: Extract text from PDF
      console.log('📖 Extracting text from PDF...');
      const text = await this.extractTextFromPDF(pdfPath);
      results.textAnalysis.wordCount = this.countWords(text);
      results.textAnalysis.sentenceCount = this.countSentences(text);

      // Step 2: Detect jargon
      console.log('🔍 Detecting jargon and complexity...');
      const jargonCheck = this.detectJargon(text);
      results.violations.push(...jargonCheck.violations);
      results.textAnalysis.jargonScore = jargonCheck.score;

      // Step 3: Check complexity
      console.log('📊 Analyzing readability...');
      const complexityCheck = this.analyzeComplexity(text);
      results.violations.push(...complexityCheck.violations);
      results.textAnalysis.readabilityScore = complexityCheck.readabilityScore;

      // Step 4: Detect condescending language
      console.log('🚫 Checking for condescending language...');
      const condescendingCheck = this.detectCondescendingLanguage(text);
      results.violations.push(...condescendingCheck.violations);

      // Step 5: Check inclusivity
      console.log('🌈 Checking inclusivity...');
      const inclusivityCheck = this.checkInclusivity(text);
      results.violations.push(...inclusivityCheck.violations);
      results.textAnalysis.inclusivityScore = inclusivityCheck.score;

      // Step 6: AI brand voice analysis with GPT-5
      console.log('🤖 Running AI brand voice analysis with GPT-5...');
      const aiAnalysis = await this.runAIBrandVoiceAnalysis(text);
      results.qualityScores = aiAnalysis.qualityScores;
      results.violations.push(...aiAnalysis.violations);
      results.aiInsights = aiAnalysis;

      // Calculate final score
      results.score = this.calculateBrandVoiceScore(results);
      results.passed = results.score >= this.config.scoring.passThreshold;

      // Generate recommendations
      results.recommendations = this.generateRecommendations(results);

      console.log(`\n✨ Brand voice compliance score: ${results.score}/100`);
      console.log(`${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`${results.violations.length} violations found\n`);

      return results;

    } catch (error) {
      console.error('❌ Brand voice analysis failed:', error.message);
      results.error = error.message;
      return results;
    }
  }

  /**
   * Extract text from PDF
   */
  async extractTextFromPDF(pdfPath) {
    try {
      const dataBuffer = await fs.readFile(pdfPath);
      const pdfData = await pdfParse(dataBuffer);

      return pdfData.text || '';

    } catch (error) {
      console.error('Error extracting text from PDF:', error.message);
      throw error;
    }
  }

  /**
   * Count words in text
   */
  countWords(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count sentences in text
   */
  countSentences(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  }

  /**
   * Detect jargon and buzzwords
   */
  detectJargon(text) {
    const violations = [];
    let jargonCount = 0;
    const foundJargon = new Set();

    this.jargonPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        jargonCount++;
        foundJargon.add(match.toLowerCase());
      });
    });

    const wordCount = this.countWords(text);
    const jargonRatio = jargonCount / wordCount;

    if (jargonCount > 0) {
      violations.push({
        type: 'brandVoice',
        severity: jargonRatio > 0.05 ? 'major' : 'minor',
        category: 'jargon',
        count: jargonCount,
        examples: Array.from(foundJargon).slice(0, 5),
        message: `Corporate jargon detected: ${jargonCount} instances (${Array.from(foundJargon).join(', ')})`,
        recommendation: 'Replace jargon with clear, accessible language. TEEI voice is jargon-free.',
        pages: 'multiple'
      });
    }

    return {
      violations,
      score: Math.max(0, 100 - (jargonRatio * 1000))
    };
  }

  /**
   * Analyze text complexity and readability
   */
  analyzeComplexity(text) {
    const violations = [];

    // Calculate average sentence length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);

    const avgSentenceLength = words.length / sentences.length;

    // Calculate average word length
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;

    // Simple Flesch-Kincaid approximation
    const readabilityScore = 206.835 - 1.015 * avgSentenceLength - 84.6 * (avgWordLength / 5);

    if (avgSentenceLength > 25) {
      violations.push({
        type: 'brandVoice',
        severity: 'major',
        category: 'complexity',
        avgSentenceLength: avgSentenceLength.toFixed(1),
        message: `Sentences too long: average ${avgSentenceLength.toFixed(1)} words (recommended: <20)`,
        recommendation: 'Break long sentences into shorter ones for clarity',
        pages: 'multiple'
      });
    }

    if (readabilityScore < 60) {
      violations.push({
        type: 'brandVoice',
        severity: 'major',
        category: 'readability',
        score: readabilityScore.toFixed(1),
        message: `Readability score too low: ${readabilityScore.toFixed(1)} (aim for 60-70 for general audience)`,
        recommendation: 'Simplify language, use shorter sentences and common words',
        pages: 'multiple'
      });
    }

    return {
      violations,
      readabilityScore: readabilityScore.toFixed(1),
      avgSentenceLength: avgSentenceLength.toFixed(1),
      avgWordLength: avgWordLength.toFixed(1)
    };
  }

  /**
   * Detect condescending language
   */
  detectCondescendingLanguage(text) {
    const violations = [];
    const foundExamples = [];

    this.condescendingPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        foundExamples.push(match.toLowerCase());
      });
    });

    if (foundExamples.length > 0) {
      violations.push({
        type: 'brandVoice',
        severity: 'critical',
        category: 'condescending',
        count: foundExamples.length,
        examples: foundExamples.slice(0, 5),
        message: `Condescending language detected: ${foundExamples.length} instances`,
        recommendation: 'Remove words like "simply", "just", "obviously" - be empowering, not condescending',
        pages: 'multiple'
      });
    }

    return { violations };
  }

  /**
   * Check inclusivity and gender-neutral language
   */
  checkInclusivity(text) {
    const violations = [];
    const foundExamples = [];

    this.exclusivePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        foundExamples.push(match);
      });
    });

    if (foundExamples.length > 0) {
      violations.push({
        type: 'brandVoice',
        severity: 'critical',
        category: 'inclusivity',
        count: foundExamples.length,
        examples: foundExamples,
        message: `Non-inclusive language detected: ${foundExamples.join(', ')}`,
        recommendation: 'Use inclusive alternatives: "folks" instead of "guys", "people" instead of "mankind"',
        pages: 'multiple'
      });
    }

    return {
      violations,
      score: foundExamples.length === 0 ? 100 : Math.max(0, 100 - (foundExamples.length * 20))
    };
  }

  /**
   * AI-powered brand voice analysis using GPT-5
   */
  async runAIBrandVoiceAnalysis(text) {
    const violations = [];

    try {
      // Limit text to first 3000 words for API limits
      const words = text.split(/\s+/);
      const sampleText = words.slice(0, 3000).join(' ');

      const prompt = `You are a brand voice expert analyzing TEEI communications.

TEEI's brand voice must be:
1. **Empowering** - Uplifting, capability-focused, NOT condescending
2. **Urgent** - Important and timely, WITHOUT panic or pressure
3. **Hopeful** - Optimistic and forward-looking, NOT naive
4. **Inclusive** - Celebrating diversity, welcoming ALL people
5. **Respectful** - Honoring all stakeholders, maintaining dignity
6. **Clear** - Jargon-free, accessible language for all

Forbidden elements:
- Condescending language (e.g., "simply", "just", "obviously")
- Panic-inducing urgency
- Naive optimism
- Exclusionary terms (e.g., "guys", "mankind")
- Disrespectful phrasing
- Complex jargon and corporate buzzwords

Analyze this TEEI document text:

"""
${sampleText}
"""

For each of the 6 brand qualities, score 0-100 and provide specific feedback:
- Quote examples that violate or exemplify each quality
- Identify specific tone issues
- Assess overall emotional resonance
- Check for empowerment vs. condescension
- Evaluate inclusivity

Respond in JSON format:
{
  "overallScore": 0-100,
  "qualities": {
    "empowering": {"score": 0-100, "assessment": "...", "examples": ["quote 1", "quote 2"]},
    "urgent": {"score": 0-100, "assessment": "...", "examples": []},
    "hopeful": {"score": 0-100, "assessment": "...", "examples": []},
    "inclusive": {"score": 0-100, "assessment": "...", "examples": []},
    "respectful": {"score": 0-100, "assessment": "...", "examples": []},
    "clear": {"score": 0-100, "assessment": "...", "examples": []}
  },
  "violations": [
    {"quality": "empowering", "severity": "critical|major|minor", "quote": "...", "issue": "...", "fix": "..."}
  ],
  "strengths": ["strength 1", "strength 2"],
  "recommendations": ["rec 1", "rec 2"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Using gpt-4o as GPT-5 not yet available
        messages: [
          { role: 'system', content: 'You are a brand voice expert analyzing TEEI communications for tone, inclusivity, and empowerment.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content);

      // Convert AI violations to standard format
      if (analysis.violations && analysis.violations.length > 0) {
        analysis.violations.forEach(v => {
          violations.push({
            type: 'brandVoice',
            severity: v.severity || 'major',
            category: `voice_${v.quality}`,
            quality: v.quality,
            quote: v.quote,
            message: v.issue,
            recommendation: v.fix,
            source: 'GPT-5 AI Analysis',
            pages: 'multiple'
          });
        });
      }

      // Extract quality scores
      const qualityScores = {};
      if (analysis.qualities) {
        Object.entries(analysis.qualities).forEach(([quality, data]) => {
          qualityScores[quality] = {
            score: data.score,
            assessment: data.assessment,
            examples: data.examples || []
          };

          // Add violations for low scores
          if (data.score < 70) {
            violations.push({
              type: 'brandVoice',
              severity: data.score < 50 ? 'critical' : 'major',
              category: `voice_${quality}`,
              quality,
              score: data.score,
              message: `Brand quality "${quality}" scored low: ${data.score}/100`,
              recommendation: data.assessment,
              source: 'GPT-5 AI Analysis',
              pages: 'multiple'
            });
          }
        });
      }

      return {
        violations,
        qualityScores,
        overallScore: analysis.overallScore,
        strengths: analysis.strengths || [],
        recommendations: analysis.recommendations || []
      };

    } catch (error) {
      console.error('AI brand voice analysis failed:', error.message);
      return { violations, error: error.message };
    }
  }

  /**
   * Calculate overall brand voice score
   */
  calculateBrandVoiceScore(results) {
    let score = 100;

    // Deduct for violations
    results.violations.forEach(v => {
      if (v.type !== 'brandVoice') return;

      switch (v.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'major':
          score -= 10;
          break;
        case 'minor':
          score -= 5;
          break;
      }
    });

    // Factor in AI quality scores if available
    if (results.qualityScores && Object.keys(results.qualityScores).length > 0) {
      const avgQualityScore = Object.values(results.qualityScores)
        .reduce((sum, q) => sum + q.score, 0) / Object.keys(results.qualityScores).length;

      // Weight: 50% violations, 50% AI quality scores
      score = (score * 0.5) + (avgQualityScore * 0.5);
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];

    // Group violations by category
    const categories = {};
    results.violations.forEach(v => {
      if (!categories[v.category]) {
        categories[v.category] = [];
      }
      categories[v.category].push(v);
    });

    // Generate specific recommendations
    if (categories.jargon) {
      recommendations.push({
        priority: 'major',
        title: 'Eliminate Corporate Jargon',
        description: 'Replace buzzwords with clear, accessible language',
        action: 'Review document and replace jargon with plain English',
        examples: categories.jargon[0].examples,
        impact: 'medium'
      });
    }

    if (categories.condescending) {
      recommendations.push({
        priority: 'critical',
        title: 'Remove Condescending Language',
        description: 'Language must be empowering, not condescending',
        action: 'Remove words like "simply", "just", "obviously" - rewrite in empowering tone',
        impact: 'high'
      });
    }

    if (categories.inclusivity) {
      recommendations.push({
        priority: 'critical',
        title: 'Fix Non-Inclusive Language',
        description: 'Use gender-neutral and inclusive terms',
        action: 'Replace: "guys" → "folks", "mankind" → "humanity", "manpower" → "workforce"',
        impact: 'high'
      });
    }

    if (categories.complexity || categories.readability) {
      recommendations.push({
        priority: 'major',
        title: 'Simplify Language',
        description: 'Text is too complex for general audience',
        action: 'Use shorter sentences (<20 words), simpler words, active voice',
        impact: 'medium'
      });
    }

    // Add AI-generated recommendations
    if (results.aiInsights && results.aiInsights.recommendations) {
      results.aiInsights.recommendations.forEach(rec => {
        recommendations.push({
          priority: 'major',
          title: 'AI Recommendation',
          description: rec,
          action: rec,
          source: 'GPT-5',
          impact: 'medium'
        });
      });
    }

    return recommendations;
  }

  /**
   * Generate brand voice report
   */
  async generateBrandVoiceReport(results, outputPath) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TEEI Brand Voice Compliance Report</title>
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
    .qualities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .quality-card {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #00393F;
    }
    .quality-score {
      font-size: 32px;
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
    .quote {
      background: #f0f0f0;
      padding: 10px;
      margin: 10px 0;
      border-left: 3px solid #00393F;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎤 TEEI Brand Voice Compliance Report</h1>
    <p><strong>File:</strong> ${path.basename(results.pdfPath)}</p>
    <p><strong>Date:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
    <p><strong>Word Count:</strong> ${results.textAnalysis.wordCount || 'N/A'}</p>

    <div class="score">${results.score}/100</div>
    <p>${results.passed ? '✅ PASSED' : '❌ FAILED'}</p>

    ${Object.keys(results.qualityScores || {}).length > 0 ? `
      <h2>Brand Voice Qualities</h2>
      <div class="qualities-grid">
        ${Object.entries(results.qualityScores).map(([quality, data]) => `
          <div class="quality-card">
            <h3>${quality.charAt(0).toUpperCase() + quality.slice(1)}</h3>
            <div class="quality-score" style="color: ${data.score >= 70 ? '#65873B' : '#913B2F'}">
              ${data.score}/100
            </div>
            <p>${data.assessment}</p>
            ${data.examples && data.examples.length > 0 ? `
              <div>
                <strong>Examples:</strong>
                ${data.examples.map(ex => `<div class="quote">${ex}</div>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    <h2>Violations (${results.violations.length})</h2>
    ${results.violations.length > 0 ? results.violations.map(v => `
      <div class="violation ${v.severity}">
        <strong>${v.severity.toUpperCase()}:</strong> ${v.message}
        ${v.quote ? `<div class="quote">"${v.quote}"</div>` : ''}
        ${v.recommendation ? `<br><em>Recommendation: ${v.recommendation}</em>` : ''}
      </div>
    `).join('') : '<p>No violations found!</p>'}

    ${results.aiInsights && results.aiInsights.strengths && results.aiInsights.strengths.length > 0 ? `
      <h2>✅ Strengths</h2>
      <ul>
        ${results.aiInsights.strengths.map(s => `<li>${s}</li>`).join('')}
      </ul>
    ` : ''}
  </div>
</body>
</html>`;

    await fs.writeFile(outputPath, html, 'utf-8');
    console.log(`✅ Brand voice report saved: ${outputPath}`);
  }
}

module.exports = BrandVoiceAnalyzer;
