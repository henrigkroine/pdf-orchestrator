#!/usr/bin/env python3
"""
TEEI AWS Partnership Document - TFU Design System (v3.0)
Generates 4-page TEEI-AWS partnership proposal matching Together for Ukraine visual family.

DESIGN SYSTEM: Together for Ukraine (TFU)
- Full teal cover with centered photo card
- Two-column About + Goals with stats sidebar
- Two-column text-based program matrix
- Full teal closing CTA with TFU badge and partner logo grid

Color Palette: Teal #00393F primary, Light Blue #C9E4EC accents, NO GOLD
Typography: Lora (serif) + Roboto (sans serif) only
Layout: 612×792pt, 40pt margins, 12-column grid

Reference: TEEI_PRINT_DESIGN_SYSTEM_FROM_OVERVIEWS.md
Spec: DESIGN_SPEC_AWS_PARTNERSHIP_TEEI_STYLE.md
"""

import sys, json, textwrap
from pathlib import Path

# Add MCP module to path
sys.path.insert(0, str(Path(__file__).parent / "adb-mcp" / "mcp"))

from core import sendCommand, createCommand, init
import socket_client

# MCP Configuration
APPLICATION = "indesign"
PROXY_URL = "http://localhost:8013"
PROXY_TIMEOUT = 60

ROOT_DIR = Path(__file__).parent
CONTENT_FILE = ROOT_DIR / "data" / "partnership-aws-example.json"
EXPORT_DIR = ROOT_DIR / "exports"
INDD_PATH = EXPORT_DIR / "TEEI-AWS-Partnership-TFU.indd"
PRINT_PDF = EXPORT_DIR / "TEEI-AWS-Partnership-TFU-PRINT.pdf"
DIGITAL_PDF = EXPORT_DIR / "TEEI-AWS-Partnership-TFU-DIGITAL.pdf"


def print_section(title: str, message: str = "") -> None:
    print("\n" + "=" * 70)
    print(title.upper())
    print("=" * 70)
    if message:
        print(message)


def configure_connection() -> None:
    socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=PROXY_TIMEOUT)
    init(APPLICATION, socket_client)
    print(f"[CONFIG] Connected to InDesign MCP bridge at {PROXY_URL}")


def check_connection() -> None:
    # Skip connection check - will verify when executing ExtendScript
    print("[CHECK] InDesign MCP bridge configured")


def load_content_data(path: Path = CONTENT_FILE) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    print(f"[DATA] Loaded content: {data.get('title', 'Untitled')}")
    return data


def run_extend_script(description: str, script: str) -> dict:
    """Execute ExtendScript in InDesign and return response."""
    print(f"[MCP] {description} ...")
    response = sendCommand(createCommand("executeExtendScript", {"code": script}))
    if response.get("status") == "SUCCESS":
        print(f"[MCP] {description} complete")
        return response.get("response", {})
    else:
        msg = response.get('message', 'Unknown error')
        raise RuntimeError(f"ExtendScript failed: {msg}")


