/**
 * Visual QA for Together for Ukraine Document
 * Uses Playwright to capture screenshots and identify visual issues
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function visualQA() {
  console.log('🔍 Visual QA: Together for Ukraine Document\n');

  const htmlPath = path.join(projectRoot, 'exports', 'together-for-ukraine-female-entrepreneurship.html');
  const screenshotDir = path.join(projectRoot, 'exports', 'qa-screenshots');

  // Create screenshot directory
  await fs.mkdir(screenshotDir, { recursive: true });

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({
    viewport: {
      width: 816, // 8.5 inches at 96 DPI
      height: 1056 // 11 inches at 96 DPI
    }
  });

  console.log('Loading HTML...');
  await page.goto('file://' + htmlPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle'
  });

  // Wait for fonts to load
  await page.waitForTimeout(2000);

  console.log('\n📸 Capturing screenshots...\n');

  // Capture full page
  const fullScreenshot = path.join(screenshotDir, 'full-page.png');
  await page.screenshot({
    path: fullScreenshot,
    fullPage: true
  });
  console.log('   ✓ Full page: ' + path.relative(projectRoot, fullScreenshot));

  // Capture individual pages
  const pages = await page.$$('.page');
  console.log(`\n   Found ${pages.length} pages\n`);

  for (let i = 0; i < pages.length; i++) {
    const pageScreenshot = path.join(screenshotDir, `page-${i + 1}.png`);
    await pages[i].screenshot({ path: pageScreenshot });
    console.log(`   ✓ Page ${i + 1}: ${path.relative(projectRoot, pageScreenshot)}`);
  }

  console.log('\n🔍 Analyzing visual issues...\n');

  // Check 1: Logo colors
  console.log('1️⃣  Checking Ukraine logo colors...');
  const ukraineBox = await page.$('.ukraine-box');
  if (ukraineBox) {
    const bgColor = await ukraineBox.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    const expectedYellow = 'rgb(255, 215, 0)'; // #FFD700
    if (bgColor === expectedYellow) {
      console.log('   ✅ Ukraine box background: CORRECT (' + bgColor + ')');
    } else {
      console.log('   ❌ Ukraine box background: INCORRECT');
      console.log('      Expected: ' + expectedYellow);
      console.log('      Got: ' + bgColor);
    }
  }

  // Check 2: Cover page background
  console.log('\n2️⃣  Checking cover page background...');
  const coverPage = await page.$('.cover-page');
  if (coverPage) {
    const bgColor = await coverPage.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    const expectedNordshore = 'rgb(0, 57, 63)'; // #00393F
    if (bgColor === expectedNordshore) {
      console.log('   ✅ Cover background: CORRECT (' + bgColor + ')');
    } else {
      console.log('   ❌ Cover background: INCORRECT');
      console.log('      Expected: ' + expectedNordshore);
      console.log('      Got: ' + bgColor);
    }
  }

  // Check 3: Typography
  console.log('\n3️⃣  Checking typography...');
  const coverTitle = await page.$('.cover-title');
  if (coverTitle) {
    const fontFamily = await coverTitle.evaluate(el =>
      window.getComputedStyle(el).fontFamily
    );
    const fontSize = await coverTitle.evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    console.log('   Cover title font: ' + fontFamily);
    console.log('   Cover title size: ' + fontSize);

    if (fontFamily.includes('Lora')) {
      console.log('   ✅ Using Lora serif font');
    } else {
      console.log('   ❌ NOT using Lora font!');
    }
  }

  // Check 4: TEEI logo
  console.log('\n4️⃣  Checking TEEI logo...');
  const bookIcons = await page.$$('.book-icon');
  console.log(`   Found ${bookIcons.length} book icons`);
  if (bookIcons.length >= 3) {
    console.log('   ✅ TEEI logo has 3 book icons');
  } else {
    console.log('   ❌ TEEI logo missing book icons!');
  }

  // Check 5: Page dimensions
  console.log('\n5️⃣  Checking page dimensions...');
  const pageElement = await page.$('.page');
  if (pageElement) {
    const dimensions = await pageElement.evaluate(el => ({
      width: el.offsetWidth,
      height: el.offsetHeight
    }));
    console.log(`   Page width: ${dimensions.width}px (should be ~816px for 8.5")`);
    console.log(`   Page height: ${dimensions.height}px (should be ~1056px for 11")`);

    if (Math.abs(dimensions.width - 816) < 10 && Math.abs(dimensions.height - 1056) < 10) {
      console.log('   ✅ Page dimensions correct');
    } else {
      console.log('   ⚠️  Page dimensions may be incorrect');
    }
  }

  // Check 6: Text cutoffs
  console.log('\n6️⃣  Checking for text cutoffs...');
  const allText = await page.evaluate(() => {
    const issues = [];
    const elements = document.querySelectorAll('.cover-title, .section-title, .paragraph');
    elements.forEach((el, idx) => {
      if (el.scrollWidth > el.clientWidth) {
        issues.push({
          element: el.className,
          text: el.textContent.substring(0, 50) + '...',
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth
        });
      }
    });
    return issues;
  });

  if (allText.length === 0) {
    console.log('   ✅ No text cutoffs detected');
  } else {
    console.log('   ❌ Found text cutoff issues:');
    allText.forEach((issue, idx) => {
      console.log(`      ${idx + 1}. ${issue.element}: "${issue.text}"`);
      console.log(`         Content width: ${issue.scrollWidth}px, Container: ${issue.clientWidth}px`);
    });
  }

  console.log('\n📋 QA Report Summary\n');
  console.log('Screenshots saved to: ' + screenshotDir);
  console.log('\nNext: Review screenshots and compare with original PDF');
  console.log('Original: T:/TEEI/TEEI Overviews/Together for Ukraine Overviews/Together for Ukraine - Female Entrepreneurship Program.pdf');

  // Keep browser open for manual inspection
  console.log('\n⏸️  Browser kept open for manual inspection');
  console.log('   Press Ctrl+C when done reviewing\n');

  // Wait indefinitely (until user closes or Ctrl+C)
  await new Promise(() => {});
}

visualQA().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
