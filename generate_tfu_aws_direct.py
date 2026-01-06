#!/usr/bin/env python3
"""
Direct TFU AWS PDF Generation via InDesign MCP
Uses the certified scripts/generate_tfu_aws.jsx script
Bypasses orchestrator complexity for clean execution
"""

import sys
import os
import json
from pathlib import Path

# Add InDesign MCP modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))
from core import init, sendCommand, createCommand
import socket_client

MCP_URL = "http://localhost:8013"
APP_NAME = "indesign"

def main():
    print("=" * 70)
    print(" TFU AWS PARTNERSHIP - DIRECT MCP GENERATION")
    print("=" * 70)

    # Initialize MCP connection
    print(f"\n[1/4] Connecting to InDesign MCP at {MCP_URL}")
    socket_client.configure(app=APP_NAME, url=MCP_URL, timeout=60)
    init(APP_NAME, socket_client)
    print("[OK] Connected")

    # Read the certified TFU AWS JSX script
    print("\n[2/4] Loading certified TFU script: scripts/generate_tfu_aws.jsx")
    jsx_path = Path(__file__).parent / "scripts" / "generate_tfu_aws.jsx"

    if not jsx_path.exists():
        print(f"[ERROR] TFU script not found: {jsx_path}")
        sys.exit(1)

    with open(jsx_path, 'r', encoding='utf-8') as f:
        jsx_script = f.read()

    print(f"[OK] Loaded {len(jsx_script)} characters")

    # Execute TFU layout generation
    print("\n[3/4] Generating TFU 4-page layout in InDesign...")
    try:
        response = sendCommand(createCommand("executeExtendScript", {"code": jsx_script}))
        print("[OK] Layout generated successfully")
        print(f"     Response: {response.get('response', 'N/A')}")
    except Exception as e:
        print(f"[ERROR] Layout generation failed: {e}")
        sys.exit(1)

    # Export PDFs
    print("\n[4/4] Exporting PDFs...")

    # Export PRINT PDF (CMYK)
    print("  [a] Exporting PRINT PDF (CMYK, 300 DPI)...")
    export_script_print = '''
(function() {
    var doc = app.activeDocument;
    var printPath = "D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/TEEI-AWS-Partnership-TFU-PRINT.pdf";

    // PDF/X-4 preset for print
    var pdfPreset = app.pdfExportPresets.item("[PDF/X-4:2010]");
    if (!pdfPreset.isValid) {
        pdfPreset = app.pdfExportPresets.item("[High Quality Print]");
    }

    doc.exportFile(ExportFormat.PDF_TYPE, new File(printPath), false, pdfPreset);
    return "Print PDF exported to: " + printPath;
})();
'''
    try:
        response = sendCommand(createCommand("executeExtendScript", {"code": export_script_print}))
        print(f"      [OK] {response.get('response', 'Exported')}")
    except Exception as e:
        print(f"      [ERROR] Print PDF export failed: {e}")

    # Export DIGITAL PDF (RGB)
    print("  [b] Exporting DIGITAL PDF (RGB, 150 DPI)...")
    export_script_digital = '''
(function() {
    var doc = app.activeDocument;
    var digitalPath = "D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf";

    // High quality preset for digital
    var pdfPreset = app.pdfExportPresets.item("[High Quality Print]");

    doc.exportFile(ExportFormat.PDF_TYPE, new File(digitalPath), false, pdfPreset);
    return "Digital PDF exported to: " + digitalPath;
})();
'''
    try:
        response = sendCommand(createCommand("executeExtendScript", {"code": export_script_digital}))
        print(f"      [OK] {response.get('response', 'Exported')}")
    except Exception as e:
        print(f"      [ERROR] Digital PDF export failed: {e}")

    # Save INDD file
    print("  [c] Saving InDesign file...")
    save_script = '''
(function() {
    var doc = app.activeDocument;
    var inddPath = "D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/TEEI-AWS-Partnership-TFU.indd";
    doc.save(new File(inddPath));
    return "INDD saved to: " + inddPath;
})();
'''
    try:
        response = sendCommand(createCommand("executeExtendScript", {"code": save_script}))
        print(f"      [OK] {response.get('response', 'Saved')}")
    except Exception as e:
        print(f"      [ERROR] INDD save failed: {e}")

    print("\n" + "=" * 70)
    print(" GENERATION COMPLETE")
    print("=" * 70)
    print("\nOutput files:")
    print("  - exports/TEEI-AWS-Partnership-TFU.indd")
    print("  - exports/TEEI-AWS-Partnership-TFU-PRINT.pdf")
    print("  - exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf")
    print("\nNext step: Run QA validation")
    print("  python validate_document.py exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \\")
    print("    --job-config example-jobs/tfu-aws-partnership.json --strict")
    print()

if __name__ == "__main__":
    main()
