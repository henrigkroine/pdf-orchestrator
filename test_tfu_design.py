#!/usr/bin/env python3
"""
Direct test of TFU design fixes in generate_tfu_aws_v2.jsx
Bypasses the full pipeline - just runs the JSX directly via MCP
"""

import sys
import json
from pathlib import Path

# Add repo root to path
repo_root = Path(__file__).parent
sys.path.insert(0, str(repo_root))

sys.path.insert(0, str(repo_root / "adb-mcp" / "mcp"))

from socket_client import SocketClient

def test_tfu_design():
    """Test the TFU design fixes directly"""

    print("\n" + "="*60)
    print("TFU DESIGN TEST - Direct JSX Execution")
    print("="*60)

    # 1. Check if content JSON exists (from autopilot)
    content_path = Path("exports/aws-tfu-2025-content.json")
    if content_path.exists():
        print(f"\n✓ Found LLM-generated content: {content_path}")
        with open(content_path) as f:
            content = json.load(f)
        print(f"  Title: {content.get('cover_title', 'N/A')}")
        print(f"  AWS Certs: {content.get('metrics', {}).get('aws_certifications', 'N/A')}")
        print(f"  Employment: {content.get('metrics', {}).get('employment_rate', 'N/A')}")
    else:
        print(f"\n⚠ No content JSON found at {content_path}")
        print("  JSX will use hardcoded fallback content")

    # 2. Connect to MCP
    print("\n[MCP] Connecting to InDesign...")
    try:
        client = SocketClient("indesign", host="127.0.0.1", port=8013)
        print("✓ MCP connection established")
    except Exception as e:
        print(f"✗ MCP connection failed: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure InDesign is running")
        print("2. Open UXP Developer Tool")
        print("3. Load the InDesign MCP Agent plugin")
        print("4. Click 'Connect' in the plugin panel")
        return

    # 3. Load the JSX script with TFU design fixes
    jsx_path = Path("scripts/generate_tfu_aws_v2.jsx")
    if not jsx_path.exists():
        print(f"\n✗ JSX script not found: {jsx_path}")
        return

    print(f"\n[JSX] Loading TFU script: {jsx_path}")
    with open(jsx_path, 'r', encoding='utf-8') as f:
        jsx_content = f.read()

    # Quick verification that our fixes are in place
    has_hero_card = "Hero photo card (460×450pt" in jsx_content
    has_divider = "Decorative curved divider" in jsx_content
    has_logo_files = "assets/partner-logos/google.svg" in jsx_content
    has_tfu_badge = "TFU badge (blue + yellow)" in jsx_content

    print("\n[VERIFICATION] TFU Design Fixes:")
    print(f"  ✓ Hero photo card on cover: {'YES' if has_hero_card else 'NO'}")
    print(f"  ✓ Decorative divider: {'YES' if has_divider else 'NO'}")
    print(f"  ✓ Real partner logos: {'YES' if has_logo_files else 'NO'}")
    print(f"  ✓ TFU badge: {'YES' if has_tfu_badge else 'NO'}")

    # 4. Execute the JSX
    print("\n[EXECUTE] Running TFU JSX in InDesign...")
    print("  Creating 4-page document:")
    print("    Page 1: TFU_Cover with hero photo card")
    print("    Page 2: TFU_AboutGoals with light blue stats")
    print("    Page 3: TFU_ProgramMatrix with divider")
    print("    Page 4: TFU_ClosingCTA with badge + logos")

    try:
        result = client.execute_script(jsx_content)
        print(f"\n✓ SUCCESS: {result}")

        # The JSX creates the document but doesn't export
        print("\n[DOCUMENT] Created in InDesign!")
        print("  Check InDesign for the 4-page TFU document")
        print("  - Teal backgrounds #00393F")
        print("  - Light blue stats box #C9E4EC")
        print("  - Hero photo card with rounded corners")
        print("  - Partner logos (Google, AWS, Oxford, Cornell)")
        print("  - TFU badge (blue + yellow)")

    except Exception as e:
        print(f"\n✗ Execution failed: {e}")
        return

    print("\n" + "="*60)
    print("TFU DESIGN TEST COMPLETE")
    print("="*60)
    print("\nNext steps:")
    print("1. Review the document in InDesign")
    print("2. Export as PDF (File > Export > Adobe PDF)")
    print("3. Run validation: python validate_document.py exports/TEEI-AWS-TFU.pdf")
    print()

if __name__ == "__main__":
    test_tfu_design()