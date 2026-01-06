#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TEEI Partnership Showcase - ExtendScript Version
Uses direct InDesign scripting for proper text coloring
"""

import sys
import os
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add adb-mcp/mcp to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 60

# Configure socket client
socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=PROXY_TIMEOUT)
init(APPLICATION, socket_client)

print("=" * 80)
print("CREATING TEEI PARTNERSHIP SHOWCASE - EXTENDSCRIPT VERSION")
print("=" * 80)
print()

# ExtendScript to create entire document with proper colors
extendscript = """
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

// Create document
var doc = app.documents.add();
doc.documentPreferences.pageWidth = "595pt";
doc.documentPreferences.pageHeight = "842pt";
doc.documentPreferences.facingPages = false;
doc.documentPreferences.intent = DocumentIntentOptions.PRINT_INTENT;

// Set margins
with (doc.marginPreferences) {
    top = "72pt";
    bottom = "72pt";
    left = "72pt";
    right = "72pt";
}

var page = doc.pages.item(0);

// Define TEEI Brand Colors
var teeiBlue = doc.colors.add();
teeiBlue.name = "TEEI_Blue";
teeiBlue.space = ColorSpace.RGB;
teeiBlue.colorValue = [0/255, 57/255, 63/255];  // #00393F

var teeiGreen = doc.colors.add();
teeiGreen.name = "TEEI_Green";
teeiGreen.space = ColorSpace.RGB;
teeiGreen.colorValue = [0/255, 150/255, 136/255];  // #009688

var teeiGold = doc.colors.add();
teeiGold.name = "TEEI_Gold";
teeiGold.space = ColorSpace.RGB;
teeiGold.colorValue = [255/255, 183/255, 77/255];  // #FFB74D

var white = doc.colors.add();
white.name = "White";
white.space = ColorSpace.RGB;
white.colorValue = [1, 1, 1];

var darkGray = doc.colors.add();
darkGray.name = "Dark_Gray";
darkGray.space = ColorSpace.RGB;
darkGray.colorValue = [51/255, 51/255, 51/255];  // #333333

var mediumGray = doc.colors.add();
mediumGray.name = "Medium_Gray";
mediumGray.space = ColorSpace.RGB;
mediumGray.colorValue = [102/255, 102/255, 102/255];  // #666666

// Create gradient for header
var gradientStart = doc.colors.add();
gradientStart.name = "Gradient_Start";
gradientStart.space = ColorSpace.RGB;
gradientStart.colorValue = [0/255, 57/255, 63/255];

var gradientEnd = doc.colors.add();
gradientEnd.name = "Gradient_End";
gradientEnd.space = ColorSpace.RGB;
gradientEnd.colorValue = [0/255, 150/255, 136/255];

var gradient = doc.gradients.add();
gradient.name = "TEEI_Header_Gradient";
gradient.type = GradientType.LINEAR;

var stopStart = gradient.gradientStops.item(0);
stopStart.stopColor = gradientStart;
stopStart.location = 0;

var stopEnd = gradient.gradientStops.add();
stopEnd.stopColor = gradientEnd;
stopEnd.location = 100;

// Create gradient header box
var headerBox = page.rectangles.add();
headerBox.geometricBounds = ["0pt", "0pt", "180pt", "595pt"];  // y1, x1, y2, x2
headerBox.fillColor = gradient;
headerBox.gradientFillAngle = 90;  // Top to bottom

// Create title text on gradient
var titleFrame = page.textFrames.add();
titleFrame.geometricBounds = ["80pt", "72pt", "140pt", "523pt"];  // y1, x1, y2, x2
titleFrame.contents = "TEEI AI-Powered Education\\rRevolution 2025";
titleFrame.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;

with (titleFrame.parentStory.paragraphs.item(0)) {
    pointSize = 32;
    fillColor = white;
    justification = Justification.CENTER_ALIGN;
}

// Create subtitle
var subtitleFrame = page.textFrames.add();
subtitleFrame.geometricBounds = ["200pt", "72pt", "230pt", "523pt"];
subtitleFrame.contents = "World-Class Partnership Showcase Document";

with (subtitleFrame.parentStory.paragraphs.item(0)) {
    pointSize = 18;
    fillColor = teeiBlue;
    justification = Justification.CENTER_ALIGN;
}

// Add main content
var currentY = 250;

// Introduction paragraph
var intro = page.textFrames.add();
intro.geometricBounds = [currentY + "pt", "72pt", (currentY + 40) + "pt", "523pt"];
intro.contents = "The Educational Equality Institute (TEEI) has transformed education for 50,000+ students across 12 countries through our revolutionary AI-powered learning platform.";
with (intro.parentStory.paragraphs.item(0)) {
    pointSize = 11;
    fillColor = darkGray;
    justification = Justification.LEFT_ALIGN;
}
currentY += 50;

