/**
 * TEEI AWS Partnership Document - Content Population
 * Populates 3-page document with content from aws-partnership-full.json
 *
 * BRAND COMPLIANCE:
 * - Colors: Nordshore #00393F, Sky #C9E4EC, Sand #FFF1E2, Gold #BA8F5A
 * - Typography: Lora (headlines), Roboto Flex (body)
 * - Layout: 12-column grid, 40pt margins, 60pt section breaks
 */

#target indesign

// TEEI Brand Colors (RGB for digital)
var COLORS = {
    NORDSHORE: {r: 0, g: 57, b: 63},      // #00393F
    SKY: {r: 201, g: 228, b: 236},        // #C9E4EC
    SAND: {r: 255, g: 241, b: 226},       // #FFF1E2
    GOLD: {r: 186, g: 143, b: 90},        // #BA8F5A
    WHITE: {r: 255, g: 255, b: 255},
    BLACK: {r: 0, g: 0, b: 0}
};

// Typography settings
var FONTS = {
    HEADLINE: "Lora\tBold",
    SUBHEAD: "Lora\tSemiBold",
    BODY: "Roboto Flex\tRegular",
    MEDIUM: "Roboto Flex\tMedium",
    BOLD: "Roboto Flex\tBold"
};

var SIZES = {
    TITLE: 42,
    SECTION_HEAD: 28,
    SUBHEAD: 18,
    BODY: 11,
    CAPTION: 9,
    METRIC: 36,
    METRIC_LABEL: 12
};

function createColorIfNeeded(doc, colorName, rgbValues) {
    try {
        return doc.colors.item(colorName);
    } catch (e) {
        var color = doc.colors.add();
        color.name = colorName;
        color.model = ColorModel.PROCESS;
        color.space = ColorSpace.RGB;
        color.colorValue = [rgbValues.r, rgbValues.g, rgbValues.b];
        return color;
    }
}

function setupColors(doc) {
    createColorIfNeeded(doc, "TEEI_Nordshore", COLORS.NORDSHORE);
    createColorIfNeeded(doc, "TEEI_Sky", COLORS.SKY);
    createColorIfNeeded(doc, "TEEI_Sand", COLORS.SAND);
    createColorIfNeeded(doc, "TEEI_Gold", COLORS.GOLD);
    createColorIfNeeded(doc, "White", COLORS.WHITE);
    createColorIfNeeded(doc, "Black", COLORS.BLACK);
}

function createTextFrame(page, bounds, content, fontSize, fontName, colorName) {
    var frame = page.textFrames.add();
    frame.geometricBounds = bounds;
    frame.contents = content;

    // Apply formatting to all paragraphs
    for (var i = 0; i < frame.paragraphs.length; i++) {
        frame.paragraphs[i].pointSize = fontSize;
        frame.paragraphs[i].appliedFont = app.fonts.item(fontName);
        frame.paragraphs[i].fillColor = app.activeDocument.colors.item(colorName);
    }

    return frame;
}

function createRectangle(page, bounds, fillColorName) {
    var rect = page.rectangles.add();
    rect.geometricBounds = bounds;
    rect.fillColor = app.activeDocument.colors.item(fillColorName);
    rect.strokeWeight = 0;
    return rect;
}

