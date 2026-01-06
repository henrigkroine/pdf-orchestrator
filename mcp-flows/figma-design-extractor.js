/**
 * Figma Design Token Extraction MCP Flow
 *
 * Extracts design tokens (colors, typography, spacing) from Figma files and converts
 * them to InDesign-compatible formats. Validates against TEEI brand guidelines.
 * Non-blocking - failures gracefully degrade without stopping the pipeline.
 *
 * @module mcp-flows/figma-design-extractor
 */

const fs = require('fs');
const path = require('path');

/**
 * Run Figma design token extraction flow
 *
 * @param {Object} jobContext - Job configuration with Figma settings
 * @param {Object} mcpManager - MCP Manager instance
 * @returns {Promise<Object>} Flow result with status and extracted tokens
 */
async function runFigmaFlow(jobContext, mcpManager) {
  const startTime = Date.now();

  // Check if Figma brand check is enabled
  const enabled = jobContext.mcpFeatures?.useFigmaBrandCheck || false;
  if (!enabled) {
    return {
      status: 'skipped',
      reason: 'not_enabled',
      message: 'Figma brand check not enabled in job config'
    };
  }

  // Check if Figma server is configured
  const serverStatus = mcpManager.getServerStatus('figma');
  if (serverStatus.status === 'not_found') {
    console.log('[MCP Flow] Figma - Server not configured, skipping');
    return {
      status: 'skipped',
      reason: 'not_configured',
      message: 'Figma MCP server not found in configuration'
    };
  }

  // Check for required credentials
  const requiredEnv = process.env.FIGMA_ACCESS_TOKEN;
  if (!requiredEnv) {
    console.log('[MCP Flow] Figma - Missing FIGMA_ACCESS_TOKEN, skipping');
    return {
      status: 'skipped',
      reason: 'missing_credentials',
      message: 'FIGMA_ACCESS_TOKEN environment variable not set'
    };
  }

  try {
    console.log('[MCP Flow] Figma - RUNNING...');

    // Get Figma file ID from environment or job config
    const fileId = jobContext.figma?.fileId || process.env.FIGMA_FILE_ID || 'TEEI-Brand-System';
    console.log(`[MCP Flow] Figma - Extracting tokens from file: ${fileId}`);

    // Call Figma MCP to get design tokens
    const result = await mcpManager.invoke('figma', 'extract_design_tokens', {
      fileId: fileId,
      types: ['colors', 'typography', 'spacing']
    });

    if (result.status === 'success') {
      const tokens = result.data;

      // Create brand report directory
      const brandReportDir = `reports/brand`;
      if (!fs.existsSync(brandReportDir)) {
        fs.mkdirSync(brandReportDir, { recursive: true });
      }

      // Save brand tokens to file
      const brandReportPath = path.join(brandReportDir, `${jobContext.jobId}-figma-tokens.json`);
      fs.writeFileSync(brandReportPath, JSON.stringify(tokens, null, 2));
      console.log(`[MCP Flow] Figma - ✅ Brand tokens saved: ${brandReportPath}`);

      // Convert tokens to InDesign-compatible format
      const indesignTokens = convertToInDesignFormat(tokens);

      // Save InDesign-compatible tokens
      const indesignTokensPath = path.join(brandReportDir, `${jobContext.jobId}-indesign-tokens.json`);
      fs.writeFileSync(indesignTokensPath, JSON.stringify(indesignTokens, null, 2));
      console.log(`[MCP Flow] Figma - ✅ InDesign tokens saved: ${indesignTokensPath}`);

      // Validate against TFU brand requirements (if present)
      const brandValidation = validateBrandColors(tokens, jobContext);

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);

      console.log(`[MCP Flow] Figma - SUCCESS: Extracted ${Object.keys(tokens).length} token categories in ${duration}s`);

      return {
        status: 'success',
        data: {
          tokensExtracted: Object.keys(tokens).length,
          colors: tokens.colors?.length || 0,
          typography: tokens.typography?.length || 0,
          spacing: tokens.spacing?.length || 0,
          reportPath: brandReportPath,
          indesignTokensPath: indesignTokensPath,
          brandValidation: brandValidation,
          duration_seconds: parseFloat(duration)
        }
      };
    } else {
      throw new Error(result.message || 'Figma extraction failed');
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.error(`[MCP Flow] Figma - ERROR: ${error.message}`);

    return {
      status: 'error',
      error: error.message,
      duration_seconds: parseFloat(duration)
    };
  }
}

/**
 * Convert Figma design tokens to InDesign-compatible format
 *
 * @param {Object} tokens - Raw Figma tokens
 * @returns {Object} InDesign-compatible tokens
 */
