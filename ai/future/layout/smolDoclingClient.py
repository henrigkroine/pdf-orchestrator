"""
SmolDocling VLM Client
Direct integration with Hugging Face ds4sd/SmolDocling-256M-preview model

Model: 256M parameter vision-language model for document layout analysis
Output: DocTags markup with semantic structure and spatial relationships
"""

import os
import sys
from typing import Dict, List, Optional, Any
from pathlib import Path
import json
import re

try:
    from PIL import Image
    import torch
    from transformers import AutoProcessor, AutoModelForVision2Seq
except ImportError as e:
    print(f"ERROR: Missing dependency: {e}")
    print("Install with: pip install torch transformers pillow")
    sys.exit(1)


class SmolDoclingClient:
    """
    Client for SmolDocling-256M-preview VLM
    Handles model loading, inference, and DocTags parsing
    """

    MODEL_ID = "ds4sd/SmolDocling-256M-preview"
    DEFAULT_PROMPT = "Convert this page to docling."

    def __init__(
        self,
        model_id: str = MODEL_ID,
        device: str = "auto",
        cache_dir: Optional[str] = None
    ):
        """
        Initialize SmolDocling client

        Args:
            model_id: Hugging Face model identifier
            device: "cuda", "cpu", or "auto" (default: auto-detect)
            cache_dir: Directory for model cache (default: HF default)
        """
        self.model_id = model_id
        self.device = self._get_device(device)
        self.cache_dir = cache_dir

        self.processor = None
        self.model = None
        self.is_loaded = False

    def _get_device(self, device: str) -> str:
        """Auto-detect optimal device"""
        if device == "auto":
            if torch.cuda.is_available():
                return "cuda"
            elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                return "mps"  # Apple Silicon
            else:
                return "cpu"
        return device

    def load_model(self) -> bool:
        """
        Load SmolDocling model from Hugging Face

        Returns:
            True if loaded successfully
        """
        try:
            print(f"Loading SmolDocling model: {self.model_id}")
            print(f"Device: {self.device}")

            # Load processor (handles tokenization and image processing)
            self.processor = AutoProcessor.from_pretrained(
                self.model_id,
                cache_dir=self.cache_dir,
                trust_remote_code=True
            )

            # Load model
            self.model = AutoModelForVision2Seq.from_pretrained(
                self.model_id,
                cache_dir=self.cache_dir,
                trust_remote_code=True,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            )

            # Move to device
            self.model.to(self.device)
            self.model.eval()

            self.is_loaded = True
            print(f"✓ SmolDocling loaded successfully")
            print(f"  Parameters: 256M")
            print(f"  Memory: ~{self._estimate_memory_mb()} MB")

            return True

        except Exception as e:
            print(f"✗ Failed to load SmolDocling: {e}")
            return False

    def _estimate_memory_mb(self) -> int:
        """Estimate model memory usage"""
        if self.device == "cuda":
            return 512  # ~500MB for 256M params in FP16
        else:
            return 1024  # ~1GB for 256M params in FP32

    def analyze_page(
        self,
        image: Image.Image,
        prompt: str = DEFAULT_PROMPT,
        max_new_tokens: int = 4096
    ) -> str:
        """
        Analyze single page image and return DocTags markup

        Args:
            image: PIL Image of document page
            prompt: Prompt for model (default: "Convert this page to docling.")
            max_new_tokens: Max tokens to generate

        Returns:
            DocTags markup string
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        try:
            # Prepare input messages (following SmolVLM format)
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "image"},
                        {"type": "text", "text": prompt}
                    ]
                }
            ]

            # Apply chat template
            prompt_text = self.processor.apply_chat_template(
                messages,
                add_generation_prompt=True
            )

            # Process inputs
            inputs = self.processor(
                text=prompt_text,
                images=[image],
                return_tensors="pt"
            )

            # Move inputs to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            # Generate DocTags
            with torch.no_grad():
                generated_ids = self.model.generate(
                    **inputs,
                    max_new_tokens=max_new_tokens,
                    do_sample=False  # Deterministic for consistency
                )

            # Decode output
            generated_text = self.processor.batch_decode(
                generated_ids,
                skip_special_tokens=True
            )[0]

            # Extract DocTags (model outputs assistant response)
            # Format: "User: <prompt>\nAssistant: <doctags>"
            if "Assistant:" in generated_text:
                doctags = generated_text.split("Assistant:")[-1].strip()
            else:
                doctags = generated_text.strip()

            return doctags

        except Exception as e:
            print(f"✗ Analysis failed: {e}")
            raise

    def analyze_pages(
        self,
        images: List[Image.Image],
        prompt: str = DEFAULT_PROMPT,
        max_new_tokens: int = 4096
    ) -> List[str]:
        """
        Analyze multiple pages (batch processing)

        Args:
            images: List of PIL Images
            prompt: Prompt for model
            max_new_tokens: Max tokens per page

        Returns:
            List of DocTags markup strings (one per page)
        """
        results = []

        for i, image in enumerate(images, 1):
            print(f"  Analyzing page {i}/{len(images)}...")
            doctags = self.analyze_page(image, prompt, max_new_tokens)
            results.append(doctags)

        return results

    def unload_model(self):
        """Unload model from memory"""
        if self.is_loaded:
            del self.model
            del self.processor
            if self.device == "cuda":
                torch.cuda.empty_cache()
            self.is_loaded = False
            print("✓ Model unloaded")


class DocTagsParser:
    """
    Parser for DocTags markup generated by SmolDocling

    DocTags format example:
    <document>
      <page page_number="1">
        <header>Partnership Overview</header>
        <body>Main content text...</body>
        <figure>
          <caption>Figure 1: Architecture</caption>
        </figure>
        <table>
          <row><cell>Column 1</cell><cell>Column 2</cell></row>
        </table>
      </page>
    </document>
    """

    # 14 layout class tags (from SmolDocling paper)
    LAYOUT_TAGS = {
        'document', 'page', 'header', 'footer', 'title', 'subtitle',
        'body', 'paragraph', 'list', 'list_item', 'figure', 'caption',
        'table', 'row', 'cell', 'code', 'equation'
    }

    @staticmethod
    def parse(doctags: str) -> Dict[str, Any]:
        """
        Parse DocTags markup into structured format

        Args:
            doctags: Raw DocTags markup string

        Returns:
            Structured document representation with elements and hierarchy
        """
        # Simple tag extraction (full XML parsing would require xml.etree)
        elements = []

        # Extract all tags with content
        tag_pattern = r'<(\w+)(?:\s+[^>]*)?>(.*?)</\1>'
        matches = re.finditer(tag_pattern, doctags, re.DOTALL)

        for match in matches:
            tag_name = match.group(1)
            content = match.group(2).strip()

            if tag_name in DocTagsParser.LAYOUT_TAGS:
                elements.append({
                    'type': tag_name,
                    'content': content[:200] if len(content) > 200 else content,  # Truncate long content
                    'position': match.start()
                })

        # Extract page count
        page_count = doctags.count('<page')

        return {
            'raw_doctags': doctags,
            'elements': elements,
            'page_count': page_count,
            'element_types': list(set(e['type'] for e in elements)),
            'hierarchy_depth': DocTagsParser._calculate_depth(doctags)
        }

    @staticmethod
    def _calculate_depth(doctags: str) -> int:
        """Calculate maximum nesting depth"""
        max_depth = 0
        current_depth = 0

        for char in doctags:
            if char == '<' and doctags[doctags.index(char)+1:doctags.index(char)+2] != '/':
                current_depth += 1
                max_depth = max(max_depth, current_depth)
            elif char == '<' and doctags[doctags.index(char)+1:doctags.index(char)+2] == '/':
                current_depth -= 1

        return max_depth


def test_client():
    """Test SmolDocling client with sample image"""
    print("=== SmolDocling Client Test ===\n")

    # Create client
    client = SmolDoclingClient(device="auto")

    # Load model
    if not client.load_model():
        print("✗ Model loading failed")
        return False

    # Create test image (white page with black text)
    from PIL import Image, ImageDraw, ImageFont

    img = Image.new('RGB', (800, 1000), color='white')
    draw = ImageDraw.Draw(img)

    # Draw simple document structure
    draw.text((50, 50), "Test Document Title", fill='black')
    draw.text((50, 150), "Section Header", fill='black')
    draw.text((50, 200), "This is body text paragraph.", fill='black')
    draw.rectangle([50, 300, 400, 500], outline='black', width=2)
    draw.text((60, 320), "Figure 1: Diagram", fill='black')

    print("\nAnalyzing test page...")
    doctags = client.analyze_page(img)

    print("\n=== DocTags Output ===")
    print(doctags[:500])  # Print first 500 chars

    # Parse result
    parsed = DocTagsParser.parse(doctags)

    print("\n=== Parsed Structure ===")
    print(f"Elements found: {len(parsed['elements'])}")
    print(f"Element types: {', '.join(parsed['element_types'])}")
    print(f"Hierarchy depth: {parsed['hierarchy_depth']}")

    # Cleanup
    client.unload_model()

    print("\n✓ Test completed successfully")
    return True


if __name__ == "__main__":
    # Run test if executed directly
    test_client()
