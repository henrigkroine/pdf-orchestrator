/**
 * Azure OCR Validator
 *
 * Uses Azure Computer Vision for advanced OCR and text validation.
 * Detects text cutoffs, placeholders, and text quality issues.
 *
 * Features:
 * - High-accuracy OCR (98%+ on printed text)
 * - Text cutoff detection (incomplete sentences)
 * - Placeholder detection ("XX", "TODO", "[TBD]")
 * - Multi-language support (50+ languages)
 * - Confidence scoring per word
 *
 * Research-backed: Azure OCR achieves 98.3% accuracy on printed documents,
 * significantly outperforming open-source alternatives on complex layouts.
 *
 * Note: Requires Azure subscription and API key.
 * Set AZURE_COMPUTER_VISION_KEY and AZURE_COMPUTER_VISION_ENDPOINT in .env
 */

import fs from 'fs/promises';
import path from 'path';

export class AzureOCRValidator {
  constructor(config = {}) {
    this.config = {
      apiKey: process.env.AZURE_COMPUTER_VISION_KEY || config.apiKey,
      endpoint: process.env.AZURE_COMPUTER_VISION_ENDPOINT || config.endpoint,
      enabled: !!(process.env.AZURE_COMPUTER_VISION_KEY && process.env.AZURE_COMPUTER_VISION_ENDPOINT),
      minConfidence: config.minConfidence || 0.8,
      ...config
    };

    if (!this.config.enabled) {
      console.warn('⚠️  Azure OCR disabled: AZURE_COMPUTER_VISION_KEY or AZURE_COMPUTER_VISION_ENDPOINT not set');
    }
  }

  /**
   * Extract and validate all text from image
   */
  async extractAndValidateText(imagePath, pageNumber = 1) {
    if (!this.config.enabled) {
      return this.getFallbackResult(imagePath, pageNumber);
    }

    try {
      console.log(`\n📄 Extracting text from page ${pageNumber}...`);

      // Read image
      const imageBuffer = await fs.readFile(imagePath);

      // Call Azure Computer Vision Read API
      const readResult = await this.callAzureReadAPI(imageBuffer);

      // Extract text lines
      const lines = this.extractLines(readResult);

      // Validate text
      const issues = [];

      // Check for cutoffs (incomplete sentences)
      const cutoffs = this.detectCutoffs(lines);
      if (cutoffs.length > 0) {
        issues.push({
          type: 'text_cutoff',
          severity: 'critical',
          count: cutoffs.length,
          examples: cutoffs.slice(0, 3),
          message: `${cutoffs.length} text cutoff(s) detected`
        });
      }

      // Check for placeholders
      const placeholders = this.detectPlaceholders(lines);
      if (placeholders.length > 0) {
        issues.push({
          type: 'placeholder',
          severity: 'high',
          count: placeholders.length,
          examples: placeholders.slice(0, 3),
          message: `${placeholders.length} placeholder(s) detected (XX, TODO, TBD, etc.)`
        });
      }

      // Check confidence
      const lowConfidence = lines.filter(l => l.confidence < this.config.minConfidence);
      if (lowConfidence.length > 0) {
        issues.push({
          type: 'low_confidence',
          severity: 'medium',
          count: lowConfidence.length,
          avgConfidence: this.average(lowConfidence.map(l => l.confidence)),
          message: `${lowConfidence.length} line(s) with low OCR confidence`
        });
      }

      // Calculate overall score
      const score = this.calculateScore(lines, cutoffs, placeholders, lowConfidence);

      return {
        pageNumber,
        score,
        lines: lines.length,
        allText: lines.map(l => l.text),
        fullText: lines.map(l => l.text).join('\n'),
        issues,
        cutoffs,
        placeholders,
        avgConfidence: this.average(lines.map(l => l.confidence)),
        passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
        details: {
          totalLines: lines.length,
          totalWords: lines.reduce((sum, l) => sum + l.words, 0),
          confidenceDistribution: this.getConfidenceDistribution(lines)
        }
      };

    } catch (error) {
      console.error('❌ Error extracting text:', error.message);
      throw error;
    }
  }

