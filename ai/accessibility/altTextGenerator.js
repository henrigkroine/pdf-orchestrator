/**
 * Alt Text Generator - AI-powered image description
 * Uses OpenAI GPT-4V to generate descriptive alt text for images
 *
 * WCAG 2.2: 1.1.1 Non-text Content (Level A)
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import logger from '../utils/logger.js';

class AltTextGenerator {
  constructor(apiKey = null) {
    // Use API key from env or parameter
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;

    if (!this.apiKey) {
      logger.warn('OPENAI_API_KEY not set - alt text generation will fail');
      logger.info('Set OPENAI_API_KEY in config/.env or pass to constructor');
      this.enabled = false;
    } else {
      this.client = new OpenAI({ apiKey: this.apiKey });
      this.enabled = true;
    }

    this.stats = {
      imagesProcessed: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      totalTokens: 0,
      estimatedCost: 0
    };
  }

  /**
   * Generate alt text for a single image
   * @param {Buffer|string} imageData - Image buffer or base64 string
   * @param {Object} context - Additional context (page number, location, etc.)
   * @returns {Promise<string>} Generated alt text
   */
  async generateAltText(imageData, context = {}) {
    if (!this.enabled) {
      throw new Error('Alt text generation disabled: OPENAI_API_KEY not set');
    }

    this.stats.imagesProcessed++;

    try {
      // Convert image to base64 if buffer
      let base64Image;
      if (Buffer.isBuffer(imageData)) {
        base64Image = imageData.toString('base64');
      } else {
        base64Image = imageData;
      }

      // Determine image MIME type (default to PNG)
      const mimeType = context.mimeType || 'image/png';

      // Construct prompt for WCAG-compliant alt text
      const prompt = this.buildPrompt(context);

      logger.debug(`Generating alt text for image on page ${context.page || 'unknown'}`);

      // Call OpenAI GPT-4V
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o', // GPT-4 Turbo with vision (faster and cheaper than gpt-4-vision-preview)
        messages: [
          {
            role: 'system',
            content: 'You are an accessibility expert generating WCAG 2.2 compliant alt text for images in PDF documents.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high' // High detail for better descriptions
                }
              }
            ]
          }
        ],
        max_tokens: 150, // Alt text should be concise (typically 50-150 chars)
        temperature: 0.3 // Low temperature for consistent, accurate descriptions
      });

      const altText = response.choices[0].message.content.trim();

      // Update stats
      this.stats.successfulGenerations++;
      this.stats.totalTokens += response.usage.total_tokens;
      this.stats.estimatedCost += this.calculateCost(response.usage);

      logger.success(`Generated alt text: "${altText.substring(0, 60)}${altText.length > 60 ? '...' : ''}"`);

      return altText;

    } catch (error) {
      this.stats.failedGenerations++;
      logger.error(`Alt text generation failed: ${error.message}`);

      // Return fallback alt text
      return this.generateFallbackAltText(context);
    }
  }

  /**
   * Generate alt text for multiple images in batch
   * @param {Array<Object>} images - Array of { imageData, context } objects
   * @returns {Promise<Array<Object>>} Array of { altText, context, success }
   */
  async generateBatchAltText(images) {
    logger.subsection(`Generating alt text for ${images.length} images`);

    const results = [];

    // Process sequentially to avoid rate limits
    // In production, use parallel processing with rate limiting
    for (const image of images) {
      try {
        const altText = await this.generateAltText(image.imageData, image.context);
        results.push({
          altText,
          context: image.context,
          success: true
        });
      } catch (error) {
        results.push({
          altText: this.generateFallbackAltText(image.context),
          context: image.context,
          success: false,
          error: error.message
        });
      }

      // Rate limiting: 500ms delay between requests
      await this.delay(500);
    }

    logger.success(`Generated ${this.stats.successfulGenerations}/${images.length} alt texts`);

    return results;
  }

  /**
   * Build WCAG-compliant alt text generation prompt
   */
  buildPrompt(context) {
    const parts = [
      'Generate concise, descriptive alt text for this image that follows WCAG 2.2 guidelines.',
      '',
      'Requirements:',
      '- Be concise (1-2 sentences, max 150 characters)',
      '- Describe what the image shows, not how it looks',
      '- Include relevant context (people, objects, actions, emotions)',
      '- Avoid phrases like "image of" or "picture of"',
      '- Use active voice',
      '- Be objective and factual'
    ];

    // Add document context if available
    if (context.documentType) {
      parts.push(`\nDocument type: ${context.documentType}`);
    }

    if (context.page) {
      parts.push(`Image location: Page ${context.page}`);
    }

    if (context.nearbyText) {
      parts.push(`\nNearby text: "${context.nearbyText}"`);
    }

    // Add specific guidance based on image purpose
    if (context.purpose === 'decorative') {
      parts.push('\nNote: This image appears to be decorative. Return empty string "" if purely decorative.');
    } else if (context.purpose === 'logo') {
      parts.push('\nNote: This is a logo. Format: "[Company/Organization Name] logo"');
    } else if (context.purpose === 'chart') {
      parts.push('\nNote: This is a chart/graph. Describe the data trend or key insight.');
    }

    parts.push('\nGenerate alt text:');

    return parts.join('\n');
  }

  /**
   * Generate fallback alt text when AI generation fails
   */
  generateFallbackAltText(context) {
    if (context.purpose === 'logo') {
      return `${context.companyName || 'Organization'} logo`;
    }

    if (context.purpose === 'chart') {
      return 'Chart or graph (description unavailable)';
    }

    if (context.page) {
      return `Image on page ${context.page} (description unavailable)`;
    }

    return 'Image (description unavailable)';
  }

  /**
   * Calculate OpenAI API cost
   * GPT-4o pricing (as of 2025):
   * - Input: $2.50 per 1M tokens
   * - Output: $10.00 per 1M tokens
   */
  calculateCost(usage) {
    const inputCost = (usage.prompt_tokens / 1000000) * 2.50;
    const outputCost = (usage.completion_tokens / 1000000) * 10.00;
    return inputCost + outputCost;
  }

  /**
   * Get generation statistics
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.imagesProcessed > 0
        ? (this.stats.successfulGenerations / this.stats.imagesProcessed * 100).toFixed(1) + '%'
        : '0%',
      estimatedCostUSD: `$${this.stats.estimatedCost.toFixed(4)}`
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      imagesProcessed: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      totalTokens: 0,
      estimatedCost: 0
    };
  }

  /**
   * Delay helper for rate limiting
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate alt text quality
   * @param {string} altText - Generated alt text
   * @returns {Object} Validation result with score and suggestions
   */
  validateAltText(altText) {
    const issues = [];
    let score = 100;

    // Check length (optimal: 50-150 chars)
    if (altText.length < 10) {
      issues.push('Too short (less than 10 characters)');
      score -= 20;
    } else if (altText.length > 200) {
      issues.push('Too long (over 200 characters)');
      score -= 10;
    }

    // Check for bad phrases
    const badPhrases = ['image of', 'picture of', 'photo of', 'graphic of'];
    for (const phrase of badPhrases) {
      if (altText.toLowerCase().includes(phrase)) {
        issues.push(`Avoid phrase: "${phrase}"`);
        score -= 15;
      }
    }

    // Check if it starts with article (good practice)
    const startsWithArticle = /^(A|An|The)\s/i.test(altText);
    if (!startsWithArticle && altText.length > 20) {
      issues.push('Consider starting with an article (A, An, The)');
      score -= 5;
    }

    // Check for vague terms
    const vagueTerms = ['something', 'things', 'stuff', 'various'];
    for (const term of vagueTerms) {
      if (altText.toLowerCase().includes(term)) {
        issues.push(`Vague term detected: "${term}"`);
        score -= 10;
      }
    }

    return {
      score: Math.max(0, score),
      isValid: score >= 70,
      issues,
      grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D'
    };
  }
}

export default AltTextGenerator;