function populatePage1_Cover(doc) {
    var page = doc.pages[0];
    var pageWidth = 612;  // 8.5 inches
    var pageHeight = 792; // 11 inches
    var margin = 40;

    // Background - Sand color
    createRectangle(page, [0, 0, pageHeight, pageWidth], "TEEI_Sand");

    // Header band - Nordshore
    createRectangle(page, [0, 0, 120, pageWidth], "TEEI_Nordshore");

    // TEEI Logo placeholder (top left)
    createTextFrame(page, [40, 40, 80, 200],
        "TEEI", 24, FONTS.HEADLINE, "White");

    // AWS Logo placeholder (top right)
    createTextFrame(page, [40, pageWidth - 160, 80, pageWidth - 40],
        "AWS", 24, FONTS.HEADLINE, "White");

    // Main Title (centered, below header)
    var titleFrame = createTextFrame(page, [180, margin, 280, pageWidth - margin],
        "TEEI × AWS Partnership Proposal",
        SIZES.TITLE, FONTS.HEADLINE, "TEEI_Nordshore");
    titleFrame.paragraphs[0].justification = Justification.CENTER_ALIGN;

    // Subtitle (centered)
    var subtitleFrame = createTextFrame(page, [300, margin, 360, pageWidth - margin],
        "Transforming Education Through Cloud Technology",
        SIZES.SUBHEAD, FONTS.BODY, "TEEI_Nordshore");
    subtitleFrame.paragraphs[0].justification = Justification.CENTER_ALIGN;

    // Decorative accent line
    createRectangle(page, [380, 236, 384, 376], "TEEI_Gold");

    // Partnership highlight box
    var highlightBox = createRectangle(page, [440, 100, 640, 512], "TEEI_Sky");
    highlightBox.transparencySettings.blendingSettings.opacity = 30;

    var highlightText = createTextFrame(page, [460, 120, 620, 492],
        "Cloud-based learning platform serving 50,000+ students\n\n" +
        "99.9% uptime ensuring continuous access\n\n" +
        "AI-powered personalized learning\n\n" +
        "Global reach across 12 countries",
        SIZES.BODY, FONTS.BODY, "TEEI_Nordshore");
    highlightText.paragraphs.everyItem().spaceAfter = 8;
}

function populatePage2_OverviewPrograms(doc) {
    var page = doc.pages[1];
    var pageWidth = 612;
    var margin = 40;
    var yPos = 60;

    // Page background
    createRectangle(page, [0, 0, 792, pageWidth], "White");

    // Section: Partnership Vision
    createTextFrame(page, [yPos, margin, yPos + 40, pageWidth - margin],
        "Partnership Vision",
        SIZES.SECTION_HEAD, FONTS.SUBHEAD, "TEEI_Nordshore");
    yPos += 50;

    var visionText = "TEEI partners with AWS to deliver world-class cloud-based educational " +
        "resources to underserved communities worldwide. By leveraging AWS infrastructure, " +
        "we can scale our impact and reach students who need it most.";

    createTextFrame(page, [yPos, margin, yPos + 60, pageWidth - margin],
        visionText,
        SIZES.BODY, FONTS.BODY, "Black");
    yPos += 80;

    // Highlights with icons (simplified as bullets)
    var highlights = [
        "Cloud-based learning platform serving 50,000+ students",
        "99.9% uptime ensuring continuous access to education",
        "AI-powered personalized learning paths",
        "Global reach across 12 countries"
    ];

    for (var i = 0; i < highlights.length; i++) {
        // Accent dot
        var dot = page.ovals.add();
        dot.geometricBounds = [yPos, margin, yPos + 8, margin + 8];
        dot.fillColor = doc.colors.item("TEEI_Gold");
        dot.strokeWeight = 0;

        createTextFrame(page, [yPos - 4, margin + 20, yPos + 20, pageWidth - margin],
            highlights[i],
            SIZES.BODY, FONTS.BODY, "Black");
        yPos += 30;
    }

    yPos += 30;

    // Section: Programs
    createTextFrame(page, [yPos, margin, yPos + 40, pageWidth - margin],
        "Our Programs",
        SIZES.SECTION_HEAD, FONTS.SUBHEAD, "TEEI_Nordshore");
    yPos += 50;

    // Program 1: Digital Learning Platform
    var prog1Box = createRectangle(page, [yPos, margin, yPos + 100, pageWidth - margin], "TEEI_Sand");

    createTextFrame(page, [yPos + 15, margin + 15, yPos + 40, pageWidth - margin - 15],
        "Digital Learning Platform",
        16, FONTS.MEDIUM, "TEEI_Nordshore");

    createTextFrame(page, [yPos + 45, margin + 15, yPos + 70, pageWidth - margin - 15],
        "AWS-powered cloud infrastructure delivering educational content to remote communities",
        SIZES.BODY, FONTS.BODY, "Black");

    createTextFrame(page, [yPos + 75, margin + 15, yPos + 95, margin + 150],
        "35,000 students\n94% completion",
        SIZES.CAPTION, FONTS.BOLD, "TEEI_Gold");

    yPos += 110;

    // Program 2: Teacher Training Initiative
    var prog2Box = createRectangle(page, [yPos, margin, yPos + 100, pageWidth - margin], "TEEI_Sky");
    prog2Box.transparencySettings.blendingSettings.opacity = 20;

    createTextFrame(page, [yPos + 15, margin + 15, yPos + 40, pageWidth - margin - 15],
        "Teacher Training Initiative",
        16, FONTS.MEDIUM, "TEEI_Nordshore");

    createTextFrame(page, [yPos + 45, margin + 15, yPos + 70, pageWidth - margin - 15],
        "Professional development program equipping educators with modern cloud-based teaching tools",
        SIZES.BODY, FONTS.BODY, "Black");

    createTextFrame(page, [yPos + 75, margin + 15, yPos + 95, margin + 150],
        "10,000 students\n97% completion",
        SIZES.CAPTION, FONTS.BOLD, "TEEI_Gold");

    yPos += 110;

    // Program 3: STEM Excellence Program
    var prog3Box = createRectangle(page, [yPos, margin, yPos + 100, pageWidth - margin], "TEEI_Sand");

    createTextFrame(page, [yPos + 15, margin + 15, yPos + 40, pageWidth - margin - 15],
        "STEM Excellence Program",
        16, FONTS.MEDIUM, "TEEI_Nordshore");

    createTextFrame(page, [yPos + 45, margin + 15, yPos + 70, pageWidth - margin - 15],
        "Advanced computer science curriculum hosted on AWS infrastructure",
        SIZES.BODY, FONTS.BODY, "Black");

    createTextFrame(page, [yPos + 75, margin + 15, yPos + 95, margin + 150],
        "5,000 students\n91% completion",
        SIZES.CAPTION, FONTS.BOLD, "TEEI_Gold");
}

