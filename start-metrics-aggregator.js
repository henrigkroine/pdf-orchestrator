const { startAggregator } = require('./workers/metrics-aggregator');
const { initialize } = require('./workers/telemetry');

async function main() {
  console.log('[METRICS] Initializing telemetry system...');
  await initialize();

  console.log('[METRICS] Starting aggregator (15-minute intervals)...');
  startAggregator();

  console.log('[METRICS] Aggregator running. Press Ctrl+C to stop.');
}

main().catch(console.error);
