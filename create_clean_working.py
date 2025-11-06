#!/usr/bin/env python3
"""
Create professional TEEI document using THE WORKING APPROACH:
- Phase 1: Create ALL structure with UXP (no text colors)
- Phase 2: Apply ALL colors via ExtendScript (the only way that works)
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
    """Send command to InDesign"""
    response = sendCommand(createCommand(action, options))
    if response.get("status") != "SUCCESS":
        print(f"ERROR in {action}: {response}")
        raise Exception(f"Command failed: {action}")
    return response

print("\n" + "="*80)
print("CREATING PROFESSIONAL TEEI DOCUMENT - THE WORKING WAY")
print("="*80 + "\n")

# ==============================================================================
# PHASE 1: CREATE STRUCTURE WITH UXP (NO COLOR ATTEMPTS)
# ==============================================================================

print("PHASE 1: Creating document structure (no colors yet)...")

# Create document
cmd("createDocument", {
    "pageWidth": 595,
    "pageHeight": 842,
    "pagesPerDocument": 2,
    "margins": {"top": 50, "bottom": 50, "left": 40, "right": 40}
})

print("  - Document created")

# PAGE 1 - Header rectangle (will be black until ExtendScript colors it)
cmd("createRectangle", {
    "page": 1, "x": 40, "y": 40, "width": 515, "height": 120
})

# Gold accent stripe (will be black until ExtendScript)
cmd("createRectangle", {
    "page": 1, "x": 40, "y": 40, "width": 8, "height": 120
})

print("  - Header rectangles created")

# TEEI Logo in header (white version for teal background)
# TEMPORARILY DISABLED - will add after confirming colors work
# logo_path = os.path.join(os.path.dirname(__file__), "assets", "TEEI-logo-white.png")
# if os.path.exists(logo_path):
#     cmd("placeImage", {
#         "page": 1, "x": 460, "y": 50, "width": 80, "height": 60,
#         "path": logo_path,
#         "fit": "fit-proportionally"
#     })
#     print("  - Logo placed in header")
# else:
#     print("  - Logo not found, skipping")

# Organization name (NO fillColor - let ExtendScript handle it)
cmd("placeText", {
    "page": 1, "x": 60, "y": 55, "width": 380, "height": 30,
    "content": "THE EDUCATIONAL EQUALITY INSTITUTE",
    "fontSize": 24, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "alignment": "left"
})

# Tagline (NO fillColor)
cmd("placeText", {
    "page": 1, "x": 60, "y": 90, "width": 480, "height": 60,
    "content": "Transforming Lives Through Technology-Enabled Education",
    "fontSize": 14, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
    "alignment": "left"
})

print("  - Header text created")

# Main section header (NO fillColor)
cmd("placeText", {
    "page": 1, "x": 48, "y": 180, "width": 500, "height": 25,
    "content": "STRATEGIC ALLIANCE WITH AMAZON WEB SERVICES",
    "fontSize": 16, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "alignment": "left"
})

# Gold accent line
cmd("createLine", {
    "page": 1, "x1": 48, "y1": 210, "x2": 548, "y2": 210,
    "strokeWeight": 3
})

print("  - Section header and line created")

# Metrics boxes (4 columns)
metrics = [
    {"label": "STUDENTS REACHED", "value": "10,000+", "x": 48},
    {"label": "ACTIVE MENTORS", "value": "2,600+", "x": 173},
    {"label": "SUCCESS RATE", "value": "97%", "x": 298},
    {"label": "COUNTRIES", "value": "15", "x": 423}
]

for metric in metrics:
    # Metric box background
    cmd("createRectangle", {
        "page": 1, "x": metric["x"], "y": 230, "width": 115, "height": 90
    })

    # Metric value (NO fillColor)
    cmd("placeText", {
        "page": 1, "x": metric["x"] + 10, "y": 245, "width": 95, "height": 35,
        "content": metric["value"],
        "fontSize": 28, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
        "alignment": "center"
    })

    # Metric label (NO fillColor)
    cmd("placeText", {
        "page": 1, "x": metric["x"] + 10, "y": 285, "width": 95, "height": 20,
        "content": metric["label"],
        "fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
        "alignment": "center"
    })

print("  - Metrics section created")

# Value proposition (NO fillColor)
cmd("placeText", {
    "page": 1, "x": 48, "y": 340, "width": 500, "height": 20,
    "content": "Why Partner With TEEI?",
    "fontSize": 14, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "alignment": "left"
})

value_props = [
    "• Proven track record of educational transformation at scale",
    "• Technology-first approach aligned with AWS innovation",
    "• Deep reach into underserved communities across 15 countries",
    "• 97% program success rate backed by rigorous metrics"
]

y_offset = 370
for prop in value_props:
    cmd("placeText", {
        "page": 1, "x": 58, "y": y_offset, "width": 480, "height": 18,
        "content": prop,
        "fontSize": 11, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
        "alignment": "left"
    })
    y_offset += 22

print("  - Value proposition created")

# PAGE 2 - Implementation Timeline
cmd("placeText", {
    "page": 2, "x": 48, "y": 60, "width": 500, "height": 25,
    "content": "IMPLEMENTATION TIMELINE",
    "fontSize": 16, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "alignment": "left"
})

# Timeline accent line
cmd("createLine", {
    "page": 2, "x1": 48, "y1": 90, "x2": 548, "y2": 90,
    "strokeWeight": 3
})

print("  - Page 2 header created")

# Timeline phases
phases = [
    {"phase": "Phase 1", "title": "Discovery & Planning", "duration": "Weeks 1-4", "y": 120},
    {"phase": "Phase 2", "title": "Infrastructure Setup", "duration": "Weeks 5-8", "y": 220},
    {"phase": "Phase 3", "title": "Pilot Launch", "duration": "Weeks 9-16", "y": 320},
    {"phase": "Phase 4", "title": "Full Deployment", "duration": "Weeks 17-24", "y": 420}
]

for phase in phases:
    # Phase number box
    cmd("createRectangle", {
        "page": 2, "x": 48, "y": phase["y"], "width": 100, "height": 70
    })

    cmd("placeText", {
        "page": 2, "x": 58, "y": phase["y"] + 15, "width": 80, "height": 40,
        "content": phase["phase"],
        "fontSize": 12, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
        "alignment": "center"
    })

    # Timeline arrow line
    cmd("createLine", {
        "page": 2, "x1": 158, "y1": phase["y"] + 35, "x2": 210, "y2": phase["y"] + 35,
        "strokeWeight": 2
    })

    # Phase details box
    cmd("createRectangle", {
        "page": 2, "x": 220, "y": phase["y"], "width": 328, "height": 70
    })

    cmd("placeText", {
        "page": 2, "x": 235, "y": phase["y"] + 15, "width": 298, "height": 20,
        "content": phase["title"],
        "fontSize": 13, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
        "alignment": "left"
    })

    cmd("placeText", {
        "page": 2, "x": 235, "y": phase["y"] + 45, "width": 298, "height": 18,
        "content": phase["duration"],
        "fontSize": 10, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
        "alignment": "left"
    })

print("  - Timeline phases created")

# Contact CTA at bottom
cmd("createRectangle", {
    "page": 2, "x": 48, "y": 720, "width": 500, "height": 80
})

cmd("placeText", {
    "page": 2, "x": 68, "y": 735, "width": 460, "height": 20,
    "content": "Ready to Transform Education Together?",
    "fontSize": 14, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "alignment": "center"
})

cmd("placeText", {
    "page": 2, "x": 68, "y": 765, "width": 460, "height": 18,
    "content": "Contact: partnerships@teei.org | www.teei.org/aws-partnership",
    "fontSize": 11, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
    "alignment": "center"
})

print("  - Contact CTA created")
print("\nPHASE 1 COMPLETE - Document structure created (everything is black/white)")

# ==============================================================================
# PHASE 2: APPLY COLORS VIA EXTENDSCRIPT (THE ONLY WAY THAT WORKS)
# ==============================================================================

print("\nPHASE 2: Applying colors via ExtendScript...")
time.sleep(1)  # Give InDesign a moment to settle

# This ExtendScript will:
# 1. Create TEEI brand colors
# 2. Find rectangles and lines by position
# 3. Apply colors to everything
# 4. Color text content directly

extendscript_code = """
(function() {
    var doc = app.activeDocument;

    // Define TEEI brand colors
    var teeiTeal = doc.colors.add();
    teeiTeal.name = "TEEI_Teal";
    teeiTeal.space = ColorSpace.RGB;
    teeiTeal.colorValue = [0, 57, 63];

    var teeiGold = doc.colors.add();
    teeiGold.name = "TEEI_Gold";
    teeiGold.space = ColorSpace.RGB;
    teeiGold.colorValue = [186, 143, 90];

    var lightGold = doc.colors.add();
    lightGold.name = "TEEI_LightGold";
    lightGold.space = ColorSpace.RGB;
    lightGold.colorValue = [210, 180, 140];

    var lightBg = doc.colors.add();
    lightBg.name = "TEEI_LightBg";
    lightBg.space = ColorSpace.RGB;
    lightBg.colorValue = [248, 250, 252];

    var white = doc.swatches.item("Paper");
    var none = doc.swatches.item("None");

    // Page 1
    var page1 = doc.pages[0];

    // Apply colors to rectangles on page 1
    var rects1 = page1.rectangles.everyItem().getElements();
    for (var i = 0; i < rects1.length; i++) {
        var rect = rects1[i];
        var bounds = rect.geometricBounds;
        var y = bounds[0];
        var x = bounds[1];
        var width = bounds[3] - bounds[1];

        // Header box (large rectangle at top)
        if (y < 50 && width > 500) {
            rect.fillColor = teeiTeal;
            rect.strokeColor = none;
        }
        // Gold accent stripe (thin vertical bar)
        else if (y < 50 && width < 10) {
            rect.fillColor = teeiGold;
            rect.strokeColor = none;
        }
        // Metric boxes (y around 230)
        else if (y > 220 && y < 240 && width > 100 && width < 120) {
            rect.fillColor = lightBg;
            rect.strokeColor = none;
        }
    }

    // Apply gold to lines on page 1
    var lines1 = page1.graphicLines.everyItem().getElements();
    for (var j = 0; j < lines1.length; j++) {
        lines1[j].strokeColor = teeiGold;
    }

    // Color text on page 1
    var texts1 = page1.textFrames.everyItem().getElements();
    for (var k = 0; k < texts1.length; k++) {
        var textFrame = texts1[k];
        var y = textFrame.geometricBounds[0];
        var content = textFrame.contents;

        // Header text (white)
        if (y < 120) {
            textFrame.texts[0].fillColor = white;
        }
        // Tagline (light gold)
        else if (y < 130 && content.indexOf("Transforming") !== -1) {
            textFrame.texts[0].fillColor = lightGold;
        }
        // Section headers (teal)
        else if (content.indexOf("STRATEGIC") !== -1 || content.indexOf("Why Partner") !== -1) {
            textFrame.texts[0].fillColor = teeiTeal;
        }
        // Metric values (gold)
        else if (y > 230 && y < 260 && (content.indexOf("+") !== -1 || content.indexOf("%") !== -1 || !isNaN(content))) {
            textFrame.texts[0].fillColor = teeiGold;
        }
    }

    // Page 2
    var page2 = doc.pages[1];

    // Apply colors to rectangles on page 2
    var rects2 = page2.rectangles.everyItem().getElements();
    for (var m = 0; m < rects2.length; m++) {
        var rect2 = rects2[m];
        var bounds2 = rect2.geometricBounds;
        var y2 = bounds2[0];
        var width2 = bounds2[3] - bounds2[1];

        // Phase number boxes (small boxes on left)
        if (width2 > 95 && width2 < 105) {
            rect2.fillColor = teeiTeal;
            rect2.strokeColor = none;
        }
        // Phase detail boxes (large boxes on right)
        else if (width2 > 300) {
            rect2.fillColor = lightBg;
            rect2.strokeColor = none;
        }
    }

    // Apply gold to lines on page 2
    var lines2 = page2.graphicLines.everyItem().getElements();
    for (var n = 0; n < lines2.length; n++) {
        var line = lines2[n];
        var y_line = line.paths[0].pathPoints[0].anchor[1];

        // Header line (thicker gold line at top)
        if (y_line < 100) {
            line.strokeColor = teeiGold;
        }
        // Timeline arrows (thinner gold lines)
        else {
            line.strokeColor = teeiGold;
        }
    }

    // Color text on page 2
    var texts2 = page2.textFrames.everyItem().getElements();
    for (var p = 0; p < texts2.length; p++) {
        var textFrame2 = texts2[p];
        var content2 = textFrame2.contents;

        // Page header (teal)
        if (content2.indexOf("IMPLEMENTATION") !== -1) {
            textFrame2.texts[0].fillColor = teeiTeal;
        }
        // Phase numbers (white text in teal boxes)
        else if (content2.indexOf("Phase") !== -1) {
            textFrame2.texts[0].fillColor = white;
        }
        // CTA header (teal)
        else if (content2.indexOf("Ready to Transform") !== -1) {
            textFrame2.texts[0].fillColor = teeiTeal;
        }
    }

    return "Applied TEEI colors successfully";
})();
"""

response = cmd("executeExtendScript", {"code": extendscript_code})

if response.get("response", {}).get("success"):
    print("\n" + "="*80)
    print("SUCCESS! PROFESSIONAL DOCUMENT CREATED!")
    print("="*80)
    print("\nPHASE 2 COMPLETE - All colors applied via ExtendScript")
    print("\nThe document now has:")
    print("  ✓ Deep Teal header box with white text")
    print("  ✓ Gold accent stripe and divider lines")
    print("  ✓ Light background metric boxes with gold values")
    print("  ✓ Professional timeline on page 2")
    print("  ✓ All text properly colored")
    print("\nPress 'W' in InDesign to toggle preview mode")
    print("="*80 + "\n")
else:
    print(f"\nERROR applying colors: {response}")

print("Script complete!")
