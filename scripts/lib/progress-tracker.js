/**
 * PROGRESS TRACKER
 *
 * Real-time progress tracking with ETA calculation for batch operations.
 *
 * Features:
 * - Visual progress bar with percentage
 * - Accurate ETA calculation
 * - Pages per second throughput
 * - Time elapsed tracking
 * - Status updates (processing, cached, failed)
 * - Customizable display format
 *
 * Usage:
 *   const tracker = new ProgressTracker(totalItems);
 *   tracker.start();
 *   tracker.update(1, 'Analyzing page 1...');
 *   tracker.complete();
 */

import { performance } from 'perf_hooks';

class ProgressTracker {
  constructor(total, options = {}) {
    this.total = total;
    this.current = 0;
    this.startTime = null;
    this.endTime = null;
    this.updateInterval = options.updateInterval || 500; // ms
    this.lastUpdateTime = 0;
    this.enabled = options.enabled !== false;
    this.width = options.width || 40;

    this.stats = {
      cached: 0,
      analyzed: 0,
      failed: 0,
      totalDuration: 0
    };

    this.itemTimes = []; // Track time per item for better ETA
  }

  /**
   * Start tracking
   */
  start() {
    if (!this.enabled) return;

    this.startTime = performance.now();
    this.render();
  }

  /**
   * Update progress
   */
  update(increment = 1, status = '', fromCache = false) {
    this.current += increment;

    // Track stats
    if (fromCache) {
      this.stats.cached++;
    } else {
      this.stats.analyzed++;
    }

    // Track time per item (for ETA calculation)
    const now = performance.now();
    if (this.lastUpdateTime > 0) {
      const itemTime = now - this.lastUpdateTime;
      this.itemTimes.push(itemTime);

      // Keep only last 20 items for rolling average
      if (this.itemTimes.length > 20) {
        this.itemTimes.shift();
      }
    }
    this.lastUpdateTime = now;

    // Render if enough time passed (throttle updates)
    const timeSinceRender = now - this.lastRenderTime;
    if (!this.lastRenderTime || timeSinceRender >= this.updateInterval) {
      this.render(status);
      this.lastRenderTime = now;
    }
  }

  /**
   * Mark item as failed
   */
  fail(status = '') {
    this.stats.failed++;
    this.update(0, status);
  }

  /**
   * Calculate ETA in seconds
   */
  calculateETA() {
    if (this.current === 0 || this.itemTimes.length === 0) {
      return null;
    }

    // Use rolling average of recent item times
    const avgItemTime = this.itemTimes.reduce((sum, t) => sum + t, 0) / this.itemTimes.length;
    const remaining = this.total - this.current;
    const etaMs = remaining * avgItemTime;

    return etaMs / 1000; // Convert to seconds
  }

