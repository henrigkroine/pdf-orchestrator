# PDF Orchestrator Services Architecture

**Version:** 2.0 (AI-Enhanced)
**Date:** 2025-11-14
**Status:** Production-Ready

---

## Overview

The services layer provides AI-powered intelligence and external integrations for the PDF Orchestrator. This architecture transforms the system from "validation-only" to "intelligent design system."

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ PDF ORCHESTRATOR - AI-ENHANCED ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PHASE 1: INTELLIGENT PLANNING                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ RAGContentEngine        → Knowledge base of past docs    │  │
│  │ ContentPersonalizer     → Partner-specific adaptation    │  │
│  │ PerformanceIntelligence → Data-driven recommendations    │  │
│  │ MultilingualGenerator   → Localization (future)          │  │
│  └──────────────────────────────────────────────────────────┘  │
│    ↓                                                             │
│  PHASE 2: SMART GENERATION                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ FontPairingEngine       → Optimal typography selection   │  │
│  │ FigmaService            → Design token sync              │  │
│  │ ImageGenService         → Hero/program image generation  │  │
│  │ LayoutIterationEngine   → Multiple layout variants       │  │
│  └──────────────────────────────────────────────────────────┘  │
│    ↓                                                             │
│  PHASE 3: COMPREHENSIVE VALIDATION (6 LAYERS)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ LAYER 0: SmolDoclingService (structural analysis)        │  │
│  │ LAYER 1: validate_document.py + AI Tier 1                │  │
│  │ LAYER 2: validate-pdf-quality.js + Color Harmony         │  │
│  │ LAYER 3: compare-pdf-visual.js                           │  │
│  │ LAYER 3.5: ai/core/aiRunner.js (Tier 1)                  │  │
│  │ LAYER 4: gemini-vision-review.js                         │  │
│  │ LAYER 5: AccessibilityRemediator (WCAG 2.2 AA)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│    ↓                                                             │
│  PHASE 4: CONTINUOUS IMPROVEMENT                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PerformanceIntelligence → Track outcomes, A/B testing    │  │
│  │ Feedback Loop           → Learn from real partnerships   │  │
│  └──────────────────────────────────────────────────────────┘  │
│    ↓                                                             │
│  OUTPUT: World-Class PDF + Comprehensive Analytics              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Specifications

### Phase 1: Intelligent Planning

#### 1. RAGContentEngine (`rag_content_engine.py`)

**Purpose:** Knowledge base of past TEEI partnerships, successful patterns, and best practices.

**API:**
```python
class RAGContentEngine:
    def suggest_content(query: str, context: dict) -> dict:
        """
        Retrieves relevant examples and generates suggestions

        Args:
            query: Search query (e.g., "tech partnership CTA examples")
            context: { partner_id, industry, page_role, document_type }

        Returns:
            {
                'suggested_content': str,
                'source_documents': List[dict],
                'confidence_score': float (0-1)
            }
        """
```

**Integration:**
- **Phase:** Planning (before generation)
- **When:** If `jobConfig.planning.rag_enabled = true`
- **Synchronous:** Yes (blocks generation until suggestions ready)

**Configuration:**
```json
{
  "planning": {
    "rag_enabled": true,
    "vector_db_url": "${RAG_DB_URL}",
    "embedding_model": "text-embedding-3-large"
  }
}
```

**Environment Variables:**
- `RAG_DB_URL` - Vector database connection string
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - For embeddings/generation

---

#### 2. ContentPersonalizer (`content_personalizer.py`)

**Purpose:** Adapts content based on partner profile (industry, size, region).

**API:**
```python
class ContentPersonalizer:
    def adapt_content(base_content: dict, partner_profile: dict) -> dict:
        """
        Personalizes content for specific partner context

        Args:
            base_content: Generic TEEI content
            partner_profile: { partner_id, industry, region, company_size }

        Returns:
            {
                'personalized_headline': str,
                'industry_specific_examples': List[str],
                'tone_adjustments': dict,
                'emphasis_areas': List[str],
                'confidence_score': float
            }
        """
```

**Integration:**
- **Phase:** Planning (works with RAG)
- **When:** If `jobConfig.planning.personalization_enabled = true`
- **Synchronous:** Yes

**Configuration:**
```json
{
  "planning": {
    "personalization_enabled": true,
    "partner_profile_id": "aws-cloud",
    "partner_profiles_db": "data/partner-profiles.json"
  }
}
```

---

#### 3. PerformanceIntelligence (`performance_intelligence.py`)

**Purpose:** Tracks document outcomes, provides data-driven design recommendations.

