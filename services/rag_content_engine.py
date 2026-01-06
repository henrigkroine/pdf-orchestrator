#!/usr/bin/env python3
"""
RAG Content Engine - Knowledge Base for Past TEEI Partnerships

Local file-based RAG system using deterministic embeddings (TF-IDF).
No external dependencies required for basic operation.

Upgrade path: Set RAG_EMBEDDING_PROVIDER env var to use real LLM embeddings.

LLM Integration: Supports answer synthesis when LLMClient is provided.
"""

import os
import json
import hashlib
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from collections import Counter
import math

# Configure logging
logger = logging.getLogger(__name__)


class RAGContentEngine:
    """
    Retrieval-Augmented Generation engine for TEEI partnership content.

    Uses local file-based vector store with TF-IDF embeddings for offline operation.
    When LLMClient is provided, uses LLM for answer synthesis.
    """

    def __init__(self, store_dir: str = "rag_store", llm_client=None):
        """
        Initialize RAG engine with local storage.

        Args:
            store_dir: Directory for persistent index storage
            llm_client: Optional LLMClient for answer synthesis
        """
        self.store_dir = store_dir
        self.index_file = os.path.join(store_dir, "index.json")
        self.vectors_file = os.path.join(store_dir, "vectors.json")
        self.llm_client = llm_client

        # Ensure storage directory exists
        os.makedirs(store_dir, exist_ok=True)

        # Load existing index or initialize empty
        self.index = self._load_index()
        self.vectors = self._load_vectors()

        # Check for external embedding provider
        self.embedding_provider = os.getenv("RAG_EMBEDDING_PROVIDER", "local")

        # Log LLM availability
        if llm_client and hasattr(llm_client, 'is_available') and llm_client.is_available():
            logger.info("[RAG] LLM-powered answer synthesis enabled")
        else:
            logger.info("[RAG] Using retrieval-only mode (no answer synthesis)")

    def _load_index(self) -> Dict[str, Any]:
        """Load index metadata from disk"""
        if os.path.exists(self.index_file):
            with open(self.index_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "documents": {},
            "metadata": {
                "last_updated": None,
                "num_documents": 0,
                "num_chunks": 0,
                "embedding_provider": "local"
            }
        }

    def _load_vectors(self) -> Dict[str, Any]:
        """Load vector embeddings from disk"""
        if os.path.exists(self.vectors_file):
            with open(self.vectors_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def _save_index(self):
        """Persist index to disk"""
        with open(self.index_file, 'w', encoding='utf-8') as f:
            json.dump(self.index, f, indent=2)

    def _save_vectors(self):
        """Persist vectors to disk"""
        with open(self.vectors_file, 'w', encoding='utf-8') as f:
            json.dump(self.vectors, f, indent=2)

    def _chunk_document(self, content: str, chunk_size: int = 500) -> List[str]:
        """
        Split document into chunks for better retrieval granularity.

        Args:
            content: Document text
            chunk_size: Target characters per chunk

        Returns:
            List of text chunks
        """
        # Simple sentence-based chunking
        sentences = content.replace('\n', ' ').split('. ')
        chunks = []
        current_chunk = ""

        for sentence in sentences:
            if len(current_chunk) + len(sentence) < chunk_size:
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks if chunks else [content[:chunk_size]]

    def _compute_tf_idf(self, text: str) -> Dict[str, float]:
        """
        Compute TF-IDF vector for text (deterministic local embedding).

        Args:
            text: Input text

        Returns:
            Dictionary mapping terms to TF-IDF scores
        """
        # Tokenize (simple whitespace + lowercase)
        tokens = text.lower().split()

        # Term frequency
        tf = Counter(tokens)
        total_terms = len(tokens)

        for term in tf:
            tf[term] = tf[term] / total_terms

        # IDF (inverse document frequency) - approximate from corpus size
        # For now, use log(total_docs / doc_freq), where doc_freq defaults to 1
        num_docs = max(self.index["metadata"]["num_documents"], 1)

        tf_idf = {}
        for term, freq in tf.items():
            # Assume each unique term appears in ~10% of documents (heuristic)
            doc_freq = max(1, num_docs * 0.1)
            idf = math.log(num_docs / doc_freq)
            tf_idf[term] = freq * idf

        return tf_idf

    def _cosine_similarity(self, vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        """
        Compute cosine similarity between two TF-IDF vectors.

        Args:
            vec1, vec2: TF-IDF dictionaries

        Returns:
            Similarity score (0-1)
        """
        # Get all unique terms
        all_terms = set(vec1.keys()) | set(vec2.keys())

        # Compute dot product and magnitudes
        dot_product = sum(vec1.get(term, 0) * vec2.get(term, 0) for term in all_terms)

        mag1 = math.sqrt(sum(v**2 for v in vec1.values()))
        mag2 = math.sqrt(sum(v**2 for v in vec2.values()))

        if mag1 == 0 or mag2 == 0:
            return 0.0

        return dot_product / (mag1 * mag2)

    def build_or_update_index(self, sources: List[str]) -> Dict[str, Any]:
        """
        Build or update RAG index from provided file paths.

        Args:
            sources: List of file paths to index (supports .md, .txt, .json)

        Returns:
            {
                'num_documents': int,
                'num_chunks': int,
                'last_updated': str (ISO timestamp),
                'indexed_files': List[str],
                'skipped_files': List[str]
            }
        """
        indexed_files = []
        skipped_files = []
        total_chunks = 0

        for source_path in sources:
            if not os.path.exists(source_path):
                skipped_files.append(f"{source_path} (not found)")
                continue

            try:
                # Read file content
                with open(source_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Generate document ID (hash of path + content)
                doc_id = hashlib.md5(f"{source_path}{content}".encode()).hexdigest()

                # Chunk document
                chunks = self._chunk_document(content)

                # Compute embeddings for each chunk
                chunk_vectors = []
                for chunk in chunks:
                    vec = self._compute_tf_idf(chunk)
                    chunk_vectors.append(vec)

                # Store document metadata
                self.index["documents"][doc_id] = {
                    "source_path": source_path,
                    "num_chunks": len(chunks),
                    "indexed_at": datetime.now().isoformat()
                }

                # Store chunks and vectors
                for i, (chunk, vec) in enumerate(zip(chunks, chunk_vectors)):
                    chunk_id = f"{doc_id}_chunk_{i}"
                    self.vectors[chunk_id] = {
                        "doc_id": doc_id,
                        "chunk_index": i,
                        "text": chunk,
                        "vector": vec
                    }

                indexed_files.append(source_path)
                total_chunks += len(chunks)

            except Exception as e:
                skipped_files.append(f"{source_path} (error: {e})")

        # Update metadata
        self.index["metadata"].update({
            "last_updated": datetime.now().isoformat(),
            "num_documents": len(self.index["documents"]),
            "num_chunks": len(self.vectors),
            "embedding_provider": self.embedding_provider
        })

        # Persist to disk
        self._save_index()
        self._save_vectors()

        return {
            "num_documents": len(indexed_files),
            "num_chunks": total_chunks,
            "last_updated": self.index["metadata"]["last_updated"],
            "indexed_files": indexed_files,
            "skipped_files": skipped_files
        }

    def search(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Search index for most relevant chunks.

        Args:
            query: Search query string
            top_k: Number of results to return

        Returns:
            {
                'results': List[{
                    'text': str,
                    'score': float,
                    'source_path': str,
                    'chunk_index': int
                }],
                'query': str,
                'num_results': int
            }
        """
        # Compute query vector
        query_vec = self._compute_tf_idf(query)

        # Score all chunks
        scored_chunks = []
        for chunk_id, chunk_data in self.vectors.items():
            chunk_vec = chunk_data["vector"]
            score = self._cosine_similarity(query_vec, chunk_vec)

            # Get source document
            doc_id = chunk_data["doc_id"]
            source_path = self.index["documents"][doc_id]["source_path"]

            scored_chunks.append({
                "text": chunk_data["text"],
                "score": score,
                "source_path": source_path,
                "chunk_index": chunk_data["chunk_index"]
            })

        # Sort by score and take top_k
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        results = scored_chunks[:top_k]

        return {
            "results": results,
            "query": query,
            "num_results": len(results)
        }

    def suggest_sections(self, topic: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        High-level helper to suggest content sections for a topic.

        Args:
            topic: Topic/theme (e.g., "AWS partnership", "program outcomes")
            context: Optional context dict with partner_id, industry, etc.

        Returns:
            {
                'suggestions': List[str],  # Candidate text snippets
                'sources': List[str],       # Source file paths
                'confidence': float         # 0-1
            }
        """
        # Enhance query with context
        query = topic
        if context:
            if "industry" in context:
                query += f" {context['industry']}"
            if "partner_id" in context:
                query += f" {context['partner_id']}"

        # Search index
        search_results = self.search(query, top_k=5)

        # Extract suggestions
        suggestions = []
        sources = set()

        for result in search_results["results"]:
            if result["score"] > 0.1:  # Minimum relevance threshold
                suggestions.append(result["text"])
                sources.add(result["source_path"])

        # Compute confidence based on scores
        if search_results["results"]:
            avg_score = sum(r["score"] for r in search_results["results"]) / len(search_results["results"])
            confidence = min(avg_score * 2, 1.0)  # Scale to 0-1
        else:
            confidence = 0.0

        return {
            "suggestions": suggestions,
            "sources": list(sources),
            "confidence": confidence
        }

    def answer(self, question: str, top_k: int = 5, max_context_length: int = 2000) -> Dict[str, Any]:
        """
        Answer a question using RAG: retrieve relevant chunks, then synthesize answer.

        Args:
            question: Question to answer
            top_k: Number of chunks to retrieve for context
            max_context_length: Maximum characters of context to use

        Returns:
            {
                'answer': str,              # Synthesized answer or concatenated chunks
                'sources': List[str],       # Source file paths
                'confidence': float,        # 0-1
                'method': str              # 'llm_synthesis' or 'retrieval_only'
            }
        """
        # Retrieve relevant chunks
        search_results = self.search(question, top_k=top_k)

        if not search_results["results"]:
            return {
                "answer": "[No relevant information found in knowledge base]",
                "sources": [],
                "confidence": 0.0,
                "method": "none"
            }

        # Collect context from top chunks
        context_chunks = []
        sources = set()
        total_length = 0

        for result in search_results["results"]:
            if total_length + len(result["text"]) > max_context_length:
                break
            context_chunks.append(result["text"])
            sources.add(result["source_path"])
            total_length += len(result["text"])

        context = "\n\n".join(context_chunks)

        # Try LLM synthesis if available
        if self.llm_client and hasattr(self.llm_client, 'is_available') and self.llm_client.is_available():
            try:
                logger.info(f"[RAG] Synthesizing answer using LLM for: {question[:50]}...")

                system_prompt = (
                    "You are a helpful assistant that answers questions about TEEI partnerships "
                    "based on provided context from past partnership documents. "
                    "Provide concise, accurate answers based only on the given context. "
                    "If the context doesn't contain enough information, say so clearly."
                )

                user_prompt = (
                    f"Context from past TEEI partnership documents:\n\n"
                    f"{context}\n\n"
                    f"Question: {question}\n\n"
                    f"Answer:"
                )

                answer = self.llm_client.generate(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.3
                )

                # Compute confidence based on retrieval scores
                avg_score = sum(r["score"] for r in search_results["results"]) / len(search_results["results"])
                confidence = min(avg_score * 2, 1.0)

                return {
                    "answer": answer,
                    "sources": list(sources),
                    "confidence": confidence,
                    "method": "llm_synthesis"
                }

            except Exception as e:
                logger.warning(f"[RAG] LLM synthesis failed: {e}. Falling back to retrieval-only.")

        # Fallback: return concatenated chunks
        logger.info("[RAG] Using retrieval-only mode (no LLM)")

        # Compute confidence based on retrieval scores
        avg_score = sum(r["score"] for r in search_results["results"]) / len(search_results["results"])
        confidence = min(avg_score * 2, 1.0)

        return {
            "answer": context,  # Just return the raw context
            "sources": list(sources),
            "confidence": confidence,
            "method": "retrieval_only"
        }

    def get_stats(self) -> Dict[str, Any]:
        """Get index statistics"""
        return {
            "num_documents": self.index["metadata"]["num_documents"],
            "num_chunks": self.index["metadata"]["num_chunks"],
            "last_updated": self.index["metadata"]["last_updated"],
            "embedding_provider": self.index["metadata"]["embedding_provider"],
            "store_dir": self.store_dir,
            "llm_synthesis_available": (
                self.llm_client and
                hasattr(self.llm_client, 'is_available') and
                self.llm_client.is_available()
            )
        }


# CLI for testing
if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("RAG CONTENT ENGINE TEST")
    print("=" * 60)

    # Initialize
    rag = RAGContentEngine()

    # Build index from deliverables and reports
    sources = []

    # Add deliverables
    if os.path.exists("deliverables"):
        for file in os.listdir("deliverables"):
            if file.endswith((".md", ".txt")):
                sources.append(os.path.join("deliverables", file))

    # Add reports
    if os.path.exists("reports"):
        for file in os.listdir("reports"):
            if file.endswith((".md", ".txt")):
                sources.append(os.path.join("reports", file))

    if sources:
        print(f"\n[BUILD] Indexing {len(sources)} source files...")
        result = rag.build_or_update_index(sources)
        print(f"[OK] Indexed {result['num_documents']} documents -> {result['num_chunks']} chunks")
        print(f"  Last updated: {result['last_updated']}")

        # Test search
        print("\n[SEARCH] Query: 'AWS partnership benefits'")
        search_result = rag.search("AWS partnership benefits", top_k=3)
        print(f"[OK] Found {search_result['num_results']} results:")
        for i, res in enumerate(search_result['results'], 1):
            print(f"  {i}. Score: {res['score']:.3f} | Source: {os.path.basename(res['source_path'])}")
            print(f"     {res['text'][:100]}...")

        # Test suggestions
        print("\n[SUGGEST] Topic: 'program outcomes'")
        suggestions = rag.suggest_sections("program outcomes")
        print(f"[OK] Confidence: {suggestions['confidence']:.2f}")
        print(f"  {len(suggestions['suggestions'])} suggestions from {len(suggestions['sources'])} sources")

    else:
        print("\n[SKIP] No source files found in deliverables/ or reports/")
        print("  Index creation skipped")

    # Show stats
    stats = rag.get_stats()
    print(f"\n[STATS] RAG Index:")
    print(f"  Documents: {stats['num_documents']}")
    print(f"  Chunks: {stats['num_chunks']}")
    print(f"  Provider: {stats['embedding_provider']}")
    print(f"  Store: {stats['store_dir']}")

    sys.exit(0)
