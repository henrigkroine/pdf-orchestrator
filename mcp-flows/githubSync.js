/**
 * GitHub MCP Flow
 * Optional hook for GitHub repository syncing
 */

const MCPManager = require('../mcp-manager');

/**
 * Run GitHub sync operation for job
 * @param {object} jobContext - Job data
 * @param {MCPManager} mcpManager - MCP Manager instance
 * @returns {Promise<object>} - Result with status: 'success'|'skipped'|'error'
 */
async function runGitHubFlow(jobContext, mcpManager) {
  // Check if enabled in job
  const enabled = jobContext.mcpFeatures?.useGitHubSync || false;
  if (!enabled) {
    console.log('[MCP Flow] GitHub - SKIPPED (not enabled in job)');
    return { status: 'skipped', reason: 'not_enabled' };
  }

  // Check if server is configured
  const serverStatus = mcpManager.getServerStatus('github');
  if (serverStatus.status === 'not_found') {
    console.log('[MCP Flow] GitHub - SKIPPED (server not configured)');
    return { status: 'skipped', reason: 'not_configured' };
  }

  // Check environment variables
  const requiredEnv = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN;
  if (!requiredEnv) {
    console.log('[MCP Flow] GitHub - SKIPPED (missing API credentials)');
    return { status: 'skipped', reason: 'missing_credentials' };
  }

  try {
    console.log('[MCP Flow] GitHub - RUNNING...');

    // STUB: Log what would happen
    console.log('[MCP Flow] GitHub - Would call: github.commitPDF()');
    console.log('[MCP Flow] GitHub - Job ID:', jobContext.jobId);

    // TODO: Actual MCP call
    // const result = await mcpManager.invoke('github', 'commitPDF', params);

    console.log('[MCP Flow] GitHub - SUCCESS (stub)');
    return {
      status: 'success',
      data: { note: 'Stub implementation - no actual call made' }
    };

  } catch (error) {
    console.error('[MCP Flow] GitHub - ERROR:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
}

module.exports = { runGitHubFlow };
