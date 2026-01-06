#!/usr/bin/env node
/**
 * Direct Gemini Vision analysis of JPEG screenshot
 * No PDF conversion required
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname);

// Load environment variables
dotenv.config({ path: path.join(projectRoot, 'config', '.env') });

const imagePath = process.argv[2] || 'exports/TEEI-Partnership-Showcase-FINAL-screenshot.jpg';

// TEEI Brand Guidelines
const TEEI_BRAND_GUIDELINES = `
# TEEI BRAND GUIDELINES

PRIMARY COLORS:
- TEEI Blue #00393F (Deep teal) - PRIMARY brand color
- TEEI Green #009688 (Teal/turquoise) - Secondary

TYPOGRAPHY:
- HEADLINES: Professional serif or sans-serif
- BODY TEXT: Readable sans-serif

CRITICAL CHECKS:
1. Are all text elements properly colored (not all black)?
2. Is the gradient header visible (TEEI Blue → TEEI Green)?
3. Are section headings in TEEI Green?
4. Is the title text WHITE on the gradient?
5. Are there any text cutoffs or incomplete content?
6. Does the document look professional and polished?

Be STRICT. If text is black instead of colored, that's a CRITICAL VIOLATION.
`;

const prompt = `You are analyzing a TEEI Partnership Showcase document.

${TEEI_BRAND_GUIDELINES}

Analyze this document image and provide a JSON response:

{
  "overallScore": <number 1-10>,
  "gradeLevel": "<A+, A, B, C, D, or F>",
  "brandCompliance": {
    "score": <number 1-10>,
    "colors": {
      "pass": <boolean>,
      "issues": [<list of color problems>],
      "correctColors": [<list of correctly applied colors>]
    }
  },
  "designQuality": {
    "score": <number 1-10>,
    "visualHierarchy": {
      "pass": <boolean>,
      "issues": [<problems>]
    }
  },
  "criticalViolations": [<list of critical issues>],
  "recommendations": [<specific fixes>],
  "strengths": [<what works well>],
  "summary": "<2-3 sentence overall assessment>"
}

**IMPORTANT**: Check if text is actually colored or if it's all black. If the gradient header exists, if text on the gradient is white, if section headings are green.`;

async function analyzeImage() {
  console.log('================================================================================');
  console.log('🤖 GEMINI VISION QA - TEEI DOCUMENT ANALYSIS');
  console.log('================================================================================\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ ERROR: GEMINI_API_KEY not configured in config/.env');
    process.exit(1);
  }

  console.log(`📄 Image: ${imagePath}`);

  if (!fs.existsSync(imagePath)) {
    console.error(`❌ ERROR: Image not found: ${imagePath}`);
    process.exit(1);
  }

  console.log('🔍 Reading image...');
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');

  console.log('🤖 Analyzing with Gemini 2.5 Pro Vision...\n');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    },
    prompt
  ]);

  const response = await result.response;
  const text = response.text();

  console.log('================================================================================');
  console.log('📊 GEMINI ANALYSIS RESULT');
  console.log('================================================================================\n');
  console.log(text);
  console.log('\n================================================================================\n');

  // Try to extract JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log('📊 STRUCTURED ANALYSIS:\n');
      console.log(`🎯 Overall Grade: ${analysis.gradeLevel}`);
      console.log(`📈 Overall Score: ${analysis.overallScore}/10\n`);

      if (analysis.brandCompliance) {
        console.log(`📊 Brand Compliance: ${analysis.brandCompliance.score}/10`);
        if (analysis.brandCompliance.colors && !analysis.brandCompliance.colors.pass) {
          console.log('   ⚠️  COLOR ISSUES:');
          analysis.brandCompliance.colors.issues.forEach(issue => {
            console.log(`      ❌ ${issue}`);
          });
        }
      }

      if (analysis.criticalViolations && analysis.criticalViolations.length > 0) {
        console.log('\n⚠️  CRITICAL VIOLATIONS:');
        analysis.criticalViolations.forEach(v => {
          console.log(`   ❌ ${v}`);
        });
      }

      if (analysis.recommendations && analysis.recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        analysis.recommendations.forEach(r => {
          console.log(`   • ${r}`);
        });
      }

      if (analysis.strengths && analysis.strengths.length > 0) {
        console.log('\n✅ STRENGTHS:');
        analysis.strengths.forEach(s => {
          console.log(`   • ${s}`);
        });
      }

      console.log('\n📝 SUMMARY:');
      console.log(`   ${analysis.summary}\n`);

      // Save full analysis
      const reportPath = imagePath.replace(/\.(jpg|png)$/, '-gemini-analysis.json');
      fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
      console.log(`💾 Full analysis saved: ${reportPath}\n`);

    } catch (e) {
      console.log('⚠️  Could not parse JSON, but response received above.');
    }
  }
}

analyzeImage().catch(error => {
  console.error('❌ ERROR:', error.message);
  process.exit(1);
});
