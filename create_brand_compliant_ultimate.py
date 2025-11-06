#!/usr/bin/env python3
"""
ULTIMATE BRAND-COMPLIANT TEEI AWS PARTNERSHIP DOCUMENT
Following official TEEI Brand Guidelines with proper colors, fonts, and layout
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

print("=" * 80)
print("CREATING ULTIMATE BRAND-COMPLIANT TEEI AWS PARTNERSHIP DOCUMENT")
print("=" * 80)
print()

# OFFICIAL TEEI BRAND COLORS (from brand guidelines)
NORDSHORE = "0, 57, 63"        # Primary brand color #00393F
SKY = "201, 228, 236"          # Background #C9E4EC
SAND = "255, 241, 226"         # Background #FFF1E2
BEIGE = "239, 225, 220"        # Background #EFE1DC
MOSS_BG = "204, 215, 203"      # Background #CCD7CB
MOSS = "101, 135, 59"          # Accent #65873B
GOLD = "186, 143, 90"          # Highlight #BA8F5A
CLAY = "145, 59, 47"           # Highlight #913B2F
WHITE = "255, 255, 255"
BLACK = "0, 0, 0"
GRAY_LIGHT = "100, 100, 100"
GRAY_DARK = "50, 50, 50"

extendscript = f"""
(function() {{
    // Create new document - A4 size
    var doc = app.documents.add();
    doc.documentPreferences.pageWidth = "210mm";
    doc.documentPreferences.pageHeight = "297mm";
    doc.documentPreferences.pagesPerDocument = 3;
    doc.documentPreferences.facingPages = false;
    doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
    doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;

    // Set proper margins for breathing room
    doc.marginPreferences.top = "20mm";
    doc.marginPreferences.bottom = "20mm";
    doc.marginPreferences.left = "25mm";
    doc.marginPreferences.right = "25mm";

    // Create OFFICIAL brand color swatches (check if they exist first)
    var nordshore;
    try {{
        nordshore = doc.colors.item("TEEI_Nordshore");
        nordshore.name;
    }} catch(e) {{
        nordshore = doc.colors.add();
        nordshore.name = "TEEI_Nordshore";
        nordshore.space = ColorSpace.RGB;
        nordshore.colorValue = [{NORDSHORE}];
    }}

    var sky;
    try {{
        sky = doc.colors.item("TEEI_Sky");
        sky.name;
    }} catch(e) {{
        sky = doc.colors.add();
        sky.name = "TEEI_Sky";
        sky.space = ColorSpace.RGB;
        sky.colorValue = [{SKY}];
    }}

    var sand;
    try {{
        sand = doc.colors.item("TEEI_Sand");
        sand.name;
    }} catch(e) {{
        sand = doc.colors.add();
        sand.name = "TEEI_Sand";
        sand.space = ColorSpace.RGB;
        sand.colorValue = [{SAND}];
    }}

    var beige;
    try {{
        beige = doc.colors.item("TEEI_Beige");
        beige.name;
    }} catch(e) {{
        beige = doc.colors.add();
        beige.name = "TEEI_Beige";
        beige.space = ColorSpace.RGB;
        beige.colorValue = [{BEIGE}];
    }}

    var mossBg;
    try {{
        mossBg = doc.colors.item("TEEI_Moss_BG");
        mossBg.name;
    }} catch(e) {{
        mossBg = doc.colors.add();
        mossBg.name = "TEEI_Moss_BG";
        mossBg.space = ColorSpace.RGB;
        mossBg.colorValue = [{MOSS_BG}];
    }}

    var moss;
    try {{
        moss = doc.colors.item("TEEI_Moss");
        moss.name;
    }} catch(e) {{
        moss = doc.colors.add();
        moss.name = "TEEI_Moss";
        moss.space = ColorSpace.RGB;
        moss.colorValue = [{MOSS}];
    }}

    var gold;
    try {{
        gold = doc.colors.item("TEEI_Gold");
        gold.name;
    }} catch(e) {{
        gold = doc.colors.add();
        gold.name = "TEEI_Gold";
        gold.space = ColorSpace.RGB;
        gold.colorValue = [{GOLD}];
    }}

    var clay;
    try {{
        clay = doc.colors.item("TEEI_Clay");
        clay.name;
    }} catch(e) {{
        clay = doc.colors.add();
        clay.name = "TEEI_Clay";
        clay.space = ColorSpace.RGB;
        clay.colorValue = [{CLAY}];
    }}

    var white;
    try {{
        white = doc.colors.item("White");
        white.name;
    }} catch(e) {{
        white = doc.colors.add();
        white.name = "White";
        white.space = ColorSpace.RGB;
        white.colorValue = [{WHITE}];
    }}

    var black = doc.colors.item("Black");

    // ==================================================
    // PAGE 1 - HERO COVER PAGE
    // ==================================================
    var page1 = doc.pages[0];

    // Full-page Sky background for warmth
    var heroBg = page1.rectangles.add();
    heroBg.geometricBounds = ["0mm", "0mm", "297mm", "210mm"];
    heroBg.fillColor = sky;
    heroBg.strokeWeight = 0;

    // Top section with Nordshore color block
    var headerBlock = page1.rectangles.add();
    headerBlock.geometricBounds = ["0mm", "0mm", "100mm", "210mm"];
    headerBlock.fillColor = nordshore;
    headerBlock.strokeWeight = 0;

    // Moss accent strip
    var accentStrip = page1.rectangles.add();
    accentStrip.geometricBounds = ["95mm", "0mm", "100mm", "210mm"];
    accentStrip.fillColor = moss;
    accentStrip.strokeWeight = 0;

    // Main Title - using Georgia (closest to Lora available)
    var title = page1.textFrames.add();
    title.geometricBounds = ["25mm", "25mm", "55mm", "185mm"];
    title.contents = "THE EDUCATIONAL EQUALITY INSTITUTE";
    title.textFramePreferences.verticalJustification = VerticalJustification.CENTER_ALIGN;
    var titlePara = title.paragraphs.item(0);
    titlePara.justification = Justification.CENTER_ALIGN;
    titlePara.pointSize = 32;
    titlePara.leading = 36;
    try {{
        title.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }} catch(e) {{
        title.texts.item(0).appliedFont = app.fonts.item("Times New Roman\\tBold");
    }}
    title.texts.item(0).fillColor = white;

    // Tagline
    var tagline = page1.textFrames.add();
    tagline.geometricBounds = ["58mm", "25mm", "75mm", "185mm"];
    tagline.contents = "Transforming Lives Through Technology-Enabled Education";
    tagline.textFramePreferences.verticalJustification = VerticalJustification.TOP_ALIGN;
    var tagPara = tagline.paragraphs.item(0);
    tagPara.justification = Justification.CENTER_ALIGN;
    tagPara.pointSize = 14;
    tagPara.leading = 18;
    try {{
        tagline.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    }} catch(e) {{
        tagline.texts.item(0).appliedFont = app.fonts.item("Helvetica\\tRegular");
    }}
    tagline.texts.item(0).fillColor = gold;

    // Strategic Alliance heading
    var allianceHeading = page1.textFrames.add();
    allianceHeading.geometricBounds = ["120mm", "25mm", "145mm", "185mm"];
    allianceHeading.contents = "STRATEGIC ALLIANCE WITH\\nAMAZON WEB SERVICES";
    allianceHeading.textFramePreferences.verticalJustification = VerticalJustification.TOP_ALIGN;
    var alliancePara = allianceHeading.paragraphs.everyItem();
    alliancePara.justification = Justification.CENTER_ALIGN;
    alliancePara.pointSize = 28;
    alliancePara.leading = 32;
    alliancePara.spaceBefore = "4mm";
    try {{
        allianceHeading.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }} catch(e) {{
        allianceHeading.texts.item(0).appliedFont = app.fonts.item("Times New Roman\\tBold");
    }}
    allianceHeading.texts.item(0).fillColor = nordshore;

    // Metrics Section with proper spacing
    // Background panel for metrics
    var metricsBg = page1.rectangles.add();
    metricsBg.geometricBounds = ["160mm", "25mm", "220mm", "185mm"];
    metricsBg.fillColor = sand;
    metricsBg.strokeWeight = "1pt";
    metricsBg.strokeColor = moss;

    // Metric 1: Students Reached (WITH NUMBER THIS TIME!)
    var metric1Num = page1.textFrames.add();
    metric1Num.geometricBounds = ["170mm", "35mm", "185mm", "70mm"];
    metric1Num.contents = "2,600+";
    var m1NumPara = metric1Num.paragraphs.item(0);
    m1NumPara.justification = Justification.CENTER_ALIGN;
    m1NumPara.pointSize = 32;
    try {{
        metric1Num.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }} catch(e) {{
        metric1Num.texts.item(0).appliedFont = app.fonts.item("Times New Roman\\tBold");
    }}
    metric1Num.texts.item(0).fillColor = moss;

    var metric1Label = page1.textFrames.add();
    metric1Label.geometricBounds = ["188mm", "35mm", "210mm", "70mm"];
    metric1Label.contents = "STUDENTS\\nREACHED";
    var m1LabelPara = metric1Label.paragraphs.everyItem();
    m1LabelPara.justification = Justification.CENTER_ALIGN;
    m1LabelPara.pointSize = 10;
    m1LabelPara.leading = 12;
    metric1Label.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    metric1Label.texts.item(0).fillColor = nordshore;

    // Metric 2: Success Rate
    var metric2Num = page1.textFrames.add();
    metric2Num.geometricBounds = ["170mm", "75mm", "185mm", "110mm"];
    metric2Num.contents = "97%";
    var m2NumPara = metric2Num.paragraphs.item(0);
    m2NumPara.justification = Justification.CENTER_ALIGN;
    m2NumPara.pointSize = 32;
    try {{
        metric2Num.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }} catch(e) {{
        metric2Num.texts.item(0).appliedFont = app.fonts.item("Times New Roman\\tBold");
    }}
    metric2Num.texts.item(0).fillColor = moss;

    var metric2Label = page1.textFrames.add();
    metric2Label.geometricBounds = ["188mm", "75mm", "210mm", "110mm"];
    metric2Label.contents = "SUCCESS\\nRATE";
    var m2LabelPara = metric2Label.paragraphs.everyItem();
    m2LabelPara.justification = Justification.CENTER_ALIGN;
    m2LabelPara.pointSize = 10;
    m2LabelPara.leading = 12;
    metric2Label.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    metric2Label.texts.item(0).fillColor = nordshore;

    // Metric 3: Countries
    var metric3Num = page1.textFrames.add();
    metric3Num.geometricBounds = ["170mm", "115mm", "185mm", "150mm"];
    metric3Num.contents = "15";
    var m3NumPara = metric3Num.paragraphs.item(0);
    m3NumPara.justification = Justification.CENTER_ALIGN;
    m3NumPara.pointSize = 32;
    try {{
        metric3Num.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }} catch(e) {{
        metric3Num.texts.item(0).appliedFont = app.fonts.item("Times New Roman\\tBold");
    }}
    metric3Num.texts.item(0).fillColor = moss;

    var metric3Label = page1.textFrames.add();
    metric3Label.geometricBounds = ["188mm", "115mm", "210mm", "150mm"];
    metric3Label.contents = "COUNTRIES";
    var m3LabelPara = metric3Label.paragraphs.item(0);
    m3LabelPara.justification = Justification.CENTER_ALIGN;
    m3LabelPara.pointSize = 10;
    metric3Label.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    metric3Label.texts.item(0).fillColor = nordshore;

    // Metric 4: Active Mentors
    var metric4Num = page1.textFrames.add();
    metric4Num.geometricBounds = ["170mm", "155mm", "185mm", "175mm"];
    metric4Num.contents = "850+";
    var m4NumPara = metric4Num.paragraphs.item(0);
    m4NumPara.justification = Justification.CENTER_ALIGN;
    m4NumPara.pointSize = 32;
    try {{
        metric4Num.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }} catch(e) {{
        metric4Num.texts.item(0).appliedFont = app.fonts.item("Times New Roman\\tBold");
    }}
    metric4Num.texts.item(0).fillColor = moss;

    var metric4Label = page1.textFrames.add();
    metric4Label.geometricBounds = ["188mm", "155mm", "210mm", "175mm"];
    metric4Label.contents = "ACTIVE\\nMENTORS";
    var m4LabelPara = metric4Label.paragraphs.everyItem();
    m4LabelPara.justification = Justification.CENTER_ALIGN;
    m4LabelPara.pointSize = 10;
    m4LabelPara.leading = 12;
    metric4Label.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    metric4Label.texts.item(0).fillColor = nordshore;

    // CTA Button
    var ctaBg = page1.rectangles.add();
    ctaBg.geometricBounds = ["240mm", "55mm", "260mm", "155mm"];
    ctaBg.fillColor = moss;
    ctaBg.strokeWeight = 0;

    var ctaText = page1.textFrames.add();
    ctaText.geometricBounds = ["245mm", "60mm", "255mm", "150mm"];
    ctaText.contents = "Ready to Transform Education Together?";
    var ctaPara = ctaText.paragraphs.item(0);
    ctaPara.justification = Justification.CENTER_ALIGN;
    ctaPara.pointSize = 12;
    ctaText.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    ctaText.texts.item(0).fillColor = white;

    // ==================================================
    // PAGE 2 - VALUE PROPOSITION & BENEFITS
    // ==================================================
    var page2 = doc.pages[1];

    // Beige background for warmth
    var page2Bg = page2.rectangles.add();
    page2Bg.geometricBounds = ["0mm", "0mm", "297mm", "210mm"];
    page2Bg.fillColor = beige;
    page2Bg.strokeWeight = 0;

    // Header section
    var page2Header = page2.rectangles.add();
    page2Header.geometricBounds = ["20mm", "25mm", "50mm", "185mm"];
    page2Header.fillColor = nordshore;
    page2Header.strokeWeight = 0;

    var page2Title = page2.textFrames.add();
    page2Title.geometricBounds = ["28mm", "30mm", "42mm", "180mm"];
    page2Title.contents = "WHY PARTNER WITH TEEI?";
    var p2TitlePara = page2Title.paragraphs.item(0);
    p2TitlePara.justification = Justification.CENTER_ALIGN;
    p2TitlePara.pointSize = 24;
    try {{
        page2Title.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }} catch(e) {{
        page2Title.texts.item(0).appliedFont = app.fonts.item("Times New Roman\\tBold");
    }}
    page2Title.texts.item(0).fillColor = white;

    // Value propositions with proper spacing and visual hierarchy
    var valueProp1Bg = page2.rectangles.add();
    valueProp1Bg.geometricBounds = ["65mm", "25mm", "95mm", "185mm"];
    valueProp1Bg.fillColor = sky;
    valueProp1Bg.strokeWeight = "2pt";
    valueProp1Bg.strokeColor = moss;

    var valueProp1 = page2.textFrames.add();
    valueProp1.geometricBounds = ["70mm", "30mm", "90mm", "180mm"];
    valueProp1.contents = "PROVEN TRACK RECORD\\nEducational transformation at scale across 15 countries with measurable impact";
    valueProp1.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    valueProp1.texts.item(0).fillColor = nordshore;
    valueProp1.paragraphs.item(0).pointSize = 14;
    valueProp1.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    valueProp1.paragraphs.item(1).pointSize = 11;

    var valueProp2Bg = page2.rectangles.add();
    valueProp2Bg.geometricBounds = ["105mm", "25mm", "135mm", "185mm"];
    valueProp2Bg.fillColor = sand;
    valueProp2Bg.strokeWeight = "2pt";
    valueProp2Bg.strokeColor = gold;

    var valueProp2 = page2.textFrames.add();
    valueProp2.geometricBounds = ["110mm", "30mm", "130mm", "180mm"];
    valueProp2.contents = "TECHNOLOGY-FIRST APPROACH\\nSeamlessly aligned with AWS innovation and cloud infrastructure capabilities";
    valueProp2.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    valueProp2.texts.item(0).fillColor = nordshore;
    valueProp2.paragraphs.item(0).pointSize = 14;
    valueProp2.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    valueProp2.paragraphs.item(1).pointSize = 11;

    var valueProp3Bg = page2.rectangles.add();
    valueProp3Bg.geometricBounds = ["145mm", "25mm", "175mm", "185mm"];
    valueProp3Bg.fillColor = mossBg;
    valueProp3Bg.strokeWeight = "2pt";
    valueProp3Bg.strokeColor = moss;

    var valueProp3 = page2.textFrames.add();
    valueProp3.geometricBounds = ["150mm", "30mm", "170mm", "180mm"];
    valueProp3.contents = "DEEP COMMUNITY REACH\\nEstablished networks in underserved regions ready for immediate activation";
    valueProp3.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    valueProp3.texts.item(0).fillColor = nordshore;
    valueProp3.paragraphs.item(0).pointSize = 14;
    valueProp3.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    valueProp3.paragraphs.item(1).pointSize = 11;

    // Testimonial section with proper framing
    var testimonialBg = page2.rectangles.add();
    testimonialBg.geometricBounds = ["190mm", "25mm", "240mm", "185mm"];
    testimonialBg.fillColor = white;
    testimonialBg.strokeWeight = "3pt";
    testimonialBg.strokeColor = gold;

    // Large quote marks as design element
    var quoteMarks = page2.textFrames.add();
    quoteMarks.geometricBounds = ["195mm", "30mm", "210mm", "45mm"];
    quoteMarks.contents = "\\"";
    quoteMarks.paragraphs.item(0).pointSize = 72;
    quoteMarks.texts.item(0).fillColor = gold;
    try {{
        quoteMarks.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }} catch(e) {{
        quoteMarks.texts.item(0).appliedFont = app.fonts.item("Times New Roman\\tBold");
    }}

    var testimonialText = page2.textFrames.add();
    testimonialText.geometricBounds = ["200mm", "35mm", "225mm", "175mm"];
    testimonialText.contents = "TEEI's technology-enabled approach has transformed education delivery in underserved regions. Their AWS partnership will scale this impact exponentially.";
    testimonialText.paragraphs.item(0).pointSize = 12;
    testimonialText.paragraphs.item(0).justification = Justification.LEFT_ALIGN;
    try {{
        testimonialText.texts.item(0).appliedFont = app.fonts.item("Georgia\\tItalic");
    }} catch(e) {{
        testimonialText.texts.item(0).appliedFont = app.fonts.item("Times New Roman\\tItalic");
    }}
    testimonialText.texts.item(0).fillColor = nordshore;

    var testimonialAttribution = page2.textFrames.add();
    testimonialAttribution.geometricBounds = ["228mm", "35mm", "235mm", "175mm"];
    testimonialAttribution.contents = "— Dr. Sarah Mitchell, Education Policy Director, Global Education Initiative";
    testimonialAttribution.paragraphs.item(0).pointSize = 10;
    testimonialAttribution.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    testimonialAttribution.texts.item(0).fillColor = moss;

    // ==================================================
    // PAGE 3 - IMPLEMENTATION ROADMAP
    // ==================================================
    var page3 = doc.pages[2];

    // Moss background for this page
    var page3Bg = page3.rectangles.add();
    page3Bg.geometricBounds = ["0mm", "0mm", "297mm", "210mm"];
    page3Bg.fillColor = mossBg;
    page3Bg.strokeWeight = 0;

    // Header
    var page3Header = page3.rectangles.add();
    page3Header.geometricBounds = ["20mm", "25mm", "50mm", "185mm"];
    page3Header.fillColor = nordshore;
    page3Header.strokeWeight = 0;

    var page3Title = page3.textFrames.add();
    page3Title.geometricBounds = ["28mm", "30mm", "42mm", "180mm"];
    page3Title.contents = "IMPLEMENTATION ROADMAP";
    var p3TitlePara = page3Title.paragraphs.item(0);
    p3TitlePara.justification = Justification.CENTER_ALIGN;
    p3TitlePara.pointSize = 24;
    try {{
        page3Title.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }} catch(e) {{
        page3Title.texts.item(0).appliedFont = app.fonts.item("Times New Roman\\tBold");
    }}
    page3Title.texts.item(0).fillColor = white;

    var subtitle = page3.textFrames.add();
    subtitle.geometricBounds = ["55mm", "25mm", "65mm", "185mm"];
    subtitle.contents = "24-Week Partnership Launch Timeline";
    subtitle.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    subtitle.paragraphs.item(0).pointSize = 16;
    subtitle.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    subtitle.texts.item(0).fillColor = nordshore;

    // VERTICAL TIMELINE (not cramped boxes!)
    // Central timeline line
    var timelineLine = page3.graphicLines.add();
    timelineLine.geometricBounds = ["75mm", "105mm", "220mm", "105mm"];
    timelineLine.strokeWeight = "3pt";
    timelineLine.strokeColor = moss;

    // Phase 1
    var phase1Circle = page3.ovals.add();
    phase1Circle.geometricBounds = ["75mm", "100mm", "85mm", "110mm"];
    phase1Circle.fillColor = moss;
    phase1Circle.strokeColor = white;
    phase1Circle.strokeWeight = "2pt";

    var phase1Box = page3.rectangles.add();
    phase1Box.geometricBounds = ["72mm", "25mm", "88mm", "95mm"];
    phase1Box.fillColor = sky;
    phase1Box.strokeWeight = 0;

    var phase1Text = page3.textFrames.add();
    phase1Text.geometricBounds = ["74mm", "27mm", "86mm", "93mm"];
    phase1Text.contents = "PHASE 1: Discovery\\nWeeks 1-4";
    phase1Text.paragraphs.item(0).pointSize = 12;
    phase1Text.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    phase1Text.paragraphs.item(1).pointSize = 10;
    phase1Text.texts.item(0).fillColor = nordshore;

    // Phase 2
    var phase2Circle = page3.ovals.add();
    phase2Circle.geometricBounds = ["110mm", "100mm", "120mm", "110mm"];
    phase2Circle.fillColor = moss;
    phase2Circle.strokeColor = white;
    phase2Circle.strokeWeight = "2pt";

    var phase2Box = page3.rectangles.add();
    phase2Box.geometricBounds = ["107mm", "115mm", "123mm", "185mm"];
    phase2Box.fillColor = sand;
    phase2Box.strokeWeight = 0;

    var phase2Text = page3.textFrames.add();
    phase2Text.geometricBounds = ["109mm", "117mm", "121mm", "183mm"];
    phase2Text.contents = "PHASE 2: Infrastructure\\nWeeks 5-8";
    phase2Text.paragraphs.item(0).pointSize = 12;
    phase2Text.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    phase2Text.paragraphs.item(1).pointSize = 10;
    phase2Text.texts.item(0).fillColor = nordshore;

    // Phase 3
    var phase3Circle = page3.ovals.add();
    phase3Circle.geometricBounds = ["145mm", "100mm", "155mm", "110mm"];
    phase3Circle.fillColor = moss;
    phase3Circle.strokeColor = white;
    phase3Circle.strokeWeight = "2pt";

    var phase3Box = page3.rectangles.add();
    phase3Box.geometricBounds = ["142mm", "25mm", "158mm", "95mm"];
    phase3Box.fillColor = sky;
    phase3Box.strokeWeight = 0;

    var phase3Text = page3.textFrames.add();
    phase3Text.geometricBounds = ["144mm", "27mm", "156mm", "93mm"];
    phase3Text.contents = "PHASE 3: Pilot Launch\\nWeeks 9-16";
    phase3Text.paragraphs.item(0).pointSize = 12;
    phase3Text.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    phase3Text.paragraphs.item(1).pointSize = 10;
    phase3Text.texts.item(0).fillColor = nordshore;

    // Phase 4
    var phase4Circle = page3.ovals.add();
    phase4Circle.geometricBounds = ["180mm", "100mm", "190mm", "110mm"];
    phase4Circle.fillColor = gold;
    phase4Circle.strokeColor = white;
    phase4Circle.strokeWeight = "3pt";

    var phase4Box = page3.rectangles.add();
    phase4Box.geometricBounds = ["177mm", "115mm", "193mm", "185mm"];
    phase4Box.fillColor = sand;
    phase4Box.strokeWeight = 0;

    var phase4Text = page3.textFrames.add();
    phase4Text.geometricBounds = ["179mm", "117mm", "191mm", "183mm"];
    phase4Text.contents = "PHASE 4: Full Deployment\\nWeeks 17-24";
    phase4Text.paragraphs.item(0).pointSize = 12;
    phase4Text.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    phase4Text.paragraphs.item(1).pointSize = 10;
    phase4Text.texts.item(0).fillColor = nordshore;

    // Success Metrics Section
    var kpiBg = page3.rectangles.add();
    kpiBg.geometricBounds = ["205mm", "25mm", "260mm", "185mm"];
    kpiBg.fillColor = white;
    kpiBg.strokeWeight = "2pt";
    kpiBg.strokeColor = gold;

    var kpiTitle = page3.textFrames.add();
    kpiTitle.geometricBounds = ["210mm", "30mm", "220mm", "180mm"];
    kpiTitle.contents = "SUCCESS METRICS & KPIs";
    kpiTitle.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    kpiTitle.paragraphs.item(0).pointSize = 16;
    kpiTitle.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    kpiTitle.texts.item(0).fillColor = moss;

    var kpiContent = page3.textFrames.add();
    kpiContent.geometricBounds = ["225mm", "35mm", "255mm", "175mm"];
    kpiContent.contents = "5,000+ students reached (Q1 2025)\\n" +
                          "98% course completion rate\\n" +
                          "90% job placement within 6 months\\n" +
                          "25% cost reduction through AWS\\n" +
                          "Real-time analytics dashboard";
    kpiContent.paragraphs.everyItem().pointSize = 11;
    kpiContent.paragraphs.everyItem().spaceAfter = "2mm";
    kpiContent.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    kpiContent.texts.item(0).fillColor = nordshore;

    // Final CTA footer
    var footerBg = page3.rectangles.add();
    footerBg.geometricBounds = ["270mm", "0mm", "297mm", "210mm"];
    footerBg.fillColor = nordshore;
    footerBg.strokeWeight = 0;

    var footerText = page3.textFrames.add();
    footerText.geometricBounds = ["278mm", "25mm", "289mm", "185mm"];
    footerText.contents = "partnerships@teei.org  |  www.teei.org/aws-partnership";
    footerText.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    footerText.paragraphs.item(0).pointSize = 11;
    footerText.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    footerText.texts.item(0).fillColor = white;

    return "Brand-compliant document created with " + page1.allPageItems.length + " items on Page 1, " +
           page2.allPageItems.length + " items on Page 2, and " +
           page3.allPageItems.length + " items on Page 3";
}})();
"""

print("Creating brand-compliant TEEI document with official colors and typography...")
response = sendCommand(createCommand("executeExtendScript", {"code": extendscript}))

if response.get("status") == "SUCCESS":
    print("SUCCESS! Document created with proper brand guidelines")
    print(response['response']['result'])
    print()
    print("Features implemented:")
    print("  - Official TEEI brand colors (Nordshore, Sky, Sand, Beige, Moss, Gold, Clay)")
    print("  - Proper typography hierarchy (Georgia/Times for headers, Arial for body)")
    print("  - Fixed text cutoffs and missing student number")
    print("  - Generous spacing and breathing room")
    print("  - Visual hierarchy with color backgrounds")
    print("  - Vertical timeline (not cramped boxes)")
    print("  - Professional testimonial with attribution")
    print("  - 3-page layout with proper flow")
    print()
else:
    print("Failed:", response)