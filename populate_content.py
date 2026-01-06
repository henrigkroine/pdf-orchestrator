#!/usr/bin/env python3
"""
TEEI AWS Partnership - Content Population Script
Executes ExtendScript to populate 3-page document with content

Usage:
    python populate_content.py
"""

import os
import sys
import json
import requests
from pathlib import Path

# MCP Bridge configuration
MCP_BRIDGE_URL = "http://localhost:8012"
EXTENDSCRIPT_FILE = "populate_aws_partnership_content.jsx"

def read_extendscript():
    """Read the ExtendScript file"""
    script_path = Path(__file__).parent / EXTENDSCRIPT_FILE

    if not script_path.exists():
        raise FileNotFoundError(f"ExtendScript file not found: {script_path}")

    with open(script_path, 'r', encoding='utf-8') as f:
        return f.read()

def execute_extendscript(script_code):
    """Execute ExtendScript via MCP bridge"""
    try:
        response = requests.post(
            f"{MCP_BRIDGE_URL}/execute",
            json={
                "tool": "executeExtendScript",
                "args": {
                    "scriptString": script_code
                }
            },
            timeout=60
        )

        response.raise_for_status()
        result = response.json()

        return result

    except requests.exceptions.ConnectionError:
        raise ConnectionError(
            f"Cannot connect to MCP bridge at {MCP_BRIDGE_URL}\n"
            "Please ensure:\n"
            "1. InDesign is running\n"
            "2. MCP bridge is running: python mcp-local/mcp_http_bridge.py\n"
            "3. InDesign MCP plugin is installed"
        )
    except requests.exceptions.Timeout:
        raise TimeoutError("ExtendScript execution timed out (60s)")
    except Exception as e:
        raise Exception(f"ExtendScript execution failed: {str(e)}")

def validate_document():
    """Check if InDesign document is open and has 3 pages"""
    try:
        response = requests.post(
            f"{MCP_BRIDGE_URL}/execute",
            json={
                "tool": "executeExtendScript",
                "args": {
                    "scriptString": """
                        if (app.documents.length === 0) {
                            return {error: "No document open"};
                        }
                        var doc = app.activeDocument;
                        return {
                            pages: doc.pages.length,
                            name: doc.name,
                            documentOK: doc.pages.length >= 3
                        };
                    """
                }
            },
            timeout=10
        )

        response.raise_for_status()
        result = response.json()

        return result

    except Exception as e:
        return {"error": str(e)}

def main():
    print("=" * 70)
    print("TEEI AWS Partnership - Content Population")
    print("=" * 70)
    print()

    # Step 1: Validate MCP bridge connection
    print("Step 1: Checking MCP bridge connection...")
    try:
        response = requests.get(f"{MCP_BRIDGE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ MCP bridge is running")
        else:
            print("❌ MCP bridge returned unexpected status")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Cannot connect to MCP bridge: {e}")
        print("\nPlease start the MCP bridge:")
        print("  python mcp-local/mcp_http_bridge.py")
        sys.exit(1)

    print()

    # Step 2: Validate InDesign document
    print("Step 2: Validating InDesign document...")
    doc_info = validate_document()

    if "error" in doc_info:
        print(f"❌ Document validation failed: {doc_info['error']}")
        print("\nPlease:")
        print("  1. Open InDesign")
        print("  2. Create a new document with 3 pages")
        print("  3. Run this script again")
        sys.exit(1)

    if not doc_info.get("documentOK", False):
        print(f"❌ Document needs 3 pages (found: {doc_info.get('pages', 0)})")
        print("\nPlease add pages to the document:")
        print("  Layout → Pages → Add Page")
        sys.exit(1)

    print(f"✅ Document ready: {doc_info.get('name', 'Unknown')} ({doc_info.get('pages', 0)} pages)")
    print()

    # Step 3: Read ExtendScript
    print("Step 3: Loading ExtendScript...")
    try:
        script_code = read_extendscript()
        print(f"✅ Loaded {EXTENDSCRIPT_FILE} ({len(script_code)} chars)")
    except Exception as e:
        print(f"❌ Failed to load ExtendScript: {e}")
        sys.exit(1)

    print()

    # Step 4: Execute ExtendScript
    print("Step 4: Populating document content...")
    print("This will create:")
    print("  • Page 1: Cover with title, logos, highlights")
    print("  • Page 2: Partnership vision and 3 programs")
    print("  • Page 3: Metrics, testimonials, CTA")
    print()

    try:
        result = execute_extendscript(script_code)

        if "error" in result:
            print(f"❌ ExtendScript error: {result['error']}")
            if "line" in result:
                print(f"   Line: {result['line']}")
            sys.exit(1)

        print("✅ Content population complete!")
        print()
        print("=" * 70)
        print("SUCCESS - Document populated with AWS partnership content")
        print("=" * 70)
        print()
        print("Next steps:")
        print("  1. Review layout and spacing in InDesign")
        print("  2. Replace logo placeholders with actual images:")
        print("     • assets/images/teei-logo-dark.png")
        print("     • assets/partner-logos/aws.svg")
        print("  3. Validate brand compliance:")
        print("     python validate_world_class.py")
        print("  4. Export PDF:")
        print("     python export_world_class_pdf.py")
        print()

    except Exception as e:
        print(f"❌ Execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
