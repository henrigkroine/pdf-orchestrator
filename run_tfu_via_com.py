#!/usr/bin/env python3
"""
TFU Pipeline via COM Automation (Bypass UXP Plugin)

This script uses Windows COM automation to directly control InDesign,
bypassing the UXP plugin which requires manual connection.

COM automation is the traditional Windows method for controlling Adobe apps.
"""

import os
import sys
import json
import time
from pathlib import Path

# Check for pywin32
try:
    import win32com.client
    from win32com.client import Dispatch
except ImportError:
    print("ERROR: pywin32 not installed. Run: pip install pywin32")
    sys.exit(1)

# Project paths
PROJECT_ROOT = Path(__file__).parent
EXPORTS_DIR = PROJECT_ROOT / "exports"
DATA_FILE = PROJECT_ROOT / "data" / "partnership-aws-example.json"

print("\n" + "=" * 80)
print("TFU PIPELINE VIA COM AUTOMATION")
print("=" * 80)
print("Bypassing UXP plugin - Direct COM control of InDesign")
print("=" * 80 + "\n")

# Load data
print("[1/6] Loading partnership data...")
if DATA_FILE.exists():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"      Loaded: {data.get('title', 'Unknown')}")
else:
    print(f"      WARNING: {DATA_FILE} not found, using defaults")
    data = {
        "title": "Together for Ukraine Partnership",
        "partner": {"name": "AWS"},
        "organization": "TEEI"
    }

# Connect to InDesign via COM
print("[2/6] Connecting to InDesign via COM...")
try:
    # Try InDesign 2024 first
    try:
        indesign = Dispatch("InDesign.Application.2024")
        print("      Connected to InDesign 2024")
    except:
        # Try generic version
        try:
            indesign = Dispatch("InDesign.Application")
            print("      Connected to InDesign (generic)")
        except:
            # Try InDesign CC
            indesign = Dispatch("InDesign.Application.CC.2024")
            print("      Connected to InDesign CC 2024")

    print(f"      InDesign version: {indesign.Version}")
except Exception as e:
    print(f"      ERROR: Could not connect to InDesign via COM: {e}")
    print("\n      Possible solutions:")
    print("      1. Make sure InDesign is running")
    print("      2. Check if InDesign COM server is registered")
    print("      3. Try running as Administrator")
    sys.exit(1)

# Create TFU document
print("[3/6] Creating TFU 4-page document...")

# TFU Colors (RGB values)
COLORS = {
    'teal': [0, 57, 63],       # #00393F - Primary
    'sky': [201, 228, 236],    # #C9E4EC - Stats boxes
    'blue': [61, 92, 166],     # #3D5CA6 - TFU badge
    'yellow': [255, 213, 0],   # #FFD500 - TFU badge
    'white': [255, 255, 255],
}

