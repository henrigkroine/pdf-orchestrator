/**
 * INFOGRAPHIC ENGINE
 * AI-powered infographic generation and data visualization system
 *
 * Features:
 * - Intelligent chart type selection
 * - TEEI brand-compliant designs
 * - Storytelling-driven visualizations
 * - D3.js + AI enhancement
 * - Publication-quality output
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const d3 = require('d3');
const { JSDOM } = require('jsdom');
const fs = require('fs').promises;
const path = require('path');

class InfographicEngine {
  constructor(config = {}) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || config.openaiKey
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || config.anthropicKey
    });

    // Chart type categories
    this.chartTypes = {
      comparison: ['bar', 'column', 'bullet', 'spider', 'lollipop'],
      trend: ['line', 'area', 'stream', 'sparkline'],
      distribution: ['histogram', 'box', 'violin', 'density'],
      relationship: ['scatter', 'bubble', 'heatmap', 'correlation'],
      composition: ['pie', 'donut', 'treemap', 'sunburst', 'stacked'],
      flow: ['sankey', 'chord', 'network', 'alluvial'],
      geographic: ['choropleth', 'bubble-map', 'flow-map'],
      hierarchical: ['tree', 'dendrogram', 'circle-packing']
    };

    // TEEI brand colors
    this.brandColors = {
      primary: {
        nordshore: '#00393F',
        sky: '#C9E4EC',
        sand: '#FFF1E2',
        beige: '#EFE1DC'
      },
      accent: {
        moss: '#65873B',
        gold: '#BA8F5A',
        clay: '#913B2F'
      },
      data: {
        sequential: ['#00393F', '#0A5560', '#1A7180', '#2B8DA0', '#3DA9C0', '#C9E4EC'],
        diverging: ['#913B2F', '#BA8F5A', '#FFF1E2', '#65873B', '#00393F'],
        categorical: ['#00393F', '#BA8F5A', '#65873B', '#C9E4EC', '#913B2F', '#FFF1E2']
      },
      forbidden: ['#FF6B35', '#F77F00', '#FF8C42'] // No copper/orange
    };

    // Typography system
    this.typography = {
      title: { family: 'Lora', weight: 700, size: 32 },
      subtitle: { family: 'Lora', weight: 600, size: 24 },
      heading: { family: 'Lora', weight: 600, size: 18 },
      body: { family: 'Roboto Flex', weight: 400, size: 14 },
      label: { family: 'Roboto Flex', weight: 500, size: 12 },
      caption: { family: 'Roboto Flex', weight: 400, size: 10 }
    };

    // Standard dimensions
    this.dimensions = {
      fullPage: { width: 1200, height: 800 },
      halfPage: { width: 580, height: 400 },
      square: { width: 600, height: 600 },
      wide: { width: 1200, height: 400 },
      tall: { width: 400, height: 800 }
    };
  }

  /**
   * Generate complete infographic from data
   */
  async generateInfographic(data, context = {}) {
    console.log('🎨 Starting infographic generation...');

    try {
      // 1. Analyze data structure
      console.log('📊 Analyzing data structure...');
      const dataStructure = this.analyzeData(data);

      // 2. Select optimal visualization
      console.log('🤖 AI selecting optimal visualization...');
      const vizSelection = await this.selectOptimalViz(dataStructure, context);

      // 3. Design infographic
      console.log('🎨 Designing infographic...');
      const design = await this.designInfographic(data, vizSelection, context);

      // 4. Generate SVG
      console.log('📐 Generating SVG visualization...');
      const svg = await this.generateSVG(data, design);

      // 5. Add storytelling elements
      console.log('📖 Adding narrative elements...');
      const enhanced = await this.addNarrativeElements(svg, data, design);

      // 6. Generate insights
      console.log('💡 Generating AI insights...');
      const insights = await this.generateInsights(data, context);

      // 7. Create alternative views
      console.log('🔄 Creating alternative visualizations...');
      const alternatives = await this.generateAlternatives(data, vizSelection, context);

      console.log('✅ Infographic generation complete!');

      return {
        svg: enhanced,
        design: design,
        insights: insights,
        alternatives: alternatives,
        metadata: {
          chartType: vizSelection.type,
          dataPoints: dataStructure.count,
          dimensions: design.dimensions,
          colorScheme: design.colors.scheme,
          generated: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Infographic generation failed:', error);
      throw error;
    }
  }

  /**
   * Analyze data structure and characteristics
   */
  analyzeData(data) {
    const structure = {
      type: Array.isArray(data) ? 'array' : 'object',
      count: Array.isArray(data) ? data.length : Object.keys(data).length,
      fields: [],
      dataTypes: {},
      ranges: {},
      categories: [],
      temporal: false,
      hierarchical: false,
      relational: false
    };

    // Analyze fields
    if (Array.isArray(data) && data.length > 0) {
      const sample = data[0];
      structure.fields = Object.keys(sample);

      // Analyze each field
      structure.fields.forEach(field => {
        const values = data.map(d => d[field]).filter(v => v != null);

        // Determine data type
        if (values.every(v => typeof v === 'number')) {
          structure.dataTypes[field] = 'quantitative';
          structure.ranges[field] = {
            min: Math.min(...values),
            max: Math.max(...values),
            mean: values.reduce((a, b) => a + b, 0) / values.length
          };
        } else if (values.every(v => v instanceof Date || !isNaN(Date.parse(v)))) {
          structure.dataTypes[field] = 'temporal';
          structure.temporal = true;
        } else {
          structure.dataTypes[field] = 'categorical';
          const uniqueValues = [...new Set(values)];
          structure.categories.push({
            field,
            values: uniqueValues,
            count: uniqueValues.length
          });
        }
      });
    }

    // Check for hierarchical structure
    if (structure.fields.includes('parent') || structure.fields.includes('children')) {
      structure.hierarchical = true;
    }

    // Check for relational structure
    if (structure.fields.includes('source') && structure.fields.includes('target')) {
      structure.relational = true;
    }

    return structure;
  }

  /**
   * Use AI to select optimal visualization type
   */
  async selectOptimalViz(structure, context) {
    const prompt = `You are a data visualization expert. Analyze this data and select the BEST chart type.

DATA STRUCTURE:
${JSON.stringify(structure, null, 2)}

CONTEXT:
- Purpose: ${context.purpose || 'General communication'}
- Audience: ${context.audience || 'Professional stakeholders'}
- Message: ${context.message || 'Data insights'}
- Medium: ${context.medium || 'Document/PDF'}

AVAILABLE CHART TYPES:
${Object.entries(this.chartTypes).map(([category, types]) =>
  `${category}: ${types.join(', ')}`
).join('\n')}

SELECTION CRITERIA:
1. Data type compatibility (quantitative, categorical, temporal)
2. Relationship being shown (comparison, trend, distribution, etc.)
3. Data complexity (number of dimensions, data points)
4. Story clarity (what insight to highlight)
5. Audience familiarity (common vs. specialized charts)

Return JSON with:
{
  "type": "chosen_chart_type",
  "category": "chart_category",
  "reasoning": "detailed explanation",
  "strengths": ["strength1", "strength2"],
  "considerations": ["consideration1", "consideration2"],
  "alternatives": [
    {
      "type": "alternative_type",
      "useCase": "when to use this instead"
    }
  ]
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert data visualization consultant who selects optimal chart types based on data characteristics and communication goals.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const selection = JSON.parse(response.choices[0].message.content);
      console.log(`📊 Selected chart type: ${selection.type} (${selection.category})`);
      console.log(`   Reasoning: ${selection.reasoning}`);

      return selection;

    } catch (error) {
      console.error('❌ AI visualization selection failed:', error);
      // Fallback to rule-based selection
      return this.fallbackVizSelection(structure);
    }
  }

  /**
   * Fallback visualization selection (rule-based)
   */
  fallbackVizSelection(structure) {
    // Simple rule-based selection
    if (structure.temporal) {
      return {
        type: 'line',
        category: 'trend',
        reasoning: 'Temporal data detected, line chart shows trends over time'
      };
    } else if (structure.hierarchical) {
      return {
        type: 'treemap',
        category: 'hierarchical',
        reasoning: 'Hierarchical structure detected'
      };
    } else if (structure.relational) {
      return {
        type: 'sankey',
        category: 'flow',
        reasoning: 'Relational data with source/target'
      };
    } else if (structure.count <= 10) {
      return {
        type: 'bar',
        category: 'comparison',
        reasoning: 'Small dataset suitable for bar chart comparison'
      };
    } else {
      return {
        type: 'scatter',
        category: 'relationship',
        reasoning: 'Large dataset, scatter plot shows patterns'
      };
    }
  }

  /**
   * Design complete infographic with brand compliance
   */
  async designInfographic(data, vizSelection, context) {
    const design = {
      // Chart configuration
      chart: {
        type: vizSelection.type,
        category: vizSelection.category,
        reasoning: vizSelection.reasoning
      },

      // Dimensions
      dimensions: this.calculateOptimalSize(data, vizSelection, context),

      // Colors
      colors: await this.generateDataColors(data, vizSelection, context),

      // Typography
      typography: this.selectDataTypography(vizSelection),

      // Layout
      layout: {
        title: this.designTitle(context),
        legend: this.designLegend(data, vizSelection),
        axes: this.designAxes(data, vizSelection),
        gridlines: this.calculateGridlines(data),
        labels: this.positionLabels(data, vizSelection),
        margins: { top: 60, right: 80, bottom: 60, left: 80 }
      },

      // Style
      style: {
        theme: 'TEEI-brand',
        colorScheme: 'warm-professional',
        iconStyle: 'flat-modern',
        chartStyle: 'clean-minimal',
        strokeWidth: 2,
        cornerRadius: 4,
        shadowEnabled: true
      },

      // Annotations
      annotations: await this.generateAnnotations(data, vizSelection),

      // Interactions (for web)
      interactions: {
        hover: true,
        tooltip: true,
        zoom: false,
        pan: false
      }
    };

    return design;
  }

  /**
   * Calculate optimal chart size
   */
  calculateOptimalSize(data, vizSelection, context) {
    const dataStructure = this.analyzeData(data);

    // Base size on data complexity and chart type
    if (context.size) {
      return this.dimensions[context.size] || this.dimensions.fullPage;
    }

    // Auto-select based on chart type
    switch (vizSelection.category) {
      case 'trend':
        return this.dimensions.wide;
      case 'hierarchical':
        return this.dimensions.square;
      case 'flow':
        return this.dimensions.fullPage;
      default:
        return dataStructure.count > 20 ? this.dimensions.fullPage : this.dimensions.halfPage;
    }
  }

  /**
   * Generate data-driven color scheme
   */
  async generateDataColors(data, vizSelection, context) {
    const dataStructure = this.analyzeData(data);

    // Select color scheme based on data type
    let scheme;
    if (vizSelection.category === 'trend' || vizSelection.category === 'distribution') {
      scheme = this.brandColors.data.sequential;
    } else if (dataStructure.count <= 6) {
      scheme = this.brandColors.data.categorical;
    } else {
      scheme = this.brandColors.data.sequential;
    }

    return {
      scheme: scheme,
      background: '#FFFFFF',
      text: this.brandColors.primary.nordshore,
      grid: '#E5E5E5',
      accent: this.brandColors.accent.gold,
      highlight: this.brandColors.accent.moss
    };
  }

  /**
   * Select typography for data visualization
   */
  selectDataTypography(vizSelection) {
    return {
      title: this.typography.title,
      subtitle: this.typography.subtitle,
      axisLabel: this.typography.label,
      dataLabel: this.typography.body,
      legend: this.typography.caption,
      annotation: this.typography.caption
    };
  }

  /**
   * Design title section
   */
  designTitle(context) {
    return {
      text: context.title || 'Data Visualization',
      subtitle: context.subtitle || '',
      position: 'top',
      alignment: 'left',
      style: this.typography.title
    };
  }

  /**
   * Design legend
   */
  designLegend(data, vizSelection) {
    return {
      show: true,
      position: 'right',
      orientation: 'vertical',
      alignment: 'top',
      itemSpacing: 12,
      symbolSize: 12,
      style: this.typography.legend
    };
  }

  /**
   * Design axes
   */
  designAxes(data, vizSelection) {
    return {
      x: {
        show: true,
        label: '',
        gridlines: true,
        ticks: 'auto',
        style: this.typography.axisLabel
      },
      y: {
        show: true,
        label: '',
        gridlines: true,
        ticks: 'auto',
        style: this.typography.axisLabel
      }
    };
  }

  /**
   * Calculate gridlines
   */
  calculateGridlines(data) {
    return {
      x: { show: true, color: '#E5E5E5', dasharray: '2,2' },
      y: { show: true, color: '#E5E5E5', dasharray: '2,2' }
    };
  }

  /**
   * Position data labels
   */
  positionLabels(data, vizSelection) {
    return {
      show: Array.isArray(data) ? data.length <= 20 : true,
      position: 'auto',
      format: 'auto',
      style: this.typography.dataLabel
    };
  }

  /**
   * Generate AI-powered annotations
   */
  async generateAnnotations(data, vizSelection) {
    // Use AI to identify interesting data points worth annotating
    const prompt = `Analyze this data and suggest 2-3 annotations for interesting insights:

DATA PREVIEW:
${JSON.stringify(Array.isArray(data) ? data.slice(0, 10) : data, null, 2)}

Chart type: ${vizSelection.type}

Return JSON array of annotations:
[
  {
    "point": "data_identifier",
    "text": "annotation text",
    "position": "top|bottom|left|right",
    "priority": 1-3
  }
]`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.4
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.annotations || [];

    } catch (error) {
      console.error('⚠️ Annotation generation failed:', error);
      return [];
    }
  }

  /**
   * Generate SVG visualization
   */
  async generateSVG(data, design) {
    // Create virtual DOM for D3
    const dom = new JSDOM('<!DOCTYPE html><body></body>');
    global.document = dom.window.document;

    const { width, height } = design.dimensions;
    const { top, right, bottom, left } = design.layout.margins;

    // Create SVG
    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Add background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', design.colors.background);

    // Add title
    if (design.layout.title.text) {
      svg.append('text')
        .attr('x', left)
        .attr('y', 40)
        .attr('font-family', design.typography.title.family)
        .attr('font-size', design.typography.title.size)
        .attr('font-weight', design.typography.title.weight)
        .attr('fill', design.colors.text)
        .text(design.layout.title.text);
    }

    // Create chart group
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${left},${top})`);

    // Generate specific chart type
    switch (design.chart.type) {
      case 'bar':
        this.generateBarChart(chartGroup, data, design);
        break;
      case 'line':
        this.generateLineChart(chartGroup, data, design);
        break;
      case 'pie':
        this.generatePieChart(chartGroup, data, design);
        break;
      case 'scatter':
        this.generateScatterChart(chartGroup, data, design);
        break;
      default:
        this.generateBarChart(chartGroup, data, design); // Fallback
    }

    // Return SVG as string
    return document.body.innerHTML;
  }

  /**
   * Generate bar chart
   */
  generateBarChart(svg, data, design) {
    const { width, height } = design.dimensions;
    const { top, right, bottom, left } = design.layout.margins;

    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    // Prepare data
    const dataArray = Array.isArray(data) ? data :
      Object.entries(data).map(([key, value]) => ({ label: key, value }));

    // Scales
    const x = d3.scaleBand()
      .domain(dataArray.map(d => d.label || d.name || d.category))
      .range([0, chartWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(dataArray, d => d.value) * 1.1])
      .nice()
      .range([chartHeight, 0]);

    // Colors
    const colors = d3.scaleOrdinal()
      .domain(dataArray.map((d, i) => i))
      .range(design.colors.scheme);

    // Gridlines
    if (design.layout.gridlines.y.show) {
      svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
          .tickSize(-chartWidth)
          .tickFormat('')
        )
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line')
          .attr('stroke', design.colors.grid)
          .attr('stroke-dasharray', design.layout.gridlines.y.dasharray)
        );
    }

    // Bars
    svg.selectAll('.bar')
      .data(dataArray)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label || d.name || d.category))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => chartHeight - y(d.value))
      .attr('fill', (d, i) => colors(i))
      .attr('rx', design.style.cornerRadius);

    // X-axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('font-family', design.typography.axisLabel.family)
      .attr('font-size', design.typography.axisLabel.size);

    // Y-axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .attr('font-family', design.typography.axisLabel.family)
      .attr('font-size', design.typography.axisLabel.size);

    // Data labels
    if (design.layout.labels.show) {
      svg.selectAll('.label')
        .data(dataArray)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.label || d.name || d.category) + x.bandwidth() / 2)
        .attr('y', d => y(d.value) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-family', design.typography.dataLabel.family)
        .attr('font-size', design.typography.dataLabel.size)
        .attr('fill', design.colors.text)
        .text(d => d.value);
    }
  }

  /**
   * Generate line chart
   */
  generateLineChart(svg, data, design) {
    const { width, height } = design.dimensions;
    const { top, right, bottom, left } = design.layout.margins;

    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    const dataArray = Array.isArray(data) ? data :
      Object.entries(data).map(([key, value]) => ({ x: key, y: value }));

    // Scales
    const x = d3.scalePoint()
      .domain(dataArray.map(d => d.x || d.label || d.date))
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(dataArray, d => d.y || d.value) * 1.1])
      .nice()
      .range([chartHeight, 0]);

    // Line generator
    const line = d3.line()
      .x(d => x(d.x || d.label || d.date))
      .y(d => y(d.y || d.value))
      .curve(d3.curveMonotoneX);

    // Area generator (optional)
    const area = d3.area()
      .x(d => x(d.x || d.label || d.date))
      .y0(chartHeight)
      .y1(d => y(d.y || d.value))
      .curve(d3.curveMonotoneX);

    // Gridlines
    if (design.layout.gridlines.y.show) {
      svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
          .tickSize(-chartWidth)
          .tickFormat('')
        )
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line')
          .attr('stroke', design.colors.grid)
          .attr('stroke-dasharray', design.layout.gridlines.y.dasharray)
        );
    }

    // Area (subtle fill)
    svg.append('path')
      .datum(dataArray)
      .attr('fill', design.colors.scheme[0])
      .attr('fill-opacity', 0.1)
      .attr('d', area);

    // Line
    svg.append('path')
      .datum(dataArray)
      .attr('fill', 'none')
      .attr('stroke', design.colors.scheme[0])
      .attr('stroke-width', design.style.strokeWidth)
      .attr('d', line);

    // Points
    svg.selectAll('.point')
      .data(dataArray)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => x(d.x || d.label || d.date))
      .attr('cy', d => y(d.y || d.value))
      .attr('r', 4)
      .attr('fill', design.colors.scheme[0])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('font-family', design.typography.axisLabel.family)
      .attr('font-size', design.typography.axisLabel.size);

    svg.append('g')
      .call(d3.axisLeft(y))
      .attr('font-family', design.typography.axisLabel.family)
      .attr('font-size', design.typography.axisLabel.size);
  }

  /**
   * Generate pie/donut chart
   */
  generatePieChart(svg, data, design) {
    const { width, height } = design.dimensions;
    const { top, right, bottom, left } = design.layout.margins;

    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;
    const radius = Math.min(chartWidth, chartHeight) / 2;

    const dataArray = Array.isArray(data) ? data :
      Object.entries(data).map(([key, value]) => ({ label: key, value }));

    // Move to center
    svg.attr('transform', `translate(${width / 2},${height / 2})`);

    // Pie generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(radius * 0.5) // Donut style
      .outerRadius(radius);

    // Label arc
    const labelArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    // Colors
    const colors = d3.scaleOrdinal()
      .domain(dataArray.map(d => d.label))
      .range(design.colors.scheme);

    // Draw slices
    const slices = svg.selectAll('.slice')
      .data(pie(dataArray))
      .enter()
      .append('g')
      .attr('class', 'slice');

    slices.append('path')
      .attr('d', arc)
      .attr('fill', d => colors(d.data.label))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Labels
    slices.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-family', design.typography.dataLabel.family)
      .attr('font-size', design.typography.dataLabel.size)
      .attr('fill', design.colors.text)
      .text(d => `${d.data.label}: ${d.data.value}`);
  }

  /**
   * Generate scatter chart
   */
  generateScatterChart(svg, data, design) {
    const { width, height } = design.dimensions;
    const { top, right, bottom, left } = design.layout.margins;

    const chartWidth = width - left - right;
    const chartHeight = height - top - bottom;

    const dataArray = Array.isArray(data) ? data : [];

    // Scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(dataArray, d => d.x) * 1.1])
      .nice()
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(dataArray, d => d.y) * 1.1])
      .nice()
      .range([chartHeight, 0]);

    // Gridlines
    if (design.layout.gridlines.y.show) {
      svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).tickSize(-chartWidth).tickFormat(''))
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line')
          .attr('stroke', design.colors.grid)
          .attr('stroke-dasharray', design.layout.gridlines.y.dasharray)
        );
    }

    // Points
    svg.selectAll('.point')
      .data(dataArray)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', d => d.size || 5)
      .attr('fill', design.colors.scheme[0])
      .attr('fill-opacity', 0.6)
      .attr('stroke', design.colors.text)
      .attr('stroke-width', 1);

    // Axes
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('font-family', design.typography.axisLabel.family)
      .attr('font-size', design.typography.axisLabel.size);

    svg.append('g')
      .call(d3.axisLeft(y))
      .attr('font-family', design.typography.axisLabel.family)
      .attr('font-size', design.typography.axisLabel.size);
  }

  /**
   * Add narrative storytelling elements
   */
  async addNarrativeElements(svg, data, design) {
    // Add annotations, callouts, narrative text
    // This would enhance the base SVG with storytelling elements

    // For now, return as-is (could be enhanced with additional text, arrows, etc.)
    return svg;
  }

  /**
   * Generate AI insights from data
   */
  async generateInsights(data, context) {
    const prompt = `Analyze this data and provide 3-5 compelling insights:

DATA:
${JSON.stringify(data, null, 2)}

CONTEXT:
${JSON.stringify(context, null, 2)}

Focus on:
- Surprising trends or patterns
- Important comparisons
- Actionable takeaways
- Story-worthy findings
- Statistical significance

Return JSON array:
[
  {
    "insight": "Clear statement of insight",
    "data_support": "Specific data points supporting this",
    "visual_suggestion": "How to highlight this in the chart",
    "priority": 1-5
  }
]`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-opus-4-20250514',
        max_tokens: 4000,
        thinking: {
          type: 'enabled',
          budget_tokens: 3000
        },
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      // Extract text content (skip thinking blocks)
      const textContent = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      // Parse JSON from text
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];

    } catch (error) {
      console.error('⚠️ Insight generation failed:', error);
      return [];
    }
  }

  /**
   * Generate alternative visualizations
   */
  async generateAlternatives(data, primaryViz, context) {
    if (!primaryViz.alternatives || primaryViz.alternatives.length === 0) {
      return [];
    }

    const alternatives = [];

    for (const alt of primaryViz.alternatives.slice(0, 2)) {
      try {
        const altDesign = await this.designInfographic(
          data,
          { type: alt.type, category: primaryViz.category },
          context
        );

        const altSvg = await this.generateSVG(data, altDesign);

        alternatives.push({
          type: alt.type,
          useCase: alt.useCase,
          svg: altSvg,
          design: altDesign
        });

      } catch (error) {
        console.error(`⚠️ Failed to generate alternative ${alt.type}:`, error);
      }
    }

    return alternatives;
  }

  /**
   * Export infographic to file
   */
  async exportInfographic(svg, filename, format = 'svg') {
    const outputDir = path.join(process.cwd(), 'exports', 'infographics');
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${filename}.${format}`);

    if (format === 'svg') {
      await fs.writeFile(outputPath, svg);
    } else if (format === 'png') {
      // Would use sharp or puppeteer to convert SVG to PNG
      console.log('⚠️ PNG export not yet implemented');
    }

    console.log(`✅ Exported to: ${outputPath}`);
    return outputPath;
  }
}

module.exports = InfographicEngine;
