/**
 * Metrics Module for Dashboard
 * Main controller for updating all dashboard elements
 */

class DashboardMetrics {
  constructor() {
    this.refreshInterval = 30000; // 30 seconds
    this.autoRefreshTimer = null;
  }

  /**
   * Initialize dashboard
   */
  async initialize() {
    console.log('📊 Initializing dashboard...');

    try {
      // Initial load
      await this.refreshDashboard();

      // Start auto-refresh
      this.startAutoRefresh();

      console.log('✅ Dashboard initialized');

    } catch (error) {
      console.error('❌ Error initializing dashboard:', error);
      this.showError('Failed to load dashboard data');
    }
  }

  /**
   * Refresh entire dashboard
   */
  async refreshDashboard() {
    try {
      // Fetch data
      const metrics = await api.fetchMetrics(false); // Force fresh data
      const history = await api.fetchHistory();

      // Update all sections
      this.updateRealTimeMetrics(metrics);
      this.updateCharts(metrics, history);
      this.updateModelPerformanceTable(metrics);
      this.updateRecentValidations(metrics);
      this.updateQualityInsights(metrics);
      this.updateHeader(metrics);

    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      this.showError('Failed to refresh dashboard data');
    }
  }

  /**
   * Update header information
   */
  updateHeader(metrics) {
    // Last updated
    const lastUpdated = document.getElementById('lastUpdated');
    if (lastUpdated && metrics.timestamp) {
      lastUpdated.textContent = api.formatRelativeTime(metrics.timestamp);
    }

    // Environment
    const environment = document.getElementById('environment');
    if (environment && metrics.system?.environment) {
      environment.textContent = metrics.system.environment.charAt(0).toUpperCase() +
                                metrics.system.environment.slice(1);
    }
  }

  /**
   * Update real-time metrics cards
   */
  updateRealTimeMetrics(metrics) {
    // Total validations
    this.updateMetricCard('totalValidations', metrics.validation?.totalValidations || 0);
    this.updateTrend('validationTrend', '+12%');

    // Average score
    this.updateMetricCard('averageScore', (metrics.validation?.averageScore || 0).toFixed(1));
    this.updateTrend('scoreTrend', metrics.quality?.accuracyTrend || '—');

    // Accuracy
    this.updateMetricCard('accuracy', api.formatPercent(metrics.validation?.averageAccuracy || 0));
    this.updateTrend('accuracyTrend', metrics.quality?.accuracyTrend || '—');

    // Processing time
    this.updateMetricCard('processingTime', (metrics.performance?.averageProcessingTime || 0).toFixed(1) + 's');
    this.updateTrend('speedTrend', metrics.quality?.speedTrend || '—');

    // Cost per validation
    this.updateMetricCard('costPerValidation', api.formatCurrency(metrics.cost?.costPerValidation || 0));
    this.updateTrend('costTrend', metrics.quality?.costTrend || '—');

    // Total cost
    const totalCostEl = document.getElementById('totalCost');
    if (totalCostEl) {
      totalCostEl.textContent = api.formatCurrency(metrics.cost?.totalCost || 0);
    }

    // Cache hit rate
    this.updateMetricCard('cacheHitRate', api.formatPercent(metrics.performance?.cacheHitRate || 0));
  }

