/**
 * Reading Order Optimizer - Optimizes logical reading order for screen readers
 * Ensures content flows in logical sequence (top-to-bottom, left-to-right)
 *
 * WCAG 2.2: 1.3.2 Meaningful Sequence (Level A)
 */

import { extractTextBlocksWithBounds } from '../utils/advancedPdfParser.js';
import logger from '../utils/logger.js';

class ReadingOrderOptimizer {
  constructor(pdfPath) {
    this.pdfPath = pdfPath;
    this.textBlocks = [];
    this.readingOrder = [];
  }

  /**
   * Analyze and optimize reading order
   * @returns {Promise<Object>} Optimized reading order and issues
   */
  async optimizeReadingOrder() {
    logger.subsection('Optimizing Reading Order');

    try {
      // Extract text blocks with positions
      this.textBlocks = await extractTextBlocksWithBounds(this.pdfPath);

      // Group by page
      const pageGroups = {};
      this.textBlocks.forEach(block => {
        if (!pageGroups[block.page]) pageGroups[block.page] = [];
        pageGroups[block.page].push(block);
      });

      // Optimize reading order for each page
      const optimizedPages = {};
      const issues = [];

      Object.entries(pageGroups).forEach(([pageNum, blocks]) => {
        const result = this.optimizePageReadingOrder(blocks, parseInt(pageNum));
        optimizedPages[pageNum] = result.order;
        issues.push(...result.issues);
      });

      this.readingOrder = optimizedPages;

      logger.success(`Optimized reading order for ${Object.keys(optimizedPages).length} pages`);
      if (issues.length > 0) {
        logger.warn(`Found ${issues.length} reading order issues`);
      }

      return {
        readingOrder: optimizedPages,
        issues,
        totalBlocks: this.textBlocks.length
      };

    } catch (error) {
      logger.error(`Reading order optimization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Optimize reading order for a single page
   */
  optimizePageReadingOrder(blocks, pageNum) {
    const issues = [];

    // Detect layout type (single column, multi-column, complex)
    const layoutType = this.detectLayoutType(blocks);

    let sortedBlocks;

    if (layoutType === 'single-column') {
      // Simple top-to-bottom sort
      sortedBlocks = this.sortSingleColumn(blocks);
    } else if (layoutType === 'two-column') {
      // Left column first, then right column
      sortedBlocks = this.sortTwoColumn(blocks);
    } else if (layoutType === 'multi-column') {
      // Multiple columns, sort left-to-right then top-to-bottom
      sortedBlocks = this.sortMultiColumn(blocks);
    } else {
      // Complex layout, use advanced algorithm
      sortedBlocks = this.sortComplexLayout(blocks);
      issues.push({
        page: pageNum,
        severity: 'WARNING',
        message: 'Complex layout detected. Reading order may need manual verification.',
        recommendation: 'Verify reading order matches visual flow using screen reader'
      });
    }

    // Validate reading order
    const validation = this.validateReadingOrder(sortedBlocks, pageNum);
    issues.push(...validation.issues);

    return {
      order: sortedBlocks.map((block, index) => ({
        index,
        text: block.text,
        bbox: block.bbox
      })),
      layoutType,
      issues
    };
  }

  /**
   * Detect page layout type
   */
  detectLayoutType(blocks) {
    if (blocks.length === 0) return 'empty';

    // Calculate page width range
    const xPositions = blocks.map(b => b.bbox.x);
    const minX = Math.min(...xPositions);
    const maxX = Math.max(...blocks.map(b => b.bbox.x + b.bbox.width));
    const pageWidth = maxX - minX;

    // Group blocks by approximate X position (with tolerance)
    const columns = this.detectColumns(blocks, pageWidth);

    if (columns.length === 1) {
      return 'single-column';
    } else if (columns.length === 2) {
      return 'two-column';
    } else if (columns.length >= 3) {
      return 'multi-column';
    } else {
      return 'complex';
    }
  }

  /**
   * Detect column boundaries
   */
  detectColumns(blocks, pageWidth) {
    // Cluster blocks by X position
    const tolerance = pageWidth * 0.1; // 10% tolerance
    const clusters = [];

    blocks.forEach(block => {
      const x = block.bbox.x;
      let foundCluster = false;

      for (const cluster of clusters) {
        if (Math.abs(cluster.x - x) <= tolerance) {
          cluster.blocks.push(block);
          cluster.x = (cluster.x * cluster.blocks.length + x) / (cluster.blocks.length + 1); // Update centroid
          foundCluster = true;
          break;
        }
      }

      if (!foundCluster) {
        clusters.push({ x, blocks: [block] });
      }
    });

    // Sort clusters by X position (left to right)
    return clusters.sort((a, b) => a.x - b.x);
  }

  /**
   * Sort single column layout (simple top-to-bottom)
   */
  sortSingleColumn(blocks) {
    return [...blocks].sort((a, b) => {
      // Sort by Y position (top to bottom)
      const yDiff = a.bbox.y - b.bbox.y;
      if (Math.abs(yDiff) > 5) return yDiff;
      // Same line, sort left to right
      return a.bbox.x - b.bbox.x;
    });
  }

  /**
   * Sort two-column layout
   */
  sortTwoColumn(blocks) {
    // Find median X position to split columns
    const xPositions = blocks.map(b => b.bbox.x).sort((a, b) => a - b);
    const medianX = xPositions[Math.floor(xPositions.length / 2)];

    // Split into left and right columns
    const leftColumn = blocks.filter(b => b.bbox.x < medianX);
    const rightColumn = blocks.filter(b => b.bbox.x >= medianX);

    // Sort each column top-to-bottom
    const leftSorted = this.sortSingleColumn(leftColumn);
    const rightSorted = this.sortSingleColumn(rightColumn);

    // Combine: left column first, then right column
    return [...leftSorted, ...rightSorted];
  }

  /**
   * Sort multi-column layout
   */
  sortMultiColumn(blocks) {
    // Detect columns
    const pageWidth = Math.max(...blocks.map(b => b.bbox.x + b.bbox.width)) -
                      Math.min(...blocks.map(b => b.bbox.x));
    const columns = this.detectColumns(blocks, pageWidth);

    // Sort blocks within each column, then combine left-to-right
    const sortedBlocks = [];
    columns.forEach(column => {
      const sorted = this.sortSingleColumn(column.blocks);
      sortedBlocks.push(...sorted);
    });

    return sortedBlocks;
  }

  /**
   * Sort complex layout (fallback to basic algorithm)
   */
  sortComplexLayout(blocks) {
    // Use Z-order reading pattern (top-left to bottom-right)
    return [...blocks].sort((a, b) => {
      // Primary: Y position (top to bottom)
      const yDiff = a.bbox.y - b.bbox.y;
      if (Math.abs(yDiff) > 50) return yDiff; // Different rows

      // Secondary: X position (left to right)
      return a.bbox.x - b.bbox.x;
    });
  }

  /**
   * Validate reading order makes sense
   */
  validateReadingOrder(sortedBlocks, pageNum) {
    const issues = [];

    // Check for large backward Y jumps (potential reading order issue)
    for (let i = 1; i < sortedBlocks.length; i++) {
      const prev = sortedBlocks[i - 1];
      const curr = sortedBlocks[i];

      // If current block is significantly above previous (backward Y jump)
      if (curr.bbox.y < prev.bbox.y - 100) {
        issues.push({
          page: pageNum,
          severity: 'WARNING',
          message: `Reading order jumps backward from "${prev.text.substring(0, 30)}" to "${curr.text.substring(0, 30)}"`,
          recommendation: 'Verify this matches intended reading flow'
        });
      }

      // Check for large X jumps on same line (potential column issue)
      if (Math.abs(curr.bbox.y - prev.bbox.y) < 10 && Math.abs(curr.bbox.x - prev.bbox.x) > 300) {
        issues.push({
          page: pageNum,
          severity: 'INFO',
          message: `Large horizontal gap detected (possible multi-column layout)`,
          recommendation: 'Verify column reading order'
        });
      }
    }

    return {
      isValid: issues.filter(i => i.severity === 'ERROR').length === 0,
      issues
    };
  }

  /**
   * Generate reading order visualization (for debugging)
   */
  visualizeReadingOrder(pageNum) {
    const pageOrder = this.readingOrder[pageNum];
    if (!pageOrder) {
      return `Page ${pageNum} not found`;
    }

    const lines = [`Reading Order - Page ${pageNum}:`, ''];
    pageOrder.forEach((block, index) => {
      lines.push(`${(index + 1).toString().padStart(3)}. ${block.text.substring(0, 60)}${block.text.length > 60 ? '...' : ''}`);
    });

    return lines.join('\n');
  }
}

export default ReadingOrderOptimizer;
