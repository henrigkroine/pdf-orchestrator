# MCP Flows - Real Integrations

Production-ready MCP flows for optional service integrations. All flows are **non-blocking** - failures gracefully degrade without stopping the pipeline.

---

## Available Flows

### 1. DALL-E Image Generator (`dalle-image-generator.js`)

**Purpose**: Generate AI images for designated slots in PDF documents using OpenAI's DALL-E API.

**When to use**:
- Need professional images for covers, heroes, or program sections
- Want consistent visual style across document
- Don't have photography assets available

**Requirements**:
- `OPENAI_API_KEY` environment variable
- DALL-E MCP server configured in job config
- `mcpFeatures.useAiImages: true` in job config

**Configuration**:

```json
{
  "mcpFeatures": {
    "useAiImages": true
  },
  "data": {
    "aiImageSlots": {
      "cover": "Professional photo of diverse students collaborating in bright classroom, warm natural lighting, hopeful atmosphere",
      "hero": "Ukrainian refugee students using laptops for online learning, supportive environment, natural light",
      "program_1": "Teacher helping student with coding project, diverse classroom, bright and engaging"
    }
  }
}
```

**Environment Variables**:
```bash
OPENAI_API_KEY=sk-...   # Required - OpenAI API key
```

**Output**:
- Generated images saved to: `assets/ai/{jobId}/{slotName}.png`
- Image metadata included in flow result (paths, URLs, prompts)
- Supports both URL and base64 responses from DALL-E API

**Error Handling**:
- Missing API key → Skips flow with clear message
- Individual slot failures → Continues with other slots
- All slots fail → Returns error status but doesn't crash pipeline
- Detailed error messages for troubleshooting

**Example Usage**:
```javascript
const { runDalleFlow } = require('./mcp-flows/dalle-image-generator');

const result = await runDalleFlow(jobContext, mcpManager);
// result.status: 'success' | 'skipped' | 'error'
// result.data.generatedImages: { cover: {...}, hero: {...} }
// result.data.slotsSucceeded: 2
```

---

### 2. Figma Design Extractor (`figma-design-extractor.js`)

**Purpose**: Extract design tokens (colors, typography, spacing) from Figma files and convert to InDesign-compatible formats.

**When to use**:
- Validate document colors match Figma brand system
- Extract typography scale from design system
- Ensure spacing consistency with design tokens
- Auto-sync brand updates from Figma

**Requirements**:
- `FIGMA_ACCESS_TOKEN` environment variable
- Figma MCP server configured in job config
- `mcpFeatures.useFigmaBrandCheck: true` in job config

**Configuration**:

```json
{
  "mcpFeatures": {
    "useFigmaBrandCheck": true
  },
  "figma": {
    "fileId": "TEEI-Brand-System"
  }
}
```

**Environment Variables**:
```bash
FIGMA_ACCESS_TOKEN=figd_...   # Required - Figma personal access token
FIGMA_FILE_ID=abc123          # Optional - defaults to 'TEEI-Brand-System'
```

**Output**:
- **Raw Figma tokens**: `reports/brand/{jobId}-figma-tokens.json`
- **InDesign-compatible tokens**: `reports/brand/{jobId}-indesign-tokens.json`
- Brand validation results (color matching against TEEI guidelines)

**InDesign Token Format**:
```json
{
  "colorSwatches": [
    {
      "name": "Nordshore",
      "colorSpace": "RGB",
      "colorValues": [0, 0.22, 0.25],
      "cmykValues": [1, 0, 0.37, 0.75],
      "hexValue": "#00393F"
    }
  ],
  "characterStyles": [
    {
      "name": "Headline",
      "fontFamily": "Lora",
      "fontStyle": "Bold",
      "fontSize": 42,
      "lineHeight": 1.2
    }
  ],
  "spacingScale": [
    {
      "name": "section",
      "value": 60,
      "unit": "pt"
    }
  ]
}
```

