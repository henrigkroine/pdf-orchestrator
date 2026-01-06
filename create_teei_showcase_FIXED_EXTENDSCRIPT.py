#!/usr/bin/env python3
"""
TEEI Partnership Showcase - FIXED VERSION with ExtendScript for text colors
"""
import sys
import os
import io

# Fix Windows UTF-8 encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add MCP library to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

# Configure Socket.IO client
APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=10)
init(APPLICATION, socket_client)

def send_cmd(action, options=None):
    """Send command to InDesign via MCP client"""
    if options is None:
        options = {}

    print(f"→ {action}")
    cmd = createCommand(action, options)
    result = sendCommand(cmd)

    if result.get('status') != 'SUCCESS':
        raise RuntimeError(f"Error calling {action}: {result.get('message', 'Unknown error')}")

    print(f"✓ {action} SUCCESS")
    return result

# TEEI BRAND COLORS (RGB 0-255)
TEEI_BLUE = {"red": 0, "green": 123, "blue": 255}  # #007BFF
TEEI_GREEN = {"red": 40, "green": 167, "blue": 69}  # #28A745
WHITE = {"red": 255, "green": 255, "blue": 255}

print("=" * 70)
print("TEEI Partnership Showcase - ExtendScript Color Fix")
print("=" * 70)

# 1. Create document
print("\n[1/6] Creating document...")
result = send_cmd("createDocument", {
    "width": 595,
    "height": 842,
    "units": "px",
    "intent": "print"
})

# 2. Gradient header
print("\n[2/6] Creating gradient header...")
result = send_cmd("createGradientBox", {
    "page": 1,
    "x": 0,
    "y": 0,
    "width": 595,
    "height": 120,
    "startColor": TEEI_BLUE,
    "endColor": TEEI_GREEN,
    "angle": 135,
    "opacity": 1.0
})

# 3. Header title (NO COLOR/ALIGNMENT - will apply via ExtendScript)
print("\n[3/6] Creating header title...")
result = send_cmd("createTextFrameAdvanced", {
    "page": 1,
    "x": 72,
    "y": 40,
    "width": 451,
    "height": 40,
    "content": "TEEI Partnership Showcase",
    "fontSize": 32
})

# 4. Apply WHITE color + CENTER alignment to title using ExtendScript
print("\n[4/6] Applying WHITE color + center alignment to title via ExtendScript...")
extendscript_title_color = """
(function() {
    var doc = app.activeDocument;
    var page = doc.pages.item(0);
    var textFrames = page.textFrames.everyItem().getElements();

    // Find the title frame (first one created, largest font)
    var titleFrame = null;
    for (var i = 0; i < textFrames.length; i++) {
        if (textFrames[i].texts.item(0).pointSize == 32) {
            titleFrame = textFrames[i];
            break;
        }
    }

    if (!titleFrame) {
        return "ERROR: Title frame not found";
    }

    // Create WHITE color swatch
    var white = doc.colors.add({
        name: "TEEI_White_" + Date.now(),
        model: ColorModel.PROCESS,
        space: ColorSpace.RGB,
        colorValue: [1.0, 1.0, 1.0]  // White in 0-1 range
    });

    // Apply color and alignment to text
    titleFrame.texts.item(0).fillColor = white;
    titleFrame.paragraphs.item(0).justification = Justification.CENTER_ALIGN;

    return "SUCCESS: White color + center alignment applied to title";
})();
"""
result = send_cmd("executeExtendScript", {"code": extendscript_title_color})
print(f"  ExtendScript result: {result.get('data', {}).get('result', 'No result')}")

# 5. Subtitle (NO COLOR/ALIGNMENT - will apply via ExtendScript)
print("\n[5/6] Creating subtitle...")
result = send_cmd("createTextFrameAdvanced", {
    "page": 1,
    "x": 72,
    "y": 150,
    "width": 451,
    "height": 25,
    "content": "Premium Document Generation System",
    "fontSize": 16
})

# 6. Apply TEEI BLUE color + center alignment to subtitle using ExtendScript
print("\n[6/6] Applying TEEI BLUE color + center alignment to subtitle via ExtendScript...")
extendscript_subtitle_color = """
(function() {
    var doc = app.activeDocument;
    var page = doc.pages.item(0);
    var textFrames = page.textFrames.everyItem().getElements();

    // Find the subtitle frame (16pt font)
    var subtitleFrame = null;
    for (var i = 0; i < textFrames.length; i++) {
        if (textFrames[i].texts.item(0).pointSize == 16) {
            subtitleFrame = textFrames[i];
            break;
        }
    }

    if (!subtitleFrame) {
        return "ERROR: Subtitle frame not found";
    }

    // Create TEEI BLUE color swatch
    var teeiBlue = doc.colors.add({
        name: "TEEI_Blue_" + Date.now(),
        model: ColorModel.PROCESS,
        space: ColorSpace.RGB,
        colorValue: [0.0, 0.482, 1.0]  // #007BFF in 0-1 range
    });

    // Apply color and alignment to text
    subtitleFrame.texts.item(0).fillColor = teeiBlue;
    subtitleFrame.paragraphs.item(0).justification = Justification.CENTER_ALIGN;

    return "SUCCESS: TEEI Blue color + center alignment applied to subtitle";
})();
"""
result = send_cmd("executeExtendScript", {"code": extendscript_subtitle_color})
print(f"  ExtendScript result: {result.get('data', {}).get('result', 'No result')}")

print("\n" + "=" * 70)
print("✓ Document created with COLORED TEXT using ExtendScript!")
print("  Open InDesign to see: White title + TEEI Blue subtitle")
print("=" * 70)
