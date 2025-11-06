/**
 * VALIDATION WORKER THREAD
 *
 * Worker thread for parallel AI Vision validation.
 * Runs validation tasks in separate threads to maximize CPU utilization.
 *
 * This worker is spawned by the batch processor and communicates
 * via worker_threads messaging.
 *
 * Message Format:
 * IN:  { imagePath, pageNumber, cacheEnabled }
 * OUT: { success, result, error, fromCache }
 */

import { workerData, parentPort } from 'worker_threads';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import CacheManager from '../lib/cache-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

// TEEI Brand Guidelines (same as main validator)
const TEEI_BRAND_GUIDELINES = `
# TEEI BRAND GUIDELINES

## Official Color Palette
PRIMARY COLORS:
- Nordshore #00393F (Deep teal) - PRIMARY brand color, 80% usage recommended
- Sky #C9E4EC (Light blue) - Secondary highlights
- Sand #FFF1E2 (Warm neutral) - Background
- Beige #EFE1DC (Soft neutral) - Background

ACCENT COLORS:
- Moss #65873B (Natural green)
- Gold #BA8F5A (Warm metallic) - Use for premium feel, metrics
- Clay #913B2F (Rich terracotta)

FORBIDDEN COLORS:
- ❌ Copper/Orange (#C87137 or similar) - NOT in TEEI palette
- ❌ Bright orange, red-orange tones

## Typography System
HEADLINES: Lora (serif) - Bold/SemiBold, 28-48pt
BODY TEXT: Roboto Flex (sans-serif) - Regular, 11-14pt
CAPTIONS: Roboto Flex Regular, 9pt

Typography Scale:
- Document Title: Lora Bold, 42pt, Nordshore
- Section Headers: Lora Semibold, 28pt, Nordshore
- Subheads: Roboto Flex Medium, 18pt, Nordshore
- Body Text: Roboto Flex Regular, 11pt, Black
- Captions: Roboto Flex Regular, 9pt, Gray #666666

## Layout Standards
- Grid: 12-column with 20pt gutters
- Margins: 40pt all sides
- Section breaks: 60pt
- Between elements: 20pt
- Between paragraphs: 12pt
- Line height (body): 1.5x
- Line height (headlines): 1.2x

## Logo Clearspace
- Minimum clearspace = height of logo icon element
- No text, graphics, or other logos within this zone

## Photography Requirements
- Natural lighting (not studio)
- Warm color tones (align with Sand/Beige palette)
- Authentic moments (not staged corporate stock)
- Diverse representation
- Shows connection and hope

## Brand Voice
- Empowering (not condescending)
- Urgent (without panic)
- Hopeful (not naive)
- Inclusive (celebrating diversity)
- Respectful (of all stakeholders)
- Clear and jargon-free

## Critical Quality Standards
❌ VIOLATIONS TO CHECK:
1. Wrong colors (copper/orange instead of Nordshore/Sky/Gold)
2. Wrong fonts (not Lora/Roboto Flex)
3. Text cutoffs (incomplete sentences at page edges)
4. Missing metrics (placeholders like "XX" instead of actual numbers)
5. No photography (when required for warmth/authenticity)
6. Logo clearspace violations
7. Poor hierarchy (unclear visual importance)
8. Inconsistent spacing
9. Low-quality or stock photography
10. Unprofessional appearance
`;

/**
 * Worker initialization
 */
class ValidationWorker {
  constructor() {
    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.cacheManager = new CacheManager();
  }

  /**
   * Analyze page with AI Vision
   */
  async analyzePage(imagePath, pageNumber) {
    // Check cache first
    const cached = await this.cacheManager.get(imagePath);
    if (cached) {
      return { result: cached, fromCache: true };
    }

    // Read image as base64
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const prompt = `You are an expert design critic and brand compliance validator for TEEI (The Educational Equality Institute).

Analyze this document page against TEEI's brand guidelines and world-class design standards.

${TEEI_BRAND_GUIDELINES}

Provide a comprehensive analysis in JSON format with the following structure:

{
  "overallScore": <1-10>,
  "gradeLevel": "<A+, A, B, C, D, or F>",
  "brandCompliance": {
    "score": <1-10>,
    "colors": {
      "pass": <true/false>,
      "issues": ["<specific color violations>"],
      "correctColors": ["<colors that ARE correct>"]
    },
    "typography": {
      "pass": <true/false>,
      "issues": ["<font violations>"],
      "correctFonts": ["<fonts that ARE correct>"]
    },
    "layout": {
      "pass": <true/false>,
      "issues": ["<spacing, margin, grid violations>"]
    },
    "photography": {
      "pass": <true/false>,
      "issues": ["<photo quality, authenticity issues>"]
    },
    "logoUsage": {
      "pass": <true/false>,
      "issues": ["<logo clearspace, placement issues>"]
    }
  },
  "designQuality": {
    "score": <1-10>,
    "visualHierarchy": {
      "pass": <true/false>,
      "issues": ["<hierarchy problems>"]
    },
    "whitespace": {
      "pass": <true/false>,
      "issues": ["<spacing, breathing room issues>"]
    },
    "alignment": {
      "pass": <true/false>,
      "issues": ["<alignment problems>"]
    },
    "consistency": {
      "pass": <true/false>,
      "issues": ["<inconsistency issues>"]
    }
  },
  "contentQuality": {
    "score": <1-10>,
    "textCutoffs": {
      "detected": <true/false>,
      "locations": ["<where text is cut off>"]
    },
    "placeholders": {
      "detected": <true/false>,
      "locations": ["<where XX or placeholders found>"]
    },
    "readability": {
      "pass": <true/false>,
      "issues": ["<readability problems>"]
    }
  },
  "criticalViolations": [
    "<List ONLY critical issues that MUST be fixed>"
  ],
  "recommendations": [
    "<Specific actionable improvements>"
  ],
  "strengths": [
    "<What's working well>"
  ],
  "summary": "<2-3 sentence overall assessment>"
}

Be thorough, specific, and critical. Identify exact locations of problems. Grade harshly - only world-class documents deserve A+.`;

    try {
      const result = await this.model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        }
      ]);

      const response = result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI response did not contain valid JSON');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Cache the result
      await this.cacheManager.set(imagePath, analysis);

      return { result: analysis, fromCache: false };

    } catch (error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Handle validation request
   */
  async handleRequest(data) {
    const { imagePath, pageNumber } = data;

    try {
      const { result, fromCache } = await this.analyzePage(imagePath, pageNumber);

      return {
        success: true,
        result: result,
        fromCache: fromCache,
        pageNumber: pageNumber
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        pageNumber: pageNumber
      };
    }
  }
}

/**
 * Worker main execution
 */
async function main() {
  try {
    // Initialize worker
    const worker = new ValidationWorker();

    // Handle incoming message from parent
    if (workerData) {
      // Single task mode (workerData provided at creation)
      const response = await worker.handleRequest(workerData);
      parentPort.postMessage(response);
    } else {
      // Message-based mode (listen for messages)
      parentPort.on('message', async (data) => {
        const response = await worker.handleRequest(data);
        parentPort.postMessage(response);
      });
    }

  } catch (error) {
    parentPort.postMessage({
      success: false,
      error: error.message
    });
  }
}

// Run if executed as worker
if (parentPort) {
  main().catch(error => {
    parentPort.postMessage({
      success: false,
      error: error.message,
      stack: error.stack
    });
  });
}
