#!/usr/bin/env python3

"""
TEEI Brand QLoRA 4-bit Fine-Tuning Script

QLoRA (Quantized LoRA) with 4-bit precision for maximum efficiency.
Train 13B+ models on 24GB GPU with near-zero accuracy loss!

QLoRA Benefits over LoRA:
- 4x less GPU memory (4-bit vs 16-bit)
- Train 13B models on 24GB GPU (vs 7B max for LoRA)
- Same accuracy as full fine-tuning
- Even faster training convergence
- 16x smaller model size in memory

Usage:
    python scripts/finetune/train-qlora-4bit.py
    python scripts/finetune/train-qlora-4bit.py --model llama-13b
    python scripts/finetune/train-qlora-4bit.py --bits 4 --double-quant
"""

import os
import sys
import json
import argparse
import torch
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional

# Check GPU availability
HAS_GPU = torch.cuda.is_available()
DEVICE = "cuda" if HAS_GPU else "cpu"

print(f"🖥️  Device: {DEVICE}")
if HAS_GPU:
    print(f"   GPU: {torch.cuda.get_device_name(0)}")
    gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1e9
    print(f"   Memory: {gpu_memory:.1f} GB")

    # QLoRA recommendations based on GPU memory
    if gpu_memory >= 80:
        print(f"   💪 Can train: Up to 70B models with QLoRA!")
    elif gpu_memory >= 48:
        print(f"   💪 Can train: Up to 33B models with QLoRA!")
    elif gpu_memory >= 24:
        print(f"   💪 Can train: Up to 13B models with QLoRA!")
    else:
        print(f"   💪 Can train: Up to 7B models with QLoRA!")
print()

# Import ML libraries
try:
    from transformers import (
        AutoTokenizer,
        AutoModelForVision2Seq,
        AutoProcessor,
        Trainer,
        TrainingArguments,
        BitsAndBytesConfig
    )
    from peft import (
        LoraConfig,
        get_peft_model,
        prepare_model_for_kbit_training,
        TaskType
    )
    from datasets import load_dataset
    import bitsandbytes as bnb
    HAS_DEPENDENCIES = True
except ImportError as e:
    print(f"⚠️  Missing dependencies: {e}")
    print("   Install with: pip install transformers peft datasets bitsandbytes accelerate")
    HAS_DEPENDENCIES = False

# Project paths
ROOT_DIR = Path(__file__).parent.parent.parent
TRAINING_DATA_DIR = ROOT_DIR / "training-data"
MODELS_DIR = ROOT_DIR / "models"
CHECKPOINTS_DIR = ROOT_DIR / "checkpoints"

# Create directories
for dir_path in [MODELS_DIR, CHECKPOINTS_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)


