# PDF Accessibility Validation System
## Complete WCAG 2.2 Level AAA Compliance Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-06
**Target:** WCAG 2.2 Level AAA

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [WCAG 2.2 AAA Compliance](#wcag-22-aaa-compliance)
4. [AI-Powered Features](#ai-powered-features)
5. [Validation Process](#validation-process)
6. [Understanding Violations](#understanding-violations)
7. [Remediation Strategies](#remediation-strategies)
8. [Screen Reader Testing](#screen-reader-testing)
9. [Cognitive Accessibility](#cognitive-accessibility)
10. [PDF/UA Compliance](#pdfua-compliance)
11. [Best Practices](#best-practices)
12. [Usage Examples](#usage-examples)

---

## Overview

The PDF Accessibility Validation System is a comprehensive tool for ensuring PDF documents meet WCAG 2.2 Level AAA standards. It combines automated testing, AI-powered analysis, and expert remediation guidance to create accessible documents.

### Key Features

✅ **All 86 WCAG 2.2 Success Criteria**
✅ **AI-Enhanced Validation** (GPT-4o, Claude Opus 4.1, Gemini 2.5 Pro)
✅ **Pixel-Level Contrast Analysis**
✅ **Color Blindness Simulation** (8 types)
✅ **Screen Reader Simulation**
✅ **Cognitive Accessibility Assessment**
✅ **PDF/UA Standard Compliance**
✅ **Automated Remediation**
✅ **Comprehensive Reporting** (JSON, HTML, CSV)

---

## System Architecture

### Core Components

```
pdf-orchestrator/
├── scripts/
│   ├── validate-accessibility.js         # CLI tool
│   └── lib/
│       ├── accessibility-validator.js    # Main validator (1,800+ lines)
│       ├── contrast-checker.js           # Contrast analysis (700+ lines)
│       ├── structure-validator.js        # PDF structure (800+ lines)
│       ├── readability-analyzer.js       # Readability metrics (650+ lines)
│       ├── screen-reader-simulator.js    # SR simulation (750+ lines)
│       ├── cognitive-accessibility.js    # Cognitive load (600+ lines)
│       └── accessibility-remediation.js  # Auto-fix engine (700+ lines)
└── config/
    └── accessibility-config.json         # All 86 criteria (400+ lines)
```

### Technology Stack

- **PDF Analysis:** pdf-lib, pdf-parse, pdf-to-img
- **Image Processing:** sharp, canvas, pixelmatch
- **AI Models:**
  - OpenAI GPT-4o (alt text, cognitive assessment)
  - OpenAI GPT-5 (cognitive accessibility)
  - Anthropic Claude Opus 4.1 (readability)
  - Anthropic Claude Sonnet 4.5 (structure validation)
  - Google Gemini 2.5 Pro (international accessibility)
- **Color Analysis:** color-blind library
- **Browser Automation:** Playwright

---

## WCAG 2.2 AAA Compliance

### The Four Principles

#### 1. Perceivable (25 criteria)
Information must be presentable to users in ways they can perceive.

**Key Requirements:**
- Alternative text for all images (1.1.1)
- Captions and audio descriptions (1.2.x)
- Adaptable content structure (1.3.x)
- AAA contrast ratios: 7:1 normal text, 4.5:1 large text (1.4.6)
- No images of text (1.4.9)
- Proper text spacing (1.4.12)

#### 2. Operable (29 criteria)
Interface components and navigation must be operable.

**Key Requirements:**
- All functionality keyboard accessible (2.1.x)
- No time limits or adjustable (2.2.x)
- No flashing content (2.3.x)
- Multiple navigation methods (2.4.x)
- Touch targets: 44×44px for AAA (2.5.5)

#### 3. Understandable (21 criteria)
Information and operation must be understandable.

**Key Requirements:**
- Language specified (3.1.1)
- Lower secondary education reading level (3.1.5)
- Unusual words defined (3.1.3)
- Abbreviations expanded (3.1.4)
- Consistent navigation (3.2.x)
- Form labels and error suggestions (3.3.x)

#### 4. Robust (11 criteria)
Content must work with assistive technologies.

**Key Requirements:**
- Valid PDF structure (4.1.1)
- Proper name, role, value (4.1.2)
- Status messages accessible (4.1.3)

### AAA vs AA vs A

- **Level A:** Minimum accessibility (25 criteria)
- **Level AA:** Enhanced accessibility (38 criteria) - Standard for most organizations
- **Level AAA:** Optimal accessibility (86 total criteria) - Highest standard

**Important:** Not all content can achieve AAA compliance. Some criteria may conflict with content requirements.

---

## AI-Powered Features

### Multi-Model Approach

The system uses different AI models for specialized tasks:

#### GPT-4o Vision
**Purpose:** Alternative text generation and assessment

```javascript
// Generates descriptive alt text for images
const altText = await validator.generateAltText(imageData);
// Example output: "Line graph showing 45% increase in student engagement from 2023 to 2024"

// Assesses quality of existing alt text
const quality = await validator.assessAltTextQuality(altText);
// Returns: {quality: "excellent|good|fair|poor", suggestions: [...]}
```

**Best For:**
- Image description
- Chart and graph analysis
- Color usage patterns
- Visual element identification

#### Claude Opus 4.1
**Purpose:** Readability and plain language analysis

```javascript
// Analyzes text readability
const readability = await validator.analyzeReadability(text);
// Returns: {grade: 8.5, needsSimplification: false, suggestions: [...]}
```

**Best For:**
- Complex sentence detection
- Jargon identification
- Plain language recommendations
- Reading level assessment

#### Claude Sonnet 4.5
**Purpose:** Structure and semantic validation

```javascript
// Validates document structure
const structure = await validator.validateStructure(pdfData);
// Returns: {wellStructured: true, issues: []}
```

**Best For:**
- Heading hierarchy analysis
- Logical flow validation
- Semantic structure checking

#### GPT-5
**Purpose:** Cognitive accessibility analysis

```javascript
// Assesses cognitive load
const cognitive = await validator.assessCognitiveLoad(content);
// Returns: {load: "low|moderate|high", recommendations: [...]}
```

**Best For:**
- Cognitive load estimation
- Memory demand analysis
- Attention span considerations
- Complex pattern detection

#### Gemini 2.5 Pro
**Purpose:** International and cultural accessibility

```javascript
// Validates international accessibility
const international = await validator.validateInternational(pdfData);
// Returns: {language: "en-US", rtlSupport: false, culturalIssues: []}
```

**Best For:**
- Language detection
- Right-to-left support
- Cultural sensitivity
- Translation quality

### AI Insights in Reports

AI insights are included in validation reports:

```json
{
  "aiInsights": [
    {
      "criterion": "1.1.1",
      "model": "gpt-4o",
      "assessment": "Assessed 10 images. 2 need more descriptive alt text.",
      "suggestions": [
        "Image 3: Be more specific about the chart data",
        "Image 7: Describe the people's actions, not just their presence"
      ]
    },
    {
      "criterion": "3.1.5",
      "model": "claude-opus-4.1",
      "assessment": "Reading level: Grade 10.2. 15 complex sentences detected.",
      "needsSimplification": true,
      "suggestions": [
        "Break sentence starting with 'Furthermore...' into two sentences",
        "Replace 'utilize' with 'use' throughout document",
        "Define technical terms on first use"
      ]
    }
  ]
}
```

---

## Validation Process

### Step-by-Step Validation

#### 1. Basic Usage

```bash
# Validate PDF with default AAA level
node scripts/validate-accessibility.js document.pdf

# Validate with AA level
node scripts/validate-accessibility.js document.pdf --level AA

# Disable AI features (faster, less comprehensive)
node scripts/validate-accessibility.js document.pdf --no-ai

# Generate all output formats
node scripts/validate-accessibility.js document.pdf --output all

# Enable color blindness simulations
node scripts/validate-accessibility.js document.pdf --color-blindness

# Enable screen reader simulation
node scripts/validate-accessibility.js document.pdf --screen-reader

# Generate remediation plan
node scripts/validate-accessibility.js document.pdf --remediate
```

#### 2. Validation Phases

**Phase 1: Document Loading**
- Load PDF structure
- Parse metadata
- Extract text content
- Identify images and multimedia

**Phase 2: Automated Checks**
- Color contrast (pixel-level analysis)
- Text sizes and spacing
- PDF structure and tags
- Reading order
- Form field labels
- Language attributes

**Phase 3: AI-Enhanced Checks**
- Alt text quality assessment
- Readability analysis
- Sensory instruction detection
- Cognitive load evaluation
- Structure validation

**Phase 4: Specialized Analysis**
- Screen reader simulation
- Color blindness simulation
- Touch target measurement
- Keyboard accessibility check

**Phase 5: Scoring and Reporting**
- Calculate accessibility score (0-100)
- Classify violations by severity
- Generate remediation recommendations
- Create comprehensive reports

#### 3. Output Files

All validation results are saved to `exports/accessibility-reports/`:

- **JSON Report:** Complete validation data
- **HTML Report:** Visual, interactive report
- **CSV Report:** Spreadsheet-compatible data
- **Remediation Plan:** Step-by-step fix instructions (if `--remediate` used)

---

## Understanding Violations

### Severity Levels

#### Critical (Score Impact: -20 points each)
**Blocks access** for users with disabilities. Must be fixed immediately.

**Examples:**
- Missing alternative text (1.1.1)
- Insufficient color contrast (1.4.3)
- No document language (3.1.1)
- Invalid PDF structure (4.1.1)
- Missing form labels (3.3.2)

**Fix Priority:** 🔴 **IMMEDIATE**

#### Major (Score Impact: -10 points each)
**Significantly impacts** usability. Fix soon.

**Examples:**
- Poor heading hierarchy (2.4.6)
- Small touch targets (2.5.8)
- Insufficient text spacing (1.4.12)
- No document title (2.4.2)
- Illogical reading order (1.3.2)

**Fix Priority:** 🟠 **HIGH**

#### Moderate (Score Impact: -5 points each)
**Causes inconvenience** but has workarounds. Improve when possible.

**Examples:**
- AAA contrast violations (1.4.6) when AA is met
- Long paragraphs (3.1.5)
- Complex language (3.1.5)
- Missing landmarks (2.4.1)
- Non-descriptive headings (2.4.6)

**Fix Priority:** 🟡 **MEDIUM**

#### Minor (Score Impact: -2 points each)
**Best practice** violations. Minimal impact.

**Examples:**
- Borderline contrast ratios
- Decorative images with alt text
- Suboptimal text alignment (1.4.8)
- Minor spacing inconsistencies

**Fix Priority:** ⚪ **LOW**

### Accessibility Score Scale

- **100:** Perfect (AAA compliant, no violations)
- **95-99:** Excellent (Minor improvements possible)
- **90-94:** Good (AAA compliant with small issues)
- **85-89:** Acceptable (AA compliant, AAA improvements needed)
- **70-84:** Needs Improvement (Multiple violations)
- **<70:** Poor (Critical accessibility barriers)

**Compliance Threshold:**
- **AAA:** Score ≥90 + Zero critical/major violations
- **AA:** Score ≥85 + Zero critical violations
- **A:** Score ≥70 + Addressed all Level A criteria

---

## Remediation Strategies

### Automated vs Manual Fixes

#### Automated Fixes ✅

The remediation engine can automatically fix:

1. **Missing Document Title** (2.4.2)
   ```javascript
   // Auto-generates from filename
   pdfDoc.setTitle("TEEI AWS Partnership Document");
   ```

2. **Missing Language** (3.1.1)
   ```javascript
   // Sets to English (can be customized)
   pdfDoc.setLanguage("en-US");
   ```

3. **Basic PDF Structure** (4.1.1)
   ```javascript
   // Adds structure tree root
   pdfDoc.addStructureTree();
   ```

4. **Alternative Text** (1.1.1) - **AI-Powered**
   ```javascript
   // GPT-4o Vision generates descriptions
   const altText = await generateAltTextWithAI(imageData);
   // "Diverse group of students collaborating on laptops in bright classroom"
   ```

#### Manual Fixes Required ⚠️

These require content editing:

1. **Color Contrast** (1.4.3, 1.4.6)
   - **Why:** Requires design decisions
   - **How:** Adjust text or background colors
   - **Tool:** Use built-in contrast checker to test alternatives

2. **Heading Hierarchy** (2.4.6)
   - **Why:** Requires content restructuring
   - **How:** Reorganize headings (h1 → h2 → h3, no skipping)
   - **Tool:** Screen reader navigation test

3. **Reading Order** (1.3.2)
   - **Why:** Requires PDF re-tagging
   - **How:** Use Adobe Acrobat Pro's Reading Order tool
   - **Validation:** Screen reader simulation

4. **Readability** (3.1.5)
   - **Why:** Requires rewriting content
   - **How:** Simplify language, shorten sentences
   - **Target:** Grade 8-9 reading level
   - **AI Help:** Claude Opus 4.1 provides specific suggestions

5. **Touch Targets** (2.5.5, 2.5.8)
   - **Why:** Requires layout changes
   - **How:** Increase button/link sizes
   - **Minimum:** 24×24px (AA), 44×44px (AAA)

### Violation-Specific Remediation

#### 1.1.1: Non-text Content
**Violation:** Images without alt text

**Fix:**
```javascript
// Use AI to generate
const altText = await generateAltTextWithAI(image);

// Or manually write:
// - Be specific and concise (≤150 chars)
// - Describe function, not just appearance
// - For decorative images: alt=""
```

**Good Alt Text:**
- ✅ "Bar chart showing 45% increase in student enrollment 2023-2024"
- ✅ "TEEI logo with tagline 'Transforming Education'"

**Bad Alt Text:**
- ❌ "Image" (too generic)
- ❌ "chart.png" (filename)
- ❌ "A very detailed and comprehensive visualization depicting..." (too long)

#### 1.4.3/1.4.6: Contrast (Minimum/Enhanced)
**Violation:** Insufficient color contrast

**Fix:**
```javascript
// Check current contrast
const contrast = calculateContrast(textColor, backgroundColor);
// Result: 3.2:1 (Fails AA 4.5:1)

// Adjust colors
const newTextColor = darkenColor(textColor, 20%);
const newContrast = calculateContrast(newTextColor, backgroundColor);
// Result: 5.1:1 (Passes AA, but not AAA 7:1)

// For AAA compliance
const aaaTextColor = darkenColor(textColor, 40%);
// Result: 7.2:1 (Passes AAA)
```

**TEEI Brand Colors - Accessible Combinations:**
- ✅ Nordshore (#00393F) on White: 15.3:1 (AAA)
- ✅ Nordshore (#00393F) on Sand (#FFF1E2): 13.8:1 (AAA)
- ⚠️ Gold (#BA8F5A) on White: 4.6:1 (AA, not AAA)
- ❌ Sky (#C9E4EC) on White: 1.3:1 (Fails)

#### 2.4.6: Headings and Labels
**Violation:** Poor heading hierarchy

**Fix:**
```
❌ Bad Hierarchy:
h1 "TEEI AWS Partnership"
h3 "Program Overview" (skipped h2!)
h2 "Student Success" (went backwards!)
h4 "Metrics"

✅ Good Hierarchy:
h1 "TEEI AWS Partnership"
h2 "Program Overview"
h3 "Student Success"
h4 "Metrics"
h4 "Outcomes"
h3 "Future Plans"
h2 "Get Involved"
```

**Rules:**
1. Exactly one h1 per document
2. Don't skip levels (h1 → h2 → h3, not h1 → h3)
3. Can go backwards (h4 → h2 is OK)
4. Headings describe content (not "Click here")

#### 3.1.5: Reading Level
**Violation:** Text above lower secondary education level (Grade 9+)

**Fix:**
```
❌ Before (Grade 12):
"The Educational Equality Institute's collaborative partnership with Amazon Web Services facilitates the implementation of innovative pedagogical methodologies through leveraging cloud infrastructure to deliver transformative learning experiences for economically disadvantaged student populations."

✅ After (Grade 8):
"TEEI partners with Amazon Web Services (AWS) to bring better education to low-income students. We use AWS's cloud technology to create new ways of teaching that really work."
```

**Simplification Strategies:**
- Break long sentences (1 idea per sentence)
- Replace complex words ("utilize" → "use")
- Active voice ("Students learn" vs "Learning is facilitated")
- Define acronyms on first use
- Use lists instead of dense paragraphs

**AI Help:**
```javascript
const suggestions = await analyzeReadabilityWithAI(text);
// Returns specific suggestions:
// - "Line 15: Break into 2 sentences at 'Furthermore'"
// - "Replace 'pedagogical' with 'teaching'"
// - "Define 'AWS' on first use"
```

---

## Screen Reader Testing

### Why Screen Readers Matter

- **26 million** Americans are blind or have low vision
- **Screen readers** announce content based on PDF structure
- **Without proper structure**, content is unintelligible

### Screen Reader Simulation

The validator simulates how screen readers interpret PDFs:

```javascript
const srOutput = await simulateScreenReader(pdfDoc);

// Example output:
[
  "Document: TEEI AWS Partnership Document",
  "Heading level 1: Partnership Overview",
  "Paragraph: TEEI and AWS are working together...",
  "Image: Bar chart showing student enrollment growth",
  "Link: Learn more about our programs",
  "Heading level 2: Student Success Stories",
  ...
]
```

### Common Screen Reader Issues

#### Issue 1: No Document Title
**Screen Reader Says:** "Untitled Document"
**User Experience:** Confusing, can't identify document
**Fix:** Add title in PDF properties

#### Issue 2: Missing Alt Text
**Screen Reader Says:** "Image" or "Graphic"
**User Experience:** No idea what image shows
**Fix:** Add descriptive alt text

#### Issue 3: Poor Heading Structure
**Screen Reader Says:** "Heading level 3... Heading level 1"
**User Experience:** Confusing navigation, can't understand hierarchy
**Fix:** Fix heading order (h1 → h2 → h3)

#### Issue 4: Illogical Reading Order
**Screen Reader Says:** "See sidebar... Main content... Back to sidebar"
**User Experience:** Content jumps around confusingly
**Fix:** Fix PDF reading order tags

### Testing with Real Screen Readers

**Recommended Screen Readers:**
- **JAWS** (Windows) - Most popular, $1000+
- **NVDA** (Windows) - Free, excellent
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in

**Basic Testing:**
1. Open PDF in screen reader
2. Listen to entire document
3. Navigate by headings (H key in JAWS/NVDA)
4. Tab through interactive elements
5. Check if all content is announced
6. Verify reading order makes sense

---

## Cognitive Accessibility

### Understanding Cognitive Load

**Miller's Law:** Working memory holds 7±2 items simultaneously.

**Cognitive Accessibility** means reducing mental effort required to:
- Understand content
- Remember information
- Navigate document
- Complete tasks

### Cognitive Load Analysis

The system calculates cognitive load based on:

```javascript
const cognitive = await analyzeCognitive(pdfData);

// Results:
{
  cognitiveLoad: {
    totalChunks: 45,              // Information units
    avgChunksPerParagraph: 6.2,   // Per paragraph
    exceedsCapacity: false,        // 6.2 < 7
    level: "moderate"              // low|moderate|high
  },
  memoryLoad: {
    items: 12,                     // Things to remember
    lists: 3,                      // Lists
    references: 8,                 // "See above"
    acronyms: 5,                   // TLA, FLA
    level: "high"                  // Exceeds 5-item limit
  },
  attentionDemands: {
    longParagraphs: 7,             // >200 words
    longSentences: 15,             // >25 words
    level: "high"
  },
  score: 65                        // 0-100
}
```

### Reducing Cognitive Load

#### 1. Break Up Content

❌ **High Cognitive Load:**
```
The Educational Equality Institute, founded in 2018 as a response to the growing educational disparity among economically disadvantaged communities particularly those affected by the ongoing conflict in Ukraine and other regions experiencing humanitarian crises, has developed a comprehensive suite of programs including cloud-based learning management systems, AI-powered tutoring platforms, and collaborative workspace solutions that leverage cutting-edge technology from partners like Amazon Web Services, Google Cloud Platform, and Microsoft Azure to deliver transformative educational experiences that research has shown to improve student outcomes by as much as 45% over traditional teaching methods when implemented correctly with proper teacher training and ongoing technical support which our team of experienced educators and technologists provides to all partner schools through a combination of on-site visits, virtual training sessions, and 24/7 helpdesk support.
```
*Cognitive Load: 37 chunks in 1 paragraph* ❌

✅ **Low Cognitive Load:**
```
The Educational Equality Institute (TEEI) was founded in 2018. Our mission is to help students in crisis regions like Ukraine.

We provide three main services:
1. Cloud-based learning systems
2. AI tutoring
3. Collaborative tools

We partner with leading tech companies:
- Amazon Web Services (AWS)
- Google Cloud Platform (GCP)
- Microsoft Azure

Results show 45% better student outcomes compared to traditional methods.

We support partner schools with:
- On-site training
- Virtual sessions
- 24/7 helpdesk
```
*Cognitive Load: 15 chunks across 6 sections* ✅

#### 2. Use Visual Hierarchy

```
❌ Bad:
Long paragraphs
No headings
No whitespace
Everything looks the same

✅ Good:
# Clear Headings
Short paragraphs (2-3 sentences)

Bullet lists for related items:
• Item 1
• Item 2
• Item 3

Generous whitespace between sections
```

#### 3. Minimize Memory Demands

❌ **High Memory Load:**
```
Our three programs (described earlier in the document) work together with the five core principles (see section 2.3) to achieve the goals outlined in our mission statement (page 1) through the implementation framework detailed in Appendix B.
```
*Memory items required: 3 programs, 5 principles, mission statement, framework = 4+ things to remember/look up* ❌

✅ **Low Memory Load:**
```
Our three programs work together:
1. Cloud Learning System
2. AI Tutoring
3. Collaborative Tools

These support five core principles:
1. Access
2. Quality
3. Equity
4. Innovation
5. Partnership
```
*No cross-references, all info present* ✅

#### 4. Define Terms

❌ **Assumes Knowledge:**
```
We leverage LMS, LXP, and SCORM-compliant content via our API to our SIS.
```
*Acronyms: 5 undefined*

✅ **Clear:**
```
We use a Learning Management System (LMS) to deliver course content. Our system connects to your existing student database through a secure API (Application Programming Interface).
```
*Acronyms: 2 defined on first use*

### Cognitive Accessibility Score

- **90-100:** Excellent cognitive accessibility
- **70-89:** Good, minor improvements possible
- **50-69:** Moderate cognitive load
- **<50:** High cognitive load, simplification needed

---

## PDF/UA Compliance

### What is PDF/UA?

**PDF/UA (Universal Accessibility)** is the ISO standard (14289-1) for accessible PDFs.

**PDF/UA Requirements:**
1. ✅ **Tagged PDF** - All content marked with structure tags
2. ✅ **Logical Reading Order** - Content flows logically
3. ✅ **Language Specified** - Document language attribute
4. ✅ **Document Title** - Title in properties (not filename)
5. ✅ **Alt Text** - All images have descriptions
6. ⚠️ **Bookmarks** - Recommended for navigation (optional)
7. ⚠️ **Abbreviations** - Expanded in structure (optional)

### Checking PDF/UA Compliance

```javascript
const pdfUA = await validatePDFUA(pdfDoc);

// Results:
{
  enabled: true,
  compliant: false,
  requirements: {
    tagged: {
      required: true,
      passes: false,
      message: "PDF is not tagged"
    },
    logicalReadingOrder: {
      required: true,
      passes: false,
      message: "Reading order has issues"
    },
    languageSpecified: {
      required: true,
      passes: true,
      message: "Language: en-US"
    },
    documentTitle: {
      required: true,
      passes: true,
      message: "Title: TEEI AWS Partnership"
    },
    alternativeDescriptions: {
      required: true,
      passes: false,
      message: "3 images missing alt text"
    }
  },
  violations: [
    "PDF must be tagged for PDF/UA compliance",
    "PDF must have logical reading order",
    "All images must have alternative descriptions"
  ]
}
```

### Creating PDF/UA Documents

**Option 1: Source Document (Recommended)**
Start with accessible source (Word, InDesign):
1. Use proper heading styles
2. Add alt text to images
3. Use lists, tables properly
4. Export as Tagged PDF

**Option 2: Retroactive Tagging**
Add tags to existing PDF (Adobe Acrobat Pro):
1. Tools → Accessibility → Autotag Document
2. Check & fix Reading Order
3. Add alt text via Accessibility Panel
4. Run Full Check
5. Fix all issues

**Option 3: Automated Remediation**
```bash
node scripts/validate-accessibility.js document.pdf --remediate
# Applies automated fixes
# Generates manual fix instructions
```

---

## Best Practices

### Before Creating PDFs

1. **Start with accessible source documents**
   - Use semantic headings (not just bold text)
   - Add alt text in source application
   - Use proper list formatting
   - Structure tables correctly

2. **Choose fonts carefully**
   - Minimum 11pt body text
   - Sans-serif for body (Roboto, Arial)
   - Serif for headings OK (Lora, Georgia)
   - Avoid decorative fonts

3. **Plan for contrast**
   - Test color combinations early
   - Use TEEI brand colors properly
   - Avoid light gray text (#999 and lighter)

### During PDF Creation

1. **Export settings**
   - ✅ Enable "Create Tagged PDF"
   - ✅ Set document language
   - ✅ Include document title
   - ✅ Embed fonts
   - ❌ Don't flatten layers

2. **InDesign specific**
   - Use Paragraph Styles for headings
   - Export Order: "Same as Articles"
   - Object Export Options for images
   - Check "Create Tagged PDF"

3. **Word specific**
   - Use built-in Heading styles
   - Add alt text via "Alt Text" pane
   - Save as "PDF/A" for archival

### After Creating PDFs

1. **Always validate**
   ```bash
   node scripts/validate-accessibility.js output.pdf
   ```

2. **Test with screen reader**
   - Open in NVDA (free)
   - Listen to entire document
   - Check reading order

3. **Check at 200% zoom**
   - Verify no text cutoff
   - Confirm layout still works
   - Test navigation

4. **Get user feedback**
   - Users with disabilities
   - Various assistive technologies
   - Different devices

### Common Mistakes to Avoid

❌ **Using images of text**
- Makes text non-selectable
- Can't be read by screen readers
- Doesn't scale well

✅ **Use actual text with styling**

---

❌ **Skipping heading levels**
- Confusing for screen reader users
- Breaks document outline

✅ **Proper hierarchy: h1 → h2 → h3**

---

❌ **"Click here" links**
- Screen reader users navigate by links
- No context out of context

✅ **Descriptive: "View TEEI Programs"**

---

❌ **Color-only information**
- Color-blind users can't distinguish
- Fails WCAG 1.4.1

✅ **Color + text labels/icons**

---

❌ **Tiny touch targets**
- Hard to tap on mobile
- Issues for motor impairments

✅ **Minimum 44×44px (AAA)**

---

## Usage Examples

### Example 1: Basic Validation

```bash
# Validate with default AAA level
node scripts/validate-accessibility.js exports/TEEI_AWS.pdf

# Output:
# 🔍 Starting comprehensive WCAG 2.2 AAA validation...
#
# 📋 Validating Principle 1: Perceivable...
# 📋 Validating Principle 2: Operable...
# 📋 Validating Principle 3: Understandable...
# 📋 Validating Principle 4: Robust...
# 📋 Validating PDF/UA compliance...
#
# ✅ Validation complete! Score: 78/100 (C)
#
# SUMMARY:
# Score: 78/100 (C - Acceptable)
# WCAG AAA Compliant: NO
# Passed: 52/86 criteria
# Violations: 12 (2 critical, 5 major, 4 moderate, 1 minor)
```

### Example 2: Remediation Workflow

```bash
# Step 1: Validate and generate remediation plan
node scripts/validate-accessibility.js exports/TEEI_AWS.pdf --remediate

# Step 2: Review remediation plan
cat exports/accessibility-reports/TEEI_AWS-remediation-*.md

# Step 3: Apply automated fixes
node scripts/remediate-pdf.js exports/TEEI_AWS.pdf

# Step 4: Manually fix remaining issues
# (Follow remediation plan)

# Step 5: Re-validate
node scripts/validate-accessibility.js exports/TEEI_AWS-remediated.pdf

# Result: Score improved from 78 to 92!
```

### Example 3: Color Blindness Testing

```bash
# Generate color blindness simulations
node scripts/validate-accessibility.js exports/TEEI_AWS.pdf --color-blindness

# Creates 8 simulated versions:
# exports/accessibility-reports/simulations/
#   ├── page-1-protanopia.png (red-blind)
#   ├── page-1-deuteranopia.png (green-blind)
#   ├── page-1-tritanopia.png (blue-blind)
#   ├── page-1-protanomaly.png (red-weak)
#   ├── page-1-deuteranomaly.png (green-weak)
#   ├── page-1-tritanomaly.png (blue-weak)
#   ├── page-1-achromatopsia.png (complete color blindness)
#   └── page-1-achromatomaly.png (partial color blindness)

# Review to ensure colors remain distinguishable
```

### Example 4: Screen Reader Simulation

```bash
# Simulate screen reader output
node scripts/validate-accessibility.js exports/TEEI_AWS.pdf --screen-reader

# Generates: exports/accessibility-reports/screen-reader-output.txt

# Content:
# Document: TEEI AWS Partnership Document
# Heading level 1: Transforming Education Together
# Paragraph: The Educational Equality Institute partners with...
# Image: Bar chart showing 45% increase in student engagement
# Heading level 2: Our Programs
# List with 3 items
# List item: Cloud Learning Platform
# List item: AI Tutoring System
# List item: Collaborative Workspace
# ...
```

### Example 5: CI/CD Integration

```yaml
# .github/workflows/accessibility.yml
name: Accessibility Testing

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Validate PDF Accessibility
        run: |
          node scripts/validate-accessibility.js exports/*.pdf \
            --level AAA \
            --output json

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: accessibility-reports
          path: exports/accessibility-reports/

      - name: Fail on Critical Issues
        run: |
          if grep -q "\"critical\": [1-9]" exports/accessibility-reports/*.json; then
            echo "❌ Critical accessibility issues found!"
            exit 1
          fi
```

---

## Getting Help

### Resources

- **WCAG 2.2 Quick Reference:** https://www.w3.org/WAI/WCAG22/quickref/
- **PDF/UA Standard:** https://www.pdfa.org/pdfua-the-iso-standard-for-universal-accessibility/
- **WebAIM:** https://webaim.org/
- **Deque University:** https://dequeuniversity.com/

### Support

For questions about this system:
1. Check `docs/WCAG-2.2-CHECKLIST.md` for specific criteria
2. Review validation reports for detailed guidance
3. Consult remediation plans for fix instructions

---

**Last Updated:** 2025-11-06
**System Version:** 1.0.0
**WCAG Version:** 2.2 (June 2023)
