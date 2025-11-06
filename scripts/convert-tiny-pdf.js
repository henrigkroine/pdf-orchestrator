import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('file:///' + path.join(projectRoot, 'exports', 'ukraine-tiny.html').replace(/\\/g, '/'));
await page.waitForTimeout(500);

const pdfPath = path.join(projectRoot, 'exports', 'ukraine-tiny.pdf');

await page.pdf({
  path: pdfPath,
  format: 'Letter',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  tagged: false,
  outline: false
});

await browser.close();

const stats = fs.statSync(pdfPath);
console.log('✅ Tiny PDF generated!');
console.log('💾 File size: ' + (stats.size / 1024).toFixed(1) + ' KB');
console.log('📍 Location: ' + pdfPath);
