#!/usr/bin/env python3
"""
Create World-Class TEEI Partnership Document - ExtendScript Version
Does EVERYTHING via ExtendScript since we know that works
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
PROXY_TIMEOUT = 30

# Page dimensions (US Letter)
PAGE_WIDTH = 612  # 8.5 inches × 72 pt/inch
PAGE_HEIGHT = 792  # 11 inches × 72 pt/inch
BLEED_MM = 3
BLEED_PT = BLEED_MM * 2.834645669

def configure_connection():
    """Configure Socket.IO connection to InDesign proxy"""
    socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=PROXY_TIMEOUT)
    init(APPLICATION, socket_client)
    print(f"[CONFIG] Connected to InDesign MCP at {PROXY_URL}")

def create_document_via_extendscript():
    """Create entire TEEI partnership document via ExtendScript"""
    print("\n" + "="*70)
    print("Creating TEEI Partnership Document via ExtendScript")
    print("="*70)

    # Build comprehensive ExtendScript
    extendscript = f"""
// =================================================================
// TEEI AWS Partnership Document - Complete ExtendScript
// =================================================================

// Create document
var doc = app.documents.add();
doc.documentPreferences.pageWidth = "{PAGE_WIDTH}pt";
doc.documentPreferences.pageHeight = "{PAGE_HEIGHT}pt";
doc.documentPreferences.pagesPerDocument = 3;
doc.documentPreferences.facingPages = false;

// Set margins
doc.marginPreferences.top = "40pt";
doc.marginPreferences.bottom = "40pt";
doc.marginPreferences.left = "40pt";
doc.marginPreferences.right = "40pt";
doc.marginPreferences.columnCount = 12;
doc.marginPreferences.columnGutter = "20pt";

// Set bleed
doc.documentPreferences.documentBleedTopOffset = "{BLEED_PT}pt";
doc.documentPreferences.documentBleedBottomOffset = "{BLEED_PT}pt";
doc.documentPreferences.documentBleedInsideOrLeftOffset = "{BLEED_PT}pt";
doc.documentPreferences.documentBleedOutsideOrRightOffset = "{BLEED_PT}pt";

// Create TEEI brand colors
function createColor(name, space, values) {{
    try {{
        var existingColor = doc.colors.item(name);
        if (!existingColor.isValid) {{
            var newColor = doc.colors.add();
            newColor.name = name;
            newColor.space = space;
            newColor.colorValue = values;
            newColor.model = ColorModel.PROCESS;
            return newColor;
        }}
        return existingColor;
    }} catch (e) {{
        return null;
    }}
}}

// TEEI Colors
var nordshoreRGB = createColor("TEEI_Nordshore", ColorSpace.RGB, [0, 57, 63]);
var skyRGB = createColor("TEEI_Sky", ColorSpace.RGB, [201, 228, 236]);
var sandRGB = createColor("TEEI_Sand", ColorSpace.RGB, [255, 241, 226]);

// PAGE 1: Cover Page
var page1 = doc.pages[0];

// Title text frame
var titleFrame = page1.textFrames.add();
titleFrame.geometricBounds = [200, 40, 300, 572];
titleFrame.contents = "AWS Partnership Proposal\\rThe Educational Equality Institute";
titleFrame.paragraphs[0].appliedFont = "Times New Roman\\tBold";
titleFrame.paragraphs[0].pointSize = 36;
titleFrame.paragraphs[0].fillColor = nordshoreRGB;

// Subtitle
var subtitleFrame = page1.textFrames.add();
subtitleFrame.geometricBounds = [320, 40, 380, 572];
subtitleFrame.contents = "Transforming Education Through Technology";
subtitleFrame.paragraphs[0].appliedFont = "Arial\\tRegular";
subtitleFrame.paragraphs[0].pointSize = 20;
subtitleFrame.paragraphs[0].fillColor = skyRGB;

// PAGE 2: Programs
var page2 = doc.pages[1];

