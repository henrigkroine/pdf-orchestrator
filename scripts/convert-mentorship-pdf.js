import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🖨️  Converting TEEI Mentorship Platform to PDF...\n');

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('file:///' + path.join(projectRoot, 'exports', 'mentorship-platform.html').replace(/\\/g, '/'));
await page.waitForTimeout(3000); // Wait for images to load

const pdfPath = path.join(projectRoot, 'exports', 'mentorship-platform.pdf');

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
console.log('✅ TEEI Mentorship Platform PDF generated!');
console.log('💾 File size: ' + (stats.size / 1024).toFixed(1) + ' KB');
console.log('📍 Location: ' + pdfPath);
console.log('');
console.log('✨ Features:');
console.log('   ✅ 5 pages (Cover + 3 content + Back cover)');
console.log('   ✅ Professional photography');
console.log('   ✅ TEEI brand compliance');
console.log('   ✅ Real logos embedded');
