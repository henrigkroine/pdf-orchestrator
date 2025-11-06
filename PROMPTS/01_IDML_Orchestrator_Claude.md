# Claude Code Orchestration Brief — Path 4 IDML handoff

## Purpose
Build press-ready PDFs by generating images, authoring an IDML that matches the InDesign template, exporting locally via MCP, and validating with Adobe PDF Services. Use this for world-class output that must be print-ready.

## Inputs

- **Source content**: Obsidian notes and Airtable records
- **Brand tokens JSON**: colors, fonts, spacing, paragraph and object style names
- **Template registry**: `templates\template-registry.json` with templateId to `.indd` path mapping
- **Env vars available**: `OPENAI_API_KEY`, `PDF_CLIENT_ID`, `PDF_CLIENT_SECRET`, `PDF_BASE_URL`, `ADOBE_ORGANIZATION_ID`, R2 credentials

## High-level plan

1. Gather content and brand tokens
2. Generate required images with OpenAI `gpt-image-1`
3. Build IDML that references exact style names used in the InDesign template
4. Open IDML in InDesign via MCP and export a press-ready PDF
5. Run PDF Services Auto-Tag and Extract for accessibility and structure QA
6. Save assets and outputs to Cloudflare R2 and write a MindStack job log

## Concrete steps for the orchestrator

### 1. Collect content

- Read the job JSON and load the mapped template from `templates\template-registry.json`
- Resolve content blocks, image needs, and figure captions

### 2. Create and store images

- Use `gpt-image-1` for hero, section art, icons
- Store each asset at `T:\Projects\{ORG}\Assets\AI\{YYYY}-{MM}\` with a manifest entry containing prompt, seed, size, sha256
- Mirror assets to R2 under `r2://{ORG}/assets/ai/{YYYY}/{MM}/`

### 3. Build IDML package

- Pages, text frames, and image frames must match the template style names exactly
- All paragraph and object styles must reference brand tokens
- Link placed image frames to the asset paths created in step 2
- Include document metadata: title, subject, keywords, author, target ICC intent

### 4. InDesign export via MCP

- Open IDML with `adobe-indesign` MCP
- Apply paragraph styles and object styles by name
- Export press-ready PDF or PDF/X using the template preset with bleed and correct ICC
- Save the PDF to `T:\Projects\{ORG}\Output\{YYYY}-{MM}\{slug}.pdf` and to `r2://{ORG}/pdf/{YYYY}/{MM}/`

### 5. Post-process and QA

- Call Adobe PDF Services Auto-Tag for accessibility
- Call Adobe PDF Services Extract to verify reading order, headings, lists, and tables
- Produce a one-page QA summary as markdown and save under `reports\QA\{slug}.md`

### 6. Logging

- Create a MindStack record with input job hash, model versions, image manifest, PDF path, Auto-Tag result, Extract summary, and any deltas

## Success criteria

- Press profile or PDF/X preset applied
- All brand fonts present and embedded
- All color values match brand tokens
- Accessibility tags present and logical reading order passes checks
- Visual gate deltas within threshold defined in QA prompts

## Failure policy

- Perform one automatic fix pass if gates fail
- If still failing, emit a concise red status with failing gate names and suggested fixes

## Output paths

- **Local**: `T:\Projects\{ORG}\Output\{YYYY}-{MM}\`
- **Cloud**: `r2://{ORG}/pdf/{YYYY}/{MM}/`
- **Logs**: `T:\Projects\pdf-orchestrator\logs`
- **QA**: `T:\Projects\pdf-orchestrator\reports\QA\`

## Model requirements

- **Image generation**: OpenAI `gpt-image-1`
- **Vision QA**: Gemini Vision or GPT-5 Vision
- **No Firefly API required**
