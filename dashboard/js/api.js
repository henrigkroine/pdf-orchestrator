/**
 * API Layer for Dashboard
 * Fetches metrics data and provides helper functions
 */

class DashboardAPI {
  constructor() {
    this.metricsFile = 'data/metrics.json';
    this.historyFile = 'data/metrics-history.json';
    this.refreshInterval = 30000; // 30 seconds
    this.cache = {
      metrics: null,
      history: null,
      lastFetch: 0
    };
  }

  /**
   * Fetch current metrics
   */
  async fetchMetrics(useCache = true) {
    const now = Date.now();

    // Return cache if fresh
    if (useCache && this.cache.metrics && (now - this.cache.lastFetch) < this.refreshInterval) {
      return this.cache.metrics;
    }

    try {
      const response = await fetch(this.metricsFile);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const metrics = await response.json();
      this.cache.metrics = metrics;
      this.cache.lastFetch = now;

      return metrics;

    } catch (error) {
      console.error('Error fetching metrics:', error);

      // Return cached data if available
      if (this.cache.metrics) {
        console.warn('Using cached metrics due to fetch error');
        return this.cache.metrics;
      }

      // Return mock data for development
      return this.getMockMetrics();
    }
  }

  /**
   * Fetch metrics history
   */
  async fetchHistory() {
    if (this.cache.history) {
      return this.cache.history;
    }

    try {
      const response = await fetch(this.historyFile);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const history = await response.json();
      this.cache.history = history;

      return history;

    } catch (error) {
      console.error('Error fetching history:', error);
      return this.getMockHistory();
    }
  }

  /**
   * Get mock metrics for development/testing
   */
  getMockMetrics() {
    return {
      timestamp: new Date().toISOString(),
      period: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        duration: 86400
      },
      validation: {
        totalValidations: 1250,
        averageScore: 8.3,
        averageAccuracy: 94.5,
        falsePositiveRate: 3.2,
        falseNegativeRate: 2.3,
        gradeDistribution: {
          'A+': 215,
          'A': 380,
          'A-': 290,
          'B+': 185,
          'B': 110,
          'B-': 45,
          'C+': 15,
          'C': 8,
          'C-': 2,
          'D': 0,
          'F': 0
        },
        confidenceDistribution: {
          high: 1050,
          medium: 150,
          low: 50
        },
        humanReviewRate: 4.0
      },
      performance: {
        averageProcessingTime: 4.2,
        medianProcessingTime: 3.8,
        p95ProcessingTime: 7.5,
        p99ProcessingTime: 12.3,
        cacheHitRate: 87.5,
        apiErrorRate: 0.8,
        throughput: 52.1,
        concurrency: {
          average: 1.5,
          peak: 5
        }
      },
      cost: {
        totalCost: 245.50,
        costPerValidation: 0.196,
        breakdown: {
          gemini: 120.30,
          claude: 85.40,
          gpt4v: 39.80,
          infrastructure: 0.00,
          storage: 0.00
        },
        projectedMonthly: 5886.00
      },
      models: {
        'gemini-1.5-flash': {
          accuracy: 93.2,
          speed: 3.8,
          cost: 0.096,
          usageCount: 875,
          confidence: 0.88,
          errorRate: 0.9
        },
        'gemini-1.5-pro': {
          accuracy: 95.1,
          speed: 4.5,
          cost: 0.215,
          usageCount: 250,
          confidence: 0.92,
          errorRate: 0.5
        },
        'claude-3.5-sonnet': {
          accuracy: 94.8,
          speed: 5.1,
          cost: 0.185,
          usageCount: 125,
          confidence: 0.91,
          errorRate: 0.6
        }
      },
      quality: {
        accuracyTrend: '+2.3%',
        speedTrend: '-5%',
        costTrend: '-8%',
        issuesDetected: {
          brandCompliance: 145,
          accessibility: 89,
          typography: 67,
          layout: 54,
          spacing: 42,
          colors: 38
        },
        mostCommonIssues: [
          { issue: 'Logo clearspace violation', count: 78, percentage: 6.2 },
          { issue: 'Color contrast too low', count: 65, percentage: 5.2 },
          { issue: 'Text size below minimum', count: 52, percentage: 4.2 },
          { issue: 'Touch target too small', count: 37, percentage: 3.0 },
          { issue: 'Spacing inconsistent', count: 42, percentage: 3.4 }
        ]
      },
      objectDetection: {
        totalElementsDetected: 18750,
        averageElementsPerPage: 15.0,
        elementTypeDistribution: {
          logo: 1250,
          heading: 2500,
          body_text: 8750,
          image: 3125,
          cta: 1875,
          icon: 1250
        },
        spatialViolations: {
          overlaps: 23,
          clearspaceViolations: 78,
          alignmentIssues: 156,
          spacingIssues: 42
        },
        averageBoundingBoxAccuracy: 92.5
      },
      accessibility: {
        wcagLevel: 'AA',
        complianceRate: 86.7,
        commonViolations: [
          { criterion: 'Color Contrast', count: 65, severity: 'critical' },
          { criterion: 'Touch Target Size', count: 37, severity: 'major' },
          { criterion: 'Text Size', count: 52, severity: 'major' }
        ]
      },
      humanFeedback: {
        totalFeedbackEntries: 125,
        agreementRate: 91.2,
        averageCorrectionMagnitude: 0.8,
        learningImprovement: '+1.2% per month'
      },
      system: {
        uptime: 99.9,
        version: '1.0.0',
        environment: 'production'
      }
    };
  }

  /**
   * Get mock history data
   */
  getMockHistory() {
    const history = [];
    const now = Date.now();

    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(now - i * 24 * 60 * 60 * 1000);
      history.push({
        timestamp: timestamp.toISOString(),
        validation: {
          totalValidations: 1000 + Math.floor(Math.random() * 500),
          averageScore: 7.5 + Math.random() * 1.5,
          averageAccuracy: 90 + Math.random() * 5
        },
        performance: {
          averageProcessingTime: 3.5 + Math.random() * 2
        },
        cost: {
          totalCost: 200 + Math.random() * 100,
          costPerValidation: 0.15 + Math.random() * 0.1
        }
      });
    }

    return history;
  }

  /**
   * Format number with thousands separator
   */
  formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Format percentage
   */
  formatPercent(value) {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Format timestamp
   */
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Format relative time
   */
  formatRelativeTime(timestamp) {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  /**
   * Get trend class
   */
  getTrendClass(trend) {
    if (!trend || trend === 'N/A') return '';
    if (trend.startsWith('+')) return 'positive';
    if (trend.startsWith('-')) return 'negative';
    return '';
  }

  /**
   * Get grade class
   */
  getGradeClass(grade) {
    if (!grade) return '';
    return grade.replace('+', '-plus').replace('-', '-minus');
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      metrics: null,
      history: null,
      lastFetch: 0
    };
  }
}

// Create global API instance
const api = new DashboardAPI();
