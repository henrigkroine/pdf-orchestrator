#!/usr/bin/env node

/**
 * Demo: Cost Tracking System
 *
 * Demonstrates the cost tracking, circuit breaker, and fallback queue functionality.
 */

const CostTracker = require('../workers/cost-tracker');
const CircuitBreaker = require('../workers/circuit-breaker');
const FallbackQueue = require('../workers/fallback-queue');
const { CostExceededError, CircuitBreakerOpenError } = require('../workers/errors');

async function demo() {
  console.log('PDF Orchestrator - Cost Tracking Demo\n');
  console.log('='.repeat(80));

  const tracker = new CostTracker();
  const breaker = new CircuitBreaker('demo_service', {
    failureThreshold: 3,
    timeout: 2000,
    resetTimeout: 5000
  });
  const queue = new FallbackQueue();

  try {
    // Demo 1: Record some costs
    console.log('\n📊 DEMO 1: Recording API Costs');
    console.log('-'.repeat(80));

    await tracker.recordCost('openai_images', 'dall-e-3-hd', 0.12, {
      docSlug: 'demo-doc-1',
      runId: 'demo-run-1',
      user: 'demo@example.com'
    });
    console.log('✓ Recorded: OpenAI DALL-E 3 HD image generation ($0.12)');

    await tracker.recordCost('adobe_pdf_services', 'document_generation', 0.10, {
      docSlug: 'demo-doc-1',
      runId: 'demo-run-1',
      user: 'demo@example.com'
    });
    console.log('✓ Recorded: Adobe PDF Services document generation ($0.10)');

    await tracker.recordCost('adobe_pdf_services', 'autotag', 0.15, {
      docSlug: 'demo-doc-1',
      runId: 'demo-run-1',
      user: 'demo@example.com'
    });
    console.log('✓ Recorded: Adobe PDF Services accessibility autotag ($0.15)');

    const dailySpend = await tracker.getDailySpend();
    console.log(`\n💰 Total daily spend: $${dailySpend.toFixed(2)}`);

    // Demo 2: Pre-flight budget check
    console.log('\n\n✅ DEMO 2: Pre-flight Budget Check');
    console.log('-'.repeat(80));

    const estimatedCost = 0.12;
    const result = await tracker.checkBudget('openai_images', 'dall-e-3-hd', estimatedCost);

    console.log(`Budget check passed for $${estimatedCost.toFixed(2)} operation`);
    console.log(`Remaining daily budget: $${result.remaining.daily.toFixed(2)}`);
    console.log(`Remaining monthly budget: $${result.remaining.monthly.toFixed(2)}`);

    // Demo 3: Circuit breaker success
    console.log('\n\n🔄 DEMO 3: Circuit Breaker (Success)');
    console.log('-'.repeat(80));

    const successOp = async () => {
      console.log('Executing API call...');
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, data: 'PDF generated' };
    };

    const result1 = await breaker.execute(successOp);
    console.log('✓ Operation completed successfully:', result1);
    console.log(`Circuit breaker state: ${breaker.state}`);

    // Demo 4: Circuit breaker failure
    console.log('\n\n❌ DEMO 4: Circuit Breaker (Failures)');
    console.log('-'.repeat(80));

    const failingOp = async () => {
      console.log('Attempting API call...');
      await new Promise(resolve => setTimeout(resolve, 500));
      throw new Error('API service unavailable');
    };

    for (let i = 1; i <= 3; i++) {
      try {
        console.log(`\nAttempt ${i}:`);
        await breaker.execute(failingOp);
      } catch (error) {
        console.log(`✗ Failed: ${error.message}`);
        console.log(`  Failure count: ${breaker.failureCount}/${breaker.failureThreshold}`);
      }
    }

    console.log(`\n⚠️  Circuit breaker state: ${breaker.state}`);

    if (breaker.state === 'OPEN') {
      console.log(`   Circuit will reset in ${Math.ceil(breaker.getRemainingTime() / 1000)}s`);
    }

    // Demo 5: Circuit breaker blocking
    console.log('\n\n🚫 DEMO 5: Circuit Breaker OPEN (Blocked)');
    console.log('-'.repeat(80));

    try {
      await breaker.execute(successOp);
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        console.log('✓ Circuit breaker correctly blocked the request');
        console.log(`  Error: ${error.message}`);
      }
    }

    // Demo 6: Fallback queue
    console.log('\n\n📥 DEMO 6: Fallback Queue');
    console.log('-'.repeat(80));

    const jobId1 = await queue.enqueue({
      type: 'pdf_generation',
      payload: { docSlug: 'queued-doc-1', templateId: 'teei-aws' }
    });
    console.log(`✓ Job enqueued: ${jobId1}`);

    const jobId2 = await queue.enqueue({
      type: 'image_generation',
      payload: { prompt: 'Students in classroom', style: 'photographic' }
    });
    console.log(`✓ Job enqueued: ${jobId2}`);

    const stats = await queue.getStats();
    console.log(`\n📊 Queue stats:`, {
      total: stats.total,
      queued: stats.queued,
      completed: stats.completed,
      failed: stats.failed
    });

    // Demo 7: Budget exceeded simulation
    console.log('\n\n🔴 DEMO 7: Budget Exceeded (Simulation)');
    console.log('-'.repeat(80));

    // Record a large cost to trigger alert threshold
    await tracker.recordCost('test_service', 'expensive_operation', 18.00, {
      docSlug: 'expensive-doc',
      runId: 'demo-run-2',
      user: 'demo@example.com'
    });

    console.log('✓ Recorded expensive operation ($18.00)');

    const newDailySpend = await tracker.getDailySpend();
    console.log(`💰 New daily spend: $${newDailySpend.toFixed(2)}`);

    // Try to exceed daily cap
    try {
      await tracker.checkBudget('test_service', 'expensive_operation', 10.00);
    } catch (error) {
      if (error instanceof CostExceededError) {
        console.log('\n🚨 Budget cap enforcement working!');
        console.log(`   Error: ${error.message}`);
        console.log(`   Current: $${error.current.toFixed(2)}`);
        console.log(`   Limit: $${error.limit.toFixed(2)}`);
        console.log(`   Attempted: $${error.attempted.toFixed(2)}`);
      }
    }

    // Demo 8: Cost estimation
    console.log('\n\n💵 DEMO 8: Cost Estimation');
    console.log('-'.repeat(80));

    const services = [
      ['openai_images', 'dall-e-3-hd'],
      ['openai_images', 'dall-e-3-standard'],
      ['adobe_pdf_services', 'document_generation'],
      ['adobe_pdf_services', 'autotag']
    ];

    console.log('Service cost estimates:');
    for (const [service, operation] of services) {
      const cost = tracker.getEstimatedCost(service, operation);
      console.log(`  ${service}.${operation}: $${cost.toFixed(2)}`);
    }

    // Final summary
    console.log('\n\n📈 FINAL SUMMARY');
    console.log('-'.repeat(80));

    const finalDailySpend = await tracker.getDailySpend();
    const finalMonthlySpend = await tracker.getMonthlySpend();

    console.log(`Daily spend: $${finalDailySpend.toFixed(2)} / $25.00`);
    console.log(`Monthly spend: $${finalMonthlySpend.toFixed(2)} / $500.00`);
    console.log(`Circuit breaker state: ${breaker.state}`);

    const queueStats = await queue.getStats();
    console.log(`Queue jobs: ${queueStats.queued} queued, ${queueStats.completed} completed`);

    console.log('\n' + '='.repeat(80));
    console.log('Demo completed successfully! ✨\n');

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.error(error.stack);
  } finally {
    // Cleanup
    tracker.close();
    queue.close();
  }
}

// Run demo
if (require.main === module) {
  demo().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { demo };
