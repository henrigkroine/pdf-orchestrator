/**
 * Object Analyzer - Bounding Box and Spatial Analysis
 *
 * Parses bounding box coordinates from AI vision models
 * Calculates distances, clearspace, overlaps, and alignment
 * Validates layout against TEEI brand guidelines
 */

class ObjectAnalyzer {
  constructor(options = {}) {
    this.pageWidth = options.pageWidth || 612; // 8.5 inches at 72 DPI
    this.pageHeight = options.pageHeight || 792; // 11 inches at 72 DPI
    this.dpi = options.dpi || 72;
    this.gridColumns = options.gridColumns || 12;
    this.gutterWidth = options.gutterWidth || 20;
    this.marginSize = options.marginSize || 40;

    // TEEI brand guidelines
    this.brandGuidelines = {
      logoMinimumClearspace: 20, // Minimum clearspace = icon height
      minimumTouchTarget: 44, // 44x44px for accessibility
      minimumTextSize: 11, // 11pt minimum
      sectionSpacing: 60, // 60pt between sections
      elementSpacing: 20, // 20pt between elements
      paragraphSpacing: 12, // 12pt between paragraphs
      lineHeightBody: 1.5, // 1.5x for body text
      lineHeightHeadlines: 1.2 // 1.2x for headlines
    };
  }

  /**
   * Parse bounding box from various formats
   */
  parseBoundingBox(bbox) {
    if (Array.isArray(bbox)) {
      // [x, y, width, height] format
      if (bbox.length === 4) {
        return {
          x: bbox[0],
          y: bbox[1],
          width: bbox[2],
          height: bbox[3],
          x2: bbox[0] + bbox[2],
          y2: bbox[1] + bbox[3]
        };
      }
      // [x1, y1, x2, y2] format
      return {
        x: bbox[0],
        y: bbox[1],
        width: bbox[2] - bbox[0],
        height: bbox[3] - bbox[1],
        x2: bbox[2],
        y2: bbox[3]
      };
    }

    if (typeof bbox === 'object') {
      return {
        x: bbox.x || bbox.left || 0,
        y: bbox.y || bbox.top || 0,
        width: bbox.width || bbox.w || 0,
        height: bbox.height || bbox.h || 0,
        x2: (bbox.x || bbox.left || 0) + (bbox.width || bbox.w || 0),
        y2: (bbox.y || bbox.top || 0) + (bbox.height || bbox.h || 0)
      };
    }

    throw new Error(`Invalid bounding box format: ${JSON.stringify(bbox)}`);
  }

  /**
   * Calculate distance between two bounding boxes
   */
  calculateDistance(bbox1, bbox2) {
    const b1 = this.parseBoundingBox(bbox1);
    const b2 = this.parseBoundingBox(bbox2);

    // Calculate center points
    const center1 = {
      x: b1.x + b1.width / 2,
      y: b1.y + b1.height / 2
    };

    const center2 = {
      x: b2.x + b2.width / 2,
      y: b2.y + b2.height / 2
    };

    // Euclidean distance between centers
    const distance = Math.sqrt(
      Math.pow(center2.x - center1.x, 2) +
      Math.pow(center2.y - center1.y, 2)
    );

    // Edge-to-edge distances
    const horizontalGap = Math.max(0,
      Math.min(b1.x2, b2.x2) < Math.max(b1.x, b2.x) ?
        Math.max(b1.x, b2.x) - Math.min(b1.x2, b2.x2) : 0
    );

    const verticalGap = Math.max(0,
      Math.min(b1.y2, b2.y2) < Math.max(b1.y, b2.y) ?
        Math.max(b1.y, b2.y) - Math.min(b1.y2, b2.y2) : 0
    );

    return {
      centerToCenter: distance,
      horizontalGap,
      verticalGap,
      minimumGap: Math.min(horizontalGap, verticalGap)
    };
  }