**Brand Validation**:
- Checks if primary color matches TEEI requirements
- Validates presence of official TEEI colors (Nordshore, Sky, Sand, etc.)
- Reports mismatches with severity levels (high/medium/low)
- Lists all matches found in Figma file

**Error Handling**:
- Missing access token → Skips flow with clear message
- Figma API errors → Returns error status with details
- Missing file ID → Uses default 'TEEI-Brand-System'
- Invalid token format → Graceful fallback with warnings

**Example Usage**:
```javascript
const { runFigmaFlow } = require('./mcp-flows/figma-design-extractor');

const result = await runFigmaFlow(jobContext, mcpManager);
// result.status: 'success' | 'skipped' | 'error'
// result.data.colors: 7 (TEEI official colors)
// result.data.brandValidation.passed: true
// result.data.indesignTokensPath: 'reports/brand/...'
```

---

## Common Features (All Flows)

### Non-Blocking Design

All flows follow this pattern:

1. **Check if enabled** → Return `skipped` if not
2. **Check if configured** → Return `skipped` if server missing
3. **Check credentials** → Return `skipped` if missing
4. **Execute with error handling** → Return `error` if fails
5. **Continue pipeline** → Never throw exceptions

This ensures the pipeline continues even if optional integrations fail.

### Status Codes

Every flow returns:
```javascript
{
  status: 'success' | 'skipped' | 'error',
  reason: '...',           // Why skipped/failed
  message: '...',          // Human-readable explanation
  data: {...},             // Success data (if status=success)
  error: '...',            // Error message (if status=error)
  duration_seconds: 2.45   // Execution time
}
```

### Logging Standards

All flows use consistent logging:
```
[MCP Flow] FlowName - RUNNING...
[MCP Flow] FlowName - Details about what's happening
[MCP Flow] FlowName - ✅ Success message
[MCP Flow] FlowName - ❌ Error message
[MCP Flow] FlowName - SUCCESS: Summary (2.45s)
```

### Timing Metrics

All flows track execution time:
- Start time captured at flow entry
- End time captured before return
- Duration included in result object
- Logged in summary line

---

## Integration with Orchestrator

Flows are called from `orchestrator.js` during the MCP Manager workflow:

```javascript
// 1. Generate AI images (BEFORE InDesign export)
if (job.mcpFeatures?.useAiImages) {
  const dalleResult = await runDalleFlow(job, this.mcpManager);
  if (dalleResult.status === 'success') {
    job.generatedImages = dalleResult.data.generatedImages;
  }
}

// 2. Run Figma brand check (AFTER InDesign export, BEFORE QA)
if (job.mcpFeatures?.useFigmaBrandCheck) {
  const figmaResult = await runFigmaFlow(job, this.mcpManager);
  // Results logged, no blocking behavior
}
```

---

## Testing Flows

### Quick Syntax Check

```bash
# Test DALL-E flow syntax
node -c mcp-flows/dalle-image-generator.js

# Test Figma flow syntax
node -c mcp-flows/figma-design-extractor.js
```

### Test with Mock Data

```javascript
// Test DALL-E flow
const { runDalleFlow } = require('./mcp-flows/dalle-image-generator');

const mockJob = {
  jobId: 'test-job-001',
  mcpFeatures: { useAiImages: true },
  data: {
    aiImageSlots: {
      test: 'A beautiful landscape with mountains'
    }
  }
};

const mockManager = {
  getServerStatus: () => ({ status: 'connected' }),
  invoke: async () => ({
    status: 'success',
    data: { url: 'https://example.com/image.png' }
  })
};

const result = await runDalleFlow(mockJob, mockManager);
console.log('Result:', result);
```

### Test with Real Job

```bash
# Run full pipeline with DALL-E enabled
OPENAI_API_KEY=sk-... node orchestrator.js example-jobs/aws-tfu-mcp-world-class.json
```

---

## Troubleshooting

### DALL-E Flow Issues

