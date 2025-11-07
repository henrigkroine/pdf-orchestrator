#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FIX BLACK SECTIONS IN INDESIGN DOCUMENT
This will properly apply colors using a more robust method
"""

import sys
import os
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

def cmd(action, options):
    response = sendCommand(createCommand(action, options))
    return response

print("\n" + "="*80)
print("FIXING BLACK SECTIONS - PROPER COLOR APPLICATION")
print("="*80)

# Apply colors using a MORE COMPREHENSIVE ExtendScript approach
extendscript_fix = """
// Get the active document
var doc = app.activeDocument;

// STEP 1: Delete existing problem swatches and recreate
try {
    // Remove existing TEEI colors if they exist
    var existingColors = ['TEEI_Teal', 'TEEI_Gold', 'TEEI_LightBg', 'RGB_0_57_63'];
    for (var i = 0; i < existingColors.length; i++) {
        try {
            var oldColor = doc.colors.itemByName(existingColors[i]);
            if (oldColor.isValid) {
                oldColor.remove();
            }
        } catch(e) {}
    }
} catch(e) {}

// STEP 2: Create fresh color swatches
var teeiTeal = doc.colors.add();
teeiTeal.name = "TEEI_Teal";
teeiTeal.model = ColorModel.PROCESS;
teeiTeal.space = ColorSpace.RGB;
teeiTeal.colorValue = [0, 57, 63];

var teeiGold = doc.colors.add();
teeiGold.name = "TEEI_Gold";
teeiGold.model = ColorModel.PROCESS;
teeiGold.space = ColorSpace.RGB;
teeiGold.colorValue = [186, 143, 90];

var lightBg = doc.colors.add();
lightBg.name = "TEEI_Light";
lightBg.model = ColorModel.PROCESS;
lightBg.space = ColorSpace.RGB;
lightBg.colorValue = [248, 250, 252];

// Also create darker teal for gradient
var darkTeal = doc.colors.add();
darkTeal.name = "TEEI_DarkTeal";
darkTeal.model = ColorModel.PROCESS;
darkTeal.space = ColorSpace.RGB;
darkTeal.colorValue = [0, 47, 53];

// Get Paper and None swatches
var paperColor = doc.swatches.item("Paper");
var noStroke = doc.swatches.item("None");

// STEP 3: Apply colors to ALL rectangles on page 1
var page1 = doc.pages[0];
var rectangles = page1.rectangles.everyItem().getElements();

for (var i = 0; i < rectangles.length; i++) {
    var rect = rectangles[i];
    var bounds = rect.geometricBounds; // [y1, x1, y2, x2]
    var yPos = bounds[0];
    var height = bounds[2] - bounds[0];
    var width = bounds[3] - bounds[1];

    // Large header rectangle (top of page, full width)
    if (yPos < 100 && width > 500) {
        rect.fillColor = teeiTeal;
        rect.strokeColor = noStroke;
        rect.strokeWeight = 0;
    }
    // Gradient overlay rectangle (y around 100)
    else if (yPos >= 100 && yPos < 150 && width > 500) {
        rect.fillColor = darkTeal;
        rect.strokeColor = noStroke;
        rect.strokeWeight = 0;
    }
    // Logo placeholder (small box in header)
    else if (yPos < 120 && width < 100 && height < 100) {
        rect.fillColor = paperColor;
        rect.strokeColor = noStroke;
        rect.strokeWeight = 0;
    }
    // Metric boxes (middle of page, small boxes)
    else if (yPos >= 400 && yPos <= 520 && width < 120) {
        rect.fillColor = lightBg;
        rect.strokeColor = teeiGold;
        rect.strokeWeight = 1;
    }
    // CTA box (bottom of page, wide)
    else if (yPos >= 690 && width > 400) {
        rect.fillColor = teeiGold;
        rect.strokeColor = noStroke;
        rect.strokeWeight = 0;
    }
    // Shadow rectangles (slightly offset)
    else if (yPos >= 410 && yPos <= 520 && bounds[1] > 55) {
        // These are shadow boxes - make them light gray
        var grayColor = doc.colors.add();
        grayColor.model = ColorModel.PROCESS;
        grayColor.space = ColorSpace.RGB;
        grayColor.colorValue = [230, 230, 230];
        rect.fillColor = grayColor;
        rect.strokeColor = noStroke;
        rect.strokeWeight = 0;
    }
}

