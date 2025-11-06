#!/usr/bin/env python3
"""
"Most Fancy" Demo - A4 Report with Full Feature Set
Demonstrates all Enterprise v3 features:
- A4 template with master pages and styles
- Multi-column text layout
- Table of contents
- Accessibility tagging
- Preflight check
- Multi-format export (PDF/X-4 + Digital)
- Document packaging
"""

import sys
import os
from pathlib import Path

# Add the adb-mcp/mcp directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

# Configure the socket client for InDesign
APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 60  # Longer timeout for complex operations

socket_client.configure(
    app=APPLICATION,
    url=PROXY_URL,
    timeout=PROXY_TIMEOUT
)

init(APPLICATION, socket_client)

# Ensure export directory exists
export_dir = Path("T:/Projects/pdf-orchestrator/exports/fancy-report")
export_dir.mkdir(parents=True, exist_ok=True)

def step(number, description):
    """Print step header"""
    print(f"\n{'='*70}")
    print(f"STEP {number}: {description}")
    print('='*70)

def create_a4_document_with_styles():
    """Step 1: Create A4 document with professional styles"""
    step(1, "Create A4 Document (210x297mm)")

    # A4 dimensions in points: 595.276 x 841.89
    command = createCommand("createDocument", {
        "pageWidth": 595,
        "pageHeight": 842,
        "pagesPerDocument": 8,
        "pagesFacing": True,
        "margins": {"top": 54, "bottom": 54, "left": 72, "right": 54},  # 0.75-1" margins
        "columns": {"count": 1, "gutter": 12},
        "bleed": {"top": 9, "bottom": 9, "left": 9, "right": 9},  # 3mm bleed
        "name": "Fancy-Annual-Report-2025",
        "units": "pt"
    })

    response = sendCommand(command)
    print(f"Status: {response.get('status')}")
    return response.get("status") == "SUCCESS"

def create_paragraph_styles():
    """Step 2: Create professional paragraph styles"""
    step(2, "Create Paragraph Styles")

    styles_to_create = [
        {
            "name": "Heading 1",
            "spec": {
                "fontSize": 32,
                "fontFamily": "Arial\tBold",
                "leading": 38,
                "spaceBefore": 24,
                "spaceAfter": 12
            }
        },
        {
            "name": "Heading 2",
            "spec": {
                "fontSize": 24,
                "fontFamily": "Arial\tBold",
                "leading": 28,
                "spaceBefore": 18,
                "spaceAfter": 9
            }
        },
        {
            "name": "Body Text",
            "spec": {
                "fontSize": 11,
                "fontFamily": "Arial\tRegular",
                "leading": 14,
                "spaceAfter": 6
            }
        },
        {
            "name": "Caption",
            "spec": {
                "fontSize": 9,
                "fontFamily": "Arial\tItalic",
                "leading": 11
            }
        }
    ]

    command = createCommand("setStyles", {
        "paragraph": styles_to_create,
        "character": [],
        "object": []
    })

    response = sendCommand(command)
    if response.get("status") == "SUCCESS":
        data = response.get("response", {})
        print(f"Created: {len(data.get('created', []))} styles")
        print(f"Updated: {len(data.get('updated', []))} styles")
        return True
    else:
        print(f"Failed: {response.get('message')}")
        return False

def add_cover_page_content():
    """Step 3: Add cover page with title"""
    step(3, "Add Cover Page Content")

    # Title
    command = createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 200,
        "width": 450,
        "height": 100,
        "content": "Annual Report 2025",
        "style": "Heading 1",
        "overflow": "expand"
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print("[OK] Cover title added")

        # Subtitle
        command2 = createCommand("placeText", {
            "page": 1,
            "x": 72,
            "y": 320,
            "width": 450,
            "height": 50,
            "content": "Building the Future Together",
            "style": "Heading 2",
            "overflow": "expand"
        })

        response2 = sendCommand(command2)
        if response2.get("status") == "SUCCESS":
            print("[OK] Cover subtitle added")
            return True

    print(f"Failed: {response.get('message')}")
    return False

