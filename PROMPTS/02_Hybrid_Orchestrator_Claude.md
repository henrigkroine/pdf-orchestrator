# Claude Code Orchestration Brief — Path 5 Hybrid local render then InDesign polish

## Purpose
Build page mocks locally for speed, then let InDesign apply master pages, styles, and export the press-ready PDF. Use this for fast iteration on flagship documents.

## Inputs

- Same inputs as Path 4 plus optional local HTML or SVG mocks for charts and infographics
- Brand tokens JSON reused across HTML, SVG, and InDesign styles

## High-level plan

1. Generate images with `gpt-image-1`
2. Assemble page mocks locally as HTML or SVG with brand tokens
3. Place assets into the InDesign template via MCP
4. Export press-ready PDF and run the same PDF Services QA
5. Save to R2 and log to MindStack

## Concrete steps for the orchestrator

### 1. Collect content and produce a section plan with per-page asset list

### 2. Generate images and charts

- `gpt-image-1` for photos and illustrations
- Charts as SVG or high-resolution PNG
- Store and mirror to R2 with manifests

### 3. Build page mocks

- Render HTML to images or keep SVGs vector-based for placement
- Name assets per section with stable slugs

### 4. InDesign placement and export

- Place each asset into the predefined frames by frame ID or layer name
- Apply master pages, page numbers, TOC, and paragraph styles
- Export press-ready PDF or PDF/X

### 5. Post-process and QA

- Same Auto-Tag and Extract steps as Path 4

### 6. Logging

- Same logging requirements as Path 4

## Success criteria

- Export meets print preset
- All master elements present
- Visual deltas under threshold
- Accessibility tags and reading order validated

## Failure policy

- One automatic fix loop, then flag
