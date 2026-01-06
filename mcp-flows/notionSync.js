/**
 * Notion MCP Flow
 * Optional hook for Notion knowledge base recording
 */

const MCPManager = require('../mcp-manager');

/**
 * Run Notion sync operation for job
 * @param {object} jobContext - Job data
 * @param {MCPManager} mcpManager - MCP Manager instance
 * @returns {Promise<object>} - Result with status: 'success'|'skipped'|'error'
 */
async function runNotionFlow(jobContext, mcpManager) {
  // Check if enabled in job
  const enabled = jobContext.mcpFeatures?.useNotionSummary || false;
  if (!enabled) {
    console.log('[MCP Flow] Notion - SKIPPED (not enabled in job)');
    return { status: 'skipped', reason: 'not_enabled' };
  }

  // Check if server is configured
  const serverStatus = mcpManager.getServerStatus('notion');
  if (serverStatus.status === 'not_found') {
    console.log('[MCP Flow] Notion - SKIPPED (server not configured)');
    return { status: 'skipped', reason: 'not_configured' };
  }

  // Check environment variables
  const requiredEnv = process.env.NOTION_API_KEY;
  if (!requiredEnv) {
    console.log('[MCP Flow] Notion - SKIPPED (missing API credentials)');
    return { status: 'skipped', reason: 'missing_credentials' };
  }

  try {
    console.log('[MCP Flow] Notion - RUNNING...');

    // STUB: Log what would happen
    console.log('[MCP Flow] Notion - Would call: notion.recordJobSummary()');
    console.log('[MCP Flow] Notion - Job ID:', jobContext.jobId);

    // TODO: Actual MCP call
    // const result = await mcpManager.invoke('notion', 'recordJobSummary', params);

    console.log('[MCP Flow] Notion - SUCCESS (stub)');
    return {
      status: 'success',
      data: { note: 'Stub implementation - no actual call made' }
    };

  } catch (error) {
    console.error('[MCP Flow] Notion - ERROR:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
}

module.exports = { runNotionFlow };