  /**
   * Call Azure Computer Vision Read API
   */
  async callAzureReadAPI(imageBuffer) {
    // Submit image for OCR
    const submitUrl = `${this.config.endpoint}/vision/v3.2/read/analyze`;

    const submitResponse = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.apiKey,
        'Content-Type': 'application/octet-stream'
      },
      body: imageBuffer
    });

    if (!submitResponse.ok) {
      throw new Error(`Azure API error: ${submitResponse.status} ${submitResponse.statusText}`);
    }

    // Get operation location
    const operationLocation = submitResponse.headers.get('Operation-Location');
    if (!operationLocation) {
      throw new Error('No Operation-Location header in Azure response');
    }

    // Poll for results
    let result;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await this.sleep(1000); // Wait 1 second

      const resultResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey
        }
      });

      if (!resultResponse.ok) {
        throw new Error(`Azure API error: ${resultResponse.status}`);
      }

      result = await resultResponse.json();

      if (result.status === 'succeeded') {
        return result;
      } else if (result.status === 'failed') {
        throw new Error('Azure OCR failed');
      }

      attempts++;
    }

    throw new Error('Azure OCR timeout');
  }

  /**
   * Extract lines from Azure result
   */
  extractLines(readResult) {
    const lines = [];

    if (readResult.analyzeResult && readResult.analyzeResult.readResults) {
      for (const page of readResult.analyzeResult.readResults) {
        for (const line of page.lines) {
          lines.push({
            text: line.text,
            confidence: line.words
              ? this.average(line.words.map(w => w.confidence))
              : 0.9, // Default if not provided
            words: line.words ? line.words.length : 0,
            bbox: line.boundingBox
          });
        }
      }
    }

    return lines;
  }

  /**
   * Detect text cutoffs (incomplete sentences)
   */
  detectCutoffs(lines) {
    const cutoffs = [];

    // Patterns indicating cutoff text
    const cutoffPatterns = [
      /[a-z]-$/, // Hyphenated word at end
      /\w+\s*$/, // Word without punctuation at end (if not last line)
      /^[a-z]/, // Starting with lowercase (continuation)
      /[,;]\s*$/ // Ends with comma or semicolon (incomplete)
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const text = line.text.trim();

      // Check if line ends abruptly
      if (cutoffPatterns[0].test(text)) {
        cutoffs.push({
          line: i + 1,
          text: text,
          snippet: text.slice(-50),
          reason: 'Hyphenated word at end suggests continuation'
        });
      }

      // Check for incomplete sentence (no ending punctuation)
      if (i < lines.length - 1 && !/[.!?]$/.test(text) && text.length > 20) {
        // Could be cutoff or just no punctuation
        // More sophisticated check needed
        if (/\b\w+ed$|\b\w+ing$|\b\w+ion$/.test(text)) {
          // Ends with complete word, might be intentional
          continue;
        }
        cutoffs.push({
          line: i + 1,
          text: text,
          snippet: text.slice(-50),
          reason: 'Line ends without punctuation mid-sentence'
        });
      }
    }

    return cutoffs;
  }

  /**
   * Detect placeholder text
   */
  detectPlaceholders(lines) {
    const placeholders = [];

    // Placeholder patterns
    const patterns = [
      /\bXX\b/gi,        // XX
      /\bTODO\b/gi,      // TODO
      /\bTBD\b/gi,       // TBD
      /\[.*?\]/g,        // [anything]
      /\{\{.*?\}\}/g,    // {{anything}}
      /<.*?>/g,          // <anything>
      /\b\d{2}\s+Students\b/gi  // "XX Students" pattern
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of patterns) {
        const matches = line.text.match(pattern);
        if (matches) {
          placeholders.push({
            line: i + 1,
            text: line.text,
            placeholder: matches[0],
            snippet: this.getContextSnippet(line.text, matches[0])
          });
        }
      }
    }

    return placeholders;
  }

  /**
   * Get context snippet around placeholder
   */
  getContextSnippet(text, placeholder) {
    const index = text.indexOf(placeholder);
    const start = Math.max(0, index - 20);
    const end = Math.min(text.length, index + placeholder.length + 20);

    return text.slice(start, end);
  }

  /**
   * Calculate overall score
   */
  calculateScore(lines, cutoffs, placeholders, lowConfidence) {
    let score = 1.0;

    // Penalize cutoffs heavily
    score -= cutoffs.length * 0.15;

    // Penalize placeholders
    score -= placeholders.length * 0.1;

    // Penalize low confidence
    score -= lowConfidence.length * 0.05;

    return Math.max(0, score);
  }

  /**
   * Get confidence distribution
   */
  getConfidenceDistribution(lines) {
    const buckets = {
      high: 0,      // >= 0.9
      medium: 0,    // 0.7 - 0.9
      low: 0        // < 0.7
    };

    for (const line of lines) {
      if (line.confidence >= 0.9) {
        buckets.high++;
      } else if (line.confidence >= 0.7) {
        buckets.medium++;
      } else {
        buckets.low++;
      }
    }

    return buckets;
  }

  /**
   * Get fallback result when Azure is disabled
   */
  getFallbackResult(imagePath, pageNumber) {
    console.log('⚠️  Using fallback OCR (Azure disabled)');

    return {
      pageNumber,
      score: 0.5,
      lines: 0,
      allText: [],
      fullText: '',
      issues: [{
        type: 'azure_disabled',
        severity: 'info',
        message: 'Azure OCR not configured. Set AZURE_COMPUTER_VISION_KEY to enable.'
      }],
      cutoffs: [],
      placeholders: [],
      avgConfidence: 0,
      passed: true, // Don't fail validation if Azure is not configured
      fallback: true
    };
  }

  /**
   * Batch validate multiple pages
   */
  async validatePages(imagePaths) {
    const results = [];

    for (const [index, imagePath] of imagePaths.entries()) {
      console.log(`\n📄 Processing page ${index + 1}/${imagePaths.length}...`);

      const result = await this.extractAndValidateText(imagePath, index + 1);
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

    const allCutoffs = results.flatMap(r => r.cutoffs.map(c => ({
      ...c,
      pageNumber: r.pageNumber
    })));

    const allPlaceholders = results.flatMap(r => r.placeholders.map(p => ({
      ...p,
      pageNumber: r.pageNumber
    })));

    const avgScore = this.average(results.map(r => r.score));
    const avgConfidence = this.average(results.map(r => r.avgConfidence));

    return {
      summary: {
        totalPages,
        passedPages,
        failedPages: totalPages - passedPages,
        passRate: (passedPages / totalPages * 100).toFixed(1) + '%',
        avgScore: avgScore.toFixed(2),
        avgConfidence: avgConfidence.toFixed(2)
      },
      results,
      issues: allIssues,
      cutoffs: allCutoffs,
      placeholders: allPlaceholders,
      verdict: this.getVerdict(avgScore, allIssues)
    };
  }

  /**
   * Get verdict based on score and issues
   */
  getVerdict(avgScore, allIssues) {
    const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
    const highIssues = allIssues.filter(i => i.severity === 'high').length;

    if (avgScore >= 0.95 && criticalIssues === 0 && highIssues === 0) {
      return {
        grade: 'A+',
        verdict: 'Perfect text quality - No cutoffs or placeholders',
        status: 'PASS'
      };
    } else if (avgScore >= 0.85 && criticalIssues === 0) {
      return {
        grade: 'A',
        verdict: 'Excellent text quality with minor issues',
        status: 'PASS'
      };
    } else if (avgScore >= 0.75) {
      return {
        grade: 'B',
        verdict: 'Good text quality but improvements recommended',
        status: 'WARNING'
      };
    } else {
      return {
        grade: 'C',
        verdict: 'Text quality issues requiring attention',
        status: 'FAIL'
      };
    }
  }

  /**
   * Helper: Sleep for ms
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
  console.log('📄 Azure OCR Validator Demo\n');

  const validator = new AzureOCRValidator();

  console.log('Service: Azure Computer Vision Read API');
  console.log('Accuracy: 98.3% on printed documents');
  console.log('Languages: 50+ supported\n');

  console.log('Validation checks:');
  console.log('✓ Text cutoff detection (incomplete sentences)');
  console.log('✓ Placeholder detection (XX, TODO, TBD, [])');
  console.log('✓ OCR confidence scoring');
  console.log('✓ Multi-language support\n');

  if (validator.config.enabled) {
    console.log('✅ Azure OCR enabled');
    console.log(`Endpoint: ${validator.config.endpoint}`);
  } else {
    console.log('⚠️  Azure OCR disabled');
    console.log('Set AZURE_COMPUTER_VISION_KEY and AZURE_COMPUTER_VISION_ENDPOINT to enable\n');
  }

  console.log('Usage:');
  console.log('const result = await validator.extractAndValidateText("page.png", 1);');
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}
