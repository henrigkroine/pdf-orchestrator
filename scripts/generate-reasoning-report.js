#!/usr/bin/env node
/**
 * REASONING REPORT GENERATOR
 *
 * Generates beautiful HTML reports visualizing:
 * - Reasoning chains (step-by-step AI thinking)
 * - Agent collaboration workflows
 * - Debate transcripts
 * - Issue prioritization
 * - Cost analysis
 *
 * Usage:
 *   node scripts/generate-reasoning-report.js <validation-result.json>
 *
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Generate HTML report from validation result
 */
async function generateReport(resultData, outputPath) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reasoning Validation Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1, h2, h3 { color: #00393F; margin: 20px 0 10px; }
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #00393F 0%, #00584F 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
    }
    .header h1 { color: white; margin: 0; }
    .header p { margin: 10px 0; opacity: 0.9; }
    .reasoning-chain {
      margin: 20px 0;
      padding: 20px;
      background: #f8f9fa;
      border-left: 4px solid #00393F;
      border-radius: 8px;
    }
    .reasoning-step {
      margin: 15px 0;
      padding: 15px;
      background: white;
      border-radius: 8px;
    }
    .reasoning-step-header {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #00393F;
      margin-bottom: 10px;
    }
    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: #00393F;
      color: white;
      border-radius: 50%;
      margin-right: 12px;
      font-size: 14px;
    }
    .issue {
      padding: 15px;
      margin: 10px 0;
      border-radius: 8px;
      border-left: 4px solid;
    }
    .issue-critical { border-color: #c62828; background: #ffebee; }
    .issue-high { border-color: #ef6c00; background: #fff3e0; }
    .issue-medium { border-color: #f57c00; background: #fff8e1; }
    .issue-low { border-color: #fbc02d; background: #fffde7; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-critical { background: #c62828; color: white; }
    .badge-high { background: #ef6c00; color: white; }
    .badge-medium { background: #f57c00; color: white; }
    .badge-low { background: #fbc02d; color: #333; }
    .grade {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      font-size: 32px;
      font-weight: 700;
      color: white;
      margin: 0 auto;
    }
    .grade-a { background: #2e7d32; }
    .grade-b { background: #388e3c; }
    .grade-c { background: #f57c00; }
    .grade-d { background: #ef6c00; }
    .grade-f { background: #c62828; }
    .agent-card {
      padding: 20px;
      margin: 15px 0;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .agent-header {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }
    .agent-icon {
      width: 48px;
      height: 48px;
      background: #00393F;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      font-size: 24px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }
    .metric {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 700;
      color: #00393F;
      margin: 10px 0;
    }
    .metric-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .workflow {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin: 20px 0;
    }
    .workflow-step {
      text-align: center;
      padding: 15px;
    }
    .workflow-arrow {
      font-size: 24px;
      color: #00393F;
    }
    pre {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 13px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    ${generateHeaderSection(resultData)}
    ${generateOverviewSection(resultData)}
    ${generateReasoningSection(resultData)}
    ${generateAgentsSection(resultData)}
    ${generateIssuesSection(resultData)}
    ${generateRecommendationsSection(resultData)}
    ${generateMetricsSection(resultData)}
  </div>
</body>
</html>`;

  await fs.writeFile(outputPath, html);
  console.log(`✅ Report generated: ${outputPath}`);
}

function generateHeaderSection(data) {
  return `
    <div class="header">
      <h1>🧠 Reasoning Validation Report</h1>
      <p><strong>Document:</strong> ${data.pdfPath ? path.basename(data.pdfPath) : 'Unknown'}</p>
      <p><strong>Generated:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      <p><strong>Model:</strong> ${data.config?.model || 'Multi-Agent System'}</p>
    </div>
  `;
}

function generateOverviewSection(data) {
  const assessment = data.result?.overall_assessment || data.result?.final_assessment?.overall_assessment || {};
  const grade = assessment.grade || 'N/A';
  const score = assessment.score || 0;
  const confidence = assessment.confidence || 0;

  const gradeClass = grade.startsWith('A') ? 'a' : grade.startsWith('B') ? 'b' : grade.startsWith('C') ? 'c' : grade.startsWith('D') ? 'd' : 'f';

  return `
    <div class="card">
      <h2>📊 Overall Assessment</h2>
      <div style="display: grid; grid-template-columns: 120px 1fr; gap: 20px; align-items: center;">
        <div class="grade grade-${gradeClass}">${grade}</div>
        <div>
          <p><strong>Score:</strong> ${score}/100</p>
          <p><strong>Confidence:</strong> ${(confidence * 100).toFixed(1)}%</p>
          <p><strong>Summary:</strong> ${assessment.summary || 'No summary available'}</p>
        </div>
      </div>
    </div>
  `;
}

function generateReasoningSection(data) {
  const reasoningChain = data.result?.reasoning_chain || data.result?.final_assessment?.reasoning_chain || [];

  if (reasoningChain.length === 0) {
    return '';
  }

  return `
    <div class="card">
      <h2>🔍 Reasoning Chain</h2>
      <p>Step-by-step AI thinking process:</p>
      <div class="reasoning-chain">
        ${reasoningChain.map(step => `
          <div class="reasoning-step">
            <div class="reasoning-step-header">
              <span class="step-number">${step.step}</span>
              <span>${step.name || 'Analysis'}</span>
            </div>
            <p>${step.thinking}</p>
            ${step.findings && step.findings.length > 0 ? `
              <ul style="margin-top: 10px; padding-left: 20px;">
                ${step.findings.map(f => `<li>${f}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateAgentsSection(data) {
  const agents = data.result?.agents;

  if (!agents) {
    return '';
  }

  return `
    <div class="card">
      <h2>👥 Agent Collaboration</h2>
      <p>Specialized AI agents working together:</p>

      <div class="workflow">
        <div class="workflow-step">
          <div style="font-size: 36px;">🎨</div>
          <div>Brand Expert</div>
        </div>
        <div class="workflow-arrow">→</div>
        <div class="workflow-step">
          <div style="font-size: 36px;">📐</div>
          <div>Design Critic</div>
        </div>
        <div class="workflow-arrow">→</div>
        <div class="workflow-step">
          <div style="font-size: 36px;">♿</div>
          <div>Accessibility</div>
        </div>
        <div class="workflow-arrow">→</div>
        <div class="workflow-step">
          <div style="font-size: 36px;">✍️</div>
          <div>Content Editor</div>
        </div>
        <div class="workflow-arrow">→</div>
        <div class="workflow-step">
          <div style="font-size: 36px;">⚖️</div>
          <div>Coordinator</div>
        </div>
      </div>

      ${Object.entries(agents).map(([name, summary]) => `
        <div class="agent-card">
          <div class="agent-header">
            <div class="agent-icon">🤖</div>
            <div>
              <h3 style="margin: 0;">${name.replace(/([A-Z])/g, ' $1').trim()}</h3>
              <p style="margin: 5px 0; color: #666;">Score: ${summary.overall_score}/100 • Issues: ${summary.issues_found}</p>
            </div>
          </div>
          ${summary.key_findings && summary.key_findings.length > 0 ? `
            <div style="margin-top: 10px;">
              <strong>Key Findings:</strong>
              <ul style="margin-top: 5px; padding-left: 20px;">
                ${summary.key_findings.map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function generateIssuesSection(data) {
  const issues = data.result?.issues || data.result?.final_assessment?.issues || [];

  if (issues.length === 0) {
    return `
      <div class="card">
        <h2>✅ Issues</h2>
        <p style="color: #2e7d32; font-size: 18px;">No issues found! Document meets all quality standards.</p>
      </div>
    `;
  }

  return `
    <div class="card">
      <h2>⚠️ Issues Found</h2>
      <p>Total issues: ${issues.length}</p>

      ${issues.map((issue, i) => `
        <div class="issue issue-${issue.severity}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span><strong>#${i + 1}</strong> ${issue.issue}</span>
            <span class="badge badge-${issue.severity}">${issue.severity}</span>
          </div>
          ${issue.reasoning ? `<p><strong>Reasoning:</strong> ${issue.reasoning}</p>` : ''}
          ${issue.evidence ? `<p><strong>Evidence:</strong> ${issue.evidence}</p>` : ''}
          <p><strong>Recommendation:</strong> ${issue.recommendation || 'Fix this issue'}</p>
          <p><strong>Confidence:</strong> ${(issue.confidence * 100).toFixed(1)}%</p>
          ${issue.sources ? `<p><strong>Sources:</strong> ${issue.sources.join(', ')}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

function generateRecommendationsSection(data) {
  const recommendations = data.result?.recommendations || [];

  if (recommendations.length === 0) {
    return '';
  }

  return `
    <div class="card">
      <h2>🎯 Prioritized Recommendations</h2>
      <p>Action items sorted by priority and impact:</p>

      <ol style="padding-left: 20px;">
        ${recommendations.map(rec => `
          <li style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>${rec.issue}</strong>
              <span class="badge badge-${rec.severity}">${rec.severity}</span>
            </div>
            <p style="margin: 10px 0;">${rec.recommendation}</p>
            <p style="font-size: 12px; color: #666;">
              Confidence: ${(rec.confidence * 100).toFixed(1)}% •
              Sources: ${rec.sources.join(', ')}
            </p>
          </li>
        `).join('')}
      </ol>
    </div>
  `;
}

function generateMetricsSection(data) {
  const metadata = data.result?.metadata || {};
  const collaboration = data.result?.collaboration || {};

  return `
    <div class="card">
      <h2>📈 Metrics</h2>
      <div class="metrics">
        ${metadata.total_agents ? `
          <div class="metric">
            <div class="metric-label">Agents</div>
            <div class="metric-value">${metadata.total_agents}</div>
          </div>
        ` : ''}

        ${metadata.duration ? `
          <div class="metric">
            <div class="metric-label">Duration</div>
            <div class="metric-value">${(metadata.duration / 1000).toFixed(1)}s</div>
          </div>
        ` : ''}

        ${collaboration.conflicts_detected !== undefined ? `
          <div class="metric">
            <div class="metric-label">Conflicts</div>
            <div class="metric-value">${collaboration.conflicts_detected}</div>
          </div>
        ` : ''}

        ${collaboration.debates_conducted !== undefined ? `
          <div class="metric">
            <div class="metric-label">Debates</div>
            <div class="metric-value">${collaboration.debates_conducted}</div>
          </div>
        ` : ''}

        ${data.result?.cost ? `
          <div class="metric">
            <div class="metric-label">Cost</div>
            <div class="metric-value">$${data.result.cost.toFixed(4)}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: Result JSON file required');
    console.log('\nUsage: node scripts/generate-reasoning-report.js <result.json>');
    process.exit(1);
  }

  const inputPath = args[0];

  try {
    // Read result data
    const resultData = JSON.parse(await fs.readFile(inputPath, 'utf8'));

    // Generate output path
    const outputDir = path.join(projectRoot, 'exports', 'reasoning-reports');
    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(outputDir, `report-${timestamp}.html`);

    // Generate report
    await generateReport(resultData, outputPath);

    console.log('✅ Report generation complete!');
    console.log(`📄 Open in browser: file://${outputPath}`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateReport };
