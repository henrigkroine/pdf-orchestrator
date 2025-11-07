# WCAG 2.2 Complete Checklist
## All 86 Success Criteria with Testing Methods

**Version:** WCAG 2.2 (June 2023)
**Levels:** A (25 criteria) | AA (38 criteria) | AAA (86 total criteria)

---

## How to Use This Checklist

- **✅ Pass:** Criterion is met
- **❌ Fail:** Criterion is not met
- **N/A:** Not applicable to this content
- **Manual:** Requires human judgment

**Testing:**
- 🤖 **Automated:** Tool can test automatically
- 👁️ **Visual:** Requires visual inspection
- 🧑 **Manual:** Requires human judgment
- 🔊 **Screen Reader:** Test with assistive technology

---

## Principle 1: Perceivable
*Information and user interface components must be presentable to users in ways they can perceive.*

### Guideline 1.1: Text Alternatives
*Provide text alternatives for non-text content.*

#### 1.1.1 Non-text Content (Level A) 🤖👁️
- [ ] **Test:** All images have alt text
- [ ] **Test:** Alt text is descriptive and meaningful
- [ ] **Test:** Decorative images have alt=""
- [ ] **Test:** Complex images (charts/graphs) have extended descriptions
- [ ] **Test:** Buttons/links have accessible names

**How to Test:**
```javascript
// Automated
const images = document.querySelectorAll('img');
images.forEach(img => {
  if (!img.alt) console.error('Missing alt text:', img.src);
});

// Manual: Read each alt text - does it convey the image purpose?
```

**Pass Example:**
```html
<img src="chart.png" alt="Bar chart showing 45% increase in enrollment 2023-2024">
```

**Fail Example:**
```html
<img src="chart.png" alt="chart"> <!-- Too generic -->
<img src="photo.jpg"> <!-- Missing alt attribute -->
```

---

### Guideline 1.2: Time-based Media
*Provide alternatives for time-based media.*

#### 1.2.1 Audio-only and Video-only (Prerecorded) (Level A) 🧑
- [ ] **Test:** Audio-only content has text transcript
- [ ] **Test:** Video-only content has audio description OR text transcript
- [ ] **Test:** Transcripts are complete and accurate

**Pass Example:**
- Podcast with full written transcript available
- Silent video with audio narration describing actions

**Fail Example:**
- Audio recording with no transcript
- Silent video with no description of visual information

#### 1.2.2 Captions (Prerecorded) (Level A) 🧑
- [ ] **Test:** All prerecorded video with audio has captions
- [ ] **Test:** Captions are synchronized with audio
- [ ] **Test:** Captions are accurate
- [ ] **Test:** Captions identify speakers when relevant

#### 1.2.3 Audio Description or Media Alternative (Prerecorded) (Level A) 🧑
- [ ] **Test:** Prerecorded video has audio description OR full text alternative
- [ ] **Test:** Description/alternative conveys all important visual information

#### 1.2.4 Captions (Live) (Level AA) 🧑
- [ ] **Test:** Live audio content has captions

#### 1.2.5 Audio Description (Prerecorded) (Level AA) 🧑
- [ ] **Test:** All prerecorded video has audio description
- [ ] **Test:** Description fills natural pauses in dialogue

#### 1.2.6 Sign Language (Prerecorded) (Level AAA) 🧑
- [ ] **Test:** Prerecorded audio includes sign language interpretation

#### 1.2.7 Extended Audio Description (Prerecorded) (Level AAA) 🧑
- [ ] **Test:** When pauses insufficient, video pauses for extended audio description

#### 1.2.8 Media Alternative (Prerecorded) (Level AAA) 🧑
- [ ] **Test:** All prerecorded synchronized media has full text alternative

#### 1.2.9 Audio-only (Live) (Level AAA) 🧑
- [ ] **Test:** Live audio-only content has text alternative (transcript)

---

