/**
 * Alignment Engine
 *
 * Provides pixel-perfect alignment and optical adjustments
 * for layout elements.
 *
 * Handles:
 * - Grid alignment
 * - Edge alignment
 * - Center alignment
 * - Optical alignment (visual vs mathematical)
 * - Baseline alignment
 * - Distribution (even spacing)
 *
 * @module alignment-engine
 */

class AlignmentEngine {
  constructor(options = {}) {
    this.options = {
      tolerance: options.tolerance || 2,  // pixels
      opticalAdjustment: options.opticalAdjustment !== false,
      snapToGrid: options.snapToGrid !== false,
      debug: options.debug || false
    };

    // Optical adjustment factors for different shapes
    this.opticalFactors = {
      circle: { x: 0.03, y: 0.03 },      // Circles need slight offset
      triangle: { x: 0.05, y: 0.05 },    // Triangles need more
      rounded: { x: 0.02, y: 0.02 },     // Rounded rectangles
      text: { x: 0, y: 0.05 }            // Text needs vertical adjustment
    };
  }

  /**
   * Align all elements in layout
   */
  alignElements(layout, gridSystem) {
    const aligned = layout.elements.map(element => {
      return this.alignElement(element, layout, gridSystem);
    });

    return {
      ...layout,
      elements: aligned
    };
  }

  /**
   * Align single element
   */
  alignElement(element, layout, gridSystem) {
    const aligned = { ...element };

    // Align to grid columns
    if (this.options.snapToGrid && element.gridColumn !== undefined) {
      const columnAlignment = this.alignToColumn(element, gridSystem);
      aligned.x = columnAlignment.x;
      aligned.alignedToColumn = true;
    }

    // Align to baseline
    if (this.options.snapToGrid && gridSystem.baselineGrid) {
      const baselineAlignment = this.alignToBaseline(element, gridSystem);
      aligned.y = baselineAlignment.y;
      aligned.alignedToBaseline = true;
    }

    // Apply optical adjustments
    if (this.options.opticalAdjustment) {
      const optical = this.applyOpticalAdjustment(aligned);
      aligned.x = optical.x;
      aligned.y = optical.y;
      aligned.opticallyAdjusted = true;
    }

    return aligned;
  }

  /**
   * Align to grid column
   */
  alignToColumn(element, gridSystem) {
    if (!element.gridColumn || !gridSystem.columnPositions) {
      return { x: element.x };
    }

    const columnIndex = element.gridColumn - 1;  // Convert to 0-based
    const x = gridSystem.columnPositions[columnIndex];

    return {
      x,
      column: element.gridColumn,
      aligned: true
    };
  }

  /**
   * Align to baseline grid
   */
  alignToBaseline(element, gridSystem) {
    if (!gridSystem.baselineGrid) {
      return { y: element.y };
    }

    // Find closest baseline
    let closestY = gridSystem.baselineGrid[0];
    let minDistance = Math.abs(element.y - closestY);

    gridSystem.baselineGrid.forEach(baselineY => {
      const distance = Math.abs(element.y - baselineY);
      if (distance < minDistance) {
        minDistance = distance;
        closestY = baselineY;
      }
    });

    // Only snap if within tolerance
    const y = minDistance <= this.options.tolerance ? closestY : element.y;

    return {
      y,
      baseline: closestY,
      aligned: minDistance <= this.options.tolerance,
      distance: minDistance
    };
  }

  /**
   * Apply optical alignment adjustments
   * Visual perception != mathematical center
   */
  applyOpticalAdjustment(element) {
    const shape = this.detectShape(element);
    const factors = this.opticalFactors[shape] || { x: 0, y: 0 };

    // Apply adjustment as percentage of element size
    const adjustmentX = element.width * factors.x;
    const adjustmentY = element.height * factors.y;

    return {
      x: element.x + adjustmentX,
      y: element.y + adjustmentY,
      shape,
      adjustment: { x: adjustmentX, y: adjustmentY }
    };
  }

  /**
   * Detect element shape for optical adjustments
   */
  detectShape(element) {
    if (element.type === 'text') return 'text';
    if (element.shape === 'circle') return 'circle';
    if (element.shape === 'triangle') return 'triangle';
    if (element.borderRadius) return 'rounded';
    return 'rectangle';
  }

