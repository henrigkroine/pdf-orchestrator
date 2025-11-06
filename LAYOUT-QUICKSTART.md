# Layout & Storytelling Quick Start

Get started with AI-powered layout optimization and visual storytelling in 5 minutes.

## Installation

Already installed! All dependencies are included in the pdf-orchestrator project.

## Test Drive (30 seconds)

```bash
# Optimize example document layout
node scripts/optimize-layout.js docs/examples/example-document.json --report

# Create narrative flow with storyboard
node scripts/create-narrative-flow.js docs/examples/example-document.json --storyboard --report
```

**Expected Output:**
- Optimized layout with metrics (balance, harmony, hierarchy)
- Detailed reports in `exports/layouts/` and `exports/narratives/`
- Visual storyboard HTML file (open in browser)

## Basic Usage

### 1. Optimize Layout

```bash
# Default (Swiss 12-column grid, Z-pattern eye flow)
node scripts/optimize-layout.js your-document.json

# Golden ratio grid
node scripts/optimize-layout.js your-document.json --grid golden

# Custom eye flow pattern
node scripts/optimize-layout.js your-document.json --pattern f

# Generate detailed report + InDesign export
node scripts/optimize-layout.js your-document.json --report --export-indesign
```

### 2. Create Narrative Flow

```bash
# Default (auto-detect story arc)
node scripts/create-narrative-flow.js your-document.json

# Specific journey (persuasion, transformation, educational)
node scripts/create-narrative-flow.js your-document.json --journey persuasion

# Control pacing (fast, moderate, slow, varied)
node scripts/create-narrative-flow.js your-document.json --pacing moderate

# Generate visual storyboard
node scripts/create-narrative-flow.js your-document.json --storyboard --report
```

## Document Format

Your input document should be JSON:

```json
{
  "blocks": [
    {
      "type": "text",
      "content": "Your headline",
      "fontSize": 42,
      "hierarchyLevel": 1,
      "emphasis": "high"
    },
    {
      "type": "image",
      "content": "Description",
      "width": 500,
      "height": 300,
      "image": true
    }
  ]
}
```

**Block Types:**
- `text` - Text content
- `image` - Images
- `callout` - Highlighted boxes
- `cta` - Call to action

**Hierarchy Levels:**
- `1` - Most important (headlines)
- `2` - Section headers
- `3` - Body text
- `4+` - Captions, footnotes

## What You Get

### Layout Optimization

✅ **Grid System**: Swiss 12-column, golden ratio, modular, or custom
✅ **Golden Ratio**: Perfect proportions (φ = 1.618)
✅ **Alignment**: Pixel-perfect + optical adjustment
✅ **Eye Flow**: Z-pattern, F-pattern, or Gutenberg
✅ **AI Refinement**: Claude Opus 4 critique and suggestions

**Metrics:**
- Balance (visual weight distribution): X/10
- Harmony (golden ratio usage): X/10
- Hierarchy (clear importance): X/10
- Whitespace (breathing room): X/10
- Alignment (grid adherence): X/10

### Visual Storytelling

✅ **Story Arcs**: Classic, Hero's Journey, Problem-Solution, etc.
✅ **Emotional Mapping**: 8 core emotions with visual treatments
✅ **Pacing**: Fast, moderate, slow, or varied rhythm
✅ **Transitions**: Smooth emotional progressions
✅ **Storyboard**: Visual HTML preview

**Metrics:**
- Emotional Resonance: X/10
- Engagement Score: X/10
- Reading Time: X minutes
- Emotional Range: X emotions

## Common Workflows

### TEEI Partnership Proposal

```bash
# Step 1: Optimize layout with Swiss grid
node scripts/optimize-layout.js teei-aws.json \
  --grid swiss12 \
  --pattern z \
  --report \
  --export-indesign

# Step 2: Create persuasive narrative
node scripts/create-narrative-flow.js teei-aws.json \
  --journey persuasion \
  --pacing moderate \
  --storyboard \
  --report
```

**Result**: Professional layout + persuasive emotional journey

### Educational White Paper

```bash
# Layout with F-pattern (text-heavy)
node scripts/optimize-layout.js whitepaper.json \
  --grid manuscript \
  --pattern f

# Educational narrative
node scripts/create-narrative-flow.js whitepaper.json \
  --journey educational \
  --pacing slow
```

