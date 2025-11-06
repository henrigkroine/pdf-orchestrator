/**
 * Color Validation Tool for InDesign
 * Validates that all required brand colors are present and correctly applied
 * Run this directly in InDesign or via UXP plugin
 */

// Expected TEEI brand colors
const EXPECTED_COLORS = {
    "TEEI_Teal": {
        name: "TEEI Deep Teal",
        rgb: [0, 57, 63],
        hex: "#00393f",
        usage: "Headers, primary brand elements"
    },
    "TEEI_Gold": {
        name: "TEEI Gold Accent",
        rgb: [186, 143, 90],
        hex: "#BA8F5A",
        usage: "Accent lines, highlights, CTAs"
    },
    "TEEI_Light": {
        name: "TEEI Light Background",
        rgb: [248, 250, 252],
        hex: "#f8fafc",
        usage: "Metric boxes, light backgrounds"
    },
    "TEEI_DarkAccent": {
        name: "TEEI Dark Accent",
        rgb: [0, 47, 53],
        hex: "#002f35",
        usage: "Subtle dark accents"
    }
};

/**
 * Validate colors in the active document
 * @returns {Object} Validation results
 */
function validateColors() {
    const results = {
        timestamp: new Date().toISOString(),
        documentName: "No document",
        totalSwatches: 0,
        expectedColors: Object.keys(EXPECTED_COLORS).length,
        foundColors: [],
        missingColors: [],
        extraColors: [],
        colorUsage: {},
        validationPassed: false,
        score: 0
    };

    try {
        // Check if document is open
        if (!app.documents.length) {
            results.error = "No document open";
            return results;
        }

        const doc = app.activeDocument;
        results.documentName = doc.name;

        // Get all swatches in document
        const swatches = doc.colors.everyItem().getElements();
        results.totalSwatches = swatches.length;

        // Check for expected colors
        for (let colorKey in EXPECTED_COLORS) {
            const expectedColor = EXPECTED_COLORS[colorKey];
            let found = false;

            // Look for color by various naming conventions
            const possibleNames = [
                colorKey,
                expectedColor.name,
                `RGB_${expectedColor.rgb.join('_')}`,
                expectedColor.hex
            ];

            for (let i = 0; i < possibleNames.length; i++) {
                try {
                    const swatch = doc.colors.itemByName(possibleNames[i]);
                    if (swatch.isValid) {
                        found = true;
                        results.foundColors.push({
                            expected: colorKey,
                            found: swatch.name,
                            rgb: swatch.colorValue,
                            space: swatch.space
                        });
                        results.score += 20;
                        break;
                    }
                } catch (e) {
                    // Color not found with this name
                }
            }

            if (!found) {
                results.missingColors.push({
                    key: colorKey,
                    name: expectedColor.name,
                    hex: expectedColor.hex,
                    usage: expectedColor.usage
                });
            }
        }

        // Find extra colors (not in expected list)
        for (let i = 0; i < swatches.length; i++) {
            const swatch = swatches[i];
            const swatchName = swatch.name;

            // Skip default swatches
            if (swatchName === "None" || swatchName === "Paper" ||
                swatchName === "Black" || swatchName === "Registration") {
                continue;
            }

            // Check if this is an expected color
            let isExpected = false;
            for (let colorKey in EXPECTED_COLORS) {
                if (swatchName.indexOf(colorKey) !== -1 ||
                    swatchName.indexOf(EXPECTED_COLORS[colorKey].hex) !== -1) {
                    isExpected = true;
                    break;
                }
            }

            if (!isExpected) {
                results.extraColors.push({
                    name: swatchName,
                    rgb: swatch.colorValue,
                    space: swatch.space
                });
            }
        }

        // Analyze color usage in document
        results.colorUsage = analyzeColorUsage(doc);

        // Calculate final score
        if (results.foundColors.length === results.expectedColors) {
            results.score += 20; // Bonus for having all colors
        }

        // Validation passes if at least 75% of expected colors are found
        results.validationPassed = results.foundColors.length >= (results.expectedColors * 0.75);

    } catch (error) {
        results.error = error.toString();
        results.validationPassed = false;
    }

    return results;
}

/**
 * Analyze how colors are used in the document
 * @param {Document} doc - InDesign document
 * @returns {Object} Usage statistics
 */
function analyzeColorUsage(doc) {
    const usage = {
        rectangles: {},
        textFrames: {},
        lines: {},
        totalObjects: 0
    };

    try {
        const page = doc.pages[0];

        // Analyze rectangles
        const rectangles = page.rectangles.everyItem().getElements();
        usage.totalObjects += rectangles.length;

        for (let i = 0; i < rectangles.length; i++) {
            const rect = rectangles[i];
            if (rect.fillColor && rect.fillColor.name) {
                const colorName = rect.fillColor.name;
                usage.rectangles[colorName] = (usage.rectangles[colorName] || 0) + 1;
            }
        }

        // Analyze lines
        const lines = page.graphicLines.everyItem().getElements();
        usage.totalObjects += lines.length;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.strokeColor && line.strokeColor.name) {
                const colorName = line.strokeColor.name;
                usage.lines[colorName] = (usage.lines[colorName] || 0) + 1;
            }
        }

        // Analyze text frames
        const textFrames = page.textFrames.everyItem().getElements();
        usage.totalObjects += textFrames.length;

        for (let i = 0; i < textFrames.length; i++) {
            const frame = textFrames[i];
            // Check if frame has a fill color
            if (frame.fillColor && frame.fillColor.name) {
                const colorName = frame.fillColor.name;
                usage.textFrames[colorName] = (usage.textFrames[colorName] || 0) + 1;
            }
        }

    } catch (e) {
        usage.error = e.toString();
    }

    return usage;
}

