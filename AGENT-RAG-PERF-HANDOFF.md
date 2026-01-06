# Agent 1 → Agent 2 Handoff: RAG, Profiles & Performance

**Date:** 2025-11-14
**From:** Agent 1 (Data & Planning)
**To:** Agent 2 (Generative Engine & Layout Iteration)

---

## Agent 1 Status: ✅ COMPLETE

Agent 1 has implemented the data foundation for AI-powered planning and analytics.

---

## What Was Implemented

### 1. RAG Content Engine (`services/rag_content_engine.py`)

**Purpose:** Local file-based knowledge base for past TEEI partnerships and documents.

**Implementation:**
- **Storage:** `rag_store/` directory with `index.json` + `vectors.json`
- **Embeddings:** TF-IDF (deterministic, no external API required)
- **Sources:** Indexes files from `deliverables/*.md` and `reports/*.md`
- **No external dependencies** - fully offline capable

**API:**
```python
from services.rag_content_engine import RAGContentEngine

# Initialize
rag = RAGContentEngine(store_dir="rag_store")

# Build/update index
result = rag.build_or_update_index(["deliverables/TEEI-AWS-Partnership-Document-Content.md"])
# Returns: {'num_documents': N, 'num_chunks': M, 'last_updated': timestamp}

# Search
search_results = rag.search("AWS partnership benefits", top_k=5)
# Returns: {'results': [{'text': str, 'score': float, 'source_path': str}]}

# High-level suggestions
suggestions = rag.suggest_sections("program outcomes", context={'partner_id': 'aws'})
# Returns: {'suggestions': [str], 'sources': [str], 'confidence': float}
```

**Testing:**
```bash
python services/rag_content_engine.py
```

**Upgrade Path:**
- Set `RAG_EMBEDDING_PROVIDER=openai` env var to use real LLM embeddings
- Current implementation provides deterministic offline baseline

---

### 2. Partner Profile Registry (`services/partner_profiles.py`)

**Purpose:** Manage partner-specific profiles for content personalization.

**Storage:** JSON files in `config/partner-profiles/*.json`

**Created Profile:**
- `config/partner-profiles/aws-cloud.json` - Complete AWS partner profile

**API:**
```python
from services.partner_profiles import PartnerProfileRegistry

# Initialize
registry = PartnerProfileRegistry(profiles_dir="config/partner-profiles")

# Get profile
profile = registry.get_profile("aws-cloud")
# Returns: {'id': 'aws-cloud', 'name': 'Amazon Web Services', 'industry': 'Cloud Computing', ...}

# List all profiles
profiles = registry.list_profiles()

# Validate profile structure
issues = registry.validate_profile(profile)
```

**Profile Structure:**
```json
{
  "id": "aws-cloud",
  "name": "Amazon Web Services",
  "industry": "Cloud Computing",
  "tone": "strategic_b2b_professional",
  "key_themes": ["cloud skills", "technical training", "employability"],
  "preferred_metrics": ["students_reached", "aws_certifications", "employment_rate"],
  "content_emphasis": {
    "cover": "strategic partnership value",
    "programs": "concrete outcomes + AWS branding"
  }
}
```

**Testing:**
```bash
python services/partner_profiles.py
```

---

### 3. Performance Tracker (`services/performance_intelligence.py`)

**Purpose:** Track pipeline runs and provide data-driven recommendations.

**Storage:** JSONL format in `analytics/performance/log.jsonl`

**API:**
```python
from services.performance_intelligence import PerformanceTracker

# Initialize
tracker = PerformanceTracker(store_path="analytics/performance/log.jsonl")

# Log a run
tracker.log_run({
    'job_id': 'tfu-aws-v2-001',
    'partner_id': 'aws',
    'doc_family': 'tfu_partnership',
    'scores': {
        'layer0': 0.96,
        'layer1': 145,
        'layer3.5': 0.92,
        'layer4': 0.94,
        'layer5': 0.97
    },
    'overall_status': 'PASS'
})

# Get recommendations
recs = tracker.get_recommendations(partner_id='aws')
# Returns: {'typical_page_counts': [4], 'high_scoring_patterns': [...], 'common_issues': [...]}

# Get stats
stats = tracker.get_stats()
# Returns: {'total_runs': N, 'pass_rate': 0.XX, 'avg_layer_scores': {...}}
```

