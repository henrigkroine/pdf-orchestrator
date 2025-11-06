/**
 * Custom Error Classes for PDF Orchestrator
 *
 * Provides specific error types for cost tracking and circuit breaker operations.
 */

/**
 * CostExceededError
 * Thrown when a budget cap (daily or monthly) is exceeded.
 */
class CostExceededError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'CostExceededError';
    this.current = details.current || 0;
    this.limit = details.limit || 0;
    this.attempted = details.attempted || 0;
    this.type = details.type || 'unknown'; // 'daily' or 'monthly'

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CostExceededError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      current: this.current,
      limit: this.limit,
      attempted: this.attempted,
      type: this.type,
      remaining: Math.max(0, this.limit - this.current)
    };
  }
}

/**
 * CircuitBreakerOpenError
 * Thrown when circuit breaker is in OPEN state and blocks operation.
 */
class CircuitBreakerOpenError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    this.service = details.service || 'unknown';
    this.failureCount = details.failureCount || 0;
    this.resetIn = details.resetIn || 0;
    this.lastFailureTime = details.lastFailureTime || null;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CircuitBreakerOpenError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      service: this.service,
      failureCount: this.failureCount,
      resetIn: this.resetIn,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * ValidationError
 * Thrown when job validation fails.
 */
class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = details.errors || [];
    this.gate = details.gate || 'unknown';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      gate: this.gate,
      errors: this.errors
    };
  }
}

/**
 * RateLimitError
 * Thrown when API rate limit is exceeded.
 */
class RateLimitError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'RateLimitError';
    this.service = details.service || 'unknown';
    this.retryAfter = details.retryAfter || 60; // seconds
    this.limit = details.limit || 0;
    this.remaining = details.remaining || 0;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      service: this.service,
      retryAfter: this.retryAfter,
      limit: this.limit,
      remaining: this.remaining
    };
  }
}

/**
 * TimeoutError
 * Thrown when an operation exceeds its timeout.
 */
class TimeoutError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'TimeoutError';
    this.operation = details.operation || 'unknown';
    this.timeout = details.timeout || 0;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      operation: this.operation,
      timeout: this.timeout
    };
  }
}

module.exports = {
  CostExceededError,
  CircuitBreakerOpenError,
  ValidationError,
  RateLimitError,
  TimeoutError
};
