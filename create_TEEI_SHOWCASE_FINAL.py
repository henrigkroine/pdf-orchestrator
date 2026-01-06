#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TEEI Partnership Showcase - FINAL VERSION
Uses ExtendScript (proven working approach)
Single page, professional design with proper TEEI colors
"""

import sys, os, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))
from core import init, sendCommand, createCommand
import socket_client

socket_client.configure(app="indesign", url='http://localhost:8013', timeout=60)
init("indesign", socket_client)

print("=" * 80)
print("CREATING TEEI PARTNERSHIP SHOWCASE - PROFESSIONAL SINGLE PAGE")
print("=" * 80)

extendscript = """
(function() {
    // Close existing documents
    while (app.documents.length > 0) {
        app.documents[0].close(SaveOptions.NO);
    }

    // Create new A4 document
    var doc = app.documents.add();
    doc.documentPreferences.pageWidth = "595pt";   // A4 width
    doc.documentPreferences.pageHeight = "842pt";  // A4 height
    doc.documentPreferences.pagesPerDocument = 1;
    doc.documentPreferences.facingPages = false;

    // Set margins
    doc.marginPreferences.top = "36pt";
    doc.marginPreferences.bottom = "36pt";
    doc.marginPreferences.left = "36pt";
    doc.marginPreferences.right = "36pt";

    // TEEI Brand Colors
    var teeiBlue = doc.colors.add();
    teeiBlue.name = "TEEI_Blue";
    teeiBlue.space = ColorSpace.RGB;
    teeiBlue.colorValue = [0/255, 57/255, 63/255];  // #00393F

    var teeiGreen = doc.colors.add();
    teeiGreen.name = "TEEI_Green";
    teeiGreen.space = ColorSpace.RGB;
    teeiGreen.colorValue = [0/255, 150/255, 136/255];  // #009688

    var white = doc.swatches.item("Paper");
    var darkGray = doc.colors.add();
    darkGray.name = "Dark_Gray";
    darkGray.space = ColorSpace.RGB;
    darkGray.colorValue = [51/255, 51/255, 51/255];

    var mediumGray = doc.colors.add();
    mediumGray.name = "Medium_Gray";
    mediumGray.space = ColorSpace.RGB;
    mediumGray.colorValue = [102/255, 102/255, 102/255];

    var page = doc.pages[0];

    // GRADIENT HEADER (0-180pt)
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

    var headerBox = page.rectangles.add();
    headerBox.geometricBounds = ["0pt", "0pt", "180pt", "595pt"];
    headerBox.fillColor = gradient;
    headerBox.gradientFillAngle = 90;
    headerBox.strokeWeight = 0;

    // WHITE TITLE ON GRADIENT
    var title = page.textFrames.add();
    title.geometricBounds = ["60pt", "50pt", "140pt", "545pt"];
    title.contents = "TEEI AI-Powered Education\\rRevolution 2025";
    title.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    title.paragraphs.everyItem().pointSize = 32;
    title.texts.item(0).fillColor = white;

    // SUBTITLE (below gradient)
    var subtitle = page.textFrames.add();
    subtitle.geometricBounds = ["200pt", "50pt", "230pt", "545pt"];
    subtitle.contents = "World-Class Partnership Showcase Document";
    subtitle.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    subtitle.paragraphs.item(0).pointSize = 18;
    subtitle.texts.item(0).fillColor = teeiBlue;

    // INTRODUCTION
    var intro = page.textFrames.add();
    intro.geometricBounds = ["250pt", "50pt", "290pt", "545pt"];
    intro.contents = "The Educational Equality Institute (TEEI) has transformed education for 50,000+ students across 12 countries through our revolutionary AI-powered learning platform.";
    intro.paragraphs.item(0).pointSize = 11;
    intro.texts.item(0).fillColor = darkGray;

    // SECTION: AI Platform Features
    var section1Title = page.textFrames.add();
    section1Title.geometricBounds = ["310pt", "50pt", "335pt", "545pt"];
    section1Title.contents = "Revolutionary AI Platform Features:";
    section1Title.paragraphs.item(0).pointSize = 14;
    section1Title.texts.item(0).fillColor = teeiGreen;

    var bullets1 = page.textFrames.add();
    bullets1.geometricBounds = ["340pt", "70pt", "420pt", "545pt"];
    bullets1.contents = "• Adaptive learning pathways personalized for each student\\r• Real-time progress tracking and intervention alerts\\r• Multi-language support (25+ languages)\\r• Teacher dashboard with actionable insights";
    bullets1.paragraphs.everyItem().pointSize = 11;
    bullets1.texts.item(0).fillColor = darkGray;

    // SECTION: Proven Impact
    var section2Title = page.textFrames.add();
    section2Title.geometricBounds = ["440pt", "50pt", "465pt", "545pt"];
    section2Title.contents = "Proven Impact:";
    section2Title.paragraphs.item(0).pointSize = 14;
    section2Title.texts.item(0).fillColor = teeiGreen;

    var bullets2 = page.textFrames.add();
    bullets2.geometricBounds = ["470pt", "70pt", "530pt", "545pt"];
    bullets2.contents = "• 85% improvement in student engagement\\r• 92% teacher satisfaction rate\\r• 78% reduction in learning gaps";
    bullets2.paragraphs.everyItem().pointSize = 11;
    bullets2.texts.item(0).fillColor = darkGray;

    // SECTION: Strategic Partnership Benefits
    var mainSection = page.textFrames.add();
    mainSection.geometricBounds = ["550pt", "50pt", "580pt", "545pt"];
    mainSection.contents = "Strategic Partnership Benefits";
    mainSection.paragraphs.item(0).pointSize = 16;
    mainSection.texts.item(0).fillColor = teeiBlue;

    // Partnership benefits
    var benefit1 = page.textFrames.add();
    benefit1.geometricBounds = ["590pt", "50pt", "630pt", "270pt"];
    benefit1.contents = "Technology Leadership\\rPartner with a proven EdTech innovator transforming education at scale";
    benefit1.paragraphs.item(0).pointSize = 14;
    benefit1.paragraphs.item(0).fillColor = teeiGreen;
    benefit1.paragraphs.item(1).pointSize = 10;
    benefit1.paragraphs.item(1).fillColor = darkGray;

    var benefit2 = page.textFrames.add();
    benefit2.geometricBounds = ["590pt", "280pt", "630pt", "545pt"];
    benefit2.contents = "Global Reach\\rAccess to established networks in 12 countries across 3 continents";
    benefit2.paragraphs.item(0).pointSize = 14;
    benefit2.paragraphs.item(0).fillColor = teeiGreen;
    benefit2.paragraphs.item(1).pointSize = 10;
    benefit2.paragraphs.item(1).fillColor = darkGray;

    var benefit3 = page.textFrames.add();
    benefit3.geometricBounds = ["640pt", "50pt", "680pt", "270pt"];
    benefit3.contents = "Innovation Pipeline\\rCollaborate on cutting-edge AI/ML educational research";
    benefit3.paragraphs.item(0).pointSize = 14;
    benefit3.paragraphs.item(0).fillColor = teeiGreen;
    benefit3.paragraphs.item(1).pointSize = 10;
    benefit3.paragraphs.item(1).fillColor = darkGray;

    var benefit4 = page.textFrames.add();
    benefit4.geometricBounds = ["640pt", "280pt", "680pt", "545pt"];
    benefit4.contents = "Data Excellence\\rLeverage world-class learning analytics and outcomes measurement";
    benefit4.paragraphs.item(0).pointSize = 14;
    benefit4.paragraphs.item(0).fillColor = teeiGreen;
    benefit4.paragraphs.item(1).pointSize = 10;
    benefit4.paragraphs.item(1).fillColor = darkGray;

    // FOOTER SECTION
    var footerLine = page.graphicLines.add();
    footerLine.geometricBounds = ["730pt", "50pt", "730pt", "545pt"];
    footerLine.strokeColor = teeiBlue;
    footerLine.strokeWeight = "1pt";

    var contact = page.textFrames.add();
    contact.geometricBounds = ["740pt", "50pt", "790pt", "545pt"];
    contact.contents = "Contact: Henrik Røine | CEO & Founder\\rEmail: henrik@theeducationalequalityinstitute.org\\rWeb: www.educationalequality.institute";
    contact.paragraphs.everyItem().pointSize = 9;
    contact.texts.item(0).fillColor = darkGray;

    var footer = page.textFrames.add();
    footer.geometricBounds = ["800pt", "50pt", "820pt", "545pt"];
    footer.contents = "© 2025 The Educational Equality Institute | Confidential Partnership Document";
    footer.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    footer.paragraphs.item(0).pointSize = 8;
    footer.texts.item(0).fillColor = mediumGray;

    return "TEEI Partnership Showcase created successfully!";
})();
"""

print("\nCreating document with ExtendScript...\n")

try:
    result = sendCommand(createCommand("executeExtendScript", {"code": extendscript}))

    if isinstance(result, dict) and result.get('status') == 'SUCCESS':
        print("✅ DOCUMENT CREATED WITH PROPER COLORS!")
        print("\n📄 The document is now open in InDesign")
        print("   - Gradient header (TEEI Blue → Green)")
        print("   - White title text on gradient")
        print("   - TEEI Blue subtitle and section headers")
        print("   - TEEI Green feature headings")
        print("   - Dark gray body text")
        print("\n📋 To export PDF:")
        print("   File → Export → Adobe PDF (Print)")
        print("   Save to: T:\\Projects\\pdf-orchestrator\\exports\\TEEI-Partnership-Showcase.pdf")
        print("\n" + "=" * 80)
    else:
        print(f"❌ Error: {result}")

except Exception as e:
    print(f"❌ Exception: {str(e)}")
    import traceback
    traceback.print_exc()
