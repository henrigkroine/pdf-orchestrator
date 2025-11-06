/**
 * Extract complete content structure from PDF
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function extractPDFContent(pdfPath) {
  console.log('📖 EXTRACTING PDF CONTENT\n');
  console.log('PDF:', pdfPath, '\n');

  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = getDocument({ data });
  const pdfDoc = await loadingTask.promise;

  const pages = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`PAGE ${pageNum} of ${pdfDoc.numPages}`);
    console.log('='.repeat(60));

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();

    console.log(`\nDimensions: ${viewport.width.toFixed(2)} × ${viewport.height.toFixed(2)}pt\n`);

    // Group text items by vertical position to understand layout
    const lines = [];
    let currentLine = { y: null, text: [], items: [] };

    textContent.items.forEach((item, idx) => {
      const y = item.transform[5];
      const x = item.transform[4];
      const text = item.str;

      // New line if Y position changed significantly (>5pt)
      if (currentLine.y === null || Math.abs(y - currentLine.y) > 5) {
        if (currentLine.text.length > 0) {
          lines.push(currentLine);
        }
        currentLine = { y, text: [], items: [] };
      }

      currentLine.y = y;
      currentLine.text.push(text);
      currentLine.items.push({ x, text, fontName: item.fontName });
    });

    if (currentLine.text.length > 0) {
      lines.push(currentLine);
    }

    // Sort lines by Y position (top to bottom)
    lines.sort((a, b) => b.y - a.y);

    // Print content
    lines.forEach(line => {
      const lineText = line.text.join(' ').trim();
      if (lineText) {
        console.log(lineText);
      }
    });

    pages.push({
      pageNum,
      dimensions: { width: viewport.width, height: viewport.height },
      lines: lines.map(l => l.text.join(' ').trim()).filter(t => t)
    });
  }

  // Save structured content
  const outputPath = path.join(projectRoot, 'exports', 'extracted-content.json');
  fs.writeFileSync(outputPath, JSON.stringify(pages, null, 2));
  console.log(`\n\n✅ Content extracted to: ${outputPath}`);

  return pages;
}

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error('Usage: node extract-pdf-content.js <pdf-path>');
  process.exit(1);
}

extractPDFContent(pdfPath);
