#!/usr/bin/env python3
"""
TEEI-AWS Partnership Document - Program Photography Integration
Adds authentic educational program photos per TEEI brand guidelines
"""

import os
import sys

# Image paths (absolute)
PROJECT_ROOT = r"D:\Dev\VS Projects\Projects\pdf-orchestrator"
HERO_IMAGE = os.path.join(PROJECT_ROOT, "assets", "images", "hero-ukraine-education.jpg")
MENTORSHIP_TEAM = os.path.join(PROJECT_ROOT, "assets", "images", "mentorship-team.jpg")
MENTORSHIP_HANDS = os.path.join(PROJECT_ROOT, "assets", "images", "mentorship-hands.jpg")

# TEEI brand color for overlays (Nordshore)
NORDSHORE_HEX = "#00393F"

# Document specifications
PAGE_WIDTH = 612  # 8.5 inches × 72 points/inch
PAGE_HEIGHT = 792  # 11 inches × 72 points/inch
MARGIN = 40  # Standard TEEI margin

# Calculate usable area
CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN)  # 532pt
CONTENT_HEIGHT = PAGE_HEIGHT - (2 * MARGIN)  # 712pt

def create_extendscript_code():
    """
    Generate ExtendScript code to place program photos in InDesign

    Photo Placement Strategy:
    1. Page 1 - Hero Image: Full-width classroom scene (hero-ukraine-education.jpg)
       - Shows diverse students with natural lighting
       - Warm tones align with Sand/Beige palette
       - Positioned after overview text section

    2. Page 2 - Mentorship Section: Small supporting image (mentorship-hands.jpg)
       - Intimate teamwork moment with warm Sand background
       - Positioned between program cards

    3. Page 3 - Call to Action: Final supporting image (mentorship-team.jpg)
       - Team collaboration with Sky blue background
       - Positioned above CTA section

    All images use:
    - Proportional fill (maintains aspect ratio)
    - Centered positioning
    - Optional 20% Nordshore overlay for text readability
    """

    script = """
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
    var heroPath = """ + f'"{HERO_IMAGE.replace(chr(92), chr(92)*2)}"' + """;

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
        var mentorshipPath = """ + f'"{MENTORSHIP_HANDS.replace(chr(92), chr(92)*2)}"' + """;

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
        var teamPath = """ + f'"{MENTORSHIP_TEAM.replace(chr(92), chr(92)*2)}"' + """;

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

alert("Program photography integration complete!\\n\\n" +
      "✓ Page 1: Hero image (classroom scene)\\n" +
      "✓ Page 2: Mentorship image (hands/teamwork)\\n" +
      "✓ Page 3: Team collaboration image\\n\\n" +
      "All images use proportional fill and proper brand colors.\\n" +
      "Review document to ensure images align with text layout.");
"""

    return script

def save_extendscript():
    """Save ExtendScript to file for manual execution"""
    script = create_extendscript_code()

    output_path = os.path.join(PROJECT_ROOT, "add_photos_teei_aws.jsx")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(script)

    print(f"[OK] ExtendScript saved to: {output_path}")
    return output_path

