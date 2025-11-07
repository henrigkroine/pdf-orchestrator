/**
 * InDesign Automation via MCP
 *
 * Executes automated fixes in Adobe InDesign using MCP protocol.
 * Generates and runs ExtendScript for precise document manipulation.
 *
 * @module indesign-automation
 */

import net from 'net';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

/**
 * MCP Client for InDesign communication
 */
class MCPClient extends EventEmitter {
  constructor(host = 'localhost', port = 8012) {
    super();
    this.host = host;
    this.port = port;
    this.socket = null;
    this.connected = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
  }

  /**
   * Connect to MCP server
   */
  async connect() {
    return new Promise((resolve, reject) => {
      this.socket = new net.Socket();

      this.socket.on('connect', () => {
        this.connected = true;
        console.log(`✅ Connected to MCP server at ${this.host}:${this.port}`);
        resolve();
      });

      this.socket.on('data', (data) => {
        this.handleResponse(data);
      });

      this.socket.on('error', (error) => {
        console.error('❌ MCP connection error:', error);
        this.connected = false;
        reject(error);
      });

      this.socket.on('close', () => {
        this.connected = false;
        console.log('MCP connection closed');
      });

      this.socket.connect(this.port, this.host);
    });
  }

  /**
   * Execute ExtendScript in InDesign
   */
  async executeScript(script, timeout = 30000) {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const requestId = ++this.requestId;

      const request = {
        id: requestId,
        method: 'execute_script',
        params: { script }
      };

      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Script execution timeout'));
      }, timeout);

      this.pendingRequests.set(requestId, {
        resolve: (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        }
      });

      this.socket.write(JSON.stringify(request) + '\n');
    });
  }

  /**
   * Handle response from MCP server
   */
  handleResponse(data) {
    try {
      const response = JSON.parse(data.toString());

      if (response.id && this.pendingRequests.has(response.id)) {
        const { resolve, reject } = this.pendingRequests.get(response.id);
        this.pendingRequests.delete(response.id);

        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.result);
        }
      }
    } catch (error) {
      console.error('Error parsing MCP response:', error);
    }
  }

  /**
   * Disconnect from MCP server
   */
  disconnect() {
    if (this.socket) {
      this.socket.end();
      this.connected = false;
    }
  }
}

/**
 * Main InDesign Automation Class
 */
export class InDesignAutomation {
  constructor(options = {}) {
    this.options = {
      mcpHost: options.mcpHost || 'localhost',
      mcpPort: options.mcpPort || 8012,
      backupEnabled: options.backupEnabled !== false,
      verbose: options.verbose || false,
      ...options
    };

    this.mcp = new MCPClient(this.options.mcpHost, this.options.mcpPort);
    this.fixHistory = [];
  }

  /**
   * Initialize connection to InDesign
   */
  async initialize() {
    console.log('🔌 Initializing InDesign automation...');
    await this.mcp.connect();

    // Test connection
    const testResult = await this.testConnection();
    if (!testResult.success) {
      throw new Error('InDesign connection test failed');
    }

    console.log('✅ InDesign automation ready');
    return true;
  }

