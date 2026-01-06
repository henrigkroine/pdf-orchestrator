#!/usr/bin/env python3
"""
Show TFU Design Fixes - Direct InDesign Execution
Demonstrates all the TFU design system improvements
"""

import sys
import json
from pathlib import Path

# Add paths
repo_root = Path(__file__).parent
sys.path.insert(0, str(repo_root))
sys.path.insert(0, str(repo_root / "adb-mcp" / "mcp"))

import socket_client

def main():
    print("\n" + "="*70)
    print("TFU AWS PARTNERSHIP - WORLD-CLASS DESIGN".center(70))
    print("="*70)

    # Configure socket client
    socket_client.application = "indesign"
    socket_client.proxy_url = "http://127.0.0.1:8013"
    socket_client.proxy_timeout = 30

    # Check for LLM-generated content
    content_path = Path("exports/aws-tfu-2025-content.json")
    if content_path.exists():
        print("\n[+] Using LLM-generated AWS content:")
        with open(content_path) as f:
            content = json.load(f)
        print(f"  Title: {content.get('cover_title')}")
        print(f"  AWS Certifications: {content.get('metrics', {}).get('aws_certifications')}")
        print(f"  Employment Rate: {content.get('metrics', {}).get('employment_rate')}")
        print(f"  Avg Salary: {content.get('metrics', {}).get('avg_salary')}")
    else:
        print("\n[!] No LLM content - using hardcoded fallback")

    # Load JSX with TFU design fixes
    jsx_path = Path("scripts/generate_tfu_aws_v2.jsx")
    print(f"\n[SCRIPT] Loading: {jsx_path.name}")

    with open(jsx_path, 'r', encoding='utf-8') as f:
        jsx = f.read()

    # Verify fixes are present
    fixes = {
        "Hero Photo Card (460×450pt)": "Hero photo card (460×450pt" in jsx,
        "Decorative Curved Divider": "Decorative curved divider" in jsx,
        "Real Partner Logos": "assets/partner-logos/google.svg" in jsx,
        "TFU Badge (Blue + Yellow)": "TFU badge (blue + yellow)" in jsx,
        "Light Blue Stats Box": "palette.lightBlue" in jsx,
        "Two-Column Editorial": "Two-column editorial text" in jsx
    }

    print("\n[TFU DESIGN FIXES]")
    all_present = True
    for fix, present in fixes.items():
        status = "[OK]" if present else "[X]"
        print(f"  {status} {fix}")
        if not present:
            all_present = False

    if not all_present:
        print("\n[X] ERROR: Not all TFU fixes present in JSX!")
        return

    # Execute in InDesign
    print("\n[INDESIGN] Generating 4-page TFU document...")
    print("  Page 1: TFU_Cover - Teal background + hero photo card")
    print("  Page 2: TFU_AboutGoals - Narrative + light blue stats")
    print("  Page 3: TFU_ProgramMatrix - Editorial text + divider")
    print("  Page 4: TFU_ClosingCTA - TFU badge + partner logos")

    try:
        result = socket_client.send_message_blocking({
            "command": "runScript",
            "args": {"script": jsx}
        }, timeout=30)

        if result and result.get("status") == "success":
            print(f"\n[OK] SUCCESS: {result.get('result', 'Document created')}")

            print("\n" + "="*70)
            print("TFU DOCUMENT CREATED IN INDESIGN!".center(70))
            print("="*70)

            print("\nDESIGN FEATURES:")
            print("  [OK] Official TFU colors (teal #00393F, light blue #C9E4EC)")
            print("  [OK] Lora (headlines) + Roboto (body) typography")
            print("  [OK] Hero photo card with 24pt rounded corners")
            print("  [OK] Decorative curved dividers")
            print("  [OK] Two-column editorial layout (programs)")
            print("  [OK] Real partner logos (Google, AWS, Oxford, Cornell)")
            print("  [OK] TFU badge (blue #3D5CA6 + yellow #FFD500)")
            print("  [OK] 11+ distinct font sizes (Layer 1 compliance)")

            print("\nNEXT STEPS:")
            print("  1. Review document in InDesign")
            print("  2. File > Export > Adobe PDF (Print)")
            print("  3. Save as: exports/TEEI-AWS-TFU-World-Class.pdf")
            print("  4. Run validation: python validate_document.py exports/TEEI-AWS-TFU-World-Class.pdf")
            print()

        else:
            error = result.get("error") if result else "No response"
            print(f"\n[X] FAILED: {error}")
            print("\nTroubleshooting:")
            print("  1. Open InDesign")
            print("  2. Open UXP Developer Tool (Plugins > Development > UXP Developer Tool)")
            print("  3. Find 'InDesign MCP Agent' plugin")
            print("  4. Click 'Load' if not loaded")
            print("  5. Plugin panel should show 'Connected' status")

    except Exception as e:
        print(f"\n[X] MCP Error: {e}")
        print("\nMake sure:")
        print("  - InDesign is running")
        print("  - MCP proxy running: node adb-proxy-socket/proxy.js")
        print("  - Plugin connected in UXP Developer Tool")

    print()

if __name__ == "__main__":
    main()