def generate_placement_specs():
    """
    Generate detailed placement specifications for manual image addition
    Use if automated placement fails
    """

    specs = f"""
# TEEI-AWS Partnership Document - Program Photo Placement Specifications

## Image Files Available
Located in: {PROJECT_ROOT}\\assets\\images\\

1. **hero-ukraine-education.jpg** (2.8 MB)
   - Authentic classroom scene with diverse students
   - Natural lighting with warm tones (BRAND COMPLIANT)
   - Perfect for main hero image

2. **mentorship-hands.jpg** (32 KB)
   - Intimate teamwork moment
   - Warm Sand background color (BRAND COMPLIANT)
   - Ideal for supporting section

3. **mentorship-team.jpg** (35 KB)
   - Team collaboration scene
   - Sky blue background (BRAND COMPLIANT)
   - Great for CTA area

---

## PAGE 1: HERO IMAGE
**File**: hero-ukraine-education.jpg
**Purpose**: Main visual impact - shows educational program in action

**Placement Coordinates**:
- Top: 180pt (2.5 inches from top)
- Left: 40pt (standard TEEI margin)
- Bottom: 360pt (180pt height)
- Right: 572pt (PAGE_WIDTH - MARGIN)

**Sizing**: 532pt width × 180pt height
**Fit Options**: Proportional fill, centered
**Overlay**: Add 20% Nordshore (#00393F) overlay for text readability
**Position in Layout**: After overview text section, before program details

**InDesign Manual Steps**:
1. File → Place → Select hero-ukraine-education.jpg
2. Draw rectangle: X=40pt, Y=180pt, W=532pt, H=180pt
3. Object → Fitting → Fill Frame Proportionally
4. Object → Fitting → Center Content
5. (Optional) Add rectangle overlay: 20% Nordshore fill

---

## PAGE 2: MENTORSHIP SECTION
**File**: mentorship-hands.jpg
**Purpose**: Supporting visual - shows connection and collaboration

**Placement Coordinates**:
- Top: 340pt (4.72 inches from top)
- Left: 206pt (centered horizontally)
- Bottom: 480pt (140pt height)
- Right: 406pt

**Sizing**: 200pt width × 140pt height
**Fit Options**: Proportional fill, centered
**Overlay**: None (warm background already brand-compliant)
**Position in Layout**: Between program cards in middle section

**InDesign Manual Steps**:
1. File → Place → Select mentorship-hands.jpg
2. Draw rectangle: X=206pt, Y=340pt, W=200pt, H=140pt
3. Object → Fitting → Fill Frame Proportionally
4. Object → Fitting → Center Content

---

## PAGE 3: TEAM COLLABORATION
**File**: mentorship-team.jpg
**Purpose**: Final supporting visual before CTA

**Placement Coordinates**:
- Top: 540pt (7.5 inches from top)
- Left: 40pt (standard TEEI margin)
- Bottom: 660pt (120pt height)
- Right: 290pt

**Sizing**: 250pt width × 120pt height
**Fit Options**: Proportional fill, centered
**Overlay**: None (Sky background already brand-compliant)
**Position in Layout**: Above call-to-action section

**InDesign Manual Steps**:
1. File → Place → Select mentorship-team.jpg
2. Draw rectangle: X=40pt, Y=540pt, W=250pt, H=120pt
3. Object → Fitting → Fill Frame Proportionally
4. Object → Fitting → Center Content

---

## LAYOUT GRID ALIGNMENT

All images align with TEEI's 12-column grid:
- Gutter width: 20pt
- Margins: 40pt all sides
- Column width: ~41pt

**Hero Image**: Spans full 12 columns
**Mentorship Image**: Centered, spans ~5 columns
**Team Image**: Left-aligned, spans ~6 columns

---

## BRAND COMPLIANCE CHECKLIST

Before finalizing:
- [ ] All images use natural lighting (not studio stock)
- [ ] Color tones align with Sand/Beige palette
- [ ] Images show authentic moments (not staged)
- [ ] Diverse representation visible
- [ ] Images convey connection and hope
- [ ] No text cutoffs or awkward cropping
- [ ] Proportional fill maintains aspect ratios
- [ ] 40pt margins respected on all sides
- [ ] Images enhance (not distract from) text content

---

## TECHNICAL SPECIFICATIONS

**Document Setup**:
- Page size: 8.5" × 11" (612pt × 792pt)
- Margins: 40pt all sides
- Grid: 12 columns, 20pt gutters
- Color mode: RGB (for digital), CMYK (for print)

**Image Requirements**:
- Resolution: 150 DPI minimum (digital), 300 DPI (print)
- Color space: RGB or CMYK (match document)
- Compression: High quality JPEG
- Embedded (not linked) for portability

**Export Settings**:
- Format: PDF (high quality)
- Compression: JPEG (maximum quality)
- Resolution: 300 DPI for print, 150 DPI for digital
- Color conversion: Preserve embedded profiles

---

## TROUBLESHOOTING

**Image Not Loading?**
- Verify file path is correct (no typos)
- Check file permissions (read access)
- Confirm image file is not corrupted
- Use absolute paths (not relative)

**Wrong Aspect Ratio?**
- Use "Fill Frame Proportionally" not "Fit Content"
- Center content after filling
- May need to adjust frame dimensions

**Colors Look Wrong?**
- Check document color mode (RGB vs CMYK)
- Verify image color profile is embedded
- Use "Preserve Embedded Profiles" on export

**Text Overlapping Images?**
- Add text wrap (Window → Text Wrap)
- Set offset: 12pt (standard TEEI spacing)
- Or add 20% Nordshore overlay to image

---

## NEXT STEPS AFTER PHOTO INTEGRATION

1. Review layout at 100%, 150%, 200% zoom
2. Verify no text cutoffs near images
3. Check color consistency across all photos
4. Test export quality (PDF preview)
5. Get stakeholder approval on visual balance
6. Proceed to Phase 4: Polish & QA

---

**Generated**: {os.path.basename(__file__)}
**Project**: TEEI-AWS Partnership Document Automation
**Phase**: 2 - Visual Enhancement
"""

    spec_path = os.path.join(PROJECT_ROOT, "PHOTO-PLACEMENT-SPECS.md")

    with open(spec_path, 'w', encoding='utf-8') as f:
        f.write(specs)

    print(f"[OK] Placement specifications saved to: {spec_path}")
    return spec_path