  /**
   * Detect if two bounding boxes overlap
   */
  detectOverlap(bbox1, bbox2) {
    const b1 = this.parseBoundingBox(bbox1);
    const b2 = this.parseBoundingBox(bbox2);

    const overlapX = Math.max(0, Math.min(b1.x2, b2.x2) - Math.max(b1.x, b2.x));
    const overlapY = Math.max(0, Math.min(b1.y2, b2.y2) - Math.max(b1.y, b2.y));

    const overlapArea = overlapX * overlapY;
    const area1 = b1.width * b1.height;
    const area2 = b2.width * b2.height;

    return {
      overlaps: overlapArea > 0,
      overlapArea,
      overlapPercentage1: (overlapArea / area1) * 100,
      overlapPercentage2: (overlapArea / area2) * 100,
      overlapBox: overlapArea > 0 ? {
        x: Math.max(b1.x, b2.x),
        y: Math.max(b1.y, b2.y),
        width: overlapX,
        height: overlapY
      } : null
    };
  }

  /**
   * Calculate clearspace around an element
   */
  calculateClearspace(elementBbox, allElements) {
    const element = this.parseBoundingBox(elementBbox);
    const clearspace = {
      top: element.y, // Distance from top edge
      bottom: this.pageHeight - element.y2, // Distance from bottom edge
      left: element.x, // Distance from left edge
      right: this.pageWidth - element.x2, // Distance from right edge
      nearestElement: null,
      minimumDistance: Infinity
    };

    // Find nearest element
    for (const other of allElements) {
      if (other === elementBbox) continue;

      const distance = this.calculateDistance(element, other);
      if (distance.minimumGap < clearspace.minimumDistance) {
        clearspace.minimumDistance = distance.minimumGap;
        clearspace.nearestElement = other;
      }
    }

    return clearspace;
  }

  /**
   * Validate logo clearspace according to TEEI brand guidelines
   */
  validateLogoClearspace(logoBbox, logoHeight, allElements) {
    const requiredClearspace = logoHeight || this.brandGuidelines.logoMinimumClearspace;
    const clearspace = this.calculateClearspace(logoBbox, allElements);

    const violations = [];

    if (clearspace.top < requiredClearspace) {
      violations.push({
        type: 'clearspace_violation',
        direction: 'top',
        actual: clearspace.top,
        required: requiredClearspace,
        deficit: requiredClearspace - clearspace.top
      });
    }

    if (clearspace.bottom < requiredClearspace) {
      violations.push({
        type: 'clearspace_violation',
        direction: 'bottom',
        actual: clearspace.bottom,
        required: requiredClearspace,
        deficit: requiredClearspace - clearspace.bottom
      });
    }

    if (clearspace.left < requiredClearspace) {
      violations.push({
        type: 'clearspace_violation',
        direction: 'left',
        actual: clearspace.left,
        required: requiredClearspace,
        deficit: requiredClearspace - clearspace.left
      });
    }

    if (clearspace.right < requiredClearspace) {
      violations.push({
        type: 'clearspace_violation',
        direction: 'right',
        actual: clearspace.right,
        required: requiredClearspace,
        deficit: requiredClearspace - clearspace.right
      });
    }

    if (clearspace.minimumDistance < requiredClearspace && clearspace.nearestElement) {
      violations.push({
        type: 'clearspace_violation',
        direction: 'nearest_element',
        actual: clearspace.minimumDistance,
        required: requiredClearspace,
        deficit: requiredClearspace - clearspace.minimumDistance,
        nearestElement: clearspace.nearestElement
      });
    }

    return {
      compliant: violations.length === 0,
      requiredClearspace,
      actualClearspace: clearspace,
      violations
    };
  }

  /**
   * Validate touch target size for accessibility
   */
  validateTouchTarget(bbox) {
    const element = this.parseBoundingBox(bbox);
    const minSize = this.brandGuidelines.minimumTouchTarget;

    const issues = [];

    if (element.width < minSize) {
      issues.push({
        type: 'touch_target_too_small',
        dimension: 'width',
        actual: element.width,
        required: minSize,
        deficit: minSize - element.width
      });
    }

    if (element.height < minSize) {
      issues.push({
        type: 'touch_target_too_small',
        dimension: 'height',
        actual: element.height,
        required: minSize,
        deficit: minSize - element.height
      });
    }

    return {
      compliant: issues.length === 0,
      width: element.width,
      height: element.height,
      minimumSize: minSize,
      issues
    };
  }

  /**
   * Check alignment to grid
   */
  checkGridAlignment(bbox) {
    const element = this.parseBoundingBox(bbox);
    const columnWidth = (this.pageWidth - 2 * this.marginSize - (this.gridColumns - 1) * this.gutterWidth) / this.gridColumns;

    const gridPositions = [];
    for (let i = 0; i <= this.gridColumns; i++) {
      gridPositions.push(this.marginSize + i * (columnWidth + this.gutterWidth));
    }

    // Find nearest grid line for left edge
    let nearestLeft = gridPositions[0];
    let minLeftDistance = Math.abs(element.x - gridPositions[0]);

    for (const pos of gridPositions) {
      const distance = Math.abs(element.x - pos);
      if (distance < minLeftDistance) {
        minLeftDistance = distance;
        nearestLeft = pos;
      }
    }

    // Find nearest grid line for right edge
    let nearestRight = gridPositions[0];
    let minRightDistance = Math.abs(element.x2 - gridPositions[0]);

    for (const pos of gridPositions) {
      const distance = Math.abs(element.x2 - pos);
      if (distance < minRightDistance) {
        minRightDistance = distance;
        nearestRight = pos;
      }
    }

    const tolerance = 5; // 5pt tolerance for alignment

    return {
      alignedLeft: minLeftDistance <= tolerance,
      alignedRight: minRightDistance <= tolerance,
      leftOffset: element.x - nearestLeft,
      rightOffset: element.x2 - nearestRight,
      nearestLeftGrid: nearestLeft,
      nearestRightGrid: nearestRight,
      columnWidth,
      gridPositions
    };
  }

  /**
   * Measure element spacing
   */
  measureSpacing(elements) {
    const spacingAnalysis = {
      verticalSpacing: [],
      horizontalSpacing: [],
      sectionGaps: [],
      elementGaps: [],
      paragraphGaps: []
    };

    // Sort elements by vertical position
    const sortedByY = [...elements].sort((a, b) => {
      const bbox1 = this.parseBoundingBox(a.boundingBox);
      const bbox2 = this.parseBoundingBox(b.boundingBox);
      return bbox1.y - bbox2.y;
    });

    // Calculate vertical gaps
    for (let i = 0; i < sortedByY.length - 1; i++) {
      const current = this.parseBoundingBox(sortedByY[i].boundingBox);
      const next = this.parseBoundingBox(sortedByY[i + 1].boundingBox);

      const gap = next.y - current.y2;

      if (gap > 0) {
        const spacingEntry = {
          gap,
          element1: sortedByY[i],
          element2: sortedByY[i + 1]
        };

        spacingAnalysis.verticalSpacing.push(spacingEntry);

        // Categorize by expected spacing
        if (gap >= this.brandGuidelines.sectionSpacing - 10 &&
            gap <= this.brandGuidelines.sectionSpacing + 10) {
          spacingAnalysis.sectionGaps.push(spacingEntry);
        } else if (gap >= this.brandGuidelines.elementSpacing - 5 &&
                   gap <= this.brandGuidelines.elementSpacing + 5) {
          spacingAnalysis.elementGaps.push(spacingEntry);
        } else if (gap >= this.brandGuidelines.paragraphSpacing - 3 &&
                   gap <= this.brandGuidelines.paragraphSpacing + 3) {
          spacingAnalysis.paragraphGaps.push(spacingEntry);
        }
      }
    }

    // Sort elements by horizontal position
    const sortedByX = [...elements].sort((a, b) => {
      const bbox1 = this.parseBoundingBox(a.boundingBox);
      const bbox2 = this.parseBoundingBox(b.boundingBox);
      return bbox1.x - bbox2.x;
    });

    // Calculate horizontal gaps
    for (let i = 0; i < sortedByX.length - 1; i++) {
      const current = this.parseBoundingBox(sortedByX[i].boundingBox);
      const next = this.parseBoundingBox(sortedByX[i + 1].boundingBox);

      const gap = next.x - current.x2;

      if (gap > 0) {
        spacingAnalysis.horizontalSpacing.push({
          gap,
          element1: sortedByX[i],
          element2: sortedByX[i + 1]
        });
      }
    }

    return spacingAnalysis;
  }