/**
 * Fix missing colors by adding them to the document
 * @param {Array} missingColors - Array of missing color definitions
 * @returns {Object} Fix results
 */
function fixMissingColors(missingColors) {
    const results = {
        fixed: [],
        failed: []
    };

    if (!app.documents.length) {
        results.error = "No document open";
        return results;
    }

    const doc = app.activeDocument;

    for (let i = 0; i < missingColors.length; i++) {
        const colorDef = missingColors[i];

        try {
            // Find the expected color definition
            const expectedColor = EXPECTED_COLORS[colorDef.key];
            if (!expectedColor) continue;

            // Create the color
            const newColor = doc.colors.add();
            newColor.name = colorDef.key;
            newColor.space = ColorSpace.RGB;
            newColor.colorValue = expectedColor.rgb;

            results.fixed.push({
                name: colorDef.key,
                rgb: expectedColor.rgb,
                hex: expectedColor.hex
            });

        } catch (e) {
            results.failed.push({
                name: colorDef.key,
                error: e.toString()
            });
        }
    }

    return results;
}

/**
 * Generate a detailed color report
 * @param {Object} validation - Validation results
 * @returns {String} Formatted report
 */
function generateColorReport(validation) {
    let report = [];

    report.push("=" + "=".repeat(59));
    report.push("COLOR VALIDATION REPORT");
    report.push("=" + "=".repeat(59));
    report.push("");

    report.push("Document: " + validation.documentName);
    report.push("Time: " + validation.timestamp);
    report.push("Total Swatches: " + validation.totalSwatches);
    report.push("");

    report.push("EXPECTED COLORS (" + validation.expectedColors + "):");
    report.push("-" + "-".repeat(59));

    // Found colors
    if (validation.foundColors.length > 0) {
        report.push("✅ FOUND (" + validation.foundColors.length + "):");
        for (let i = 0; i < validation.foundColors.length; i++) {
            const color = validation.foundColors[i];
            report.push("  • " + color.expected + " -> " + color.found);
        }
        report.push("");
    }

    // Missing colors
    if (validation.missingColors.length > 0) {
        report.push("❌ MISSING (" + validation.missingColors.length + "):");
        for (let i = 0; i < validation.missingColors.length; i++) {
            const color = validation.missingColors[i];
            report.push("  • " + color.name + " (" + color.hex + ")");
            report.push("    Usage: " + color.usage);
        }
        report.push("");
    }

    // Extra colors
    if (validation.extraColors.length > 0) {
        report.push("⚠️  EXTRA COLORS (" + validation.extraColors.length + "):");
        for (let i = 0; i < validation.extraColors.length; i++) {
            const color = validation.extraColors[i];
            report.push("  • " + color.name);
        }
        report.push("");
    }

    // Color usage
    if (validation.colorUsage && validation.colorUsage.totalObjects > 0) {
        report.push("COLOR USAGE:");
        report.push("-" + "-".repeat(59));

        if (Object.keys(validation.colorUsage.rectangles).length > 0) {
            report.push("Rectangles:");
            for (let colorName in validation.colorUsage.rectangles) {
                report.push("  • " + colorName + ": " +
                           validation.colorUsage.rectangles[colorName] + " objects");
            }
        }

        if (Object.keys(validation.colorUsage.lines).length > 0) {
            report.push("Lines:");
            for (let colorName in validation.colorUsage.lines) {
                report.push("  • " + colorName + ": " +
                           validation.colorUsage.lines[colorName] + " objects");
            }
        }

        report.push("");
    }

    // Final score
    report.push("=" + "=".repeat(59));
    report.push("SCORE: " + validation.score + "/100");
    report.push("STATUS: " + (validation.validationPassed ? "✅ PASSED" : "❌ FAILED"));

    if (validation.missingColors.length > 0) {
        report.push("");
        report.push("💡 TIP: Run fixMissingColors() to add missing swatches");
    }

    report.push("=" + "=".repeat(59));

    return report.join("\n");
}

/**
 * Main execution function
 */
function main() {
    // Run validation
    const validation = validateColors();

    // Generate report
    const report = generateColorReport(validation);

    // Output to console
    $.writeln(report);

    // If colors are missing, offer to fix
    if (validation.missingColors.length > 0) {
        if (confirm("Missing colors detected. Would you like to add them?")) {
            const fixResults = fixMissingColors(validation.missingColors);

            $.writeln("\nFIX RESULTS:");
            $.writeln("Fixed: " + fixResults.fixed.length);
            $.writeln("Failed: " + fixResults.failed.length);

            if (fixResults.fixed.length > 0) {
                $.writeln("\n✅ Colors added successfully!");
                $.writeln("Note: You still need to apply them using ExtendScript");
            }
        }
    }

    // Return validation for use in automation
    return validation;
}

// Execute if run directly
if (typeof module === 'undefined') {
    main();
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateColors,
        fixMissingColors,
        analyzeColorUsage,
        generateColorReport,
        EXPECTED_COLORS
    };
}