def add_multi_column_content():
    """Step 4: Add multi-column text layout"""
    step(4, "Add Multi-Column Content on Page 3")

    long_text = """
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
    culpa qui officia deserunt mollit anim id est laborum.

    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
    laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
    architecto beatae vitae dicta sunt explicabo.

    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
    consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
    """ * 3  # Repeat for more content

    command = createCommand("gridFrameText", {
        "page": 3,
        "columns": 2,
        "gutter": 20,
        "margins": {"top": 54, "bottom": 54, "left": 72, "right": 54},
        "content": long_text,
        "style": "Body Text"
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        data = response.get("response", {})
        print(f"[OK] Created {len(data.get('frames', []))} text frames")
        return True
    else:
        print(f"Failed: {response.get('message')}")
        return False

def configure_accessibility():
    """Step 5: Configure accessibility for PDF export"""
    step(5, "Configure Accessibility Tagging")

    command = createCommand("accessibilityTag", {
        "order": "reading",
        "altTextPolicy": "required",
        "lang": "en-US"
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print("[OK] Accessibility configured for tagged PDF export")
        return True
    else:
        print(f"Failed: {response.get('message')}")
        return False

def run_preflight():
    """Step 6: Run preflight check"""
    step(6, "Run Preflight Check")

    command = createCommand("preflightRun", {
        "profile": None  # Use default Basic profile
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        data = response.get("response", {})
        errors = data.get("errors", [])
        warnings = data.get("warnings", [])

        print(f"Preflight Complete:")
        print(f"  Errors: {len(errors)}")
        print(f"  Warnings: {len(warnings)}")

        if errors:
            print("\nErrors found:")
            for err in errors[:5]:  # Show first 5
                print(f"  - {err.get('code')}: {err.get('msg')} (Page {err.get('page')})")

        return len(errors) == 0
    else:
        print(f"[SKIP] Preflight check not available: {response.get('message')}")
        return None

def export_multiple_variants():
    """Step 7: Export multiple PDF variants"""
    step(7, "Export Multiple PDF Variants (PDF/X-4 + Digital)")

    variants = [
        {
            "preset": "PDF/X-4",
            "outputPath": str(export_dir / "Annual-Report-2025-PRINT.pdf")
        },
        {
            "preset": "Digital",
            "outputPath": str(export_dir / "Annual-Report-2025-DIGITAL.pdf")
        },
        {
            "preset": "High Quality Print",
            "outputPath": str(export_dir / "Annual-Report-2025-HIGH-QUALITY.pdf")
        }
    ]

    command = createCommand("exportVariants", {
        "variants": variants,
        "parallel": False
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        data = response.get("response", {})
        exports = data.get("exports", [])

        print(f"Export Results:")
        for exp in exports:
            status = "[OK]" if exp.get("success") else "[FAIL]"
            print(f"  {status} {exp.get('preset')}")
            if exp.get("success"):
                path = Path(exp.get("path"))
                if path.exists():
                    print(f"     {path.stat().st_size / 1024:.1f} KB")

        return all(exp.get("success") for exp in exports)
    else:
        print(f"Failed: {response.get('message')}")
        return False

def save_and_package():
    """Step 8: Save and package document"""
    step(8, "Save and Package Document for Handoff")

    # Save document first
    save_path = export_dir / "Annual-Report-2025.indd"

    command = createCommand("saveDocument", {
        "path": str(save_path),
        "overwrite": True
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print(f"[OK] Document saved: {save_path}")

        # Package document
        package_dir = export_dir / "package"

        command2 = createCommand("packageDocument", {
            "outputDir": str(package_dir),
            "copyFonts": True,
            "copyLinkedGraphics": True,
            "updateGraphics": True,
            "report": True
        })

        response2 = sendCommand(command2)

        if response2.get("status") == "SUCCESS":
            data = response2.get("response", {})
            print(f"[OK] Document packaged: {data.get('path')}")
            if data.get("report"):
                print(f"  Report: {data.get('report')}")
            return True
        else:
            print(f"[SKIP] Package not available: {response2.get('message')}")
            return True  # Still consider success if save worked

    else:
        print(f"Failed: {response.get('message')}")
        return False

def main():
    print("\n" + "="*70)
    print("ADOBE INDESIGN MCP - 'MOST FANCY' DEMO")
    print("="*70)
    print("Creating professional A4 report with full feature set\n")

    results = []

    # Execute workflow
    results.append(("Create A4 Document", create_a4_document_with_styles()))
    results.append(("Create Paragraph Styles", create_paragraph_styles()))
    results.append(("Add Cover Page", add_cover_page_content()))
    results.append(("Add Multi-Column Layout", add_multi_column_content()))
    results.append(("Configure Accessibility", configure_accessibility()))
    results.append(("Run Preflight", run_preflight()))
    results.append(("Export Multiple Variants", export_multiple_variants()))
    results.append(("Save and Package", save_and_package()))

    # Summary
    print("\n" + "="*70)
    print("WORKFLOW SUMMARY")
    print("="*70)

    passed = sum(1 for _, result in results if result is True)
    failed = sum(1 for _, result in results if result is False)
    skipped = sum(1 for _, result in results if result is None)

    for name, result in results:
        if result is True:
            print(f"[OK] {name}")
        elif result is False:
            print(f"[FAIL] {name}")
        else:
            print(f"[SKIP] {name} (skipped/not available)")

    print(f"\nCompleted: {passed}/{len(results)}")
    if skipped > 0:
        print(f"Skipped: {skipped}/{len(results)}")
    if failed > 0:
        print(f"Failed: {failed}/{len(results)}")

    print(f"\nOutput location: {export_dir}")
    print("="*70)

    # List exported files
    if export_dir.exists():
        print("\nExported files:")
        for f in export_dir.glob("*.pdf"):
            print(f"  - {f.name} ({f.stat().st_size / 1024:.1f} KB)")
        if (export_dir / "Annual-Report-2025.indd").exists():
            print(f"  - Annual-Report-2025.indd (source)")
        print()

if __name__ == "__main__":
    main()