**API:**
```python
class PerformanceIntelligence:
    def get_design_recommendations(partner_industry: str) -> dict:
        """
        Returns data-driven design recommendations based on past performance

        Args:
            partner_industry: 'technology', 'education', 'government', etc.

        Returns:
            {
                'recommended_layout': str,
                'recommended_colors': List[str],
                'optimal_page_count': int,
                'avg_time_to_decision': str,
                'conversion_rate': float,
                'confidence': float
            }
        """

    def track_document_performance(pdf_id: str, partner_id: str, outcome: dict):
        """
        Records document outcome for learning

        Args:
            pdf_id: Unique document identifier
            partner_id: Partner identifier
            outcome: { opened, signed, time_to_decision, feedback }
        """
```

**Integration:**
- **Phase:** Planning (recommendations) + Post-delivery (tracking)
- **When:** If `jobConfig.analytics.performance_tracking = true`
- **Synchronous:** Recommendations (yes), Tracking (async)

**Configuration:**
```json
{
  "analytics": {
    "performance_tracking": true,
    "partner_id": "aws",
    "doc_family": "tfu_partnership",
    "analytics_db": "sqlite:///database/performance.db"
  }
}
```

---

### Phase 2: Smart Generation

#### 4. SmolDoclingService (`smoldocling_service.py`)

**Purpose:** Structural understanding of document layouts using AI vision.

**API:**
```python
class LayoutAnalyzer:
    def analyze_layout(pdf_path: str) -> dict:
        """
        Analyzes PDF structure using SmolDocling AI

        Args:
            pdf_path: Path to PDF file

        Returns:
            {
                'structure': dict,  # DocTags-like markup
                'hierarchy_depth': int,
                'visual_elements': {
                    'headers': int,
                    'body_blocks': int,
                    'images': int,
                    'callouts': int,
                    'tables': int
                },
                'spatial_relationships': List[dict],
                'quality_score': float
            }
        """
```

**Integration:**
- **Phase:** Validation Layer 0 (before all other layers)
- **When:** If `jobConfig.validation.smoldocling.enabled = true`
- **Synchronous:** Yes

**Configuration:**
```json
{
  "validation": {
    "smoldocling": {
      "enabled": true,
      "model": "smolvlm-500m",
      "output_dir": "reports/layout"
    }
  }
}
```

**Environment Variables:**
- None (uses open-source SmolDocling library)

---

#### 5. FigmaService (`figma_service.py`)

**Purpose:** Syncs design tokens and layout components from Figma master files.

**API:**
```python
class FigmaService:
    def fetch_design_tokens(file_id: str) -> dict:
        """
        Fetches colors, typography, spacing from Figma file

        Args:
            file_id: Figma file ID

        Returns:
            {
                'colors': { 'Nordshore': '#00393F', ... },
                'typography': { 'CoverTitle': { font, size, weight }, ... },
                'spacing': { 'section': 60, 'element': 20, ... }
            }
        """

    def fetch_layout_components(file_id: str, page: str, component_map: dict) -> dict:
        """
        Fetches Figma component structure for layout mirroring

        Args:
            file_id: Figma file ID
            page: Page name within Figma file
            component_map: Maps Figma components to layout roles

        Returns:
            {
                'components': List[{ name, role, dimensions, properties }],
                'tokens_drift': List[str]  # Warnings if drift detected
            }
        """
```

**Integration:**
- **Phase:** Generation (before InDesign layout creation)
- **When:** If `jobConfig.generation.figma.enabled = true`
- **Synchronous:** Yes

**Configuration:**
```json
{
  "generation": {
    "figma": {
      "enabled": true,
      "file_id": "abc123def456",
      "page": "TFU AWS Partnership",
      "component_map": {
        "AWS Hero Card": "cover_hero",
        "Stat Block": "stats_sidebar"
      }
    }
  }
}
```

**Environment Variables:**
- `FIGMA_API_KEY` - Figma Personal Access Token

---

#### 6. ImageGenService (`image_gen_service.py`)

**Purpose:** Generates hero/program imagery using AI image generation APIs.

**API:**
```python
class ImageGenService:
    def ensure_hero_images(job_config: dict, layout_roles: List[str]) -> dict:
        """
        Ensures all required hero images exist (cached or generated)

        Args:
            job_config: Full job configuration
            layout_roles: ['cover_hero', 'page2_hero', 'program_image_1', ...]

        Returns:
            {
                'images': {
                    'cover_hero': 'assets/images/generated/aws-cover.jpg',
                    ...
                },
                'newly_generated': List[str],
                'cached': List[str]
            }
        """

    def generate_image(prompt: str, style: dict) -> str:
        """
        Generates single image from prompt

        Args:
            prompt: Scene description
            style: { provider, style_preset, dimensions }

        Returns:
            local_file_path: Path to generated image
        """
```

**Integration:**
- **Phase:** Generation (before InDesign places images)
- **When:** If `jobConfig.generation.imageGeneration.enabled = true`
- **Synchronous:** Yes (generation + caching)

