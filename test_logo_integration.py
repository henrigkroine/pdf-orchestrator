#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quick test script to verify logo integration in the TEEI partnership document.
Tests logo file existence and path resolution before running the full pipeline.
"""

import os
import sys
from pathlib import Path

# Ensure UTF-8 output for Unicode characters (checkmarks)
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = Path(__file__).parent

def test_logo_files():
    """Verify all required logo files exist."""
    print("=" * 70)
    print("LOGO INTEGRATION TEST")
    print("=" * 70)

    teei_logo_white = ROOT_DIR / "assets" / "images" / "teei-logo-white.png"
    teei_logo_dark = ROOT_DIR / "assets" / "images" / "teei-logo-dark.png"
    aws_logo = ROOT_DIR / "assets" / "partner-logos" / "aws.svg"

    tests = [
        ("TEEI Logo (White)", teei_logo_white),
        ("TEEI Logo (Dark)", teei_logo_dark),
        ("AWS Logo (SVG)", aws_logo)
    ]

    all_passed = True
    for name, path in tests:
        exists = path.exists()
        status = "✓" if exists else "✗"
        print(f"{status} {name}: {path}")
        if exists:
            size_kb = path.stat().st_size / 1024
            print(f"  Size: {size_kb:.2f} KB")
            print(f"  Absolute: {path.resolve().as_posix()}")
        else:
            all_passed = False

    print("=" * 70)
    if all_passed:
        print("✓ All logo files found!")
        print("\nReady to run: python create_teei_partnership_world_class.py")
    else:
        print("✗ Some logo files are missing!")
        print("\nPlease verify logo files before running the pipeline.")
    print("=" * 70)

    return all_passed

if __name__ == "__main__":
    test_logo_files()
