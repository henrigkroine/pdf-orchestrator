
// TEEI-AWS Partnership Document - Program Photography Integration
// Brand-compliant image placement with proper sizing and overlays

#target indesign

// Ensure document is active
if (app.documents.length === 0) {
    alert("ERROR: No document is open. Please open the TEEI-AWS document first.");
    exit();
}

var doc = app.activeDocument;

// Verify we have at least 3 pages
if (doc.pages.length < 3) {
    alert("WARNING: Document has fewer than 3 pages. Some images may not be placed.");
}

// TEEI brand color (Nordshore) for overlays
var nordshoreColor = doc.colors.itemByName("Nordshore");
if (!nordshoreColor.isValid) {
    // Create Nordshore color if it doesn't exist
    nordshoreColor = doc.colors.add({
        name: "Nordshore",
        model: ColorModel.PROCESS,
        space: ColorSpace.RGB,
        colorValue: [0, 57, 63]  // RGB(0, 57, 63) = #00393F
    });
}

// Helper function to place image with proportional fill
function placeImage(page, imagePath, bounds, addOverlay) {
    try {
        // Validate image file exists
        var imageFile = new File(imagePath);
        if (!imageFile.exists) {
            alert("ERROR: Image not found: " + imagePath);
            return null;
        }

        // Create rectangle frame
        var frame = page.rectangles.add({
            geometricBounds: bounds,
            strokeWeight: 0  // No border
        });

        // Place image
        frame.place(imageFile);

        // Fit image proportionally (fill frame, maintain aspect ratio)
        frame.fit(FitOptions.PROPORTIONALLY);
        frame.fit(FitOptions.CENTER_CONTENT);

        // Add optional Nordshore overlay for text readability
        if (addOverlay) {
            var overlay = page.rectangles.add({
                geometricBounds: bounds,
                strokeWeight: 0,
                fillColor: nordshoreColor,
                fillTint: 20  // 20% opacity
            });
            overlay.sendToBack(frame);  // Place behind image
        }

        return frame;

    } catch (error) {
        alert("ERROR placing image: " + error.message);
        return null;
    }
}

// ============================================================================
// PAGE 1: HERO IMAGE
// ============================================================================
// Full-width classroom scene with natural lighting
// Position: After overview text section (~180pt from top)
// Size: Full content width × 180pt height
// Overlay: Yes (20% Nordshore for potential text overlay)

try {
    var page1 = doc.pages[0];
    var heroPath = "D:\\Dev\\VS Projects\\Projects\\pdf-orchestrator\\assets\\images\\hero-ukraine-education.jpg";

    var heroBounds = [
        180,  // Top (after header/overview section)
        40,   // Left (standard margin)
        360,  // Bottom (180pt height)
        572   // Right (PAGE_WIDTH - MARGIN)
    ];

    var heroFrame = placeImage(page1, heroPath, heroBounds, true);

    if (heroFrame) {
        $.writeln("✓ Hero image placed on page 1");
    }

} catch (error) {
    alert("ERROR on Page 1: " + error.message);
}

// ============================================================================
// PAGE 2: MENTORSHIP SECTION IMAGE
// ============================================================================
// Small supporting image showing teamwork/hands
// Position: Between program cards (middle of page)
// Size: 200pt × 140pt (smaller accent image)
// Overlay: No (already has warm Sand background)

try {
    if (doc.pages.length >= 2) {
        var page2 = doc.pages[1];
        var mentorshipPath = "D:\\Dev\\VS Projects\\Projects\\pdf-orchestrator\\assets\\images\\mentorship-hands.jpg";

        // Centered horizontally, positioned at page midpoint
        var imageWidth = 200;
        var imageHeight = 140;
        var leftPos = (612 - imageWidth) / 2;  // Center horizontally

        var mentorshipBounds = [
            340,                    // Top (middle section)
            leftPos,                // Left (centered)
            340 + imageHeight,      // Bottom
            leftPos + imageWidth    // Right
        ];

        var mentorshipFrame = placeImage(page2, mentorshipPath, mentorshipBounds, false);

        if (mentorshipFrame) {
            $.writeln("✓ Mentorship image placed on page 2");
        }
    }

} catch (error) {
    alert("ERROR on Page 2: " + error.message);
}

// ============================================================================
// PAGE 3: CALL TO ACTION SUPPORTING IMAGE
// ============================================================================
// Team collaboration image with Sky blue background
// Position: Above CTA section (bottom third of page)
// Size: Half-width × 120pt height (accent image)
// Overlay: No (Sky background already brand-compliant)

try {
    if (doc.pages.length >= 3) {
        var page3 = doc.pages[2];
        var teamPath = "D:\\Dev\\VS Projects\\Projects\\pdf-orchestrator\\assets\\images\\mentorship-team.jpg";

        var imageWidth = 250;  // Half content width
        var imageHeight = 120;
        var leftPos = 40;  // Align with left margin

        var teamBounds = [
            540,                   // Top (lower section, above CTA)
            leftPos,               // Left (standard margin)
            540 + imageHeight,     // Bottom
            leftPos + imageWidth   // Right
        ];

        var teamFrame = placeImage(page3, teamPath, teamBounds, false);

        if (teamFrame) {
            $.writeln("✓ Team collaboration image placed on page 3");
        }
    }

} catch (error) {
    alert("ERROR on Page 3: " + error.message);
}

// ============================================================================
// COMPLETION
// ============================================================================

alert("Program photography integration complete!\n\n" +
      "✓ Page 1: Hero image (classroom scene)\n" +
      "✓ Page 2: Mentorship image (hands/teamwork)\n" +
      "✓ Page 3: Team collaboration image\n\n" +
      "All images use proportional fill and proper brand colors.\n" +
      "Review document to ensure images align with text layout.");
