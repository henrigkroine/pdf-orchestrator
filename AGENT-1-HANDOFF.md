# Agent 1 → Agent 2 Handoff Summary

**Date:** 2025-11-14
**From:** Agent 1 - Systems Architect & External Integrations
**To:** Agent 2 - Generative Design & Content Engine

---

## ✅ Agent 1 Deliverables Complete

### 1. Architecture Documentation
- **Created:** `services/ARCHITECTURE.md`
- **Contents:** Full service specifications, API contracts, configuration schema, integration points

### 2. Enhanced Job Config
- **Updated:** `example-jobs/tfu-aws-partnership-v2.json`
- **Added Sections:**
  - `planning` - RAG, personalization, performance recommendations
  - `generation` - Figma, image generation, font pairing, layout iteration
  - `validation` - SmolDocling (Layer 0), accessibility (Layer 5)
  - `analytics` - Performance tracking and learning

### 3. Service Specifications Defined

**Phase 1: Planning**
- `rag_content_engine.py` - Knowledge base for past partnerships
- `content_personalizer.py` - Partner-specific content adaptation
- `performance_intelligence.py` - Data-driven design recommendations

**Phase 2: Generation**
- `smoldocling_service.py` - Structural layout analysis (Layer 0)
- `figma_service.py` - Design token sync
- `image_gen_service.py` - Hero/program image generation
- `font_pairing_engine.py` - Typography validation/suggestions
- `layout_iteration_engine.py` - Multiple variant generation & scoring

**Phase 3: Validation**
- `accessibility_remediator.py` - WCAG 2.2 AA compliance (Layer 5)

**Phase 4: Analytics**
- `multilingual_generator.py` - Translation & localization (future)

---

## 🎯 Agent 2 Implementation Tasks

Your job is to implement these 10 services with proper structure, error handling, and placeholder/stub implementations where external APIs aren't available.

### Priority Order (Top to Bottom)

1. **SmolDoclingService** (Layer 0 - CRITICAL)
   - Location: `services/smoldocling_service.py`
   - API: `LayoutAnalyzer.analyze_layout(pdf_path) -> dict`
   - Integration: Called at start of validation phase (before Layer 1)
   - Stub: Return mock structural analysis if SmolDocling library unavailable

2. **FontPairingEngine** (Generation - Already Enabled)
   - Location: `services/font_pairing_engine.py`
   - API: `FontPairingEngine.suggest_font_pairing(document_context) -> dict`
   - Integration: Called during generation phase to validate TFU font choices
   - Stub: Return validation of Lora + Roboto with harmony score

3. **AccessibilityRemediator** (Layer 5 - HIGH VALUE)
   - Location: `services/accessibility_remediator.py`
   - API: `AccessibilityRemediator.remediate_pdf(pdf_path, target_standard) -> dict`
   - Integration: Called after Layer 4 (Gemini Vision)
   - Stub: Return mock compliance score, create placeholder remediated PDF

4. **RAGContentEngine** (Planning - Future)
   - Location: `services/rag_content_engine.py`
   - API: `RAGContentEngine.suggest_content(query, context) -> dict`
   - Integration: Called at start of planning phase
   - Stub: Return generic suggestions without real vector DB

5. **ContentPersonalizer** (Planning - Future)
   - Location: `services/content_personalizer.py`
   - API: `ContentPersonalizer.adapt_content(base_content, partner_profile) -> dict`
   - Integration: Works with RAG during planning
   - Stub: Load partner profile from JSON, return basic adaptations

6. **FigmaService** (Generation - Disabled by Default)
   - Location: `services/figma_service.py`
   - API: `FigmaService.fetch_design_tokens(file_id) -> dict`
   - Integration: Called before InDesign generation if enabled
   - Stub: Return TFU design tokens from static config

7. **ImageGenService** (Generation - Disabled by Default)
   - Location: `services/image_gen_service.py`
   - API: `ImageGenService.ensure_hero_images(job_config, layout_roles) -> dict`
   - Integration: Called before InDesign generation if enabled
   - Stub: Return paths to existing placeholder images

8. **LayoutIterationEngine** (Generation - Disabled by Default)
   - Location: `services/layout_iteration_engine.py`
   - API: `LayoutIterationEngine.generate_and_score_variations(content, num_variations) -> dict`
   - Integration: Optional manual tool for exploring variations
   - Stub: Generate 1 variation only (current PDF), score via existing pipeline

9. **PerformanceIntelligence** (Analytics - Enabled for Tracking)
   - Location: `services/performance_intelligence.py`
   - API: `PerformanceIntelligence.track_document_performance(pdf_id, partner_id, outcome)`
   - Integration: Async after PDF delivery, recommendations before planning
   - Stub: Log to JSON file, return generic recommendations

10. **MultilingualGenerator** (Future - Disabled)
    - Location: `services/multilingual_generator.py`
    - API: `MultilingualGenerator.generate_localized_document(source_pdf, target_language) -> dict`
    - Integration: Post-processing or manual tool
    - Stub: Basic structure only, no implementation needed yet

---