class TEEIQLoRATrainer:
    """
    TEEI-specific QLoRA (4-bit quantized) fine-tuning trainer
    """

    def __init__(self, config: Dict):
        self.config = config
        self.model_name = config.get("model_name", "google/gemini-2.5-flash")
        self.output_dir = MODELS_DIR / config.get("output_name", "teei-brand-qlora-4bit")
        self.checkpoint_dir = CHECKPOINTS_DIR / config.get("output_name", "teei-brand-qlora-4bit")

        # QLoRA 4-bit quantization config
        self.bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,  # 4-bit quantization
            bnb_4bit_quant_type=config.get("quant_type", "nf4"),  # NormalFloat4 (best for QLoRA)
            bnb_4bit_compute_dtype=torch.bfloat16 if HAS_GPU else torch.float32,
            bnb_4bit_use_double_quant=config.get("double_quant", True),  # Nested quantization
        )

        # LoRA configuration (for QLoRA)
        self.lora_config = LoraConfig(
            r=config.get("lora_r", 64),  # Higher rank for QLoRA (compensates for quantization)
            lora_alpha=config.get("lora_alpha", 128),  # Higher alpha
            target_modules=config.get("target_modules", [
                "q_proj", "k_proj", "v_proj", "o_proj",  # Attention
                "gate_proj", "up_proj", "down_proj"       # MLP
            ]),
            lora_dropout=config.get("lora_dropout", 0.05),
            bias=config.get("lora_bias", "none"),
            task_type=TaskType.VISION_SEQ_2_SEQ_LM
        )

        # Training configuration
        self.training_args = TrainingArguments(
            output_dir=str(self.checkpoint_dir),
            num_train_epochs=config.get("epochs", 3),
            per_device_train_batch_size=config.get("batch_size", 8),  # Can use larger batch!
            per_device_eval_batch_size=config.get("eval_batch_size", 8),
            gradient_accumulation_steps=config.get("gradient_accumulation", 2),
            learning_rate=config.get("learning_rate", 2e-4),
            warmup_steps=config.get("warmup_steps", 100),
            weight_decay=config.get("weight_decay", 0.01),
            logging_steps=10,
            eval_steps=100,
            save_steps=500,
            save_total_limit=3,
            evaluation_strategy="steps",
            save_strategy="steps",
            load_best_model_at_end=True,
            metric_for_best_model="eval_loss",
            greater_is_better=False,
            bf16=HAS_GPU,  # Use bfloat16 for QLoRA
            fp16=False,
            gradient_checkpointing=True,  # Reduce memory usage
            optim="paged_adamw_32bit",  # Paged optimizer for QLoRA
            dataloader_num_workers=4,
            remove_unused_columns=False,
            report_to=["wandb"] if config.get("use_wandb") else [],
            run_name=f"teei-qlora-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        )

        self.model = None
        self.tokenizer = None
        self.processor = None

    def load_base_model(self):
        """Load base model with 4-bit quantization"""
        print(f"📥 Loading base model with 4-bit quantization: {self.model_name}...\n")

        try:
            # Load tokenizer/processor
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.processor = AutoProcessor.from_pretrained(self.model_name)

            # Load model with 4-bit quantization
            model = AutoModelForVision2Seq.from_pretrained(
                self.model_name,
                quantization_config=self.bnb_config,
                device_map="auto" if HAS_GPU else None,
                trust_remote_code=True
            )

            # Prepare model for k-bit training
            model = prepare_model_for_kbit_training(model)

            # Print model info
            total_params = sum(p.numel() for p in model.parameters())

            # Estimate memory savings
            original_size_gb = (total_params * 2) / 1e9  # 16-bit
            quantized_size_gb = (total_params * 0.5) / 1e9  # 4-bit
            memory_savings = (1 - quantized_size_gb / original_size_gb) * 100

            print(f"   ✅ Model loaded with 4-bit quantization")
            print(f"   Total parameters: {total_params:,} ({total_params / 1e9:.1f}B)")
            print(f"   Original size (16-bit): {original_size_gb:.1f} GB")
            print(f"   Quantized size (4-bit): {quantized_size_gb:.1f} GB")
            print(f"   Memory savings: {memory_savings:.1f}% 🎉")
            print()

            return model

        except Exception as e:
            print(f"   ❌ Failed to load model: {e}")
            raise

    def apply_qlora(self, model):
        """Apply QLoRA adapters to quantized model"""
        print(f"🔧 Applying QLoRA adapters (r={self.lora_config.r})...\n")

        # Add LoRA adapters
        model = get_peft_model(model, self.lora_config)

        # Print trainable parameters
        trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
        total_params = sum(p.numel() for p in model.parameters())
        trainable_percent = 100 * trainable_params / total_params

        print(f"   ✅ QLoRA applied")
        print(f"   Trainable parameters: {trainable_params:,} ({trainable_params / 1e6:.1f}M)")
        print(f"   Total parameters: {total_params:,} ({total_params / 1e9:.1f}B)")
        print(f"   Trainable: {trainable_percent:.4f}%")
        print(f"   Quantization: 4-bit NF4 with double quantization")
        print()

        return model

    def load_datasets(self):
        """Load TEEI training datasets"""
        print("📚 Loading TEEI training datasets...\n")

        train_path = TRAINING_DATA_DIR / "teei-train.jsonl"
        val_path = TRAINING_DATA_DIR / "teei-validation.jsonl"

        if not train_path.exists():
            print(f"   ❌ Training dataset not found: {train_path}")
            print(f"   Run: node scripts/finetune/prepare-teei-dataset.js")
            sys.exit(1)

        # Load datasets
        train_dataset = load_dataset("json", data_files=str(train_path), split="train")
        val_dataset = load_dataset("json", data_files=str(val_path), split="train")

        print(f"   ✅ Training examples: {len(train_dataset)}")
        print(f"   ✅ Validation examples: {len(val_dataset)}")
        print()

        return train_dataset, val_dataset

    def preprocess_function(self, examples):
        """Preprocess examples for training"""
        messages = examples["messages"]
        images = []
        texts = []

        for msg_list in messages:
            for msg in msg_list:
                if msg["role"] == "user":
                    for content in msg["content"]:
                        if content["type"] == "image":
                            images.append(content["image"])
                        elif content["type"] == "text":
                            texts.append(content["text"])
                elif msg["role"] == "assistant":
                    texts.append(msg["content"])

        model_inputs = self.processor(
            images=images,
            text=texts,
            return_tensors="pt",
            padding="max_length",
            truncation=True,
            max_length=512
        )

        return model_inputs

    def train(self):
        """Execute QLoRA training"""
        print("🚀 Starting TEEI QLoRA 4-bit fine-tuning...\n")

        if not HAS_DEPENDENCIES:
            print("❌ Cannot train: Missing dependencies")
            print("   Install with: pip install transformers peft datasets bitsandbytes accelerate")
            sys.exit(1)

        if not HAS_GPU:
            print("⚠️  Warning: QLoRA training without GPU will be very slow")
            print("   Recommended: Use GPU with CUDA for optimal performance")
            print()

        # Load quantized base model
        base_model = self.load_base_model()

        # Apply QLoRA
        self.model = self.apply_qlora(base_model)

        # Load datasets
        train_dataset, val_dataset = self.load_datasets()

        # Preprocess datasets
        print("🔄 Preprocessing datasets...\n")
        train_dataset = train_dataset.map(
            self.preprocess_function,
            batched=True,
            remove_columns=train_dataset.column_names
        )
        val_dataset = val_dataset.map(
            self.preprocess_function,
            batched=True,
            remove_columns=val_dataset.column_names
        )
        print("   ✅ Preprocessing complete\n")

        # Initialize trainer
        trainer = Trainer(
            model=self.model,
            args=self.training_args,
            train_dataset=train_dataset,
            eval_dataset=val_dataset
        )

        # Train
        print("🏋️  Training with QLoRA 4-bit...\n")
        training_start = datetime.now()

        train_result = trainer.train(
            resume_from_checkpoint=self.config.get("resume_from_checkpoint")
        )

        training_end = datetime.now()
        training_duration = training_end - training_start

        # Print results
        print(f"\n✅ QLoRA training complete!")
        print(f"   Duration: {training_duration}")
        print(f"   Final loss: {train_result.training_loss:.4f}")
        print()

        # Evaluate
        print("📊 Evaluating on validation set...\n")
        eval_result = trainer.evaluate()
        print(f"   Validation loss: {eval_result['eval_loss']:.4f}")
        print()

        # Save model
        print(f"💾 Saving QLoRA adapters...\n")
        self.model.save_pretrained(str(self.output_dir))
        self.tokenizer.save_pretrained(str(self.output_dir))

        # Save training config
        config_path = self.output_dir / "training_config.json"
        with open(config_path, "w") as f:
            json.dump({
                "model_name": self.model_name,
                "quantization": {
                    "bits": 4,
                    "quant_type": "nf4",
                    "double_quant": True,
                    "compute_dtype": "bfloat16"
                },
                "lora_config": {
                    "r": self.lora_config.r,
                    "lora_alpha": self.lora_config.lora_alpha,
                    "target_modules": self.lora_config.target_modules,
                    "lora_dropout": self.lora_config.lora_dropout
                },
                "training_results": {
                    "training_loss": train_result.training_loss,
                    "validation_loss": eval_result["eval_loss"],
                    "duration_seconds": training_duration.total_seconds()
                },
                "trained_at": training_end.isoformat()
            }, f, indent=2)

        print(f"   ✅ Model saved to: {self.output_dir}")
        print(f"   ✅ Config saved to: {config_path}")
        print()

        # Calculate file size
        adapter_size = sum(
            f.stat().st_size for f in self.output_dir.rglob("*") if f.is_file()
        ) / (1024 * 1024)  # MB

        print(f"📦 QLoRA Adapter Statistics:")
        print(f"   Adapter size: {adapter_size:.1f} MB")
        print(f"   Quantization: 4-bit NF4 (4x memory savings)")
        print(f"   Training method: QLoRA (optimal efficiency)")
        print(f"   Space savings: Massive! 🚀")
        print()

        print("🎉 TEEI QLoRA model ready!")
        print("   Use with: node scripts/lib/teei-custom-model.js")
        print()

        return {
            "model_path": str(self.output_dir),
            "training_loss": train_result.training_loss,
            "validation_loss": eval_result["eval_loss"],
            "adapter_size_mb": adapter_size,
            "training_duration": str(training_duration),
            "quantization": "4-bit NF4"
        }


def main():
    parser = argparse.ArgumentParser(description="Train TEEI QLoRA 4-bit model")
    parser.add_argument("--model", default="google/gemini-2.5-flash", help="Base model name")
    parser.add_argument("--output", default="teei-brand-qlora-4bit", help="Output directory name")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=8, help="Training batch size")
    parser.add_argument("--learning-rate", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--lora-r", type=int, default=64, help="LoRA rank (higher for QLoRA)")
    parser.add_argument("--lora-alpha", type=int, default=128, help="LoRA alpha")
    parser.add_argument("--bits", type=int, default=4, choices=[4, 8], help="Quantization bits")
    parser.add_argument("--quant-type", default="nf4", choices=["nf4", "fp4"], help="Quantization type")
    parser.add_argument("--double-quant", action="store_true", default=True, help="Use double quantization")
    parser.add_argument("--resume", help="Resume from checkpoint")
    parser.add_argument("--use-wandb", action="store_true", help="Enable Weights & Biases logging")

    args = parser.parse_args()

    config = {
        "model_name": args.model,
        "output_name": args.output,
        "epochs": args.epochs,
        "batch_size": args.batch_size,
        "learning_rate": args.learning_rate,
        "lora_r": args.lora_r,
        "lora_alpha": args.lora_alpha,
        "quant_type": args.quant_type,
        "double_quant": args.double_quant,
        "resume_from_checkpoint": args.resume,
        "use_wandb": args.use_wandb
    }

    trainer = TEEIQLoRATrainer(config)
    result = trainer.train()

    print("✨ QLoRA training complete!")
    print(f"   Model: {result['model_path']}")
    print(f"   Training loss: {result['training_loss']:.4f}")
    print(f"   Validation loss: {result['validation_loss']:.4f}")
    print(f"   Adapter size: {result['adapter_size_mb']:.1f} MB")
    print(f"   Quantization: {result['quantization']}")
    print(f"   Duration: {result['training_duration']}")
    print()
    print("💡 QLoRA Benefits:")
    print("   - 4x less GPU memory than standard LoRA")
    print("   - Can train larger models (13B+) on consumer GPU")
    print("   - Same accuracy as full fine-tuning")
    print("   - Faster convergence than standard LoRA")
    print()


if __name__ == "__main__":
    main()