  /**
   * Test connection to InDesign
   */
  async testConnection() {
    try {
      const script = `
        app.name + " " + app.version;
      `;

      const result = await this.mcp.executeScript(script);

      return {
        success: true,
        indesignVersion: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Fix color violation
   */
  async fixColorViolation(violation) {
    console.log(`🎨 Fixing color violation: ${violation.description}`);

    const startTime = Date.now();

    try {
      // Create backup if enabled
      if (this.options.backupEnabled) {
        await this.createBackup();
      }

      const script = this.generateColorFixScript(violation);
      const result = await this.mcp.executeScript(script);

      const fix = {
        type: 'color_fix',
        violation: violation,
        success: true,
        timeElapsed: Date.now() - startTime,
        script: script,
        result: result,
        timestamp: new Date().toISOString()
      };

      this.fixHistory.push(fix);

      console.log(`  ✅ Fixed in ${fix.timeElapsed}ms`);
      return fix;

    } catch (error) {
      console.error(`  ❌ Fix failed:`, error.message);

      const fix = {
        type: 'color_fix',
        violation: violation,
        success: false,
        error: error.message,
        timeElapsed: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.fixHistory.push(fix);
      return fix;
    }
  }

  /**
   * Generate ExtendScript for color fix
   */
  generateColorFixScript(violation) {
    const { current, expected } = violation;

    // Parse current and expected colors
    const currentRgb = current.rgb;
    const expectedRgb = expected.rgb || expected.alternatives[0].rgb;
    const expectedName = expected.name || expected.alternatives[0].name;

    return `
      (function() {
        var doc = app.activeDocument;
        var fixedCount = 0;

        // Helper: RGB to InDesign color
        function rgbToColor(rgb, name) {
          try {
            // Check if color already exists
            try {
              return doc.colors.itemByName(name);
            } catch (e) {
              // Create new color
              var newColor = doc.colors.add();
              newColor.name = name;
              newColor.model = ColorModel.PROCESS;
              newColor.space = ColorSpace.RGB;
              newColor.colorValue = [rgb[0], rgb[1], rgb[2]];
              return newColor;
            }
          } catch (e) {
            return null;
          }
        }

        // Helper: Check if colors match
        function colorsMatch(color1, targetRgb, tolerance) {
          if (!color1 || !color1.space === ColorSpace.RGB) return false;
          var cv = color1.colorValue;
          var distance = Math.sqrt(
            Math.pow(cv[0] - targetRgb[0], 2) +
            Math.pow(cv[1] - targetRgb[1], 2) +
            Math.pow(cv[2] - targetRgb[2], 2)
          );
          return distance < tolerance;
        }

        var targetRgb = [${currentRgb.join(', ')}];
        var replacementRgb = [${expectedRgb.join(', ')}];
        var replacementColor = rgbToColor(replacementRgb, "${expectedName}");

        if (!replacementColor) {
          return { success: false, error: "Could not create replacement color" };
        }

        // Fix text frames
        for (var i = 0; i < doc.textFrames.length; i++) {
          var frame = doc.textFrames[i];

          // Check fill color
          if (frame.fillColor && colorsMatch(frame.fillColor, targetRgb, 15)) {
            frame.fillColor = replacementColor;
            fixedCount++;
          }

          // Check text color using find/change
          try {
            app.findGrepPreferences = NothingEnum.nothing;
            app.changeGrepPreferences = NothingEnum.nothing;

            app.findGrepPreferences.findWhat = ".+";

            var foundItems = frame.findGrep();
            for (var j = 0; j < foundItems.length; j++) {
              if (colorsMatch(foundItems[j].fillColor, targetRgb, 15)) {
                foundItems[j].fillColor = replacementColor;
                fixedCount++;
              }
            }

            app.findGrepPreferences = NothingEnum.nothing;
          } catch (e) {
            // Continue on error
          }
        }

        // Fix rectangles and shapes
        for (var i = 0; i < doc.rectangles.length; i++) {
          var rect = doc.rectangles[i];

          if (rect.fillColor && colorsMatch(rect.fillColor, targetRgb, 15)) {
            rect.fillColor = replacementColor;
            fixedCount++;
          }

          if (rect.strokeColor && colorsMatch(rect.strokeColor, targetRgb, 15)) {
            rect.strokeColor = replacementColor;
            fixedCount++;
          }
        }

        // Save document
        doc.save();

        return {
          success: true,
          fixedCount: fixedCount,
          message: "Replaced color in " + fixedCount + " locations"
        };
      })();
    `;
  }

  /**
   * Fix typography violation
   */
  async fixTypographyViolation(violation) {
    console.log(`✍️  Fixing typography violation: ${violation.description}`);

    const startTime = Date.now();

    try {
      if (this.options.backupEnabled) {
        await this.createBackup();
      }

      const script = this.generateTypographyFixScript(violation);
      const result = await this.mcp.executeScript(script);

      const fix = {
        type: 'typography_fix',
        violation: violation,
        success: true,
        timeElapsed: Date.now() - startTime,
        script: script,
        result: result,
        timestamp: new Date().toISOString()
      };

      this.fixHistory.push(fix);

      console.log(`  ✅ Fixed in ${fix.timeElapsed}ms`);
      return fix;

    } catch (error) {
      console.error(`  ❌ Fix failed:`, error.message);

      const fix = {
        type: 'typography_fix',
        violation: violation,
        success: false,
        error: error.message,
        timeElapsed: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.fixHistory.push(fix);
      return fix;
    }
  }

  /**
   * Generate ExtendScript for typography fix
   */
  generateTypographyFixScript(violation) {
    const { current, expected } = violation;

    return `
      (function() {
        var doc = app.activeDocument;
        var fixedCount = 0;

        // Helper: Get or create paragraph style
        function getOrCreateStyle(fontFamily, fontSize, isHeading) {
          var styleName = fontFamily + "_" + fontSize + "pt";

          try {
            return doc.paragraphStyles.itemByName(styleName);
          } catch (e) {
            var newStyle = doc.paragraphStyles.add();
            newStyle.name = styleName;
            newStyle.appliedFont = fontFamily;
            newStyle.pointSize = fontSize;

            if (isHeading) {
              newStyle.fontStyle = "Bold";
              newStyle.leading = fontSize * 1.2;
            } else {
              newStyle.fontStyle = "Regular";
              newStyle.leading = fontSize * 1.5;
            }

            return newStyle;
          }
        }

        var targetFont = "${expected.fontFamily}";
        var isHeading = ${violation.location?.element?.includes('h')};

        // Replace fonts in all text frames
        for (var i = 0; i < doc.textFrames.length; i++) {
          var frame = doc.textFrames[i];

          try {
            // Use find/change to replace font
            app.findGrepPreferences = NothingEnum.nothing;
            app.changeGrepPreferences = NothingEnum.nothing;

            app.findGrepPreferences.findWhat = ".+";
            app.changeGrepPreferences.appliedFont = targetFont;

            var changed = frame.changeGrep();
            if (changed.length > 0) {
              fixedCount += changed.length;
            }

            app.findGrepPreferences = NothingEnum.nothing;
            app.changeGrepPreferences = NothingEnum.nothing;

          } catch (e) {
            // Continue on error
          }
        }

        // Save document
        doc.save();

        return {
          success: true,
          fixedCount: fixedCount,
          message: "Changed font in " + fixedCount + " locations"
        };
      })();
    `;
  }

  /**
   * Fix text cutoff
   */
  async fixTextCutoff(violation) {
    console.log(`📏 Fixing text cutoff: ${violation.description}`);

    const startTime = Date.now();

    try {
      if (this.options.backupEnabled) {
        await this.createBackup();
      }

      const script = this.generateTextCutoffFixScript(violation);
      const result = await this.mcp.executeScript(script);

      const fix = {
        type: 'text_cutoff_fix',
        violation: violation,
        success: true,
        timeElapsed: Date.now() - startTime,
        script: script,
        result: result,
        timestamp: new Date().toISOString()
      };

      this.fixHistory.push(fix);

      console.log(`  ✅ Fixed in ${fix.timeElapsed}ms`);
      return fix;

    } catch (error) {
      console.error(`  ❌ Fix failed:`, error.message);

      const fix = {
        type: 'text_cutoff_fix',
        violation: violation,
        success: false,
        error: error.message,
        timeElapsed: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.fixHistory.push(fix);
      return fix;
    }
  }

  /**
   * Generate ExtendScript for text cutoff fix
   */
  generateTextCutoffFixScript(violation) {
    const searchText = violation.location?.text?.substring(0, 30) || '';

    return `
      (function() {
        var doc = app.activeDocument;
        var fixedCount = 0;

        // Find text frames with overset text
        for (var i = 0; i < doc.textFrames.length; i++) {
          var frame = doc.textFrames[i];

          // Check if frame has overset text
          if (frame.overflows) {
            // Strategy 1: Enable auto-sizing
            try {
              frame.textFramePreferences.autoSizingType = AutoSizingTypeEnum.HEIGHT_ONLY;
              frame.textFramePreferences.autoSizingReferencePoint =
                AutoSizingReferenceEnum.TOP_LEFT_POINT;

              if (!frame.overflows) {
                fixedCount++;
                continue;
              }
            } catch (e) {
              // Auto-sizing failed, try manual expansion
            }

            // Strategy 2: Manually expand frame
            try {
              var bounds = frame.geometricBounds;
              var expansion = 50; // Expand by 50pt

              frame.geometricBounds = [
                bounds[0],              // y1 (top)
                bounds[1],              // x1 (left)
                bounds[2] + expansion,  // y2 (bottom) - expand down
                bounds[3]               // x2 (right)
              ];

              if (!frame.overflows) {
                fixedCount++;
                continue;
              }
            } catch (e) {
              // Manual expansion failed
            }

            // Strategy 3: Reduce font size slightly
            try {
              var originalSize = frame.parentStory.pointSize;
              frame.parentStory.pointSize = originalSize - 1;

              if (!frame.overflows) {
                fixedCount++;
              } else {
                // Restore original size if it didn't help
                frame.parentStory.pointSize = originalSize;
              }
            } catch (e) {
              // Font size reduction failed
            }
          }
        }

        // Save document
        doc.save();

        return {
          success: true,
          fixedCount: fixedCount,
          message: "Fixed " + fixedCount + " text cutoffs"
        };
      })();
    `;
  }

  /**
   * Fix page dimensions
   */
  async fixPageDimensions(violation) {
    console.log(`📄 Fixing page dimensions: ${violation.description}`);

    const startTime = Date.now();

    try {
      if (this.options.backupEnabled) {
        await this.createBackup();
      }

      const script = `
        (function() {
          var doc = app.activeDocument;

          // Set page size to US Letter (8.5 x 11 inches)
          doc.documentPreferences.pageWidth = "8.5in";
          doc.documentPreferences.pageHeight = "11in";

          // Apply to all pages
          for (var i = 0; i < doc.pages.length; i++) {
            var page = doc.pages[i];
            page.resize(
              CoordinateSpaces.INNER_COORDINATES,
              AnchorPoint.CENTER_ANCHOR,
              ResizeMethods.REPLACING_CURRENT_DIMENSIONS_WITH,
              [612, 792]  // US Letter in points
            );
          }

          doc.save();

          return {
            success: true,
            message: "Page dimensions fixed"
          };
        })();
      `;

      const result = await this.mcp.executeScript(script);

      const fix = {
        type: 'page_dimension_fix',
        violation: violation,
        success: true,
        timeElapsed: Date.now() - startTime,
        script: script,
        result: result,
        timestamp: new Date().toISOString()
      };

      this.fixHistory.push(fix);

      console.log(`  ✅ Fixed in ${fix.timeElapsed}ms`);
      return fix;

    } catch (error) {
      console.error(`  ❌ Fix failed:`, error.message);

      const fix = {
        type: 'page_dimension_fix',
        violation: violation,
        success: false,
        error: error.message,
        timeElapsed: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

      this.fixHistory.push(fix);
      return fix;
    }
  }

  /**
   * Fix spacing violations
   */
  async fixSpacingViolation(violation) {
    console.log(`📐 Fixing spacing: ${violation.description}`);

    const startTime = Date.now();

    try {
      if (this.options.backupEnabled) {
        await this.createBackup();
      }

      const script = `
        (function() {
          var doc = app.activeDocument;

          // Set standard spacing
          doc.textDefaults.spaceAfter = 12; // 12pt between paragraphs
          doc.textDefaults.spaceBefore = 0;

          // Update all text frames
          for (var i = 0; i < doc.textFrames.length; i++) {
            var frame = doc.textFrames[i];

            // Apply spacing to paragraphs
            for (var j = 0; j < frame.paragraphs.length; j++) {
              frame.paragraphs[j].spaceAfter = 12;
            }
          }

          doc.save();

          return {
            success: true,
            message: "Spacing standardized"
          };
        })();
      `;

      const result = await this.mcp.executeScript(script);

      const fix = {
        type: 'spacing_fix',
        violation: violation,
        success: true,
        timeElapsed: Date.now() - startTime,
        result: result,
        timestamp: new Date().toISOString()
      };

      this.fixHistory.push(fix);

      console.log(`  ✅ Fixed in ${fix.timeElapsed}ms`);
      return fix;

    } catch (error) {
      console.error(`  ❌ Fix failed:`, error.message);

      const fix = {
        type: 'spacing_fix',
        violation: violation,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.fixHistory.push(fix);
      return fix;
    }
  }

  /**
   * Create backup of current document
   */
  async createBackup() {
    const script = `
      (function() {
        var doc = app.activeDocument;
        var originalPath = doc.fullName;
        var backupPath = originalPath.toString().replace(/\\.indd$/, "_backup_" + Date.now() + ".indd");

        doc.saveACopy(new File(backupPath));

        return {
          success: true,
          backupPath: backupPath
        };
      })();
    `;

    try {
      const result = await this.mcp.executeScript(script);
      console.log(`  💾 Backup created: ${result.backupPath}`);
      return result;
    } catch (error) {
      console.warn(`  ⚠️  Backup failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Rollback to backup
   */
  async rollback(backupPath) {
    const script = `
      (function() {
        app.open(new File("${backupPath}"));
        return { success: true };
      })();
    `;

    try {
      await this.mcp.executeScript(script);
      console.log(`  ↩️  Rolled back to backup`);
      return { success: true };
    } catch (error) {
      console.error(`  ❌ Rollback failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get fix history
   */
  getFixHistory() {
    return this.fixHistory;
  }

  /**
   * Get fix statistics
   */
  getFixStatistics() {
    const successful = this.fixHistory.filter(f => f.success).length;
    const failed = this.fixHistory.filter(f => !f.success).length;
    const totalTime = this.fixHistory.reduce((sum, f) => sum + (f.timeElapsed || 0), 0);

    return {
      total: this.fixHistory.length,
      successful: successful,
      failed: failed,
      successRate: this.fixHistory.length > 0 ?
        ((successful / this.fixHistory.length) * 100).toFixed(1) + '%' : '0%',
      totalTime: totalTime,
      averageTime: this.fixHistory.length > 0 ?
        (totalTime / this.fixHistory.length).toFixed(0) + 'ms' : '0ms'
    };
  }

  /**
   * Disconnect from InDesign
   */
  async disconnect() {
    this.mcp.disconnect();
    console.log('🔌 Disconnected from InDesign');
  }
}

export default InDesignAutomation;