### Case Study / Impact Report

```bash
# Golden ratio layout
node scripts/optimize-layout.js case-study.json \
  --grid golden

# Transformation journey
node scripts/create-narrative-flow.js case-study.json \
  --journey transformation \
  --pacing varied
```

## Configuration

Edit settings in:
- `config/layout-config.json` - Grid systems, golden ratio, TEEI brand
- `config/narrative-config.json` - Story arcs, emotions, pacing

## Outputs

**Layout Optimization:**
- `exports/layouts/[name]-optimized-[date].json` - Optimized layout
- `exports/layouts/[name]-indesign-[date].json` - InDesign format
- `exports/layouts/layout-report-[timestamp].json` - Full report
- `exports/layouts/layout-report-[timestamp].txt` - Text report

**Narrative Flow:**
- `exports/narratives/[name]-narrative-[date].json` - Narrative flow
- `exports/narratives/narrative-report-[timestamp].json` - Full report
- `exports/narratives/narrative-report-[timestamp].txt` - Text report
- `exports/narratives/storyboard-[timestamp].html` - Visual storyboard

## Troubleshooting

**Problem**: Low balance score (< 7/10)
**Solution**: Visual weight is uneven. Move heavy elements (images, dark colors) to balance quadrants.

**Problem**: Poor eye flow (< 60%)
**Solution**: Important elements in wrong zones. Use `--pattern z` and place CTAs bottom-right.

**Problem**: Low resonance (< 6/10)
**Solution**: Emotional journey too flat. Use `--journey` to set clear emotional arc.

**Problem**: Engagement score low (< 5/10)
**Solution**: Content too dense or monotonous. Use `--pacing varied` and add images.

## Quick Reference

### Grid Systems
- `swiss12` - 12-column (most versatile) ⭐
- `swiss6` - 6-column (simpler)
- `golden` - Golden ratio proportions
- `modular` - Rows + columns
- `manuscript` - Single column (text-heavy)

### Eye Flow Patterns
- `z` - Z-pattern (image-heavy) ⭐
- `f` - F-pattern (text-heavy)
- `gutenberg` - Print layouts
- `auto` - Auto-detect

### Story Arcs
- `classic` - 5-act structure (general)
- `problemSolution` - Problem → Solution → CTA (persuasion) ⭐
- `hero` - Hero's journey (transformation)
- `transformation` - Before → After
- `educational` - Teaching arc

### Pacing Strategies
- `fast` - High density, minimal breaks
- `moderate` - Balanced (recommended) ⭐
- `slow` - Spacious, image-rich
- `varied` - Alternating (long docs)

### Emotional Journeys
- `persuasion` - Concern → Hope → Trust → Empowerment ⭐
- `transformation` - Calm → Challenge → Hope → Joy
- `educational` - Calm → Trust → Excitement → Empowerment

## Next Steps

1. **Read Full Guide**: `docs/LAYOUT-STORYTELLING-GUIDE.md` (comprehensive)
2. **Check Examples**: `docs/examples/example-document.json`
3. **Review Configs**: `config/layout-config.json`, `config/narrative-config.json`
4. **Test with Your Content**: Create JSON from your document
5. **Integrate**: Use as part of PDF generation pipeline

## Support

- **Documentation**: `docs/LAYOUT-STORYTELLING-GUIDE.md`
- **TEEI Guidelines**: `reports/TEEI_AWS_Design_Fix_Report.md`
- **Project Instructions**: `CLAUDE.md`

---

**Quick Commands:**

```bash
# Test everything
node scripts/optimize-layout.js docs/examples/example-document.json --report --export-indesign
node scripts/create-narrative-flow.js docs/examples/example-document.json --storyboard --report

# TEEI AWS optimal
node scripts/optimize-layout.js your-doc.json --grid swiss12 --pattern z --report
node scripts/create-narrative-flow.js your-doc.json --journey persuasion --pacing moderate --storyboard

# View results
open exports/layouts/  # Layout reports
open exports/narratives/storyboard-*.html  # Visual storyboard
```

**Ready to create award-winning layouts!** 🎨✨