// Section: Revolutionary AI Platform Features
var section1 = page.textFrames.add();
section1.geometricBounds = [currentY + "pt", "72pt", (currentY + 25) + "pt", "523pt"];
section1.contents = "Revolutionary AI Platform Features:";
with (section1.parentStory.paragraphs.item(0)) {
    pointSize = 14;
    fillColor = teeiGreen;
    justification = Justification.LEFT_ALIGN;
}
currentY += 30;

// Bullet points
var bullets = [
    "• Adaptive learning pathways personalized for each student",
    "• Real-time progress tracking and intervention alerts",
    "• Multi-language support (25+ languages)",
    "• Teacher dashboard with actionable insights"
];

for (var i = 0; i < bullets.length; i++) {
    var bullet = page.textFrames.add();
    bullet.geometricBounds = [currentY + "pt", "90pt", (currentY + 18) + "pt", "523pt"];
    bullet.contents = bullets[i];
    with (bullet.parentStory.paragraphs.item(0)) {
        pointSize = 11;
        fillColor = darkGray;
        justification = Justification.LEFT_ALIGN;
    }
    currentY += 20;
}
currentY += 10;

// Section: Proven Impact
var section2 = page.textFrames.add();
section2.geometricBounds = [currentY + "pt", "72pt", (currentY + 25) + "pt", "523pt"];
section2.contents = "Proven Impact:";
with (section2.parentStory.paragraphs.item(0)) {
    pointSize = 14;
    fillColor = teeiGreen;
    justification = Justification.LEFT_ALIGN;
}
currentY += 30;

var impact = [
    "• 85% improvement in student engagement",
    "• 92% teacher satisfaction rate",
    "• 78% reduction in learning gaps"
];

for (var j = 0; j < impact.length; j++) {
    var impactItem = page.textFrames.add();
    impactItem.geometricBounds = [currentY + "pt", "90pt", (currentY + 18) + "pt", "523pt"];
    impactItem.contents = impact[j];
    with (impactItem.parentStory.paragraphs.item(0)) {
        pointSize = 11;
        fillColor = darkGray;
        justification = Justification.LEFT_ALIGN;
    }
    currentY += 20;
}
currentY += 20;

// Main section: Strategic Partnership Benefits
var mainSection = page.textFrames.add();
mainSection.geometricBounds = [currentY + "pt", "72pt", (currentY + 30) + "pt", "523pt"];
mainSection.contents = "Strategic Partnership Benefits";
with (mainSection.parentStory.paragraphs.item(0)) {
    pointSize = 16;
    fillColor = teeiBlue;
    justification = Justification.LEFT_ALIGN;
}
currentY += 40;

// Partnership benefit 1
var benefit1Title = page.textFrames.add();
benefit1Title.geometricBounds = [currentY + "pt", "72pt", (currentY + 25) + "pt", "523pt"];
benefit1Title.contents = "Technology Leadership";
with (benefit1Title.parentStory.paragraphs.item(0)) {
    pointSize = 14;
    fillColor = teeiGreen;
    justification = Justification.LEFT_ALIGN;
}
currentY += 28;

var benefit1Text = page.textFrames.add();
benefit1Text.geometricBounds = [currentY + "pt", "72pt", (currentY + 18) + "pt", "523pt"];
benefit1Text.contents = "Partner with a proven EdTech innovator transforming education at scale";
with (benefit1Text.parentStory.paragraphs.item(0)) {
    pointSize = 11;
    fillColor = darkGray;
    justification = Justification.LEFT_ALIGN;
}
currentY += 26;

// Partnership benefit 2
var benefit2Title = page.textFrames.add();
benefit2Title.geometricBounds = [currentY + "pt", "72pt", (currentY + 25) + "pt", "523pt"];
benefit2Title.contents = "Global Reach";
with (benefit2Title.parentStory.paragraphs.item(0)) {
    pointSize = 14;
    fillColor = teeiGreen;
    justification = Justification.LEFT_ALIGN;
}
currentY += 28;

var benefit2Text = page.textFrames.add();
benefit2Text.geometricBounds = [currentY + "pt", "72pt", (currentY + 18) + "pt", "523pt"];
benefit2Text.contents = "Access to established networks in 12 countries across 3 continents";
with (benefit2Text.parentStory.paragraphs.item(0)) {
    pointSize = 11;
    fillColor = darkGray;
    justification = Justification.LEFT_ALIGN;
}
currentY += 26;