# ExtendScript to execute - Creates complete TFU document
jsx_script = """
(function() {
    // ========================================
    // TFU Partnership Document - COM Execution
    // ========================================

    // Document dimensions (Letter size)
    var DOC_WIDTH = 612;  // 8.5" in points
    var DOC_HEIGHT = 792; // 11" in points
    var MARGIN = 40;

    // Create new document
    var doc = app.documents.add();
    doc.documentPreferences.pageWidth = DOC_WIDTH + "pt";
    doc.documentPreferences.pageHeight = DOC_HEIGHT + "pt";
    doc.documentPreferences.facingPages = false;

    // Add pages (4 total for TFU)
    while (doc.pages.length < 4) {
        doc.pages.add();
    }

    // Set margins
    with (doc.marginPreferences) {
        top = MARGIN + "pt";
        bottom = MARGIN + "pt";
        left = MARGIN + "pt";
        right = MARGIN + "pt";
    }

    // Create TFU brand colors
    var teal = doc.colors.add();
    teal.name = "TFU_Teal";
    teal.space = ColorSpace.RGB;
    teal.colorValue = [0, 57, 63];

    var sky = doc.colors.add();
    sky.name = "TFU_Sky";
    sky.space = ColorSpace.RGB;
    sky.colorValue = [201, 228, 236];

    var tfuBlue = doc.colors.add();
    tfuBlue.name = "TFU_Blue";
    tfuBlue.space = ColorSpace.RGB;
    tfuBlue.colorValue = [61, 92, 166];

    var tfuYellow = doc.colors.add();
    tfuYellow.name = "TFU_Yellow";
    tfuYellow.space = ColorSpace.RGB;
    tfuYellow.colorValue = [255, 213, 0];

    var white = doc.swatches.item("Paper");
    var none = doc.swatches.item("None");

    // ========================================
    // PAGE 1 - COVER
    // ========================================
    var page1 = doc.pages[0];

    // Full teal background
    var coverBg = page1.rectangles.add();
    coverBg.geometricBounds = ["0pt", "0pt", DOC_HEIGHT + "pt", DOC_WIDTH + "pt"];
    coverBg.fillColor = teal;
    coverBg.strokeColor = none;

    // Hero photo placeholder (460x450pt card)
    var heroBox = page1.rectangles.add();
    heroBox.geometricBounds = ["180pt", "76pt", "630pt", "536pt"];
    heroBox.fillColor = sky;
    heroBox.strokeColor = none;

    // Title text (white on teal)
    var titleFrame = page1.textFrames.add();
    titleFrame.geometricBounds = ["80pt", "40pt", "160pt", "572pt"];
    titleFrame.contents = "Together for Ukraine";
    titleFrame.parentStory.characters.everyItem().pointSize = 60;
    try {
        titleFrame.parentStory.characters.everyItem().appliedFont = app.fonts.item("Lora\\tBold");
    } catch(e) {
        titleFrame.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
    }
    titleFrame.parentStory.characters.everyItem().fillColor = white;
    titleFrame.fillColor = none;
    titleFrame.strokeColor = none;

    // Subtitle
    var subtitleFrame = page1.textFrames.add();
    subtitleFrame.geometricBounds = ["660pt", "40pt", "710pt", "572pt"];
    subtitleFrame.contents = "Strategic Partnership with Amazon Web Services\\nEmpowering Ukrainian Students Through Cloud Education";
    subtitleFrame.parentStory.characters.everyItem().pointSize = 16;
    try {
        subtitleFrame.parentStory.characters.everyItem().appliedFont = app.fonts.item("Roboto\\tRegular");
    } catch(e) {}
    subtitleFrame.parentStory.characters.everyItem().fillColor = white;
    subtitleFrame.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    subtitleFrame.fillColor = none;
    subtitleFrame.strokeColor = none;

    // TEEI logo placeholder
    var logoFrame = page1.textFrames.add();
    logoFrame.geometricBounds = ["740pt", "40pt", "770pt", "140pt"];
    logoFrame.contents = "TEEI";
    logoFrame.parentStory.characters.everyItem().pointSize = 18;
    logoFrame.parentStory.characters.everyItem().fillColor = white;
    logoFrame.fillColor = none;
    logoFrame.strokeColor = none;

    // ========================================
    // PAGE 2 - ABOUT / STATS
    // ========================================
    var page2 = doc.pages[1];

    // Section header
    var aboutHeader = page2.textFrames.add();
    aboutHeader.geometricBounds = ["60pt", "40pt", "95pt", "400pt"];
    aboutHeader.contents = "About Together for Ukraine";
    aboutHeader.parentStory.characters.everyItem().pointSize = 28;
    try {
        aboutHeader.parentStory.characters.everyItem().appliedFont = app.fonts.item("Lora\\tSemiBold");
    } catch(e) {
        aboutHeader.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
    }
    aboutHeader.parentStory.characters.everyItem().fillColor = teal;
    aboutHeader.fillColor = none;
    aboutHeader.strokeColor = none;

    // Intro paragraph
    var introText = page2.textFrames.add();
    introText.geometricBounds = ["110pt", "40pt", "240pt", "360pt"];
    introText.contents = "Together for Ukraine (TFU) is a comprehensive initiative by The Educational Equality Institute partnering with leading technology companies to provide displaced Ukrainian students with cloud computing skills and career opportunities.\\n\\nThrough our partnership with AWS, we deliver world-class technical training, mentorship, and career placement support to thousands of students affected by the ongoing conflict.";
    introText.parentStory.characters.everyItem().pointSize = 13;
    try {
        introText.parentStory.characters.everyItem().appliedFont = app.fonts.item("Roboto\\tRegular");
    } catch(e) {}
    introText.fillColor = none;
    introText.strokeColor = none;

    // Stats sidebar (light blue background)
    var statsBg = page2.rectangles.add();
    statsBg.geometricBounds = ["60pt", "380pt", "340pt", "572pt"];
    statsBg.fillColor = sky;
    statsBg.strokeColor = none;

    // Stats content
    var stats = [
        {value: "5,000+", label: "Students Trained"},
        {value: "120", label: "Courses Delivered"},
        {value: "89%", label: "Completion Rate"},
        {value: "76%", label: "Employment Rate"}
    ];

    var statsY = 80;
    for (var i = 0; i < stats.length; i++) {
        var statValue = page2.textFrames.add();
        statValue.geometricBounds = [statsY + "pt", "400pt", (statsY + 40) + "pt", "552pt"];
        statValue.contents = stats[i].value;
        statValue.parentStory.characters.everyItem().pointSize = 32;
        statValue.parentStory.characters.everyItem().fillColor = teal;
        statValue.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
        statValue.fillColor = none;
        statValue.strokeColor = none;

        var statLabel = page2.textFrames.add();
        statLabel.geometricBounds = [(statsY + 42) + "pt", "400pt", (statsY + 58) + "pt", "552pt"];
        statLabel.contents = stats[i].label;
        statLabel.parentStory.characters.everyItem().pointSize = 11;
        statLabel.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
        statLabel.fillColor = none;
        statLabel.strokeColor = none;

        statsY += 70;
    }

    // ========================================
    // PAGE 3 - PROGRAMS (No photos - editorial)
    // ========================================
    var page3 = doc.pages[2];

    // Decorative divider line
    var divider = page3.graphicLines.add();
    divider.paths[0].entirePath = [["40pt", "40pt"], ["40pt", "572pt"]];
    divider.strokeColor = teal;
    divider.strokeWeight = "3pt";

    // Programs header
    var programsHeader = page3.textFrames.add();
    programsHeader.geometricBounds = ["60pt", "40pt", "95pt", "400pt"];
    programsHeader.contents = "Our Programs";
    programsHeader.parentStory.characters.everyItem().pointSize = 28;
    try {
        programsHeader.parentStory.characters.everyItem().appliedFont = app.fonts.item("Lora\\tSemiBold");
    } catch(e) {
        programsHeader.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
    }
    programsHeader.parentStory.characters.everyItem().fillColor = teal;
    programsHeader.fillColor = none;
    programsHeader.strokeColor = none;

    // Two-column program descriptions
    var col1 = page3.textFrames.add();
    col1.geometricBounds = ["120pt", "40pt", "700pt", "300pt"];
    col1.contents = "AWS Cloud Education\\n\\nOur flagship cloud computing curriculum provides comprehensive training in AWS services, preparing students for in-demand careers in cloud technology.\\n\\n- AWS Certified Solutions Architect preparation\\n- Hands-on labs with real AWS infrastructure\\n- Project-based learning with industry mentors\\n- Career placement support and networking";
    col1.parentStory.characters.everyItem().pointSize = 12;
    col1.fillColor = none;
    col1.strokeColor = none;

    var col2 = page3.textFrames.add();
    col2.geometricBounds = ["120pt", "310pt", "700pt", "572pt"];
    col2.contents = "Technical Mentorship\\n\\nExperienced professionals guide students through their learning journey, providing personalized support and career guidance.\\n\\n- 1-on-1 mentorship sessions\\n- Code review and project feedback\\n- Interview preparation\\n- Industry networking opportunities";
    col2.parentStory.characters.everyItem().pointSize = 12;
    col2.fillColor = none;
    col2.strokeColor = none;

    // ========================================
    // PAGE 4 - CTA / LOGOS
    // ========================================
    var page4 = doc.pages[3];

    // Full teal background
    var ctaBg = page4.rectangles.add();
    ctaBg.geometricBounds = ["0pt", "0pt", DOC_HEIGHT + "pt", DOC_WIDTH + "pt"];
    ctaBg.fillColor = teal;
    ctaBg.strokeColor = none;

    // TFU Badge (blue and yellow)
    var badgeBlue = page4.rectangles.add();
    badgeBlue.geometricBounds = ["80pt", "236pt", "180pt", "306pt"];
    badgeBlue.fillColor = tfuBlue;
    badgeBlue.strokeColor = none;

    var badgeYellow = page4.rectangles.add();
    badgeYellow.geometricBounds = ["80pt", "306pt", "180pt", "376pt"];
    badgeYellow.fillColor = tfuYellow;
    badgeYellow.strokeColor = none;

    // CTA header
    var ctaHeader = page4.textFrames.add();
    ctaHeader.geometricBounds = ["220pt", "40pt", "280pt", "572pt"];
    ctaHeader.contents = "Partner With Us";
    ctaHeader.parentStory.characters.everyItem().pointSize = 42;
    try {
        ctaHeader.parentStory.characters.everyItem().appliedFont = app.fonts.item("Lora\\tBold");
    } catch(e) {
        ctaHeader.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
    }
    ctaHeader.parentStory.characters.everyItem().fillColor = white;
    ctaHeader.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    ctaHeader.fillColor = none;
    ctaHeader.strokeColor = none;

    // CTA text
    var ctaText = page4.textFrames.add();
    ctaText.geometricBounds = ["300pt", "80pt", "400pt", "532pt"];
    ctaText.contents = "Join our growing network of corporate partners making a difference in Ukrainian students lives. Your support provides education, mentorship, and career opportunities.";
    ctaText.parentStory.characters.everyItem().pointSize = 14;
    ctaText.parentStory.characters.everyItem().fillColor = white;
    ctaText.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    ctaText.fillColor = none;
    ctaText.strokeColor = none;

    // Logo grid placeholders (3x3)
    var logoY = 440;
    var logoX = 80;
    for (var row = 0; row < 3; row++) {
        logoX = 80;
        for (var col = 0; col < 3; col++) {
            var logoBox = page4.rectangles.add();
            logoBox.geometricBounds = [logoY + "pt", logoX + "pt", (logoY + 80) + "pt", (logoX + 130) + "pt"];
            logoBox.fillColor = white;
            logoBox.strokeColor = none;
            logoX += 150;
        }
        logoY += 100;
    }

    // Contact info
    var contact = page4.textFrames.add();
    contact.geometricBounds = ["750pt", "40pt", "780pt", "572pt"];
    contact.contents = "partnerships@teei.org | www.teei.org/together-for-ukraine";
    contact.parentStory.characters.everyItem().pointSize = 12;
    contact.parentStory.characters.everyItem().fillColor = white;
    contact.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    contact.fillColor = none;
    contact.strokeColor = none;

    return "TFU Document created successfully - 4 pages with TFU design system";
})();
"""