## Implementation Guidelines

### File Structure
Each service should follow this pattern:

```python
# services/example_service.py

"""
Example Service - Brief Description
Part of PDF Orchestrator AI-Enhanced Architecture

See services/ARCHITECTURE.md for full specification.
"""

import os
import json
from typing import Dict, List, Optional

class ExampleService:
    """
    Main service class

    Configuration comes from job_config[section][subsection]
    """

    def __init__(self, job_config: Optional[Dict] = None):
        """
        Initialize service

        Args:
            job_config: Full job configuration dict (optional)
        """
        self.config = job_config or {}
        self.enabled = self._check_enabled()

    def _check_enabled(self) -> bool:
        """Check if service is enabled in job config"""
        try:
            return self.config.get('section', {}).get('subsection', {}).get('enabled', False)
        except:
            return False

    def main_method(self, input_param: str) -> Dict:
        """
        Main service method

        Args:
            input_param: Description

        Returns:
            {
                'result': str,
                'confidence': float,
                'status': 'success' | 'error'
            }

        Raises:
            RuntimeError: If service not enabled or configuration invalid
        """
        if not self.enabled:
            return {
                'result': 'stub_response',
                'confidence': 0.0,
                'status': 'disabled',
                'message': 'Service disabled in job config'
            }

        # Stub implementation
        return {
            'result': 'placeholder_result',
            'confidence': 0.85,
            'status': 'success'
        }

# CLI Entrypoint (optional)
if __name__ == '__main__':
    import sys
    import argparse

    parser = argparse.ArgumentParser(description='Example Service CLI')
    parser.add_argument('--input', required=True, help='Input parameter')
    parser.add_argument('--job-config', help='Path to job config JSON')

    args = parser.parse_args()

    # Load job config if provided
    job_config = {}
    if args.job_config:
        with open(args.job_config, 'r') as f:
            job_config = json.load(f)

    # Run service
    service = ExampleService(job_config)
    result = service.main_method(args.input)

    # Output JSON to stdout
    print(json.dumps(result, indent=2))
```

### Error Handling
- **If API key missing:** Return stub/mock response with status='disabled'
- **If external service fails:** Log error, fall back to stub response
- **If service disabled:** Return immediately with status='disabled'

### Logging
- Use `print()` for user-facing messages
- Use `# TODO: ...` comments for future enhancements
- Write errors to stderr

### Testing
Each service should be testable standalone:
```bash
python -m services.example_service --input "test" --job-config example-jobs/tfu-aws-partnership-v2.json
```

---

## Environment Variables Needed

Create `.env.example` in services/ with:
```bash
# Phase 1: Planning
RAG_DB_URL=postgresql://localhost/teei_rag  # Optional
OPENAI_API_KEY=sk-...  # Optional
ANTHROPIC_API_KEY=sk-ant-...  # Optional

# Phase 2: Generation
FIGMA_API_KEY=figd_...  # Optional
IMAGE_API_KEY=...  # Optional
IMAGE_API_PROVIDER=generic  # Optional

# Phase 3: Validation
AWS_ACCESS_KEY_ID=...  # Optional, for accessibility
AWS_SECRET_ACCESS_KEY=...  # Optional

# Optional APIs
COMMONLOOK_API_KEY=...
PDFFIX_API_KEY=...
```

**CRITICAL:** Never commit real API keys. All services should gracefully degrade to stubs when keys missing.

---

## Integration Points with Existing Code

**Do NOT modify these existing files yet** (Agent 3 will wire them):
- `pipeline.py` - Will add Phase 1/2 calls and Layer 0/5
- `validate_document.py` - Will consume SmolDocling output
- `execute_tfu_aws_v2.py` - Will call image generation, font pairing

**You CAN create new files:**
- `services/*.py` - All service implementations
- `services/__init__.py` - Service exports
- `data/partner-profiles.json` - Partner profile database
- `reports/layout/`, `reports/accessibility/` - Report directories

---

## Success Criteria

Agent 2 is complete when:

1. ✅ All 10 service files created in `services/`
2. ✅ Each service has proper class structure and stub implementation
3. ✅ Each service can run standalone via `python -m services.service_name`
4. ✅ SmolDocling, FontPairing, Accessibility have working stubs (priority)
5. ✅ All services return proper JSON structure matching ARCHITECTURE.md specs
6. ✅ Services gracefully handle missing API keys (return stubs)
7. ✅ Created partner profiles database (`data/partner-profiles.json`)
8. ✅ Created `.env.example` in services/

---

## Notes for Agent 2

- **Speed over perfection:** Stubs are OK. Agent 3 will wire everything together.
- **Match the specs:** Follow ARCHITECTURE.md API contracts exactly.
- **Backward compat:** Services must not break existing pipeline when disabled.
- **Feature flags:** Respect `enabled` flags in job config.
- **No secrets:** Use env vars for API keys, never hardcode.

---

**Handoff Status:** ✅ Complete
**Next Agent:** Agent 2 - Generative Design & Content Engine
**Estimated Effort:** 2-3 hours for all service stubs
