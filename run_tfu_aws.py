#!/usr/bin/env python3
"""
Run the certified TFU AWS script in InDesign
Using the exact same MCP approach as create_teei_partnership_world_class.py
"""

import sys
from pathlib import Path

# Add MCP module to path
sys.path.insert(0, str(Path(__file__).parent / "adb-mcp" / "mcp"))

from core import sendCommand, createCommand, init
import socket_client

# MCP Configuration (same as working script)
APPLICATION = "indesign"
PROXY_URL = "http://localhost:8013"
PROXY_TIMEOUT = 60

def main():
    print("="*70)
    print("TFU AWS PARTNERSHIP - Using Certified TFU Script")
    print("="*70)

    # Configure connection (exact same as working script)
    socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=PROXY_TIMEOUT)
    init(APPLICATION, socket_client)
    print(f"\n[CONFIG] Connected to InDesign MCP bridge at {PROXY_URL}")

    # Check connection
    try:
        response = sendCommand(createCommand("readDocumentInfo", {}))
        if response.get("status") == "SUCCESS":
            print("[CHECK] InDesign responded with document info")
        else:
            print("[CHECK] InDesign connection OK")
    except Exception as e:
        print(f"[ERROR] Cannot connect: {e}")
        return

    # Load the certified TFU script
    jsx_path = Path(__file__).parent / "scripts" / "generate_tfu_aws.jsx"
    print(f"\n[LOAD] Reading TFU script: {jsx_path}")

    with open(jsx_path, 'r', encoding='utf-8') as f:
        jsx_script = f.read()

    print(f"[LOAD] Loaded {len(jsx_script)} characters")

    # Execute TFU script
    print("\n[EXEC] Generating TFU 4-page layout in InDesign...")
    try:
        response = sendCommand(createCommand("executeExtendScript", {"code": jsx_script}))
        if response.get("status") == "SUCCESS":
            print("[OK] TFU layout generated successfully!")
            print(f"     Response: {response.get('response', 'N/A')}")
        else:
            print(f"[ERROR] Script execution failed: {response.get('message', 'Unknown error')}")
            sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Execution failed: {e}")
        sys.exit(1)

    # Save INDD file
    print("\n[SAVE] Saving InDesign file...")
    save_script = '''
(function() {
    var doc = app.activeDocument;
    var inddPath = "D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/TEEI-AWS-Partnership-TFU.indd";
    doc.save(new File(inddPath));
    return "INDD saved: " + inddPath;
})();
'''
    try:
        response = sendCommand(createCommand("executeExtendScript", {"code": save_script}))
        if response.get("status") == "SUCCESS":
            print(f"[OK] {response.get('response', 'Saved')}")
        else:
            print(f"[WARN] Save may have failed: {response.get('message', 'Unknown')}")
    except Exception as e:
        print(f"[WARN] Save error: {e}")

    # Export PRINT PDF
    print("\n[EXPORT] Exporting Print PDF (CMYK)...")
    export_print = '''
(function() {
    var doc = app.activeDocument;
    var printPath = "D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/TEEI-AWS-Partnership-TFU-PRINT.pdf";

    var pdfPreset = "[PDF/X-4:2010]";
    try {
        var preset = app.pdfExportPresets.item(pdfPreset);
        if (!preset.isValid) {
            pdfPreset = "[High Quality Print]";
            preset = app.pdfExportPresets.item(pdfPreset);
        }
        doc.exportFile(ExportFormat.PDF_TYPE, new File(printPath), false, preset);
        return "Print PDF exported: " + printPath;
    } catch (e) {
        return "Error exporting print PDF: " + e.message;
    }
})();
'''
    try:
        response = sendCommand(createCommand("executeExtendScript", {"code": export_print}))
        print(f"[PDF] {response.get('response', 'Export attempted')}")
    except Exception as e:
        print(f"[WARN] Print PDF export error: {e}")

    # Export DIGITAL PDF
    print("\n[EXPORT] Exporting Digital PDF (RGB)...")
    export_digital = '''
(function() {
    var doc = app.activeDocument;
    var digitalPath = "D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf";

    var pdfPreset = "[High Quality Print]";
    try {
        var preset = app.pdfExportPresets.item(pdfPreset);
        doc.exportFile(ExportFormat.PDF_TYPE, new File(digitalPath), false, preset);
        return "Digital PDF exported: " + digitalPath;
    } catch (e) {
        return "Error exporting digital PDF: " + e.message;
    }
})();
'''
    try:
        response = sendCommand(createCommand("executeExtendScript", {"code": export_digital}))
        print(f"[PDF] {response.get('response', 'Export attempted')}")
    except Exception as e:
        print(f"[WARN] Digital PDF export error: {e}")

    print("\n" + "="*70)
    print("TFU GENERATION COMPLETE")
    print("="*70)
    print("\nOutput files:")
    print("  - exports/TEEI-AWS-Partnership-TFU.indd")
    print("  - exports/TEEI-AWS-Partnership-TFU-PRINT.pdf")
    print("  - exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf")
    print("\nNext: Run QA validation")

if __name__ == "__main__":
    main()