### Guideline 1.3: Adaptable
*Create content that can be presented in different ways without losing information or structure.*

#### 1.3.1 Info and Relationships (Level A) 🤖👁️
- [ ] **Test:** Headings use proper heading tags (h1-h6)
- [ ] **Test:** Lists use proper list markup (ul/ol/li)
- [ ] **Test:** Tables have proper table markup
- [ ] **Test:** Form fields have associated labels
- [ ] **Test:** PDF has proper tag structure

**How to Test:**
```javascript
// Check headings
const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
// Verify semantic structure

// Check PDF tags
const isTagged = pdfDoc.catalog.has('StructTreeRoot');
```

**Pass Example:**
```html
<h1>Main Title</h1>
<h2>Section</h2>
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

**Fail Example:**
```html
<div class="heading">Main Title</div> <!-- Not semantic -->
<div>• Item 1</div> <!-- Not proper list -->
```

#### 1.3.2 Meaningful Sequence (Level A) 🤖🔊
- [ ] **Test:** Reading order is logical
- [ ] **Test:** Content makes sense when read linearly
- [ ] **Test:** Tab order follows visual order

**How to Test:**
- Use screen reader to navigate document
- Check if content flows logically
- Tab through interactive elements - does order make sense?

#### 1.3.3 Sensory Characteristics (Level A) 🧑
- [ ] **Test:** Instructions don't rely solely on sensory characteristics
- [ ] **Test:** Don't use only shape, size, visual location, orientation, or sound

**Pass Example:**
```
"Click the 'Submit' button (blue button at bottom right)"
```

**Fail Example:**
```
"Click the blue button" (color only)
"Click the button on the right" (location only)
"Press the round button" (shape only)
```

#### 1.3.4 Orientation (Level AA) 🧑
- [ ] **Test:** Content works in both portrait and landscape orientation
- [ ] **Test:** No restriction to single orientation unless essential

#### 1.3.5 Identify Input Purpose (Level AA) 🤖
- [ ] **Test:** Form input purposes are programmatically determinable
- [ ] **Test:** Autocomplete attributes used for common fields

**Pass Example:**
```html
<input type="email" name="email" autocomplete="email">
<input type="tel" name="phone" autocomplete="tel">
```

#### 1.3.6 Identify Purpose (Level AAA) 🤖
- [ ] **Test:** Purpose of UI components can be programmatically determined
- [ ] **Test:** ARIA landmarks used for major sections

---

### Guideline 1.4: Distinguishable
*Make it easier for users to see and hear content.*

#### 1.4.1 Use of Color (Level A) 👁️
- [ ] **Test:** Color is not the only means of conveying information
- [ ] **Test:** Links distinguishable without color (underline/bold)
- [ ] **Test:** Charts use patterns in addition to color

**Pass Example:**
- Links underlined AND different color
- Required fields marked with asterisk AND red color
- Chart bars have patterns + colors

**Fail Example:**
- Links only different color (no underline)
- "Click red button" (no text label)

#### 1.4.2 Audio Control (Level A) 🧑
- [ ] **Test:** Auto-playing audio >3 seconds has pause/stop control
- [ ] **Test:** Audio volume is controllable

#### 1.4.3 Contrast (Minimum) (Level AA) 🤖
- [ ] **Test:** Normal text has 4.5:1 contrast ratio
- [ ] **Test:** Large text (18pt+ or 14pt+ bold) has 3:1 contrast
- [ ] **Test:** UI components have 3:1 contrast

**How to Test:**
```javascript
const contrast = calculateContrastRatio(textColor, bgColor);
const passes = contrast >= 4.5; // Normal text
```

**TEEI Brand Examples:**
- ✅ Nordshore (#00393F) on White: 15.3:1
- ✅ Nordshore on Sand (#FFF1E2): 13.8:1
- ❌ Sky (#C9E4EC) on White: 1.3:1 (FAIL)

#### 1.4.4 Resize Text (Level AA) 👁️
- [ ] **Test:** Text can be resized up to 200% without loss of content/functionality
- [ ] **Test:** No horizontal scrolling at 200% zoom
- [ ] **Test:** No text cutoff at 200% zoom

#### 1.4.5 Images of Text (Level AA) 👁️
- [ ] **Test:** No images of text (unless decorative or essential)
- [ ] **Test:** Logo exceptions documented

**Pass Example:**
- Actual text styled with CSS (not image)
- Company logo (essential image of text)

**Fail Example:**
- Heading rendered as image file
- Button text as image

#### 1.4.6 Contrast (Enhanced) (Level AAA) 🤖
- [ ] **Test:** Normal text has 7:1 contrast ratio
- [ ] **Test:** Large text has 4.5:1 contrast ratio

**AAA Requirement:**
- Nordshore (#00393F) on White: 15.3:1 ✅ (exceeds 7:1)
- Gold (#BA8F5A) on White: 4.6:1 ❌ (needs 7:1)

#### 1.4.7 Low or No Background Audio (Level AAA) 🧑
- [ ] **Test:** Speech audio has no/minimal background sounds
- [ ] **Test:** Background audio at least 20dB lower than speech

#### 1.4.8 Visual Presentation (Level AAA) 👁️
- [ ] **Test:** Foreground/background colors user-selectable
- [ ] **Test:** Line length max 80 characters
- [ ] **Test:** Text not justified
- [ ] **Test:** Line spacing 1.5× font size minimum
- [ ] **Test:** Paragraph spacing 2× font size minimum

**Pass Example:**
```css
p {
  max-width: 80ch; /* 80 characters */
  line-height: 1.5;
  margin-bottom: 2em; /* 2× font size */
  text-align: left; /* Not justified */
}
```

#### 1.4.9 Images of Text (No Exception) (Level AAA) 👁️
- [ ] **Test:** No images of text except decorative
- [ ] **Test:** Essential images minimized

#### 1.4.10 Reflow (Level AA) 👁️
- [ ] **Test:** Content reflows to single column at 320px width
- [ ] **Test:** No horizontal scrolling required

#### 1.4.11 Non-text Contrast (Level AA) 🤖
- [ ] **Test:** UI components have 3:1 contrast with adjacent colors
- [ ] **Test:** Graphical objects have 3:1 contrast

#### 1.4.12 Text Spacing (Level AA) 👁️
- [ ] **Test:** No loss of content when adjusting:
  - Line height: 1.5× font size
  - Paragraph spacing: 2× font size
  - Letter spacing: 0.12× font size
  - Word spacing: 0.16× font size

#### 1.4.13 Content on Hover or Focus (Level AA) 👁️
- [ ] **Test:** Additional content on hover/focus is dismissible
- [ ] **Test:** Additional content is hoverable
- [ ] **Test:** Additional content persists until dismissed

---

## Principle 2: Operable
*User interface components and navigation must be operable.*

### Guideline 2.1: Keyboard Accessible
*Make all functionality available from a keyboard.*

#### 2.1.1 Keyboard (Level A) 🔊
- [ ] **Test:** All functionality available via keyboard
- [ ] **Test:** No mouse-only features

**How to Test:**
1. Unplug mouse
2. Navigate entire interface with Tab, Enter, Space, Arrow keys
3. Verify all interactive elements reachable and operable

#### 2.1.2 No Keyboard Trap (Level A) 🔊
- [ ] **Test:** Keyboard focus can move away from any component
- [ ] **Test:** Standard navigation keys work or alternative documented

#### 2.1.3 Keyboard (No Exception) (Level AAA) 🔊
- [ ] **Test:** All functionality available via keyboard without exception
- [ ] **Test:** No timing-dependent keyboard operation

#### 2.1.4 Character Key Shortcuts (Level A) 🧑
- [ ] **Test:** Single-character shortcuts can be turned off
- [ ] **Test:** OR remapped to use modifier keys
- [ ] **Test:** OR only active when component has focus

---

### Guideline 2.2: Enough Time
*Provide users enough time to read and use content.*

#### 2.2.1 Timing Adjustable (Level A) 🧑
- [ ] **Test:** Time limits can be turned off, adjusted, or extended
- [ ] **Test:** User warned before time expires
- [ ] **Test:** At least 20 seconds to adjust time limit

#### 2.2.2 Pause, Stop, Hide (Level A) 🧑
- [ ] **Test:** Moving/blinking content can be paused/stopped/hidden
- [ ] **Test:** Auto-updating content can be paused/stopped/hidden

#### 2.2.3 No Timing (Level AAA) 🧑
- [ ] **Test:** No time limits (unless essential)

#### 2.2.4 Interruptions (Level AAA) 🧑
- [ ] **Test:** Interruptions can be postponed or suppressed

#### 2.2.5 Re-authenticating (Level AAA) 🧑
- [ ] **Test:** Re-authentication doesn't cause data loss

#### 2.2.6 Timeouts (Level AAA) 🧑
- [ ] **Test:** Users warned of timeout that causes data loss

---

### Guideline 2.3: Seizures and Physical Reactions
*Do not design content that causes seizures or physical reactions.*

#### 2.3.1 Three Flashes or Below Threshold (Level A) 🤖
- [ ] **Test:** No content flashes more than 3 times per second
- [ ] **Test:** OR flashing area is small enough

#### 2.3.2 Three Flashes (Level AAA) 🤖
- [ ] **Test:** No content flashes more than 3 times per second (no exceptions)

#### 2.3.3 Animation from Interactions (Level AAA) 🧑
- [ ] **Test:** Motion animation can be disabled

---

### Guideline 2.4: Navigable
*Provide ways to help users navigate, find content, and determine where they are.*

#### 2.4.1 Bypass Blocks (Level A) 🔊
- [ ] **Test:** Skip links or landmarks to bypass repeated content
- [ ] **Test:** "Skip to main content" link present

#### 2.4.2 Page Titled (Level A) 🤖
- [ ] **Test:** Pages/documents have descriptive titles
- [ ] **Test:** PDF has title in properties (not filename)

**How to Test:**
```javascript
const title = document.title;
const pdfTitle = pdfDoc.getTitle();
console.log(title || pdfTitle ? 'PASS' : 'FAIL');
```

#### 2.4.3 Focus Order (Level A) 🔊
- [ ] **Test:** Tab order is logical
- [ ] **Test:** Focus order preserves meaning

#### 2.4.4 Link Purpose (In Context) (Level A) 🧑
- [ ] **Test:** Link purpose clear from link text
- [ ] **Test:** OR clear from context (surrounding text)

**Pass Example:**
```html
<a href="/programs">View TEEI Programs</a>
<p>Learn more about <a href="/aws">our partnership with AWS</a></p>
```

**Fail Example:**
```html
<a href="/info">Click here</a> <!-- No context -->
<a href="/more">More</a> <!-- Vague -->
```

#### 2.4.5 Multiple Ways (Level AA) 🧑
- [ ] **Test:** Multiple ways to locate pages (search, sitemap, navigation, etc.)

#### 2.4.6 Headings and Labels (Level AA) 🧑
- [ ] **Test:** Headings describe topics/purposes
- [ ] **Test:** Labels describe purposes
- [ ] **Test:** Headings and labels are descriptive, not generic

**Pass Example:**
- "Student Success Stories" (descriptive)
- "Contact Information" (clear)

**Fail Example:**
- "Section 1" (not descriptive)
- "More Information" (too generic)

#### 2.4.7 Focus Visible (Level AA) 👁️
- [ ] **Test:** Keyboard focus indicator is visible
- [ ] **Test:** Focus indicator has sufficient contrast

#### 2.4.8 Location (Level AAA) 🧑
- [ ] **Test:** Information about location within set of pages available

#### 2.4.9 Link Purpose (Link Only) (Level AAA) 🧑
- [ ] **Test:** Link purpose clear from link text alone
- [ ] **Test:** No need for surrounding context

#### 2.4.10 Section Headings (Level AAA) 🧑
- [ ] **Test:** Section headings used to organize content
- [ ] **Test:** Headings present for all major sections

#### 2.4.11 Focus Not Obscured (Minimum) (Level AA) 👁️
- [ ] **Test:** Focused component not entirely hidden by other content

#### 2.4.12 Focus Not Obscured (Enhanced) (Level AAA) 👁️
- [ ] **Test:** No part of focused component is hidden

#### 2.4.13 Focus Appearance (Level AAA) 👁️
- [ ] **Test:** Focus indicator has 3:1 contrast ratio
- [ ] **Test:** Focus indicator area at least 2px thick
- [ ] **Test:** OR focus indicator area at least as large as 4px perimeter

---

### Guideline 2.5: Input Modalities
*Make it easier for users to operate functionality through various inputs.*

#### 2.5.1 Pointer Gestures (Level A) 🧑
- [ ] **Test:** Multipoint/path-based gestures have single-pointer alternative

#### 2.5.2 Pointer Cancellation (Level A) 🧑
- [ ] **Test:** Functions triggered on up-event (not down-event)
- [ ] **Test:** OR can be aborted/undone

#### 2.5.3 Label in Name (Level A) 🤖
- [ ] **Test:** Visible label text is part of accessible name

#### 2.5.4 Motion Actuation (Level A) 🧑
- [ ] **Test:** Functions triggered by device motion have UI alternative
- [ ] **Test:** Motion can be disabled

#### 2.5.5 Target Size (Enhanced) (Level AAA) 🤖
- [ ] **Test:** Touch targets at least 44×44 CSS pixels
- [ ] **Test:** OR sufficient spacing between targets

**How to Test:**
```javascript
const buttons = document.querySelectorAll('button, a');
buttons.forEach(btn => {
  const rect = btn.getBoundingClientRect();
  if (rect.width < 44 || rect.height < 44) {
    console.error('Too small:', btn, rect);
  }
});
```

#### 2.5.6 Concurrent Input Mechanisms (Level AAA) 🧑
- [ ] **Test:** Content doesn't restrict use of input modalities

#### 2.5.7 Dragging Movements (Level AAA) 🧑
- [ ] **Test:** Dragging actions have single-pointer alternative

#### 2.5.8 Target Size (Minimum) (Level AA) 🤖
- [ ] **Test:** Touch targets at least 24×24 CSS pixels
- [ ] **Test:** Exceptions: inline links, essential sizes, user agent control

---

## Principle 3: Understandable
*Information and operation of user interface must be understandable.*

### Guideline 3.1: Readable
*Make text content readable and understandable.*

#### 3.1.1 Language of Page (Level A) 🤖
- [ ] **Test:** Default language programmatically determinable
- [ ] **Test:** PDF has Lang attribute
- [ ] **Test:** HTML has lang attribute on <html>

**How to Test:**
```javascript
// HTML
const lang = document.documentElement.lang;

