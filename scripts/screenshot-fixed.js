/**
 * Take fresh screenshots of the fixed Ukraine document
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function takeScreenshots() {
  console.log('📸 Taking screenshots of FIXED document...\n');

  const htmlPath = path.join(projectRoot, 'exports', 'together-for-ukraine-female-entrepreneurship.html');
  const screenshotDir = path.join(projectRoot, 'exports', 'screenshots-fixed');

  await fs.mkdir(screenshotDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 816, height: 1056 }
  });

  await page.goto('file://' + htmlPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle'
  });

  await page.waitForTimeout(2000);

  // Get all pages
  const pages = await page.$$('.page');
  console.log(`Found ${pages.length} pages\n`);

  // Screenshot each page
  for (let i = 0; i < pages.length; i++) {
    const screenshot = path.join(screenshotDir, `page-${i + 1}.png`);
    await pages[i].screenshot({ path: screenshot });
    console.log(`✓ Page ${i + 1}: ${path.relative(projectRoot, screenshot)}`);
  }

  await browser.close();

  console.log('\n✅ Screenshots saved to:', screenshotDir);
}

takeScreenshots().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