  /**
   * Align elements to left edge
   */
  alignLeft(elements, reference = null) {
    const leftEdge = reference?.x || Math.min(...elements.map(el => el.x));

    return elements.map(el => ({
      ...el,
      x: leftEdge,
      alignment: 'left'
    }));
  }

  /**
   * Align elements to right edge
   */
  alignRight(elements, reference = null) {
    const rightEdge = reference
      ? reference.x + reference.width
      : Math.max(...elements.map(el => el.x + el.width));

    return elements.map(el => ({
      ...el,
      x: rightEdge - el.width,
      alignment: 'right'
    }));
  }

  /**
   * Align elements to center (horizontal)
   */
  alignCenterHorizontal(elements, reference = null) {
    const centerX = reference
      ? reference.x + reference.width / 2
      : this.calculateCenterX(elements);

    return elements.map(el => ({
      ...el,
      x: centerX - el.width / 2,
      alignment: 'center-horizontal'
    }));
  }

  /**
   * Align elements to top edge
   */
  alignTop(elements, reference = null) {
    const topEdge = reference?.y || Math.min(...elements.map(el => el.y));

    return elements.map(el => ({
      ...el,
      y: topEdge,
      alignment: 'top'
    }));
  }

  /**
   * Align elements to bottom edge
   */
  alignBottom(elements, reference = null) {
    const bottomEdge = reference
      ? reference.y + reference.height
      : Math.max(...elements.map(el => el.y + el.height));

    return elements.map(el => ({
      ...el,
      y: bottomEdge - el.height,
      alignment: 'bottom'
    }));
  }

  /**
   * Align elements to center (vertical)
   */
  alignCenterVertical(elements, reference = null) {
    const centerY = reference
      ? reference.y + reference.height / 2
      : this.calculateCenterY(elements);

    return elements.map(el => ({
      ...el,
      y: centerY - el.height / 2,
      alignment: 'center-vertical'
    }));
  }

  /**
   * Calculate center X of elements
   */
  calculateCenterX(elements) {
    const minX = Math.min(...elements.map(el => el.x));
    const maxX = Math.max(...elements.map(el => el.x + el.width));
    return (minX + maxX) / 2;
  }

  /**
   * Calculate center Y of elements
   */
  calculateCenterY(elements) {
    const minY = Math.min(...elements.map(el => el.y));
    const maxY = Math.max(...elements.map(el => el.y + el.height));
    return (minY + maxY) / 2;
  }

  /**
   * Distribute elements horizontally
   */
  distributeHorizontal(elements, spacing = null) {
    // Sort by X position
    const sorted = [...elements].sort((a, b) => a.x - b.x);

    if (sorted.length < 2) return sorted;

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    if (spacing === null) {
      // Even distribution across available space
      const totalSpace = (last.x + last.width) - first.x;
      const totalElementWidth = sorted.reduce((sum, el) => sum + el.width, 0);
      const availableSpace = totalSpace - totalElementWidth;
      spacing = availableSpace / (sorted.length - 1);
    }

    // Distribute with fixed spacing
    let currentX = first.x;
    return sorted.map((el, idx) => {
      if (idx === 0) return el;

      currentX += sorted[idx - 1].width + spacing;
      return {
        ...el,
        x: currentX,
        distribution: 'horizontal'
      };
    });
  }

  /**
   * Distribute elements vertically
   */
  distributeVertical(elements, spacing = null) {
    // Sort by Y position
    const sorted = [...elements].sort((a, b) => a.y - b.y);

    if (sorted.length < 2) return sorted;

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    if (spacing === null) {
      // Even distribution across available space
      const totalSpace = (last.y + last.height) - first.y;
      const totalElementHeight = sorted.reduce((sum, el) => sum + el.height, 0);
      const availableSpace = totalSpace - totalElementHeight;
      spacing = availableSpace / (sorted.length - 1);
    }

    // Distribute with fixed spacing
    let currentY = first.y;
    return sorted.map((el, idx) => {
      if (idx === 0) return el;

      currentY += sorted[idx - 1].height + spacing;
      return {
        ...el,
        y: currentY,
        distribution: 'vertical'
      };
    });
  }

