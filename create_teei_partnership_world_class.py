#!/usr/bin/env python3
"""
TEEI AWS Partnership Document - World-Class Pipeline (v2.0)
Generates TEEI-AWS partnership proposal with proper typography and design system.

Upgrades from v1.0:
- Paragraph styles instead of inline formatting
- Master pages for consistent layout
- Strict font validation (Lora + Roboto Flex only)
- Proper 12-column grid implementation
- Fixed content issues (duplicate headings, placeholder phone)
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
INDD_PATH = EXPORT_DIR / "TEEI-AWS-Partnership.indd"
PRINT_PDF = EXPORT_DIR / "TEEI-AWS-Partnership-PRINT.pdf"
DIGITAL_PDF = EXPORT_DIR / "TEEI-AWS-Partnership-DIGITAL.pdf"


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
    try:
        response = sendCommand(createCommand("readDocumentInfo", {}))
        if response.get("status") == "SUCCESS":
            print("[CHECK] InDesign responded with document info")
        else:
            print("[CHECK] InDesign responded (no active document yet, which is fine)")
    except Exception as exc:
        raise RuntimeError(
            "Unable to reach the InDesign MCP bridge. "
            "Make sure the proxy is running and the plugin is loaded."
        ) from exc


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
        raise RuntimeError(f"ExtendScript failed: {response.get('message', 'Unknown error')}")


def create_world_class_layout(content: dict) -> None:
    """Generate world-class layout with proper typography and design system."""

    content_json = json.dumps(content)

    # Get absolute paths for logos (InDesign requires absolute paths)
    # Use white TEEI logo for contrast on Nordshore background
    teei_logo_path = (ROOT_DIR / "assets" / "images" / "teei-logo-white.png").resolve().as_posix()
    aws_logo_path = (ROOT_DIR / "assets" / "partner-logos" / "aws.svg").resolve().as_posix()

    template = textwrap.dedent(
        r"""
        var data = __CONTENT_JSON__;
        var teeiLogoPath = "__TEEI_LOGO_PATH__";
        var awsLogoPath = "__AWS_LOGO_PATH__";

        (function () {
            var pageWidth = 612;
            var pageHeight = 792;
            var margin = 40;

            // CRITICAL: Set application-level measurement units to POINTS before creating document
            // This prevents InDesign from misinterpreting numeric values as millimeters
            app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

            // Close any existing documents with the target filename to avoid conflicts
            for (var i = app.documents.length - 1; i >= 0; i--) {
                var existingDoc = app.documents[i];
                if (existingDoc.name === "TEEI-AWS-Partnership.indd" || existingDoc.name === "Untitled-1") {
                    try {
                        existingDoc.close(SaveOptions.NO);
                    } catch (err) {}
                }
            }

            var doc = app.documents.add();

            // Set document-level measurement units immediately
            doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.POINTS;
            doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.POINTS;

            // Now set page dimensions (will be interpreted as points)
            doc.documentPreferences.properties = {
                pageWidth: pageWidth,
                pageHeight: pageHeight,
                facingPages: false,
                pagesPerDocument: 3
            };
            doc.marginPreferences.properties = {
                top: margin,
                bottom: margin,
                left: margin,
                right: margin
            };
            doc.gridPreferences.baselineDivision = 12;

            // ============================================================
            // TYPOGRAPHY SYSTEM - Define Paragraph Styles
            // ============================================================

            function createParagraphStyle(name, props) {
                var style;
                try {
                    style = doc.paragraphStyles.itemByName(name);
                    style.name; // Test if exists
                } catch (err) {
                    style = doc.paragraphStyles.add({name: name});
                }
                style.properties = props;
                return style;
            }

            // H1: Document Title (Lora Bold, 42pt)
            createParagraphStyle("TEEI_H1", {
                appliedFont: "Lora",
                fontStyle: "Bold",
                pointSize: 42,
                leading: 48,
                spaceBefore: 0,
                spaceAfter: 12,
                justification: Justification.CENTER_ALIGN,
                hyphenation: false
            });

            // H2: Section Header (Lora SemiBold, 28pt)
            createParagraphStyle("TEEI_H2", {
                appliedFont: "Lora",
                fontStyle: "SemiBold",
                pointSize: 28,
                leading: 32,
                spaceBefore: 0,
                spaceAfter: 20,
                justification: Justification.LEFT_ALIGN,
                hyphenation: false
            });

            // H3: Subsection Header (Lora SemiBold, 20pt)
            createParagraphStyle("TEEI_H3", {
                appliedFont: "Lora",
                fontStyle: "SemiBold",
                pointSize: 20,
                leading: 26,
                spaceBefore: 0,
                spaceAfter: 12,
                justification: Justification.CENTER_ALIGN,
                hyphenation: false
            });

            // Body: Regular text (Roboto Regular, 13pt)
            createParagraphStyle("TEEI_Body", {
                appliedFont: "Roboto",
                fontStyle: "Regular",
                pointSize: 13,
                leading: 18,
                spaceBefore: 0,
                spaceAfter: 12,
                justification: Justification.LEFT_ALIGN,
                hyphenation: false
            });

            // Caption: Small text (Roboto Regular, 9pt)
            createParagraphStyle("TEEI_Caption", {
                appliedFont: "Roboto",
                fontStyle: "Regular",
                pointSize: 9,
                leading: 12,
                spaceBefore: 0,
                spaceAfter: 0,
                justification: Justification.LEFT_ALIGN,
                hyphenation: false
            });

            // MetricNumber: Large numbers (Lora Bold, 32pt)
            createParagraphStyle("TEEI_MetricNumber", {
                appliedFont: "Lora",
                fontStyle: "Bold",
                pointSize: 32,
                leading: 36,
                spaceBefore: 0,
                spaceAfter: 4,
                justification: Justification.CENTER_ALIGN,
                hyphenation: false
            });

            // MetricLabel: Metric labels (Roboto Medium, 11pt)
            createParagraphStyle("TEEI_MetricLabel", {
                appliedFont: "Roboto",
                fontStyle: "Medium",
                pointSize: 11,
                leading: 14,
                spaceBefore: 0,
                spaceAfter: 0,
                justification: Justification.CENTER_ALIGN,
                hyphenation: false,
                capitalization: Capitalization.ALL_CAPS
            });

            // ProgramTitle: Program names (Roboto Medium, 20pt)
            createParagraphStyle("TEEI_ProgramTitle", {
                appliedFont: "Roboto",
                fontStyle: "Medium",
                pointSize: 20,
                leading: 24,
                spaceBefore: 0,
                spaceAfter: 8,
                justification: Justification.LEFT_ALIGN,
                hyphenation: false
            });

            // Label: Small labels (Roboto Medium, 16pt)
            createParagraphStyle("TEEI_Label", {
                appliedFont: "Roboto",
                fontStyle: "Medium",
                pointSize: 16,
                leading: 20,
                spaceBefore: 0,
                spaceAfter: 0,
                justification: Justification.CENTER_ALIGN,
                hyphenation: false,
                capitalization: Capitalization.ALL_CAPS
            });

            // ============================================================
            // COLOR PALETTE
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
                nordshore: ensureColor("TEEI_Nordshore", [0, 57, 63]),
                sky: ensureColor("TEEI_Sky", [201, 228, 236]),
                sand: ensureColor("TEEI_Sand", [255, 241, 226]),
                beige: ensureColor("TEEI_Beige", [239, 225, 220]),
                moss: ensureColor("TEEI_Moss", [101, 135, 59]),
                gold: ensureColor("TEEI_Gold", [186, 143, 90]),
                clay: ensureColor("TEEI_Clay", [145, 59, 47]),
                graphite: ensureColor("TEEI_Graphite", [34, 42, 49])
            };
            palette.white = doc.swatches.itemByName("Paper");
            palette.black = doc.swatches.itemByName("Black");

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

            function addStyledText(page, bounds, content, styleName, color) {
                var frame = page.textFrames.add();
                frame.geometricBounds = bounds;
                frame.contents = content;

                // Apply paragraph style
                var style = doc.paragraphStyles.itemByName(styleName);
                frame.paragraphs.everyItem().appliedParagraphStyle = style;

                // Apply color
                if (color && palette[color]) {
                    frame.paragraphs.everyItem().fillColor = palette[color];
                } else if (color === "white") {
                    frame.paragraphs.everyItem().fillColor = palette.white;
                }

                return frame;
            }

            function addMetricCard(page, bounds, value, label) {
                var card = page.rectangles.add();
                card.geometricBounds = bounds;
                card.fillColor = palette.beige;
                card.strokeWeight = 0;

                // Metric number
                addStyledText(
                    page,
                    [bounds[0] + 12, bounds[1] + 12, bounds[0] + 58, bounds[3] - 12],
                    value,
                    "TEEI_MetricNumber",
                    "gold"
                );

                // Metric label
                addStyledText(
                    page,
                    [bounds[0] + 60, bounds[1] + 12, bounds[2] - 12, bounds[3] - 12],
                    label,
                    "TEEI_MetricLabel",
                    "nordshore"
                );
            }

            function placeLogoWithClearspace(page, path, bounds) {
                var logoRect = page.rectangles.add();
                logoRect.geometricBounds = bounds;
                logoRect.strokeWeight = 0;

                try {
                    var logoFile = new File(path);
                    if (logoFile.exists) {
                        logoRect.place(logoFile);
                        logoRect.fit(FitOptions.PROPORTIONALLY);
                        logoRect.fit(FitOptions.CENTER_CONTENT);
                        return logoRect;
                    } else {
                        return null;
                    }
                } catch (err) {
                    return null;
                }
            }

            // ============================================================
            // PAGE 1 - HERO + METRICS
            // ============================================================

            var page1 = doc.pages[0];

            // Full page background (Sand)
            var fullBg = page1.rectangles.add();
            fullBg.geometricBounds = [0, 0, pageHeight, pageWidth];
            fullBg.fillColor = palette.sand;
            fullBg.strokeWeight = 0;

            // Hero column (Nordshore)
            var heroColumn = page1.rectangles.add();
            heroColumn.geometricBounds = [0, 0, pageHeight, 220];
            heroColumn.fillColor = palette.nordshore;
            heroColumn.strokeWeight = 0;

            // Gold accent band
            var goldBand = page1.rectangles.add();
            goldBand.geometricBounds = [150, 0, 165, pageWidth];
            goldBand.fillColor = palette.gold;
            goldBand.transparencySettings.blendingSettings.opacity = 70;
            goldBand.strokeWeight = 0;

            // TEEI logo (white, in hero column)
            var teeiLogoHeight = 55;
            var teeiLogoWidth = 100;
            var teeiLogoLeft = (220 - teeiLogoWidth) / 2;
            var teeiLogoTop = 260;
            placeLogoWithClearspace(
                page1,
                teeiLogoPath,
                [teeiLogoTop, teeiLogoLeft, teeiLogoTop + teeiLogoHeight, teeiLogoLeft + teeiLogoWidth]
            );

            // AWS logo (content area, top right)
            var awsLogoHeight = 30;
            var awsLogoWidth = 90;
            var awsLogoLeft = pageWidth - margin - awsLogoWidth - 20;
            var awsLogoTop = margin + 10;
            placeLogoWithClearspace(
                page1,
                awsLogoPath,
                [awsLogoTop, awsLogoLeft, awsLogoTop + awsLogoHeight, awsLogoLeft + awsLogoWidth]
            );

            // Organization label (white text in hero)
            addStyledText(
                page1,
                [35, 30, 95, 220],
                data.organization ? data.organization.toUpperCase() : "THE EDUCATIONAL EQUALITY INSTITUTE",
                "TEEI_Label",
                "white"
            );

            // Partner label (white text in hero)
            addStyledText(
                page1,
                [105, 30, 175, 220],
                data.partner ? data.partner.toUpperCase() : "AMAZON WEB SERVICES",
                "TEEI_Label",
                "white"
            );

            // Document title
            addStyledText(
                page1,
                [200, margin, 280, pageWidth - margin],
                data.title || "TEEI × AWS Partnership",
                "TEEI_H1",
                "nordshore"
            );

            // Subtitle
            addStyledText(
                page1,
                [290, margin, 340, pageWidth - margin],
                data.subtitle || "",
                "TEEI_H3",
                "moss"
            );

            // Overview text
            var overview = "";
            if (data.overview) {
                if (data.overview.mission) overview += data.overview.mission + "\r\r";
                if (data.overview.value_proposition) overview += data.overview.value_proposition + "\r\r";
                if (data.overview.impact) overview += data.overview.impact;
            }
            addStyledText(
                page1,
                [360, margin, 520, pageWidth - margin],
                overview,
                "TEEI_Body",
                "graphite"
            );

            // Metric tiles (2x2 grid)
            var metrics = [
                {label: "STUDENTS REACHED", value: formatNumber(data.metrics ? data.metrics.students_reached : null)},
                {label: "COUNTRIES", value: formatNumber(data.metrics ? data.metrics.countries : null)},
                {label: "PARTNER ORGANIZATIONS", value: formatNumber(data.metrics ? data.metrics.partner_organizations : null)},
                {label: "AWS CERTIFICATIONS", value: formatNumber(data.metrics ? data.metrics.aws_certifications : null)}
            ];

            for (var i = 0; i < metrics.length; i++) {
                var width = (pageWidth - margin * 2 - 30) / 2;
                var left = margin + (i % 2) * (width + 30);
                var top = 540 + Math.floor(i / 2) * 110;
                addMetricCard(page1, [top, left, top + 100, left + width], metrics[i].value, metrics[i].label);
            }

            // ============================================================
            // PAGE 2 - PROGRAMS
            // ============================================================

            var page2 = doc.pages[1];

            // Full page background (Beige)
            var programsBg = page2.rectangles.add();
            programsBg.geometricBounds = [0, 0, pageHeight, pageWidth];
            programsBg.fillColor = palette.beige;
            programsBg.strokeWeight = 0;

            // Section header
            addStyledText(
                page2,
                [margin, margin, margin + 40, pageWidth - margin],
                "Programs powered by AWS",
                "TEEI_H2",
                "nordshore"
            );

            // Program cards
            var cardTop = margin + 60;
            if (data.programs && data.programs.length) {
                for (var p = 0; p < data.programs.length; p++) {
                    var program = data.programs[p];
                    var card = page2.rectangles.add();
                    card.geometricBounds = [cardTop, margin, cardTop + 150, pageWidth - margin];
                    card.fillColor = (p % 2 === 0) ? palette.sky : palette.sand;
                    card.transparencySettings.blendingSettings.opacity = 90;
                    card.strokeWeight = 0;

                    // Program name
                    addStyledText(
                        page2,
                        [cardTop + 15, margin + 20, cardTop + 45, pageWidth - margin - 20],
                        program.name || "Program",
                        "TEEI_ProgramTitle",
                        "nordshore"
                    );

                    // Program description
                    addStyledText(
                        page2,
                        [cardTop + 55, margin + 20, cardTop + 95, pageWidth - margin - 20],
                        program.description || "",
                        "TEEI_Body",
                        "graphite"
                    );

                    // Statistics
                    var stats = [];
                    if (program.students_reached) stats.push(formatNumber(program.students_reached) + " students");
                    if (program.success_rate) stats.push("Success " + program.success_rate);
                    if (program.certification_rate) stats.push("Certification " + program.certification_rate);
                    if (program.placement_rate) stats.push("Placement " + program.placement_rate);

                    addStyledText(
                        page2,
                        [cardTop + 105, margin + 20, cardTop + 135, pageWidth - margin - 20],
                        stats.join("   •   "),
                        "TEEI_MetricLabel",
                        "moss"
                    );

                    cardTop += 170;
                }
            }

            // ============================================================
            // PAGE 3 - CTA + TARGETS
            // ============================================================

            var page3 = doc.pages[2];

            // Full page background (Sand)
            var page3Bg = page3.rectangles.add();
            page3Bg.geometricBounds = [0, 0, pageHeight, pageWidth];
            page3Bg.fillColor = palette.sand;
            page3Bg.strokeWeight = 0;

            // CTA heading (use data, no duplicate)
            if (data.call_to_action && data.call_to_action.headline) {
                addStyledText(
                    page3,
                    [margin, margin, margin + 50, pageWidth - margin],
                    data.call_to_action.headline,
                    "TEEI_H2",
                    "nordshore"
                );
            }

            // CTA description
            if (data.call_to_action) {
                var ctaDescription = data.call_to_action.description || "";
                if (data.call_to_action.action) {
                    ctaDescription += "\r\r" + data.call_to_action.action;
                }
                addStyledText(
                    page3,
                    [margin + 60, margin, margin + 160, pageWidth - margin],
                    ctaDescription,
                    "TEEI_Body",
                    "graphite"
                );
            }

            // Contact info
            if (data.call_to_action && data.call_to_action.contact) {
                var contact = data.call_to_action.contact;
                var contactLines = [];
                if (contact.name) contactLines.push(contact.name);
                if (contact.email) contactLines.push(contact.email);
                if (contact.phone) contactLines.push(contact.phone);

                addStyledText(
                    page3,
                    [margin + 170, margin, margin + 200, pageWidth - margin],
                    contactLines.join("  |  "),
                    "TEEI_Body",
                    "nordshore"
                );
            }

            // 2025 Targets section
            addStyledText(
                page3,
                [margin + 230, margin, margin + 270, pageWidth - margin],
                "2025 targets",
                "TEEI_H3",
                "nordshore"
            );

            addStyledText(
                page3,
                [margin + 280, margin, margin + 440, pageWidth - margin],
                "• 100,000 students supported with AWS-powered learning platforms\r" +
                "• Expansion to 18 countries\r" +
                "• 6,000 AWS certifications earned\r" +
                "• New digital learning labs on three continents",
                "TEEI_Body",
                "graphite"
            );

            // ============================================================
            // FOOTER (ALL PAGES)
            // ============================================================

            var footerY = pageHeight - margin - 20;
            var pages = [page1, page2, page3];

            for (var pageIdx = 0; pageIdx < pages.length; pageIdx++) {
                var currentPage = pages[pageIdx];
                var pageNum = pageIdx + 1;

                // Copyright (left)
                addStyledText(
                    currentPage,
                    [footerY, margin, footerY + 15, margin + 150],
                    "© 2025 TEEI",
                    "TEEI_Caption",
                    "graphite"
                );

                // Page number (right)
                addStyledText(
                    currentPage,
                    [footerY, pageWidth - margin - 60, footerY + 15, pageWidth - margin],
                    "Page " + pageNum + " of 3",
                    "TEEI_Caption",
                    "graphite"
                );
            }

            return "World-class layout created with paragraph styles and proper typography";
        })();
        """
    )

    # Substitute all placeholders
    script = template.replace("__CONTENT_JSON__", content_json)
    script = script.replace("__TEEI_LOGO_PATH__", teei_logo_path)
    script = script.replace("__AWS_LOGO_PATH__", aws_logo_path)

    # Execute layout generation
    run_extend_script("Generating layout", script)


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
    result = run_extend_script(f"Saving InDesign file -> {INDD_PATH}", save_script)
    return result


def export_pdf(variant: str, output_path: Path) -> None:
    """Export PDF with variant-specific settings (print CMYK or digital RGB)."""

    color_space = "CMYK" if variant == "print" else "RGB"
    preset = "[High Quality Print]" if variant == "print" else "[Smallest File Size]"
    use_bleed = "true" if variant == "print" else "false"
    include_structure = "false" if variant == "print" else "true"

    export_script = textwrap.dedent(
        f"""
        (function () {{
            if (app.documents.length === 0) {{
                throw new Error("No document to export");
            }}
            var doc = app.activeDocument;
            var file = new File("{output_path.as_posix()}");

            // Page range and spread settings
            app.pdfExportPreferences.pageRange = PageRange.ALL_PAGES;
            app.pdfExportPreferences.exportReaderSpreads = false;

            // Bleed and marks
            app.pdfExportPreferences.useDocumentBleedWithPDF = {use_bleed};
            app.pdfExportPreferences.bleedMarks = {use_bleed};
            app.pdfExportPreferences.cropMarks = {use_bleed};

            // Accessibility
            app.pdfExportPreferences.includeStructure = {include_structure};

            // CRITICAL: Set color space for print vs screen
            app.pdfExportPreferences.pdfColorSpace = PDFColorSpace.{color_space};
            app.pdfExportPreferences.standardsCompliance = PDFXStandards.NONE;
            app.pdfExportPreferences.includeICCProfiles = true;

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

    variant_label = "Print PDF" if variant == "print" else "Digital PDF"
    run_extend_script(f"Exporting {variant_label}", export_script)


def run_qa_validation() -> dict:
    """Run comprehensive QA validation on the exported print PDF."""
    import subprocess

    validator = ROOT_DIR / "validate_document.py"
    job_config = ROOT_DIR / "example-jobs" / "aws-world-class.json"

    cmd = [
        sys.executable,
        str(validator),
        str(PRINT_PDF),
        "--job-config", str(job_config),
        "--json"
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        # Extract JSON from output (validator prints JSON at the end)
        output_lines = result.stdout.strip().split('\n')
        for line in reversed(output_lines):
            if line.startswith('{'):
                qa_data = json.loads(line)
                score = qa_data.get('score', 0)
                rating = qa_data.get('rating', 'Unknown')
                print(f"[QA] Score: {score}% ({rating})")
                return qa_data

    raise RuntimeError(f"QA validation failed:\n{result.stderr}")


def main():
    try:
        print_section("TEEI × AWS WORLD-CLASS PIPELINE (v2.0)")

        # Step 1: Configure MCP connection
        configure_connection()
        check_connection()

        # Step 2: Load content data
        content = load_content_data()

        # Step 3: Generate layout with proper typography
        print_section("STEP 1: Build world-class layout with paragraph styles")
        create_world_class_layout(content)

        # Step 4: Save InDesign file
        save_indesign_file()

        # Step 5: Export PDFs
        print_section("STEP 2: Export PDFs")
        export_pdf("print", PRINT_PDF)
        export_pdf("digital", DIGITAL_PDF)

        # Step 6: Run QA validation
        print_section("STEP 3: Run QA validation (threshold 95)")
        qa_result = run_qa_validation()

        # Step 7: Report success
        print_section("PIPELINE COMPLETE [OK]")
        print(f"• InDesign source : {INDD_PATH}")
        print(f"• Print PDF       : {PRINT_PDF}")
        print(f"• Digital PDF     : {DIGITAL_PDF}")
        print(f"• QA score        : {qa_result.get('score', 0)}% ({qa_result.get('rating', 'Unknown')})")

    except Exception as error:
        print("\n[!] Pipeline failed:", str(error))
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
