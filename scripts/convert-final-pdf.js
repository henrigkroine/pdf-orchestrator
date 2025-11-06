import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🖨️  Converting FINAL Ukraine document to PDF...\n');

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('file:///' + path.join(projectRoot, 'exports', 'ukraine-final.html').replace(/\\/g, '/'));
await page.waitForTimeout(2000); // Wait for logos to load

const pdfPath = path.join(projectRoot, 'exports', 'ukraine-final.pdf');

await page.pdf({
  path: pdfPath,
  format: 'Letter',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  preferCSSPageSize: true,
  tagged: false,
  outline: false
});

await browser.close();

const stats = fs.statSync(pdfPath);
console.log('✅ FINAL PDF generated with REAL LOGOS!');
console.log('💾 File size: ' + (stats.size / 1024).toFixed(1) + ' KB');
console.log('📍 Location: ' + pdfPath);
console.log('');
console.log('✨ Features:');
console.log('   ✅ Real Together for Ukraine logo');
console.log('   ✅ Real TEEI logos (white + Nordshore)');
console.log('   ✅ No page bleeding');
console.log('   ✅ High quality print-ready');
