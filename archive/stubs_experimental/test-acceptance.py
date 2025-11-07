#!/usr/bin/env python3
"""
Acceptance tests for Adobe InDesign MCP Server
Tests all Core v1 functionality
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
PROXY_TIMEOUT = 30

socket_client.configure(
    app=APPLICATION,
    url=PROXY_URL,
    timeout=PROXY_TIMEOUT
)

init(APPLICATION, socket_client)

# Ensure export directory exists
export_dir = Path("T:/Projects/pdf-orchestrator/exports")
export_dir.mkdir(parents=True, exist_ok=True)

def test_create_document():
    """Test: Create A4 document (595x842pt, 4 pages)"""
    print("\n" + "="*60)
    print("TEST 1: Create Document (A4, 4 pages)")
    print("="*60)

    command = createCommand("createDocument", {
        "pageWidth": 595,
        "pageHeight": 842,
        "pagesPerDocument": 4,
        "pagesFacing": False,
        "margins": {"top": 36, "bottom": 36, "left": 36, "right": 36},
        "columns": {"count": 1, "gutter": 12},
        "name": "a4-test",
        "units": "pt"
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print("[OK] Document created successfully")
        print(f"  Document ID: {response.get('response', {}).get('documentId')}")
        return True
    else:
        print(f"[FAIL] Failed: {response.get('message')}")
        return False

def test_place_text():
    """Test: Place text with style"""
    print("\n" + "="*60)
    print("TEST 2: Place Text")
    print("="*60)

    command = createCommand("placeText", {
        "page": 1,
        "x": 40,
        "y": 80,
        "width": 500,
        "height": 200,
        "content": "Hello world - Adobe InDesign MCP Test",
        "style": None,  # Using None since "Body" style may not exist yet
        "overflow": "expand"
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print("[OK] Text placed successfully")
        data = response.get("response", {})
        print(f"  Frame ID: {data.get('id')}")
        print(f"  Bounds: {data.get('bounds')}")
        print(f"  Overflows: {data.get('overflows', False)}")
        return True
    else:
        print(f"[FAIL] Failed: {response.get('message')}")
        return False

def test_place_image():
    """Test: Place image"""
    print("\n" + "="*60)
    print("TEST 3: Place Image")
    print("="*60)

    # Check if test image exists
    test_image = Path("T:/Assets/logo.png")

    if not test_image.exists():
        print(f"[SKIP] Skipping: Test image not found at {test_image}")
        print("  Create a test image or update the path to test this feature")
        return None

    command = createCommand("placeImage", {
        "page": 1,
        "x": 40,
        "y": 300,
        "path": str(test_image),
        "fit": "proportionally",
        "width": 200,
        "height": None
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print("[OK] Image placed successfully")
        data = response.get("response", {})
        print(f"  Frame ID: {data.get('id')}")
        print(f"  Bounds: {data.get('bounds')}")
        return True
    else:
        print(f"[FAIL] Failed: {response.get('message')}")
        return False

def test_read_document_info():
    """Test: Read document info"""
    print("\n" + "="*60)
    print("TEST 4: Read Document Info")
    print("="*60)

    command = createCommand("readDocumentInfo", {})

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print("[OK] Document info retrieved successfully")
        data = response.get("response", {})
        print(f"  Name: {data.get('name')}")
        print(f"  Pages: {data.get('pages')}")
        print(f"  Page Size: {data.get('pageSize')}")
        print(f"  Styles: {len(data.get('styles', {}).get('paragraph', []))} paragraph, " +
              f"{len(data.get('styles', {}).get('character', []))} character")
        print(f"  Fonts: {len(data.get('fonts', []))} fonts used")
        print(f"  Links: {data.get('linksCount', 0)} linked files")
        return True
    else:
        print(f"[FAIL] Failed: {response.get('message')}")
        return False

def test_export_pdf():
    """Test: Export PDF/X-4 with bleed and marks"""
    print("\n" + "="*60)
    print("TEST 5: Export PDF/X-4")
    print("="*60)

    output_path = export_dir / "a4-test.pdf"

    command = createCommand("exportPDF", {
        "outputPath": str(output_path),
        "preset": "PDF/X-4",
        "useDocBleed": True,
        "includeMarks": True,
        "taggedPDF": False,
        "viewPDF": False
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print("[OK] PDF exported successfully")
        print(f"  Path: {output_path}")
        if output_path.exists():
            print(f"  File size: {output_path.stat().st_size / 1024:.1f} KB")
        return True
    else:
        print(f"[FAIL] Failed: {response.get('message')}")
        return False

def test_save_document():
    """Test: Save document"""
    print("\n" + "="*60)
    print("TEST 6: Save Document")
    print("="*60)

    save_path = export_dir / "a4-test.indd"

    command = createCommand("saveDocument", {
        "path": str(save_path),
        "overwrite": True
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print("[OK] Document saved successfully")
        print(f"  Path: {save_path}")
        if save_path.exists():
            print(f"  File size: {save_path.stat().st_size / 1024:.1f} KB")
        return True
    else:
        print(f"[FAIL] Failed: {response.get('message')}")
        return False

def test_ping():
    """Test: Ping"""
    print("\n" + "="*60)
    print("TEST 7: Ping")
    print("="*60)

    command = createCommand("ping", {})

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print("[OK] Ping successful")
        data = response.get("response", {})
        print(f"  Status: {data.get('status')}")
        print(f"  App: {data.get('app')}")
        print(f"  Version: {data.get('version')}")
        print(f"  Transport: {data.get('transport')}")
        return True
    else:
        print(f"[FAIL] Failed: {response.get('message')}")
        return False

def main():
    print("\n" + "="*60)
    print("ADOBE INDESIGN MCP - ACCEPTANCE TESTS")
    print("="*60)
    print("Testing Core v1 functionality\n")

    results = []

    # Run tests
    results.append(("Create Document", test_create_document()))
    results.append(("Place Text", test_place_text()))
    results.append(("Place Image", test_place_image()))
    results.append(("Read Document Info", test_read_document_info()))
    results.append(("Export PDF", test_export_pdf()))
    results.append(("Save Document", test_save_document()))
    results.append(("Ping", test_ping()))

    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    passed = sum(1 for _, result in results if result is True)
    failed = sum(1 for _, result in results if result is False)
    skipped = sum(1 for _, result in results if result is None)

    for name, result in results:
        if result is True:
            print(f"[OK] {name}")
        elif result is False:
            print(f"[FAIL] {name}")
        else:
            print(f"[SKIP] {name} (skipped)")

    print(f"\nPassed: {passed}/{len(results)}")
    if skipped > 0:
        print(f"Skipped: {skipped}/{len(results)}")
    if failed > 0:
        print(f"Failed: {failed}/{len(results)}")

    print("\n" + "="*60)

if __name__ == "__main__":
    main()
