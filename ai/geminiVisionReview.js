/**
 * Gemini Vision Design Review
 *
 * Uses Google's Gemini Vision API to perform multimodal AI critique
 * of PDF partnership documents for world-class B2B quality assessment.
 *
 * @module ai/geminiVisionReview
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

/**
 * Load Gemini configuration from environment
 */
function loadGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_VISION_MODEL || 'gemini-1.5-pro';
  const dryRun = process.env.DRY_RUN_GEMINI_VISION === '1';

  if (!apiKey && !dryRun) {
    throw new Error(
      '[GEMINI] GEMINI_API_KEY environment variable is required. ' +
      'Set DRY_RUN_GEMINI_VISION=1 for testing without API access.'
    );
  }

  return { apiKey, model, dryRun };
}

/**
 * Generate page analysis prompt for Gemini
 */
function generatePagePrompt(pageNumber, pageRole, jobContext) {
  const systemInstructions = `You are a senior brand and layout director evaluating a 4-page AWS partnership proposal PDF for Together for Ukraine (TFU).

TFU design rules (colors, fonts, badge, logo grid) are already enforced by separate validation tools. Your job is to assess:
- **World-class B2B partnership quality**: Does this document effectively pitch a strategic partnership to AWS executives?
- **Visual hierarchy**: Clear distinction between cover/section titles, headings, subheadings, body, captions
- **Narrative strength**: Problem → Approach → AWS Value → Outcomes → CTA flow
- **Executive polish**: Whitespace, readability, professional impression`;

  const pageRoleDescriptions = {
    cover: 'Cover page - Should establish immediate credibility and value with outcome-focused title, not generic phrasing',
    about: 'About/Story page - The Challenge, Our Approach, Why AWS Partnership narrative with metrics sidebar',
    programs: 'Programs page - 3 concrete programs with photos, outcomes, and placement stats',
    cta: 'Closing CTA page - TFU badge, Strategic Partner Tier ($150K/year investment), partner logo grid, contact info'
  };

  const worldClassCriteria = `
**World-Class Enterprise Partnership Doc Criteria:**

1. **Clarity & Hierarchy**
   - Immediate value proposition (not "Partnership Proposal" but specific outcome)
   - Clear visual rhythm: 11+ distinct type sizes
   - Headers guide eye through Problem → Solution → Value

2. **Narrative Arc**
   - Page 2: Structured B2B pitch (Challenge → Approach → AWS Value)
   - Page 3: Concrete outcomes with numbers (78% cert rate, 92% employment)
   - Page 4: Strategic tier with $ amount + specific benefits

3. **CTA Strength**
   - Clear next step ("Schedule 30-min partnership discussion")
   - Contact person with title, email, phone
   - No vague "learn more" - specific action

4. **Visual Polish**
   - Balanced whitespace (not cramped)
   - Photos show authentic student moments (not stock)
   - Footer on all pages
   - No text cutoffs at edges`;

  return `${systemInstructions}

**Page ${pageNumber} of 4** - ${pageRoleDescriptions[pageRole] || pageRole}

${worldClassCriteria}

**Your Task:**
Analyze this page image and return ONLY valid JSON with this exact schema:

{
  "page": ${pageNumber},
  "score": 0.0-1.0,
  "role": "${pageRole}",
  "issues": [
    {
      "severity": "info|minor|major|critical",
      "area": "typography|layout|imagery|content|branding|accessibility|other",
      "description": "Human-readable issue description",
      "suggested_fix": "Specific improvement suggestion"
    }
  ]
}

**Severity Guidelines:**
- **critical**: Breaks core partnership pitch (missing CTA, unclear value, misleading content)
- **major**: Significantly weakens impression (poor hierarchy, generic phrasing, layout issues)
- **minor**: Small improvements possible (spacing tweaks, caption clarity)
- **info**: Suggestions for future enhancement`;
}

/**
 * Generate overall summary prompt
 */
function generateSummaryPrompt(pageResults, jobContext) {
  const pageScores = pageResults.map(p => `Page ${p.page}: ${p.score.toFixed(2)}`).join(', ');
  const allIssues = pageResults.flatMap(p => p.issues || []);
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
  const majorCount = allIssues.filter(i => i.severity === 'major').length;

  return `Based on the 4-page analysis:
${pageScores}

Critical issues: ${criticalCount}
Major issues: ${majorCount}

Synthesize an overall assessment as JSON:

{
  "overall_score": 0.0-1.0,
  "summary": "1-2 paragraph natural language summary of document quality",
  "recommendations_md": "Markdown block with top 3-5 priority improvements",
  "requires_changes": true|false
}

**Score calibration:**
- 0.95-1.0: World-class, executive-ready
- 0.90-0.94: Excellent, minor polish needed
- 0.85-0.89: Good, some improvements recommended
- 0.80-0.84: Acceptable, notable issues
- <0.80: Needs significant work

Set requires_changes=true if any critical or 2+ major issues found.`;
}

/**
 * Call Gemini Vision API for page analysis
 */