  /**
   * Match size of elements
   */
  matchWidth(elements, reference = null) {
    const width = reference?.width || Math.max(...elements.map(el => el.width));

    return elements.map(el => ({
      ...el,
      width,
      sizeMatched: 'width'
    }));
  }

  matchHeight(elements, reference = null) {
    const height = reference?.height || Math.max(...elements.map(el => el.height));

    return elements.map(el => ({
      ...el,
      height,
      sizeMatched: 'height'
    }));
  }

  matchSize(elements, reference = null) {
    const width = reference?.width || Math.max(...elements.map(el => el.width));
    const height = reference?.height || Math.max(...elements.map(el => el.height));

    return elements.map(el => ({
      ...el,
      width,
      height,
      sizeMatched: 'both'
    }));
  }

  /**
   * Detect alignment issues
   */
  detectIssues(elements, gridSystem = null) {
    const issues = [];

    // Check for near-misses (almost aligned but not quite)
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const el1 = elements[i];
        const el2 = elements[j];

        // Check horizontal near-misses
        const xDiff = Math.abs(el1.x - el2.x);
        if (xDiff > 0 && xDiff < this.options.tolerance * 3) {
          issues.push({
            type: 'near-miss',
            axis: 'horizontal',
            elements: [el1.id, el2.id],
            difference: xDiff,
            message: `Elements ${el1.id} and ${el2.id} are almost aligned horizontally (${xDiff}px apart)`,
            suggestion: 'Align left edges'
          });
        }

        // Check vertical near-misses
        const yDiff = Math.abs(el1.y - el2.y);
        if (yDiff > 0 && yDiff < this.options.tolerance * 3) {
          issues.push({
            type: 'near-miss',
            axis: 'vertical',
            elements: [el1.id, el2.id],
            difference: yDiff,
            message: `Elements ${el1.id} and ${el2.id} are almost aligned vertically (${yDiff}px apart)`,
            suggestion: 'Align top edges'
          });
        }
      }
    }

    // Check grid alignment
    if (gridSystem && gridSystem.columnPositions) {
      elements.forEach(element => {
        const closestColumn = this.findClosestColumn(element.x, gridSystem);
        if (closestColumn.distance > this.options.tolerance) {
          issues.push({
            type: 'grid-misalignment',
            element: element.id,
            distance: closestColumn.distance,
            message: `Element ${element.id} is ${closestColumn.distance}px from nearest column`,
            suggestion: `Snap to column ${closestColumn.column + 1}`
          });
        }
      });
    }

    // Check baseline alignment
    if (gridSystem && gridSystem.baselineGrid) {
      elements.filter(el => el.type === 'text').forEach(element => {
        const closestBaseline = this.findClosestBaseline(element.y, gridSystem);
        if (closestBaseline.distance > this.options.tolerance) {
          issues.push({
            type: 'baseline-misalignment',
            element: element.id,
            distance: closestBaseline.distance,
            message: `Text element ${element.id} is ${closestBaseline.distance}px from baseline`,
            suggestion: `Snap to baseline ${closestBaseline.y}`
          });
        }
      });
    }

    // Check for uneven spacing
    const sortedX = [...elements].sort((a, b) => a.x - b.x);
    if (sortedX.length >= 3) {
      const spacings = [];
      for (let i = 1; i < sortedX.length; i++) {
        const spacing = sortedX[i].x - (sortedX[i - 1].x + sortedX[i - 1].width);
        spacings.push(spacing);
      }

      const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
      spacings.forEach((spacing, idx) => {
        if (Math.abs(spacing - avgSpacing) > this.options.tolerance * 2) {
          issues.push({
            type: 'uneven-spacing',
            position: idx,
            spacing,
            avgSpacing,
            message: `Uneven horizontal spacing at position ${idx + 1} (${spacing}px vs ${avgSpacing.toFixed(1)}px avg)`,
            suggestion: 'Use distribute horizontal'
          });
        }
      });
    }

    return issues;
  }

  /**
   * Find closest column to X position
   */
  findClosestColumn(x, gridSystem) {
    let closestColumn = 0;
    let minDistance = Math.abs(x - gridSystem.columnPositions[0]);

    gridSystem.columnPositions.forEach((pos, idx) => {
      const distance = Math.abs(x - pos);
      if (distance < minDistance) {
        minDistance = distance;
        closestColumn = idx;
      }
    });

    return {
      column: closestColumn,
      x: gridSystem.columnPositions[closestColumn],
      distance: minDistance
    };
  }

  /**
   * Find closest baseline to Y position
   */
  findClosestBaseline(y, gridSystem) {
    let closestY = gridSystem.baselineGrid[0];
    let minDistance = Math.abs(y - closestY);

    gridSystem.baselineGrid.forEach(baselineY => {
      const distance = Math.abs(y - baselineY);
      if (distance < minDistance) {
        minDistance = distance;
        closestY = baselineY;
      }
    });

    return {
      y: closestY,
      distance: minDistance
    };
  }

  /**
   * Auto-fix alignment issues
   */
  autoFix(elements, gridSystem = null) {
    const issues = this.detectIssues(elements, gridSystem);
    let fixed = [...elements];

    issues.forEach(issue => {
      switch (issue.type) {
        case 'near-miss':
          // Align elements that are almost aligned
          const [id1, id2] = issue.elements;
          const el1 = fixed.find(el => el.id === id1);
          const el2 = fixed.find(el => el.id === id2);

          if (el1 && el2) {
            if (issue.axis === 'horizontal') {
              el2.x = el1.x;
            } else {
              el2.y = el1.y;
            }
          }
          break;

        case 'grid-misalignment':
          if (gridSystem) {
            const element = fixed.find(el => el.id === issue.element);
            if (element) {
              const snap = this.findClosestColumn(element.x, gridSystem);
              element.x = snap.x;
            }
          }
          break;

        case 'baseline-misalignment':
          if (gridSystem) {
            const element = fixed.find(el => el.id === issue.element);
            if (element) {
              const snap = this.findClosestBaseline(element.y, gridSystem);
              element.y = snap.y;
            }
          }
          break;

        case 'uneven-spacing':
          // Re-distribute with even spacing
          fixed = this.distributeHorizontal(fixed);
          break;
      }
    });

    return {
      elements: fixed,
      fixedIssues: issues.length
    };
  }

  /**
   * Generate alignment report
   */
  generateReport(elements, gridSystem = null) {
    const issues = this.detectIssues(elements, gridSystem);

    // Count by type
    const issueCounts = issues.reduce((counts, issue) => {
      counts[issue.type] = (counts[issue.type] || 0) + 1;
      return counts;
    }, {});

    // Check alignment percentages
    const totalElements = elements.length;
    const gridAligned = elements.filter(el => el.alignedToColumn).length;
    const baselineAligned = elements.filter(el => el.alignedToBaseline).length;
    const opticallyAdjusted = elements.filter(el => el.opticallyAdjusted).length;

    return {
      summary: {
        totalElements,
        issuesFound: issues.length,
        gridAlignedPercent: ((gridAligned / totalElements) * 100).toFixed(1),
        baselineAlignedPercent: ((baselineAligned / totalElements) * 100).toFixed(1),
        opticallyAdjustedPercent: ((opticallyAdjusted / totalElements) * 100).toFixed(1)
      },
      issuesByType: issueCounts,
      issues: issues.map(issue => ({
        type: issue.type,
        message: issue.message,
        suggestion: issue.suggestion
      })),
      recommendations: this.generateRecommendations(issues, totalElements)
    };
  }

  generateRecommendations(issues, totalElements) {
    const recommendations = [];

    if (issues.length === 0) {
      recommendations.push('✅ All elements are properly aligned');
      return recommendations;
    }

    const nearMisses = issues.filter(i => i.type === 'near-miss').length;
    if (nearMisses > 0) {
      recommendations.push(`⚠️  Fix ${nearMisses} near-miss alignments (use align tools)`);
    }

    const gridIssues = issues.filter(i => i.type === 'grid-misalignment').length;
    if (gridIssues > totalElements * 0.3) {
      recommendations.push('⚠️  Enable grid snapping to improve alignment');
    }

    const spacingIssues = issues.filter(i => i.type === 'uneven-spacing').length;
    if (spacingIssues > 0) {
      recommendations.push(`⚠️  Use distribute tools to fix ${spacingIssues} uneven spacing issues`);
    }

    return recommendations;
  }
}

module.exports = AlignmentEngine;
