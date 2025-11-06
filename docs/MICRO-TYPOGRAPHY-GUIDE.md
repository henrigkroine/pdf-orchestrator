# Micro-Typography Guide

**Mastering the details for professional typography**
Version 1.0.0

---

## Table of Contents

1. [What is Micro-Typography?](#what-is-micro-typography)
2. [Kerning Deep Dive](#kerning-deep-dive)
3. [Ligature Usage](#ligature-usage)
4. [Smart Quotes & Punctuation](#smart-quotes--punctuation)
5. [Hanging Punctuation](#hanging-punctuation)
6. [Small Caps](#small-caps)
7. [OpenType Features](#opentype-features)
8. [Examples of Excellence](#examples-of-excellence)

---

## What is Micro-Typography?

**Micro-typography** refers to the fine details of typography that, while often subtle, have a significant cumulative impact on the professional appearance and readability of a document.

### Macro-Typography vs Micro-Typography

| **Macro-Typography** (Big Picture) | **Micro-Typography** (Details) |
|-----------------------------------|-------------------------------|
| Font selection | Kerning pairs |
| Type scale (42pt, 28pt, 11pt) | Ligatures (fi, fl) |
| Line height (1.5x) | Smart quotes (" ") |
| Column width (45-75 chars) | Hanging punctuation |
| Hierarchy (H1, H2, body) | Number formatting |
| Color (Nordshore, Sky) | Letter spacing |

### Why Micro-Typography Matters

**Amateur typography:**
```
"It's important to offer quality," he said--you'll see...
Office efficiency affects final results.
```

**Professional typography:**
```
"It's important to offer quality," he said—you'll see…
Office efficiency affects final results.
```

The differences are subtle but add up to create a **professional, polished impression** vs an **amateur, careless one**.

---

## Kerning Deep Dive

### What is Kerning?

**Kerning** is the adjustment of space between specific letter pairs to achieve visually balanced spacing.

### Metric vs Optical Kerning

**Metric Kerning** (default)
- Uses kerning pairs built into the font
- Usually sufficient for body text
- Fast and consistent

**Optical Kerning**
- Algorithm-based spacing adjustment
- Better for display/headline text
- Adjusts based on letter shapes

**When to use optical:**
- Headlines and large text (28pt+)
- All-caps text
- Mixed fonts
- Letters with unusual shapes

### Problematic Pairs

These letter combinations commonly need kerning adjustment:

**Capital Letters:**
```
AV   AW   AY   AT   Av   Aw   Ay
FA   PA   TA   VA   WA   YA
LT   LV   LW   LY
RT   RV   RW   RY
```

**Example:**
```
Bad:  A V A I L A B L E        (wide gaps)
Good: AVAILABLE                (optically kerned)
```

**Punctuation:**
```
T.   T,   P.   P,   Y.   Y,
V.   V,   W.   W,
```

**Example:**
```
Bad:  TEEI.   (too much space)
Good: TEEI.   (kerned closer)
```

**Quotes:**
```
"A   "J   "T   "V   "W   "Y
```

**Example:**
```
Bad:  " Available"    (quote too far)
Good: "Available"     (quote closer)
```

### How to Fix Kerning Issues

#### In Adobe InDesign

1. **Enable Optical Kerning:**
   - Select text
   - Character Panel → Kerning → Optical

2. **Manual Kerning Adjustments:**
   - Place cursor between letters
   - Alt/Opt + Left/Right arrows
   - Or enter specific value (-50 to +50)

3. **Kerning for Headlines:**
   ```
   - Select headline
   - Kerning: Optical
   - Tracking: -10 to -20 (tighter for large text)
   ```

#### In CSS

```css
.headline {
  font-kerning: normal;
  letter-spacing: -0.02em; /* Tighter for large text */
}

.body {
  font-kerning: auto;
  letter-spacing: 0;
}
```

### TEEI Kerning Standards

- **Body Text (11pt):** Metric kerning, tracking 0
- **Subheads (18pt):** Optical kerning, tracking -5 to -10
- **Section Headers (28pt):** Optical kerning, tracking -10 to -15
- **Document Title (42pt):** Optical kerning, tracking -15 to -20

---

## Ligature Usage

### What are Ligatures?

**Ligatures** are special characters that combine two or more letters into a single glyph for better spacing and appearance.

### Standard Ligatures

**fi** → **fi** (ligature)
**fl** → **fl** (ligature)
**ff** → **ff** (ligature)
**ffi** → **ffi** (ligature)
**ffl** → **ffl** (ligature)

### Why Ligatures Matter

**Without ligatures:**
```
Office efficiency affects final profits
```
Notice the awkward spacing where the dot of the "i" collides with the top of the "f".

**With ligatures:**
```
Office efficiency affects final profits
```
The ligatures create smooth, professional letter combinations.

### When to Use Ligatures

✅ **Always use for:**
- Body text (11pt Roboto)
- Subheads (18pt Roboto)
- Professional documents
- Print materials

❌ **Avoid for:**
- Code/monospace fonts
- All-caps text (ligatures designed for lowercase)
- URLs and email addresses
- When letters should be distinct (e.g., "shelfful" might look odd)

### Discretionary Ligatures

Beyond standard ligatures, some fonts offer **discretionary ligatures**:

- **ct** → **ct**
- **st** → **st**
- **sp** → **sp**

These are optional and should be used sparingly for elegant touches.

### How to Enable Ligatures

#### In Adobe InDesign

1. Select text
2. Character Panel → OpenType → Standard Ligatures ✓
3. (Optional) Discretionary Ligatures ✓

#### In CSS

```css
.body-text {
  font-feature-settings: "liga" 1;  /* Standard ligatures */
}

.fancy-text {
  font-feature-settings: "liga" 1, "dlig" 1;  /* + Discretionary */
}
```

#### In PDF

Ligatures must be enabled at creation time. To verify:
```bash
node scripts/inspect-typography.js exports/document.pdf --only-kerning
```

Look for "Ligature opportunities: X, Ligatures used: Y"

---

## Smart Quotes & Punctuation

### Smart Quotes

**Never use straight quotes:**
```
"This is wrong"
'This is also wrong'
```

**Always use smart quotes:**
```
"This is correct"
'This is also correct'
```

### Quote Types

| Type | Character | Unicode | Usage |
|------|-----------|---------|-------|
| Opening double | " | U+201C | Start of quote |
| Closing double | " | U+201D | End of quote |
| Opening single | ' | U+2018 | Start of single quote |
| Closing single | ' | U+2019 | End of single quote, apostrophe |

### Examples

**Correct:**
```
"Together for Ukraine," she said.
It's TEEI's best program.
The 'Together for Ukraine' initiative
```

**Incorrect:**
```
"Together for Ukraine," she said.    (straight quotes)
It's TEEI's best program.            (straight apostrophe)
The 'Together for Ukraine' initiative (straight quotes)
```

### Em Dash, En Dash, Hyphen

**Em Dash (—)** [U+2014]
- For breaks in thought
- Replaces parentheses or commas
- No spaces around it (modern style)

```
TEEI provides education—transforming lives daily.
```

**En Dash (–)** [U+2013]
- For ranges (dates, numbers, pages)
- With spaces in compound adjectives

```
2020–2024
Pages 45–67
New York–Boston flight
```

**Hyphen (-)** [U+002D]
- For compound words
- For line breaks

```
world-class
state-of-the-art
```

**Common Mistakes:**

❌ `TEEI provides education -- transforming lives.` (double hyphen)
✓ `TEEI provides education—transforming lives.` (em dash)

❌ `2020-2024` (hyphen for range)
✓ `2020–2024` (en dash for range)

### Ellipsis

**Never use three periods:**
```
And then...                  (wrong)
```

**Always use true ellipsis:**
```
And then…                    (correct)
```

**True ellipsis** [U+2026] has better spacing and is a single character.

---

## Hanging Punctuation

### What is Hanging Punctuation?

**Hanging punctuation** (optical margin alignment) moves punctuation marks slightly outside the text margin for better visual alignment.

### Without Hanging Punctuation

```
|  "Together for Ukraine"
|  provides world-class
|  education to displaced
|  students.
```

Notice the opening quote makes the text appear indented.

### With Hanging Punctuation

```
 "Together for Ukraine"
|provides world-class
|education to displaced
|students.
```

The quote hangs outside the margin, making the text optically aligned.

### Characters That Should Hang

- Opening quotes: " '
- Closing quotes: " '
- Hyphens: - —
- Periods: .
- Commas: ,
- Other punctuation: ; : ! ?

### How to Enable

#### In Adobe InDesign

1. Select text frame
2. Type → Story → Optical Margin Alignment ✓
3. Set size to text size (e.g., 11pt for 11pt text)

#### In CSS (Limited Support)

```css
.hanging-punctuation {
  hanging-punctuation: first last;
}
```

Note: Browser support is limited. Better to handle in design software.

### Impact

**Before:** Text appears misaligned due to punctuation
**After:** Clean, optically perfect margins

This is a **subtle but professional touch** that elevates typography quality.

---

## Small Caps

### What are Small Caps?

**Small caps** are uppercase letters designed to match the x-height of lowercase letters, with the same stroke weight.

### True Small Caps vs Faux Small Caps

**Faux Small Caps (BAD):**
```
TEEI → teei (scaled down capitals)
```
- Created by scaling down regular capitals
- Wrong stroke weight (too thin)
- Wrong proportions
- **Unprofessional**

**True Small Caps (GOOD):**
```
TEEI → ᴛᴇᴇɪ (designed small caps)
```
- Purpose-designed letterforms
- Correct stroke weight
- Proper proportions
- **Professional**

### When to Use Small Caps

✅ **Good uses:**
- Acronyms in body text: ᴛᴇᴇɪ, ᴀᴡs, ɴᴀsᴀ
- Time designations: 3:00 ᴘᴍ
- Text ordinals: 1ˢᴛ, 2ɴᴅ, 3ʀᴅ
- Headers and subheads (sometimes)

❌ **Avoid:**
- Large headlines (use regular caps)
- Entire paragraphs (hard to read)
- Mixed with regular caps (inconsistent)

### Example

**Without small caps:**
```
TEEI partners with AWS to deliver cloud education.
```
The all-caps "TEEI" and "AWS" dominate the text.

**With small caps:**
```
ᴛᴇᴇɪ partners with ᴀᴡs to deliver cloud education.
```
The acronyms blend better with the text while remaining distinct.

### How to Enable True Small Caps

#### In Adobe InDesign

1. Select text (e.g., "TEEI")
2. Character Panel → OpenType → Small Caps ✓
3. Or: Character Panel → All Caps → Small Caps

Verify it's using true small caps:
- Check Character Panel shows "smcp" feature
- Visually compare stroke weight to lowercase letters

#### In CSS

```css
.acronym {
  font-feature-settings: "smcp" 1;
  text-transform: lowercase; /* Convert to lowercase first */
}
```

Or:

```css
.acronym {
  font-variant: small-caps;
}
```

---

## OpenType Features

### What are OpenType Features?

**OpenType** is a font format that includes advanced typographic features. Modern fonts (like Lora and Roboto) support many of these features.

### Common OpenType Features

| Feature | Code | Description | Example |
|---------|------|-------------|---------|
| **Standard Ligatures** | liga | fi, fl, ff | office → office |
| **Discretionary Ligatures** | dlig | ct, st | street → street |
| **Small Caps** | smcp | True small caps | NASA → ɴᴀsᴀ |
| **Oldstyle Figures** | onum | Text-friendly numbers | 1234 → 1234 |
| **Lining Figures** | lnum | Uniform height numbers | 1234 → 1234 |
| **Tabular Figures** | tnum | Same-width numbers | For tables |
| **Fractions** | frac | Proper fractions | 1/2 → ½ |
| **Ordinals** | ordn | 1st, 2nd, 3rd | 1st → 1ˢᵗ |
| **Stylistic Sets** | ss01-ss20 | Alternate characters | Various |
| **Swashes** | swsh | Decorative flourishes | (Ornamental) |

### How to Enable Multiple Features

#### In Adobe InDesign

Character Panel → OpenType → Select features

#### In CSS

```css
.professional-text {
  font-feature-settings:
    "liga" 1,  /* Standard ligatures */
    "kern" 1,  /* Kerning */
    "onum" 1,  /* Old-style figures for body text */
    "pnum" 1;  /* Proportional figures */
}

.data-table {
  font-feature-settings:
    "tnum" 1,  /* Tabular figures (monospaced) */
    "lnum" 1;  /* Lining figures (uniform height) */
}
```

### TEEI OpenType Recommendations

**Body Text (Roboto 11pt):**
```
- Standard ligatures (liga)
- Kerning (kern)
- Old-style figures (onum) for inline numbers
- Proportional spacing (pnum)
```

**Headlines (Lora 28pt+):**
```
- Standard ligatures (liga)
- Kerning (kern)
- Lining figures (lnum) for headlines
- Stylistic sets (if appropriate)
```

**Data/Tables:**
```
- Tabular figures (tnum)
- Lining figures (lnum)
- No ligatures (more readable)
```

---

## Examples of Excellence

### Example 1: Professional Headline

**Amateur:**
```
TEEI + AWS: AVAILABLE NOW
```
Issues:
- Straight quotes (none used, but if there were)
- No optical kerning (A and V too far apart)
- No consideration for spacing

**Professional:**
```
TEEI + AWS: AVAILABLE NOW
```
Improvements:
- Optical kerning applied (AV, WA pairs tightened)
- Proper tracking (-15 for 42pt text)
- Clean, balanced appearance

### Example 2: Body Paragraph

**Amateur:**
```
TEEI's "Together for Ukraine" program offers world-class education. We've reached 10000 students across 15 countries--that's amazing! Contact us at info@teei.org...
```

Issues:
- Straight apostrophe: TEEI's
- Straight quotes: "Together for Ukraine"
- No thousands separator: 10000
- Double hyphen: --
- Three periods: ...
- No ligatures in "offers" (ff)

**Professional:**
```
TEEI's "Together for Ukraine" program offers world-class education. We've reached 10,000 students across 15 countries—that's amazing! Contact us at info@teei.org…
```

Improvements:
- Smart apostrophe: '
- Smart quotes: " "
- Thousands separator: 10,000
- Em dash: —
- True ellipsis: …
- Ligatures: ff in "offers"

### Example 3: Data Presentation

**Amateur:**
```
Revenue: $1000000
Growth: 45.5%
Timeline: 2020-2024
Students: 10000+
```

Issues:
- No thousands separators
- Inconsistent number formatting
- Hyphen instead of en dash
- No alignment

**Professional:**
```
Revenue:  $1,000,000
Growth:   45.5%
Timeline: 2020–2024
Students: 10,000+
```

Improvements:
- Thousands separators: 1,000,000
- Consistent decimal formatting: 45.5%
- En dash for range: 2020–2024
- Tabular figures for alignment
- Consistent spacing

### Example 4: Quote with Attribution

**Amateur:**
```
"TEEI transformed my life", said Maria, a graduate.
```

Issues:
- Straight quotes
- Comma inside quote (style varies by region)

**Professional:**
```
"TEEI transformed my life," said Maria, a graduate.
```

Improvements:
- Smart quotes: " "
- Comma inside closing quote (US style)
- Proper punctuation spacing

---

## Micro-Typography Checklist

Use this checklist for every document:

### Smart Quotes & Punctuation
- [ ] All quotes are smart: " " ' '
- [ ] All apostrophes are curly: '
- [ ] Em dashes used correctly: —
- [ ] En dashes used for ranges: –
- [ ] True ellipsis character: …

### Ligatures
- [ ] Standard ligatures enabled (fi, fl, ff)
- [ ] Ligatures appear in: office, efficiency, affiliation, final
- [ ] Discretionary ligatures considered for elegant touches

### Kerning
- [ ] Optical kerning on headlines (28pt+)
- [ ] Problematic pairs kerned: AV, WA, To, etc.
- [ ] Tracking appropriate: -10 to -20 for large text
- [ ] No excessive letter-spacing on body text

### Small Caps
- [ ] True small caps used for acronyms (not faux)
- [ ] Acronyms don't dominate text
- [ ] OpenType smcp feature enabled

### Number Formatting
- [ ] Thousands separators: 1,000 not 1000
- [ ] Consistent decimal places: 45.5%
- [ ] En dashes for ranges: 2020–2024
- [ ] Non-breaking spaces: 10 GB not 10 GB

### Hanging Punctuation
- [ ] Optical margin alignment enabled
- [ ] Opening quotes hang outside margin
- [ ] Closing punctuation considered
- [ ] Visual alignment is perfect

### OpenType Features
- [ ] Standard ligatures: liga
- [ ] Kerning: kern
- [ ] Appropriate figure style: onum/lnum
- [ ] Tabular figures for data: tnum

---

## Tools & Resources

### Inspection Tools

```bash
# Check micro-typography
node scripts/inspect-typography.js exports/document.pdf --only-kerning --only-polish

# Automated fixes
node scripts/inspect-typography.js exports/document.pdf --fix
```

### Character Inserters

**Mac:**
- Option + [ = "
- Option + Shift + [ = "
- Option + ] = '
- Option + Shift + ] = '
- Option + Shift + - = —
- Option + - = –

**Windows:**
- Alt + 0147 = "
- Alt + 0148 = "
- Alt + 0145 = '
- Alt + 0146 = '
- Alt + 0151 = —
- Alt + 0150 = –

### Online Resources

- [Butterick's Practical Typography](https://practicaltypography.com/)
- [OpenType Feature Registry](https://docs.microsoft.com/en-us/typography/opentype/spec/featurelist)
- [Smart Quotes for Smart People](https://smartquotesforsmartpeople.com/)

---

## Summary

**Micro-typography** is the difference between **amateur** and **professional** typography. While each detail is small, they accumulate to create:

✅ **Professional impression**
✅ **Enhanced readability**
✅ **Brand credibility**
✅ **Visual refinement**

**Key Takeaways:**

1. **Always use smart quotes** (" " not " ")
2. **Enable ligatures** for fi, fl, ff
3. **Use optical kerning** for headlines
4. **Apply true ellipsis** (… not ...)
5. **Format numbers properly** (1,000 not 1000)
6. **Use en dashes for ranges** (2020–2024)
7. **Use em dashes for breaks** (not --)
8. **Enable OpenType features** (liga, kern, onum)
9. **Consider hanging punctuation** for clean margins
10. **Use true small caps** for acronyms (not faux)

**Remember:** Typography is **99% invisible**. When done well, readers won't notice the details—they'll just think your document looks **professional** and is **easy to read**.

---

**Version:** 1.0.0
**Last Updated:** 2025-11-06
**Author:** TEEI Typography Team

---