def create_tfu_layout(content: dict) -> None:
    """Generate TFU-compliant 4-page layout matching Together for Ukraine design system."""

    content_json = json.dumps(content)

    # Asset paths (absolute paths required by InDesign)
    teei_logo_white = (ROOT_DIR / "assets" / "images" / "teei-logo-white.png").resolve().as_posix()

    template = textwrap.dedent(
        r"""
        var data = __CONTENT_JSON__;
        var teeiLogoPath = "__TEEI_LOGO_PATH__";

        (function () {
            var pageWidth = 612;
            var pageHeight = 792;
            var margin = 40;

            // Set measurement units to points
            app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

            // Close existing documents to avoid conflicts
            for (var i = app.documents.length - 1; i >= 0; i--) {
                var existingDoc = app.documents[i];
                if (existingDoc.name.indexOf("TEEI-AWS") !== -1 || existingDoc.name === "Untitled-1") {
                    try {
                        existingDoc.close(SaveOptions.NO);
                    } catch (err) {}
                }
            }

            // Create new document - 4 PAGES (not 3!)
            var doc = app.documents.add();
            doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.POINTS;
            doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.POINTS;

            doc.documentPreferences.properties = {
                pageWidth: pageWidth,
                pageHeight: pageHeight,
                facingPages: false,
                pagesPerDocument: 4  // TFU system = 4 pages
            };
            doc.marginPreferences.properties = {
                top: margin,
                bottom: margin,
                left: margin,
                right: margin
            };
            doc.gridPreferences.baselineDivision = 12;

            // ============================================================
            // COLOR PALETTE - TFU SYSTEM (NO GOLD!)
            // ============================================================

            function ensureColor(name, rgbArray) {
                var swatch;
                try {
                    swatch = doc.colors.item(name);
                    swatch.name;
                } catch (err) {
                    swatch = doc.colors.add();
                    swatch.name = name;
                    swatch.space = ColorSpace.RGB;
                    swatch.model = ColorModel.PROCESS;
                    swatch.colorValue = rgbArray;
                }
                return swatch;
            }

            var palette = {
                // TFU CORE COLORS
                teal: ensureColor("TFU_Teal", [0, 57, 63]),        // #00393F - PRIMARY
                lightBlue: ensureColor("TFU_LightBlue", [201, 228, 236]),  // #C9E4EC - Stats box
                // TFU BADGE COLORS
                blue: ensureColor("TFU_Blue", [61, 92, 166]),       // #3D5CA6 - Badge left
                yellow: ensureColor("TFU_Yellow", [255, 213, 0]),   // #FFD500 - Badge right
                // NEUTRAL
                graphite: ensureColor("TFU_Graphite", [34, 42, 49])
            };
            palette.white = doc.swatches.itemByName("Paper");
            palette.black = doc.swatches.itemByName("Black");

            // ============================================================
            // TYPOGRAPHY SYSTEM - TFU STYLES
            // ============================================================

            function createParagraphStyle(name, props) {
                var style;
                try {
                    style = doc.paragraphStyles.itemByName(name);
                    style.name;
                } catch (err) {
                    style = doc.paragraphStyles.add({name: name});
                }
                style.properties = props;
                return style;
            }

            // TFU Cover Title (Lora Bold 60pt white)
            createParagraphStyle("TFU_CoverTitle", {
                appliedFont: "Lora",
                fontStyle: "Bold",
                pointSize: 60,
                leading: 68,
                fillColor: palette.white,
                justification: Justification.CENTER_ALIGN,
                hyphenation: false
            });

            // TFU Cover Subtitle (Roboto 14pt ALL CAPS white)
            createParagraphStyle("TFU_CoverSubtitle", {
                appliedFont: "Roboto",
                fontStyle: "Regular",
                pointSize: 14,
                leading: 18,
                fillColor: palette.white,
                capitalization: Capitalization.ALL_CAPS,
                justification: Justification.CENTER_ALIGN,
                hyphenation: false
            });

            // TFU Page Heading (Lora 46pt teal)
            createParagraphStyle("TFU_Heading", {
                appliedFont: "Lora",
                fontStyle: "Regular",
                pointSize: 46,
                leading: 52,
                fillColor: palette.teal,
                justification: Justification.LEFT_ALIGN,
                hyphenation: false,
                spaceAfter: 20
            });

            // TFU Section Heading (Lora SemiBold 22pt teal)
            createParagraphStyle("TFU_SectionHeading", {
                appliedFont: "Lora",
                fontStyle: "SemiBold",
                pointSize: 22,
                leading: 28,
                fillColor: palette.teal,
                justification: Justification.LEFT_ALIGN,
                hyphenation: false,
                spaceAfter: 12
            });

            // TFU Body Text (Roboto 12pt black)
            createParagraphStyle("TFU_Body", {
                appliedFont: "Roboto",
                fontStyle: "Regular",
                pointSize: 12,
                leading: 18,
                fillColor: palette.black,
                justification: Justification.LEFT_ALIGN,
                hyphenation: false,
                spaceAfter: 12
            });

            // TFU Stat Number (Lora Bold 34pt teal)
            createParagraphStyle("TFU_StatNumber", {
                appliedFont: "Lora",
                fontStyle: "Bold",
                pointSize: 34,
                leading: 38,
                fillColor: palette.teal,
                justification: Justification.CENTER_ALIGN,
                hyphenation: false,
                spaceAfter: 4
            });

            // TFU Stat Label (Roboto 10pt teal ALL CAPS)
            createParagraphStyle("TFU_StatLabel", {
                appliedFont: "Roboto",
                fontStyle: "Regular",
                pointSize: 10,
                leading: 13,
                fillColor: palette.teal,
                capitalization: Capitalization.ALL_CAPS,
                justification: Justification.CENTER_ALIGN,
                hyphenation: false
            });

            // TFU Program Label (Roboto 11pt teal ALL CAPS)
            createParagraphStyle("TFU_ProgramLabel", {
                appliedFont: "Roboto",
                fontStyle: "Medium",
                pointSize: 11,
                leading: 14,
                fillColor: palette.teal,
                capitalization: Capitalization.ALL_CAPS,
                justification: Justification.LEFT_ALIGN,
                hyphenation: false,
                spaceAfter: 4
            });

            // TFU Program Name (Lora SemiBold 20pt teal)
            createParagraphStyle("TFU_ProgramName", {
                appliedFont: "Lora",
                fontStyle: "SemiBold",
                pointSize: 20,
                leading: 26,
                fillColor: palette.teal,
                justification: Justification.LEFT_ALIGN,
                hyphenation: false,
                spaceAfter: 8
            });

            // ============================================================
            // HELPER FUNCTIONS
            // ============================================================

            function formatNumber(value) {
                if (typeof value === "number") {
                    var str = value.toString();
                    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
                return value || "—";
            }

            function addStyledText(page, bounds, content, styleName) {
                var frame = page.textFrames.add();
                frame.geometricBounds = bounds;
                frame.contents = content;

                var style = doc.paragraphStyles.itemByName(styleName);
                frame.paragraphs.everyItem().appliedParagraphStyle = style;

                return frame;
            }

            function placeLogo(page, path, bounds) {
                var rect = page.rectangles.add();
                rect.geometricBounds = bounds;
                rect.strokeWeight = 0;

                try {
                    var logoFile = new File(path);
                    if (logoFile.exists) {
                        rect.place(logoFile);
                        rect.fit(FitOptions.PROPORTIONALLY);
                        rect.fit(FitOptions.CENTER_CONTENT);
                        return rect;
                    }
                } catch (err) {}
                return null;
            }

            function drawCurvedDivider(page, startX, startY, width) {
                // Decorative curved line under major headings (TFU pattern)
                var line = page.graphicLines.add();
                line.paths[0].pathPoints[0].anchor = [startY, startX];
                line.paths[0].pathPoints[0].rightDirection = [startY, startX + width/3];
                line.paths[0].pathPoints.add();
                line.paths[0].pathPoints[1].leftDirection = [startY, startX + (2*width/3)];
                line.paths[0].pathPoints[1].anchor = [startY, startX + width];
                line.strokeWeight = 2;
                line.strokeColor = palette.teal;
                return line;
            }

            // ============================================================
            // PAGE 1: TFU COVER (Full Teal + Centered Photo Card)
            // ============================================================

            var page1 = doc.pages[0];

            // Full page teal background
            var coverBg = page1.rectangles.add();
            coverBg.geometricBounds = [0, 0, pageHeight, pageWidth];
            coverBg.fillColor = palette.teal;
            coverBg.strokeWeight = 0;

            // TEEI logo (white, top-left)
            var logoWidth = 100;
            var logoHeight = 55;
            placeLogo(page1, teeiLogoPath, [margin, margin, margin + logoHeight, margin + logoWidth]);

            // Hero photo card (centered, rounded corners)
            var cardWidth = 460;
            var cardHeight = 420;
            var cardLeft = (pageWidth - cardWidth) / 2;
            var cardTop = 210;

            var photoCard = page1.rectangles.add();
            photoCard.geometricBounds = [cardTop, cardLeft, cardTop + cardHeight, cardLeft + cardWidth];
            photoCard.fillColor = palette.white;
            photoCard.strokeWeight = 0;

            // Round the corners
            try {
                photoCard.cornerOptions = {
                    cornerOption: CornerOptions.ROUNDED_CORNER,
                    cornerRadius: 24
                };
            } catch (err) {}

            // TODO: Place actual photo inside card when available
            // For now, leave as white placeholder

            // Document title
            addStyledText(
                page1,
                [cardTop + cardHeight + 30, margin, cardTop + cardHeight + 100, pageWidth - margin],
                "Together for Ukraine",
                "TFU_CoverTitle"
            );

            // Subtitle
            addStyledText(
                page1,
                [cardTop + cardHeight + 110, margin, cardTop + cardHeight + 140, pageWidth - margin],
                "AWS PARTNERSHIP",
                "TFU_CoverSubtitle"
            );

            // ============================================================
            // PAGE 2: ABOUT + GOALS (Hero Photo + Two-Column + Stats Sidebar)
            // ============================================================

            var page2 = doc.pages[1];

            // Hero photo placeholder (full width at top)
            var heroPhoto = page2.rectangles.add();
            heroPhoto.geometricBounds = [0, 0, 200, pageWidth];
            heroPhoto.fillColor = palette.lightBlue;
            heroPhoto.strokeWeight = 0;
            // TODO: Place actual hero photo when available

            // Calculate column widths (60% / 35% with gutter)
            var contentTop = 220;
            var leftColWidth = (pageWidth - (2 * margin) - 20) * 0.60;
            var rightColWidth = (pageWidth - (2 * margin) - 20) * 0.40;
            var rightColLeft = margin + leftColWidth + 20;

            // Left column: Partnership narrative
            addStyledText(
                page2,
                [contentTop, margin, contentTop + 50, margin + leftColWidth],
                "About the Partnership",
                "TFU_Heading"
            );

            var narrative = "";
            if (data.overview) {
                if (data.overview.mission) narrative += data.overview.mission + "\r\r";
                if (data.overview.value_proposition) narrative += data.overview.value_proposition + "\r\r";
                if (data.overview.impact) narrative += data.overview.impact;
            }

            addStyledText(
                page2,
                [contentTop + 60, margin, pageHeight - margin - 80, margin + leftColWidth],
                narrative,
                "TFU_Body"
            );

            // Right column: Stats sidebar (light blue box)
            var statsBox = page2.rectangles.add();
            statsBox.geometricBounds = [contentTop, rightColLeft, pageHeight - margin - 80, pageWidth - margin];
            statsBox.fillColor = palette.lightBlue;
            statsBox.strokeWeight = 0;

            // Stats inside sidebar (vertical list with dividers)
            var metrics = [
                {value: formatNumber(data.metrics ? data.metrics.students_reached : 0), label: "STUDENTS\rREACHED"},
                {value: formatNumber(data.metrics ? data.metrics.countries : 0), label: "COUNTRIES"},
                {value: formatNumber(data.metrics ? data.metrics.partner_organizations : 0), label: "PARTNER\rORGANIZATIONS"},
                {value: formatNumber(data.metrics ? data.metrics.aws_certifications : 0), label: "AWS\rCERTIFICATIONS"}
            ];

            var statTop = contentTop + 30;
            for (var i = 0; i < metrics.length; i++) {
                addStyledText(
                    page2,
                    [statTop, rightColLeft + 15, statTop + 40, pageWidth - margin - 15],
                    metrics[i].value,
                    "TFU_StatNumber"
                );

                addStyledText(
                    page2,
                    [statTop + 44, rightColLeft + 15, statTop + 90, pageWidth - margin - 15],
                    metrics[i].label,
                    "TFU_StatLabel"
                );

                // Divider line (except after last stat)
                if (i < metrics.length - 1) {
                    var divider = page2.graphicLines.add();
                    divider.paths[0].pathPoints[0].anchor = [statTop + 100, rightColLeft + 30];
                    divider.paths[0].pathPoints.add();
                    divider.paths[0].pathPoints[1].anchor = [statTop + 100, pageWidth - margin - 30];
                    divider.strokeWeight = 1;
                    divider.strokeColor = palette.teal;
                }

                statTop += 120;
            }

            // ============================================================
            // PAGE 3: PROGRAMS MATRIX (Two-Column Text, NOT Cards)
            // ============================================================

            var page3 = doc.pages[2];

            // Page heading
            addStyledText(
                page3,
                [margin, margin, margin + 60, pageWidth - margin],
                "Programs powered by AWS",
                "TFU_Heading"
            );

            // Decorative curved divider
            drawCurvedDivider(page3, margin, margin + 70, 300);

            // Two-column program entries (editorial style, NOT cards!)
            var programTop = margin + 100;
            var col1Left = margin;
            var col2Left = pageWidth / 2 + 10;
            var colWidth = (pageWidth / 2) - margin - 20;

            if (data.programs && data.programs.length) {
                for (var p = 0; p < data.programs.length; p++) {
                    var program = data.programs[p];
                    var isLeftCol = (p % 2 === 0);
                    var colLeft = isLeftCol ? col1Left : col2Left;
                    var entryTop = programTop + Math.floor(p / 2) * 200;

                    // Program label (ALL CAPS)
                    addStyledText(
                        page3,
                        [entryTop, colLeft, entryTop + 15, colLeft + colWidth],
                        "PROGRAM " + (p + 1),
                        "TFU_ProgramLabel"
                    );

                    // Program name
                    addStyledText(
                        page3,
                        [entryTop + 20, colLeft, entryTop + 50, colLeft + colWidth],
                        program.name || "Program",
                        "TFU_ProgramName"
                    );

                    // Program description
                    addStyledText(
                        page3,
                        [entryTop + 58, colLeft, entryTop + 120, colLeft + colWidth],
                        program.description || "",
                        "TFU_Body"
                    );

                    // Statistics (inline, small text)
                    var stats = [];
                    if (program.students_reached) stats.push(formatNumber(program.students_reached) + " students");
                    if (program.success_rate) stats.push(program.success_rate + " success");
                    if (program.certification_rate) stats.push(program.certification_rate + " certified");
                    if (program.placement_rate) stats.push(program.placement_rate + " placed");

                    var statsFrame = page3.textFrames.add();
                    statsFrame.geometricBounds = [entryTop + 128, colLeft, entryTop + 160, colLeft + colWidth];
                    statsFrame.contents = stats.join("  •  ");
                    statsFrame.paragraphs.everyItem().appliedFont = "Roboto";
                    statsFrame.paragraphs.everyItem().pointSize = 10;
                    statsFrame.paragraphs.everyItem().leading = 14;
                    statsFrame.paragraphs.everyItem().fillColor = palette.graphite;
                }
            }

            // ============================================================
            // PAGE 4: CLOSING CTA (Full Teal + TFU Badge + Logo Grid)
            // ============================================================

            var page4 = doc.pages[3];

            // Full page teal background
            var closingBg = page4.rectangles.add();
            closingBg.geometricBounds = [0, 0, pageHeight, pageWidth];
            closingBg.fillColor = palette.teal;
            closingBg.strokeWeight = 0;

            // Together for Ukraine badge (blue + yellow boxes)
            var badgeWidth = 220;
            var badgeHeight = 42;
            var badgeLeft = (pageWidth - badgeWidth) / 2;
            var badgeTop = 90;

            // Left box (blue, "Together for")
            var badgeLeft1 = page4.rectangles.add();
            badgeLeft1.geometricBounds = [badgeTop, badgeLeft, badgeTop + badgeHeight, badgeLeft + (badgeWidth * 0.55)];
            badgeLeft1.fillColor = palette.blue;
            badgeLeft1.strokeWeight = 0;

            var badgeText1 = page4.textFrames.add();
            badgeText1.geometricBounds = [badgeTop + 8, badgeLeft + 10, badgeTop + badgeHeight - 8, badgeLeft + (badgeWidth * 0.55) - 10];
            badgeText1.contents = "Together for";
            badgeText1.paragraphs.everyItem().appliedFont = "Roboto";
            badgeText1.paragraphs.everyItem().fontStyle = "Medium";
            badgeText1.paragraphs.everyItem().pointSize = 16;
            badgeText1.paragraphs.everyItem().fillColor = palette.white;
            badgeText1.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;

            // Right box (yellow, "UKRAINE")
            var badgeLeft2 = page4.rectangles.add();
            badgeLeft2.geometricBounds = [badgeTop, badgeLeft + (badgeWidth * 0.55), badgeTop + badgeHeight, badgeLeft + badgeWidth];
            badgeLeft2.fillColor = palette.yellow;
            badgeLeft2.strokeWeight = 0;

            var badgeText2 = page4.textFrames.add();
            badgeText2.geometricBounds = [badgeTop + 8, badgeLeft + (badgeWidth * 0.55) + 10, badgeTop + badgeHeight - 8, badgeLeft + badgeWidth - 10];
            badgeText2.contents = "UKRAINE";
            badgeText2.paragraphs.everyItem().appliedFont = "Roboto";
            badgeText2.paragraphs.everyItem().fontStyle = "Bold";
            badgeText2.paragraphs.everyItem().pointSize = 18;
            badgeText2.paragraphs.everyItem().fillColor = palette.black;
            badgeText2.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
            badgeText2.paragraphs.everyItem().capitalization = Capitalization.ALL_CAPS;

            // Main CTA heading (white)
            var ctaHeading = "We are looking for more partners and supporters to work with us.";
            if (data.call_to_action && data.call_to_action.headline) {
                ctaHeading = data.call_to_action.headline;
            }

            var headingFrame = page4.textFrames.add();
            headingFrame.geometricBounds = [badgeTop + 80, margin + 30, badgeTop + 160, pageWidth - margin - 30];
            headingFrame.contents = ctaHeading;
            headingFrame.paragraphs.everyItem().appliedFont = "Lora";
            headingFrame.paragraphs.everyItem().fontStyle = "SemiBold";
            headingFrame.paragraphs.everyItem().pointSize = 32;
            headingFrame.paragraphs.everyItem().leading = 40;
            headingFrame.paragraphs.everyItem().fillColor = palette.white;
            headingFrame.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;

            // CTA description
            var ctaDesc = "";
            if (data.call_to_action) {
                if (data.call_to_action.description) ctaDesc = data.call_to_action.description;
            }

            var descFrame = page4.textFrames.add();
            descFrame.geometricBounds = [badgeTop + 170, margin + 60, badgeTop + 230, pageWidth - margin - 60];
            descFrame.contents = ctaDesc;
            descFrame.paragraphs.everyItem().appliedFont = "Roboto";
            descFrame.paragraphs.everyItem().pointSize = 14;
            descFrame.paragraphs.everyItem().leading = 20;
            descFrame.paragraphs.everyItem().fillColor = palette.white;
            descFrame.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;

            // Partner logo grid (3×3) - white placeholder boxes
            // In real implementation, would place actual partner logos
            var gridTop = badgeTop + 270;
            var boxSize = 80;
            var gridGutter = 20;
            var gridWidth = (3 * boxSize) + (2 * gridGutter);
            var gridLeft = (pageWidth - gridWidth) / 2;

            var partnerNames = ["Google", "Kintell", "Babbel", "Sanoma", "Oxford", "AWS", "Cornell", "Inco", "Bain"];

            for (var r = 0; r < 3; r++) {
                for (var c = 0; c < 3; c++) {
                    var logoBox = page4.rectangles.add();
                    var boxTop = gridTop + (r * (boxSize + gridGutter));
                    var boxLeft = gridLeft + (c * (boxSize + gridGutter));
                    logoBox.geometricBounds = [boxTop, boxLeft, boxTop + boxSize, boxLeft + boxSize];
                    logoBox.fillColor = palette.white;
                    logoBox.strokeWeight = 0;

                    // Placeholder text (in real version, place logo image)
                    var idx = (r * 3) + c;
                    if (idx < partnerNames.length) {
                        var logoText = page4.textFrames.add();
                        logoText.geometricBounds = [boxTop + 30, boxLeft + 10, boxTop + 50, boxLeft + boxSize - 10];
                        logoText.contents = partnerNames[idx];
                        logoText.paragraphs.everyItem().appliedFont = "Roboto";
                        logoText.paragraphs.everyItem().fontStyle = "Bold";
                        logoText.paragraphs.everyItem().pointSize = 9;
                        logoText.paragraphs.everyItem().fillColor = palette.teal;
                        logoText.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
                    }
                }
            }

            // Contact strip (bottom)
            var contact = data.call_to_action ? data.call_to_action.contact : null;
            var contactText = "";
            if (contact) {
                var parts = [];
                if (contact.phone) parts.push(contact.phone);
                if (contact.email) parts.push(contact.email);
                contactText = parts.join("  |  ");
            }

            var contactFrame = page4.textFrames.add();
            contactFrame.geometricBounds = [pageHeight - margin - 60, margin, pageHeight - margin - 35, pageWidth - margin];
            contactFrame.contents = contactText;
            contactFrame.paragraphs.everyItem().appliedFont = "Roboto";
            contactFrame.paragraphs.everyItem().pointSize = 11;
            contactFrame.paragraphs.everyItem().fillColor = palette.white;
            contactFrame.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;

            // TEEI logo (white, bottom-right)
            placeLogo(page4, teeiLogoPath, [pageHeight - margin - 50, pageWidth - margin - 90, pageHeight - margin, pageWidth - margin]);

            return "TFU-compliant 4-page layout created successfully";
        })();
        """
    )

    # Substitute placeholders
    script = template.replace("__CONTENT_JSON__", content_json)
    script = script.replace("__TEEI_LOGO_PATH__", teei_logo_white)

    # Execute layout generation
    run_extend_script("Generating TFU layout (4 pages)", script)


