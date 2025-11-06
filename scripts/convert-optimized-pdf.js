/**
 * Convert optimized Ukraine HTML to PDF with compression
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function convertToPDF() {
  console.log('🖨️  Converting optimized HTML to PDF...\n');

  const htmlPath = path.join(projectRoot, 'exports', 'ukraine-optimized.html');
  const pdfPath = path.join(projectRoot, 'exports', 'ukraine-optimized.pdf');

  console.log('   📄 Input: ' + path.relative(projectRoot, htmlPath));
  console.log('   📄 Output: ' + path.relative(projectRoot, pdfPath));
  console.log('');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('file://' + htmlPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle'
  });

  await page.waitForTimeout(3000); // Wait for Google Fonts to load

  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    scale: 1,
    preferCSSPageSize: false,
    tagged: false, // Smaller file size
    outline: false // Smaller file size
  });

  await browser.close();

  // Get file size
  const fs = await import('fs/promises');
  const stats = await fs.stat(pdfPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('   ✅ PDF generated successfully!');
  console.log('');
  console.log('   📍 Location: ' + pdfPath);
  console.log('   💾 File size: ' + sizeMB + ' MB');
  console.log('');
  console.log('   ✨ Optimizations:');
  console.log('      • SVG logos (vector = scalable)');
  console.log('      • CSS-based TEEI logo (no images)');
  console.log('      • Minimal file size');
  console.log('      • High print quality (300 DPI ready)');
  console.log('');
}

convertToPDF().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
