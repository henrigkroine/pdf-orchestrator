/**
 * Grid System
 *
 * Implements various grid systems for layout design:
 * - Swiss Grid (12-column)
 * - Modular Grid (8pt baseline)
 * - Manuscript Grid (single column)
 * - Column Grid (multi-column)
 * - Custom grids
 *
 * @module grid-system
 */

class GridSystem {
  constructor() {
    // Standard grid presets
    this.presets = {
      swiss12: {
        name: 'Swiss 12-Column',
        columns: 12,
        gutters: 20,
        margins: { top: 40, right: 40, bottom: 40, left: 40 },
        baseline: 8,
        type: 'column'
      },
      swiss6: {
        name: 'Swiss 6-Column',
        columns: 6,
        gutters: 20,
        margins: { top: 40, right: 40, bottom: 40, left: 40 },
        baseline: 8,
        type: 'column'
      },
      modular: {
        name: 'Modular Grid',
        columns: 6,
        rows: 12,
        gutters: 20,
        margins: { top: 40, right: 40, bottom: 40, left: 40 },
        baseline: 8,
        type: 'modular'
      },
      manuscript: {
        name: 'Manuscript Grid',
        columns: 1,
        margins: { top: 72, right: 54, bottom: 72, left: 54 },
        maxLineLength: 66,  // characters per line
        type: 'manuscript'
      },
      magazine2col: {
        name: 'Magazine 2-Column',
        columns: 2,
        gutters: 30,
        margins: { top: 36, right: 36, bottom: 48, left: 36 },
        baseline: 12,
        type: 'column'
      },
      magazine3col: {
        name: 'Magazine 3-Column',
        columns: 3,
        gutters: 20,
        margins: { top: 36, right: 36, bottom: 48, left: 36 },
        baseline: 12,
        type: 'column'
      },
      newspaper: {
        name: 'Newspaper 5-Column',
        columns: 5,
        gutters: 12,
        margins: { top: 24, right: 24, bottom: 24, left: 24 },
        baseline: 11,
        type: 'column'
      }
    };

    // US Letter page size (default)
    this.defaultPage = {
      width: 612,   // 8.5 inches
      height: 792   // 11 inches
    };
  }

  /**
   * Create a grid structure
   */
  createGrid(gridConfig, page = this.defaultPage) {
    const config = typeof gridConfig === 'string'
      ? this.presets[gridConfig]
      : gridConfig;

    if (!config) {
      throw new Error('Invalid grid configuration');
    }

    const grid = {
      ...config,
      page: { ...page },
      contentArea: this.calculateContentArea(config, page),
      columnWidths: [],
      columnPositions: [],
      rowHeights: [],
      rowPositions: [],
      modules: [],
      guides: { vertical: [], horizontal: [] }
    };

    // Calculate column structure
    if (config.columns) {
      const { widths, positions } = this.calculateColumns(config, page);
      grid.columnWidths = widths;
      grid.columnPositions = positions;
      grid.guides.vertical = positions;
    }

    // Calculate row structure (for modular grids)
    if (config.rows) {
      const { heights, positions } = this.calculateRows(config, page);
      grid.rowHeights = heights;
      grid.rowPositions = positions;
      grid.guides.horizontal = positions;
    }

    // Calculate baseline grid
    if (config.baseline) {
      grid.baselineGrid = this.calculateBaselineGrid(config, page);
      grid.guides.horizontal.push(...grid.baselineGrid.map(y => y));
    }

    // Calculate modules (for modular grids)
    if (config.type === 'modular') {
      grid.modules = this.calculateModules(grid);
    }

    return grid;
  }

  /**
   * Calculate content area (inside margins)
   */
  calculateContentArea(config, page) {
    const margins = config.margins || { top: 40, right: 40, bottom: 40, left: 40 };

    return {
      x: margins.left,
      y: margins.top,
      width: page.width - margins.left - margins.right,
      height: page.height - margins.top - margins.bottom
    };
  }

