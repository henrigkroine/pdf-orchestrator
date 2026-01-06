/**
 * MongoDB MCP Flow
 * Optional hook for MongoDB job archiving
 */

const MCPManager = require('../mcp-manager');

/**
 * Run MongoDB archive operation for job
 * @param {object} jobContext - Job data
 * @param {MCPManager} mcpManager - MCP Manager instance
 * @returns {Promise<object>} - Result with status: 'success'|'skipped'|'error'
 */
async function runMongoFlow(jobContext, mcpManager) {
  // Check if enabled in job
  const enabled = jobContext.mcpFeatures?.useMongoArchive || false;
  if (!enabled) {
    console.log('[MCP Flow] MongoDB - SKIPPED (not enabled in job)');
    return { status: 'skipped', reason: 'not_enabled' };
  }

  // Check if server is configured
  const serverStatus = mcpManager.getServerStatus('mongodb');
  if (serverStatus.status === 'not_found') {
    console.log('[MCP Flow] MongoDB - SKIPPED (server not configured)');
    return { status: 'skipped', reason: 'not_configured' };
  }

  // Check environment variables
  const requiredEnv = process.env.MONGODB_URI;
  if (!requiredEnv) {
    console.log('[MCP Flow] MongoDB - SKIPPED (missing database URI)');
    return { status: 'skipped', reason: 'missing_credentials' };
  }

  try {
    console.log('[MCP Flow] MongoDB - RUNNING...');

    // STUB: Log what would happen
    console.log('[MCP Flow] MongoDB - Would call: mongodb.archiveJob()');
    console.log('[MCP Flow] MongoDB - Job ID:', jobContext.jobId);

    // TODO: Actual MCP call
    // const result = await mcpManager.invoke('mongodb', 'archiveJob', params);

    console.log('[MCP Flow] MongoDB - SUCCESS (stub)');
    return {
      status: 'success',
      data: { note: 'Stub implementation - no actual call made' }
    };

  } catch (error) {
    console.error('[MCP Flow] MongoDB - ERROR:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
}

module.exports = { runMongoFlow };
