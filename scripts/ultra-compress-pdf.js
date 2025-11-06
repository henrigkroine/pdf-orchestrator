/**
 * Ultra-compressed PDF - Target: < 100 KB
 * Using aggressive compression settings
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🗜️  Ultra-compressing PDF...\n');

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('file:///' + path.join(projectRoot, 'exports', 'ukraine-tiny.html').replace(/\\/g, '/'));
await page.waitForTimeout(300);

const pdfPath = path.join(projectRoot, 'exports', 'ukraine-ultra-compressed.pdf');

// Ultra compression settings
await page.pdf({
  path: pdfPath,
  format: 'Letter',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  tagged: false,
  outline: false,
  displayHeaderFooter: false,
  preferCSSPageSize: false,
  scale: 0.95, // Slightly reduce to save space
});

await browser.close();

const stats = fs.statSync(pdfPath);
const sizeKB = (stats.size / 1024).toFixed(1);

console.log('✅ Ultra-compressed PDF generated!');
console.log(`💾 File size: ${sizeKB} KB`);
console.log('📍 Location: ' + pdfPath);
console.log('');

// Compare with original
const originalPath = 'T:/TEEI/TEEI Overviews/Together for Ukraine Overviews/Together for Ukraine - Female Entrepreneurship Program.pdf';
try {
  const originalStats = fs.statSync(originalPath);
  const originalSizeKB = (originalStats.size / 1024).toFixed(1);
  const reduction = (((originalStats.size - stats.size) / originalStats.size) * 100).toFixed(1);

  console.log('📊 Comparison:');
  console.log(`   Original: ${originalSizeKB} KB`);
  console.log(`   Mine: ${sizeKB} KB`);
  console.log(`   Reduction: ${reduction}%`);
} catch (e) {
  // Original not found
}
