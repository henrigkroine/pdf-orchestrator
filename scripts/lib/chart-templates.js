/**
 * CHART TEMPLATES
 * Comprehensive D3.js chart templates for all visualization types
 *
 * Includes:
 * - Bar/Column charts (vertical, horizontal, stacked, grouped)
 * - Line/Area charts (single, multiple, filled, stacked)
 * - Pie/Donut charts (with exploded slices, labels)
 * - Scatter/Bubble charts
 * - Heatmaps
 * - Sankey diagrams
 * - Network graphs
 * - Timeline visualizations
 */

const d3 = require('d3');
const { JSDOM } = require('jsdom');

class ChartTemplates {
  constructor() {
    // Initialize virtual DOM for D3
    this.createVirtualDOM();
  }

  createVirtualDOM() {
    const dom = new JSDOM('<!DOCTYPE html><body></body>');
    global.document = dom.window.document;
  }

  /**
   * HORIZONTAL BAR CHART
   */
  horizontalBarChart(data, config) {
    const {
      width = 800,
      height = 600,
      margin = { top: 40, right: 40, bottom: 60, left: 120 },
      colors = ['#00393F'],
      showLabels = true
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const y = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, chartHeight])
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) * 1.1])
      .nice()
      .range([0, chartWidth]);

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.label))
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.value))
      .attr('fill', colors[0])
      .attr('rx', 4);

    // Labels
    if (showLabels) {
      g.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('x', d => x(d.value) + 10)
        .attr('dy', '.35em')
        .attr('font-size', 14)
        .attr('fill', '#00393F')
        .text(d => d.value);
    }

    // Axes
    g.append('g')
      .call(d3.axisLeft(y))
      .attr('font-size', 12);

    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('font-size', 12);

    return svg.node().outerHTML;
  }

  /**
   * GROUPED BAR CHART
   */
  groupedBarChart(data, config) {
    const {
      width = 800,
      height = 600,
      margin = { top: 40, right: 40, bottom: 60, left: 80 },
      colors = ['#00393F', '#BA8F5A', '#65873B'],
      groups = []
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x0 = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, chartWidth])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(groups)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(groups, key => d[key])) * 1.1])
      .nice()
      .range([chartHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(groups)
      .range(colors);

    // Groups
    const categoryGroups = g.selectAll('.category')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'category')
      .attr('transform', d => `translate(${x0(d.category)},0)`);

    // Bars
    categoryGroups.selectAll('rect')
      .data(d => groups.map(key => ({ key, value: d[key] })))
      .enter()
      .append('rect')
      .attr('x', d => x1(d.key))
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', d => chartHeight - y(d.value))
      .attr('fill', d => colorScale(d.key))
      .attr('rx', 4);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x0))
      .attr('font-size', 12);

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('font-size', 12);

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right - 120},${margin.top})`);

    groups.forEach((group, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0,${i * 25})`);

      legendRow.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(group))
        .attr('rx', 2);

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', 12)
        .text(group);
    });

    return svg.node().outerHTML;
  }

  /**
   * STACKED BAR CHART
   */
  stackedBarChart(data, config) {
    const {
      width = 800,
      height = 600,
      margin = { top: 40, right: 40, bottom: 60, left: 80 },
      colors = ['#00393F', '#BA8F5A', '#65873B', '#C9E4EC'],
      keys = []
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Stack data
    const stack = d3.stack()
      .keys(keys);

    const stackedData = stack(data);

    // Scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, chartWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1]) * 1.1])
      .nice()
      .range([chartHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(keys)
      .range(colors);

    // Stacked bars
    g.selectAll('.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', d => colorScale(d.key))
      .selectAll('rect')
      .data(d => d)
      .enter()
      .append('rect')
      .attr('x', d => x(d.data.category))
      .attr('y', d => y(d[1]))
      .attr('height', d => y(d[0]) - y(d[1]))
      .attr('width', x.bandwidth())
      .attr('rx', 4);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('font-size', 12);

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('font-size', 12);

    return svg.node().outerHTML;
  }

  /**
   * MULTI-LINE CHART
   */
  multiLineChart(data, config) {
    const {
      width = 800,
      height = 600,
      margin = { top: 40, right: 120, bottom: 60, left: 80 },
      colors = ['#00393F', '#BA8F5A', '#65873B'],
      xKey = 'x',
      series = []
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scalePoint()
      .domain(data.map(d => d[xKey]))
      .range([0, chartWidth]);

    const allValues = series.flatMap(s => data.map(d => d[s]));
    const y = d3.scaleLinear()
      .domain([0, d3.max(allValues) * 1.1])
      .nice()
      .range([chartHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(series)
      .range(colors);

    // Line generator
    const line = d3.line()
      .x(d => x(d[xKey]))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-chartWidth)
        .tickFormat('')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', '#E5E5E5')
        .attr('stroke-dasharray', '2,2')
      );

    // Draw lines for each series
    series.forEach(seriesName => {
      const lineData = data.map(d => ({
        [xKey]: d[xKey],
        value: d[seriesName]
      }));

      // Area (subtle fill)
      const area = d3.area()
        .x(d => x(d[xKey]))
        .y0(chartHeight)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(lineData)
        .attr('fill', colorScale(seriesName))
        .attr('fill-opacity', 0.1)
        .attr('d', area);

      // Line
      g.append('path')
        .datum(lineData)
        .attr('fill', 'none')
        .attr('stroke', colorScale(seriesName))
        .attr('stroke-width', 2)
        .attr('d', line);

      // Points
      g.selectAll(`.point-${seriesName}`)
        .data(lineData)
        .enter()
        .append('circle')
        .attr('class', `point-${seriesName}`)
        .attr('cx', d => x(d[xKey]))
        .attr('cy', d => y(d.value))
        .attr('r', 4)
        .attr('fill', colorScale(seriesName))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('font-size', 12);

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('font-size', 12);

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10},${margin.top})`);

    series.forEach((seriesName, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0,${i * 25})`);

      legendRow.append('line')
        .attr('x1', 0)
        .attr('x2', 20)
        .attr('y1', 10)
        .attr('y2', 10)
        .attr('stroke', colorScale(seriesName))
        .attr('stroke-width', 2);

      legendRow.append('text')
        .attr('x', 25)
        .attr('y', 14)
        .attr('font-size', 12)
        .text(seriesName);
    });

    return svg.node().outerHTML;
  }

  /**
   * AREA CHART (Stacked)
   */
  stackedAreaChart(data, config) {
    const {
      width = 800,
      height = 600,
      margin = { top: 40, right: 120, bottom: 60, left: 80 },
      colors = ['#00393F', '#BA8F5A', '#65873B', '#C9E4EC'],
      xKey = 'x',
      keys = []
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Stack data
    const stack = d3.stack()
      .keys(keys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stackedData = stack(data);

    // Scales
    const x = d3.scalePoint()
      .domain(data.map(d => d[xKey]))
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1]) * 1.1])
      .nice()
      .range([chartHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(keys)
      .range(colors);

    // Area generator
    const area = d3.area()
      .x(d => x(d.data[xKey]))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveMonotoneX);

    // Draw areas
    g.selectAll('.layer')
      .data(stackedData)
      .enter()
      .append('path')
      .attr('class', 'layer')
      .attr('d', area)
      .attr('fill', d => colorScale(d.key))
      .attr('fill-opacity', 0.8);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('font-size', 12);

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('font-size', 12);

    return svg.node().outerHTML;
  }

  /**
   * BUBBLE CHART
   */
  bubbleChart(data, config) {
    const {
      width = 800,
      height = 600,
      margin = { top: 40, right: 40, bottom: 60, left: 80 },
      colors = ['#00393F', '#BA8F5A', '#65873B'],
      xKey = 'x',
      yKey = 'y',
      sizeKey = 'size',
      categoryKey = 'category'
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[xKey]) * 1.1])
      .nice()
      .range([0, chartWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[yKey]) * 1.1])
      .nice()
      .range([chartHeight, 0]);

    const size = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d[sizeKey])])
      .range([5, 40]);

    const categories = [...new Set(data.map(d => d[categoryKey]))];
    const colorScale = d3.scaleOrdinal()
      .domain(categories)
      .range(colors);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-chartWidth)
        .tickFormat('')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke', '#E5E5E5')
        .attr('stroke-dasharray', '2,2')
      );

    // Bubbles
    g.selectAll('.bubble')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('cx', d => x(d[xKey]))
      .attr('cy', d => y(d[yKey]))
      .attr('r', d => size(d[sizeKey]))
      .attr('fill', d => colorScale(d[categoryKey]))
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('font-size', 12);

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('font-size', 12);

    return svg.node().outerHTML;
  }

  /**
   * HEATMAP
   */
  heatmap(data, config) {
    const {
      width = 800,
      height = 600,
      margin = { top: 40, right: 40, bottom: 60, left: 120 },
      colorScheme = d3.interpolateBlues,
      xKey = 'x',
      yKey = 'y',
      valueKey = 'value'
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique x and y values
    const xValues = [...new Set(data.map(d => d[xKey]))];
    const yValues = [...new Set(data.map(d => d[yKey]))];

    // Scales
    const x = d3.scaleBand()
      .domain(xValues)
      .range([0, chartWidth])
      .padding(0.05);

    const y = d3.scaleBand()
      .domain(yValues)
      .range([0, chartHeight])
      .padding(0.05);

    const colorScale = d3.scaleSequential(colorScheme)
      .domain([0, d3.max(data, d => d[valueKey])]);

    // Cells
    g.selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => x(d[xKey]))
      .attr('y', d => y(d[yKey]))
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', d => colorScale(d[valueKey]))
      .attr('rx', 2);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('font-size', 10);

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('font-size', 10);

    return svg.node().outerHTML;
  }

  /**
   * DONUT CHART with labels
   */
  donutChart(data, config) {
    const {
      width = 600,
      height = 600,
      margin = { top: 40, right: 40, bottom: 40, left: 40 },
      colors = ['#00393F', '#BA8F5A', '#65873B', '#C9E4EC', '#913B2F'],
      innerRadiusRatio = 0.5,
      showLabels = true,
      showPercentages = true
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const radius = Math.min(chartWidth, chartHeight) / 2;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(colors);

    // Pie generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    // Arc generators
    const arc = d3.arc()
      .innerRadius(radius * innerRadiusRatio)
      .outerRadius(radius);

    const labelArc = d3.arc()
      .innerRadius(radius * 0.75)
      .outerRadius(radius * 0.75);

    // Total for percentages
    const total = d3.sum(data, d => d.value);

    // Draw slices
    const slices = g.selectAll('.slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice');

    slices.append('path')
      .attr('d', arc)
      .attr('fill', d => colorScale(d.data.label))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3);

    // Labels
    if (showLabels) {
      slices.append('text')
        .attr('transform', d => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('font-weight', 600)
        .attr('fill', '#00393F')
        .text(d => {
          if (showPercentages) {
            const percentage = ((d.data.value / total) * 100).toFixed(1);
            return `${percentage}%`;
          }
          return d.data.label;
        });
    }

    // Center label (optional)
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', 18)
      .attr('font-weight', 700)
      .attr('fill', '#00393F')
      .text('Total')
      .attr('y', -10);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', 24)
      .attr('font-weight', 700)
      .attr('fill', '#00393F')
      .text(total)
      .attr('y', 20);

    return svg.node().outerHTML;
  }

  /**
   * TIMELINE / GANTT CHART
   */
  timelineChart(data, config) {
    const {
      width = 1000,
      height = 400,
      margin = { top: 40, right: 40, bottom: 60, left: 150 },
      colors = ['#00393F', '#BA8F5A'],
      startKey = 'start',
      endKey = 'end',
      labelKey = 'label'
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d');
    data.forEach(d => {
      d[startKey] = parseDate(d[startKey]);
      d[endKey] = parseDate(d[endKey]);
    });

    // Scales
    const x = d3.scaleTime()
      .domain([
        d3.min(data, d => d[startKey]),
        d3.max(data, d => d[endKey])
      ])
      .range([0, chartWidth]);

    const y = d3.scaleBand()
      .domain(data.map(d => d[labelKey]))
      .range([0, chartHeight])
      .padding(0.2);

    // Timeline bars
    g.selectAll('.timeline-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'timeline-bar')
      .attr('x', d => x(d[startKey]))
      .attr('y', d => y(d[labelKey]))
      .attr('width', d => x(d[endKey]) - x(d[startKey]))
      .attr('height', y.bandwidth())
      .attr('fill', colors[0])
      .attr('rx', 4);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .attr('font-size', 12);

    g.append('g')
      .call(d3.axisLeft(y))
      .attr('font-size', 12);

    return svg.node().outerHTML;
  }

  /**
   * LOLLIPOP CHART
   */
  lollipopChart(data, config) {
    const {
      width = 800,
      height = 600,
      margin = { top: 40, right: 40, bottom: 60, left: 120 },
      colors = ['#00393F'],
      orientation = 'horizontal'
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (orientation === 'horizontal') {
      // Scales
      const y = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, chartHeight])
        .padding(0.3);

      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.1])
        .nice()
        .range([0, chartWidth]);

      // Lines
      g.selectAll('.lollipop-line')
        .data(data)
        .enter()
        .append('line')
        .attr('class', 'lollipop-line')
        .attr('x1', 0)
        .attr('x2', d => x(d.value))
        .attr('y1', d => y(d.label) + y.bandwidth() / 2)
        .attr('y2', d => y(d.label) + y.bandwidth() / 2)
        .attr('stroke', colors[0])
        .attr('stroke-width', 2);

      // Circles
      g.selectAll('.lollipop-circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'lollipop-circle')
        .attr('cx', d => x(d.value))
        .attr('cy', d => y(d.label) + y.bandwidth() / 2)
        .attr('r', 8)
        .attr('fill', colors[0]);

      // Axes
      g.append('g')
        .call(d3.axisLeft(y))
        .attr('font-size', 12);

      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .attr('font-size', 12);
    }

    return svg.node().outerHTML;
  }

  /**
   * RADAR / SPIDER CHART
   */
  radarChart(data, config) {
    const {
      width = 600,
      height = 600,
      margin = { top: 40, right: 40, bottom: 40, left: 40 },
      colors = ['#00393F', '#BA8F5A'],
      maxValue = 100
    } = config;

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const radius = Math.min(chartWidth, chartHeight) / 2;

    const svg = d3.select(document.body)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const axes = Object.keys(data[0]).filter(k => k !== 'series');
    const angleSlice = (Math.PI * 2) / axes.length;

    // Radial scale
    const rScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, radius]);

    // Draw circular gridlines
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      const levelRadius = (radius / levels) * i;

      g.append('circle')
        .attr('r', levelRadius)
        .attr('fill', 'none')
        .attr('stroke', '#E5E5E5')
        .attr('stroke-width', 1);
    }

    // Draw axes
    axes.forEach((axis, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const lineCoord = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      };

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', lineCoord.x)
        .attr('y2', lineCoord.y)
        .attr('stroke', '#E5E5E5')
        .attr('stroke-width', 1);

      // Labels
      const labelCoord = {
        x: Math.cos(angle) * (radius + 20),
        y: Math.sin(angle) * (radius + 20)
      };

      g.append('text')
        .attr('x', labelCoord.x)
        .attr('y', labelCoord.y)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .text(axis);
    });

    // Draw data series
    data.forEach((series, seriesIndex) => {
      const coords = axes.map((axis, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const value = series[axis];
        return {
          x: Math.cos(angle) * rScale(value),
          y: Math.sin(angle) * rScale(value)
        };
      });

      // Close the polygon
      coords.push(coords[0]);

      // Line generator
      const line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

      // Draw area
      g.append('path')
        .datum(coords)
        .attr('d', line)
        .attr('fill', colors[seriesIndex])
        .attr('fill-opacity', 0.2)
        .attr('stroke', colors[seriesIndex])
        .attr('stroke-width', 2);

      // Draw points
      g.selectAll(`.point-${seriesIndex}`)
        .data(coords.slice(0, -1))
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 4)
        .attr('fill', colors[seriesIndex])
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    });

    return svg.node().outerHTML;
  }
}

module.exports = ChartTemplates;
