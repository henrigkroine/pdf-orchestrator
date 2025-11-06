/**
 * Convert HTML to PDF using Playwright
 * Ensures all backgrounds, gradients, and colors are preserved
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function convertToPDF() {
  console.log('🖨️  Converting HTML to PDF using Playwright...\n');

  const htmlPath = path.join(projectRoot, 'exports', 'teei-aws-partnership-executive.html');
  const pdfPath = path.join(projectRoot, 'exports', 'teei-aws-partnership-executive.pdf');

  console.log('   📄 Input: ' + path.relative(projectRoot, htmlPath));
  console.log('   📄 Output: ' + path.relative(projectRoot, pdfPath));
  console.log('');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Load HTML file
  await page.goto('file://' + htmlPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle'
  });

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  // Generate PDF
  await page.pdf({
    path: pdfPath,
    format: 'Letter', // 8.5 × 11 inches
    printBackground: true, // CRITICAL: Include backgrounds and gradients
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    scale: 1,
    preferCSSPageSize: false
  });

  await browser.close();

  console.log('   ✅ PDF generated successfully!');
  console.log('');
  console.log('   📍 Location: ' + pdfPath);
  console.log('');
  console.log('   🎯 Next: Open the PDF and verify:');
  console.log('      • All backgrounds and gradients visible');
  console.log('      • Hero image displays correctly');
  console.log('      • Typography renders properly (Lora + Roboto Flex)');
  console.log('      • All TEEI brand colors correct');
  console.log('      • No text cutoffs anywhere');
  console.log('');
}

convertToPDF().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