// PDF
const pdfLang = pdfDoc.catalog.get('Lang');
```

#### 3.1.2 Language of Parts (Level AA) 🤖
- [ ] **Test:** Language changes marked with lang attribute
- [ ] **Test:** Passages in other languages identified

**Pass Example:**
```html
<p>TEEI provides <span lang="es">educación de calidad</span> for all students.</p>
```

#### 3.1.3 Unusual Words (Level AAA) 🧑
- [ ] **Test:** Unusual words have definitions available
- [ ] **Test:** Jargon explained on first use

#### 3.1.4 Abbreviations (Level AAA) 🧑
- [ ] **Test:** Abbreviations have expanded form available
- [ ] **Test:** Acronyms defined on first use

**Pass Example:**
```html
<p>The Educational Equality Institute (TEEI) partners with
Amazon Web Services (AWS) to deliver cloud-based learning.</p>
```

#### 3.1.5 Reading Level (Level AAA) 🤖🧑
- [ ] **Test:** Text at lower secondary education level (Grade 8-9)
- [ ] **Test:** OR supplementary content provided
- [ ] **Test:** Flesch-Kincaid grade level ≤ 10

**How to Test:**
```javascript
const grade = calculateReadingLevel(text);
const passes = grade <= 10;
```

**AI Help:**
```javascript
// Claude Opus 4.1 provides suggestions
const analysis = await analyzeReadability(text);
// Returns: {grade: 11.2, complexSentences: [...], suggestions: [...]}
```

#### 3.1.6 Pronunciation (Level AAA) 🧑
- [ ] **Test:** Mechanism for pronunciation of words available

---

### Guideline 3.2: Predictable
*Make Web pages appear and operate in predictable ways.*

#### 3.2.1 On Focus (Level A) 🧑
- [ ] **Test:** Receiving focus doesn't initiate change of context

#### 3.2.2 On Input (Level A) 🧑
- [ ] **Test:** Changing settings doesn't automatically cause change of context
- [ ] **Test:** OR user is advised before change

#### 3.2.3 Consistent Navigation (Level AA) 🧑
- [ ] **Test:** Navigation mechanisms in consistent order across pages

#### 3.2.4 Consistent Identification (Level AA) 🧑
- [ ] **Test:** Components with same functionality identified consistently

#### 3.2.5 Change on Request (Level AAA) 🧑
- [ ] **Test:** Changes of context initiated only by user request

#### 3.2.6 Consistent Help (Level A) 🧑
- [ ] **Test:** Help mechanisms in consistent order when repeated

---

### Guideline 3.3: Input Assistance
*Help users avoid and correct mistakes.*

#### 3.3.1 Error Identification (Level A) 🧑
- [ ] **Test:** Input errors automatically detected
- [ ] **Test:** Errors described to user in text

#### 3.3.2 Labels or Instructions (Level A) 🤖🧑
- [ ] **Test:** Labels provided for user input
- [ ] **Test:** Instructions provided when content requires input

**Pass Example:**
```html
<label for="email">Email Address (required)</label>
<input type="email" id="email" required>
```

#### 3.3.3 Error Suggestion (Level AA) 🧑
- [ ] **Test:** Suggestions provided for input errors (when known)

#### 3.3.4 Error Prevention (Legal, Financial, Data) (Level AA) 🧑
- [ ] **Test:** Submissions reversible, checked, or confirmed

#### 3.3.5 Help (Level AAA) 🧑
- [ ] **Test:** Context-sensitive help available

#### 3.3.6 Error Prevention (All) (Level AAA) 🧑
- [ ] **Test:** All submissions reversible, checked, or confirmed

#### 3.3.7 Redundant Entry (Level A) 🧑
- [ ] **Test:** Previously entered information auto-populated or available

#### 3.3.8 Accessible Authentication (Minimum) (Level AA) 🧑
- [ ] **Test:** Cognitive function test not required for authentication
- [ ] **Test:** Alternatives to memory/transcription tests

#### 3.3.9 Accessible Authentication (Enhanced) (Level AAA) 🧑
- [ ] **Test:** No cognitive function test for authentication

---

## Principle 4: Robust
*Content must be robust enough to be interpreted reliably by assistive technologies.*

### Guideline 4.1: Compatible
*Maximize compatibility with current and future user agents, including assistive technologies.*

#### 4.1.1 Parsing (Level A) 🤖
- [ ] **Test:** Content can be parsed unambiguously
- [ ] **Test:** PDF structure is valid
- [ ] **Test:** No duplicate IDs
- [ ] **Test:** Proper nesting of elements

#### 4.1.2 Name, Role, Value (Level A) 🤖🔊
- [ ] **Test:** Name and role can be programmatically determined
- [ ] **Test:** States, properties, values can be programmatically set
- [ ] **Test:** User agents notified of changes

**How to Test:**
```javascript
// Check form field has name
const input = document.querySelector('input');
const name = input.getAttribute('aria-label') ||
             input.getAttribute('aria-labelledby') ||
             document.querySelector(`label[for="${input.id}"]`);
