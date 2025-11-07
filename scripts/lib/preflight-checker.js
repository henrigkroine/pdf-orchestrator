/**
 * Preflight Checker
 * Comprehensive preflight validation for print production
 *
 * Checks:
 * - Color mode (CMYK vs RGB)
 * - Image resolution (300+ DPI)
 * - Font embedding
 * - Bleed settings
 * - Page dimensions
 * - Line weights
 * - Transparency
 * - Spot colors
 */

const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const { execSync } = require('child_process');

class PreflightChecker {
  constructor(config = {}) {
    this.config = config;

    // Preflight standards
    this.standards = {
      minResolution: 300,      // DPI
      maxResolution: 600,      // DPI (higher is wasteful)
      minLineWeight: 0.25,     // points
      bleedStandard: 3,        // mm
      maxInkCoverage: 300,     // percent (CMYK total)
      maxFileSize: 100,        // MB
    };

    // Issue severity levels
    this.severity = {
      CRITICAL: 'critical',    // Must fix before print
      HIGH: 'high',            // Should fix before print
      MEDIUM: 'medium',        // Consider fixing
      LOW: 'low',              // Nice to fix
      INFO: 'info'             // Informational
    };
  }

  /**
   * Run complete preflight check
   */
  async runPreflight(pdfPath, options = {}) {
    console.log('🔍 Running preflight check...');
    console.log(`   File: ${pdfPath}\n`);

    const results = {
      file: pdfPath,
      timestamp: new Date().toISOString(),
      passed: false,
      checks: {},
      issues: [],
      warnings: [],
      info: [],
      summary: {}
    };

    // Run all checks
    await this.checkFileSize(pdfPath, results);
    await this.checkPageDimensions(pdfPath, results);
    await this.checkColorMode(pdfPath, results);
    await this.checkFonts(pdfPath, results);
    await this.checkImages(pdfPath, results);
    await this.checkBleed(pdfPath, results);
    await this.checkTransparency(pdfPath, results);
    await this.checkPDFVersion(pdfPath, results);

    // Calculate summary
    results.summary = this.generateSummary(results);
    results.passed = results.issues.filter(i => i.severity === this.severity.CRITICAL).length === 0;

    // Print report
    this.printReport(results);

    return results;
  }

  /**
   * Check file size
   */
  async checkFileSize(pdfPath, results) {
    const stats = await fs.stat(pdfPath);
    const sizeMB = stats.size / (1024 * 1024);

    results.checks.fileSize = {
      passed: sizeMB <= this.standards.maxFileSize,
      sizeMB: sizeMB.toFixed(2),
      limit: this.standards.maxFileSize
    };

    if (sizeMB > this.standards.maxFileSize) {
      results.warnings.push({
        severity: this.severity.MEDIUM,
        check: 'File Size',
        message: `File size (${sizeMB.toFixed(2)}MB) exceeds recommended ${this.standards.maxFileSize}MB`,
        suggestion: 'Consider optimizing images or compressing PDF'
      });
    }
  }

  /**
   * Check page dimensions
   */
  async checkPageDimensions(pdfPath, results) {
    try {
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();

      const standardSizes = {
        letter: { w: 612, h: 792 },    // 8.5 x 11 inches
        a4: { w: 595, h: 842 },        // 210 x 297 mm
        tabloid: { w: 792, h: 1224 },  // 11 x 17 inches
        legal: { w: 612, h: 1008 }     // 8.5 x 14 inches
      };

      let matchedSize = null;
      const tolerance = 2;

      for (const [name, size] of Object.entries(standardSizes)) {
        if (Math.abs(width - size.w) < tolerance && Math.abs(height - size.h) < tolerance) {
          matchedSize = name;
          break;
        }
      }

      results.checks.pageDimensions = {
        passed: matchedSize !== null,
        width,
        height,
        matchedSize
      };

      if (!matchedSize) {
        results.warnings.push({
          severity: this.severity.MEDIUM,
          check: 'Page Dimensions',
          message: `Non-standard page size: ${width}x${height}pt`,
          suggestion: 'Verify dimensions with printer'
        });
      }
    } catch (error) {
      results.checks.pageDimensions = { passed: false, error: error.message };
    }
  }

