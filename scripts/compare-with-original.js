/**
 * Side-by-side comparison with original PDF
 * Uses Playwright to identify visual differences
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function compareWithOriginal() {
  console.log('🔍 Detailed Visual Comparison\n');

  const originalPDF = 'T:/TEEI/TEEI Overviews/Together for Ukraine Overviews/Together for Ukraine - Female Entrepreneurship Program.pdf';
  const myHTML = path.join(projectRoot, 'exports', 'together-for-ukraine-female-entrepreneurship.html');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 }
  });

  // Open original PDF
  console.log('📄 Opening original PDF...');
  const originalPage = await context.newPage();
  await originalPage.goto('file://' + originalPDF.replace(/\\/g, '/'));
  await originalPage.waitForTimeout(2000);

  // Open my recreation
  console.log('📄 Opening my recreation...');
  const myPage = await context.newPage();
  await myPage.goto('file://' + myHTML.replace(/\\/g, '/'));
  await myPage.waitForTimeout(2000);

  console.log('\n✅ Both documents open side-by-side');
  console.log('\n🔍 Visual Issues to Check:\n');

  // Analyze my page in detail
  const issues = await myPage.evaluate(() => {
    const problems = [];

    // Check 1: Logo layout
    const ukraineLogo = document.querySelector('.ukraine-logo');
    if (ukraineLogo) {
      const layout = ukraineLogo.querySelector('.together-line');
      if (!layout || layout.style.display === 'flex') {
        problems.push({
          issue: 'Logo Layout',
          description: 'Logo should be stacked vertically, not horizontal',
          element: '.ukraine-logo',
          fix: 'Remove flex layout, make each element block-level'
        });
      }
    }

    // Check 2: Typography sizes
    const coverTitle = document.querySelector('.cover-title');
    if (coverTitle) {
      const fontSize = window.getComputedStyle(coverTitle).fontSize;
      const fontSizePt = parseFloat(fontSize) * 0.75; // px to pt
      if (fontSizePt > 50) {
        problems.push({
          issue: 'Cover Title Too Large',
          description: `Cover title is ${fontSizePt.toFixed(0)}pt, should be ~48pt`,
          element: '.cover-title',
          fix: 'Reduce font-size from 48pt to match original'
        });
      }
    }

    // Check 3: Logo box styling
    const ukraineBox = document.querySelector('.ukraine-box');
    if (ukraineBox) {
      const borderRadius = window.getComputedStyle(ukraineBox).borderRadius;
      if (parseFloat(borderRadius) > 0) {
        problems.push({
          issue: 'Ukraine Box Border Radius',
          description: 'Ukraine box should have sharp corners (no border-radius)',
          element: '.ukraine-box',
          fix: 'Set border-radius: 0'
        });
      }
    }

    // Check 4: Spacing issues
    const bookIcons = document.querySelectorAll('.book-icon');
    if (bookIcons.length > 3) {
      problems.push({
        issue: 'Too Many Book Icons',
        description: `Found ${bookIcons.length} book icons, should be exactly 3`,
        element: '.teei-books',
        fix: 'Ensure only 3 book icons per logo'
      });
    }

    return problems;
  });

  if (issues.length > 0) {
    console.log('❌ Found Visual Issues:\n');
    issues.forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue.issue}`);
      console.log(`   Problem: ${issue.description}`);
      console.log(`   Element: ${issue.element}`);
      console.log(`   Fix: ${issue.fix}\n`);
    });
  } else {
    console.log('✅ No automated issues detected\n');
  }

  console.log('📋 Manual Comparison Checklist:\n');
  console.log('Compare the two windows and check:');
  console.log('  ❏ Logo layout (stacked vs horizontal)');
  console.log('  ❏ "Together" "for" "UKRAINE" spacing');
  console.log('  ❏ Ukraine box corners (sharp vs rounded)');
  console.log('  ❏ Title positioning and size');
  console.log('  ❏ TEEI logo book icon count and spacing');
  console.log('  ❏ Overall color accuracy');
  console.log('  ❏ Page margins and padding');
  console.log('  ❏ Typography hierarchy');
  console.log('\n⏸️  Browser windows kept open for manual review');
  console.log('   Press Ctrl+C when done\n');

  await new Promise(() => {});
}

compareWithOriginal().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
