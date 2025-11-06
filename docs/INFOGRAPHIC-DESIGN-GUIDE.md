# INFOGRAPHIC DESIGN GUIDE
**AI-Powered Infographic Generation System**

## Overview

The Infographic Design & Data Visualization system creates publication-quality infographics using AI-powered chart selection, TEEI brand-compliant designs, and storytelling-driven visualizations.

---

## Quick Start

### Basic Usage

```bash
# Generate infographic from data
node scripts/generate-infographics.js data.json

# With data storytelling
node scripts/generate-infographics.js data.json --with-story

# With custom icons
node scripts/generate-infographics.js data.json --with-icons \
  --concepts "learning,growth,success"

# Full package
node scripts/generate-infographics.js data.csv \
  --with-story --with-icons \
  --size fullPage --format svg \
  --title "Q4 2024 Results"
```

---

## Features

### 1. AI-Powered Chart Selection

The system automatically selects the optimal chart type based on:
- **Data structure** (quantitative, categorical, temporal)
- **Relationships** (comparison, trend, distribution)
- **Complexity** (data points, dimensions)
- **Communication goal** (what insight to highlight)

**Supported Chart Types:**
- **Comparison**: Bar, column, bullet, spider, lollipop
- **Trend**: Line, area, stream, sparkline
- **Distribution**: Histogram, box, violin, density
- **Relationship**: Scatter, bubble, heatmap
- **Composition**: Pie, donut, treemap, sunburst
- **Flow**: Sankey, chord, network
- **Hierarchical**: Tree, dendrogram, circle packing

### 2. Brand-Compliant Design

All infographics follow TEEI brand guidelines:

**Colors:**
- Primary: Nordshore (#00393F), Sky (#C9E4EC), Sand (#FFF1E2)
- Accent: Gold (#BA8F5A), Moss (#65873B), Clay (#913B2F)
- Data viz: Sequential, diverging, categorical palettes

**Typography:**
- **Headlines**: Lora Bold, 32pt
- **Subheads**: Lora Semibold, 24pt
- **Body**: Roboto Flex Regular, 14pt
- **Labels**: Roboto Flex Medium, 12pt

**Layout:**
- 12-column grid with 20pt gutters
- 60-80pt margins
- Consistent spacing and alignment

### 3. Data Storytelling

Transform raw data into compelling narratives:

**Storytelling Frameworks:**
- **Problem-Solution**: Identify issues and present solutions
- **Before-After**: Show transformation and impact
- **Journey**: Take audience through progress
- **Comparison**: Analyze options and recommend
- **Trend**: Project future from historical data

**Generated Elements:**
- Compelling insights (AI-identified)
- Executive summary
- Section narratives
- Key findings
- Call to action

### 4. Custom Icon Generation

Generate custom icons using DALL-E 3:

```javascript
const IconGenerator = require('./lib/icon-generator');
const generator = new IconGenerator();

// Generate TEEI icon set
const result = await generator.generateTEEIIconSet();

// Custom concepts
const icons = await generator.generateCustomIcons(
  ['online learning', 'collaboration', 'innovation'],
  { style: 'flat', colorScheme: 'warm' }
);
```

**Icon Styles:**
- Flat (default)
- Minimal
- Modern
- Outlined
- Isometric

---

## Data Formats

### JSON (Array)

```json
[
  { "label": "Category A", "value": 100 },
  { "label": "Category B", "value": 150 },
  { "label": "Category C", "value": 75 }
]
```

### JSON (Object)

```json
{
  "Category A": 100,
  "Category B": 150,
  "Category C": 75
}
```

### CSV

```csv
label,value
Category A,100
Category B,150
Category C,75
```

### Complex Data (Multi-Series)

```json
[
  { "date": "2024-01", "series1": 100, "series2": 120, "series3": 90 },
  { "date": "2024-02", "series1": 110, "series2": 130, "series3": 95 },
  { "date": "2024-03", "series1": 125, "series2": 140, "series3": 100 }
]
```

---

## Chart Types Guide

### Bar Chart (Comparison)

**Best for:**
- Comparing values across categories
- Rankings and leaderboards
- Survey results

**Example:**
```bash
node scripts/generate-infographics.js sales-by-region.json
```

**When to use:**
- 3-15 categories
- Simple comparisons
- Clear winners/losers

### Line Chart (Trend)

**Best for:**
- Time series data
- Growth trends
- Pattern identification

**Example:**
```bash
node scripts/generate-infographics.js monthly-revenue.csv --with-story
```

**When to use:**
- Temporal data
- Continuous data
- Multiple series comparison

### Pie/Donut Chart (Composition)

**Best for:**
- Part-to-whole relationships
- Percentages and proportions
- 3-6 categories maximum

**Example:**
```bash
node scripts/generate-infographics.js budget-allocation.json --size square
```

**When to use:**
- Categories sum to 100%
- Simple proportions
- Limited categories

### Scatter Chart (Relationship)

**Best for:**
- Correlations
- Pattern detection
- Outlier identification

**Example:**
```bash
node scripts/generate-infographics.js student-performance.json
```

**When to use:**
- Two quantitative variables
- Large datasets
- Relationship analysis

### Sankey Diagram (Flow)

**Best for:**
- Process flows
- Resource allocation
- Journey mapping

**Example:**
```bash
node scripts/generate-infographics.js student-pathways.json --size fullPage
```

**When to use:**
- Source-target relationships
- Flow visualization
- Complex pathways

---

## Design Best Practices

### 1. Chart Selection

**DO:**
- ✅ Let AI recommend chart type
- ✅ Consider audience familiarity
- ✅ Match chart to data structure
- ✅ Prioritize clarity over novelty

**DON'T:**
- ❌ Force inappropriate chart types
- ❌ Use 3D effects
- ❌ Overcomplicate simple data
- ❌ Use pie charts for many categories

### 2. Color Usage

**DO:**
- ✅ Use TEEI brand colors
- ✅ Maintain high contrast for accessibility
- ✅ Use color to highlight insights
- ✅ Be consistent across series

**DON'T:**
- ❌ Use too many colors (max 6)
- ❌ Use red/green for non-cultural-specific data
- ❌ Rely solely on color (use patterns too)
- ❌ Use copper/orange (not TEEI brand)

### 3. Typography

**DO:**
- ✅ Use hierarchy (title > subtitle > labels)
- ✅ Keep fonts readable at small sizes
- ✅ Align text consistently
- ✅ Use Lora for headlines, Roboto for data

**DON'T:**
- ❌ Mix more than 2 font families
- ❌ Use font sizes below 10pt
- ❌ Use all caps for long text
- ❌ Center-align data labels

### 4. Data-Ink Ratio

**DO:**
- ✅ Remove non-essential elements
- ✅ Use subtle gridlines
- ✅ Let data be the focus
- ✅ Use white space effectively

**DON'T:**
- ❌ Add decorative elements
- ❌ Use heavy borders
- ❌ Clutter with legends
- ❌ Use unnecessary 3D effects

---

## Advanced Features

### Custom Annotations

```javascript
const InfographicEngine = require('./lib/infographic-engine');
const engine = new InfographicEngine();

const result = await engine.generateInfographic(data, {
  title: 'Student Growth 2024',
  annotations: [
    {
      text: 'Record enrollment',
      dataPoint: 'Q4',
      position: 'top'
    }
  ]
});
```

### Data Storytelling

```javascript
const DataStorytelling = require('./lib/data-storytelling');
const storytelling = new DataStorytelling();

const story = await storytelling.generateDataStory(data, {
  purpose: 'Quarterly review',
  audience: 'Board of directors',
  framework: 'problem-solution'
});

console.log(story.narrative.title);
console.log(story.insights.map(i => i.statement));
```

### Multiple Visualizations

```javascript
// Generate primary + alternatives
const result = await engine.generateInfographic(data, {
  generateAlternatives: true
});

console.log('Primary:', result.design.chart.type);
result.alternatives.forEach(alt => {
  console.log('Alternative:', alt.type, '-', alt.useCase);
});
```

---

## Export Options

### SVG (Default)

**Best for:**
- Print materials
- Scalable graphics
- Further editing in Illustrator

```bash
node scripts/generate-infographics.js data.json --format svg
```

### PNG

**Best for:**
- Web use
- Social media
- Email attachments

```bash
node scripts/generate-infographics.js data.json --format png
```

### With Story Package

**Exports:**
- Infographic (SVG/PNG)
- Data story (JSON)
- Narrative (Markdown)
- Package manifest

```bash
node scripts/generate-infographics.js data.json --with-story
```

---

## Integration

### Programmatic Use

```javascript
const InfographicEngine = require('./scripts/lib/infographic-engine');
const engine = new InfographicEngine();

async function createInfographic() {
  const data = [
    { label: 'Students', value: 5000 },
    { label: 'Teachers', value: 250 },
    { label: 'Programs', value: 15 }
  ];

  const result = await engine.generateInfographic(data, {
    title: 'TEEI Impact 2024',
    purpose: 'Annual report',
    audience: 'Stakeholders',
    size: 'fullPage'
  });

  // Export
  await engine.exportInfographic(
    result.svg,
    'teei-impact-2024',
    'svg'
  );

  console.log('Chart type:', result.design.chart.type);
  console.log('Insights:', result.insights.length);
}

createInfographic();
```

### API Integration

```javascript
const express = require('express');
const app = express();
const engine = new InfographicEngine();

app.post('/api/infographic', async (req, res) => {
  const { data, options } = req.body;

  try {
    const result = await engine.generateInfographic(data, options);

    res.json({
      success: true,
      svg: result.svg,
      metadata: result.metadata,
      insights: result.insights
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000);
```

---

## Troubleshooting

### Issue: AI selection fails

**Solution:**
- Check API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY)
- Verify data structure is valid
- Fallback to rule-based selection

### Issue: Poor color contrast

**Solution:**
- Use high-contrast color schemes
- Test with accessibility tools
- Follow WCAG AA standards (4.5:1 ratio)

### Issue: Text cutoff

**Solution:**
- Increase margins
- Reduce font size
- Use shorter labels
- Enable label rotation

### Issue: Slow generation

**Solution:**
- Reduce data points (<1000 recommended)
- Disable AI features for speed
- Use caching for repeated data

---

## Configuration

Edit `/home/user/pdf-orchestrator/config/infographic-config.json`:

```json
{
  "defaults": {
    "chartSize": "fullPage",
    "colorScheme": "warm-professional",
    "withStory": true
  },
  "aiSettings": {
    "openai": {
      "model": "gpt-4o",
      "temperature": 0.3
    }
  }
}
```

---

## Resources

**Documentation:**
- Chart Templates: `/home/user/pdf-orchestrator/scripts/lib/chart-templates.js`
- Icon Generator: `/home/user/pdf-orchestrator/scripts/lib/icon-generator.js`
- Data Storytelling: `/home/user/pdf-orchestrator/scripts/lib/data-storytelling.js`

**Examples:**
- Sample data: `/home/user/pdf-orchestrator/example-jobs/`
- Generated infographics: `/home/user/pdf-orchestrator/exports/infographics/`

**Support:**
- Issues: Check error logs in exports directory
- Debug: Set `DEBUG=1` environment variable
- Help: Run `node scripts/generate-infographics.js --help`

---

**Last Updated:** 2025-11-06
**Version:** 1.0.0
**Status:** Production Ready