**Testing:**
```bash
python services/performance_intelligence.py
```

---

## Job Config Updates

**File:** `example-jobs/tfu-aws-partnership-v2.json`

### Added `planning` Section:
```json
"planning": {
  "rag": {
    "enabled": false,
    "store_dir": "rag_store",
    "sources": ["deliverables/*.md", "reports/*.md"],
    "retrievalCount": 5,
    "embeddingProvider": "local"
  },
  "personalization_enabled": false,
  "partner_profile_id": "aws-cloud",
  "partner_profiles_dir": "config/partner-profiles",
  "performance_recommendations": false
}
```

### Updated `analytics` Section:
```json
"analytics": {
  "performance_tracking": false,
  "partner_id": "aws",
  "doc_family": "tfu_partnership",
  "store_path": "analytics/performance/log.jsonl"
}
```

### Added `i18n` Section:
```json
"i18n": {
  "enabled": false,
  "target_language": "en",
  "fallback": "en",
  "provider": "local"
}
```

**Note:** All sections start `enabled: false` for backward compatibility.

---

## For Agent 2: How to Use These APIs

### Content Personalization Flow

1. **Load Partner Profile:**
```python
from services.partner_profiles import PartnerProfileRegistry

registry = PartnerProfileRegistry()
profile = registry.get_profile(job_config['planning']['partner_profile_id'])
```

2. **Get RAG Suggestions:**
```python
from services.rag_content_engine import RAGContentEngine

rag = RAGContentEngine()

# Build index if not exists
if not os.path.exists("rag_store/index.json"):
    sources = glob.glob("deliverables/*.md") + glob.glob("reports/*.md")
    rag.build_or_update_index(sources)

# Get suggestions for specific sections
cover_suggestions = rag.suggest_sections(
    topic="AWS partnership value proposition",
    context={'partner_id': 'aws', 'industry': 'Cloud Computing'}
)
```

3. **Combine for Personalization:**
```python
# In ContentPersonalizer:
def personalize(self, base_content: dict, job_config: dict) -> dict:
    # Get partner profile
    profile = self.profile_registry.get_profile(job_config['planning']['partner_profile_id'])

    # Get RAG suggestions
    rag_results = self.rag_engine.suggest_sections(
        topic=base_content['section_name'],
        context={'partner_id': profile['id'], 'industry': profile['industry']}
    )

    # Merge base content + profile preferences + RAG suggestions
    personalized = self._apply_personalization(base_content, profile, rag_results)

    return personalized
```

### Performance Recommendations Flow

```python
from services.performance_intelligence import PerformanceTracker

tracker = PerformanceTracker()

# Get recommendations before generating document
if job_config['planning']['performance_recommendations']:
    recs = tracker.get_recommendations(partner_id=job_config['analytics']['partner_id'])

    # Use recommendations to inform layout choices
    typical_page_count = recs['typical_page_counts'][0]  # e.g., 4
    high_scoring_patterns = recs['high_scoring_patterns']
```

---

## Directory Structure Created

```
pdf-orchestrator/
├── services/
│   ├── rag_content_engine.py         ✅ NEW
│   ├── partner_profiles.py            ✅ NEW
│   └── performance_intelligence.py    ✅ NEW
├── config/
│   └── partner-profiles/
│       └── aws-cloud.json             ✅ NEW
├── rag_store/                         ✅ NEW (created on first index)
│   ├── index.json
│   └── vectors.json
└── analytics/
    └── performance/
        └── log.jsonl                  ✅ NEW (created on first log)
```

