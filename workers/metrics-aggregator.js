/**
 * Metrics Aggregator
 *
 * Aggregates telemetry data every 15 minutes
 * Calculates P50, P95, P99 latency, success rates, error rates, and spend
 */

const fs = require('fs').promises;
const path = require('path');
const { readOperationLogs, LOG_DIRS, recordMetric } = require('./telemetry');

// Aggregation interval (15 minutes in milliseconds)
const AGGREGATION_INTERVAL = 15 * 60 * 1000;

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedArray, p) {
  if (sortedArray.length === 0) return null;

  const index = (p / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sortedArray.length) return sortedArray[lower];

  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

/**
 * Aggregate metrics from logs for a time period
 *
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {object} Aggregated metrics
 */
async function aggregateMetrics(startTime, endTime) {
  const startDate = startTime.toISOString().split('T')[0];
  const endDate = endTime.toISOString().split('T')[0];

  // Read all logs in date range
  const logs = await readOperationLogs(startDate, endDate);

  // Filter to time range
  const filteredLogs = logs.filter(log => {
    const logTime = new Date(log.timestamp);
    return logTime >= startTime && logTime <= endTime;
  });

  if (filteredLogs.length === 0) {
    return {
      timestamp: new Date().toISOString(),
      period_start: startTime.toISOString(),
      period_end: endTime.toISOString(),
      total_operations: 0,
      latency: { p50: null, p95: null, p99: null, avg: null },
      success_rate: null,
      error_rate: null,
      total_cost: 0,
      operations_by_type: {},
      errors_by_service: {}
    };
  }

  // Calculate latency percentiles
  const latencies = filteredLogs
    .map(log => log.latency_ms)
    .filter(l => l !== null && l !== undefined)
    .sort((a, b) => a - b);

  const p50 = percentile(latencies, 50);
  const p95 = percentile(latencies, 95);
  const p99 = percentile(latencies, 99);
  const avgLatency = latencies.length > 0
    ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
    : null;

  // Calculate success rate
  const successCount = filteredLogs.filter(log => log.status === 'success').length;
  const totalCount = filteredLogs.length;
  const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : null;
  const errorRate = totalCount > 0 ? ((totalCount - successCount) / totalCount) * 100 : null;

  // Calculate total cost
  const totalCost = filteredLogs.reduce((sum, log) => sum + (log.cost_usd || 0), 0);

  // Count operations by type
  const operationsByType = {};
  filteredLogs.forEach(log => {
    operationsByType[log.operation] = (operationsByType[log.operation] || 0) + 1;
  });

  // Count errors by service
  const errorsByService = {};
  filteredLogs
    .filter(log => log.status !== 'success')
    .forEach(log => {
      const service = log.api_calls?.[0]?.service || 'unknown';
      errorsByService[service] = (errorsByService[service] || 0) + 1;
    });

  return {
    timestamp: new Date().toISOString(),
    period_start: startTime.toISOString(),
    period_end: endTime.toISOString(),
    total_operations: totalCount,
    latency: {
      p50: p50 ? Math.round(p50) : null,
      p95: p95 ? Math.round(p95) : null,
      p99: p99 ? Math.round(p99) : null,
      avg: avgLatency ? Math.round(avgLatency) : null
    },
    success_rate: successRate ? parseFloat(successRate.toFixed(2)) : null,
    error_rate: errorRate ? parseFloat(errorRate.toFixed(2)) : null,
    total_cost: parseFloat(totalCost.toFixed(2)),
    operations_by_type: operationsByType,
    errors_by_service: errorsByService
  };
}

/**
 * Aggregate daily metrics
 *
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {object} Daily aggregated metrics
 */
async function aggregateDailyMetrics(date) {
  const startTime = new Date(`${date}T00:00:00.000Z`);
  const endTime = new Date(`${date}T23:59:59.999Z`);

  return await aggregateMetrics(startTime, endTime);
}

/**
 * Aggregate monthly metrics
 *
 * @param {string} yearMonth - Year-month (YYYY-MM)
 * @returns {object} Monthly aggregated metrics
 */
async function aggregateMonthlyMetrics(yearMonth) {
  const [year, month] = yearMonth.split('-');
  const startTime = new Date(`${year}-${month}-01T00:00:00.000Z`);

  // Get last day of month
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  const endTime = new Date(`${year}-${month}-${lastDay.toString().padStart(2, '0')}T23:59:59.999Z`);

  return await aggregateMetrics(startTime, endTime);
}

/**
 * Write aggregated metrics to log file
 */
async function writeAggregatedMetrics(metrics) {
  const logFile = path.join(LOG_DIRS.metrics, 'aggregated.jsonl');
  const logLine = JSON.stringify(metrics) + '\n';

  try {
    await fs.appendFile(logFile, logLine, 'utf8');
    console.log(`[METRICS] Aggregated metrics written: ${metrics.total_operations} ops, P95=${metrics.latency.p95}ms, success=${metrics.success_rate}%`);
  } catch (error) {
    console.error(`Failed to write aggregated metrics:`, error.message);
  }
}

/**
 * Run periodic aggregation (every 15 minutes)
 */
async function runPeriodicAggregation() {
  console.log('[METRICS] Running periodic aggregation...');

  const now = new Date();
  const fifteenMinutesAgo = new Date(now.getTime() - AGGREGATION_INTERVAL);

  try {
    const metrics = await aggregateMetrics(fifteenMinutesAgo, now);
    await writeAggregatedMetrics(metrics);

    // Also record individual metrics for Grafana
    if (metrics.latency.p50 !== null) {
      await recordMetric('orchestrator.latency.p50', metrics.latency.p50, { period: '15m' });
      await recordMetric('orchestrator.latency.p95', metrics.latency.p95, { period: '15m' });
      await recordMetric('orchestrator.latency.p99', metrics.latency.p99, { period: '15m' });
    }

    if (metrics.success_rate !== null) {
      await recordMetric('orchestrator.success_rate', metrics.success_rate, { period: '15m' });
      await recordMetric('orchestrator.error_rate', metrics.error_rate, { period: '15m' });
    }

    await recordMetric('orchestrator.cost.total', metrics.total_cost, { period: '15m' });
    await recordMetric('orchestrator.operations.count', metrics.total_operations, { period: '15m' });

  } catch (error) {
    console.error('[METRICS] Aggregation failed:', error.message);
  }
}

/**
 * Start the aggregator (runs every 15 minutes)
 */
function startAggregator() {
  console.log('[METRICS] Starting metrics aggregator (15-minute intervals)...');

  // Run immediately on start
  runPeriodicAggregation();

  // Then run every 15 minutes
  setInterval(runPeriodicAggregation, AGGREGATION_INTERVAL);
}

/**
 * Get latest aggregated metrics
 */
async function getLatestMetrics() {
  const logFile = path.join(LOG_DIRS.metrics, 'aggregated.jsonl');

  try {
    const content = await fs.readFile(logFile, 'utf8');
    const lines = content.trim().split('\n');

    if (lines.length === 0) return null;

    // Return last line (most recent)
    return JSON.parse(lines[lines.length - 1]);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File doesn't exist yet
    }
    throw error;
  }
}

/**
 * Calculate cost per document
 */
async function getCostPerDocument(startDate, endDate) {
  const logs = await readOperationLogs(startDate, endDate);

  const documentOps = logs.filter(log => log.operation === 'generate_document');
  const totalCost = documentOps.reduce((sum, log) => sum + (log.cost_usd || 0), 0);
  const totalDocs = documentOps.length;

  return totalDocs > 0 ? totalCost / totalDocs : 0;
}

module.exports = {
  aggregateMetrics,
  aggregateDailyMetrics,
  aggregateMonthlyMetrics,
  startAggregator,
  runPeriodicAggregation,
  getLatestMetrics,
  getCostPerDocument,
  percentile
};
