import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('📸 Taking screenshot of last page...\n');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 850, height: 1100 }
});

await page.goto('file:///' + path.join(projectRoot, 'exports', 'ukraine-final.html').replace(/\\/g, '/'));
await page.waitForTimeout(2000);

// Scroll to last page (page 4 - back cover)
await page.evaluate(() => {
  const pages = document.querySelectorAll('.page');
  if (pages.length >= 4) {
    pages[3].scrollIntoView();
  }
});

await page.waitForTimeout(500);

const screenshotPath = path.join(projectRoot, 'exports', 'last-page.png');
await page.screenshot({
  path: screenshotPath,
  fullPage: false
});

await browser.close();

console.log('✅ Screenshot saved: ' + screenshotPath);
