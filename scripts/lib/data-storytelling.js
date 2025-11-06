/**
 * DATA STORYTELLING
 * AI-powered narrative generation for data visualizations
 *
 * Features:
 * - Generate compelling data narratives
 * - Identify key insights and trends
 * - Create annotated visualizations
 * - Suggest visual storytelling techniques
 * - Generate executive summaries
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

class DataStorytelling {
  constructor(config = {}) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || config.openaiKey
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || config.anthropicKey
    });

    // Storytelling frameworks
    this.frameworks = {
      'problem-solution': {
        structure: ['Problem', 'Impact', 'Solution', 'Results'],
        tone: 'urgent and hopeful'
      },
      'before-after': {
        structure: ['Before', 'Intervention', 'After', 'Lessons'],
        tone: 'transformative'
      },
      'journey': {
        structure: ['Starting Point', 'Challenges', 'Progress', 'Destination'],
        tone: 'narrative and inspiring'
      },
      'comparison': {
        structure: ['Context', 'Options', 'Analysis', 'Recommendation'],
        tone: 'analytical and balanced'
      },
      'trend': {
        structure: ['Historical Context', 'Current State', 'Trajectory', 'Implications'],
        tone: 'forward-looking'
      }
    };
  }

  /**
   * Generate complete data story
   */
  async generateDataStory(data, context = {}) {
    console.log('📖 Generating data story...');

    try {
      // 1. Analyze data for insights
      const insights = await this.analyzeForInsights(data, context);

      // 2. Select storytelling framework
      const framework = this.selectFramework(insights, context);

      // 3. Generate narrative
      const narrative = await this.generateNarrative(data, insights, framework, context);

      // 4. Create annotations
      const annotations = await this.generateAnnotations(data, insights);

      // 5. Generate headlines and callouts
      const headlines = await this.generateHeadlines(insights, context);

      // 6. Create executive summary
      const summary = await this.generateExecutiveSummary(data, insights, context);

      console.log('✅ Data story generation complete!');

      return {
        insights,
        framework,
        narrative,
        annotations,
        headlines,
        summary,
        metadata: {
          generated: new Date().toISOString(),
          dataPoints: Array.isArray(data) ? data.length : Object.keys(data).length
        }
      };

    } catch (error) {
      console.error('❌ Data story generation failed:', error);
      throw error;
    }
  }

  /**
   * Analyze data for compelling insights
   */
  async analyzeForInsights(data, context) {
    const prompt = `Analyze this data and extract compelling insights for a data visualization:

DATA:
${JSON.stringify(data, null, 2)}

CONTEXT:
- Purpose: ${context.purpose || 'General communication'}
- Audience: ${context.audience || 'Professional stakeholders'}
- Goal: ${context.goal || 'Inform and persuade'}

Identify 5-7 insights focusing on:
1. SURPRISING findings (unexpected patterns or outliers)
2. SIGNIFICANT trends (important changes over time)
3. COMPARISONS (notable differences between groups)
4. IMPLICATIONS (what this means for the audience)
5. ACTIONABLE insights (what should be done)

For each insight, provide:
- Clear statement (one sentence)
- Data support (specific numbers/facts)
- Significance (why it matters)
- Visual suggestion (how to highlight in chart)
- Priority (1-5, where 5 is most important)

Return as JSON array.`;

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

      // Parse JSON
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];

    } catch (error) {
      console.error('⚠️ Insight analysis failed:', error);
      return this.fallbackInsights(data);
    }
  }

  /**
   * Fallback insights (rule-based)
   */
  fallbackInsights(data) {
    const insights = [];

    if (Array.isArray(data) && data.length > 0) {
      // Calculate basic statistics
      const values = data.map(d => d.value || 0).filter(v => !isNaN(v));

      if (values.length > 0) {
        const max = Math.max(...values);
        const min = Math.min(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        insights.push({
          statement: `Values range from ${min} to ${max}, with an average of ${avg.toFixed(2)}`,
          dataSupport: `Min: ${min}, Max: ${max}, Avg: ${avg.toFixed(2)}`,
          significance: 'Shows the spread and central tendency of the data',
          visualSuggestion: 'Highlight min and max values with annotations',
          priority: 3
        });

        // Identify highest value
        const maxItem = data.find(d => (d.value || 0) === max);
        if (maxItem) {
          insights.push({
            statement: `${maxItem.label || 'Highest value'} leads with ${max}`,
            dataSupport: `${max} (${((max / avg) * 100 - 100).toFixed(1)}% above average)`,
            significance: 'Identifies the top performer',
            visualSuggestion: 'Use contrasting color for highest bar',
            priority: 4
          });
        }
      }
    }

    return insights;
  }

  /**
   * Select appropriate storytelling framework
   */
  selectFramework(insights, context) {
    // Analyze insights to select best framework
    const hasComparison = insights.some(i =>
      i.statement.toLowerCase().includes('compare') ||
      i.statement.toLowerCase().includes('versus')
    );

    const hasTrend = insights.some(i =>
      i.statement.toLowerCase().includes('trend') ||
      i.statement.toLowerCase().includes('growth') ||
      i.statement.toLowerCase().includes('decline')
    );

    const hasProblem = insights.some(i =>
      i.statement.toLowerCase().includes('problem') ||
      i.statement.toLowerCase().includes('issue') ||
      i.statement.toLowerCase().includes('challenge')
    );

    if (hasProblem) {
      return this.frameworks['problem-solution'];
    } else if (hasTrend) {
      return this.frameworks['trend'];
    } else if (hasComparison) {
      return this.frameworks['comparison'];
    } else if (context.framework) {
      return this.frameworks[context.framework] || this.frameworks['journey'];
    } else {
      return this.frameworks['journey'];
    }
  }

  /**
   * Generate compelling narrative
   */
  async generateNarrative(data, insights, framework, context) {
    const prompt = `Create a compelling data narrative using this framework:

FRAMEWORK: ${JSON.stringify(framework, null, 2)}

DATA INSIGHTS:
${insights.map((insight, i) => `${i + 1}. ${insight.statement} (Priority: ${insight.priority})`).join('\n')}

CONTEXT:
- Purpose: ${context.purpose || 'General communication'}
- Audience: ${context.audience || 'Professional stakeholders'}
- Tone: ${framework.tone}

Create a narrative with ${framework.structure.length} sections:
${framework.structure.map((section, i) => `${i + 1}. ${section}`).join('\n')}

For each section:
- Write 2-3 sentences
- Reference specific data points
- Use ${framework.tone} tone
- Connect to audience goals
- Build toward conclusion

Return JSON:
{
  "title": "Compelling title (8-12 words)",
  "subtitle": "Supporting subtitle (12-20 words)",
  "sections": [
    {
      "heading": "Section name",
      "content": "Narrative text",
      "keyPoint": "Main takeaway"
    }
  ],
  "conclusion": "Final takeaway (1-2 sentences)",
  "callToAction": "What audience should do next"
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert data storyteller who creates compelling narratives from data insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('⚠️ Narrative generation failed:', error);
      return this.fallbackNarrative(insights, framework);
    }
  }

  /**
   * Fallback narrative
   */
  fallbackNarrative(insights, framework) {
    const topInsights = insights
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);

    return {
      title: 'Data Insights and Analysis',
      subtitle: 'Key findings from the data',
      sections: topInsights.map((insight, i) => ({
        heading: framework.structure[i] || `Insight ${i + 1}`,
        content: insight.statement + '. ' + insight.significance,
        keyPoint: insight.statement
      })),
      conclusion: 'These insights highlight important patterns in the data.',
      callToAction: 'Review the visualization for detailed analysis.'
    };
  }

  /**
   * Generate visual annotations
   */
  async generateAnnotations(data, insights) {
    const topInsights = insights
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);

    return topInsights.map(insight => ({
      text: insight.statement,
      position: insight.visualSuggestion || 'auto',
      style: 'callout',
      dataPoint: this.findRelevantDataPoint(data, insight)
    }));
  }

  /**
   * Find data point relevant to insight
   */
  findRelevantDataPoint(data, insight) {
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    // Simple heuristic: find highest/lowest value mentioned
    if (insight.statement.toLowerCase().includes('highest') ||
        insight.statement.toLowerCase().includes('maximum')) {
      const values = data.map(d => d.value || 0);
      const maxValue = Math.max(...values);
      return data.find(d => (d.value || 0) === maxValue);
    } else if (insight.statement.toLowerCase().includes('lowest') ||
               insight.statement.toLowerCase().includes('minimum')) {
      const values = data.map(d => d.value || 0);
      const minValue = Math.min(...values);
      return data.find(d => (d.value || 0) === minValue);
    }

    return null;
  }

  /**
   * Generate compelling headlines
   */
  async generateHeadlines(insights, context) {
    const topInsight = insights.sort((a, b) => b.priority - a.priority)[0];

    const prompt = `Create 5 compelling headlines for this data insight:

INSIGHT: ${topInsight.statement}
DATA: ${topInsight.dataSupport}
AUDIENCE: ${context.audience || 'Professional stakeholders'}

Headlines should be:
- Attention-grabbing but accurate
- 8-12 words
- Action-oriented when possible
- Specific (include numbers)
- Professional tone

Return as JSON array of strings.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.8
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.headlines || [];

    } catch (error) {
      console.error('⚠️ Headline generation failed:', error);
      return [
        topInsight.statement,
        `Key Finding: ${topInsight.statement}`,
        `Data Shows: ${topInsight.statement}`
      ];
    }
  }

  /**
   * Generate executive summary
   */
  async generateExecutiveSummary(data, insights, context) {
    const topInsights = insights
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);

    const prompt = `Create a concise executive summary of these data insights:

TOP INSIGHTS:
${topInsights.map((insight, i) => `${i + 1}. ${insight.statement}\n   Support: ${insight.dataSupport}`).join('\n')}

CONTEXT:
- Purpose: ${context.purpose || 'General communication'}
- Audience: ${context.audience || 'Executives and decision-makers'}

Create a summary with:
1. Opening statement (1 sentence - the big picture)
2. Key findings (3 bullet points)
3. Implications (1-2 sentences - what this means)
4. Recommendation (1 sentence - what to do)

Return as JSON:
{
  "opening": "...",
  "keyFindings": ["...", "...", "..."],
  "implications": "...",
  "recommendation": "..."
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.5
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('⚠️ Summary generation failed:', error);
      return {
        opening: 'Analysis reveals significant patterns in the data.',
        keyFindings: topInsights.map(i => i.statement),
        implications: 'These findings suggest important considerations for decision-making.',
        recommendation: 'Review detailed visualizations for deeper insights.'
      };
    }
  }

  /**
   * Generate storytelling suggestions for visualization
   */
  async generateVisualizationSuggestions(data, insights) {
    return {
      colorCoding: {
        suggestion: 'Use color to highlight key insights',
        implementation: [
          'Highlight highest/lowest values in accent color',
          'Use neutral colors for context',
          'Apply gradient for trends'
        ]
      },
      annotations: {
        suggestion: 'Add text annotations for key points',
        implementation: [
          'Label significant data points',
          'Add explanatory text for trends',
          'Include comparison callouts'
        ]
      },
      visualHierarchy: {
        suggestion: 'Guide viewer attention with visual hierarchy',
        implementation: [
          'Make key data points larger/bolder',
          'Use contrasting colors for emphasis',
          'Position important elements prominently'
        ]
      },
      context: {
        suggestion: 'Provide context for better understanding',
        implementation: [
          'Show benchmarks or targets',
          'Include historical comparison',
          'Add industry averages'
        ]
      }
    };
  }

  /**
   * Create narrative-driven chart configuration
   */
  async createNarrativeChart(data, story, context) {
    return {
      data: data,
      narrative: {
        title: story.narrative.title,
        subtitle: story.narrative.subtitle,
        annotations: story.annotations,
        highlights: this.identifyHighlights(data, story.insights)
      },
      design: {
        emphasizeInsights: true,
        colorScheme: 'storytelling',
        showAnnotations: true,
        guideAttention: true
      },
      metadata: {
        framework: story.framework,
        keyMessage: story.narrative.sections[0]?.keyPoint,
        callToAction: story.narrative.callToAction
      }
    };
  }

  /**
   * Identify data points to highlight
   */
  identifyHighlights(data, insights) {
    const highlights = [];

    insights.forEach(insight => {
      const dataPoint = this.findRelevantDataPoint(data, insight);
      if (dataPoint) {
        highlights.push({
          dataPoint,
          reason: insight.statement,
          priority: insight.priority
        });
      }
    });

    return highlights.sort((a, b) => b.priority - a.priority);
  }
}

module.exports = DataStorytelling;