async function analyzePageWithGemini(genAI, model, pageImage, pageNumber, pageRole, jobContext) {
  console.log(`[GEMINI] Analyzing page ${pageNumber}...`);

  try {
    const imageBuffer = await fs.readFile(pageImage.pngPath);
    const base64Image = imageBuffer.toString('base64');

    const prompt = generatePagePrompt(pageNumber, pageRole, jobContext);

    const result = await genAI
      .getGenerativeModel({ model })
      .generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png'
          }
        },
        prompt
      ]);

    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gemini response did not contain valid JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (typeof parsed.page !== 'number' || typeof parsed.score !== 'number') {
      throw new Error('Gemini response missing required fields (page, score)');
    }

    return {
      page: parsed.page,
      score: parsed.score,
      role: parsed.role || pageRole,
      issues: parsed.issues || []
    };

  } catch (error) {
    console.error(`[GEMINI] Error analyzing page ${pageNumber}:`, error.message);
    return {
      page: pageNumber,
      score: 0.0,
      role: pageRole,
      issues: [{
        severity: 'critical',
        area: 'other',
        description: `AI analysis failed: ${error.message}`,
        suggested_fix: 'Review page manually or retry with different model'
      }],
      error: error.message
    };
  }
}

/**
 * Generate synthetic response for dry-run mode
 */
function generateDryRunResponse(pageImages, jobContext) {
  console.log('[GEMINI] DRY RUN – Generating stub response (no API call)');

  const pageRoles = ['cover', 'about', 'programs', 'cta'];
  const pageScores = pageImages.map((img, idx) => ({
    page: idx + 1,
    score: 0.91 + (idx * 0.01), // 0.91, 0.92, 0.93, 0.94
    role: pageRoles[idx] || 'other',
    issues: idx === 2 ? [
      {
        severity: 'minor',
        area: 'imagery',
        description: 'Program photos could be larger to show more student engagement details',
        suggested_fix: 'Increase photo height from 80pt to 100pt'
      }
    ] : []
  }));

  const overall_score = pageScores.reduce((sum, p) => sum + p.score, 0) / pageScores.length;

  return {
    model: 'gemini-1.5-pro (DRY RUN)',
    overall_score: Math.round(overall_score * 100) / 100,
    summary: 'This is a DRY RUN response. The document shows strong TFU compliance with clear hierarchy and strategic narrative. Minor improvements possible in visual balance and photo sizing.',
    page_scores: pageScores,
    recommendations_md: `## Priority Improvements (DRY RUN)

1. **Visual Balance** - Consider slightly larger program photos to showcase authentic student moments
2. **Whitespace** - Page 3 could benefit from 10-15pt additional spacing between program cards
3. **CTA Clarity** - Excellent strategic tier presentation with concrete $ amount

Overall: Ready for executive review with minor polish opportunities.`,
    requires_changes: false
  };
}

/**
 * Main review function: Analyze document with Gemini Vision
 */
export async function reviewDocumentWithGemini(pageImages, jobConfig = {}) {
  const config = loadGeminiConfig();

  // Dry run mode for testing without API access
  if (config.dryRun) {
    return generateDryRunResponse(pageImages, jobConfig);
  }

  // Initialize Gemini client
  const genAI = new GoogleGenerativeAI(config.apiKey);

  const jobContext = {
    name: jobConfig.name || 'Partnership Document',
    mode: jobConfig.mode || 'world_class',
    threshold: jobConfig.quality?.validation_threshold || 145
  };

  // Analyze each page
  const pageRoles = ['cover', 'about', 'programs', 'cta'];
  const pageResults = [];

  for (let i = 0; i < pageImages.length; i++) {
    const pageImage = pageImages[i];
    const pageRole = pageRoles[i] || 'other';

    const result = await analyzePageWithGemini(
      genAI,
      config.model,
      pageImage,
      i + 1,
      pageRole,
      jobContext
    );

    pageResults.push(result);
  }

  // Generate overall summary
  console.log('[GEMINI] Generating overall summary...');

  try {
    const summaryPrompt = generateSummaryPrompt(pageResults, jobContext);
    const summaryResult = await genAI
      .getGenerativeModel({ model: config.model })
      .generateContent(summaryPrompt);

    const summaryText = (await summaryResult.response).text();
    const summaryJson = JSON.parse(summaryText.match(/\{[\s\S]*\}/)[0]);

    return {
      model: config.model,
      overall_score: summaryJson.overall_score,
      summary: summaryJson.summary,
      page_scores: pageResults,
      recommendations_md: summaryJson.recommendations_md,
      requires_changes: summaryJson.requires_changes
    };

  } catch (error) {
    console.error('[GEMINI] Error generating summary:', error.message);

    // Fallback: Calculate overall score from page scores
    const avgScore = pageResults.reduce((sum, p) => sum + p.score, 0) / pageResults.length;
    const hasCritical = pageResults.some(p => p.issues.some(i => i.severity === 'critical'));

    return {
      model: config.model,
      overall_score: Math.round(avgScore * 100) / 100,
      summary: 'Summary generation failed. See individual page analysis for details.',
      page_scores: pageResults,
      recommendations_md: '## Analysis Error\n\nFailed to generate recommendations. Review individual page issues.',
      requires_changes: hasCritical,
      summary_error: error.message
    };
  }
}
