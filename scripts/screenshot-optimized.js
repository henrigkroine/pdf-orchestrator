import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function screenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 816, height: 1056 } });

  await page.goto('file://' + path.join(projectRoot, 'exports', 'ukraine-optimized.html').replace(/\\/g, '/'));
  await page.waitForTimeout(3000);

  const pages = await page.$$('.page');

  for (let i = 0; i < pages.length; i++) {
    await pages[i].screenshot({
      path: path.join(projectRoot, 'exports', 'screenshots-optimized', `page-${i+1}.png`)
    });
    console.log(`✓ Page ${i+1} screenshot saved`);
  }

  await browser.close();
}

import fs from 'fs/promises';
await fs.mkdir(path.join(projectRoot, 'exports', 'screenshots-optimized'), { recursive: true });
screenshot();