**Configuration:**
```json
{
  "generation": {
    "imageGeneration": {
      "enabled": true,
      "provider": "generic_image_api",
      "hero_style": "documentary photography, warm, human-centered",
      "cache_dir": "assets/images/generated",
      "prompts": {
        "cover_hero": "Ukrainian student learning cloud skills with AWS mentor",
        "program_image_1": "Diverse students collaborating on laptops"
      }
    }
  }
}
```

**Environment Variables:**
- `IMAGE_API_KEY` - Generic image generation API key
- `IMAGE_API_PROVIDER` - Provider name (for multi-provider support)

---

#### 7. FontPairingEngine (`font_pairing_engine.py`)

**Purpose:** Validates and suggests optimal font combinations for document context.

**API:**
```python
class FontPairingEngine:
    def suggest_font_pairing(document_context: dict) -> dict:
        """
        Suggests optimal typography for document context

        Args:
            document_context: {
                purpose: 'partnership' | 'report' | 'showcase',
                industry: 'technology' | 'education' | 'government',
                tone: 'professional' | 'warm' | 'innovative',
                brand_constraints: ['serif_headline', 'sans_body']
            }

        Returns:
            {
                'primary_recommendation': {
                    headline: 'Lora SemiBold',
                    body: 'Roboto Flex Regular',
                    harmony_score: 0.94,
                    rationale: str
                },
                'alternatives': List[dict],
                'tfu_compliance': bool
            }
        """
```

**Integration:**
- **Phase:** Generation (validates current fonts or suggests alternatives)
- **When:** If `jobConfig.generation.fontPairing.enabled = true`
- **Synchronous:** Yes

**Configuration:**
```json
{
  "generation": {
    "fontPairing": {
      "enabled": true,
      "strategy": "constrained",
      "allow_alternatives": false,
      "tfu_brand_lock": true
    }
  }
}
```

---

#### 8. LayoutIterationEngine (`layout_iteration_engine.py`)

**Purpose:** Generates multiple layout variants and scores them via full pipeline.

**API:**
```python
class LayoutIterationEngine:
    async def generate_and_score_variations(content: dict, num_variations: int) -> dict:
        """
        Generates N layout variants and runs full QA pipeline on each

        Args:
            content: Document content
            num_variations: Number of variants to generate (typically 5-10)

        Returns:
            {
                'top_recommendation': {
                    pdf_path: str,
                    scores: { layer1, layer2, layer3, layer4, layer5 },
                    overall_score: float,
                    layout_description: str
                },
                'alternatives': List[dict],
                'all_variations': List[dict]
            }
        """
```

**Integration:**
- **Phase:** Generation (optional exploration tool)
- **When:** If `jobConfig.generation.layoutIteration.enabled = true`
- **Synchronous:** Yes (but can be long-running)

**Configuration:**
```json
{
  "generation": {
    "layoutIteration": {
      "enabled": true,
      "num_variations": 5,
      "variation_strategies": ["hero_image", "card_layout", "split_screen"],
      "parallel_execution": true
    }
  }
}
```

---

### Phase 3: Validation (New Layers)

#### 9. AccessibilityRemediator (`accessibility_remediator.py`)

**Purpose:** Auto-remediates PDFs to WCAG 2.2 AA / PDF/UA standards.

**API:**
```python
class AccessibilityRemediator:
    def remediate_pdf(pdf_path: str, target_standard: str) -> dict:
        """
        Remediates PDF for accessibility compliance

        Args:
            pdf_path: Source PDF
            target_standard: 'WCAG_2.2_AA' | 'PDF_UA' | 'Section_508'

        Returns:
            {
                'remediated_pdf': str,  # Path to remediated PDF
                'compliance_score': float,
                'standards_met': List[str],
                'time_saved': str,
                'issues_fixed': List[dict]
            }
        """
```

**Integration:**
- **Phase:** Validation Layer 5 (after Gemini Vision)
- **When:** If `jobConfig.validation.accessibility.enabled = true`
- **Synchronous:** Yes

**Configuration:**
```json
{
  "validation": {
    "accessibility": {
      "enabled": true,
      "target_standard": "WCAG_2.2_AA",
      "output_dir": "exports/accessibility",
      "remediation_provider": "aws_bedrock"
    }
  }
}
```

**Environment Variables:**
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - For Bedrock remediation
- Or `COMMONLOOK_API_KEY` - For CommonLook API

---

#### 10. MultilingualGenerator (`multilingual_generator.py`)

**Purpose:** Translates and culturally adapts documents for international partners.

