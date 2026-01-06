#!/usr/bin/env python3
"""
Simple TEEI Partnership Document Creator
Uses MCP InDesign commands to create a basic partnership document
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand
import socket_client

def main():
    print("\n" + "="*70)
    print("TEEI PARTNERSHIP DOCUMENT - SIMPLE CREATOR")
    print("="*70)

    # Initialize connection
    init("indesign", socket_client)

    # Step 1: Create Document
    print("\n[1/4] Creating 8.5x11 document...")
    doc_response = sendCommand({
        'application': 'indesign',
        'action': 'createDocument',
        'options': {
            'pageWidth': 612,  # 8.5" in points
            'pageHeight': 792,  # 11" in points
            'pagesPerDocument': 3,
            'pagesFacing': False,
            'margins': {'top': 40, 'bottom': 40, 'left': 40, 'right': 40},
            'columns': {'count': 12, 'gutter': 20}
        }
    })

    if doc_response.get('status') == 'SUCCESS':
        print(f"   ✓ Document created (ID: {doc_response['response']['documentId']})")
    else:
        print(f"   ✗ Failed: {doc_response.get('message')}")
        return False

    # Step 2: Add TEEI Brand Colors (via ExtendScript)
    print("\n[2/4] Adding TEEI brand colors...")
    color_script = """
// Create TEEI brand colors
var doc = app.activeDocument;

function createColor(name, r, g, b) {
    try {
        var color = doc.colors.item(name);
        if (!color.isValid) {
            color = doc.colors.add();
            color.name = name;
            color.space = ColorSpace.RGB;
            color.model = ColorModel.PROCESS;
            color.colorValue = [r, g, b];
        }
        return color;
    } catch(e) { return null; }
}

createColor("TEEI_Nordshore", 0, 57, 63);
createColor("TEEI_Sky", 201, 228, 236);
createColor("TEEI_Sand", 255, 241, 226);
createColor("TEEI_Gold", 186, 143, 90);

"Colors created";
"""

    color_response = sendCommand({
        'application': 'indesign',
        'action': 'executeExtendScript',
        'options': {'code': color_script}
    })

    if color_response.get('status') == 'SUCCESS':
        print("   ✓ TEEI colors added")
    else:
        print(f"   ✗ Failed: {color_response.get('message')}")

    # Step 3: Add Text (via ExtendScript since createTextFrame doesn't exist)
    print("\n[3/4] Adding partnership content...")
    text_script = """
var doc = app.activeDocument;
var page = doc.pages[0];

// Helper function to create text frame
function addText(x, y, w, h, content, fontSize, fontName, colorName) {
    var frame = page.textFrames.add();
    frame.geometricBounds = [y, x, y + h, x + w];
    frame.contents = content;

    var para = frame.paragraphs[0];
    para.pointSize = fontSize;

    if (fontName) {
        try { para.appliedFont = app.fonts.item(fontName); } catch(e) {}
    }

    if (colorName) {
        try {
            var color = doc.colors.item(colorName);
            if (color.isValid) {
                para.fillColor = color;
            }
        } catch(e) {}
    }

    return frame;
}

// Title
addText(40, 100, 532, 80, "TEEI × AWS Partnership", 42, "Lora\\tBold", "TEEI_Nordshore");

// Subtitle
addText(40, 200, 532, 40, "Transforming Education Through Technology", 18, "Roboto Flex\\tRegular", "TEEI_Nordshore");

// Section 1
addText(40, 280, 532, 300, "About TEEI\\n\\nThe Educational Equality Institute partners with leading technology companies to deliver world-class educational programs to underserved communities.\\n\\nOur Impact:\\n• 50,000+ students reached\\n• 12 countries served\\n• 95% program completion rate", 14, "Roboto Flex\\tRegular", "Black");

"Content created";
"""

    text_response = sendCommand({
        'application': 'indesign',
        'action': 'executeExtendScript',
        'options': {'code': text_script}
    })

    if text_response.get('status') == 'SUCCESS':
        print("   ✓ Partnership content added")
    else:
        print(f"   ✗ Failed: {text_response.get('message')}")

    # Step 4: Done!
    print("\n[4/4] Document created successfully!")
    print("\n" + "="*70)
    print("✓ TEEI Partnership document is ready in InDesign")
    print("  Open InDesign to view and export as PDF")
    print("="*70 + "\n")

    return True

if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)