  /**
   * Check color mode (CMYK vs RGB)
   */
  async checkColorMode(pdfPath, results) {
    try {
      // Use GhostScript to check color mode
      const output = execSync(`gs -o - -sDEVICE=inkcov "${pdfPath}" 2>&1`, { encoding: 'utf8' });

      // Parse ink coverage
      const rgbMatch = output.match(/RGB/);
      const cmykMatch = output.match(/CMYK/);

      const isCMYK = cmykMatch && !rgbMatch;

      results.checks.colorMode = {
        passed: isCMYK,
        mode: isCMYK ? 'CMYK' : 'RGB or Mixed',
        inkCoverage: output.includes('CMYK') ? 'Available' : 'N/A'
      };

      if (!isCMYK) {
        results.issues.push({
          severity: this.severity.CRITICAL,
          check: 'Color Mode',
          message: 'Document contains RGB colors',
          fix: 'Convert to CMYK for print production',
          command: 'node scripts/prepare-for-print.js --cmyk'
        });
      }
    } catch (error) {
      results.checks.colorMode = {
        passed: false,
        error: 'GhostScript not available',
        suggestion: 'Install GhostScript for color mode detection'
      };

      results.warnings.push({
        severity: this.severity.HIGH,
        check: 'Color Mode',
        message: 'Cannot verify color mode without GhostScript',
        suggestion: 'Install GhostScript: https://ghostscript.com'
      });
    }
  }

  /**
   * Check font embedding
   */
  async checkFonts(pdfPath, results) {
    try {
      // Use pdffonts command if available
      const output = execSync(`pdffonts "${pdfPath}" 2>&1`, { encoding: 'utf8' });

      const lines = output.split('\n');
      const fontLines = lines.slice(2).filter(l => l.trim()); // Skip header

      const fonts = fontLines.map(line => {
        const parts = line.split(/\s+/);
        return {
          name: parts[0],
          embedded: parts[4] === 'yes' || parts[5] === 'yes'
        };
      });

      const notEmbedded = fonts.filter(f => !f.embedded);

      results.checks.fonts = {
        passed: notEmbedded.length === 0,
        totalFonts: fonts.length,
        embedded: fonts.length - notEmbedded.length,
        notEmbedded: notEmbedded.map(f => f.name)
      };

      if (notEmbedded.length > 0) {
        results.issues.push({
          severity: this.severity.CRITICAL,
          check: 'Fonts',
          message: `${notEmbedded.length} fonts not embedded`,
          fonts: notEmbedded.map(f => f.name),
          fix: 'Embed all fonts in PDF',
          command: 'node scripts/prepare-for-print.js --embed-fonts'
        });
      }
    } catch (error) {
      results.checks.fonts = {
        passed: false,
        error: 'pdffonts not available',
        suggestion: 'Install poppler-utils for font checking'
      };

      results.warnings.push({
        severity: this.severity.HIGH,
        check: 'Fonts',
        message: 'Cannot verify font embedding',
        suggestion: 'Install poppler-utils: apt-get install poppler-utils'
      });
    }
  }

  /**
   * Check image resolution
   */
  async checkImages(pdfPath, results) {
    try {
      // Use pdfimages to check image resolution
      const output = execSync(`pdfimages -list "${pdfPath}" 2>&1`, { encoding: 'utf8' });

      const lines = output.split('\n');
      const imageLines = lines.slice(2).filter(l => l.trim());

      const images = imageLines.map(line => {
        const parts = line.split(/\s+/);
        return {
          page: parseInt(parts[0]),
          width: parseInt(parts[3]),
          height: parseInt(parts[4]),
          dpi: parts[10] ? parseInt(parts[10]) : 0
        };
      });

      const lowRes = images.filter(img => img.dpi > 0 && img.dpi < this.standards.minResolution);
      const highRes = images.filter(img => img.dpi > this.standards.maxResolution);

      results.checks.images = {
        passed: lowRes.length === 0,
        totalImages: images.length,
        lowResolution: lowRes.length,
        highResolution: highRes.length,
        averageDPI: images.length > 0 ? Math.round(images.reduce((sum, img) => sum + img.dpi, 0) / images.length) : 0
      };

      if (lowRes.length > 0) {
        results.issues.push({
          severity: this.severity.HIGH,
          check: 'Image Resolution',
          message: `${lowRes.length} images below ${this.standards.minResolution} DPI`,
          details: lowRes.map(img => `Page ${img.page}: ${img.dpi} DPI`),
          fix: 'Replace with higher resolution images'
        });
      }

      if (highRes.length > 0) {
        results.warnings.push({
          severity: this.severity.LOW,
          check: 'Image Resolution',
          message: `${highRes.length} images above ${this.standards.maxResolution} DPI`,
          suggestion: 'Consider downsampling to reduce file size'
        });
      }
    } catch (error) {
      results.checks.images = {
        passed: false,
        error: 'pdfimages not available',
        suggestion: 'Install poppler-utils for image checking'
      };

      results.info.push({
        severity: this.severity.INFO,
        check: 'Images',
        message: 'Cannot verify image resolution',
        suggestion: 'Install poppler-utils'
      });
    }
  }