  /**
   * Update metric card value
   */
  updateMetricCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = typeof value === 'number' ? api.formatNumber(value) : value;
    }
  }

  /**
   * Update trend indicator
   */
  updateTrend(elementId, trend) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = trend;

    // Update class
    element.className = 'metric-trend';
    const trendClass = api.getTrendClass(trend);
    if (trendClass) {
      element.classList.add(trendClass);
    }
  }

  /**
   * Update charts
   */
  async updateCharts(metrics, history) {
    // Initialize charts if not already done
    if (Object.keys(dashboardCharts.charts).length === 0) {
      await dashboardCharts.initializeCharts(metrics, history);
    } else {
      await dashboardCharts.updateCharts(metrics, history);
    }
  }

  /**
   * Update model performance table
   */
  updateModelPerformanceTable(metrics) {
    const tbody = document.querySelector('#modelPerformanceTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const models = metrics.models || {};

    for (const [modelName, data] of Object.entries(models)) {
      const row = document.createElement('tr');

      // Model name
      const nameCell = document.createElement('td');
      nameCell.innerHTML = `<strong>${this.formatModelName(modelName)}</strong>`;
      row.appendChild(nameCell);

      // Accuracy
      const accuracyCell = document.createElement('td');
      accuracyCell.textContent = api.formatPercent(data.accuracy || 0);
      accuracyCell.className = this.getAccuracyClass(data.accuracy);
      row.appendChild(accuracyCell);

      // Speed
      const speedCell = document.createElement('td');
      speedCell.textContent = (data.speed || 0).toFixed(2) + 's';
      row.appendChild(speedCell);

      // Cost
      const costCell = document.createElement('td');
      costCell.textContent = api.formatCurrency(data.cost || 0);
      row.appendChild(costCell);

      // Usage count
      const usageCell = document.createElement('td');
      usageCell.textContent = api.formatNumber(data.usageCount || 0);
      row.appendChild(usageCell);

      // Confidence
      const confidenceCell = document.createElement('td');
      confidenceCell.textContent = api.formatPercent((data.confidence || 0) * 100);
      row.appendChild(confidenceCell);

      // Error rate
      const errorCell = document.createElement('td');
      errorCell.textContent = api.formatPercent(data.errorRate || 0);
      errorCell.className = this.getErrorRateClass(data.errorRate);
      row.appendChild(errorCell);

      tbody.appendChild(row);
    }
  }

  /**
   * Update recent validations table
   */
  updateRecentValidations(metrics) {
    const tbody = document.querySelector('#recentValidationsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Generate recent validations (mock data for now)
    const recentCount = 10;
    const now = Date.now();

    for (let i = 0; i < recentCount; i++) {
      const row = document.createElement('tr');

      // Timestamp
      const timestampCell = document.createElement('td');
      const timestamp = new Date(now - i * 15 * 60 * 1000); // Every 15 minutes
      timestampCell.textContent = api.formatTimestamp(timestamp);
      timestampCell.className = 'text-muted';
      row.appendChild(timestampCell);

      // Document
      const docCell = document.createElement('td');
      docCell.textContent = `Document-${1000 + i}.pdf`;
      row.appendChild(docCell);

      // Score
      const scoreCell = document.createElement('td');
      const score = 7.5 + Math.random() * 2.5;
      scoreCell.textContent = score.toFixed(1);
      scoreCell.className = 'font-bold';
      row.appendChild(scoreCell);

      // Grade
      const gradeCell = document.createElement('td');
      const grade = this.scoreToGrade(score);
      gradeCell.innerHTML = `<span class="grade-badge ${api.getGradeClass(grade)}">${grade}</span>`;
      row.appendChild(gradeCell);

      // Confidence
      const confidenceCell = document.createElement('td');
      const confidence = 0.7 + Math.random() * 0.25;
      confidenceCell.textContent = api.formatPercent(confidence * 100);
      confidenceCell.className = confidence > 0.9 ? 'text-success' : confidence > 0.7 ? '' : 'text-warning';
      row.appendChild(confidenceCell);

      // Model
      const modelCell = document.createElement('td');
      const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'claude-3.5-sonnet'];
      modelCell.textContent = this.formatModelName(models[i % models.length]);
      modelCell.className = 'text-muted';
      row.appendChild(modelCell);

      // Status
      const statusCell = document.createElement('td');
      const status = confidence > 0.9 ? 'success' : confidence > 0.7 ? 'warning' : 'error';
      const statusText = confidence > 0.9 ? 'Validated' : confidence > 0.7 ? 'Review' : 'Needs Review';
      statusCell.innerHTML = `<span class="status-badge ${status}">${statusText}</span>`;
      row.appendChild(statusCell);

      tbody.appendChild(row);
    }
  }

  /**
   * Update quality insights
   */
  updateQualityInsights(metrics) {
    // Top Issues
    this.updateTopIssues(metrics);

    // Issue Categories
    this.updateIssueCategories(metrics);

    // Learning Progress
    this.updateLearningProgress(metrics);

    // Accessibility Compliance
    this.updateAccessibilityCompliance(metrics);
  }

  /**
   * Update top issues list
   */
  updateTopIssues(metrics) {
    const container = document.getElementById('topIssues');
    if (!container) return;

    const issues = metrics.quality?.mostCommonIssues || [];

    if (issues.length === 0) {
      container.innerHTML = '<p class="text-muted">No issues detected</p>';
      return;
    }

    const list = document.createElement('ul');
    list.className = 'insight-list';

    issues.slice(0, 5).forEach(issue => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="issue-name">${issue.issue}</span>
        <span class="issue-count">${issue.count}</span>
      `;
      list.appendChild(li);
    });

    container.innerHTML = '';
    container.appendChild(list);
  }

  /**
   * Update issue categories chart
   */
  updateIssueCategories(metrics) {
    const container = document.getElementById('issueCategories');
    if (!container) return;

    const categories = metrics.quality?.issuesDetected || {};

    if (Object.keys(categories).length === 0) {
      container.innerHTML = '<p class="text-muted">No categorized issues</p>';
      return;
    }

    const list = document.createElement('ul');
    list.className = 'insight-list';

    const categoryNames = {
      brandCompliance: 'Brand Compliance',
      accessibility: 'Accessibility',
      typography: 'Typography',
      layout: 'Layout',
      spacing: 'Spacing',
      colors: 'Colors'
    };

    for (const [key, count] of Object.entries(categories)) {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="issue-name">${categoryNames[key] || key}</span>
        <span class="issue-count">${count}</span>
      `;
      list.appendChild(li);
    }

    container.innerHTML = '';
    container.appendChild(list);
  }

  /**
   * Update learning progress
   */
  updateLearningProgress(metrics) {
    const container = document.getElementById('learningProgress');
    if (!container) return;

    const feedback = metrics.humanFeedback || {};

    container.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>AI-Human Agreement</span>
          <span class="font-bold">${api.formatPercent(feedback.agreementRate || 0)}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${feedback.agreementRate || 0}%"></div>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between;">
          <span class="text-muted">Total Feedback Entries</span>
          <span class="font-bold">${api.formatNumber(feedback.totalFeedbackEntries || 0)}</span>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between;">
          <span class="text-muted">Avg Correction</span>
          <span class="font-bold">${(feedback.averageCorrectionMagnitude || 0).toFixed(2)} pts</span>
        </div>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between;">
          <span class="text-muted">Learning Rate</span>
          <span class="font-bold text-success">${feedback.learningImprovement || 'N/A'}</span>
        </div>
      </div>
    `;
  }

  /**
   * Update accessibility compliance
   */
  updateAccessibilityCompliance(metrics) {
    const container = document.getElementById('accessibilityCompliance');
    if (!container) return;

    const accessibility = metrics.accessibility || {};

    container.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>WCAG ${accessibility.wcagLevel || 'AA'} Compliance</span>
          <span class="font-bold">${api.formatPercent(accessibility.complianceRate || 0)}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${accessibility.complianceRate || 0}%"></div>
        </div>
      </div>

      <div>
        <strong>Common Violations:</strong>
        <ul class="insight-list" style="margin-top: 8px;">
          ${(accessibility.commonViolations || []).slice(0, 3).map(v => `
            <li>
              <span class="issue-name">${v.criterion}</span>
              <span class="issue-count ${v.severity === 'critical' ? 'status-badge error' : ''}">${v.count}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Helper: Format model name
   */
  formatModelName(name) {
    return name
      .replace('gemini-', 'Gemini ')
      .replace('claude-', 'Claude ')
      .replace('gpt-', 'GPT-')
      .replace('-', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Helper: Score to grade conversion
   */
  scoreToGrade(score) {
    if (score >= 9.5) return 'A+';
    if (score >= 9.0) return 'A';
    if (score >= 8.5) return 'A-';
    if (score >= 8.0) return 'B+';
    if (score >= 7.5) return 'B';
    if (score >= 7.0) return 'B-';
    if (score >= 6.5) return 'C+';
    if (score >= 6.0) return 'C';
    if (score >= 5.5) return 'C-';
    if (score >= 5.0) return 'D';
    return 'F';
  }

  /**
   * Helper: Get accuracy class
   */
  getAccuracyClass(accuracy) {
    if (accuracy >= 95) return 'text-success font-bold';
    if (accuracy >= 90) return 'text-success';
    if (accuracy >= 85) return '';
    return 'text-warning';
  }

  /**
   * Helper: Get error rate class
   */
  getErrorRateClass(errorRate) {
    if (errorRate < 1) return 'text-success';
    if (errorRate < 5) return '';
    return 'text-error';
  }

  /**
   * Show error message
   */
  showError(message) {
    const container = document.querySelector('.dashboard-container');
    if (!container) return;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `⚠️ ${message}`;

    container.insertBefore(errorDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    this.stopAutoRefresh(); // Clear any existing timer

    this.autoRefreshTimer = setInterval(async () => {
      console.log('🔄 Auto-refreshing dashboard...');
      await this.refreshDashboard();
    }, this.refreshInterval);

    console.log(`✅ Auto-refresh enabled (every ${this.refreshInterval / 1000}s)`);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }
}

// Initialize dashboard when page loads
const dashboardMetrics = new DashboardMetrics();

document.addEventListener('DOMContentLoaded', () => {
  dashboardMetrics.initialize();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  dashboardMetrics.stopAutoRefresh();
  dashboardCharts.destroyAll();
});