**Problem**: "DALL-E - Missing OPENAI_API_KEY, skipping"
**Solution**: Set environment variable before running:
```bash
export OPENAI_API_KEY=sk-...
node orchestrator.js job.json
```

**Problem**: "Generation failed: Rate limit exceeded"
**Solution**:
- Wait 60 seconds and retry
- Reduce number of image slots
- Upgrade OpenAI plan for higher limits

**Problem**: Images not appearing in InDesign
**Solution**:
- Check that images saved to `assets/ai/{jobId}/` directory
- Verify InDesign template references correct image paths
- Ensure image format is supported (PNG works best)

### Figma Flow Issues

**Problem**: "Figma - Missing FIGMA_ACCESS_TOKEN, skipping"
**Solution**: Generate token at https://www.figma.com/developers/api#access-tokens
```bash
export FIGMA_ACCESS_TOKEN=figd_...
node orchestrator.js job.json
```

**Problem**: "File not found: TEEI-Brand-System"
**Solution**: Set correct file ID in environment or job config:
```json
{
  "figma": {
    "fileId": "your-figma-file-id"
  }
}
```

**Problem**: "Primary color mismatch"
**Solution**:
- Verify Figma file has color named "Primary" or "Nordshore"
- Check that color matches TEEI guidelines (#00393F)
- Update Figma design system if needed

---

## Adding New Flows

To add a new MCP flow:

1. **Create new file**: `mcp-flows/your-flow-name.js`

2. **Follow template**:
```javascript
async function runYourFlow(jobContext, mcpManager) {
  const startTime = Date.now();

  // Check enabled
  if (!jobContext.mcpFeatures?.useYourFeature) {
    return { status: 'skipped', reason: 'not_enabled' };
  }

  // Check configured
  const serverStatus = mcpManager.getServerStatus('your-server');
  if (serverStatus.status === 'not_found') {
    return { status: 'skipped', reason: 'not_configured' };
  }

  // Check credentials
  if (!process.env.YOUR_API_KEY) {
    return { status: 'skipped', reason: 'missing_credentials' };
  }

  try {
    console.log('[MCP Flow] YourFlow - RUNNING...');

    // Your implementation here
    const result = await mcpManager.invoke('your-server', 'your-action', {
      // params
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`[MCP Flow] YourFlow - SUCCESS (${duration}s)`);
    return {
      status: 'success',
      data: result.data,
      duration_seconds: parseFloat(duration)
    };

  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`[MCP Flow] YourFlow - ERROR: ${error.message}`);
    return {
      status: 'error',
      error: error.message,
      duration_seconds: parseFloat(duration)
    };
  }
}

module.exports = { runYourFlow };
```

3. **Add to orchestrator** (if needed)

4. **Update this README** with new flow documentation

---

## Best Practices

1. **Always non-blocking**: Use try-catch, return status objects, never throw
2. **Check everything**: Enabled → Configured → Credentials → Execute
3. **Log consistently**: Use `[MCP Flow] FlowName -` prefix
4. **Include timing**: Track duration for all operations
5. **Graceful degradation**: Return useful info even on skip/error
6. **Test without keys**: Verify skip logic works correctly
7. **Document outputs**: Specify exactly what files are created where
8. **Validate results**: Check if data matches expected format
9. **Clean up on error**: Remove partial files if operation fails
10. **Report metrics**: Include counts, durations, success rates

---

## Related Documentation

- **MCP Integration Guide**: `README-MCP-INTEGRATION.md`
- **MCP Quick Start**: `MCP-QUICK-START.md`
- **Job Config Examples**: `example-jobs/aws-tfu-mcp-world-class.json`
- **Phase 6 Implementation Plan**: `MCP-INTEGRATION-PHASE-6-SOPHISTICATION-PLAN.md`

---

**Status**: ✅ Production-ready
**Last Updated**: 2025-11-13
**Flows Implemented**: 2 (DALL-E, Figma)
**Flows Planned**: 4 (GitHub, Slack, Notion, MongoDB)