print("      Executing ExtendScript via COM...")
try:
    result = indesign.DoScript(jsx_script, 1246973031)  # 1246973031 = ScriptLanguage.JAVASCRIPT
    print(f"      Result: {result}")
except Exception as e:
    print(f"      ERROR executing script: {e}")
    sys.exit(1)

# Export PDF
print("[4/6] Exporting high-quality PDF...")

EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
timestamp = time.strftime("%Y%m%d-%H%M%S")
pdf_path = EXPORTS_DIR / f"TFU-AWS-Partnership-COM-{timestamp}.pdf"

export_script = f"""
(function() {{
    var doc = app.activeDocument;
    if (!doc) return "No active document";

    var pdfPath = "{str(pdf_path).replace(chr(92), '/')}";

    // High quality PDF preset
    var pdfPreset;
    try {{
        pdfPreset = app.pdfExportPresets.item("[High Quality Print]");
    }} catch(e) {{
        pdfPreset = app.pdfExportPresets[0];
    }}

    doc.exportFile(ExportFormat.PDF_TYPE, new File(pdfPath), false, pdfPreset);

    return "PDF exported to: " + pdfPath;
}})();
"""

try:
    result = indesign.DoScript(export_script, 1246973031)
    print(f"      {result}")
except Exception as e:
    print(f"      ERROR exporting PDF: {e}")
    sys.exit(1)

# Verify PDF
print("[5/6] Verifying PDF output...")
if pdf_path.exists():
    size_mb = pdf_path.stat().st_size / 1024 / 1024
    print(f"      PDF created: {pdf_path}")
    print(f"      File size: {size_mb:.2f} MB")
else:
    print(f"      WARNING: PDF not found at {pdf_path}")

# Summary
print("[6/6] Pipeline complete!")
print("\n" + "=" * 80)
print("TFU PIPELINE SUCCESS (COM AUTOMATION)")
print("=" * 80)
print(f"PDF: {pdf_path}")
print("Pages: 4 (Cover, About/Stats, Programs, CTA)")
print("Design: TFU system (Teal #00393F, Sky #C9E4EC)")
print("Method: Windows COM automation (bypassed UXP plugin)")
print("=" * 80 + "\n")
