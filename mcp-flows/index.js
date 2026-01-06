/**
 * MCP Flows - Optional Integrations
 *
 * This module provides optional MCP flow integrations for:
 * - Figma: Brand token extraction
 * - DALL-E: AI image generation
 * - GitHub: Repository syncing
 * - Notion: Knowledge base recording
 * - MongoDB: Job archiving
 *
 * All flows are non-blocking and gracefully skip if not configured.
 */

const { runFigmaFlow } = require('./figmaBrand');
const { runDalleFlow } = require('./dalleImages');
const { runGitHubFlow } = require('./githubSync');
const { runNotionFlow } = require('./notionSync');
const { runMongoFlow } = require('./mongoArchive');

module.exports = {
  runFigmaFlow,
  runDalleFlow,
  runGitHubFlow,
  runNotionFlow,
  runMongoFlow
};