function convertToInDesignFormat(tokens) {
  const indesignTokens = {};

  // Convert colors
  if (tokens.colors) {
    indesignTokens.colorSwatches = tokens.colors.map(color => {
      // Parse hex color to RGB/CMYK
      const hex = color.value || color.hex;
      const rgb = hexToRgb(hex);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

      return {
        name: color.name,
        colorSpace: 'RGB',
        colorValues: [rgb.r / 255, rgb.g / 255, rgb.b / 255],
        cmykValues: [cmyk.c, cmyk.m, cmyk.y, cmyk.k],
        hexValue: hex
      };
    });
  }

  // Convert typography
  if (tokens.typography) {
    indesignTokens.characterStyles = tokens.typography.map(typo => ({
      name: typo.name || typo.style,
      fontFamily: typo.fontFamily || 'Roboto Flex',
      fontStyle: typo.fontWeight || 'Regular',
      fontSize: parseFloat(typo.fontSize) || 12,
      lineHeight: parseFloat(typo.lineHeight) || 1.5,
      letterSpacing: parseFloat(typo.letterSpacing) || 0
    }));
  }

  // Convert spacing
  if (tokens.spacing) {
    indesignTokens.spacingScale = tokens.spacing.map(space => ({
      name: space.name,
      value: parseFloat(space.value) || 0,
      unit: space.unit || 'pt'
    }));
  }

  return indesignTokens;
}

/**
 * Validate extracted colors against TEEI brand guidelines
 *
 * @param {Object} tokens - Extracted design tokens
 * @param {Object} jobContext - Job configuration
 * @returns {Object} Validation results
 */
function validateBrandColors(tokens, jobContext) {
  const validation = {
    passed: true,
    warnings: [],
    matches: []
  };

  // TEEI official colors
  const teeiColors = {
    'Nordshore': '#00393F',
    'Sky': '#C9E4EC',
    'Sand': '#FFF1E2',
    'Beige': '#EFE1DC',
    'Moss': '#65873B',
    'Gold': '#BA8F5A',
    'Clay': '#913B2F'
  };

  // Check if expected TFU color is present
  const expectedColor = jobContext.tfu_requirements?.primary_color;
  if (expectedColor && tokens.colors) {
    const primaryColor = tokens.colors.find(c =>
      c.name === 'Primary' || c.name === 'Nordshore' || c.isPrimary
    );

    if (primaryColor) {
      const figmaHex = (primaryColor.value || primaryColor.hex).toLowerCase();
      const expectedHex = expectedColor.toLowerCase();

      console.log(`[MCP Flow] Figma - Primary color from Figma: ${figmaHex}`);
      console.log(`[MCP Flow] Figma - Expected TFU color: ${expectedHex}`);

      if (figmaHex === expectedHex) {
        console.log(`[MCP Flow] Figma - ✅ Color match!`);
        validation.matches.push({
          type: 'primary_color',
          expected: expectedHex,
          actual: figmaHex,
          matched: true
        });
      } else {
        console.log(`[MCP Flow] Figma - ⚠️  Color mismatch!`);
        validation.passed = false;
        validation.warnings.push({
          type: 'primary_color_mismatch',
          expected: expectedHex,
          actual: figmaHex,
          severity: 'high'
        });
      }
    } else {
      validation.warnings.push({
        type: 'missing_primary_color',
        message: 'No primary color found in Figma tokens',
        severity: 'medium'
      });
    }
  }

  // Check for TEEI official colors
  if (tokens.colors) {
    Object.entries(teeiColors).forEach(([name, hex]) => {
      const found = tokens.colors.find(c =>
        (c.value || c.hex).toLowerCase() === hex.toLowerCase()
      );

      if (found) {
        validation.matches.push({
          type: 'teei_official_color',
          name: name,
          hex: hex,
          figmaName: found.name
        });
      }
    });

    console.log(`[MCP Flow] Figma - Found ${validation.matches.length} official TEEI colors`);
  }

  return validation;
}

/**
 * Convert hex color to RGB
 *
 * @param {string} hex - Hex color code
 * @returns {Object} RGB values
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to CMYK (simplified conversion)
 *
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {Object} CMYK values (0-1)
 */
function rgbToCmyk(r, g, b) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 1 };
  }

  const c = (1 - rNorm - k) / (1 - k);
  const m = (1 - gNorm - k) / (1 - k);
  const y = (1 - bNorm - k) / (1 - k);

  return { c, m, y, k };
}

module.exports = { runFigmaFlow };
