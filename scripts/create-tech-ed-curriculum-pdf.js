const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');

const DOCX_PATH = 'T:\\TEEI\\Erasmus\\TECH-Ed Curriculum.docx';
const OUTPUT_HTML = 'T:\\Projects\\pdf-orchestrator\\exports\\tech-ed-curriculum.html';
const OUTPUT_PDF = 'T:\\Projects\\pdf-orchestrator\\exports\\tech-ed-curriculum.pdf';

// TEEI Brand Colors
const TEEI_COLORS = {
  nordshore: '#00393F',
  sky: '#C9E4EC',
  sand: '#FFF1E2',
  gold: '#BA8F5A',
  moss: '#65873B',
  clay: '#913B2F'
};

// Module-specific accent colors (varied for visual distinction)
const MODULE_COLORS = [
  TEEI_COLORS.nordshore,  // Module 1
  TEEI_COLORS.moss,       // Module 2
  TEEI_COLORS.gold,       // Module 3
  TEEI_COLORS.clay,       // Module 4
  '#2E7D99',              // Module 5 (custom blue)
  '#8B4513',              // Module 6 (custom brown)
  '#4A6D7C'               // Module 7 (custom teal)
];

async function generateCurriculum() {
  console.log('🚀 Starting TECH-Ed Curriculum PDF Generation...\n');

  // Step 1: Extract content from Word document
  console.log('📄 Extracting content from Word document...');
  const result = await mammoth.extractRawText({ path: DOCX_PATH });
  const fullText = result.value;
  const lines = fullText.split('\n').filter(line => line.trim());

  console.log(`✅ Extracted ${lines.length} lines of content\n`);

  // Step 2: Parse structure
  console.log('🔍 Parsing document structure...');
  const sections = parseDocumentStructure(lines);
  console.log(`✅ Found ${sections.length} sections\n`);

  // Step 3: Generate HTML with varied page designs
  console.log('🎨 Generating HTML with varied page designs...');
  const html = generateHTML(sections);

  await fs.writeFile(OUTPUT_HTML, html, 'utf-8');
  console.log(`✅ HTML saved: ${OUTPUT_HTML}\n`);

  // Step 4: Convert to PDF
  console.log('📋 Converting to PDF...');
  await convertToPDF(OUTPUT_HTML, OUTPUT_PDF);
  console.log(`✅ PDF created: ${OUTPUT_PDF}\n`);

  console.log('🎉 TECH-Ed Curriculum PDF generation complete!');
}

function parseDocumentStructure(lines) {
  const sections = [];
  let currentSection = null;
  let moduleIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect major headings
    if (trimmed === 'TECH-Ed Curriculum') {
      currentSection = { type: 'cover', title: trimmed, content: [] };
      sections.push(currentSection);
    } else if (trimmed === 'Executive Summary') {
      currentSection = { type: 'executive', title: trimmed, content: [] };
      sections.push(currentSection);
    } else if (trimmed === 'Table of Contents') {
      currentSection = { type: 'toc', title: trimmed, content: [] };
      sections.push(currentSection);
    } else if (trimmed.startsWith('Module ') && trimmed.includes('�')) {
      moduleIndex++;
      currentSection = {
        type: 'module',
        title: trimmed,
        content: [],
        moduleNumber: moduleIndex,
        color: MODULE_COLORS[moduleIndex - 1] || TEEI_COLORS.nordshore
      };
      sections.push(currentSection);
    } else if (['Overview', 'Goals', 'Target Audience', 'Delivery Approach', 'Duration', 'Structure', 'Module Descriptions'].includes(trimmed)) {
      currentSection = { type: 'overview', title: trimmed, content: [] };
      sections.push(currentSection);
    } else if (['Certification Tracks', 'Core Platforms and Tools', 'Implementation Plan', 'Assessment & Feedback', 'Sustainability', 'Curriculum and Project Objectives'].includes(trimmed)) {
      currentSection = { type: 'implementation', title: trimmed, content: [] };
      sections.push(currentSection);
    } else if (currentSection && trimmed.length > 0) {
      currentSection.content.push(trimmed);
    }
  }

  return sections;
}