def save_indesign_file() -> None:
    """Save InDesign document to disk."""
    save_script = textwrap.dedent(
        f"""
        (function () {{
            if (app.documents.length === 0) {{
                throw new Error("No document to save");
            }}
            var file = new File("{INDD_PATH.as_posix()}");
            app.activeDocument.save(file);
            return file.fsName;
        }})();
        """
    )
    run_extend_script(f"Saving InDesign file -> {INDD_PATH.name}", save_script)


def export_pdf(variant: str, output_path: Path) -> None:
    """Export PDF with variant-specific settings."""

    color_space = "CMYK" if variant == "print" else "RGB"
    preset = "[High Quality Print]" if variant == "print" else "[Smallest File Size]"
    use_bleed = "true" if variant == "print" else "false"

    export_script = textwrap.dedent(
        f"""
        (function () {{
            if (app.documents.length === 0) {{
                throw new Error("No document to export");
            }}
            var doc = app.activeDocument;
            var file = new File("{output_path.as_posix()}");

            app.pdfExportPreferences.pageRange = PageRange.ALL_PAGES;
            app.pdfExportPreferences.exportReaderSpreads = false;
            app.pdfExportPreferences.useDocumentBleedWithPDF = {use_bleed};
            app.pdfExportPreferences.pdfColorSpace = PDFColorSpace.{color_space};
            app.pdfExportPreferences.standardsCompliance = PDFXStandards.NONE;

            var preset;
            try {{
                preset = app.pdfExportPresets.itemByName("{preset}");
                preset.name;
            }} catch (err) {{
                preset = app.pdfExportPresets.item(0);
            }}

            doc.exportFile(ExportFormat.PDF_TYPE, file, false, preset);
            return file.fsName;
        }})();
        """
    )

    variant_label = "Print PDF (CMYK)" if variant == "print" else "Digital PDF (RGB)"
    run_extend_script(f"Exporting {variant_label}", export_script)


