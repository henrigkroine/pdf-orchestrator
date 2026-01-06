# TFU AWS Design Fix Plan

**Status**: Ready to Implement
**Goal**: Make AWS TFU PDF a true "fifth sibling" to existing TFU PDFs

---

## Critical Issues to Fix

### ❌ Issues Identified from Design System Comparison

1. **Missing Together for Ukraine Badge**
   - **What's needed**: Blue/Yellow badge on Page 4 closing CTA
   - **Current state**: Likely missing
   - **Fix**: Add two-box badge ("Together for" blue + "UKRAINE" yellow)

2. **Missing Decorative Divider**
   - **What's needed**: Curved line under major headings
   - **Current state**: Probably using simple lines or nothing
   - **Fix**: Add decorative curved/wave stroke under page headings

3. **Stats Box Treatment**
   - **What's needed**: Light blue (#C9E4EC) sidebar box with vertical stat list
   - **Current state**: May be inline or wrong color
   - **Fix**: Page 2 right column must be light blue box with stats

4. **Partner Logo Grid**
   - **What's needed**: 3×3 white logos on teal background (Page 4)
   - **Current state**: May be different layout or colors
   - **Fix**: Exact 3×3 grid, white logos, on teal

5. **Photo Treatment**
   - **What's needed**: Clean rounded cards (24pt radius on cover)
   - **Current state**: May have dark overlays
   - **Fix**: Remove all overlays, clean rounded rectangles

6. **Program Layout**
   - **What's needed**: Two-column editorial text layout
   - **Current state**: May be using card-based grid
   - **Fix**: Switch to TFU_ProgramMatrix pattern (2-column text)

7. **Color Violations**
   - **What's needed**: ONLY teal #00393F + light blue #C9E4EC
   - **Current state**: May include gold #BA8F5A or orange
   - **Fix**: Remove ALL non-TFU colors

---

## 4-Page Structure (TFU Standard)

### Page 1: TFU_Cover
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL TEAL BACKGROUND (#00393F)

[TEEI Logo - white, top-left]

        ┌─────────────────────┐
        │                     │
        │   Hero Photo Card   │  ← Rounded 24pt, centered
        │   460×450pt         │
        │                     │
        └─────────────────────┘

    Scaling Tech Education for
    Displaced Ukrainian Students

    TOGETHER FOR UKRAINE × AWS PARTNERSHIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Specs**:
- Background: Teal #00393F full bleed
- Logo: White, top-left, 40pt margins
- Photo: 460×450pt, rounded 24pt, centered
- Title: Lora Bold 60pt, white, centered
- Subtitle: Roboto Regular 14pt ALL CAPS, white, +2pt tracking

### Page 2: TFU_AboutGoals
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Full-width hero photo, 200pt height]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Challenge          ┌────────────────┐
                       │ Impact Metrics │
Left column ~340pt     │ ══════════════ │
Lora 42pt heading      │                │
Roboto 11pt body      │    50,000      │
Problem narrative      │   STUDENTS     │
                       │      │         │
