# RAG Content Engine & Content Personalization Guide

**Version:** 2.0.0
**Last Updated:** 2025-11-15

---

## Table of Contents

1. [Overview](#overview)
2. [RAG Content Engine](#rag-content-engine)
3. [Partner Profiles](#partner-profiles)
4. [Content Personalization](#content-personalization)
5. [Multilingual Translation](#multilingual-translation)
6. [Configuration](#configuration)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The PDF Orchestrator now includes **LLM-powered content personalization** capabilities:

- **RAG (Retrieval-Augmented Generation):** Local knowledge base with LLM answer synthesis
- **Partner Profiles:** Customizable profiles for content personalization per partner
- **Content Personalization:** LLM-generated narratives tailored to each partner
- **Multilingual Translation:** Real LLM translation to multiple languages (EN, DE, UK, FR, ES, PL)

**Key Benefits:**
- ✅ **Data-driven content:** Use insights from past successful partnerships
- ✅ **Partner-specific customization:** LLM generates custom narratives for each partner
- ✅ **Consistent branding:** Maintain brand voice while personalizing content
- ✅ **Multilingual support:** Real translation via Claude (when enabled)
- ✅ **Fully offline capable:** Fallback to deterministic mode when API unavailable

**Two Modes:**
- **LLM Mode** (`provider="anthropic"`): Real AI-generated content via Claude API
- **Offline Mode** (`provider="none"`): Deterministic templates and stubs (default)

---

## RAG Content Engine

### What is RAG?

**RAG (Retrieval-Augmented Generation)** is a technique that combines:
1. **Retrieval:** Search a knowledge base for relevant information
2. **Generation:** Use that context to generate/enhance content

Our RAG engine indexes markdown documents from `deliverables/` and `reports/` to provide context-aware content suggestions.

### How It Works

```python
from services.rag_content_engine import RAGContentEngine

# Initialize RAG engine
rag = RAGContentEngine(store_dir="rag_store")

# Build index from source documents
sources = ["deliverables/TEEI-AWS-Partnership-Document-Content.md"]
result = rag.build_or_update_index(sources)
# Returns: {'num_documents': 1, 'num_chunks': 45, 'last_updated': '2025-11-14T...'}

# Search for relevant content
results = rag.search("AWS partnership benefits", top_k=5)
# Returns: {'results': [{'text': '...', 'score': 0.87, 'source_path': '...'}, ...]}

# Get high-level suggestions
suggestions = rag.suggest_sections(
    topic="program outcomes",
    context={'partner_id': 'aws', 'industry': 'Cloud Computing'}
)
# Returns: {'suggestions': [...], 'sources': [...], 'confidence': 0.82}
```

### Storage Structure

```
rag_store/
├── index.json       # Document metadata and chunks
└── vectors.json     # TF-IDF vectors for similarity search
```

### CLI Testing

```bash
# Test RAG engine directly
python services/rag_content_engine.py

# Output:
# [OK] Indexed 3 documents -> 127 chunks
# [SEARCH] Query: "AWS cloud training programs"
# [RESULT] Found 5 matching chunks (scores: 0.92, 0.87, 0.81, ...)
```

### Upgrading to External Embeddings

Currently uses **local TF-IDF embeddings** (deterministic, no API calls). To use OpenAI embeddings:

```bash
# Set environment variable
export RAG_EMBEDDING_PROVIDER=openai
export OPENAI_API_KEY=sk-...

# RAG engine will automatically use OpenAI embeddings
```

---

## Partner Profiles

### Profile Structure

Partner profiles are JSON files in `config/partner-profiles/`:

```json
{
  "id": "aws-cloud",
  "name": "Amazon Web Services",
  "industry": "Cloud Computing",
  "region": "Global",
  "tone": "strategic_b2b_professional",
  "key_themes": [
    "cloud skills development",
    "technical training excellence",
    "employability outcomes"
  ],
  "preferred_metrics": [
    "students_reached",
    "aws_certifications",
    "employment_rate",
    "avg_salary"
  ],
  "content_emphasis": {
    "cover": "strategic partnership value proposition",
    "programs": "concrete outcomes + AWS branding",
    "cta": "co_marketing_long_term"
  },
  "visual_preferences": {
    "imagery_style": "professional_documentary",
    "logo_prominence": "high",
    "color_palette": "corporate_modern"
  },
  "partnership_tier": {
    "level": "strategic",
    "annual_value": 150000,
    "benefits": [
      "5,000 co-branded enrollments",
      "Advisory council seat",
      "Priority hiring pipeline"
    ]
  },
  "cta_style": "co_marketing_long_term"
}
```

### Profile Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., "aws-cloud") |
| `name` | string | Partner display name |
| `industry` | string | Industry category |
| `region` | string | Geographic focus |
| `tone` | string | Communication style |
| `key_themes` | array | Priority topics to emphasize |
| `preferred_metrics` | array | Key metrics to highlight |
| `content_emphasis` | object | Section-specific customization |
| `visual_preferences` | object | Design preferences |
| `partnership_tier` | object | Partnership details |

### Managing Profiles

```python
from services.partner_profiles import PartnerProfileRegistry

# Initialize registry
registry = PartnerProfileRegistry()

# Get profile
profile = registry.get_profile("aws-cloud")

# List all profiles
all_profiles = registry.list_profiles()
# Returns: [{'id': 'aws-cloud', 'name': 'Amazon Web Services', ...}, ...]

# Add new profile
new_profile = {
    "id": "google-cloud",
    "name": "Google Cloud",
    "industry": "Cloud Computing",
    # ...
}
registry.add_profile(new_profile)

# Validate profile structure
issues = registry.validate_profile(profile)
# Returns: [] if valid, or list of issues
```

### CLI Testing

```bash
# Test partner profiles
python services/partner_profiles.py

# Output:
# [PROFILES] Found 1 profile
#   - aws-cloud: Amazon Web Services (Cloud Computing)
# [OK] AWS profile loaded successfully
```

---

## Content Personalization

### How It Works

The **ContentPersonalizer** integrates RAG + Partner Profiles to customize content:

```python
from services.content_personalizer import ContentPersonalizer

# Initialize personalizer
personalizer = ContentPersonalizer()

# Base content (generic)
base_content = {
    'cover_title': 'Building Europe's Cloud-Native Workforce',
    'cover_subtitle': 'Together for Ukraine · Strategic Partnership',
    'intro_text': 'TEEI provides technical training programs...',
    'programs': [...],
    'cta_text': 'Ready to transform education?'
}

# Job config with personalization settings
job_config = {
    'planning': {
        'personalization_enabled': True,
        'partner_profile_id': 'aws-cloud',
        'rag': {'enabled': True}
    }
}

# Personalize content
personalized = personalizer.personalize(base_content, job_config)

# Result: Content tailored to AWS partner profile
# - Cover subtitle includes "AWS Strategic Partnership"
# - Intro mentions AWS by name
# - Programs emphasize AWS certifications
# - CTA uses co-marketing language
```

### Personalization Scope

**What gets personalized:**
1. **Cover subtitle:** Insert partner name
2. **Intro text:** Add partner-specific context
3. **Program descriptions:** Emphasize preferred metrics
4. **CTA:** Match partner's CTA style (e.g., co-marketing vs. transactional)
5. **Metrics:** Highlight partner's preferred KPIs

**What stays the same:**
- Core narrative structure
- TEEI brand voice
- TFU design compliance

### Personalization Summary

```python
summary = personalizer.get_personalization_summary(personalized)
# Returns:
# {
#   'personalized': True,
#   'partner_name': 'Amazon Web Services',
#   'industry': 'Cloud Computing',
#   'sections_modified': ['cover_subtitle', 'intro_text', 'programs', 'cta_text']
# }
```

---

## Multilingual Translation

### Supported Languages

| Code | Language | Status |
|------|----------|--------|
| `en` | English | ✅ Identity (no translation) |
| `de` | German | ✅ Stub translations |
| `uk` | Ukrainian | ✅ Stub translations (Cyrillic) |

### How It Works

```python
from services.multilingual_generator import MultilingualGenerator

# Initialize translator
translator = MultilingualGenerator(provider="local")

# Translate content to German
de_content = translator.translate_content(
    content=base_content,
    target_lang='de',
    fallback='en'
)

# Result: All text fields translated to German
# {
#   'cover_title': 'Aufbau Europas Cloud-Native-Arbeitskräfte',
#   'cover_subtitle': 'Gemeinsam für die Ukraine · AWS Strategische Partnerschaft',
#   ...
# }
```

### Translation Methods

**1. Local (Stub) Translation:**
- Uses deterministic phrase lookup
- Fast, offline, no API calls
- Limited vocabulary (common phrases only)
- Current default

**2. External API (Future):**
```python
translator = MultilingualGenerator(provider="openai")
# Or: provider="anthropic", provider="google-translate"
```

### Stub Translations

```python
# German
'Together for Ukraine': 'Gemeinsam für die Ukraine'
'Strategic Partnership': 'Strategische Partnerschaft'
'Cloud-Native Workforce': 'Cloud-Native-Arbeitskräfte'

# Ukrainian (Cyrillic)
'Together for Ukraine': 'Разом для України'
'Strategic Partnership': 'Стратегічне партнерство'
'Cloud-Native Workforce': 'Хмарна робоча сила'
```

### CLI Testing

```bash
# Test multilingual generator
python services/multilingual_generator.py

# Output:
# [SUPPORTED] Languages: en, de, uk
# [TEST] Translating to German (DE)...
# [EN] Building Europe's Cloud-Native Workforce
# [DE] Aufbau Europas Cloud-Native-Arbeitskräfte
```

---

## Configuration

### LLM Configuration (NEW)

Enable real AI-powered content generation:

```json
{
  "llm": {
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "temperature": 0.3,
    "fail_on_llm_error": false
  }
}
```

**Environment Setup:**
```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

**Modes:**
- `provider="anthropic"` + API key → Real LLM-powered generation
- `provider="none"` (default) → Offline deterministic fallbacks

### Job Config Setup

Add these sections to your job config (`example-jobs/tfu-aws-partnership-v2.json`):

```json
{
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
    "partner_profiles_dir": "config/partner-profiles"
  },
  "i18n": {
    "enabled": false,
    "target_language": "en",
    "fallback": "en",
    "provider": "local"
  }
}
```

### Enable Personalization

```json
"planning": {
  "personalization_enabled": true,
  "partner_profile_id": "aws-cloud",
  "rag": {
    "enabled": true
  }
}
```

### Enable Translation

```json
"i18n": {
  "enabled": true,
  "target_language": "de",
  "fallback": "en",
  "provider": "local"
}
```

---

## Usage Examples

### Example 1: Personalized AWS Document

```bash
# 1. Enable personalization in job config
vim example-jobs/tfu-aws-partnership-v2.json
# Set: planning.personalization_enabled = true

# 2. Run pipeline
python pipeline.py --world-class --job-config example-jobs/tfu-aws-partnership-v2.json

# Output:
# [RAG] Building knowledge base...
#   ✓ Using existing index: rag_store/index.json
# [Personalization] Customizing content for partner...
#   ✓ Personalized for: Amazon Web Services
#   Industry: Cloud Computing
#   Sections modified: 4
# [Content Export] ✓ Content saved to: exports/TEEI-AWS-TFU-V2-content.json
```

### Example 2: German Translation

```json
// job config
{
  "planning": {
    "personalization_enabled": true,
    "partner_profile_id": "aws-cloud"
  },
  "i18n": {
    "enabled": true,
    "target_language": "de"
  }
}
```

```bash
python pipeline.py --world-class --job-config example-jobs/tfu-aws-partnership-v2.json

# Output:
# [Personalization] ✓ Personalized for: Amazon Web Services
# [Translation] Translating to DE...
#   ✓ Content translated to DE
# [Content Export] ✓ Content saved to: exports/TEEI-AWS-TFU-V2-content.json
```

### Example 3: RAG-Powered Suggestions

```python
from services.rag_content_engine import RAGContentEngine

rag = RAGContentEngine()

# Get suggestions for intro section
suggestions = rag.suggest_sections(
    topic="AWS partnership value proposition",
    context={'partner_id': 'aws', 'industry': 'Cloud Computing'}
)

print(f"Found {len(suggestions['suggestions'])} suggestions")
print(f"Confidence: {suggestions['confidence']:.2f}")

for i, suggestion in enumerate(suggestions['suggestions'][:3]):
    print(f"{i+1}. {suggestion[:100]}...")
```

---

## Troubleshooting

### Issue: RAG Index Not Building

**Symptom:** "No source documents found"

**Solution:**
```bash
# Check if source files exist
ls deliverables/*.md
ls reports/*.md

# Manually build index
python services/rag_content_engine.py
```

### Issue: Partner Profile Not Found

**Symptom:** "Partner profile 'aws-cloud' not found"

**Solution:**
```bash
# Check if profile exists
ls config/partner-profiles/aws-cloud.json

# List all profiles
python services/partner_profiles.py
```

### Issue: Personalization Not Applied

**Symptom:** Content unchanged after personalization

**Check:**
1. Is `planning.personalization_enabled` set to `true`?
2. Is `planning.partner_profile_id` valid?
3. Does partner profile exist?
4. Check logs for errors

### Issue: Translation Missing Phrases

**Symptom:** Some text not translated

**Explanation:** Local stub translations have limited vocabulary. To get full translation:

```bash
# Option 1: Add phrases to stub dictionary
# Edit: services/multilingual_generator.py

# Option 2: Use external translation API
export RAG_EMBEDDING_PROVIDER=openai
export OPENAI_API_KEY=sk-...
```

---

## Best Practices

### 1. Build RAG Index Once

```bash
# Build index from all deliverables
python services/rag_content_engine.py

# Then enable in job config
"planning": {
  "rag": {"enabled": true}
}
```

### 2. Create Partner Profiles for Each Partner

```bash
# Copy AWS template
cp config/partner-profiles/aws-cloud.json config/partner-profiles/google-cloud.json

# Customize for new partner
vim config/partner-profiles/google-cloud.json
```

### 3. Test Personalization Before Production

```python
# Test personalization standalone
python services/content_personalizer.py

# Verify content export
cat exports/TEEI-AWS-TFU-V2-content.json
```

### 4. Use Gradual Rollout

```json
// Start with personalization only
"planning": {
  "personalization_enabled": true,
  "rag": {"enabled": false}
}

// Then add RAG
"planning": {
  "personalization_enabled": true,
  "rag": {"enabled": true}
}

// Finally add translation
"i18n": {"enabled": true, "target_language": "de"}
```

---

## API Reference

### RAGContentEngine

```python
class RAGContentEngine:
    def __init__(self, store_dir: str = "rag_store")
    def build_or_update_index(self, sources: List[str]) -> Dict
    def search(self, query: str, top_k: int = 5) -> Dict
    def suggest_sections(self, topic: str, context: Optional[Dict] = None) -> Dict
```

### PartnerProfileRegistry

```python
class PartnerProfileRegistry:
    def __init__(self, profiles_dir: str = "config/partner-profiles")
    def get_profile(self, profile_id: str) -> Optional[Dict]
    def list_profiles(self) -> List[Dict]
    def add_profile(self, profile: Dict) -> None
    def validate_profile(self, profile: Dict) -> List[str]
```

### ContentPersonalizer

```python
class ContentPersonalizer:
    def __init__(self, rag_engine=None, profile_registry=None)
    def personalize(self, base_content: Dict, job_config: Dict) -> Dict
    def get_personalization_summary(self, personalized_content: Dict) -> Dict
```

### MultilingualGenerator

```python
class MultilingualGenerator:
    def __init__(self, provider: str = "local")
    def translate_content(self, content: Dict, target_lang: str, fallback: str = "en") -> Dict
    def get_supported_languages(self) -> List[str]
```

---

## Next Steps

- **Try it:** Enable personalization in your next job
- **Expand:** Create profiles for more partners
- **Enhance:** Add more stub translations
- **Integrate:** Use RAG suggestions in content planning
- **Scale:** Switch to external embeddings for production

**Documentation:** See also:
- [Layout Iteration Guide](LAYOUT-ITERATION-GUIDE.md)
- [Performance Intelligence Guide](PERFORMANCE-INTELLIGENCE-GUIDE.md)
- [Agent Handoff Document](AGENT-RAG-PERF-HANDOFF.md)

---

**Questions or Issues?** Check [Troubleshooting](#troubleshooting) or review service code in `services/` directory.
