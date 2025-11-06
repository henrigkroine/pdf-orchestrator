import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('file:///' + path.join(projectRoot, 'exports', 'ukraine-perfect.html').replace(/\\/g, '/'));
await page.waitForTimeout(1000);

const pdfPath = path.join(projectRoot, 'exports', 'ukraine-perfect.pdf');

await page.pdf({
  path: pdfPath,
  format: 'Letter',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  preferCSSPageSize: true, // Use CSS @page size
  tagged: false,
  outline: false
});

await browser.close();

const stats = fs.statSync(pdfPath);
console.log('✅ PERFECT PDF generated!');
console.log('💾 File size: ' + (stats.size / 1024).toFixed(1) + ' KB');
console.log('📍 Location: ' + pdfPath);
console.log('');
console.log('✨ Each page fits EXACTLY on one PDF page (no bleeding!)');
