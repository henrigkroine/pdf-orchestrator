#!/usr/bin/env python3
"""
Simple script to export the current InDesign document as PDF
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand
import socket_client

def export_pdf():
    print("Exporting current InDesign document as PDF...")

    init("indesign", socket_client)

    # Export current document as PDF
    export_script = '''
var doc = app.activeDocument;
var exportPath = "D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/TEEI-AWS-Partnership.pdf";
var exportFile = new File(exportPath);

// Use High Quality Print preset
var preset = app.pdfExportPresets.item("[High Quality Print]");

// Export
doc.exportFile(ExportFormat.PDF_TYPE, exportFile, false, preset);

"SUCCESS: PDF exported to " + exportPath;
'''

    response = sendCommand({
        'application': 'indesign',
        'action': 'executeExtendScript',
        'options': {'code': export_script}
    })

    if response.get('status') == 'SUCCESS':
        print("SUCCESS: PDF exported to exports/TEEI-AWS-Partnership.pdf")
        return True
    else:
        print(f"FAILED: {response.get('message', 'Unknown error')}")
        return False

if __name__ == '__main__':
    try:
        export_pdf()
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