---

## Testing Status

All Agent 1 services have CLI test modes:

```bash
# Test RAG engine
python services/rag_content_engine.py
# Expected: Indexes deliverables/*.md, performs test search

# Test partner profiles
python services/partner_profiles.py
# Expected: Lists aws-cloud profile

# Test performance tracker
python services/performance_intelligence.py
# Expected: Shows stats, logs test run
```

---

## What Agent 2 Must Do

1. **ContentPersonalizer** (`services/content_personalizer.py`):
   - Depends on: RAGContentEngine + PartnerProfileRegistry
   - Must implement: `personalize(base_content, job_config)`
   - Integration point: `execute_tfu_aws_v2.py` before InDesign generation

2. **LayoutIterationEngine** (`services/layout_iteration_engine.py`):
   - Uses: PerformanceTracker for recommendations
   - Must implement: `generate_variations()`, `score_variations()`, `pick_best()`
   - Integration point: Optional planning phase in `pipeline.py`

3. **MultilingualGenerator** (`services/multilingual_generator.py`):
   - Must implement: `translate_content(content, target_lang)`
   - Support: EN (identity) + at least one stub language (DE or UK)
   - Integration point: After personalization in `execute_tfu_aws_v2.py`

4. **Content JSON Export**:
   - Write personalized + translated content to:
     - `exports/TEEI-AWS-TFU-V2-content.json`
   - Format:
     ```json
     {
       "cover_title": "...",
       "cover_subtitle": "...",
       "page2_intro": "...",
       "page3_programs": [...],
       "page4_cta": "..."
     }
     ```

5. **JSX Integration**:
   - Update `scripts/generate_tfu_aws_v2.jsx` to:
     - Read `exports/TEEI-AWS-TFU-V2-content.json`
     - Use it as canonical source for all text frames
     - Keep page structure and TFU design unchanged

---

## Configuration Flags Agent 2 Should Respect

From `job_config`:

```python
# Planning flags
planning_cfg = job_config.get('planning', {})
rag_enabled = planning_cfg.get('rag', {}).get('enabled', False)
personalization_enabled = planning_cfg.get('personalization_enabled', False)
partner_profile_id = planning_cfg.get('partner_profile_id')

# I18n flags
i18n_cfg = job_config.get('i18n', {})
i18n_enabled = i18n_cfg.get('enabled', False)
target_language = i18n_cfg.get('target_language', 'en')

# Layout iteration flags
layout_cfg = job_config.get('generation', {}).get('layoutIteration', {})
layout_iteration_enabled = layout_cfg.get('enabled', False)
num_variations = layout_cfg.get('num_variations', 3)
```

---

## Backward Compatibility Notes

- **All features start disabled** (`enabled: false`) in job config
- **Graceful degradation:** If RAG/profiles unavailable, services return empty/default values
- **No breaking changes:** Existing TFU AWS V2 pipeline works unchanged
- **Opt-in activation:** Users must explicitly enable each feature

---

## Known Limitations

1. **RAG Embeddings:** Current TF-IDF implementation is deterministic but basic
   - Upgrade path: Set `RAG_EMBEDDING_PROVIDER=openai` for real embeddings

2. **Partner Profiles:** Currently only AWS profile exists
   - More profiles can be added to `config/partner-profiles/`

3. **Performance Tracker:** Starts with no historical data
   - Recommendations improve as more runs are logged

---

## Questions for Agent 2?

- How should content personalization handle missing partner profiles? (Fallback to base content)
- What format should multilingual content JSON use? (Same structure, translated values)
- Should layout iteration run in parallel or sequential? (Configuration-driven)

---

**Agent 1 Status:** ✅ COMPLETE
**Handoff to Agent 2:** Ready for generative engine implementation
**Next:** Agent 2 implements ContentPersonalizer, LayoutIteration, Multilingual + integration

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-14
