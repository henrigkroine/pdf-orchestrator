#!/usr/bin/env python3
"""
Test Figma Service
Simple standalone test for Figma design token sync
"""

import os
import sys
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.figma_service import FigmaService


def main():
    print("=" * 60)
    print("FIGMA SERVICE TEST")
    print("=" * 60)

    # Load job config
    job_config_path = 'example-jobs/tfu-aws-partnership-v2.json'

    if not os.path.exists(job_config_path):
        print(f"\n[ERROR] Job config not found: {job_config_path}")
        return 1

    with open(job_config_path, 'r') as f:
        job_config = json.load(f)

    # Get Figma config
    figma_cfg = job_config.get('providers', {}).get('figma', {})

    if not figma_cfg.get('enabled', False):
        print("\n[INFO] FIGMA DISABLED in job config (expected for local/dev)")
        print("  This is normal - Figma requires:")
        print("  1. Figma file ID")
        print("  2. FIGMA_PERSONAL_ACCESS_TOKEN env var")
        print("\n  To enable:")
        print("  - Set providers.figma.enabled=true in job config")
        print("  - Add your Figma file ID")
        print("  - Set FIGMA_PERSONAL_ACCESS_TOKEN environment variable")
        return 0

    file_id = figma_cfg.get('fileId', '')

    if not file_id or file_id == 'REPLACE_WITH_FIGMA_FILE_ID':
        print("\n[INFO] FIGMA DISABLED: missing file ID (expected for local/dev)")
        print("  Set a valid Figma file ID in job config to enable")
        return 0

    # Test service
    print(f"\n[TEST] Creating Figma service with file ID: {file_id[:20]}...")
    service = FigmaService(file_id=file_id)

    if not service.enabled:
        print("\n[INFO] FIGMA DISABLED: missing token (this is expected in local/dev)")
        print("  Reason: FIGMA_PERSONAL_ACCESS_TOKEN not set")
        print("\n  To enable:")
        print("  1. Get Personal Access Token from Figma")
        print("  2. Set environment variable: FIGMA_PERSONAL_ACCESS_TOKEN=your_token")
        return 0

    # If we get here, token is present - try to fetch
    print(f"\n[TEST] Fetching design tokens...")

    try:
        tokens = service.fetch_design_tokens()

        if tokens.get('status') == 'success':
            print(f"\n[OK] FIGMA OK:")
            print(f"  Colors: {len(tokens.get('colors', []))}")
            print(f"  Text styles: {len(tokens.get('typography', []))}")
            print(f"  Tokens written to: design-tokens/teei-figma-tokens.json")
            return 0
        else:
            print(f"\n[WARN] FIGMA WARNING: {tokens.get('message', 'Unknown error')}")
            return 0

    except Exception as e:
        print(f"\n[ERROR] FIGMA ERROR: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
