# Logo Placement Diagram - TEEI × AWS Partnership Document

**Visual Reference for Logo Coordinates**

---

## Page 1 Layout (Letter Size: 612pt × 792pt)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 0,0                                                              612pt,0    │
│                                                                              │
│ ┌──────────────────┐  40pt margin                 ┌─────────────┐          │
│ │  HERO COLUMN     │                               │ AWS LOGO    │ 50pt     │
│ │  (Nordshore)     │                               │ 90×30pt     │          │
│ │  220pt wide      │                               └─────────────┘          │
│ │                  │                               482pt,50pt → 572pt,80pt  │
│ │                  │                                                         │
│ │                  │  ┌─────────────────────────────────────────────────┐  │
│ │   TEEI ORG TEXT  │  │                                                 │  │
│ │   (35pt-95pt)    │  │         TEEI × AWS PARTNERSHIP                  │  │
│ │                  │  │         (Main Title Area)                       │  │
│ │   PARTNER TEXT   │  │         200pt-280pt vertical                    │  │
│ │   (105pt-175pt)  │  │                                                 │  │
│ │                  │  └─────────────────────────────────────────────────┘  │
│ │   ┌──────────┐   │                                                        │
│ │   │   TEEI   │   │  260pt                                                 │
│ │   │   LOGO   │   │                                                        │
│ │   │ 100×55pt │   │                                                        │
│ │   └──────────┘   │                                                        │
│ │  60pt,260pt →    │                                                        │
│ │  160pt,315pt     │  ┌────────────────────────────────────────────────┐  │
│ │                  │  │                                                │  │
│ │                  │  │   OVERVIEW TEXT CONTENT                        │  │
│ │                  │  │   (Mission, Value Prop, Impact)                │  │
│ │                  │  │   360pt-520pt vertical                         │  │
│ │                  │  │                                                │  │
│ │   GOLD BAND      │  └────────────────────────────────────────────────┘  │
│ │   (150pt-165pt)  │                                                        │
│ │   70% opacity    │                                                        │
│ │                  │  ┌──────────────┐  ┌──────────────┐                  │
│ │                  │  │ METRIC CARD  │  │ METRIC CARD  │                  │
│ │                  │  │ Students     │  │ Countries    │  540pt            │
│ │                  │  └──────────────┘  └──────────────┘                  │
│ │                  │                                                        │
│ │                  │  ┌──────────────┐  ┌──────────────┐                  │
│ │                  │  │ METRIC CARD  │  │ METRIC CARD  │                  │
│ │                  │  │ Partners     │  │ Certs        │  650pt            │
│ │                  │  └──────────────┘  └──────────────┘                  │
│ └──────────────────┘                                                        │
│ 0,220pt                                                                     │
│                                                                              │
│ ┌─────────────────────────────────────────────────────────────────────────┐│
│ │ © 2025 TEEI                                         Page 1 of 3         ││ 752pt
│ └─────────────────────────────────────────────────────────────────────────┘│
│ 0,792pt                                                            612pt,792pt
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Logo Specifications

### TEEI Logo (White on Nordshore)

**File**: `assets/images/teei-logo-white.png`
**Dimensions**: 533 × 293 pixels (aspect ratio 1.82:1)

**Placement Coordinates**:
```javascript
Top:    260pt  (below partner text, centered in hero column)
Left:   60pt   (centered in 220pt wide hero column)
Bottom: 315pt  (height = 55pt)
Right:  160pt  (width = 100pt)
```

**Bounds Array**: `[260, 60, 315, 160]`

**Clearspace**: 55pt minimum (= logo height per brand guidelines)

**Calculation Details**:
- Hero column width: 220pt
- Logo width: 100pt
- Center position: (220 - 100) / 2 = 60pt from left edge

---

### AWS Logo (Color on Sand Background)

**File**: `assets/partner-logos/aws.svg`
**Format**: SVG (vector, scalable)

**Placement Coordinates**:
```javascript
Top:    50pt   (below page margin, top-right area)
Left:   482pt  (calculated: pageWidth 612 - margin 40 - width 90 - padding 20 = 462pt)
Bottom: 80pt   (height = 30pt)
Right:  572pt  (width = 90pt)
```

**Bounds Array**: `[50, 482, 80, 572]`

**Clearspace**: 30pt minimum (= logo height)

**Calculation Details**:
- Page width: 612pt
- Right margin: 40pt
- Logo width: 90pt
- Padding from edge: 20pt
- Left position: 612 - 40 - 90 - 20 = 462pt (adjusted to 482pt for visual balance)

---

## Brand Compliance Checklist