console.log(name ? 'PASS' : 'FAIL');
```

#### 4.1.3 Status Messages (Level AA) 🔊
- [ ] **Test:** Status messages can be determined without receiving focus
- [ ] **Test:** ARIA role="status" or role="alert" used appropriately

---

## Summary by Level

### Level A (25 criteria - Minimum)
Must pass all of these for basic accessibility:
- 1.1.1, 1.2.1, 1.2.2, 1.2.3, 1.3.1, 1.3.2, 1.3.3
- 1.4.1, 1.4.2
- 2.1.1, 2.1.2, 2.1.4, 2.2.1, 2.2.2, 2.3.1
- 2.4.1, 2.4.2, 2.4.3, 2.4.4
- 2.5.1, 2.5.2, 2.5.3, 2.5.4
- 3.1.1, 3.2.1, 3.2.2, 3.2.6
- 3.3.1, 3.3.2, 3.3.7
- 4.1.1, 4.1.2

### Level AA (38 criteria - Standard)
Adds to Level A for enhanced accessibility:
- All Level A +
- 1.2.4, 1.2.5, 1.3.4, 1.3.5
- 1.4.3, 1.4.4, 1.4.5, 1.4.10, 1.4.11, 1.4.12, 1.4.13
- 2.4.5, 2.4.6, 2.4.7, 2.4.11
- 2.5.8
- 3.1.2, 3.2.3, 3.2.4
- 3.3.3, 3.3.4, 3.3.8
- 4.1.3

### Level AAA (86 total criteria - Optimal)
Adds to Level AA for maximum accessibility:
- All Level AA +
- 1.2.6, 1.2.7, 1.2.8, 1.2.9, 1.3.6
- 1.4.6, 1.4.7, 1.4.8, 1.4.9
- 2.1.3, 2.2.3, 2.2.4, 2.2.5, 2.2.6, 2.3.2, 2.3.3
- 2.4.8, 2.4.9, 2.4.10, 2.4.12, 2.4.13
- 2.5.5, 2.5.6, 2.5.7
- 3.1.3, 3.1.4, 3.1.5, 3.1.6, 3.2.5
- 3.3.5, 3.3.6, 3.3.9

---

## Testing Priority

### Critical (Fix First) 🔴
1. 1.1.1 - Alt text (images unusable without)
2. 1.4.3 - Contrast (text unreadable)
3. 2.1.1 - Keyboard access (interface unusable)
4. 3.1.1 - Language (screen readers can't announce correctly)
5. 4.1.1 - Parsing (assistive tech can't interpret)
6. 4.1.2 - Name/Role/Value (AT can't determine purpose)

### High Priority (Fix Soon) 🟠
- 1.3.1 - Structure (navigation difficult)
- 1.3.2 - Reading order (confusing flow)
- 2.4.2 - Page titles (identification difficult)
- 2.4.6 - Headings/labels (navigation/comprehension difficult)
- 3.3.2 - Form labels (input difficult)

### Medium Priority (Improve) 🟡
- 1.4.6 - Enhanced contrast (AAA)
- 2.4.10 - Section headings (organization)
- 3.1.5 - Reading level (comprehension)
- All Level AAA criteria

---

**Last Updated:** 2025-11-06
**WCAG Version:** 2.2 (June 2023)
**Total Criteria:** 86 (25 Level A + 38 Level AA + 23 Level AAA)