  /**
   * Calculate column widths and positions
   */
  calculateColumns(config, page) {
    const contentArea = this.calculateContentArea(config, page);
    const columns = config.columns || 1;
    const gutter = config.gutters || 0;

    // Total gutter space
    const totalGutters = (columns - 1) * gutter;

    // Width available for columns
    const availableWidth = contentArea.width - totalGutters;

    // Equal column widths
    const columnWidth = availableWidth / columns;

    const widths = Array(columns).fill(columnWidth);
    const positions = [];

    let currentX = contentArea.x;
    for (let i = 0; i < columns; i++) {
      positions.push(currentX);
      currentX += columnWidth + gutter;
    }

    return { widths, positions };
  }

  /**
   * Calculate row heights and positions
   */
  calculateRows(config, page) {
    const contentArea = this.calculateContentArea(config, page);
    const rows = config.rows || 1;
    const gutter = config.gutters || 0;

    // Total gutter space
    const totalGutters = (rows - 1) * gutter;

    // Height available for rows
    const availableHeight = contentArea.height - totalGutters;

    // Equal row heights
    const rowHeight = availableHeight / rows;

    const heights = Array(rows).fill(rowHeight);
    const positions = [];

    let currentY = contentArea.y;
    for (let i = 0; i < rows; i++) {
      positions.push(currentY);
      currentY += rowHeight + gutter;
    }

    return { heights, positions };
  }

  /**
   * Calculate baseline grid
   */
  calculateBaselineGrid(config, page) {
    const baseline = config.baseline || 8;
    const margins = config.margins || { top: 40 };
    const positions = [];

    let y = margins.top;
    while (y < page.height - (margins.bottom || 40)) {
      positions.push(y);
      y += baseline;
    }

    return positions;
  }

  /**
   * Calculate modules (grid cells)
   */
  calculateModules(grid) {
    const modules = [];

    for (let row = 0; row < grid.rowPositions.length; row++) {
      for (let col = 0; col < grid.columnPositions.length; col++) {
        modules.push({
          row,
          col,
          x: grid.columnPositions[col],
          y: grid.rowPositions[row],
          width: grid.columnWidths[col],
          height: grid.rowHeights[row],
          id: `module-${row}-${col}`
        });
      }
    }

    return modules;
  }

  /**
   * Snap value to grid
   */
  snapToGrid(value, gridUnit) {
    return Math.round(value / gridUnit) * gridUnit;
  }

  /**
   * Snap position to column
   */
  snapToColumn(x, grid) {
    let closestColumn = 0;
    let minDistance = Math.abs(x - grid.columnPositions[0]);

    grid.columnPositions.forEach((pos, idx) => {
      const distance = Math.abs(x - pos);
      if (distance < minDistance) {
        minDistance = distance;
        closestColumn = idx;
      }
    });

    return {
      column: closestColumn,
      x: grid.columnPositions[closestColumn],
      distance: minDistance
    };
  }

  /**
   * Snap position to baseline
   */
  snapToBaseline(y, grid) {
    if (!grid.baselineGrid) return y;

    let closestY = grid.baselineGrid[0];
    let minDistance = Math.abs(y - closestY);

    grid.baselineGrid.forEach(baselineY => {
      const distance = Math.abs(y - baselineY);
      if (distance < minDistance) {
        minDistance = distance;
        closestY = baselineY;
      }
    });

    return closestY;
  }

  /**
   * Get column span dimensions
   */
  getColumnSpan(startColumn, spanCount, grid) {
    if (startColumn + spanCount > grid.columnPositions.length) {
      throw new Error(`Column span exceeds grid: ${startColumn} + ${spanCount}`);
    }

    const x = grid.columnPositions[startColumn];
    const endColumn = startColumn + spanCount - 1;

    // Calculate width including gutters
    let width = 0;
    for (let i = startColumn; i <= endColumn; i++) {
      width += grid.columnWidths[i];
      if (i < endColumn) {
        width += grid.gutters || 0;
      }
    }

    return {
      x,
      width,
      startColumn,
      endColumn,
      spanCount
    };
  }

