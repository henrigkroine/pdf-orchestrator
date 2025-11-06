/**
 * Cost Tracker Tests
 *
 * Unit tests for CostTracker, CircuitBreaker, and FallbackQueue
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const CostTracker = require('../workers/cost-tracker');
const CircuitBreaker = require('../workers/circuit-breaker');
const FallbackQueue = require('../workers/fallback-queue');
const { CostExceededError, CircuitBreakerOpenError } = require('../workers/errors');

// Use test database
const TEST_DB_PATH = path.join(__dirname, 'test.db');

describe('CostTracker', () => {
  let tracker;

  beforeEach(() => {
    // Clean up test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }

    tracker = new CostTracker(TEST_DB_PATH);

    // Wait for database initialization
    return new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    tracker.close();

    // Clean up test database
    setTimeout(() => {
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
      }
    }, 100);
  });

  describe('Budget Enforcement', () => {
    it('should approve cost within daily budget', async () => {
      const result = await tracker.checkBudget('openai_images', 'dall-e-3-hd', 0.12);

      assert.strictEqual(result.approved, true);
      assert.ok(result.remaining.daily > 0);
      assert.ok(result.remaining.monthly > 0);
    });

    it('should reject cost exceeding daily cap', async () => {
      // Record enough to exceed daily cap
      await tracker.recordCost('test_service', 'test_op', 20.0, {});

      try {
        await tracker.checkBudget('test_service', 'test_op', 10.0);
        assert.fail('Should have thrown CostExceededError');
      } catch (error) {
        assert.ok(error instanceof CostExceededError);
        assert.strictEqual(error.type, 'daily');
      }
    });

    it('should reject cost exceeding monthly cap', async () => {
      // Record enough to exceed monthly cap
      await tracker.recordCost('test_service', 'test_op', 450.0, {});

      try {
        await tracker.checkBudget('test_service', 'test_op', 100.0);
        assert.fail('Should have thrown CostExceededError');
      } catch (error) {
        assert.ok(error instanceof CostExceededError);
        assert.strictEqual(error.type, 'monthly');
      }
    });
  });

  describe('Cost Recording', () => {
    it('should record cost successfully', async () => {
      await tracker.recordCost('openai_images', 'dall-e-3-hd', 0.12, {
        docSlug: 'test-doc',
        runId: 'run-123',
        user: 'test@example.com'
      });

      const dailySpend = await tracker.getDailySpend();
      assert.strictEqual(dailySpend, 0.12);
    });

    it('should accumulate multiple costs', async () => {
      await tracker.recordCost('openai_images', 'dall-e-3-hd', 0.12, {});
      await tracker.recordCost('adobe_pdf_services', 'document_generation', 0.10, {});
      await tracker.recordCost('adobe_pdf_services', 'autotag', 0.15, {});

      const dailySpend = await tracker.getDailySpend();
      assert.strictEqual(Math.round(dailySpend * 100) / 100, 0.37);
    });
  });

  describe('Spend Tracking', () => {
    it('should get daily spend', async () => {
      await tracker.recordCost('test_service', 'test_op', 5.0, {});

      const dailySpend = await tracker.getDailySpend();
      assert.strictEqual(dailySpend, 5.0);
    });

    it('should get monthly spend', async () => {
      await tracker.recordCost('test_service', 'test_op', 10.0, {});

      const monthlySpend = await tracker.getMonthlySpend();
      assert.strictEqual(monthlySpend, 10.0);
    });
  });

  describe('Estimated Costs', () => {
    it('should get estimated cost for known service', () => {
      const cost = tracker.getEstimatedCost('openai_images', 'dall-e-3-hd');
      assert.strictEqual(cost, 0.12);
    });

    it('should return default cost for unknown service', () => {
      const cost = tracker.getEstimatedCost('unknown_service', 'unknown_op');
      assert.strictEqual(cost, 0.10);
    });
  });
});

describe('CircuitBreaker', () => {
  let breaker;

  beforeEach(() => {
    breaker = new CircuitBreaker('test_service', {
      failureThreshold: 3,
      timeout: 1000,
      resetTimeout: 5000
    });
  });

  describe('State Transitions', () => {
    it('should start in CLOSED state', () => {
      const status = breaker.getStatus();
      assert.strictEqual(status.state, 'CLOSED');
      assert.strictEqual(status.failureCount, 0);
    });

    it('should transition to OPEN after threshold failures', async () => {
      const failingOp = async () => {
        throw new Error('Simulated failure');
      };

      // Trigger failures
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingOp);
        } catch (error) {
          // Expected
        }
      }

      const status = breaker.getStatus();
      assert.strictEqual(status.state, 'OPEN');
      assert.strictEqual(status.failureCount, 3);
    });

    it('should block requests when OPEN', async () => {
      breaker.forceOpen();

      try {
        await breaker.execute(async () => 'success');
        assert.fail('Should have thrown CircuitBreakerOpenError');
      } catch (error) {
        assert.ok(error instanceof CircuitBreakerOpenError);
      }
    });

    it('should reset failure count on success', async () => {
      const successOp = async () => 'success';

      // Trigger some failures
      const failingOp = async () => {
        throw new Error('Failure');
      };

      try {
        await breaker.execute(failingOp);
      } catch (error) {
        // Expected
      }

      assert.strictEqual(breaker.failureCount, 1);

      // Success should reset count
      await breaker.execute(successOp);
      assert.strictEqual(breaker.failureCount, 0);
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout slow operations', async () => {
      const slowOp = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'success';
      };

      try {
        await breaker.execute(slowOp);
        assert.fail('Should have timed out');
      } catch (error) {
        assert.ok(error.message.includes('timed out'));
      }
    });

    it('should not timeout fast operations', async () => {
      const fastOp = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'success';
      };

      const result = await breaker.execute(fastOp);
      assert.strictEqual(result, 'success');
    });
  });

  describe('Manual Control', () => {
    it('should allow manual reset', () => {
      breaker.forceOpen();
      assert.strictEqual(breaker.state, 'OPEN');

      breaker.reset();
      assert.strictEqual(breaker.state, 'CLOSED');
      assert.strictEqual(breaker.failureCount, 0);
    });

    it('should allow forcing OPEN', () => {
      assert.strictEqual(breaker.state, 'CLOSED');

      breaker.forceOpen();
      assert.strictEqual(breaker.state, 'OPEN');
    });
  });
});

describe('FallbackQueue', () => {
  let queue;

  beforeEach(() => {
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }

    queue = new FallbackQueue({ dbPath: TEST_DB_PATH });

    return new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    queue.close();

    setTimeout(() => {
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
      }
    }, 100);
  });

  describe('Job Enqueuing', () => {
    it('should enqueue job successfully', async () => {
      const jobId = await queue.enqueue({
        type: 'pdf_generation',
        payload: { docSlug: 'test-doc' }
      });

      assert.ok(jobId);
      assert.ok(typeof jobId === 'string');
    });

    it('should retrieve pending jobs', async () => {
      await queue.enqueue({ type: 'test_job_1', payload: {} });
      await queue.enqueue({ type: 'test_job_2', payload: {} });

      const pending = await queue.getPendingJobs();
      assert.strictEqual(pending.length, 2);
    });
  });

  describe('Job Status Updates', () => {
    it('should mark job as complete', async () => {
      const jobId = await queue.enqueue({ type: 'test_job', payload: {} });

      await queue.markComplete(jobId);

      const pending = await queue.getPendingJobs();
      assert.strictEqual(pending.length, 0);
    });

    it('should increment job attempts', async () => {
      const jobId = await queue.enqueue({ type: 'test_job', payload: {} });

      await queue.incrementAttempts(jobId);

      const pending = await queue.getPendingJobs();
      assert.strictEqual(pending[0].attempts, 1);
    });

    it('should mark job as failed after max attempts', async () => {
      const jobId = await queue.enqueue({ type: 'test_job', payload: {} });

      // Increment to max attempts
      await queue.incrementAttempts(jobId);
      await queue.incrementAttempts(jobId);
      await queue.incrementAttempts(jobId);

      const pending = await queue.getPendingJobs();
      assert.strictEqual(pending.length, 0); // Should not be pending anymore
    });
  });

  describe('Queue Statistics', () => {
    it('should get queue stats', async () => {
      await queue.enqueue({ type: 'test_job_1', payload: {} });
      await queue.enqueue({ type: 'test_job_2', payload: {} });

      const stats = await queue.getStats();
      assert.strictEqual(stats.total, 2);
      assert.strictEqual(stats.queued, 2);
    });
  });

  describe('Cleanup', () => {
    it('should clean up expired jobs', async () => {
      // This test would require mocking time or creating expired jobs
      // Simplified version:
      const deleted = await queue.cleanupExpired();
      assert.strictEqual(typeof deleted, 'number');
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running tests...\n');

  // Simple test runner
  const runTests = async () => {
    let passed = 0;
    let failed = 0;

    console.log('Note: This is a basic test suite.');
    console.log('For production, use a proper test framework like Mocha or Jest.\n');

    // Test CostTracker basic functionality
    try {
      console.log('Testing CostTracker...');
      const tracker = new CostTracker(TEST_DB_PATH);

      await new Promise(resolve => setTimeout(resolve, 100));

      await tracker.recordCost('test_service', 'test_op', 0.50, {});
      const spend = await tracker.getDailySpend();

      assert.strictEqual(spend, 0.50);
      console.log('✓ CostTracker basic test passed');
      passed++;

      tracker.close();
    } catch (error) {
      console.error('✗ CostTracker test failed:', error.message);
      failed++;
    }

    // Test CircuitBreaker
    try {
      console.log('Testing CircuitBreaker...');
      const breaker = new CircuitBreaker('test_service');

      const result = await breaker.execute(async () => 'success');
      assert.strictEqual(result, 'success');

      console.log('✓ CircuitBreaker basic test passed');
      passed++;
    } catch (error) {
      console.error('✗ CircuitBreaker test failed:', error.message);
      failed++;
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`);

    // Cleanup
    setTimeout(() => {
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
      }
    }, 200);
  };

  runTests().catch(console.error);
}