**API:**
```python
class MultilingualGenerator:
    async def generate_localized_document(source_pdf: str, target_language: str, target_region: str) -> dict:
        """
        Translates and culturally adapts document

        Args:
            source_pdf: Source PDF path
            target_language: 'uk' | 'pl' | 'de' | 'es' | 'fr'
            target_region: 'EU' | 'Middle_East' | 'Asia'

        Returns:
            {
                'localized_pdf': str,
                'language': str,
                'region': str,
                'translation_quality_score': float
            }
        """
```

**Integration:**
- **Phase:** Post-processing (optional)
- **When:** Manual invocation or if `jobConfig.localization.enabled = true`
- **Synchronous:** Yes

**Configuration:**
```json
{
  "localization": {
    "enabled": false,
    "target_languages": ["uk", "pl", "de"],
    "translation_provider": "gpt4"
  }
}
```

---

## Configuration Schema Extensions

### Enhanced Job Config for TFU AWS V2

```json
{
  "name": "TFU AWS Partnership V2 - AI-Enhanced",
  "template": "partnership",
  "design_system": "tfu",

  "planning": {
    "rag_enabled": true,
    "personalization_enabled": true,
    "partner_profile_id": "aws-cloud",
    "performance_recommendations": true
  },

  "generation": {
    "figma": {
      "enabled": true,
      "file_id": "abc123def456",
      "page": "TFU AWS Partnership",
      "component_map": {
        "AWS Hero Card": "cover_hero",
        "Stat Block": "stats_sidebar",
        "Program Card": "program_section"
      }
    },
    "imageGeneration": {
      "enabled": true,
      "provider": "generic_image_api",
      "hero_style": "documentary photography, warm, human-centered",
      "prompts": {
        "cover_hero": "Ukrainian student learning cloud skills with AWS mentor",
        "program_image_1": "Diverse students collaborating on laptops in modern classroom"
      }
    },
    "fontPairing": {
      "enabled": true,
      "strategy": "constrained",
      "allow_alternatives": false,
      "tfu_brand_lock": true
    },
    "layoutIteration": {
      "enabled": false,
      "num_variations": 5
    }
  },

  "validation": {
    "smoldocling": {
      "enabled": true,
      "model": "smolvlm-500m"
    },
    "accessibility": {
      "enabled": true,
      "target_standard": "WCAG_2.2_AA"
    }
  },

  "analytics": {
    "performance_tracking": true,
    "partner_id": "aws",
    "doc_family": "tfu_partnership"
  }
}
```

---

## Environment Variables Required

```bash
# Phase 1: Planning
RAG_DB_URL=postgresql://localhost/teei_rag
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Phase 2: Generation
FIGMA_API_KEY=figd_...
IMAGE_API_KEY=...
IMAGE_API_PROVIDER=generic

# Phase 3: Validation
GEMINI_API_KEY=...  # Already exists
AWS_ACCESS_KEY_ID=...  # For accessibility remediation
AWS_SECRET_ACCESS_KEY=...

# Optional
COMMONLOOK_API_KEY=...
PDFFIX_API_KEY=...
```

---

## Service Call Order (Full Pipeline)

```
1. Planning Phase:
   - PerformanceIntelligence.get_design_recommendations()
   - RAGContentEngine.suggest_content()
   - ContentPersonalizer.adapt_content()

2. Generation Phase:
   - FigmaService.fetch_design_tokens()
   - FontPairingEngine.suggest_font_pairing()
   - ImageGenService.ensure_hero_images()
   - [Optional] LayoutIterationEngine.generate_and_score_variations()
   - Execute InDesign generator (execute_tfu_aws_v2.py)
   - Export PDF (export_v2_now.py)

3. Validation Phase:
   - Layer 0: SmolDoclingService.analyze_layout()
   - Layer 1: validate_document.py (with AI Tier 1)
   - Layer 2: validate-pdf-quality.js
   - Layer 3: compare-pdf-visual.js
   - Layer 3.5: ai/core/aiRunner.js
   - Layer 4: gemini-vision-review.js
   - Layer 5: AccessibilityRemediator.remediate_pdf()

4. Post-Processing:
   - PerformanceIntelligence.track_document_performance() (async)
```

---

## Backward Compatibility

All AI features are **opt-in** via job config flags:
- If `planning.rag_enabled = false`, skip RAG
- If `generation.figma.enabled = false`, skip Figma sync
- If `validation.accessibility.enabled = false`, skip Layer 5

**Default behavior:** Falls back to existing 4-layer pipeline without AI enhancements.

---

## Next Steps

1. Implement stub/placeholder services in `services/` directory
2. Wire services into `pipeline.py`
3. Extend `example-jobs/tfu-aws-partnership-v2.json` with AI config
4. Update documentation (AI-INTEGRATION-COMPLETE.md, SYSTEM-OVERVIEW.md)

---

**Document Status:** ✅ Complete
**Last Updated:** 2025-11-14
**Owner:** Agent 1 - Systems Architect
