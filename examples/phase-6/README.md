# Phase 6 Examples

Complete examples demonstrating all Phase 6 features.

## Contents

1. `example-qa-profile.json` - QA profile configuration
2. `example-mcp-flows.json` - Multi-server MCP workflow
3. `example-approval.json` - Human-in-the-loop approval
4. `example-experiment.json` - A/B testing variants

## Quick Start

```bash
# Run QA profile example
node orchestrator.js examples/phase-6/example-qa-profile.json

# Run MCP flows example (requires env vars)
export FIGMA_ACCESS_TOKEN=your_token
export OPENAI_API_KEY=your_key
node orchestrator.js examples/phase-6/example-mcp-flows.json

# Run approval example
export SLACK_WEBHOOK_URL=your_webhook
node orchestrator.js examples/phase-6/example-approval.json

# Run experiment example
node orchestrator.js examples/phase-6/example-experiment.json
```

## Documentation

- [Phase 6 Guide](../../docs/PHASE-6-GUIDE.md)
- [QA Profile Guide](../../docs/QAPROFILE-GUIDE.md)
- [MCP Flows Guide](../../docs/MCP-FLOWS-GUIDE.md)
- [Experiment Mode Guide](../../docs/EXPERIMENT-MODE-GUIDE.md)
