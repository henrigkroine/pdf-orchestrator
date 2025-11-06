# Content Quality Analysis Framework

**Complete guide to the AI-powered content quality analysis system**

## Overview

The Content Quality Analyzer is a sophisticated multi-dimensional analysis system that evaluates PDF documents across 8 quality dimensions using multiple state-of-the-art AI models. It provides actionable feedback to transform content from acceptable to exceptional.

## Table of Contents

1. [Quality Dimensions](#quality-dimensions)
2. [Scoring System](#scoring-system)
3. [AI Models Used](#ai-models-used)
4. [How to Use](#how-to-use)
5. [Interpreting Results](#interpreting-results)
6. [Improvement Strategies](#improvement-strategies)
7. [Integration Guide](#integration-guide)

---

## Quality Dimensions

### 1. Writing Quality (15% weight)

Analyzes the technical quality of writing including:

- **Grammar & Spelling** - Correctness and error detection
- **Sentence Structure** - Variety, complexity, and flow
- **Clarity & Conciseness** - Readability and precision
- **Active Voice** - Percentage of active vs passive voice
- **Coherence** - Paragraph flow and transitions

**AI Model:** GPT-5 (writing critique and rewrite suggestions)

**Ideal Scores:**
- Grammar accuracy: 95%+
- Active voice usage: 70%+
- Flesch Reading Ease: 60-70 (plain English)
- Sentence variety: Good range (8-25 words average)

**Common Issues:**
- Passive voice overuse
- Run-on sentences
- Weak word choices ("very", "really", "just")
- Poor transitions between paragraphs

---

### 2. Messaging Effectiveness (20% weight)

Evaluates persuasive impact and clarity:

- **Value Proposition** - Clarity and strength of core offering
- **Call-to-Action** - Presence, strength, and specificity
- **Emotional Impact** - Resonance and appeal
- **Persuasion Techniques** - Use of ethos, pathos, logos
- **Target Alignment** - Match with audience priorities

**AI Model:** Claude Opus 4.1 (deep reasoning for messaging critique)

**Ideal Characteristics:**
- Value proposition in first paragraph
- Clear, specific CTA at end
- Balance of credibility, emotion, and evidence
- Audience-focused language (more "you" than "we")

**Common Issues:**
- Generic value propositions
- Weak or missing CTAs
- Too feature-focused vs benefit-focused
- Lack of urgency or motivation

---

### 3. Storytelling Quality (15% weight)

Assesses narrative effectiveness:

- **Narrative Arc** - Exposition → Climax → Resolution
- **Story Structure** - Beginning, middle, end coherence
- **Character Clarity** - Subject identification and development
- **Conflict & Resolution** - Problem presentation and solution
- **Emotional Journey** - Reader's emotional arc

**AI Model:** Gemini 2.5 Pro (narrative and storytelling analysis)

**Ideal Story Elements:**
- Clear protagonist (student, organization, community)
- Defined challenge or need
- Journey and transformation
- Satisfying resolution with impact
- Emotional progression (challenge → hope → success)

**Common Issues:**
- No narrative structure (just facts)
- Missing conflict or stakes
- Unclear characters/subjects
- Flat emotional arc
- No before/after transformation

---

### 4. Brand Voice Consistency (15% weight)

Ensures alignment with TEEI brand voice:

- **Tone Consistency** - Uniform throughout document
- **Voice Attributes** - Empowering, urgent, hopeful, inclusive, respectful
- **Terminology** - Consistent brand language
- **Personality** - Authentic TEEI character
- **Cross-document** - Alignment with other materials

**TEEI Voice Attributes:**
- **Empowering** (not condescending): "enable", "strengthen", "achieve"
- **Urgent** (without panic): "now", "priority", "essential"
- **Hopeful** (not naive): "opportunity", "transform", "future"
- **Inclusive** (celebrating diversity): "together", "partnership", "community"
- **Respectful** (of all stakeholders): Avoid "victims", "disadvantaged"
- **Clear** (jargon-free): Plain language over buzzwords

**Common Issues:**
- Using "help" instead of "empower"
- Panic language ("crisis", "desperate")
- Condescending tone
- Exclusive language
- Corporate jargon

---

### 5. Content Completeness (15% weight)

Validates all required elements present:

- **Required Elements** - All mandatory sections included
- **Placeholder Detection** - No XX, TBD, [INSERT], etc.
- **Data Accuracy** - Numbers and statistics validated
- **Fact-Checking** - Claims verified via web search
- **Citations** - Sources provided for data

**Critical Requirements:**
- Organization name (TEEI)
- Partner name
- Value proposition
- Program details
- Impact metrics (actual numbers, not XX)
- Call to action
- Contact information
- Next steps

**Common Issues:**
- Placeholder text not replaced
- Missing impact metrics
- Uncited statistics
- Incomplete CTAs
- Generic content

---

### 6. Audience Appropriateness (10% weight)

Ensures content matches target audience:

- **Reading Level** - Flesch-Kincaid grade level
- **Technical Depth** - Appropriate complexity
- **Cultural Sensitivity** - Respectful language
- **Inclusive Language** - Gender-neutral, accessible
- **Professional Tone** - Appropriate formality

**AI Model:** Claude Sonnet 4.5 (audience analysis and appropriateness)

**Target Audiences:**
- **Corporate Partners:** Grade 12-16, professional tone, ROI focus
- **Foundations:** Grade 14-18, academic tone, methodology focus
- **Educators:** Grade 12-16, collaborative tone, pedagogy focus
- **General Public:** Grade 8-12, accessible tone, impact stories

**Common Issues:**
- Too technical for general audience
- Too simplistic for academic audience
- Non-inclusive pronouns (he/him without alternative)
- Ableist language
- Cultural assumptions

---

### 7. SEO & Discoverability (5% weight)

Optimizes for search and findability:

- **Keyword Usage** - Relevant terms naturally included
- **Heading Hierarchy** - Proper H1, H2, H3 structure
- **Meta Quality** - Description and summary effectiveness
- **Link Validation** - Working URLs and references
- **Search Intent** - Matches what audience seeks

**AI Model:** GPT-4o (SEO optimization)

**Key Practices:**
- Use keywords naturally in headings
- Include organization and partner names
- Use descriptive headings (not "Introduction")
- Add program-specific keywords
- Include location/date where relevant

---

### 8. Emotional Intelligence (5% weight)

Measures emotional sophistication:

- **Sentiment Balance** - Positive/neutral/negative ratio
- **Emotional Appeal** - Power words and resonance
- **Empathy Indicators** - Understanding and validation
- **Trust-Building** - Credibility elements
- **Urgency Balance** - Motivating without panic

**AI Model:** Gemini 2.5 Pro (emotional intelligence analysis)

**Ideal Balance:**
- 50-70% positive sentiment
- 20-40% neutral
- 10-30% negative (acknowledging challenges)
- Empathy: audience-focused language
- Trust: evidence, transparency, credibility
- Urgency: balanced markers, paired with hope

**Common Issues:**
- Overly negative (>40% negative sentiment)
- Too neutral (boring, no connection)
- No empathy indicators
- Missing trust elements
- Panic-inducing urgency

---

## Scoring System

### Score Ranges

| Score | Grade | Label | Description |
|-------|-------|-------|-------------|
| 90-100 | A+/A | Exceptional | World-class quality, best practices exemplified |
| 80-89 | B+/B | Very Good | High quality with minor improvement opportunities |
| 70-79 | C+/C | Good | Solid quality with some areas needing attention |
| 60-69 | D+/D | Fair | Acceptable but multiple improvements needed |
| 50-59 | F | Below Standard | Significant work required to meet standards |
| 0-49 | F | Poor | Major rewrite recommended |

### Weighted Calculation

Overall score = Σ (Dimension Score × Dimension Weight)

Example:
- Writing Quality (85) × 0.15 = 12.75
- Messaging (90) × 0.20 = 18.00
- Storytelling (75) × 0.15 = 11.25
- Brand Voice (80) × 0.15 = 12.00
- Completeness (100) × 0.15 = 15.00
- Audience (85) × 0.10 = 8.50
- SEO (70) × 0.05 = 3.50
- Emotional (80) × 0.05 = 4.00

**Total:** 85.00/100 (B - Very Good)

---

## AI Models Used

### GPT-5 (OpenAI)
- **Used for:** Writing quality, grammar, style
- **Strengths:** Technical writing analysis, grammar correction
- **Temperature:** 0.3 (precise, consistent)

### GPT-4o (OpenAI)
- **Used for:** SEO optimization, keyword analysis
- **Strengths:** Search optimization, metadata
- **Temperature:** 0.3

### Claude Opus 4.1 (Anthropic)
- **Used for:** Messaging effectiveness, deep reasoning
- **Strengths:** Strategic thinking, persuasion analysis
- **Temperature:** 0.4 (balanced creativity)

### Claude Sonnet 4.5 (Anthropic)
- **Used for:** Audience appropriateness, brand voice
- **Strengths:** Tone analysis, audience matching
- **Temperature:** 0.3

### Gemini 2.5 Pro (Google)
- **Used for:** Storytelling, emotional intelligence
- **Strengths:** Narrative analysis, emotional depth
- **Temperature:** 0.5 (more creative for storytelling)

---

## How to Use

### Command Line

```bash
# Basic analysis
node scripts/analyze-content-quality.js exports/document.pdf

# With specific options
node scripts/analyze-content-quality.js document.pdf \
  --target corporatePartners \
  --document-type partnershipDocument \
  --format html \
  --output reports/analysis.html

# Verbose mode
node scripts/analyze-content-quality.js document.pdf --verbose
```

### Programmatic Usage

```javascript
const ContentQualityAnalyzer = require('./scripts/lib/content-quality-analyzer');
const config = require('./config/content-quality-config.json');

const analyzer = new ContentQualityAnalyzer(config, aiClient, webSearch);

const analysis = await analyzer.analyzePDF('path/to/document.pdf', {
  targetAudience: 'corporatePartners',
  documentType: 'partnershipDocument'
});

console.log(`Overall Score: ${analysis.overallScore}/100`);
console.log(`Grade: ${analysis.grade.letter}`);
```

---

## Interpreting Results

### Issue Severity

- **Critical:** Must fix before publication (placeholders, factual errors)
- **Major:** Should fix for quality standards (weak messaging, poor structure)
- **Minor:** Nice to fix for optimization (style improvements, flow)
- **Suggestion:** Enhancement opportunities (advanced techniques)

### Recommendations Priority

1. **Immediate** (🔴): Fix before any publication
2. **Important** (🟡): Address before finalproduct
3. **Optional** (🟢): Enhancements for excellence

### When to Publish

- **90+:** Exceptional - publish immediately
- **80-89:** Very good - minor polish then publish
- **70-79:** Good - address major issues first
- **60-69:** Fair - significant improvements needed
- **<60:** Do not publish - major rewrite required

---

## Improvement Strategies

### For Low Writing Quality (<70)

1. Run grammar/spell check
2. Break long sentences (>25 words)
3. Replace passive with active voice
4. Remove weak words ("very", "really", "just")
5. Improve paragraph transitions
6. Use AI rewrite suggestions

### For Weak Messaging (<75)

1. State value proposition in paragraph 1
2. Make CTA specific and urgent
3. Add emotional appeal and benefits
4. Include social proof (testimonials, partners)
5. Focus on "you" not "we"
6. Add evidence and data

### For Poor Storytelling (<70)

1. Introduce main subject/character early
2. Define clear challenge or problem
3. Show the journey and actions taken
4. Present transformation (before/after)
5. End with impact and resolution
6. Create emotional arc

### For Missing Completeness (<90)

1. Replace ALL placeholders (XX, TBD)
2. Add actual metrics and numbers
3. Include all required elements
4. Cite sources for statistics
5. Verify facts with web search
6. Add contact information

### For Poor Audience Match (<75)

1. Adjust reading level (simplify or sophisticate)
2. Match technical depth to expertise
3. Replace non-inclusive language
4. Use appropriate tone (professional/academic/accessible)
5. Address audience priorities (ROI/methodology/impact)

---

## Integration Guide

### Into Existing Workflows

**Pre-Publication QA:**
```bash
# Add to pre-commit workflow
npm run analyze-content && git commit
```

**CI/CD Pipeline:**
```yaml
- name: Content Quality Check
  run: |
    node scripts/analyze-content-quality.js $PDF_PATH
    if [ $? -ne 0 ]; then
      echo "Content quality below threshold"
      exit 1
    fi
```

**Regular Audits:**
```bash
# Analyze all PDFs in exports/
for pdf in exports/*.pdf; do
  node scripts/analyze-content-quality.js "$pdf" --format html
done
```

### With Other Tools

- **Visual QA:** Run after `validate-pdf-quality.js`
- **Design QA:** Complement brand compliance checks
- **A/B Testing:** Compare versions before/after improvements

---

## Best Practices

1. **Run Early:** Analyze drafts before final design
2. **Iterate:** Use recommendations to improve, then re-analyze
3. **Track Scores:** Monitor quality trends over time
4. **Team Reviews:** Share HTML reports for stakeholder feedback
5. **Learn Patterns:** Identify recurring issues across documents
6. **Automate:** Integrate into publishing workflow

---

## Troubleshooting

### Low Scores Despite Good Content

- Check if content matches document type
- Verify target audience setting
- Review if TEEI brand voice applies
- Some dimensions may not be relevant

### AI Analysis Unavailable

- System works with or without AI (degraded mode)
- NLP analysis still provides value
- Consider API limits or costs

### Fact-Checking Fails

- Use `--skip-fact-check` for speed
- Web search API may be rate-limited
- Manually verify critical claims

---

## Further Reading

- `WRITING-BEST-PRACTICES.md` - TEEI writing style guide
- `TEEI_AWS_Design_Fix_Report.md` - Brand compliance guide
- `PARTNER-LOGO-INTEGRATION-GUIDE.md` - Visual quality guide
- `config/content-quality-config.json` - Full configuration reference

---

**Last Updated:** 2025-11-06
**Version:** 1.0.0
**Contact:** TEEI Content Quality Team