  /**
   * Get row span dimensions
   */
  getRowSpan(startRow, spanCount, grid) {
    if (startRow + spanCount > grid.rowPositions.length) {
      throw new Error(`Row span exceeds grid: ${startRow} + ${spanCount}`);
    }

    const y = grid.rowPositions[startRow];
    const endRow = startRow + spanCount - 1;

    // Calculate height including gutters
    let height = 0;
    for (let i = startRow; i <= endRow; i++) {
      height += grid.rowHeights[i];
      if (i < endRow) {
        height += grid.gutters || 0;
      }
    }

    return {
      y,
      height,
      startRow,
      endRow,
      spanCount
    };
  }

  /**
   * Get module by position
   */
  getModule(row, col, grid) {
    return grid.modules.find(m => m.row === row && m.col === col);
  }

  /**
   * Get module span (multiple modules)
   */
  getModuleSpan(startRow, startCol, rowSpan, colSpan, grid) {
    const modules = [];

    for (let r = startRow; r < startRow + rowSpan; r++) {
      for (let c = startCol; c < startCol + colSpan; c++) {
        const module = this.getModule(r, c, grid);
        if (module) modules.push(module);
      }
    }

    if (modules.length === 0) return null;

    // Calculate combined dimensions
    const x = modules[0].x;
    const y = modules[0].y;
    const lastModule = modules[modules.length - 1];
    const width = lastModule.x + lastModule.width - x;
    const height = lastModule.y + lastModule.height - y;

    return {
      x,
      y,
      width,
      height,
      modules,
      startRow,
      startCol,
      rowSpan,
      colSpan
    };
  }

  /**
   * Create custom grid
   */
  createCustomGrid(config, page = this.defaultPage) {
    const customConfig = {
      name: config.name || 'Custom Grid',
      columns: config.columns || 12,
      rows: config.rows || null,
      gutters: config.gutters || 20,
      margins: config.margins || { top: 40, right: 40, bottom: 40, left: 40 },
      baseline: config.baseline || 8,
      type: config.rows ? 'modular' : 'column'
    };

    return this.createGrid(customConfig, page);
  }

  /**
   * Generate grid overlay for visualization
   */
  generateOverlay(grid, options = {}) {
    const {
      showColumns = true,
      showRows = true,
      showBaseline = false,
      showMargins = true,
      showModules = false
    } = options;

    const overlay = {
      page: grid.page,
      elements: []
    };

    // Margins
    if (showMargins) {
      overlay.elements.push({
        type: 'rectangle',
        x: 0,
        y: 0,
        width: grid.page.width,
        height: grid.page.height,
        stroke: '#FF0000',
        strokeWidth: 1,
        fill: 'none',
        label: 'Page'
      });

      overlay.elements.push({
        type: 'rectangle',
        x: grid.contentArea.x,
        y: grid.contentArea.y,
        width: grid.contentArea.width,
        height: grid.contentArea.height,
        stroke: '#0000FF',
        strokeWidth: 1,
        fill: 'none',
        label: 'Content Area'
      });
    }

    // Columns
    if (showColumns && grid.columnPositions) {
      grid.columnPositions.forEach((x, idx) => {
        overlay.elements.push({
          type: 'line',
          x1: x,
          y1: 0,
          x2: x,
          y2: grid.page.height,
          stroke: '#00FF00',
          strokeWidth: 1,
          opacity: 0.3,
          label: `Column ${idx + 1}`
        });

        // Column area
        overlay.elements.push({
          type: 'rectangle',
          x: x,
          y: grid.contentArea.y,
          width: grid.columnWidths[idx],
          height: grid.contentArea.height,
          stroke: 'none',
          fill: '#00FF00',
          opacity: 0.1
        });
      });
    }

    // Rows
    if (showRows && grid.rowPositions) {
      grid.rowPositions.forEach((y, idx) => {
        overlay.elements.push({
          type: 'line',
          x1: 0,
          y1: y,
          x2: grid.page.width,
          y2: y,
          stroke: '#FFA500',
          strokeWidth: 1,
          opacity: 0.3,
          label: `Row ${idx + 1}`
        });
      });
    }

    // Baseline grid
    if (showBaseline && grid.baselineGrid) {
      grid.baselineGrid.forEach((y, idx) => {
        // Only show every 4th baseline to avoid clutter
        if (idx % 4 === 0) {
          overlay.elements.push({
            type: 'line',
            x1: grid.contentArea.x,
            y1: y,
            x2: grid.contentArea.x + grid.contentArea.width,
            y2: y,
            stroke: '#FF00FF',
            strokeWidth: 0.5,
            opacity: 0.2,
            label: `Baseline ${idx}`
          });
        }
      });
    }

    // Modules
    if (showModules && grid.modules) {
      grid.modules.forEach(module => {
        overlay.elements.push({
          type: 'rectangle',
          x: module.x,
          y: module.y,
          width: module.width,
          height: module.height,
          stroke: '#0000FF',
          strokeWidth: 0.5,
          fill: 'none',
          opacity: 0.5,
          label: module.id
        });
      });
    }

    return overlay;
  }