// Partnership benefit 3
var benefit3Title = page.textFrames.add();
benefit3Title.geometricBounds = [currentY + "pt", "72pt", (currentY + 25) + "pt", "523pt"];
benefit3Title.contents = "Innovation Pipeline";
with (benefit3Title.parentStory.paragraphs.item(0)) {
    pointSize = 14;
    fillColor = teeiGreen;
    justification = Justification.LEFT_ALIGN;
}
currentY += 28;

var benefit3Text = page.textFrames.add();
benefit3Text.geometricBounds = [currentY + "pt", "72pt", (currentY + 18) + "pt", "523pt"];
benefit3Text.contents = "Collaborate on cutting-edge AI/ML educational research";
with (benefit3Text.parentStory.paragraphs.item(0)) {
    pointSize = 11;
    fillColor = darkGray;
    justification = Justification.LEFT_ALIGN;
}
currentY += 26;

// Partnership benefit 4
var benefit4Title = page.textFrames.add();
benefit4Title.geometricBounds = [currentY + "pt", "72pt", (currentY + 25) + "pt", "523pt"];
benefit4Title.contents = "Data Excellence";
with (benefit4Title.parentStory.paragraphs.item(0)) {
    pointSize = 14;
    fillColor = teeiGreen;
    justification = Justification.LEFT_ALIGN;
}
currentY += 28;

var benefit4Text = page.textFrames.add();
benefit4Text.geometricBounds = [currentY + "pt", "72pt", (currentY + 18) + "pt", "523pt"];
benefit4Text.contents = "Leverage world-class learning analytics and outcomes measurement";
with (benefit4Text.parentStory.paragraphs.item(0)) {
    pointSize = 11;
    fillColor = darkGray;
    justification = Justification.LEFT_ALIGN;
}
currentY += 40;

// Contact information
var contact1 = page.textFrames.add();
contact1.geometricBounds = [currentY + "pt", "72pt", (currentY + 15) + "pt", "523pt"];
contact1.contents = "Contact: Henrik Røine | CEO & Founder";
with (contact1.parentStory.paragraphs.item(0)) {
    pointSize = 10;
    fillColor = darkGray;
    justification = Justification.LEFT_ALIGN;
}
currentY += 16;

var contact2 = page.textFrames.add();
contact2.geometricBounds = [currentY + "pt", "72pt", (currentY + 15) + "pt", "523pt"];
contact2.contents = "Email: henrik@theeducationalequalityinstitute.org";
with (contact2.parentStory.paragraphs.item(0)) {
    pointSize = 10;
    fillColor = darkGray;
    justification = Justification.LEFT_ALIGN;
}
currentY += 16;

var contact3 = page.textFrames.add();
contact3.geometricBounds = [currentY + "pt", "72pt", (currentY + 15) + "pt", "523pt"];
contact3.contents = "Web: www.educationalequality.institute";
with (contact3.parentStory.paragraphs.item(0)) {
    pointSize = 10;
    fillColor = darkGray;
    justification = Justification.LEFT_ALIGN;
}

// Footer line
var footerLine = page.graphicLines.add();
footerLine.geometricBounds = ["734pt", "72pt", "734pt", "523pt"];
footerLine.strokeColor = teeiBlue;
footerLine.strokeWeight = "1pt";

// Footer text
var footer = page.textFrames.add();
footer.geometricBounds = ["740pt", "72pt", "755pt", "523pt"];
footer.contents = "© 2025 The Educational Equality Institute | Confidential Partnership Document";
with (footer.parentStory.paragraphs.item(0)) {
    pointSize = 9;
    fillColor = mediumGray;
    justification = Justification.CENTER_ALIGN;
}

"Document created with proper colors!";
"""

print("\nExecuting ExtendScript to create document with proper text colors...")
print("(This will create the entire document in one operation)\n")

try:
    command = createCommand("executeExtendScript", {"code": extendscript})
    result = sendCommand(command)

    if isinstance(result, dict):
        status = result.get('status', '')
        response_data = result.get('response', {})

        if status == 'SUCCESS' or response_data.get('success'):
            print("✅ DOCUMENT CREATED WITH PROPER COLORED TEXT!")
            print("\n📋 Now export manually from InDesign:")
            print("   File → Export → Adobe PDF (Print)")
            print("   Choose 'High Quality Print'")
            print("   Save to: T:\\Projects\\pdf-orchestrator\\exports\\teei-partnership-showcase-premium.pdf")
            print("\n" + "=" * 80)
        else:
            error_msg = response_data.get('error', response_data.get('message', 'Unknown error'))
            print(f"❌ Error creating document: {error_msg}")
            print(f"\nFull response: {result}")
    else:
        print(f"⚠️ Unexpected response: {result}")

except Exception as e:
    print(f"❌ Exception: {str(e)}")
    import traceback
    traceback.print_exc()