function generateHTML(sections) {
  const styles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Roboto+Flex:wght@400;500;600&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Roboto Flex', sans-serif;
        color: #333;
        line-height: 1.6;
      }

      .page {
        width: 8.5in;
        height: 11in;
        page-break-after: always;
        position: relative;
        overflow: hidden;
      }

      .page:last-child {
        page-break-after: avoid;
      }

      /* Cover Page */
      .cover-page {
        background: linear-gradient(135deg, ${TEEI_COLORS.nordshore} 0%, ${TEEI_COLORS.sky} 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 2in 1in;
        color: white;
      }

      .cover-title {
        font-family: 'Lora', serif;
        font-size: 72pt;
        font-weight: 700;
        margin-bottom: 0.5in;
        text-shadow: 2px 2px 8px rgba(0,0,0,0.3);
      }

      .cover-subtitle {
        font-size: 24pt;
        font-weight: 300;
        margin-bottom: 1in;
        opacity: 0.95;
      }

      .cover-org {
        font-size: 18pt;
        font-weight: 500;
        padding: 20px 40px;
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
        backdrop-filter: blur(10px);
      }

      /* Executive Summary Page */
      .executive-page {
        background: ${TEEI_COLORS.sand};
        padding: 0.75in 1in;
      }

      .executive-header {
        background: ${TEEI_COLORS.nordshore};
        color: white;
        padding: 30px 40px;
        margin: -0.75in -1in 40px -1in;
      }

      .executive-header h1 {
        font-family: 'Lora', serif;
        font-size: 42pt;
        font-weight: 700;
      }

      .executive-content {
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-size: 12pt;
        line-height: 1.8;
      }

      .executive-content p {
        margin-bottom: 16px;
      }

      /* Table of Contents Page */
      .toc-page {
        padding: 0.75in 1in;
        background: linear-gradient(to bottom, ${TEEI_COLORS.sand} 0%, white 100%);
      }

      .toc-header {
        font-family: 'Lora', serif;
        font-size: 42pt;
        color: ${TEEI_COLORS.nordshore};
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 3px solid ${TEEI_COLORS.gold};
      }

      .toc-list {
        list-style: none;
        font-size: 14pt;
      }

      .toc-list li {
        padding: 12px 0;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
      }

      .toc-list li:hover {
        background: rgba(0,57,63,0.05);
        padding-left: 10px;
      }

      .toc-number {
        color: ${TEEI_COLORS.gold};
        font-weight: 600;
        margin-right: 15px;
      }

      /* Overview Pages */
      .overview-page {
        padding: 0.75in 1in;
        background: white;
      }

      .overview-header {
        font-family: 'Lora', serif;
        font-size: 36pt;
        color: ${TEEI_COLORS.nordshore};
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 2px solid ${TEEI_COLORS.sky};
      }

      .overview-content {
        font-size: 11pt;
        line-height: 1.7;
        column-count: 2;
        column-gap: 40px;
      }

      .overview-content p {
        margin-bottom: 14px;
        break-inside: avoid;
      }

      /* Module Pages (Varied Designs) */
      .module-page {
        padding: 0;
        position: relative;
      }

      .module-sidebar {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 0.75in;
        background: var(--module-color);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .module-number {
        color: white;
        font-family: 'Lora', serif;
        font-size: 48pt;
        font-weight: 700;
        writing-mode: vertical-rl;
        transform: rotate(180deg);
      }

      .module-content-wrapper {
        margin-left: 0.75in;
        padding: 0.75in 1in;
        min-height: 11in;
      }

      .module-title {
        font-family: 'Lora', serif;
        font-size: 36pt;
        color: var(--module-color);
        margin-bottom: 30px;
        line-height: 1.2;
      }

      .module-content {
        font-size: 11pt;
        line-height: 1.7;
      }

      .module-content p {
        margin-bottom: 14px;
      }

      .module-content ul, .module-content ol {
        margin-left: 30px;
        margin-bottom: 14px;
      }

      .module-content li {
        margin-bottom: 8px;
      }

      /* Implementation Pages */
      .implementation-page {
        padding: 0.75in 1in;
        background: linear-gradient(to bottom right, white 0%, ${TEEI_COLORS.sand} 100%);
      }

      .implementation-header {
        font-family: 'Lora', serif;
        font-size: 32pt;
        color: ${TEEI_COLORS.nordshore};
        margin-bottom: 25px;
        padding: 20px;
        background: white;
        border-left: 5px solid ${TEEI_COLORS.gold};
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }

      .implementation-content {
        font-size: 11pt;
        line-height: 1.7;
        background: white;
        padding: 30px;
        border-radius: 8px;
      }

      .implementation-content p {
        margin-bottom: 14px;
      }

      .implementation-content ul {
        margin-left: 25px;
        margin-bottom: 14px;
      }

      .implementation-content li {
        margin-bottom: 8px;
      }

      /* Page Numbers */
      .page-number {
        position: absolute;
        bottom: 0.5in;
        right: 1in;
        font-size: 10pt;
        color: #666;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .page {
          page-break-after: always;
        }
      }
    </style>
  `;

  let pageNumber = 0;
  const pages = sections.map((section, index) => {
    pageNumber++;

    switch(section.type) {
      case 'cover':
        return `
          <div class="page cover-page">
            <div class="cover-title">TECH-Ed<br/>Curriculum</div>
            <div class="cover-subtitle">Technology-Enhanced Teaching & Learning</div>
            <div class="cover-org">The Educational Equality Institute<br/>Erasmus+ Programme</div>
          </div>
        `;

      case 'executive':
        return `
          <div class="page executive-page">
            <div class="executive-header">
              <h1>${section.title}</h1>
            </div>
            <div class="executive-content">
              ${section.content.map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="page-number">Page ${pageNumber}</div>
          </div>
        `;

      case 'toc':
        return `
          <div class="page toc-page">
            <h1 class="toc-header">${section.title}</h1>
            <ul class="toc-list">
              ${sections.filter(s => s.title && s.type !== 'cover').map((s, i) =>
                `<li><span><span class="toc-number">${i+1}.</span>${s.title}</span></li>`
              ).join('')}
            </ul>
            <div class="page-number">Page ${pageNumber}</div>
          </div>
        `;

      case 'overview':
        return `
          <div class="page overview-page">
            <h1 class="overview-header">${section.title}</h1>
            <div class="overview-content">
              ${section.content.map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="page-number">Page ${pageNumber}</div>
          </div>
        `;

      case 'module':
        return `
          <div class="page module-page" style="--module-color: ${section.color}">
            <div class="module-sidebar">
              <div class="module-number">M${section.moduleNumber}</div>
            </div>
            <div class="module-content-wrapper">
              <h1 class="module-title">${section.title}</h1>
              <div class="module-content">
                ${section.content.map(p => `<p>${p}</p>`).join('')}
              </div>
            </div>
            <div class="page-number">Page ${pageNumber}</div>
          </div>
        `;

      case 'implementation':
        return `
          <div class="page implementation-page">
            <h1 class="implementation-header">${section.title}</h1>
            <div class="implementation-content">
              ${section.content.map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="page-number">Page ${pageNumber}</div>
          </div>
        `;

      default:
        return `
          <div class="page">
            <h1>${section.title || 'Untitled'}</h1>
            ${section.content.map(p => `<p>${p}</p>`).join('')}
            <div class="page-number">Page ${pageNumber}</div>
          </div>
        `;
    }
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TECH-Ed Curriculum</title>
  ${styles}
</head>
<body>
  ${pages}
</body>
</html>`;
}

async function convertToPDF(htmlPath, pdfPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`);

  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });

  await browser.close();
}

// Run the generator
generateCurriculum().catch(console.error);
