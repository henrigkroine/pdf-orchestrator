# RAG Content Intelligence - Quick Start Guide

Get your RAG system up and running in 5 minutes.

---

## Step 1: Prerequisites (2 minutes)

### 1.1 Start Qdrant Vector Database

**Option A: Docker (Recommended for Development)**
```bash
docker run -d -p 6333:6333 --name qdrant qdrant/qdrant
```

**Option B: Qdrant Cloud (Recommended for Production)**
1. Sign up at https://cloud.qdrant.io (free tier: 1 GB)
2. Create a cluster
3. Copy connection URL and API key

### 1.2 Set Environment Variables

Edit `config/.env`:
```bash
# OpenAI (for embeddings)
OPENAI_API_KEY=sk-...

# Qdrant (vector database)
QDRANT_HOST=localhost          # Or your cloud URL
QDRANT_PORT=6333
QDRANT_API_KEY=                # Only for Qdrant Cloud
```

---

## Step 2: Build Knowledge Base (2 minutes)

Index your past partnership PDFs into the vector database:

```bash
# Navigate to project root
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"

# Build knowledge base from reference PDFs
node -e "
import RAGOrchestrator from './ai/rag/ragOrchestrator.js';

const rag = new RAGOrchestrator();
await rag.initialize();
await rag.buildKnowledgeBase('reference-pdfs');
await rag.close();
"
```

**What this does:**
1. Parses all PDFs in `reference-pdfs/` directory
2. Extracts sections (value prop, programs, metrics, CTA)
3. Generates embeddings (~$0.0002 per document)
4. Stores in Qdrant vector database

**Expected output:**
```
[RAG] Building RAG Knowledge Base
[RAG] Found PDFs in: reference-pdfs
[RAG] Indexed 3/3 documents
[RAG] Total sections: 18
[RAG] Total cost: $0.0006
```

---

## Step 3: Test RAG System (1 minute)

Verify everything works:

```bash
# Run test suite
node ai/tests/rag-test.js
```

**Expected output:**
```
RAG SYSTEM TEST SUITE
======================================================================
Environment Setup
  ✓ Environment variables are configured (12ms)

RAG Client (Vector Database)
  ✓ RAG Client initializes connection (234ms)
  ✓ RAG Client retrieves collection stats (45ms)

... (more tests)

TEST SUMMARY
======================================================================
Total tests: 18
Passed: 17 ✓
Failed: 0 ✗
```

---

## Step 4: Use RAG in Your Workflow (< 1 minute)

### Option A: Via Job Config

Enable RAG in your job config:

```json
{
  "name": "AWS Partnership",
  "planning": {
    "rag_enabled": true
  },
  "content": {
    "partner_name": "Amazon Web Services",
    "industry": "Technology"
  }
}
```

Then use the enriched config in your pipeline:

```javascript
import RAGOrchestrator from './ai/rag/ragOrchestrator.js';
import fs from 'fs';

// Load job config
const jobConfig = JSON.parse(fs.readFileSync('example-jobs/aws-partnership.json'));

// Enrich with RAG suggestions
const rag = new RAGOrchestrator();
await rag.initialize();
const enrichedConfig = await rag.enrichJobConfig(jobConfig);

// Now use enrichedConfig.rag_suggestions in document generation
console.log('Suggested headline:', enrichedConfig.rag_suggestions.sections.value_proposition.recommended);
```

### Option B: Direct API Usage

```javascript
import RAGOrchestrator from './ai/rag/ragOrchestrator.js';

const rag = new RAGOrchestrator();
await rag.initialize();

// Get content suggestions
const suggestions = await rag.getSuggestionsForPartner({
  partner_name: 'Microsoft',
  industry: 'Technology',
  partnership_type: 'corporate'
});

console.log('Value proposition:', suggestions.sections.value_proposition.recommended);
console.log('Confidence:', suggestions.summary.avgConfidence);
console.log('CTA:', suggestions.sections.cta.recommended);
```

---

## Troubleshooting

### "Cannot connect to Qdrant"

**Check Qdrant is running:**
```bash
# Docker
docker ps | grep qdrant

# Or test connection
curl http://localhost:6333/health
```

**Solution:** Start Qdrant (see Step 1.1)

### "OpenAI API key not configured"

**Solution:** Set `OPENAI_API_KEY` in `config/.env`

### "No relevant documents found"

**Solution:** Build knowledge base first (see Step 2)

---

## Next Steps

1. **Index more documents**: Add PDFs to `reference-pdfs/` and re-run Step 2
2. **Monitor costs**: Check `embeddingGenerator.getUsageStats()`
3. **Improve accuracy**: Provide feedback on suggestions to train the system
4. **Integrate into pipeline**: Wire RAG into your document generation workflow

---

## Quick Reference

### Start Qdrant (Docker)
```bash
docker run -d -p 6333:6333 --name qdrant qdrant/qdrant
```

### Build Knowledge Base
```bash
node -e "import RAGOrchestrator from './ai/rag/ragOrchestrator.js'; const rag = new RAGOrchestrator(); await rag.initialize(); await rag.buildKnowledgeBase('reference-pdfs'); await rag.close();"
```

### Test RAG System
```bash
node ai/tests/rag-test.js
```

### Get Suggestions (Inline)
```bash
node -e "import RAGOrchestrator from './ai/rag/ragOrchestrator.js'; const rag = new RAGOrchestrator(); await rag.initialize(); const s = await rag.getSuggestionsForPartner({partner_name: 'AWS', industry: 'Technology'}); console.log(s); await rag.close();"
```

---

**Total Setup Time**: ~5 minutes
**Cost**: ~$0.001 for initial knowledge base
**Status**: Production Ready ✅