  /**
   * Format duration as human-readable string
   */
  formatDuration(seconds) {
    if (seconds === null || seconds === undefined) return 'calculating...';

    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return `${mins}m ${secs}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${mins}m`;
    }
  }

  /**
   * Calculate throughput (items per second)
   */
  calculateThroughput() {
    if (!this.startTime || this.current === 0) return 0;

    const elapsed = (performance.now() - this.startTime) / 1000; // seconds
    return this.current / elapsed;
  }

  /**
   * Render progress bar
   */
  render(status = '') {
    if (!this.enabled) return;

    const percentage = Math.min(100, (this.current / this.total) * 100);
    const filled = Math.round((percentage / 100) * this.width);
    const empty = this.width - filled;

    // Progress bar
    const bar = '█'.repeat(filled) + '░'.repeat(empty);

    // Calculate metrics
    const elapsed = this.startTime ? (performance.now() - this.startTime) / 1000 : 0;
    const eta = this.calculateETA();
    const throughput = this.calculateThroughput();

    // Build output
    const lines = [];

    // Progress bar line
    lines.push(`\r[${bar}] ${percentage.toFixed(1)}% (${this.current}/${this.total})`);

    // Stats line
    const statsLine = [
      `Elapsed: ${this.formatDuration(elapsed)}`,
      eta !== null ? `ETA: ${this.formatDuration(eta)}` : '',
      throughput > 0 ? `Speed: ${throughput.toFixed(2)}/s` : ''
    ].filter(Boolean).join(' | ');

    lines.push(`\n${statsLine}`);

    // Cache stats if available
    if (this.stats.cached > 0 || this.stats.analyzed > 0) {
      const cacheHitRate = this.current > 0
        ? ((this.stats.cached / this.current) * 100).toFixed(1)
        : 0;

      lines.push(`\nCached: ${this.stats.cached} | Analyzed: ${this.stats.analyzed} | Failed: ${this.stats.failed} | Hit Rate: ${cacheHitRate}%`);
    }

    // Status line
    if (status) {
      lines.push(`\n${status}`);
    }

    // Clear previous output and render
    if (this.lastOutput) {
      const lineCount = this.lastOutput.split('\n').length;
      process.stdout.write(`\x1b[${lineCount}A`); // Move cursor up
      process.stdout.write('\x1b[J'); // Clear from cursor to end
    }

    this.lastOutput = lines.join('');
    process.stdout.write(this.lastOutput);
  }

  /**
   * Complete tracking and show final stats
   */
  complete(finalMessage = '') {
    if (!this.enabled) return;

    this.endTime = performance.now();
    this.current = this.total; // Ensure 100%

    // Final render
    this.render(finalMessage);
    process.stdout.write('\n\n'); // Add newlines after final render

    // Calculate final stats
    const totalDuration = (this.endTime - this.startTime) / 1000;
    this.stats.totalDuration = totalDuration;

    // Print summary
    console.log('='.repeat(60));
    console.log('✅ BATCH PROCESSING COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total Items: ${this.total}`);
    console.log(`Cached: ${this.stats.cached} (${((this.stats.cached / this.total) * 100).toFixed(1)}%)`);
    console.log(`Analyzed: ${this.stats.analyzed} (${((this.stats.analyzed / this.total) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${this.stats.failed} (${((this.stats.failed / this.total) * 100).toFixed(1)}%)`);
    console.log(`Total Duration: ${this.formatDuration(totalDuration)}`);
    console.log(`Average Speed: ${(this.total / totalDuration).toFixed(2)} items/second`);
    console.log('='.repeat(60));

    return this.stats;
  }

  /**
   * Get current stats without completing
   */
  getStats() {
    const elapsed = this.startTime ? (performance.now() - this.startTime) / 1000 : 0;

    return {
      ...this.stats,
      current: this.current,
      total: this.total,
      percentage: (this.current / this.total) * 100,
      elapsed: elapsed,
      eta: this.calculateETA(),
      throughput: this.calculateThroughput()
    };
  }

  /**
   * Silent mode (disable rendering)
   */
  setSilent(silent = true) {
    this.enabled = !silent;
  }
}

/**
 * Simple progress indicator for operations without known total
 */
class IndeterminateProgress {
  constructor(options = {}) {
    this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.currentFrame = 0;
    this.message = '';
    this.interval = null;
    this.updateInterval = options.updateInterval || 100;
  }

  start(message = 'Processing...') {
    this.message = message;
    this.interval = setInterval(() => {
      this.render();
    }, this.updateInterval);
  }

  render() {
    const frame = this.frames[this.currentFrame];
    process.stdout.write(`\r${frame} ${this.message}`);
    this.currentFrame = (this.currentFrame + 1) % this.frames.length;
  }

  updateMessage(message) {
    this.message = message;
  }

  stop(finalMessage = 'Done!') {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write(`\r✅ ${finalMessage}\n`);
  }
}

// Example usage
if (process.argv[1].endsWith('progress-tracker.js')) {
  console.log('Progress Tracker Demo\n');

  // Demo 1: Determinate progress
  console.log('Demo 1: Determinate Progress');
  const tracker = new ProgressTracker(100);
  tracker.start();

  let count = 0;
  const interval = setInterval(() => {
    const fromCache = Math.random() > 0.7; // 30% cache hit rate
    tracker.update(1, `Processing item ${count + 1}...`, fromCache);
    count++;

    if (count >= 100) {
      clearInterval(interval);
      tracker.complete('All items processed!');

      // Demo 2: Indeterminate progress
      setTimeout(() => {
        console.log('\n\nDemo 2: Indeterminate Progress');
        const spinner = new IndeterminateProgress();
        spinner.start('Loading something...');

        setTimeout(() => {
          spinner.updateMessage('Still loading...');
        }, 2000);

        setTimeout(() => {
          spinner.stop('Finished!');
        }, 4000);
      }, 1000);
    }
  }, 50);
}

export { ProgressTracker, IndeterminateProgress };
export default ProgressTracker;