  /**
   * Detect all spatial issues in a set of elements
   */
  analyzeLayout(elements) {
    const issues = [];
    const warnings = [];
    const insights = [];

    // Check for overlapping elements
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const overlap = this.detectOverlap(
          elements[i].boundingBox,
          elements[j].boundingBox
        );

        if (overlap.overlaps && overlap.overlapPercentage1 > 5) {
          issues.push({
            type: 'element_overlap',
            severity: overlap.overlapPercentage1 > 20 ? 'critical' : 'warning',
            element1: elements[i],
            element2: elements[j],
            overlapArea: overlap.overlapArea,
            overlapPercentage: Math.max(overlap.overlapPercentage1, overlap.overlapPercentage2)
          });
        }
      }
    }

    // Check logo clearspace
    const logos = elements.filter(el => el.type === 'logo');
    for (const logo of logos) {
      const validation = this.validateLogoClearspace(
        logo.boundingBox,
        logo.height,
        elements.map(el => el.boundingBox)
      );

      if (!validation.compliant) {
        issues.push({
          type: 'logo_clearspace_violation',
          severity: 'critical',
          logo,
          violations: validation.violations
        });
      }
    }

    // Check touch targets for interactive elements
    const interactiveTypes = ['button', 'cta', 'link'];
    const interactive = elements.filter(el => interactiveTypes.includes(el.type));

    for (const element of interactive) {
      const validation = this.validateTouchTarget(element.boundingBox);

      if (!validation.compliant) {
        warnings.push({
          type: 'touch_target_too_small',
          severity: 'accessibility',
          element,
          issues: validation.issues
        });
      }
    }

    // Check grid alignment
    for (const element of elements) {
      const alignment = this.checkGridAlignment(element.boundingBox);

      if (!alignment.alignedLeft && !alignment.alignedRight) {
        insights.push({
          type: 'grid_alignment_off',
          severity: 'minor',
          element,
          leftOffset: alignment.leftOffset,
          rightOffset: alignment.rightOffset
        });
      }
    }

    // Analyze spacing
    const spacing = this.measureSpacing(elements);

    // Check for spacing violations
    for (const gap of spacing.verticalSpacing) {
      if (gap.gap < this.brandGuidelines.paragraphSpacing) {
        warnings.push({
          type: 'spacing_too_tight',
          severity: 'minor',
          gap: gap.gap,
          expected: this.brandGuidelines.paragraphSpacing,
          elements: [gap.element1, gap.element2]
        });
      }
    }

    return {
      issues,
      warnings,
      insights,
      spacing,
      summary: {
        totalElements: elements.length,
        overlappingElements: issues.filter(i => i.type === 'element_overlap').length,
        clearspaceViolations: issues.filter(i => i.type === 'logo_clearspace_violation').length,
        accessibilityIssues: warnings.filter(w => w.severity === 'accessibility').length,
        gridAlignmentIssues: insights.filter(i => i.type === 'grid_alignment_off').length
      }
    };
  }

  /**
   * Generate visual markup data for designer review
   */
  generateMarkup(elements, issues) {
    const markup = {
      boundingBoxes: [],
      clearspaceZones: [],
      gridLines: [],
      annotations: []
    };

    // Add bounding boxes for all elements
    for (const element of elements) {
      const bbox = this.parseBoundingBox(element.boundingBox);
      markup.boundingBoxes.push({
        ...bbox,
        type: element.type,
        label: element.content || element.type,
        color: this.getColorForType(element.type)
      });
    }

    // Add clearspace zones for logos
    const logos = elements.filter(el => el.type === 'logo');
    for (const logo of logos) {
      const bbox = this.parseBoundingBox(logo.boundingBox);
      const clearspace = logo.height || this.brandGuidelines.logoMinimumClearspace;

      markup.clearspaceZones.push({
        x: bbox.x - clearspace,
        y: bbox.y - clearspace,
        width: bbox.width + 2 * clearspace,
        height: bbox.height + 2 * clearspace,
        label: `${clearspace}pt clearspace`,
        color: 'rgba(255, 165, 0, 0.3)'
      });
    }

    // Add grid lines
    const columnWidth = (this.pageWidth - 2 * this.marginSize - (this.gridColumns - 1) * this.gutterWidth) / this.gridColumns;

    for (let i = 0; i <= this.gridColumns; i++) {
      const x = this.marginSize + i * (columnWidth + this.gutterWidth);
      markup.gridLines.push({
        x1: x,
        y1: 0,
        x2: x,
        y2: this.pageHeight,
        type: 'column',
        color: 'rgba(0, 150, 255, 0.2)'
      });
    }

    // Add margin lines
    markup.gridLines.push(
      { x1: this.marginSize, y1: 0, x2: this.marginSize, y2: this.pageHeight, type: 'margin', color: 'rgba(255, 0, 0, 0.3)' },
      { x1: this.pageWidth - this.marginSize, y1: 0, x2: this.pageWidth - this.marginSize, y2: this.pageHeight, type: 'margin', color: 'rgba(255, 0, 0, 0.3)' },
      { x1: 0, y1: this.marginSize, x2: this.pageWidth, y2: this.marginSize, type: 'margin', color: 'rgba(255, 0, 0, 0.3)' },
      { x1: 0, y1: this.pageHeight - this.marginSize, x2: this.pageWidth, y2: this.pageHeight - this.marginSize, type: 'margin', color: 'rgba(255, 0, 0, 0.3)' }
    );

    // Add annotations for issues
    for (const issue of issues) {
      if (issue.type === 'element_overlap') {
        const bbox1 = this.parseBoundingBox(issue.element1.boundingBox);
        markup.annotations.push({
          x: bbox1.x + bbox1.width / 2,
          y: bbox1.y + bbox1.height / 2,
          text: `Overlap: ${issue.overlapPercentage.toFixed(1)}%`,
          severity: issue.severity,
          color: 'red'
        });
      } else if (issue.type === 'logo_clearspace_violation') {
        const bbox = this.parseBoundingBox(issue.logo.boundingBox);
        markup.annotations.push({
          x: bbox.x + bbox.width / 2,
          y: bbox.y - 20,
          text: `Clearspace violation: ${issue.violations.length} sides`,
          severity: 'critical',
          color: 'red'
        });
      }
    }

    return markup;
  }

  /**
   * Get color for element type
   */
  getColorForType(type) {
    const colors = {
      logo: 'rgba(255, 0, 0, 0.5)',
      heading: 'rgba(0, 128, 255, 0.5)',
      text: 'rgba(0, 200, 0, 0.5)',
      image: 'rgba(255, 128, 0, 0.5)',
      cta: 'rgba(255, 0, 255, 0.5)',
      button: 'rgba(255, 0, 255, 0.5)'
    };

    return colors[type] || 'rgba(128, 128, 128, 0.5)';
  }
}

module.exports = ObjectAnalyzer;
