#!/usr/bin/env python3
"""
Manually apply colors using simpler ExtendScript
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

def cmd(action, options):
    """Send command to InDesign"""
    response = sendCommand(createCommand(action, options))
    return response

print("\n" + "="*80)
print("MANUAL COLOR FIX - SIMPLE APPROACH")
print("="*80 + "\n")

# Simpler ExtendScript that just colors ALL rectangles
extendscript = """
var doc = app.activeDocument;

// Create colors if they don't exist
function getOrCreateColor(name, rgb) {
    try {
        return doc.colors.itemByName(name);
    } catch(e) {
        var color = doc.colors.add();
        color.name = name;
        color.model = ColorModel.PROCESS;
        color.space = ColorSpace.RGB;
        color.colorValue = rgb;
        return color;
    }
}

var teeiTeal = getOrCreateColor("TEEI_Teal", [0, 57, 63]);
var teeiGold = getOrCreateColor("TEEI_Gold", [186, 143, 90]);
var lightBg = getOrCreateColor("TEEI_LightBg", [248, 250, 252]);

var count = 0;

// Go through all pages
for (var p = 0; p < doc.pages.length; p++) {
    var page = doc.pages[p];
    var rects = page.rectangles.everyItem().getElements();

    for (var i = 0; i < rects.length; i++) {
        var rect = rects[i];
        var bounds = rect.geometricBounds;
        var y = bounds[0];
        var w = bounds[3] - bounds[1];

        // Header rectangles (top, full width)
        if (y < 150 && w > 500) {
            rect.fillColor = teeiTeal;
            rect.strokeColor = doc.swatches.item("None");
            count++;
        }
        // Metric boxes (small boxes)
        else if (y >= 380 && y <= 550 && w < 120) {
            rect.fillColor = lightBg;
            rect.strokeColor = teeiGold;
            rect.strokeWeight = 1;
            count++;
        }
        // CTA box (large box at bottom)
        else if (y >= 680 && w > 400) {
            rect.fillColor = teeiGold;
            rect.strokeColor = doc.swatches.item("None");
            count++;
        }
    }
}

"Colored " + count + " rectangles";
"""

print("Applying colors with simplified logic...\n")

response = cmd("applyColorsViaExtendScript", {})

print("\nResponse:", response)

if response.get("status") == "SUCCESS":
    print("\n[SUCCESS] Colors should now be applied!")
    print("\nCheck your document:")
    print("  - Top sections should be TEAL (not black)")
    print("  - Metric boxes should have light backgrounds with gold borders")
    print("  - Bottom CTA should be GOLD")
else:
    print(f"\n[ERROR] Failed: {response}")

print("\n" + "="*80)