/**
 * Charts Module for Dashboard
 * Creates and updates all Chart.js visualizations
 */

class DashboardCharts {
  constructor() {
    this.charts = {};
    this.chartColors = {
      nordshore: '#00393F',
      sky: '#C9E4EC',
      sand: '#FFF1E2',
      gold: '#BA8F5A',
      beige: '#EFE1DC',
      moss: '#65873B',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    };
  }

  /**
   * Initialize all charts
   */
  async initializeCharts(metrics, history) {
    this.createAccuracyTrendChart(history);
    this.createGradeDistributionChart(metrics);
    this.createModelComparisonChart(metrics);
    this.createCostBreakdownChart(metrics);
  }

  /**
   * Create accuracy trend chart
   */
  createAccuracyTrendChart(history) {
    const ctx = document.getElementById('accuracyTrendChart');
    if (!ctx) return;

    const labels = history.map(h => {
      const date = new Date(h.timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const accuracyData = history.map(h => h.validation?.averageAccuracy || 0);
    const scoreData = history.map(h => (h.validation?.averageScore || 0) * 10); // Scale to 100

    this.destroyChart('accuracyTrend');

    this.charts.accuracyTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Accuracy %',
            data: accuracyData,
            borderColor: this.chartColors.nordshore,
            backgroundColor: this.hexToRgba(this.chartColors.nordshore, 0.1),
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Average Score (scaled)',
            data: scoreData,
            borderColor: this.chartColors.gold,
            backgroundColor: this.hexToRgba(this.chartColors.gold, 0.1),
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

  /**
   * Create grade distribution chart
   */
  createGradeDistributionChart(metrics) {
    const ctx = document.getElementById('gradeDistributionChart');
    if (!ctx) return;

    const distribution = metrics.validation?.gradeDistribution || {};
    const labels = Object.keys(distribution);
    const data = Object.values(distribution);

    // Color mapping for grades
    const backgroundColors = labels.map(grade => {
      if (grade.startsWith('A')) return this.chartColors.success;
      if (grade.startsWith('B')) return this.chartColors.info;
      if (grade.startsWith('C')) return this.chartColors.warning;
      return this.chartColors.error;
    });

    this.destroyChart('gradeDistribution');

    this.charts.gradeDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Number of Documents',
          data,
          backgroundColor: backgroundColors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed.y / total) * 100).toFixed(1);
                return `${context.parsed.y} documents (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 50
            }
          }
        }
      }
    });
  }

  /**
   * Create model comparison chart
   */
  createModelComparisonChart(metrics) {
    const ctx = document.getElementById('modelComparisonChart');
    if (!ctx) return;

    const models = metrics.models || {};
    const modelNames = Object.keys(models);
    const accuracyData = modelNames.map(name => models[name].accuracy || 0);
    const speedData = modelNames.map(name => (1 / (models[name].speed || 1)) * 100); // Inverse for speed (higher is better)
    const costData = modelNames.map(name => (1 / (models[name].cost || 0.001)) * 10); // Inverse for cost (lower is better)

    this.destroyChart('modelComparison');

    this.charts.modelComparison = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Accuracy', 'Speed', 'Cost Efficiency', 'Confidence', 'Reliability'],
        datasets: modelNames.map((name, index) => {
          const colors = [
            this.chartColors.nordshore,
            this.chartColors.gold,
            this.chartColors.moss
          ];
          const color = colors[index % colors.length];

          return {
            label: name.replace('gemini-', 'Gemini ').replace('claude-', 'Claude '),
            data: [
              models[name].accuracy || 0,
              (1 / (models[name].speed || 1)) * 100,
              (1 / (models[name].cost || 0.001)) * 10,
              (models[name].confidence || 0) * 100,
              100 - (models[name].errorRate || 0)
            ],
            borderColor: color,
            backgroundColor: this.hexToRgba(color, 0.2),
            borderWidth: 2
          };
        })
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  /**
   * Create cost breakdown chart
   */
  createCostBreakdownChart(metrics) {
    const ctx = document.getElementById('costBreakdownChart');
    if (!ctx) return;

    const breakdown = metrics.cost?.breakdown || {};
    const labels = Object.keys(breakdown).map(key => {
      return key.charAt(0).toUpperCase() + key.slice(1);
    });
    const data = Object.values(breakdown);

    const backgroundColors = [
      this.chartColors.nordshore,
      this.chartColors.gold,
      this.chartColors.moss,
      this.chartColors.sky,
      this.chartColors.beige
    ];

    this.destroyChart('costBreakdown');

    this.charts.costBreakdown = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Update all charts with new data
   */
  async updateCharts(metrics, history) {
    if (this.charts.accuracyTrend) {
      this.updateAccuracyTrendChart(history);
    }

    if (this.charts.gradeDistribution) {
      this.updateGradeDistributionChart(metrics);
    }

    if (this.charts.modelComparison) {
      this.updateModelComparisonChart(metrics);
    }

    if (this.charts.costBreakdown) {
      this.updateCostBreakdownChart(metrics);
    }
  }

  /**
   * Update accuracy trend chart
   */
  updateAccuracyTrendChart(history) {
    const chart = this.charts.accuracyTrend;

    const labels = history.map(h => {
      const date = new Date(h.timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const accuracyData = history.map(h => h.validation?.averageAccuracy || 0);
    const scoreData = history.map(h => (h.validation?.averageScore || 0) * 10);

    chart.data.labels = labels;
    chart.data.datasets[0].data = accuracyData;
    chart.data.datasets[1].data = scoreData;
    chart.update();
  }

  /**
   * Update grade distribution chart
   */
  updateGradeDistributionChart(metrics) {
    const chart = this.charts.gradeDistribution;
    const distribution = metrics.validation?.gradeDistribution || {};

    chart.data.labels = Object.keys(distribution);
    chart.data.datasets[0].data = Object.values(distribution);
    chart.update();
  }

  /**
   * Update model comparison chart
   */
  updateModelComparisonChart(metrics) {
    const chart = this.charts.modelComparison;
    const models = metrics.models || {};
    const modelNames = Object.keys(models);

    chart.data.datasets = modelNames.map((name, index) => {
      const colors = [
        this.chartColors.nordshore,
        this.chartColors.gold,
        this.chartColors.moss
      ];
      const color = colors[index % colors.length];

      return {
        label: name.replace('gemini-', 'Gemini ').replace('claude-', 'Claude '),
        data: [
          models[name].accuracy || 0,
          (1 / (models[name].speed || 1)) * 100,
          (1 / (models[name].cost || 0.001)) * 10,
          (models[name].confidence || 0) * 100,
          100 - (models[name].errorRate || 0)
        ],
        borderColor: color,
        backgroundColor: this.hexToRgba(color, 0.2),
        borderWidth: 2
      };
    });

    chart.update();
  }

  /**
   * Update cost breakdown chart
   */
  updateCostBreakdownChart(metrics) {
    const chart = this.charts.costBreakdown;
    const breakdown = metrics.cost?.breakdown || {};

    chart.data.labels = Object.keys(breakdown).map(key => {
      return key.charAt(0).toUpperCase() + key.slice(1);
    });
    chart.data.datasets[0].data = Object.values(breakdown);
    chart.update();
  }

  /**
   * Destroy chart instance
   */
  destroyChart(chartName) {
    if (this.charts[chartName]) {
      this.charts[chartName].destroy();
      delete this.charts[chartName];
    }
  }

  /**
   * Destroy all charts
   */
  destroyAll() {
    Object.keys(this.charts).forEach(chartName => {
      this.destroyChart(chartName);
    });
  }

  /**
   * Convert hex color to rgba
   */
  hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

// Create global charts instance
const dashboardCharts = new DashboardCharts();
