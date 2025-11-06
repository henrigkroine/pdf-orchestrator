# QA and gate checklist for world-class PDFs

## Purpose
Single source of truth for automated checks that must pass before any PDF leaves the pipeline.

## Gates

### Accessibility and structure

- Adobe PDF Services Auto-Tag completes without critical errors
- Extract analysis confirms headings H1 to H3, proper list semantics, table detection, and reading order
- Checklist items recorded in QA summary with pass/fail

### Brand and typography

- Fonts embedded: Lora and Roboto Flex only
- Paragraph and object styles used match brand tokens by name
- No text cutoffs at 100%, 150%, 200% zoom

### Color and images

- Primary colors match hex values in brand tokens
- Images at required resolution for print or digital
- No copper or off-palette tones appear on primary elements

### Layout and grid

- Margins and gutters match the template
- Baseline grid adherence within tolerance
- No overlapping elements outside allowed overlays

### Export and preflight

- Export preset is press-ready or PDF/X as required
- Bleed and slug where applicable
- File size and compression within expected range

## Failure handling

- The orchestrator applies the smallest change that resolves the failing gate
- If the second pass still fails, the job is flagged and a concise red status is emitted with the failing gate names and suggested manual fixes

## Outputs

- `reports\QA\{slug}.md`
- Logs of API responses for Auto-Tag and Extract
- A final pass/fail status for the orchestrator
