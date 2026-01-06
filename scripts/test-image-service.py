#!/usr/bin/env python3
"""
Test Image Generation Service
Simple standalone test for image generation (local provider)
"""

import os
import sys
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.image_generation_service import ImageGenerationService


def main():
    print("=" * 60)
    print("IMAGE GENERATION SERVICE TEST")
    print("=" * 60)

    # Use local provider (no API keys needed)
    provider = 'local'
    output_dir = 'assets/images/tfu/aws'
    roles = ['cover_hero']

    print(f"\n[TEST] Creating image service with provider: {provider}")
    service = ImageGenerationService(
        provider=provider,
        output_dir=output_dir
    )

    if not service.enabled:
        print(f"\n[ERROR] {provider} provider not enabled")
        return 1

    print(f"[OK] {provider} provider enabled")
    print(f"  Output directory: {output_dir}")

    # Create minimal job config for testing
    job_config = {
        'output': {'filename_base': 'TEST'},
        'generation': {
            'imageGeneration': {
                'prompts': {
                    'cover_hero': 'Test prompt for cover hero image'
                },
                'size': '1792x1024',
                'quality': 'hd',
                'style': 'natural'
            }
        }
    }

    print(f"\n[TEST] Generating {len(roles)} test images...")

    try:
        manifest = service.generate_hero_images(job_config, roles)

        if manifest.get('status') == 'success':
            print(f"\n[OK] IMAGERY OK:")
            print(f"  Generated: {len(manifest['images'])} images")
            print(f"  Provider: {provider}")
            print(f"  Manifest: {manifest['manifest_path']}")

            for role, img_data in manifest['images'].items():
                print(f"  - {role}: {img_data.get('file', 'N/A')}")

            return 0
        else:
            print(f"\n[ERROR] IMAGERY FAILED: {manifest.get('message', 'Unknown error')}")
            return 1

    except Exception as e:
        print(f"\n[ERROR] IMAGERY ERROR: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
