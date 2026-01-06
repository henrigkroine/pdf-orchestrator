#!/usr/bin/env python3
"""
Create the ACTUAL TEEI Partnership Document - Simple and Direct
"""

import sys
import os
from pathlib import Path

# Add adb-mcp/mcp to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

# Configuration
APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 60

def configure_connection():
    socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=PROXY_TIMEOUT)
    init(APPLICATION, socket_client)

def create_teei_partnership_doc():
    """Create TEEI partnership document with ExtendScript"""

    exports_dir = Path(__file__).parent / "exports"
    exports_dir.mkdir(exist_ok=True)

    pdf_path = str(exports_dir / "TEEI-AWS-Partnership.pdf")

    script = f"""
// Close any open documents
while (app.documents.length > 0) {{
    app.documents[0].close(SaveOptions.NO);
}}

// Create new document
var doc = app.documents.add();
doc.documentPreferences.pageWidth = "612pt";
doc.documentPreferences.pageHeight = "792pt";
doc.documentPreferences.pagesPerDocument = 3;
doc.documentPreferences.facingPages = false;

// Set margins
doc.marginPreferences.top = "40pt";
doc.marginPreferences.bottom = "40pt";
doc.marginPreferences.left = "40pt";
doc.marginPreferences.right = "40pt";

// Create TEEI Nordshore color
var nordshore = doc.colors.add();
nordshore.name = "TEEI_Nordshore";
nordshore.space = ColorSpace.RGB;
nordshore.colorValue = [0, 57, 63];
nordshore.model = ColorModel.PROCESS;

// PAGE 1 - Title
var page1 = doc.pages[0];
var titleFrame = page1.textFrames.add();
titleFrame.geometricBounds = [200, 40, 300, 572];
titleFrame.contents = "AWS Partnership Proposal\\rThe Educational Equality Institute";
titleFrame.paragraphs[0].pointSize = 36;
titleFrame.paragraphs[0].fillColor = nordshore;

// PAGE 2 - Content
var page2 = doc.pages[1];
var contentFrame = page2.textFrames.add();
contentFrame.geometricBounds = [100, 40, 692, 572];
contentFrame.contents = "Partnership Overview\\r\\rDigital Learning Platform\\rProviding cloud-based educational resources\\rStudents Reached: 35,000\\r\\rTeacher Training Initiative\\rEquipping educators with modern tools\\rStudents Reached: 10,000";

// PAGE 3 - Call to Action
var page3 = doc.pages[2];
var ctaFrame = page3.textFrames.add();
ctaFrame.geometricBounds = [250, 40, 500, 572];
ctaFrame.contents = "Join Us in Making a Difference\\r\\rContact: Sarah Johnson\\rEmail: sarah.johnson@teei.org";

// Export PDF
var pdfPath = "{pdf_path}".replace(/\\\\/g, "/");
var pdfFile = new File(pdfPath);
var preset = app.pdfExportPresets.item("[High Quality Print]");
doc.exportFile(ExportFormat.PDF_TYPE, pdfFile, false, preset);

"SUCCESS: TEEI Partnership PDF created at " + pdfPath;
"""

    print("\nCreating TEEI Partnership Document...")
    command = createCommand("executeExtendScript", {"code": script})
    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print(f"\n✓ SUCCESS!")
        print(f"   PDF: {pdf_path}")
        return True
    else:
        print(f"\n✗ FAILED: {response.get('message')}")
        return False

def main():
    print("="*70)
    print("CREATE TEEI PARTNERSHIP DOCUMENT")
    print("="*70)
    configure_connection()
    create_teei_partnership_doc()

if __name__ == "__main__":
    main()
