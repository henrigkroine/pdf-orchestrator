/**
 * Convert HTML to PDF using Playwright
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function htmlToPDF(htmlPath, outputPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Load HTML file
  const htmlFile = 'file://' + htmlPath.replace(/\\/g, '/');
  console.log(`📄 Loading: ${htmlFile}`);

  await page.goto(htmlFile, { waitUntil: 'networkidle' });

  console.log(`📄 Generating PDF...`);

  // Generate PDF with A4 dimensions
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });

  await browser.close();

  console.log(`✅ PDF created: ${outputPath}`);
}

// Get args from command line
const htmlPath = process.argv[2];
const outputPath = process.argv[3];

if (!htmlPath || !outputPath) {
  console.error('Usage: node html-to-pdf.js <html-path> <output-pdf-path>');
  process.exit(1);
}

htmlToPDF(path.resolve(htmlPath), path.resolve(outputPath))
  .catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
