/**
 * AI-specific logging utilities
 */

const LOG_PREFIX = "[AI]";

function log(message) {
  console.log(`${LOG_PREFIX} ${message}`);
}

function info(message) {
  console.log(`${LOG_PREFIX} ℹ ${message}`);
}

function warn(message) {
  console.warn(`${LOG_PREFIX} ⚠️  ${message}`);
}

function error(message) {
  console.error(`${LOG_PREFIX} ❌ ${message}`);
}

function success(message) {
  console.log(`${LOG_PREFIX} ✓ ${message}`);
}

function debug(message) {
  if (process.env.AI_DEBUG === '1') {
    console.log(`${LOG_PREFIX} [DEBUG] ${message}`);
  }
}

function section(title) {
  console.log(`\n${LOG_PREFIX} ` + "=".repeat(50));
  console.log(`${LOG_PREFIX} ${title}`);
  console.log(`${LOG_PREFIX} ` + "=".repeat(50));
}

function subsection(title) {
  console.log(`\n${LOG_PREFIX} ${title}`);
  console.log(`${LOG_PREFIX} ` + "-".repeat(50));
}

export default {
  log,
  info,
  warn,
  error,
  success,
  debug,
  section,
  subsection
};

// Named exports for convenience
export { log, info, warn, error, success, debug, section, subsection };