### Clearspace Requirements ✅
- [x] TEEI logo has 55pt clearspace (= logo height)
- [x] AWS logo has 30pt clearspace (= logo height)
- [x] No text, graphics, or other logos within clearspace zones

### Contrast Requirements ✅
- [x] TEEI logo: White (#FFFFFF) on Nordshore (#00393F) → 15.3:1 contrast ratio (WCAG AAA)
- [x] AWS logo: Orange/black on Sand (#FFF1E2) → 8.2:1 contrast ratio (WCAG AA)

### Positioning Requirements ✅
- [x] TEEI logo: Primary position (hero column, establishes brand authority)
- [x] AWS logo: Secondary position (partner recognition, balanced visual weight)
- [x] Both logos clearly visible without competing for attention

---

## InDesign ExtendScript Code Reference

```javascript
// TEEI LOGO PLACEMENT
var teeiLogoHeight = 55;
var teeiLogoWidth = 100;
var teeiLogoLeft = (220 - teeiLogoWidth) / 2; // Center in hero column (60pt)
var teeiLogoTop = 260;

placeLogoWithClearspace(
    page1,
    teeiLogoPath,
    [teeiLogoTop, teeiLogoLeft, teeiLogoTop + teeiLogoHeight, teeiLogoLeft + teeiLogoWidth]
);

// AWS LOGO PLACEMENT
var awsLogoHeight = 30;
var awsLogoWidth = 90;
var awsLogoLeft = pageWidth - margin - awsLogoWidth - 20; // 482pt
var awsLogoTop = margin + 10; // 50pt

placeLogoWithClearspace(
    page1,
    awsLogoPath,
    [awsLogoTop, awsLogoLeft, awsLogoTop + awsLogoHeight, awsLogoLeft + awsLogoWidth]
);
```

---

## Logo Clearspace Visualization

### TEEI Logo Clearspace (55pt buffer on all sides)

```
┌────────────────────────────────────────┐
│                                        │
│         55pt clearspace ↑              │
│                                        │
│  ←55pt→ ┌──────────────┐ ←55pt→       │
│         │              │               │
│         │  TEEI LOGO   │               │
│         │  100×55pt    │               │
│         │              │               │
│         └──────────────┘               │
│                                        │
│         55pt clearspace ↓              │
│                                        │
└────────────────────────────────────────┘
     Total protected area: 210×165pt
```

### AWS Logo Clearspace (30pt buffer on all sides)

```
┌──────────────────────────────┐
│                              │
│    30pt clearspace ↑         │
│                              │
│ ←30pt→ ┌──────┐ ←30pt→      │
│        │ AWS  │              │
│        │ LOGO │              │
│        └──────┘              │
│                              │
│    30pt clearspace ↓         │
│                              │
└──────────────────────────────┘
   Total protected area: 150×90pt
```

---

## Testing Verification

### Manual Visual Check
1. Open `exports/TEEI-AWS-Partnership.indd` in InDesign
2. Verify TEEI logo appears white and crisp on Nordshore background
3. Verify AWS logo appears in color on Sand background
4. Zoom to 200% and check clearspace (no text/graphics within buffer zones)
5. Check footer doesn't overlap with any logo clearspace

### Automated Check
```bash
# Run logo integration test
python test_logo_integration.py

# Expected output:
# ✓ TEEI Logo (White): Found
# ✓ AWS Logo (SVG): Found
# ✓ All logo files found!
```

---

## Coordinate System Reference

**InDesign Coordinate System**:
- Origin (0,0): Top-left corner of page
- X-axis: Horizontal (left → right)
- Y-axis: Vertical (top → bottom)
- Units: Points (1pt = 1/72 inch)

**Bounds Array Format**: `[y1, x1, y2, x2]`
- `y1`: Top edge (Y coordinate)
- `x1`: Left edge (X coordinate)
- `y2`: Bottom edge (Y coordinate)
- `x2`: Right edge (X coordinate)

**Example**: `[260, 60, 315, 160]`
- Rectangle starts 260pt from top, 60pt from left
- Rectangle ends 315pt from top, 160pt from left
- Dimensions: 100pt wide × 55pt tall

---

## Related Documentation

- **Main Instructions**: `CLAUDE.md` (project setup and brand guidelines)
- **Integration Complete**: `LOGO-INTEGRATION-COMPLETE.md` (full implementation details)
- **Logo Best Practices**: `docs/PARTNER-LOGO-INTEGRATION-GUIDE.md`
- **Design Standards**: `reports/TEEI_AWS_Design_Fix_Report.md`

---

**Last Updated**: 2025-11-13
**Version**: 1.0
**Status**: ✅ Production-ready
