/**
 * Convert Ukraine HTML to PDF using Playwright
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function convertToPDF() {
  console.log('🖨️  Converting Ukraine document to PDF...\n');

  const htmlPath = path.join(projectRoot, 'exports', 'together-for-ukraine-female-entrepreneurship.html');
  const pdfPath = path.join(projectRoot, 'exports', 'together-for-ukraine-female-entrepreneurship.pdf');

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
    format: 'Letter',
    printBackground: true,
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
}

convertToPDF().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