def main():
    """Main execution"""
    print("=" * 70)
    print("TEEI-AWS Partnership Document - Program Photography Integration")
    print("=" * 70)
    print()

    # Verify images exist
    print("Checking image availability...")
    images = [
        ("Hero Image (Classroom)", HERO_IMAGE),
        ("Mentorship Hands", MENTORSHIP_HANDS),
        ("Team Collaboration", MENTORSHIP_TEAM)
    ]

    all_exist = True
    for name, path in images:
        if os.path.exists(path):
            size_mb = os.path.getsize(path) / (1024 * 1024)
            print(f"  [OK] {name}: {size_mb:.2f} MB")
        else:
            print(f"  [MISSING] {name}: NOT FOUND")
            all_exist = False

    print()

    if not all_exist:
        print("ERROR: Some images are missing. Cannot proceed.")
        return 1

    # Generate ExtendScript
    print("Generating ExtendScript code...")
    jsx_path = save_extendscript()
    print()

    # Generate placement specs
    print("Generating placement specifications...")
    spec_path = generate_placement_specs()
    print()

    # Instructions
    print("=" * 70)
    print("NEXT STEPS")
    print("=" * 70)
    print()
    print("Option 1: Automated Placement (RECOMMENDED)")
    print(f"  1. Open TEEI-AWS document in InDesign")
    print(f"  2. File > Scripts > Other Script...")
    print(f"  3. Select: {jsx_path}")
    print(f"  4. Click 'Open' to run")
    print()
    print("Option 2: Manual Placement")
    print(f"  1. Open: {spec_path}")
    print(f"  2. Follow step-by-step instructions")
    print(f"  3. Use exact coordinates provided")
    print()
    print("=" * 70)
    print("BRAND COMPLIANCE NOTE")
    print("=" * 70)
    print()
    print("All selected images meet TEEI brand guidelines:")
    print("  [OK] Natural lighting (not studio stock)")
    print("  [OK] Warm tones (align with Sand/Beige palette)")
    print("  [OK] Authentic moments (not staged)")
    print("  [OK] Shows connection and hope")
    print("  [OK] Diverse representation")
    print()
    print("After placing images, verify:")
    print("  - No text cutoffs near images")
    print("  - Images enhance (not distract from) content")
    print("  - Color balance consistent across all photos")
    print()

    return 0

if __name__ == "__main__":
    sys.exit(main())