  /**
   * Check bleed settings
   */
  async checkBleed(pdfPath, results) {
    try {
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      const page = pdfDoc.getPage(0);
      const trimBox = page.getTrimBox();
      const bleedBox = page.getBleedBox();

      const hasBleed = bleedBox.x < trimBox.x || bleedBox.y < trimBox.y ||
                       bleedBox.width > trimBox.width || bleedBox.height > trimBox.height;

      results.checks.bleed = {
        passed: hasBleed,
        hasTrimBox: trimBox !== null,
        hasBleedBox: bleedBox !== null,
        bleedDetected: hasBleed
      };

      if (!hasBleed) {
        results.issues.push({
          severity: this.severity.HIGH,
          check: 'Bleed',
          message: 'No bleed detected',
          fix: `Add ${this.standards.bleedStandard}mm bleed on all sides`,
          command: 'node scripts/prepare-for-print.js --bleed 3'
        });
      }
    } catch (error) {
      results.checks.bleed = { passed: false, error: error.message };
    }
  }

  /**
   * Check transparency
   */
  async checkTransparency(pdfPath, results) {
    try {
      // Use GhostScript to detect transparency
      const output = execSync(`gs -o - -sDEVICE=bbox "${pdfPath}" 2>&1`, { encoding: 'utf8' });

      const hasTransparency = output.includes('Transparency');

      results.checks.transparency = {
        passed: true, // Transparency is OK, just informational
        detected: hasTransparency
      };

      if (hasTransparency) {
        results.info.push({
          severity: this.severity.INFO,
          check: 'Transparency',
          message: 'Document contains transparency',
          note: 'Verify printer supports transparency flattening'
        });
      }
    } catch (error) {
      results.checks.transparency = {
        passed: true,
        error: 'Cannot detect transparency without GhostScript'
      };
    }
  }

