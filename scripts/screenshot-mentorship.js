import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('📸 Taking screenshots of mentorship document...\n');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 850, height: 1100 }
});

await page.goto('file:///' + path.join(projectRoot, 'exports', 'mentorship-platform.html').replace(/\\/g, '/'));
await page.waitForTimeout(2000);

// Screenshot cover page
await page.screenshot({
  path: path.join(projectRoot, 'exports', 'mentorship-cover.png'),
  fullPage: false
});
console.log('✅ Cover page screenshot saved');

// Scroll to page 2
await page.evaluate(() => {
  const pages = document.querySelectorAll('.page');
  if (pages.length >= 2) pages[1].scrollIntoView();
});
await page.waitForTimeout(500);
await page.screenshot({
  path: path.join(projectRoot, 'exports', 'mentorship-page2.png'),
  fullPage: false
});
console.log('✅ Page 2 screenshot saved');

// Scroll to back cover
await page.evaluate(() => {
  const pages = document.querySelectorAll('.page');
  if (pages.length >= 5) pages[4].scrollIntoView();
});
await page.waitForTimeout(500);
await page.screenshot({
  path: path.join(projectRoot, 'exports', 'mentorship-backcover.png'),
  fullPage: false
});
console.log('✅ Back cover screenshot saved');

await browser.close();
console.log('\n✅ All screenshots complete!');