def main():
    try:
        print_section("TEEI × AWS TFU DESIGN SYSTEM PIPELINE (v3.0)")
        print("[INFO] Generating 4-page PDF matching Together for Ukraine design family")

        # Step 1: Configure MCP connection
        configure_connection()
        check_connection()

        # Step 2: Load content data
        content = load_content_data()

        # Step 3: Generate TFU-compliant layout
        print_section("STEP 1: Build TFU-compliant layout (4 pages)")
        create_tfu_layout(content)

        # Step 4: Save InDesign file
        save_indesign_file()

        # Step 5: Export PDFs
        print_section("STEP 2: Export PDFs")
        export_pdf("print", PRINT_PDF)
        export_pdf("digital", DIGITAL_PDF)

        # Step 6: Report success
        print_section("PIPELINE COMPLETE", "[OK] TFU-compliant AWS partnership PDF generated")
        print(f"[FILE] InDesign source : {INDD_PATH}")
        print(f"[FILE] Print PDF (CMYK): {PRINT_PDF}")
        print(f"[FILE] Digital PDF (RGB): {DIGITAL_PDF}")
        print("\n[NOTE] This PDF now matches Together for Ukraine design system:")
        print("  - Full teal cover with centered photo card")
        print("  - Two-column About + Goals with stats sidebar")
        print("  - Two-column text-based program matrix (NOT cards)")
        print("  - Full teal closing CTA with TFU badge and 3x3 logo grid")
        print("  - NO gold color usage (teal primary only)")

    except Exception as error:
        print(f"\n[ERROR] Pipeline failed: {str(error)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
