/**
 * Figma MCP Flow
 * Optional hook for Figma brand token extraction
 */

const MCPManager = require('../mcp-manager');

/**
 * Run Figma brand check operation for job
 * @param {object} jobContext - Job data
 * @param {MCPManager} mcpManager - MCP Manager instance
 * @returns {Promise<object>} - Result with status: 'success'|'skipped'|'error'
 */
async function runFigmaFlow(jobContext, mcpManager) {
  // Check if enabled in job
  const enabled = jobContext.mcpFeatures?.useFigmaBrandCheck || false;
  if (!enabled) {
    console.log('[MCP Flow] Figma - SKIPPED (not enabled in job)');
    return { status: 'skipped', reason: 'not_enabled' };
  }

  // Check if server is configured
  const serverStatus = mcpManager.getServerStatus('figma');
  if (serverStatus.status === 'not_found') {
    console.log('[MCP Flow] Figma - SKIPPED (server not configured)');
    return { status: 'skipped', reason: 'not_configured' };
  }

  // Check environment variables
  const requiredEnv = process.env.FIGMA_ACCESS_TOKEN;
  if (!requiredEnv) {
    console.log('[MCP Flow] Figma - SKIPPED (missing API credentials)');
    return { status: 'skipped', reason: 'missing_credentials' };
  }

  try {
    console.log('[MCP Flow] Figma - RUNNING...');

    // STUB: Log what would happen
    console.log('[MCP Flow] Figma - Would call: figma.extractDesignTokens()');
    console.log('[MCP Flow] Figma - Job ID:', jobContext.jobId);

    // TODO: Actual MCP call
    // const result = await mcpManager.invoke('figma', 'extractDesignTokens', params);

    console.log('[MCP Flow] Figma - SUCCESS (stub)');
    return {
      status: 'success',
      data: { note: 'Stub implementation - no actual call made' }
    };

  } catch (error) {
    console.error('[MCP Flow] Figma - ERROR:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
}

module.exports = { runFigmaFlow };
