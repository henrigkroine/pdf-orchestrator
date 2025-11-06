# TEEI Motion Design Guide

**Professional animation and interaction design for TEEI digital documents**

Version: 1.0.0
Last Updated: November 6, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Motion Principles](#motion-principles)
4. [Interactive Elements](#interactive-elements)
5. [Animation Library](#animation-library)
6. [PDF Interactivity](#pdf-interactivity)
7. [Web Assets](#web-assets)
8. [Best Practices](#best-practices)

---

## Overview

The TEEI Motion Design system creates engaging, professional animations aligned with our brand personality: **warm, professional, and empowering**.

### What It Does

✅ **Page Transitions** - Smooth navigation between pages
✅ **Element Animations** - Fade, slide, scale effects
✅ **Microinteractions** - Button hovers, card lifts
✅ **Data Animations** - Count-up numbers, chart reveals
✅ **Scroll Effects** - Reveal-on-scroll, parallax
✅ **Form Interactions** - Validation, feedback
✅ **PDF Interactivity** - Navigation buttons, forms

### Key Features

- 🎨 **Brand-Aligned** - Matches TEEI personality
- ⚡ **Performance-Focused** - Lightweight, smooth
- ♿ **Accessible** - Respects reduced-motion preferences
- 📱 **Responsive** - Works on all devices
- 🔧 **Customizable** - Easy to adjust

---

## Quick Start

### Create Interactive PDF

```bash
# Add navigation and animations
node scripts/create-interactive-pdf.js document.pdf

# Generate web assets
node scripts/create-interactive-pdf.js document.pdf --animations

# Preview in browser
open document-interactive-assets/preview.html
```

### Use in Your Project

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="motion.css">
  <link rel="stylesheet" href="interactions.css">
</head>
<body>
  <div class="page-transition-fade">
    <h1 class="reveal-fade-up">Welcome to TEEI</h1>
    <button class="btn-primary">Get Started</button>
  </div>

  <script src="motion.js"></script>
  <script src="interactions.js"></script>
</body>
</html>
```

---

## Motion Principles

### Timing

**Duration Guidelines:**

| Type | Duration | Use For |
|------|----------|---------|
| **Instant** | 100ms | Button feedback, toggles |
| **Quick** | 200ms | Dropdowns, tooltips |
| **Standard** | 300ms | Modals, cards, navigation |
| **Deliberate** | 500ms | Page transitions |
| **Slow** | 1000ms | Hero animations, dramatic reveals |
| **Data** | 1500-2000ms | Number count-ups, chart draws |

**TEEI Default:** 300ms (standard) - Not too fast, not too slow

### Easing Functions

**Standard Easing:**
```css
/* Smooth, natural motion (TEEI default) */
cubic-bezier(0.25, 0.1, 0.25, 1)

/* Quick start, slow end (entering elements) */
cubic-bezier(0, 0, 0.58, 1) /* ease-out */

/* Slow start, quick end (exiting elements) */
cubic-bezier(0.42, 0, 1, 1) /* ease-in */

/* Bouncy (playful, use sparingly) */
cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

**When to Use:**
- **Ease-out** (slow end): Elements entering the screen
- **Ease-in** (slow start): Elements leaving the screen
- **Ease** (smooth): General transitions
- **Bounce**: Special emphasis (CTAs, success states)

### Motion Personality

**TEEI Brand Motion:**
- **Speed**: Moderate (not anxious, not boring)
- **Style**: Smooth, fluid
- **Emphasis**: Subtle (not flashy)
- **Feel**: Warm, professional, empowering

**Avoid:**
- ❌ Super fast animations (feels anxious)
- ❌ Heavy bouncing (feels unprofessional)
- ❌ Overly dramatic effects (feels gimmicky)
- ❌ Too many animations at once (feels chaotic)

---

## Interactive Elements

### Buttons

#### Primary Button

```html
<button class="btn-primary">Primary Action</button>
```

**Interactions:**
- Hover: Lifts 2px, shows shadow
- Active: Returns to base level
- Focus: Blue glow ring
- Disabled: Grayed out, no hover

**CSS:**
```css
.btn-primary {
  background: #00393F; /* TEEI Nordshore */
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 57, 63, 0.2);
}
```

#### Call-to-Action Button

```html
<button class="btn-cta">Transform Education</button>
```

**Special effects:**
- Gradient background (Nordshore → Gold)
- Shimmer on hover
- Slightly larger size
- More dramatic lift

---

### Forms

#### Input Fields

```html
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="form-input" placeholder="your@email.com">
</div>
```

**Interactions:**
- Focus: Border color changes to Nordshore
- Focus: Blue glow appears
- Error: Red border, shake animation
- Success: Green border, checkmark

**States:**
```css
.form-input:focus {
  border-color: #00393F;
  box-shadow: 0 0 0 3px rgba(0, 57, 63, 0.1);
}

.form-input.error {
  border-color: #913B2F; /* TEEI Clay */
  animation: shake 300ms;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

#### Form Validation

```javascript
// Automatic validation
const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  if (!validateForm(form)) {
    e.preventDefault();
    // Shows error states with shake animation
  }
});
```

---

### Cards

```html
<div class="card">
  <h3>Hover Me</h3>
  <p>Cards have subtle lift effects.</p>
</div>
```

**Interaction:**
- Hover: Scales to 102%, lifts with shadow
- Smooth 300ms transition
- Professional feel

```css
.card {
  background: white;
  border: 2px solid #C9E4EC; /* TEEI Sky */
  border-radius: 8px;
  padding: 24px;
  transition: all 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 57, 63, 0.15);
  border-color: #00393F;
}
```

---

## Animation Library

### Page Transitions

#### Fade

```html
<div class="page-transition-fade">
  <!-- Page content -->
</div>
```

**Effect:** Smoothly fades in
**Duration:** 300ms
**Best for:** General page navigation

#### Slide Up

```html
<div class="page-transition-slide-up">
  <!-- Page content -->
</div>
```

**Effect:** Slides up from below while fading in
**Duration:** 500ms
**Best for:** New content appearing

#### Reveal

```html
<div class="page-transition-reveal">
  <!-- Page content -->
</div>
```

**Effect:** Wipes from left to right
**Duration:** 500ms
**Best for:** Dramatic reveals

---

### Scroll-Triggered Reveals

#### Fade Up on Scroll

```html
<div class="reveal-on-scroll">
  <h2>This fades up when you scroll to it</h2>
</div>
```

**Effect:** Fades in and slides up when 20% visible
**Automatic:** JavaScript detects scrolling

#### Staggered Reveal

```html
<div class="stagger-container">
  <div class="stagger-item">Item 1</div>
  <div class="stagger-item">Item 2</div>
  <div class="stagger-item">Item 3</div>
</div>
```

**Effect:** Items appear one by one with 100ms delay
**Great for:** Lists, metrics, feature grids

---

### Data Animations

#### Number Count Up

```html
<div class="count-up" data-target="1000">0</div>
```

**Effect:** Numbers animate from 0 to target value
**Duration:** 2 seconds
**Use for:** Impact metrics, statistics

**JavaScript:**
```javascript
// Automatically triggers on scroll
document.querySelectorAll('.count-up').forEach(el => {
  const target = parseInt(el.dataset.target);
  animateCountUp(el, target, 2000);
});
```

#### Progress Bar

```html
<div class="progress-container" data-progress="75">
  <div class="progress-fill"></div>
</div>
```

**Effect:** Bar fills smoothly to percentage
**Duration:** 1.5 seconds
**Use for:** Goal completion, metrics

#### Chart Draw Animation

```javascript
// Animate SVG chart paths
const paths = svg.querySelectorAll('path');
animateChartDraw(paths, 1500);
```

**Effect:** Charts draw in smoothly
**Duration:** 1.5 seconds (staggered by 200ms)
**Use for:** Line charts, bar charts

---

### Microinteractions

#### Link Underline

```html
<a href="#" class="link">Learn More</a>
```

**Effect:** Underline grows from left to right on hover
**Color:** TEEI Gold (#BA8F5A)

```css
.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #BA8F5A;
  transition: width 300ms;
}

.link:hover::after {
  width: 100%;
}
```

#### Icon Pulse

```html
<i class="icon icon-pulse">★</i>
```

**Effect:** Gentle pulsing to draw attention
**Duration:** 2 seconds, infinite
**Use for:** Important CTAs, notifications

---

## PDF Interactivity

### Navigation Buttons

**Automatically added** when creating interactive PDF:

```bash
node scripts/create-interactive-pdf.js document.pdf --navigation
```

**Features:**
- Next/Previous buttons on each page
- Disabled on first/last page
- TEEI brand colors
- Smooth page transitions

### Form Validation

Add interactive forms to PDFs:

```json
{
  "form": {
    "fields": [
      {
        "name": "email",
        "type": "text",
        "scripts": {
          "validate": "validateEmail(event.value)"
        }
      }
    ]
  }
}
```

**Validation happens:**
- On blur (when leaving field)
- On form submit
- Visual feedback with colors

### Custom Actions

Add custom JavaScript to PDF buttons:

```javascript
// Print button
onClick: 'this.print();'

// Email button
onClick: 'this.mailDoc({ cTo: "contact@teei.org" });'

// Navigate to page
onClick: 'this.pageNum = 5;'

// Submit form
onClick: 'if(validateForm()) { this.submitForm(); }'
```

### Compatibility

**PDF Interactivity works in:**
- ✅ Adobe Acrobat Reader (full support)
- ✅ Adobe Acrobat Pro (full support)
- ⚠️ Browser PDF viewers (limited support)
- ❌ Most mobile PDF viewers (no JavaScript)

**For universal compatibility:** Generate web version with `--animations`

---

## Web Assets

### Generating Assets

```bash
node scripts/create-interactive-pdf.js document.pdf --animations
```

**Outputs:**
- `motion.css` - Animation styles
- `motion.js` - Interactive behaviors
- `interactions.css` - Component styles
- `interactions.js` - Interaction handlers
- `preview.html` - Live preview

### Using in Projects

**1. Include CSS:**
```html
<link rel="stylesheet" href="motion.css">
<link rel="stylesheet" href="interactions.css">
```

**2. Include JavaScript:**
```html
<script src="motion.js"></script>
<script src="interactions.js"></script>
```

**3. Add classes to elements:**
```html
<div class="reveal-fade-up">Content</div>
<button class="btn-primary">Action</button>
<div class="card">Card content</div>
```

**That's it!** Animations and interactions work automatically.

---

## Best Practices

### Performance

**✅ Do:**
- Use `transform` and `opacity` (GPU-accelerated)
- Keep animations under 1 second
- Use `will-change` sparingly
- Test on slower devices

**❌ Don't:**
- Animate `width`, `height`, `top`, `left` (slow)
- Run multiple heavy animations simultaneously
- Use excessive blur or shadows
- Animate on every scroll event

**Optimize:**
```css
/* Good - GPU accelerated */
.element {
  transform: translateY(20px);
  opacity: 0;
}

/* Bad - forces layout recalculation */
.element {
  top: 20px;
  display: none;
}
```

### Accessibility

**Respect reduced motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Keyboard navigation:**
- All interactive elements must be keyboard accessible
- Show focus states clearly
- Support Tab, Enter, Escape keys

**Screen readers:**
- Don't hide content with `display: none` during animations
- Use `aria-live` for dynamic content
- Provide text alternatives

### When to Animate

**✅ Good uses:**
- Page transitions (reduce jarring jumps)
- Drawing attention to CTAs
- Feedback on actions (success, error)
- Revealing content on scroll
- Data visualizations (make numbers engaging)

**❌ Avoid:**
- Animations just because you can
- Distracting from content
- Slowing down task completion
- Making users wait unnecessarily

**Rule of thumb:** Animation should **enhance**, not distract.

---

## Examples

### Marketing Page

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="motion.css">
  <link rel="stylesheet" href="interactions.css">
  <style>
    body {
      font-family: 'Roboto Flex', sans-serif;
      background: #FFF1E2; /* TEEI Sand */
    }

    .hero {
      background: linear-gradient(135deg, #00393F 0%, #BA8F5A 100%);
      color: white;
      padding: 80px 40px;
      text-align: center;
    }

    .hero h1 {
      font-family: 'Lora', serif;
      font-size: 48px;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <!-- Hero with fade transition -->
  <section class="hero page-transition-fade">
    <h1 class="reveal-fade-up">Transform Education</h1>
    <p class="reveal-fade-up" style="animation-delay: 200ms;">
      Empowering displaced students through technology
    </p>
    <button class="btn-cta" style="animation-delay: 400ms;">
      Learn More
    </button>
  </section>

  <!-- Metrics with staggered reveal -->
  <section class="stagger-container">
    <div class="metric-card stagger-item">
      <div class="count-up" data-target="1000">0</div>
      <p>Students Reached</p>
    </div>
    <div class="metric-card stagger-item">
      <div class="count-up" data-target="50">0</div>
      <p>Partner Organizations</p>
    </div>
    <div class="metric-card stagger-item">
      <div class="count-up" data-target="98">0</div>
      <p>Success Rate %</p>
    </div>
  </section>

  <!-- Interactive cards -->
  <section class="demo-grid">
    <div class="card reveal-on-scroll">
      <h3>Cloud Learning Platform</h3>
      <p>Access education anywhere, anytime.</p>
    </div>
    <div class="card reveal-on-scroll">
      <h3>Expert Instructors</h3>
      <p>Learn from the best in the field.</p>
    </div>
    <div class="card reveal-on-scroll">
      <h3>Career Support</h3>
      <p>Get help landing your dream job.</p>
    </div>
  </section>

  <script src="motion.js"></script>
  <script src="interactions.js"></script>
</body>
</html>
```

---

## Configuration

### Customize Timing

Edit `config/motion-design-config.json`:

```json
{
  "timing": {
    "instant": 100,
    "quick": 200,
    "standard": 300,
    "deliberate": 500
  }
}
```

### Customize Colors

```json
{
  "colors": {
    "primary": "#00393F",
    "accent": "#BA8F5A"
  }
}
```

### Choose Preset

```json
{
  "presets": {
    "minimal": {},     // Subtle animations only
    "standard": {},    // Balanced (default)
    "engaging": {},    // Full animations
    "professional": {} // Business-focused
  }
}
```

---

## Resources

### Files

- `scripts/create-interactive-pdf.js` - Main tool
- `scripts/lib/motion-designer.js` - Motion design engine
- `scripts/lib/interaction-builder.js` - Interaction components
- `scripts/lib/pdf-javascript-injector.js` - PDF interactivity
- `config/motion-design-config.json` - Configuration

### Further Reading

- **Material Design Motion**: https://material.io/design/motion/
- **Animation Principles**: https://www.12principles.com/
- **Web Animations API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- **Reduced Motion**: https://web.dev/prefers-reduced-motion/

---

## Support

**Test animations:**
```bash
# Generate preview
node scripts/create-interactive-pdf.js document.pdf --animations

# Open in browser
open document-interactive-assets/preview.html
```

**Adjust timing:**
- Too fast? Increase duration in config
- Too slow? Decrease duration
- Jarring? Try different easing function

**Remember:** Less is more. Subtle, purposeful animation > flashy effects.

---

**Create engaging, professional digital experiences that embody TEEI's warm, empowering brand! ✨**