var programsFrame = page2.textFrames.add();
programsFrame.geometricBounds = [100, 40, 692, 572];
programsFrame.textFramePreferences.textColumnCount = 2;
programsFrame.textFramePreferences.textColumnGutter = 20;
programsFrame.contents = "Our Partnership Programs\\r\\r" +
    "Digital Learning Platform\\r" +
    "Providing cloud-based educational resources to underserved communities.\\r" +
    "Students Reached: 35,000\\r" +
    "Success Rate: 89%\\r\\r" +
    "Teacher Training Initiative\\r" +
    "Equipping educators with modern teaching tools and methodologies.\\r" +
    "Students Reached: 10,000\\r" +
    "Success Rate: 92%\\r\\r" +
    "STEM Enrichment\\r" +
    "Advanced courses in science, technology, engineering, and mathematics.\\r" +
    "Students Reached: 5,000\\r" +
    "Success Rate: 95%";

// PAGE 3: Call to Action
var page3 = doc.pages[2];

var ctaFrame = page3.textFrames.add();
ctaFrame.geometricBounds = [250, 40, 500, 572];
ctaFrame.contents = "Join Us in Making a Difference\\r\\r" +
    "Partner with us to expand educational opportunities for students worldwide.\\r\\r" +
    "Contact: Sarah Johnson\\r" +
    "Email: sarah.johnson@teei.org";

// Save document
var savePath = "{Path(__file__).parent / 'exports' / 'TEEI-AWS-Partnership.indd'}".replace(/\\\\/g, "/");
var saveFile = new File(savePath);
doc.save(saveFile);

"Document created successfully";
"""

    command = createCommand("executeExtendScript", {"code": extendscript})
    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print(f"[OK] Document created successfully")
        print(f"    File: T:\\Projects\\pdf-orchestrator\\exports\\TEEI-AWS-Partnership.indd")
        return True
    else:
        print(f"[ERROR] Failed: {response.get('message')}")
        return False

def export_pdfs_via_extendscript():
    """Export both print and digital PDFs"""
    print("\n" + "="*70)
    print("Exporting PDFs")
    print("="*70)

    export_script = f"""
var doc = app.activeDocument;

// Export Print PDF (PDF/X-4)
var printPath = "{Path(__file__).parent / 'exports' / 'TEEI-AWS-Partnership-PRINT.pdf'}".replace(/\\\\/g, "/");
var printFile = new File(printPath);
var printPreset = app.pdfExportPresets.item("[PDF/X-4:2010]");
doc.exportFile(ExportFormat.PDF_TYPE, printFile, false, printPreset);

// Export Digital PDF (Smallest File Size)
var digitalPath = "{Path(__file__).parent / 'exports' / 'TEEI-AWS-Partnership-DIGITAL.pdf'}".replace(/\\\\/g, "/");
var digitalFile = new File(digitalPath);
var digitalPreset = app.pdfExportPresets.item("[Smallest File Size]");
doc.exportFile(ExportFormat.PDF_TYPE, digitalFile, false, digitalPreset);

"PDFs exported successfully";
"""

    command = createCommand("executeExtendScript", {"code": export_script})
    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        print(f"[OK] PDFs exported")
        print(f"    Print: TEEI-AWS-Partnership-PRINT.pdf")
        print(f"    Digital: TEEI-AWS-Partnership-DIGITAL.pdf")
        return True
    else:
        print(f"[ERROR] Export failed: {response.get('message')}")
        return False

def main():
    """Main execution"""
    print("\n" + "="*70)
    print("TEEI PARTNERSHIP DOCUMENT - EXTENDSCRIPT VERSION")
    print("="*70)

    # Ensure exports directory exists
    (Path(__file__).parent / "exports").mkdir(exist_ok=True)

    configure_connection()

    if not create_document_via_extendscript():
        print("\n[✗] FAILED: Could not create document")
        sys.exit(1)

    if not export_pdfs_via_extendscript():
        print("\n[✗] WARNING: PDF export failed")

    print("\n" + "="*70)
    print("SUCCESS")
    print("="*70)

if __name__ == "__main__":
    main()