  /**
   * Export grid to InDesign XML
   */
  exportToInDesignXML(grid) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Grid>
  <Page width="${grid.page.width}" height="${grid.page.height}" />
  <Margins top="${grid.margins.top}" right="${grid.margins.right}"
           bottom="${grid.margins.bottom}" left="${grid.margins.left}" />
  <Columns count="${grid.columns}" gutter="${grid.gutters}" />
  ${grid.rows ? `<Rows count="${grid.rows}" gutter="${grid.gutters}" />` : ''}
  ${grid.baseline ? `<Baseline increment="${grid.baseline}" start="${grid.margins.top}" />` : ''}
</Grid>`;
  }

  /**
   * Export grid to CSS Grid
   */
  exportToCSSGrid(grid) {
    const columnTemplate = grid.columnWidths
      .map(w => `${w}px`)
      .join(' ');

    const rowTemplate = grid.rowHeights
      ? grid.rowHeights.map(h => `${h}px`).join(' ')
      : 'auto';

    return {
      display: 'grid',
      gridTemplateColumns: columnTemplate,
      gridTemplateRows: rowTemplate,
      gap: `${grid.gutters}px`,
      margin: `${grid.margins.top}px ${grid.margins.right}px ${grid.margins.bottom}px ${grid.margins.left}px`,
      width: `${grid.page.width}px`,
      height: `${grid.page.height}px`
    };
  }

  /**
   * Validate element against grid
   */
  validateElement(element, grid) {
    const issues = [];

    // Check if element aligns to columns
    const columnSnap = this.snapToColumn(element.x, grid);
    if (columnSnap.distance > 5) {
      issues.push({
        type: 'alignment',
        message: `Element X (${element.x}) not aligned to column grid`,
        suggestion: `Move to column ${columnSnap.column} (x: ${columnSnap.x})`
      });
    }

    // Check if element aligns to baseline
    if (grid.baselineGrid) {
      const baselineY = this.snapToBaseline(element.y, grid);
      if (Math.abs(element.y - baselineY) > 2) {
        issues.push({
          type: 'baseline',
          message: `Element Y (${element.y}) not aligned to baseline grid`,
          suggestion: `Move to baseline (y: ${baselineY})`
        });
      }
    }

    // Check if element fits within content area
    if (element.x < grid.contentArea.x) {
      issues.push({
        type: 'margin',
        message: `Element extends into left margin`,
        suggestion: `Move right to x: ${grid.contentArea.x}`
      });
    }

    if (element.x + element.width > grid.contentArea.x + grid.contentArea.width) {
      issues.push({
        type: 'margin',
        message: `Element extends into right margin`,
        suggestion: `Reduce width or move left`
      });
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Get grid statistics
   */
  getStats(grid) {
    return {
      name: grid.name,
      type: grid.type,
      page: `${grid.page.width} × ${grid.page.height}pt`,
      contentArea: `${Math.round(grid.contentArea.width)} × ${Math.round(grid.contentArea.height)}pt`,
      columns: grid.columnPositions?.length || 0,
      rows: grid.rowPositions?.length || 0,
      modules: grid.modules?.length || 0,
      baseline: grid.baseline ? `${grid.baseline}pt` : 'None',
      gutters: grid.gutters ? `${grid.gutters}pt` : 'None',
      margins: grid.margins
    };
  }
}

module.exports = GridSystem;