function populatePage3_MetricsCTA(doc) {
    var page = doc.pages[2];
    var pageWidth = 612;
    var margin = 40;
    var yPos = 60;

    // Page background
    createRectangle(page, [0, 0, 792, pageWidth], "White");

    // Section: Key Metrics
    createTextFrame(page, [yPos, margin, yPos + 40, pageWidth - margin],
        "Our Impact",
        SIZES.SECTION_HEAD, FONTS.SUBHEAD, "TEEI_Nordshore");
    yPos += 50;

    // Metrics row (3 columns)
    var colWidth = (pageWidth - 2 * margin - 40) / 3;

    // Metric 1: Students
    createTextFrame(page, [yPos, margin, yPos + 50, margin + colWidth],
        "50,000",
        SIZES.METRIC, FONTS.HEADLINE, "TEEI_Gold");
    createTextFrame(page, [yPos + 50, margin, yPos + 70, margin + colWidth],
        "Students Reached",
        SIZES.METRIC_LABEL, FONTS.BODY, "Black");

    // Metric 2: Completion
    createTextFrame(page, [yPos, margin + colWidth + 20, yPos + 50, margin + 2 * colWidth + 20],
        "95%",
        SIZES.METRIC, FONTS.HEADLINE, "TEEI_Gold");
    createTextFrame(page, [yPos + 50, margin + colWidth + 20, yPos + 70, margin + 2 * colWidth + 20],
        "Completion Rate",
        SIZES.METRIC_LABEL, FONTS.BODY, "Black");

    // Metric 3: Countries
    createTextFrame(page, [yPos, margin + 2 * colWidth + 40, yPos + 50, pageWidth - margin],
        "12",
        SIZES.METRIC, FONTS.HEADLINE, "TEEI_Gold");
    createTextFrame(page, [yPos + 50, margin + 2 * colWidth + 40, yPos + 70, pageWidth - margin],
        "Countries Served",
        SIZES.METRIC_LABEL, FONTS.BODY, "Black");

    yPos += 100;

    // Section: Testimonials
    createTextFrame(page, [yPos, margin, yPos + 40, pageWidth - margin],
        "What Our Partners Say",
        SIZES.SECTION_HEAD, FONTS.SUBHEAD, "TEEI_Nordshore");
    yPos += 50;

    // Testimonial 1
    var test1Box = createRectangle(page, [yPos, margin, yPos + 90, pageWidth - margin], "TEEI_Sky");
    test1Box.transparencySettings.blendingSettings.opacity = 20;

    createTextFrame(page, [yPos + 15, margin + 15, yPos + 60, pageWidth - margin - 15],
        "\"This partnership has transformed our ability to serve students in the most remote regions. " +
        "AWS infrastructure ensures our content reaches everyone.\"",
        SIZES.BODY, FONTS.BODY, "Black");

    createTextFrame(page, [yPos + 65, margin + 15, yPos + 85, pageWidth - margin - 15],
        "— Dr. Sarah Johnson, Program Director, TEEI",
        SIZES.CAPTION, FONTS.BODY, "TEEI_Nordshore");

    yPos += 100;

    // Testimonial 2
    var test2Box = createRectangle(page, [yPos, margin, yPos + 90, pageWidth - margin], "TEEI_SAND");
    test2Box.transparencySettings.blendingSettings.opacity = 20;

    createTextFrame(page, [yPos + 15, margin + 15, yPos + 60, pageWidth - margin - 15],
        "\"The cloud-based platform is reliable, scalable, and has enabled us to multiply our " +
        "impact by 10x in just two years.\"",
        SIZES.BODY, FONTS.BODY, "Black");

    createTextFrame(page, [yPos + 65, margin + 15, yPos + 85, pageWidth - margin - 15],
        "— Michael Chen, Technology Director, TEEI",
        SIZES.CAPTION, FONTS.BODY, "TEEI_Nordshore");

    yPos += 110;

    // Section: Call to Action
    var ctaBox = createRectangle(page, [yPos, margin, yPos + 130, pageWidth - margin], "TEEI_Nordshore");

    createTextFrame(page, [yPos + 20, margin + 20, yPos + 50, pageWidth - margin - 20],
        "Join Us in Making a Difference",
        24, FONTS.HEADLINE, "White");

    createTextFrame(page, [yPos + 55, margin + 20, yPos + 85, pageWidth - margin - 20],
        "Together, we can reach 100,000 students by 2026. Partner with TEEI to transform educational outcomes globally.",
        SIZES.BODY, FONTS.BODY, "White");

    // Contact info
    createTextFrame(page, [yPos + 95, margin + 20, yPos + 125, pageWidth - margin - 20],
        "Sarah Johnson, Partnership Director\nsarah.johnson@teei.org | +1 (555) 123-4567",
        SIZES.CAPTION, FONTS.BODY, "TEEI_Gold");
}

function main() {
    try {
        if (app.documents.length === 0) {
            alert("Error: No document open. Please open a 3-page InDesign document first.");
            return;
        }

        var doc = app.activeDocument;

        if (doc.pages.length < 3) {
            alert("Error: Document must have at least 3 pages. Current pages: " + doc.pages.length);
            return;
        }

        // Setup TEEI brand colors
        setupColors(doc);

        // Populate each page
        populatePage1_Cover(doc);
        populatePage2_OverviewPrograms(doc);
        populatePage3_MetricsCTA(doc);

        alert("✅ Content population complete!\n\n" +
              "Pages populated:\n" +
              "• Page 1: Cover with title and highlights\n" +
              "• Page 2: Partnership vision and 3 programs\n" +
              "• Page 3: Metrics, testimonials, and CTA\n\n" +
              "Next steps:\n" +
              "1. Review layout and spacing\n" +
              "2. Add real TEEI and AWS logos\n" +
              "3. Validate brand compliance\n" +
              "4. Export PDF");

    } catch (e) {
        alert("Error: " + e.message + "\n\nLine: " + e.line);
    }
}

main();