Why AWS               │    3,200       │
Approach narrative     │ AWS CERTS      │
                       │      │         │
                       │     78%        │
                       │  EMPLOYMENT    │
                       └────────────────┘
                                [Logo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Specs**:
- Hero photo: Full width, 200pt height
- Left column: 340pt, narrative (Challenge + Approach + AWS Value)
- Right column: 200pt, **LIGHT BLUE #C9E4EC** background
- Stats: Vertical list with dividers
  - Number: Lora Bold 36pt teal
  - Divider: 1pt line 30pt tall
  - Label: Roboto Regular 11pt ALL CAPS teal

### Page 3: TFU_ProgramMatrix
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Programs Powered by AWS
════════════════════════  ← Decorative divider

┌──────────────────────┐ ┌──────────────────────┐
│ CLOUD FOUNDATIONS    │ │ DATA ANALYTICS       │
│                      │ │                      │
│ AWS Cloud Practiti.. │ │ AWS Data Analytics.. │
│ Description text...  │ │ Description text...  │
│                      │ │                      │
└──────────────────────┘ └──────────────────────┘

┌──────────────────────┐ ┌──────────────────────┐
│ MACHINE LEARNING     │ │ SOLUTIONS ARCHITECT  │
│                      │ │                      │
│ AWS ML Fundamentals..│ │ AWS Solutions Arch...│
│ Description text...  │ │ Description text...  │
│                      │ │                      │
└──────────────────────┘ └──────────────────────┘
                                        [Logo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Specs**:
- Heading: Lora Regular 42pt teal
- **Decorative divider**: Curved stroke ~300pt wide, 2pt teal
- Two columns: 260pt each, 30pt gutter
- Each program:
  - ALL CAPS label: Roboto Medium 10pt teal, +1.5pt tracking
  - Program name: Lora SemiBold 22pt teal
  - Description: Roboto Regular 11pt black, 1.5× leading
- Spacing between: 40-50pt vertical

### Page 4: TFU_ClosingCTA
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FULL TEAL BACKGROUND (#00393F)

        ┌───────────┬───────────┐
        │ Together  │  UKRAINE  │  ← TFU Badge
        │    for    │           │  (Blue + Yellow)
        └───────────┴───────────┘

    Expand Our AWS Partnership

    Partner with Together for Ukraine to
    scale cloud education for displaced students

    OUR MAIN PARTNERS
    ────────────────────────────────────

    [Google]    [Kintell]   [Babbel]
    [Sanoma]    [Oxford]    [AWS]      ← 3×3 grid
    [Cornell]   [Inco]      [Bain]     white logos

    ────────────────────────────────────
    contact@theeducationalequalityinstitute.org  [TEEI Logo]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Specs**:
- Background: Teal #00393F full bleed
- **TFU Badge**: Blue #3D5CA6 + Yellow #FFD500, 220×40pt, centered
- Heading: Lora Regular 42pt white, centered
- Subtitle: Roboto Regular 14pt white, centered
- Partner section label: Roboto Medium 11pt ALL CAPS white
- Logo grid: 3×3, 170pt columns, 80pt rows, white logos
- Contact: Roboto Regular 11pt white

---

## Typography Enforcement

### Fonts (ONLY These)
- **Serif**: Lora (Regular, SemiBold, Bold)
- **Sans**: Roboto (Regular, Medium, Bold)

### Type Scale (11+ sizes for validation)
```
60pt - Cover title (Lora Bold)
42pt - Page headings (Lora Regular)
36pt - Stat numbers (Lora Bold)
32pt - (optional sub-stat)
28pt - (optional page sub-heading)
24pt - Section headings (Lora SemiBold)
22pt - Program names (Lora SemiBold)
18pt - (optional intro text)
14pt - Cover subtitle, body large (Roboto Regular)
13pt - Body medium (Roboto Regular)
12pt - Body standard (Roboto Regular)
11pt - Body compact, labels (Roboto Regular/Medium)
10pt - Fine print, small labels (Roboto Regular)
```

---

## Color Enforcement

### Allowed Colors (ONLY)
```
Teal Primary:    #00393F   (cover bg, headings, labels, text)
Light Blue Box:  #C9E4EC   (stats box background)
White:           #FFFFFF   (text on teal, logos on teal)
Black:           #000000   (body text on white)
Badge Blue:      #3D5CA6   (TFU badge left box)
Badge Yellow:    #FFD500   (TFU badge right box)
```

### Forbidden Colors
```
❌ Gold:         #BA8F5A   (NOT in TFU system)
❌ Orange:       #C87137   (NOT in TFU system)
❌ Copper:       Any       (NOT in TFU system)
```

---

## Implementation Checklist

### Page 1 (Cover)
- [ ] Teal background #00393F full bleed
- [ ] TEEI logo white, top-left, 40pt margins
- [ ] Hero photo card 460×450pt, rounded 24pt, centered
- [ ] Title: Lora Bold 60pt white centered
- [ ] Subtitle: Roboto 14pt ALL CAPS white +2pt tracking
- [ ] NO dark overlay on photo

### Page 2 (About + Impact)
- [ ] Full-width hero photo 200pt height at top
- [ ] Left column 340pt: narrative text
- [ ] Right column 200pt: **light blue #C9E4EC** stats box
- [ ] Stats: vertical list with numbers (Lora Bold 36pt) + labels (Roboto 11pt ALL CAPS)
- [ ] Divider lines between stats (1pt teal, 30pt tall)
- [ ] TEEI logo bottom-right

### Page 3 (Programs)
- [ ] Heading: Lora Regular 42pt teal
- [ ] **Decorative curved divider** below heading (~300pt, 2pt teal)
- [ ] Two-column layout (260pt each, 30pt gutter)
- [ ] Each program: ALL CAPS label + name + description
- [ ] NO card backgrounds, clean text layout
- [ ] 40-50pt spacing between programs
- [ ] TEEI logo bottom-right

### Page 4 (CTA)
- [ ] Teal background #00393F full bleed
- [ ] **Together for Ukraine badge** (blue + yellow, 220×40pt, centered)
- [ ] Heading: Lora 42pt white centered
- [ ] Subtitle: Roboto 14pt white centered
- [ ] "OUR MAIN PARTNERS" label with underline
- [ ] **3×3 partner logo grid, white logos**
- [ ] Bottom separator line
- [ ] Contact info + TEEI logo

### Typography
- [ ] ONLY Lora (serif) and Roboto (sans)
- [ ] 11+ distinct font sizes used
- [ ] Correct weights: Bold for titles, SemiBold for sections, Regular for body
- [ ] ALL CAPS only for labels and cover subtitle
- [ ] Letter-spacing: +1.5-2pt for ALL CAPS, -0.5pt for large titles

### Colors
- [ ] NO gold #BA8F5A anywhere
- [ ] NO orange/copper anywhere
- [ ] Teal #00393F for primary elements
- [ ] Light blue #C9E4EC for stats box ONLY
- [ ] Blue + yellow for TFU badge ONLY
- [ ] White text on teal backgrounds
- [ ] Black text on white backgrounds

---

## Content Requirements

### Must Include
1. **TFU Story**: Ukraine displacement context
2. **AWS Contribution**: Cloud, certifications, infrastructure
3. **Concrete Metrics**: Students, certifications, employment rates
4. **Strategic CTA**: Clear partnership ask with benefits
5. **Partner Logos**: Actual logos of real partners

### Narrative Flow
1. **Page 1**: Outcome-focused hook (not generic mission)
2. **Page 2**: Problem → Approach → AWS Value (structured B2B)
3. **Page 3**: Programs with concrete outcomes
4. **Page 4**: Strategic partnership tier with clear benefits

---

## Validation Targets

### Design Score: 145-150/150
- Color harmony: Perfect (TFU palette only)
- Typography: Perfect (Lora + Roboto, 11+ sizes)
- Layout: Perfect (TFU patterns matched)
- Visual hierarchy: Strong (clear page structure)
- Brand compliance: Perfect (TFU identity)

### Content Score
- TFU story: Present and compelling
- AWS role: Specific and valuable
- Metrics: Actual numbers, no "XX"
- CTA: Strategic and clear

---

## Files to Update

1. **Primary**: `scripts/generate_tfu_aws_v2.jsx`
   - Fix all page layouts to match TFU patterns
   - Add TFU badge
   - Add decorative dividers
   - Fix colors (remove gold/orange)
   - Fix stats box (light blue)
   - Fix partner grid (3×3 white on teal)

2. **Content**: Use `exports/aws-tfu-2025-content.json` (generated by autopilot)
   - Map into TFU page structure
   - Ensure metrics are populated
   - Ensure partner list is accurate

3. **Validation**: Update prompts to check TFU family match
   - `ai/features/color/colorHarmonyAnalyzer.js`
   - `ai/features/typography/typographyAnalyzer.js`
   - Gemini Vision prompts

---

**Next Action**: Update `generate_tfu_aws_v2.jsx` to implement all checklist items.
