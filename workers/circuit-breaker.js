/**
 * Circuit Breaker - Fault Tolerance Pattern
 *
 * Implements circuit breaker pattern to prevent cascading failures.
 * States: CLOSED, OPEN, HALF_OPEN
 *
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, requests blocked
 * - HALF_OPEN: Testing if service recovered
 */

const { CircuitBreakerOpenError, TimeoutError } = require('./errors');

// Circuit breaker states
const STATE = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

class CircuitBreaker {
  /**
   * Create a circuit breaker for a service
   * @param {string} service - Service name (e.g., 'adobe_pdf_services', 'openai_images')
   * @param {object} options - Configuration options
   */
  constructor(service, options = {}) {
    this.service = service;

    // Configuration
    this.failureThreshold = options.failureThreshold || 5; // Failures before opening
    this.timeout = options.timeout || 60000; // 60 seconds operation timeout
    this.resetTimeout = options.resetTimeout || 300000; // 5 minutes before retry

    // State tracking
    this.state = STATE.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastStateChange = Date.now();

    // Callbacks
    this.onStateChange = options.onStateChange || null;
    this.onFailure = options.onFailure || null;

    console.log(`[CircuitBreaker] Initialized for ${service}: threshold=${this.failureThreshold}, timeout=${this.timeout}ms, reset=${this.resetTimeout}ms`);
  }

  /**
   * Execute operation with circuit breaker protection
   * @param {Function} operation - Async function to execute
   * @returns {Promise<any>} - Operation result
   */
  async execute(operation) {
    // Check if circuit breaker should transition from OPEN to HALF_OPEN
    if (this.state === STATE.OPEN) {
      const timeSinceFailure = Date.now() - this.lastFailureTime;

      if (timeSinceFailure > this.resetTimeout) {
        console.log(`[CircuitBreaker] ${this.service}: Transitioning OPEN -> HALF_OPEN (reset timeout elapsed)`);
        this.setState(STATE.HALF_OPEN);
        this.failureCount = 0;
      } else {
        const remainingMs = this.resetTimeout - timeSinceFailure;
        throw new CircuitBreakerOpenError(
          `Circuit breaker OPEN for ${this.service}. Try again in ${Math.ceil(remainingMs / 1000)}s`,
          {
            service: this.service,
            failureCount: this.failureCount,
            resetIn: remainingMs,
            lastFailureTime: this.lastFailureTime
          }
        );
      }
    }

    // Execute operation with timeout
    try {
      const result = await this.executeWithTimeout(operation);

      // Success - handle state transitions
      this.handleSuccess();

      return result;
    } catch (error) {
      // Failure - handle state transitions
      this.handleFailure(error);

      throw error;
    }
  }

  /**
   * Execute operation with timeout
   * @param {Function} operation - Async function to execute
   * @returns {Promise<any>} - Operation result
   */
  async executeWithTimeout(operation) {
    return Promise.race([
      operation(),
      this.timeoutPromise()
    ]);
  }

  /**
   * Create timeout promise
   * @returns {Promise<never>} - Promise that rejects after timeout
   */
  timeoutPromise() {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(`Operation timed out after ${this.timeout}ms`, {
          operation: this.service,
          timeout: this.timeout
        }));
      }, this.timeout);
    });
  }

  /**
   * Handle successful operation
   */
  handleSuccess() {
    this.successCount++;

    if (this.state === STATE.HALF_OPEN) {
      console.log(`[CircuitBreaker] ${this.service}: Success in HALF_OPEN, transitioning to CLOSED`);
      this.setState(STATE.CLOSED);
      this.failureCount = 0;
      this.successCount = 0;
    } else if (this.state === STATE.CLOSED) {
      // Reset failure count on success
      if (this.failureCount > 0) {
        console.log(`[CircuitBreaker] ${this.service}: Success, resetting failure count (was ${this.failureCount})`);
        this.failureCount = 0;
      }
    }
  }

  /**
   * Handle failed operation
   * @param {Error} error - The error that occurred
   */
  handleFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    console.warn(`[CircuitBreaker] ${this.service}: Failure #${this.failureCount} (threshold: ${this.failureThreshold})`);

    // Call failure callback if provided
    if (this.onFailure) {
      this.onFailure(error, this.failureCount);
    }

    // Transition to OPEN if threshold exceeded
    if (this.failureCount >= this.failureThreshold) {
      if (this.state !== STATE.OPEN) {
        console.error(`[CircuitBreaker] ${this.service}: Failure threshold exceeded, transitioning to OPEN`);
        this.setState(STATE.OPEN);

        // Send alert
        this.sendAlert({
          service: this.service,
          failures: this.failureCount,
          resetIn: this.resetTimeout,
          lastError: error.message
        });
      }
    }

    // If in HALF_OPEN and failure occurs, go back to OPEN
    if (this.state === STATE.HALF_OPEN) {
      console.warn(`[CircuitBreaker] ${this.service}: Failure in HALF_OPEN, transitioning back to OPEN`);
      this.setState(STATE.OPEN);
    }
  }

  /**
   * Set circuit breaker state
   * @param {string} newState - New state (CLOSED, OPEN, HALF_OPEN)
   */
  setState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = Date.now();

    console.log(`[CircuitBreaker] ${this.service}: State changed ${oldState} -> ${newState}`);

    // Call state change callback if provided
    if (this.onStateChange) {
      this.onStateChange(oldState, newState);
    }
  }

  /**
   * Send alert for circuit breaker opening
   * @param {object} data - Alert data
   */
  sendAlert(data) {
    console.warn(`\n${'='.repeat(80)}\n[CIRCUIT BREAKER OPEN] ${this.service}\nFailures: ${data.failures}\nReset in: ${Math.ceil(data.resetIn / 1000)}s\nLast error: ${data.lastError}\n${'='.repeat(80)}\n`);

    // TODO: Integrate with alerting system (Slack, email, PagerDuty)
  }

  /**
   * Get time remaining before circuit breaker resets
   * @returns {number} - Milliseconds until reset (0 if not OPEN)
   */
  getRemainingTime() {
    if (this.state !== STATE.OPEN || !this.lastFailureTime) {
      return 0;
    }

    const elapsed = Date.now() - this.lastFailureTime;
    return Math.max(0, this.resetTimeout - elapsed);
  }

  /**
   * Get current circuit breaker status
   * @returns {object} - Status object
   */
  getStatus() {
    return {
      service: this.service,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastStateChange: this.lastStateChange,
      remainingTime: this.getRemainingTime(),
      config: {
        failureThreshold: this.failureThreshold,
        timeout: this.timeout,
        resetTimeout: this.resetTimeout
      }
    };
  }

  /**
   * Manually reset circuit breaker
   */
  reset() {
    console.log(`[CircuitBreaker] ${this.service}: Manual reset`);
    this.setState(STATE.CLOSED);
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  /**
   * Force circuit breaker open (for testing or maintenance)
   */
  forceOpen() {
    console.warn(`[CircuitBreaker] ${this.service}: Forced OPEN`);
    this.setState(STATE.OPEN);
    this.lastFailureTime = Date.now();
  }
}

module.exports = CircuitBreaker;
module.exports.STATE = STATE;