// STEP 4: Apply gold color to ALL lines
var lines = page1.graphicLines.everyItem().getElements();
for (var j = 0; j < lines.length; j++) {
    lines[j].strokeColor = teeiGold;
    lines[j].strokeWeight = 2.5;
}

// STEP 5: Apply colors to page 2 elements
if (doc.pages.length > 1) {
    var page2 = doc.pages[1];

    // Header rectangle on page 2
    var page2Rects = page2.rectangles.everyItem().getElements();
    for (var k = 0; k < page2Rects.length; k++) {
        var rect2 = page2Rects[k];
        var bounds2 = rect2.geometricBounds;

        // Header bar
        if (bounds2[0] < 100 && bounds2[3] - bounds2[1] > 500) {
            rect2.fillColor = lightBg;
            rect2.strokeColor = noStroke;
        }
    }

    // Lines on page 2
    var page2Lines = page2.graphicLines.everyItem().getElements();
    for (var m = 0; m < page2Lines.length; m++) {
        // Footer lines - light gray
        var lineY = page2Lines[m].geometricBounds[0];
        if (lineY > 750) {
            var lightGray = doc.colors.add();
            lightGray.model = ColorModel.PROCESS;
            lightGray.space = ColorSpace.RGB;
            lightGray.colorValue = [200, 200, 200];
            page2Lines[m].strokeColor = lightGray;
            page2Lines[m].strokeWeight = 0.5;
        }
    }
}

// STEP 6: Update text colors where needed
var textFrames = page1.textFrames.everyItem().getElements();
for (var n = 0; n < textFrames.length; n++) {
    var frame = textFrames[n];
    var frameY = frame.geometricBounds[0];

    // Text in header area should be white
    if (frameY < 140) {
        try {
            var whiteColor = doc.colors.add();
            whiteColor.model = ColorModel.PROCESS;
            whiteColor.space = ColorSpace.RGB;
            whiteColor.colorValue = [255, 255, 255];
            frame.texts[0].fillColor = whiteColor;
        } catch(e) {}
    }
    // Text in CTA area should be white
    else if (frameY >= 700 && frameY <= 780) {
        try {
            var whiteColor2 = doc.colors.add();
            whiteColor2.model = ColorModel.PROCESS;
            whiteColor2.space = ColorSpace.RGB;
            whiteColor2.colorValue = [255, 255, 255];
            frame.texts[0].fillColor = whiteColor2;
        } catch(e) {}
    }
}

"SUCCESS: Colors properly applied to all elements!";
"""

print("Applying comprehensive color fix...")

# Create the command to run ExtendScript
response = cmd("runExtendScriptCode", {
    "code": extendscript_fix
})

# Check if we have the right command - if not, use the alternative
if response.get("status") != "SUCCESS":
    print("Trying alternative method...")
    # Try using app.doScript directly
    response = cmd("applyColorsViaExtendScript", {})

print(f"Response: {response.get('status')}")

if response.get("status") == "SUCCESS":
    print("\n" + "="*80)
    print("COLORS FIXED SUCCESSFULLY!")
    print("="*80)
    print("\nColors applied:")
    print("  - Teal header (#00393f)")
    print("  - Gold accent lines (#BA8F5A)")
    print("  - Light background boxes (#f8fafc)")
    print("  - White text on dark backgrounds")
    print("\nNOW EXPORT TO PDF:")
    print("  1. File → Export → Adobe PDF (Print)")
    print("  2. Use 'High Quality Print' preset")
    print("  3. IMPORTANT: In 'Output' tab:")
    print("     - Color Conversion: No Color Conversion")
    print("     - Profile Inclusion: Include All Profiles")
    print("\nThis should preserve all colors in the PDF!")
else:
    print(f"\nError: {response}")

print("\n" + "="*80)