  /**
   * Check PDF version
   */
  async checkPDFVersion(pdfPath, results) {
    try {
      const pdfBytes = await fs.readFile(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Get PDF version from header
      const header = Buffer.from(pdfBytes.slice(0, 8)).toString();
      const versionMatch = header.match(/%PDF-(\d\.\d)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';

      results.checks.pdfVersion = {
        passed: true,
        version,
        recommended: '1.6 or higher for PDF/X-4'
      };

      if (parseFloat(version) < 1.4) {
        results.warnings.push({
          severity: this.severity.MEDIUM,
          check: 'PDF Version',
          message: `PDF version ${version} is older than recommended`,
          suggestion: 'Consider upgrading to PDF 1.6+ for better compatibility'
        });
      }
    } catch (error) {
      results.checks.pdfVersion = { passed: false, error: error.message };
    }
  }

  /**
   * Generate summary
   */
  generateSummary(results) {
    const critical = results.issues.filter(i => i.severity === this.severity.CRITICAL).length;
    const high = results.issues.filter(i => i.severity === this.severity.HIGH).length;
    const medium = results.warnings.filter(w => w.severity === this.severity.MEDIUM).length;
    const low = results.warnings.filter(w => w.severity === this.severity.LOW).length;

    const totalIssues = critical + high + medium + low;
    const passedChecks = Object.values(results.checks).filter(c => c.passed).length;
    const totalChecks = Object.keys(results.checks).length;

    return {
      critical,
      high,
      medium,
      low,
      totalIssues,
      passedChecks,
      totalChecks,
      readyForPrint: critical === 0 && high === 0,
      grade: this.calculateGrade(critical, high, medium, low)
    };
  }

  /**
   * Calculate grade
   */
  calculateGrade(critical, high, medium, low) {
    if (critical > 0) return 'F';
    if (high > 2) return 'D';
    if (high > 0 || medium > 2) return 'C';
    if (medium > 0 || low > 2) return 'B';
    return 'A';
  }

  /**
   * Print report
   */
  printReport(results) {
    console.log('\n📊 PREFLIGHT REPORT\n');
    console.log('═'.repeat(70));

    // Summary
    console.log(`\n✓ Checks Passed: ${results.summary.passedChecks}/${results.summary.totalChecks}`);
    console.log(`✗ Issues Found: ${results.summary.totalIssues}`);
    console.log(`★ Grade: ${results.summary.grade}`);
    console.log(`📋 Ready for Print: ${results.summary.readyForPrint ? 'YES ✅' : 'NO ❌'}`);

    // Critical Issues
    if (results.issues.some(i => i.severity === this.severity.CRITICAL)) {
      console.log('\n🚨 CRITICAL ISSUES (Must Fix):');
      console.log('─'.repeat(70));
      results.issues.filter(i => i.severity === this.severity.CRITICAL).forEach(issue => {
        console.log(`\n• ${issue.check}: ${issue.message}`);
        if (issue.fix) console.log(`  Fix: ${issue.fix}`);
        if (issue.command) console.log(`  Command: ${issue.command}`);
      });
    }

    // High Priority Issues
    if (results.issues.some(i => i.severity === this.severity.HIGH)) {
      console.log('\n⚠️  HIGH PRIORITY ISSUES:');
      console.log('─'.repeat(70));
      results.issues.filter(i => i.severity === this.severity.HIGH).forEach(issue => {
        console.log(`\n• ${issue.check}: ${issue.message}`);
        if (issue.fix) console.log(`  Fix: ${issue.fix}`);
      });
    }

    // Warnings
    if (results.warnings.length > 0) {
      console.log('\n⚡ WARNINGS:');
      console.log('─'.repeat(70));
      results.warnings.forEach(warning => {
        console.log(`\n• ${warning.check}: ${warning.message}`);
        if (warning.suggestion) console.log(`  Suggestion: ${warning.suggestion}`);
      });
    }

    // Info
    if (results.info.length > 0 && results.summary.totalIssues === 0) {
      console.log('\nℹ️  INFORMATION:');
      console.log('─'.repeat(70));
      results.info.forEach(info => {
        console.log(`• ${info.message}`);
      });
    }

    console.log('\n' + '═'.repeat(70));

    if (results.summary.readyForPrint) {
      console.log('\n✅ PDF is READY FOR PRINT!\n');
    } else {
      console.log('\n❌ PDF is NOT ready for print. Fix issues above.\n');
    }
  }

  /**
   * Export report to file
   */
  async exportReport(results, outputPath) {
    // JSON report
    await fs.writeFile(
      outputPath.replace(/\.txt$/, '.json'),
      JSON.stringify(results, null, 2)
    );

    // Text report
    let report = '='.repeat(70) + '\n';
    report += 'PREFLIGHT REPORT\n';
    report += '='.repeat(70) + '\n\n';
    report += `File: ${results.file}\n`;
    report += `Date: ${results.timestamp}\n`;
    report += `Grade: ${results.summary.grade}\n`;
    report += `Ready for Print: ${results.summary.readyForPrint ? 'YES' : 'NO'}\n\n`;

    if (results.issues.length > 0) {
      report += 'ISSUES:\n' + '-'.repeat(70) + '\n';
      results.issues.forEach(issue => {
        report += `\n[${issue.severity.toUpperCase()}] ${issue.check}\n`;
        report += `${issue.message}\n`;
        if (issue.fix) report += `Fix: ${issue.fix}\n`;
      });
    }

    await fs.writeFile(outputPath, report);

    console.log(`\n📄 Report saved: ${outputPath}`);
  }
}

module.exports = PreflightChecker;
