/**
 * Fallback Queue - Job Queue for Circuit Breaker Failures
 *
 * When circuit breaker opens, queue jobs for later retry.
 * Background processor retries queue every 5 minutes.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class FallbackQueue {
  /**
   * Create fallback queue
   * @param {object} options - Configuration options
   */
  constructor(options = {}) {
    this.dbPath = options.dbPath || path.join(__dirname, '..', 'database', 'orchestrator.db');
    this.retryInterval = options.retryInterval || 5 * 60 * 1000; // 5 minutes
    this.maxAttempts = options.maxAttempts || 3;
    this.jobExpiration = options.jobExpiration || 24 * 60 * 60 * 1000; // 24 hours

    this.db = null;
    this.processorInterval = null;

    // Initialize database connection
    this.initDatabase();
  }

  /**
   * Initialize database connection
   */
  initDatabase() {
    const dbDir = path.dirname(this.dbPath);

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('[FallbackQueue] Failed to open database:', err.message);
        throw err;
      }
      console.log(`[FallbackQueue] Connected to database: ${this.dbPath}`);
    });
  }

  /**
   * Enqueue a job
   * @param {object} job - Job to enqueue
   * @returns {Promise<string>} - Job ID
   */
  async enqueue(job) {
    const id = uuidv4();
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + this.jobExpiration).toISOString();

    console.log(`[FallbackQueue] Enqueuing job: ${job.type} (ID: ${id})`);

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO job_queue (id, job_type, payload, status, attempts, max_attempts, created_at, expires_at)
         VALUES (?, ?, ?, 'queued', 0, ?, ?, ?)`,
        [id, job.type, JSON.stringify(job.payload), this.maxAttempts, createdAt, expiresAt],
        (err) => {
          if (err) {
            console.error('[FallbackQueue] Failed to enqueue job:', err.message);
            reject(err);
          } else {
            console.log(`[FallbackQueue] Job enqueued successfully: ${id}`);
            resolve(id);
          }
        }
      );
    });
  }

  /**
   * Get pending jobs from queue
   * @param {number} limit - Maximum number of jobs to retrieve
   * @returns {Promise<Array>} - Array of pending jobs
   */
  async getPendingJobs(limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM job_queue
         WHERE status = 'queued'
           AND attempts < max_attempts
           AND datetime(expires_at) > datetime('now')
         ORDER BY created_at ASC
         LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) {
            console.error('[FallbackQueue] Failed to get pending jobs:', err.message);
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Mark job as processing
   * @param {string} jobId - Job ID
   * @returns {Promise<void>}
   */
  async markProcessing(jobId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE job_queue
         SET status = 'processing', last_attempt_at = datetime('now')
         WHERE id = ?`,
        [jobId],
        (err) => {
          if (err) {
            console.error('[FallbackQueue] Failed to mark job as processing:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Mark job as completed
   * @param {string} jobId - Job ID
   * @returns {Promise<void>}
   */
  async markComplete(jobId) {
    console.log(`[FallbackQueue] Marking job complete: ${jobId}`);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE job_queue
         SET status = 'completed', completed_at = datetime('now')
         WHERE id = ?`,
        [jobId],
        (err) => {
          if (err) {
            console.error('[FallbackQueue] Failed to mark job as complete:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Increment job attempts
   * @param {string} jobId - Job ID
   * @param {Error} error - Error that occurred
   * @returns {Promise<void>}
   */
  async incrementAttempts(jobId, error = null) {
    console.log(`[FallbackQueue] Incrementing attempts for job: ${jobId}`);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE job_queue
         SET attempts = attempts + 1,
             status = 'queued',
             error = ?,
             last_attempt_at = datetime('now')
         WHERE id = ?`,
        [error ? error.message : null, jobId],
        (err) => {
          if (err) {
            console.error('[FallbackQueue] Failed to increment attempts:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Mark job as failed (max attempts reached)
   * @param {string} jobId - Job ID
   * @param {Error} error - Final error
   * @returns {Promise<void>}
   */
  async markFailed(jobId, error) {
    console.error(`[FallbackQueue] Marking job failed: ${jobId} - ${error.message}`);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE job_queue
         SET status = 'failed',
             error = ?,
             completed_at = datetime('now')
         WHERE id = ?`,
        [error.message, jobId],
        (err) => {
          if (err) {
            console.error('[FallbackQueue] Failed to mark job as failed:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Retry a job
   * @param {object} job - Job object from database
   * @returns {Promise<any>} - Job result
   */
  async retryJob(job) {
    const payload = JSON.parse(job.payload);

    console.log(`[FallbackQueue] Retrying job: ${job.id} (${job.job_type}) - Attempt ${job.attempts + 1}/${job.max_attempts}`);

    // Mark as processing
    await this.markProcessing(job.id);

    // TODO: Implement actual job execution
    // This should call back to the orchestrator or worker
    throw new Error('Job execution not implemented - integrate with orchestrator');
  }

  /**
   * Process queue (run periodically)
   * @returns {Promise<void>}
   */
  async processQueue() {
    try {
      const jobs = await this.getPendingJobs();

      if (jobs.length === 0) {
        console.log('[FallbackQueue] No pending jobs to process');
        return;
      }

      console.log(`[FallbackQueue] Processing ${jobs.length} pending job(s)`);

      for (const job of jobs) {
        try {
          await this.retryJob(job);
          await this.markComplete(job.id);
        } catch (error) {
          console.error(`[FallbackQueue] Job ${job.id} failed:`, error.message);

          if (job.attempts + 1 >= job.max_attempts) {
            await this.markFailed(job.id, error);
          } else {
            await this.incrementAttempts(job.id, error);
          }
        }
      }
    } catch (error) {
      console.error('[FallbackQueue] Error processing queue:', error.message);
    }
  }

  /**
   * Start background processor
   */
  startProcessor() {
    if (this.processorInterval) {
      console.warn('[FallbackQueue] Processor already running');
      return;
    }

    console.log(`[FallbackQueue] Starting background processor (interval: ${this.retryInterval}ms)`);

    this.processorInterval = setInterval(() => {
      this.processQueue().catch(err =>
        console.error('[FallbackQueue] Processor error:', err.message)
      );
    }, this.retryInterval);
  }

  /**
   * Stop background processor
   */
  stopProcessor() {
    if (this.processorInterval) {
      console.log('[FallbackQueue] Stopping background processor');
      clearInterval(this.processorInterval);
      this.processorInterval = null;
    }
  }

  /**
   * Get queue statistics
   * @returns {Promise<object>} - Queue stats
   */
  async getStats() {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT
           COUNT(*) as total,
           SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) as queued,
           SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
           SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
           SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
         FROM job_queue`,
        (err, row) => {
          if (err) {
            console.error('[FallbackQueue] Failed to get stats:', err.message);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  /**
   * Clean up expired jobs
   * @returns {Promise<number>} - Number of deleted jobs
   */
  async cleanupExpired() {
    console.log('[FallbackQueue] Cleaning up expired jobs...');

    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM job_queue WHERE datetime(expires_at) < datetime('now')`,
        function (err) {
          if (err) {
            console.error('[FallbackQueue] Failed to cleanup expired jobs:', err.message);
            reject(err);
          } else {
            console.log(`[FallbackQueue] Deleted ${this.changes} expired job(s)`);
            resolve(this.changes);
          }
        }
      );
    });
  }

  /**
   * Close database connection
   */
  close() {
    this.stopProcessor();

    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('[FallbackQueue] Error closing database:', err.message);
        } else {
          console.log('[FallbackQueue] Database connection closed');
        }
      });
    }
  }
}

module.exports = FallbackQueue;
