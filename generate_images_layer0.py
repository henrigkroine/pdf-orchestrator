#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Layer 0: Image Generation (Asset Preparation)

This script runs BEFORE InDesign document creation to generate
AI images for TEEI partnership documents.

Integrates with Node.js image generation pipeline.
"""

import os
import sys
import json
import subprocess
import time
from pathlib import Path

def generate_images_for_job(job_config_path: str) -> dict:
    """
    Generate images for job using Node.js orchestrator

    Args:
        job_config_path: Path to job JSON config

    Returns:
        dict: Generation results
    """

    print("\n" + "="*60)
    print("LAYER 0: IMAGE GENERATION (Asset Preparation)")
    print("="*60 + "\n")

    # Check if job config exists
    if not os.path.exists(job_config_path):
        print(f"❌ Job config not found: {job_config_path}")
        return {"success": False, "error": "Job config not found"}

    # Load job config
    with open(job_config_path, 'r', encoding='utf-8') as f:
        job_config = json.load(f)

    # Check if image generation is enabled
    image_gen_config = job_config.get('imageGeneration', {})
    if not image_gen_config.get('enabled', False):
        print("ℹ️  Image generation disabled in job config")
        print("   Skipping Layer 0 asset preparation")
        return {"success": True, "skipped": True}

    # Check for dry run mode
    dry_run = image_gen_config.get('dryRun', False)
    if dry_run:
        print("⚠️  DRY RUN MODE: Placeholder images will be generated")
    else:
        print("🎨 LIVE MODE: Real AI images will be generated")

        # Check for API key
        if not os.getenv('OPENAI_API_KEY'):
            print("❌ OPENAI_API_KEY not set in environment")
            print("   Set API key in config/.env or enable dryRun mode")
            return {"success": False, "error": "API key not configured"}

    # Run Node.js image generation orchestrator
    print(f"\n📋 Job: {job_config.get('jobId', 'unknown')}")
    print(f"🔧 Provider: {image_gen_config.get('provider', 'dalle3')}")
    print(f"💎 Quality: {image_gen_config.get('quality', 'standard')}")

    # Check for image slots
    ai_slots = job_config.get('data', {}).get('aiImageSlots', {})
    if not ai_slots:
        print("⚠️  No aiImageSlots defined in job config")
        print("   Example:")
        print('   "data": {')
        print('     "aiImageSlots": {')
        print('       "hero": "Diverse Ukrainian students collaborating...",')
        print('       "program_1": "Students in hands-on training..."')
        print('     }')
        print('   }')
        return {"success": True, "images": []}

    print(f"\n🖼️  Image slots to generate: {len(ai_slots)}")
    for slot_name in ai_slots.keys():
        print(f"   • {slot_name}")

    # Prepare Node.js script
    script_path = os.path.join(
        os.path.dirname(__file__),
        'ai',
        'image-generation',
        'run-image-generation.js'
    )

    # If script doesn't exist, create it
    if not os.path.exists(script_path):
        create_runner_script(script_path)

    # Run image generation
    print(f"\n▶️  Starting image generation...")
    start_time = time.time()

    try:
        result = subprocess.run(
            ['node', script_path, job_config_path],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes max
        )

        duration = time.time() - start_time

        if result.returncode == 0:
            print(f"✅ Image generation complete in {duration:.2f}s")

            # Parse results
            try:
                # Find results file
                job_id = job_config.get('jobId', 'unknown')
                results_dir = 'reports/image-generation'

                if os.path.exists(results_dir):
                    # Find latest results file for this job
                    results_files = [
                        f for f in os.listdir(results_dir)
                        if f.startswith(job_id) and f.endswith('.json')
                    ]

                    if results_files:
                        latest_result = max(results_files, key=lambda f:
                            os.path.getmtime(os.path.join(results_dir, f)))

                        results_path = os.path.join(results_dir, latest_result)

                        with open(results_path, 'r', encoding='utf-8') as f:
                            results_data = json.load(f)

                        print(f"\n📊 Generation Statistics:")
                        print(f"   Generated: {results_data['stats']['generated']}")
                        print(f"   Cached: {results_data['stats']['cached']}")
                        print(f"   Failed: {results_data['stats']['failed']}")
                        print(f"   Total Cost: ${results_data['stats']['totalCost']:.3f}")

                        return {
                            "success": True,
                            "results": results_data,
                            "duration": duration
                        }

            except Exception as e:
                print(f"⚠️  Could not parse results: {e}")

            return {"success": True, "duration": duration}

        else:
            print(f"❌ Image generation failed (exit {result.returncode})")
            print(result.stdout)
            print(result.stderr)
            return {"success": False, "error": result.stderr}

    except subprocess.TimeoutExpired:
        print("❌ Image generation timed out (>5 minutes)")
        return {"success": False, "error": "Timeout"}

    except Exception as e:
        print(f"❌ Image generation error: {str(e)}")
        return {"success": False, "error": str(e)}


def create_runner_script(script_path: str):
    """Create Node.js runner script if it doesn't exist"""

    os.makedirs(os.path.dirname(script_path), exist_ok=True)

    script_content = """#!/usr/bin/env node
/**
 * Image Generation Runner
 * CLI wrapper for ImageGenerationOrchestrator
 */

const fs = require('fs');
const path = require('path');
const ImageGenerationOrchestrator = require('./imageGenerationOrchestrator');

async function main() {
  const jobConfigPath = process.argv[2];

  if (!jobConfigPath) {
    console.error('Usage: node run-image-generation.js <job-config.json>');
    process.exit(1);
  }

  if (!fs.existsSync(jobConfigPath)) {
    console.error(`Job config not found: ${jobConfigPath}`);
    process.exit(1);
  }

  // Load job config
  const jobConfig = JSON.parse(fs.readFileSync(jobConfigPath, 'utf-8'));

  // Create orchestrator
  const orchestrator = new ImageGenerationOrchestrator(jobConfig);

  // Generate images
  try {
    const results = await orchestrator.generateImagesForJob();

    // Update job config with generated image paths
    await orchestrator.updateJobConfig(jobConfigPath);

    console.log('\\n✓ Image generation complete');
    process.exit(0);

  } catch (error) {
    console.error(`\\n✗ Image generation failed: ${error.message}`);
    process.exit(1);
  }
}

main();
"""

    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script_content)

    print(f"✓ Created runner script: {script_path}")


def main():
    """Main entry point"""

    if len(sys.argv) < 2:
        print("Usage: python generate_images_layer0.py <job-config.json>")
        sys.exit(1)

    job_config_path = sys.argv[1]
    result = generate_images_for_job(job_config_path)

    if result.get("success"):
        print("\n" + "="*60)
        print("✅ LAYER 0 COMPLETE: Images prepared for document generation")
        print("="*60 + "\n")
        sys.exit(0)
    else:
        print("\n" + "="*60)
        print("❌ LAYER 0 FAILED: Image generation unsuccessful")
        print("="*60 + "\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
