#!/usr/bin/env python3

"""
TEEI Model Validation Helper

Python script called by JavaScript wrapper to perform
TEEI document validation with fine-tuned models.

Usage:
    python validate-with-model.py --model models/teei-brand-lora --document doc.pdf --prompt "..."
"""

import sys
import json
import argparse
from pathlib import Path

# Check dependencies
try:
    import torch
    from transformers import AutoModelForVision2Seq, AutoTokenizer, AutoProcessor
    from peft import PeftModel
    from PIL import Image
    HAS_DEPENDENCIES = True
except ImportError as e:
    print(json.dumps({"error": f"Missing dependencies: {e}"}), file=sys.stderr)
    HAS_DEPENDENCIES = False

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


def load_model(model_path):
    """Load fine-tuned TEEI model"""
    model_path = Path(model_path)

    # Load config
    config_path = model_path / "training_config.json"
    with open(config_path) as f:
        config = json.load(f)

    base_model_name = config["model_name"]

    # Load base model
    base_model = AutoModelForVision2Seq.from_pretrained(
        base_model_name,
        torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
        device_map="auto" if DEVICE == "cuda" else None
    )

    # Load LoRA adapters
    model = PeftModel.from_pretrained(base_model, str(model_path))
    tokenizer = AutoTokenizer.from_pretrained(str(model_path))
    processor = AutoProcessor.from_pretrained(base_model_name)

    return model, tokenizer, processor


def validate_document(model, tokenizer, processor, image_path, prompt, temperature=0.3, max_tokens=1024):
    """Validate TEEI document"""

    # Load image
    image = Image.open(image_path)

    # Process input
    inputs = processor(
        images=[image],
        text=[prompt],
        return_tensors="pt"
    ).to(DEVICE)

    # Generate validation
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            temperature=temperature,
            do_sample=True
        )

    # Decode response
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Parse JSON response
    try:
        result = json.loads(response)
    except json.JSONDecodeError:
        result = {
            "grade": "Unknown",
            "score": 0,
            "raw_response": response,
            "error": "Failed to parse JSON response"
        }

    return result


def main():
    parser = argparse.ArgumentParser(description="Validate TEEI document with fine-tuned model")
    parser.add_argument("--model", required=True, help="Path to fine-tuned model")
    parser.add_argument("--document", required=True, help="Path to document image/PDF")
    parser.add_argument("--prompt", required=True, help="Validation prompt")
    parser.add_argument("--temperature", type=float, default=0.3, help="Sampling temperature")
    parser.add_argument("--max-tokens", type=int, default=1024, help="Maximum tokens to generate")

    args = parser.parse_args()

    if not HAS_DEPENDENCIES:
        print(json.dumps({"error": "Missing dependencies. Install: pip install transformers peft torch pillow"}))
        sys.exit(1)

    try:
        # Load model
        model, tokenizer, processor = load_model(args.model)

        # Validate document
        result = validate_document(
            model, tokenizer, processor,
            args.document, args.prompt,
            args.temperature, args.max_tokens
        )

        # Output JSON result
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
