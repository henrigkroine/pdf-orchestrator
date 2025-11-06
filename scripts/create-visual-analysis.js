/**
 * Create visual analysis report - converts PDF pages to images and annotates issues
 */

import { pdf } from 'pdf-to-img';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function createVisualAnalysis(pdfPath, validationReport) {
  console.log('📸 Creating visual analysis report...\n');

  const pdfName = path.basename(pdfPath, '.pdf');
  const outputDir = path.join(projectRoot, 'exports', 'visual-analysis', pdfName);
  fs.mkdirSync(outputDir, { recursive: true });

  // Convert PDF to images
  console.log('Converting PDF to images...');
  const document = await pdf(pdfPath, { scale: 2.0 });

  let pageNum = 0;
  for await (const page of document) {
    pageNum++;
    console.log(`Processing page ${pageNum}...`);

    // Load the page image
    const img = await loadImage(page);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    // Draw the original page
    ctx.drawImage(img, 0, 0);

    // Annotate issues
    const dimensionIssue = validationReport.dimensions.issues.find(i => i.page === pageNum);
    if (dimensionIssue) {
      // Draw red border for wrong dimensions
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 20;
      ctx.strokeRect(10, 10, img.width - 20, img.height - 20);

      // Add text annotation
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 40px Arial';
      ctx.fillText(`❌ WRONG SIZE: ${dimensionIssue.actual.width.toFixed(0)}×${dimensionIssue.actual.height.toFixed(0)}pt`, 50, 80);
      ctx.fillText(`Expected: ${dimensionIssue.expected.width}×${dimensionIssue.expected.height}pt (US Letter)`, 50, 140);
    }

    // Check for text cutoff warnings
    const textIssues = validationReport.textCutoffs.issues.filter(i => i.page === pageNum);
    if (textIssues.length > 0) {
      ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
      ctx.fillRect(0, 0, img.width, 100); // Top edge warning
      ctx.fillRect(0, img.height - 100, img.width, 100); // Bottom edge warning
    }

    // Save annotated image
    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(outputDir, `page-${pageNum}-annotated.png`);
    fs.writeFileSync(outputPath, buffer);
    console.log(`  ✅ Saved: page-${pageNum}-annotated.png`);
  }

  // Create summary HTML report
  const htmlReport = generateHTMLReport(pdfName, pageNum, validationReport, outputDir);
  const htmlPath = path.join(outputDir, 'analysis-report.html');
  fs.writeFileSync(htmlPath, htmlReport);
  console.log(`\n📄 HTML report created: ${htmlPath}`);

  return outputDir;
}

function generateHTMLReport(pdfName, totalPages, report, outputDir) {
  const dimensionStatus = report.dimensions.pass ? '✅ PASS' : '❌ FAIL';
  const textStatus = report.textCutoffs.pass ? '✅ PASS' : '⚠️ WARNING';
  const fontStatus = report.fonts.pass ? '✅ PASS' : '⚠️ WARNING';
  const colorStatus = report.colors.pass ? '✅ PASS' : '❌ FAIL';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Visual Analysis Report - ${pdfName}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    h1 { color: #00393F; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .summary h2 { color: #00393F; margin-top: 0; }
    .status { display: inline-block; padding: 5px 15px; border-radius: 4px; font-weight: bold; margin: 5px; }
    .pass { background: #4CAF50; color: white; }
    .fail { background: #F44336; color: white; }
    .warning { background: #FF9800; color: white; }
    .pages { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; }
    .page { background: white; padding: 15px; border-radius: 8px; }
    .page img { width: 100%; border: 1px solid #ddd; }
    .page h3 { color: #00393F; margin-top: 0; }
    .issue { background: #FFF3E0; padding: 10px; border-left: 4px solid #FF9800; margin: 10px 0; }
    .colors { display: flex; gap: 10px; flex-wrap: wrap; }
    .color-box { padding: 10px; border-radius: 4px; min-width: 150px; }
  </style>
</head>
<body>
  <h1>📊 Visual Analysis Report</h1>
  <h2>PDF: ${pdfName}</h2>

  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Total Pages:</strong> ${totalPages}</p>
    <p><strong>Page Dimensions:</strong> <span class="status ${report.dimensions.pass ? 'pass' : 'fail'}">${dimensionStatus}</span></p>
    <p><strong>Text Cutoffs:</strong> <span class="status ${report.textCutoffs.pass ? 'pass' : 'warning'}">${textStatus}</span></p>
    <p><strong>Font Usage:</strong> <span class="status ${report.fonts.pass ? 'pass' : 'warning'}">${fontStatus}</span></p>
    <p><strong>Brand Colors:</strong> <span class="status ${report.colors.pass ? 'pass' : 'fail'}">${colorStatus}</span></p>

    ${!report.dimensions.pass ? `
    <div class="issue">
      <strong>❌ Dimension Issue:</strong>
      ${report.dimensions.issues.length} page(s) have incorrect dimensions.<br>
      <strong>Actual:</strong> ${report.dimensions.issues[0].actual.width.toFixed(0)} × ${report.dimensions.issues[0].actual.height.toFixed(0)} points (A4 size)<br>
      <strong>Expected:</strong> 612 × 792 points (US Letter 8.5×11 inches)
    </div>
    ` : ''}

    ${report.colors.detected.length > 0 ? `
    <h3>Detected TEEI Brand Colors:</h3>
    <div class="colors">
      ${report.colors.detected.map(c => `
        <div class="color-box" style="background: ${c.hex}; color: white;">
          <strong>${c.name}</strong><br>
          ${c.hex}<br>
          RGB(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>

  <h2>Annotated Pages</h2>
  <div class="pages">
    ${Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
      const issue = report.dimensions.issues.find(i => i.page === pageNum);
      return `
        <div class="page">
          <h3>Page ${pageNum}</h3>
          <img src="page-${pageNum}-annotated.png" alt="Page ${pageNum}">
          ${issue ? `
            <div class="issue">
              <strong>❌ Wrong dimensions</strong><br>
              Actual: ${issue.actual.width.toFixed(0)} × ${issue.actual.height.toFixed(0)}pt<br>
              Expected: ${issue.expected.width} × ${issue.expected.height}pt
            </div>
          ` : '<p>✅ Page dimensions correct</p>'}
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;
}

// CLI usage
const pdfPath = process.argv[2];
const reportPath = process.argv[3];

if (!pdfPath || !reportPath) {
  console.error('Usage: node create-visual-analysis.js <pdf-path> <validation-report.json>');
  process.exit(1);
}

const validationReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
const outputDir = await createVisualAnalysis(pdfPath, validationReport);

console.log(`\n✅ Visual analysis complete!`);
console.log(`📂 Output directory: ${outputDir}`);
console.log(`\nOpen analysis-report.html to view the visual report.`);
