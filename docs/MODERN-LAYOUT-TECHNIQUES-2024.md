# Modern Brochure Layout Techniques 2024-2025

**Purpose**: Concrete CSS/HTML implementation patterns for creating visually varied PDF brochures
**Target**: Playwright PDF generation with world-class design quality
**Updated**: 2025-11-06

---

## Table of Contents

1. [Full-Bleed Hero Images with Text Overlays](#1-full-bleed-hero-images)
2. [Diagonal Section Splits](#2-diagonal-section-splits)
3. [Circular Image Masks](#3-circular-image-masks)
4. [Asymmetric Layouts](#4-asymmetric-layouts)
5. [Layered Elements with Depth](#5-layered-elements-with-depth)
6. [Varying Grid Systems Per Page](#6-varying-grid-systems)
7. [Complete Page Examples](#7-complete-page-examples)

---

## 1. Full-Bleed Hero Images with Text Overlays

**What**: Images that extend to the edge of the page with text overlaid on top
**Effect**: Immersive, professional, attention-grabbing
**Print Requirement**: Add 0.125" (9pt) bleed on all sides

### Basic Full-Bleed Hero

```html
<div class="hero-fullbleed">
  <img src="hero-image.jpg" alt="Hero" class="hero-image">
  <div class="hero-overlay">
    <h1>Transform Education</h1>
    <p>Empowering 50,000+ students globally</p>
  </div>
</div>
```

```css
.hero-fullbleed {
  position: relative;
  width: calc(8.5in + 0.25in); /* Letter + bleed */
  height: calc(4in + 0.25in);
  margin: -0.125in; /* Negative margin for bleed */
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.hero-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 2;
  width: 80%;
}

.hero-overlay::before {
  content: '';
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: rgba(0, 57, 63, 0.6); /* TEEI Nordshore at 60% */
  z-index: -1;
  border-radius: 8px;
}

.hero-overlay h1 {
  font-family: 'Lora', serif;
  font-size: 48pt;
  font-weight: bold;
  margin: 0 0 12pt 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-overlay p {
  font-family: 'Roboto Flex', sans-serif;
  font-size: 18pt;
  margin: 0;
}
```

### Advanced: Gradient Overlay

```css
.hero-gradient {
  position: relative;
  width: calc(8.5in + 0.25in);
  height: calc(5in + 0.25in);
  margin: -0.125in;
  overflow: hidden;
}

.hero-gradient::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(
    to top,
    rgba(0, 57, 63, 0.9) 0%,    /* TEEI Nordshore */
    rgba(0, 57, 63, 0.4) 60%,
    transparent 100%
  );
  z-index: 1;
}

.hero-gradient .hero-content {
  position: absolute;
  bottom: 40pt;
  left: 40pt;
  right: 40pt;
  z-index: 2;
  color: white;
}
```

### Print-Ready Bleed Setup

```css
@page {
  size: 8.5in 11in;
  margin: 0; /* No margins for full-bleed */
}

.page {
  width: calc(8.5in + 0.25in); /* Add 0.125in bleed on each side */
  height: calc(11in + 0.25in);
  position: relative;
  background: white;
}

.safe-area {
  position: absolute;
  top: 0.125in; /* Start after bleed */
  left: 0.125in;
  width: 8.5in; /* Actual page size */
  height: 11in;
  padding: 40pt; /* Safe margins inside */
}
```

---

## 2. Diagonal Section Splits

**What**: Sections divided by diagonal lines instead of horizontal/vertical
**Effect**: Dynamic, modern, guides eye movement
**Methods**: clip-path (best) or transform: skewY()

### Method 1: clip-path (Recommended)

```html
<div class="section-diagonal">
  <div class="content">
    <h2>Our Impact</h2>
    <p>Transforming lives through education</p>
  </div>
</div>
```

```css
.section-diagonal {
  background: #00393F; /* TEEI Nordshore */
  color: white;
  padding: 60pt 40pt;
  clip-path: polygon(
    0 0,           /* Top left */
    100% 10%,      /* Top right (10% down) */
    100% 100%,     /* Bottom right */
    0 90%          /* Bottom left (90% down) */
  );
}
```

### Common Diagonal Patterns

```css
/* Top-right diagonal cut */
.diagonal-topright {
  clip-path: polygon(0 0, 100% 10%, 100% 100%, 0 100%);
}

/* Bottom-left diagonal cut */
.diagonal-bottomleft {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 90%);
}

/* Both sides diagonal */
.diagonal-both {
  clip-path: polygon(0 10%, 100% 0, 100% 90%, 0 100%);
}

/* Steep angle (15 degrees) */
.diagonal-steep {
  clip-path: polygon(0 0, 100% 15%, 100% 100%, 0 85%);
}

/* Shallow angle (5 degrees) */
.diagonal-shallow {
  clip-path: polygon(0 0, 100% 5%, 100% 100%, 0 95%);
}
```

### Two-Color Diagonal Split

```html
<div class="split-diagonal">
  <div class="split-left">
    <h2>Education</h2>
    <p>50,000+ students reached</p>
  </div>
  <div class="split-right">
    <h2>Technology</h2>
    <p>Powered by AWS infrastructure</p>
  </div>
</div>
```

```css
.split-diagonal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 400pt;
  position: relative;
}

.split-left {
  background: #00393F; /* TEEI Nordshore */
  color: white;
  padding: 60pt 40pt;
  clip-path: polygon(0 0, 100% 0, 85% 100%, 0 100%);
  z-index: 2;
}

.split-right {
  background: #C9E4EC; /* TEEI Sky */
  color: #00393F;
  padding: 60pt 40pt 60pt 80pt; /* Extra left padding for overlap */
  clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
  z-index: 1;
}
```

### Method 2: skewY() Transform (Alternative)

```css
.section-skewed {
  transform: skewY(-3deg);
  background: #00393F;
  padding: 80pt 40pt; /* Extra padding for skew */
  margin: 40pt 0;
}

.section-skewed > * {
  transform: skewY(3deg); /* Unskew content */
}
```

---

## 3. Circular Image Masks

**What**: Images displayed in circular frames
**Effect**: Softens design, draws attention, modern aesthetic
**Best For**: Team photos, partner logos, icons

### Basic Circle Mask

```html
<div class="circle-image">
  <img src="person.jpg" alt="Team member">
</div>
```

```css
.circle-image {
  width: 150pt;
  height: 150pt;
  border-radius: 50%;
  overflow: hidden;
  background: #C9E4EC; /* TEEI Sky fallback */
}

.circle-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
```

### Circle with Border Frame

```css
.circle-framed {
  width: 150pt;
  height: 150pt;
  border-radius: 50%;
  overflow: hidden;
  border: 4pt solid #BA8F5A; /* TEEI Gold */
  box-shadow: 0 4pt 12pt rgba(0, 0, 0, 0.15);
}
```

### Circular Team Grid

```html
<div class="team-grid">
  <div class="team-member">
    <div class="circle-image">
      <img src="member1.jpg" alt="Member 1">
    </div>
    <h3>Jane Doe</h3>
    <p>Director</p>
  </div>
  <!-- Repeat for other members -->
</div>
```

```css
.team-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40pt;
  padding: 60pt 40pt;
}

.team-member {
  text-align: center;
}

.team-member .circle-image {
  width: 120pt;
  height: 120pt;
  margin: 0 auto 20pt;
  border: 3pt solid #BA8F5A;
  transition: transform 0.3s ease;
}

.team-member h3 {
  font-family: 'Lora', serif;
  font-size: 16pt;
  color: #00393F;
  margin: 0 0 8pt 0;
}

.team-member p {
  font-family: 'Roboto Flex', sans-serif;
  font-size: 12pt;
  color: #666;
  margin: 0;
}
```

### Circle with Colored Background Ring

```css
.circle-ring {
  position: relative;
  width: 180pt;
  height: 180pt;
  border-radius: 50%;
  background: linear-gradient(135deg, #00393F 0%, #65873B 100%);
  padding: 6pt;
}

.circle-ring .inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: white;
}

.circle-ring img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Overlapping Circles Layout

```css
.circles-overlap {
  position: relative;
  height: 200pt;
  margin: 40pt;
}

.circles-overlap .circle {
  position: absolute;
  width: 150pt;
  height: 150pt;
  border-radius: 50%;
  overflow: hidden;
  border: 3pt solid white;
  box-shadow: 0 4pt 12pt rgba(0, 0, 0, 0.2);
}

.circles-overlap .circle:nth-child(1) {
  left: 0;
  z-index: 3;
}

.circles-overlap .circle:nth-child(2) {
  left: 100pt;
  z-index: 2;
}

.circles-overlap .circle:nth-child(3) {
  left: 200pt;
  z-index: 1;
}
```

---

## 4. Asymmetric Layouts

**What**: Non-uniform element arrangement breaking traditional grids
**Effect**: Energy, movement, modern feel
**Key**: Use grid foundation to keep organized chaos

### Basic Asymmetric Grid

```html
<div class="asymmetric-grid">
  <div class="item large">Featured Content</div>
  <div class="item small-1">Detail 1</div>
  <div class="item small-2">Detail 2</div>
  <div class="item medium">Supporting Info</div>
</div>
```

```css
.asymmetric-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(6, 80pt);
  gap: 20pt;
  padding: 40pt;
}

.item {
  background: #C9E4EC; /* TEEI Sky */
  padding: 20pt;
  border-radius: 4pt;
}

.large {
  grid-column: 1 / 8;   /* Spans 7 columns */
  grid-row: 1 / 4;      /* Spans 3 rows */
  background: #00393F;  /* TEEI Nordshore */
  color: white;
}

.small-1 {
  grid-column: 8 / 11;  /* Spans 3 columns */
  grid-row: 1 / 2;
}

.small-2 {
  grid-column: 11 / 13; /* Spans 2 columns */
  grid-row: 1 / 3;
}

.medium {
  grid-column: 8 / 13;
  grid-row: 3 / 5;
  background: #BA8F5A;  /* TEEI Gold */
  color: white;
}
```

### Named Grid Areas (Easier to Visualize)

```css
.asymmetric-named {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 100pt);
  gap: 20pt;
  grid-template-areas:
    "hero hero stats stats"
    "hero hero stats stats"
    "info info metrics partner"
    "details details details partner";
}

.hero { grid-area: hero; }
.stats { grid-area: stats; }
.info { grid-area: info; }
.metrics { grid-area: metrics; }
.partner { grid-area: partner; }
.details { grid-area: details; }
```

### Off-Center Two-Column

```css
.asymmetric-columns {
  display: grid;
  grid-template-columns: 2fr 1fr; /* Left column 2x wider */
  gap: 40pt;
  padding: 60pt 40pt;
}

.main-content {
  /* Larger content area */
}

.sidebar {
  /* Smaller sidebar */
  align-self: start; /* Don't stretch full height */
}
```

### Broken Grid with Overlapping

```css
.broken-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20pt;
  padding: 40pt;
  position: relative;
}

.breakout-element {
  grid-column: 4 / 10;
  position: relative;
  z-index: 10;
  margin-top: -60pt; /* Overlap previous section */
  background: white;
  padding: 40pt;
  box-shadow: 0 8pt 24pt rgba(0, 0, 0, 0.12);
  border-radius: 8pt;
}
```

---

## 5. Layered Elements with Depth

**What**: Overlapping elements with z-index and shadows for 3D effect
**Effect**: Depth, hierarchy, visual interest
**Key**: Use consistent shadow system

### Shadow System (TEEI Standard)

```css
/* Define shadow variables */
:root {
  --shadow-sm: 0 2pt 4pt rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4pt 8pt rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8pt 16pt rgba(0, 0, 0, 0.16);
  --shadow-xl: 0 12pt 24pt rgba(0, 0, 0, 0.20);
}
```

### Basic Layered Cards

```html
<div class="card-stack">
  <div class="card back"></div>
  <div class="card middle"></div>
  <div class="card front">
    <h3>Featured Program</h3>
    <p>Content here</p>
  </div>
</div>
```

```css
.card-stack {
  position: relative;
  width: 400pt;
  height: 300pt;
  margin: 40pt;
}

.card {
  position: absolute;
  width: 100%;
  padding: 30pt;
  border-radius: 8pt;
  background: white;
}

.card.back {
  top: 20pt;
  left: 20pt;
  background: #EFE1DC; /* TEEI Beige */
  z-index: 1;
  box-shadow: var(--shadow-sm);
}

.card.middle {
  top: 10pt;
  left: 10pt;
  background: #C9E4EC; /* TEEI Sky */
  z-index: 2;
  box-shadow: var(--shadow-md);
}

.card.front {
  top: 0;
  left: 0;
  background: white;
  z-index: 3;
  box-shadow: var(--shadow-lg);
}
```

### Image with Text Overlay Card

```css
.image-overlay-card {
  position: relative;
  width: 500pt;
  height: 350pt;
  border-radius: 8pt;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.image-overlay-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.image-overlay-card .overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30pt;
  background: linear-gradient(
    to top,
    rgba(0, 57, 63, 0.95) 0%,
    rgba(0, 57, 63, 0.7) 50%,
    transparent 100%
  );
  z-index: 2;
  color: white;
}
```

### Floating Stats Cards

```html
<div class="stats-container">
  <img src="background.jpg" class="bg-image">
  <div class="stat-card" style="top: 60pt; left: 40pt;">
    <h2>50,000+</h2>
    <p>Students Reached</p>
  </div>
  <div class="stat-card" style="top: 200pt; right: 40pt;">
    <h2>95%</h2>
    <p>Success Rate</p>
  </div>
</div>
```

```css
.stats-container {
  position: relative;
  width: 100%;
  height: 500pt;
  overflow: hidden;
}

.stats-container .bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.stat-card {
  position: absolute;
  background: white;
  padding: 30pt;
  border-radius: 8pt;
  box-shadow: var(--shadow-xl);
  min-width: 200pt;
  text-align: center;
  z-index: 10;
}

.stat-card h2 {
  font-family: 'Lora', serif;
  font-size: 48pt;
  color: #BA8F5A; /* TEEI Gold */
  margin: 0 0 8pt 0;
}

.stat-card p {
  font-family: 'Roboto Flex', sans-serif;
  font-size: 14pt;
  color: #00393F;
  margin: 0;
}
```

### Elevated Content Sections

```css
.elevated-section {
  background: #FFF1E2; /* TEEI Sand */
  padding: 80pt 40pt;
}

.elevated-card {
  background: white;
  padding: 40pt;
  border-radius: 12pt;
  box-shadow: var(--shadow-lg);
  margin: 20pt 0;
  transform: translateY(-20pt); /* Lift effect */
}
```

---

## 6. Varying Grid Systems Per Page

**What**: Different grid structures for different pages
**Effect**: Visual variety, prevents monotony
**Key**: Maintain consistent spacing (20pt gaps, 40pt margins)

### Page 1: Single Column (Cover Page)

```css
.page-cover {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 80pt 60pt;
  background: linear-gradient(135deg, #00393F 0%, #65873B 100%);
  color: white;
}

.page-cover h1 {
  font-family: 'Lora', serif;
  font-size: 56pt;
  margin: 0 0 20pt 0;
}

.page-cover p {
  font-family: 'Roboto Flex', sans-serif;
  font-size: 18pt;
  max-width: 500pt;
}
```

### Page 2: Two-Column Symmetric

```css
.page-two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40pt;
  padding: 60pt 40pt;
}

.column {
  /* Each column equal width */
}
```

### Page 3: Three-Column Layout

```css
.page-three-column {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30pt;
  padding: 60pt 40pt;
}

.column-card {
  background: #C9E4EC;
  padding: 30pt;
  border-radius: 8pt;
}
```

### Page 4: Sidebar Layout (2fr + 1fr)

```css
.page-sidebar {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40pt;
  padding: 60pt 40pt;
}

.main-content {
  /* Wider main area */
}

.sidebar {
  background: #EFE1DC;
  padding: 30pt;
  border-radius: 8pt;
}
```

### Page 5: Masonry/Pinterest Style

```css
.page-masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 100pt;
  gap: 20pt;
  padding: 40pt;
}

.masonry-item {
  background: #C9E4EC;
  padding: 20pt;
  border-radius: 4pt;
}

/* Different heights */
.masonry-item.tall-1 { grid-row: span 2; }
.masonry-item.tall-2 { grid-row: span 3; }
.masonry-item.tall-3 { grid-row: span 4; }
```

### Page 6: 12-Column Complex Grid

```css
.page-twelve-column {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20pt;
  padding: 40pt;
}

.hero {
  grid-column: 1 / 9;  /* Spans 8 columns */
  grid-row: 1 / 3;     /* Spans 2 rows */
}

.sidebar-1 {
  grid-column: 9 / 13; /* Spans 4 columns */
  grid-row: 1 / 2;
}

.sidebar-2 {
  grid-column: 9 / 13;
  grid-row: 2 / 3;
}

.full-width {
  grid-column: 1 / 13; /* Full width */
}
```

### Page 7: Z-Pattern Layout

```css
.page-z-pattern {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 40pt;
  padding: 60pt 40pt;
}

.z-top {
  grid-column: 1 / 3;  /* Full width */
}

.z-middle-left {
  grid-column: 1 / 2;
}

.z-middle-right {
  grid-column: 2 / 3;
}

.z-bottom {
  grid-column: 1 / 3;  /* Full width */
}
```

---

## 7. Complete Page Examples

### Example 1: Hero Page with Diagonal Transition

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: 8.5in 11in;
      margin: 0;
    }

    body {
      margin: 0;
      font-family: 'Roboto Flex', sans-serif;
    }

    .page {
      width: 8.5in;
      height: 11in;
      position: relative;
      background: white;
      overflow: hidden;
    }

    .hero-section {
      position: relative;
      height: 7in;
      background: url('hero.jpg') center/cover;
      clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
    }

    .hero-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
      z-index: 2;
    }

    .hero-overlay h1 {
      font-family: 'Lora', serif;
      font-size: 48pt;
      margin: 0 0 20pt 0;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
    }

    .content-section {
      padding: 60pt 40pt 40pt;
      background: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30pt;
      text-align: center;
    }

    .stat h2 {
      font-family: 'Lora', serif;
      font-size: 42pt;
      color: #BA8F5A;
      margin: 0 0 8pt 0;
    }

    .stat p {
      font-size: 14pt;
      color: #00393F;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="hero-section">
      <div class="hero-overlay">
        <h1>Transform Education</h1>
        <p style="font-size: 18pt;">Empowering students globally through technology</p>
      </div>
    </div>

    <div class="content-section">
      <div class="stats-grid">
        <div class="stat">
          <h2>50,000+</h2>
          <p>Students Reached</p>
        </div>
        <div class="stat">
          <h2>95%</h2>
          <p>Success Rate</p>
        </div>
        <div class="stat">
          <h2>25</h2>
          <p>Countries</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

### Example 2: Asymmetric Content Page with Circles

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: 8.5in 11in;
      margin: 0;
    }

    .page {
      width: 8.5in;
      height: 11in;
      padding: 60pt 40pt;
      background: white;
    }

    .asymmetric-layout {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-template-rows: repeat(6, 100pt);
      gap: 20pt;
    }

    .main-content {
      grid-column: 1 / 8;
      grid-row: 1 / 5;
      background: #00393F;
      color: white;
      padding: 40pt;
      border-radius: 8pt;
    }

    .main-content h2 {
      font-family: 'Lora', serif;
      font-size: 36pt;
      margin: 0 0 20pt 0;
    }

    .circle-showcase {
      grid-column: 8 / 13;
      grid-row: 1 / 4;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
    }

    .circle {
      width: 120pt;
      height: 120pt;
      border-radius: 50%;
      overflow: hidden;
      border: 4pt solid #BA8F5A;
      box-shadow: 0 4pt 12pt rgba(0, 0, 0, 0.15);
    }

    .circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .info-card {
      grid-column: 8 / 13;
      grid-row: 4 / 7;
      background: #C9E4EC;
      padding: 30pt;
      border-radius: 8pt;
      box-shadow: 0 8pt 16pt rgba(0, 0, 0, 0.12);
    }

    .footer-bar {
      grid-column: 1 / 13;
      grid-row: 6 / 7;
      background: #BA8F5A;
      color: white;
      padding: 20pt 30pt;
      border-radius: 8pt;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16pt;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="asymmetric-layout">
      <div class="main-content">
        <h2>Our Programs</h2>
        <p>Comprehensive education solutions that transform lives and communities through innovative technology partnerships.</p>
      </div>

      <div class="circle-showcase">
        <div class="circle">
          <img src="program1.jpg" alt="Program 1">
        </div>
        <div class="circle">
          <img src="program2.jpg" alt="Program 2">
        </div>
      </div>

      <div class="info-card">
        <h3 style="font-family: Lora; font-size: 24pt; margin: 0 0 12pt 0;">Key Benefits</h3>
        <ul style="font-size: 12pt; line-height: 1.6;">
          <li>Scalable infrastructure</li>
          <li>Global reach</li>
          <li>Proven results</li>
        </ul>
      </div>

      <div class="footer-bar">
        Ready to Transform Education?
      </div>
    </div>
  </div>
</body>
</html>
```

### Example 3: Full-Width Two-Tone Split

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    @page {
      size: 8.5in 11in;
      margin: 0;
    }

    .page {
      width: 8.5in;
      height: 11in;
      position: relative;
      overflow: hidden;
    }

    .split-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      height: 100%;
    }

    .left-section {
      background: #00393F;
      color: white;
      padding: 80pt 60pt;
      clip-path: polygon(0 0, 100% 0, 90% 100%, 0 100%);
      z-index: 2;
      position: relative;
    }

    .left-section h1 {
      font-family: 'Lora', serif;
      font-size: 42pt;
      margin: 0 0 30pt 0;
    }

    .left-section p {
      font-size: 14pt;
      line-height: 1.8;
      margin: 0 0 20pt 0;
    }

    .right-section {
      background: #C9E4EC;
      padding: 80pt 60pt 80pt 100pt;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .stat-box {
      background: white;
      padding: 30pt;
      border-radius: 8pt;
      margin-bottom: 20pt;
      box-shadow: 0 4pt 12pt rgba(0, 0, 0, 0.1);
    }

    .stat-box h3 {
      font-family: 'Lora', serif;
      font-size: 36pt;
      color: #BA8F5A;
      margin: 0 0 8pt 0;
    }

    .stat-box p {
      font-size: 12pt;
      color: #00393F;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="split-container">
      <div class="left-section">
        <h1>Partnership Model</h1>
        <p>We collaborate with leading technology partners to deliver world-class educational solutions at scale.</p>
        <p>Our proven approach combines cutting-edge infrastructure with pedagogical excellence.</p>
      </div>

      <div class="right-section">
        <div class="stat-box">
          <h3>50,000+</h3>
          <p>Students Impacted</p>
        </div>
        <div class="stat-box">
          <h3>25</h3>
          <p>Countries Served</p>
        </div>
        <div class="stat-box">
          <h3>95%</h3>
          <p>Success Rate</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## Key Takeaways

### Do's
- **Use full-bleed for impact**: Hero images that extend to edges create immersion
- **Add 0.125" bleed for print**: Critical for proper trimming
- **Vary grid systems per page**: 1-column, 2-column, 3-column, 12-column, asymmetric
- **Use clip-path for diagonals**: More reliable than transform: skewY()
- **Layer with z-index + shadows**: Creates depth and hierarchy
- **Circle masks for softness**: border-radius: 50% on square containers
- **Consistent spacing**: 20pt gaps, 40pt margins, 60pt section breaks

### Don'ts
- **Don't overuse effects**: Pick 2-3 techniques per document
- **Don't forget safe areas**: Keep critical content 40pt from edges
- **Don't mix too many angles**: Stick to one diagonal angle (5-15 degrees)
- **Don't ignore contrast**: Ensure text readability on images (overlays, shadows)
- **Don't break grid completely**: Use 12-column foundation even for asymmetric layouts

### Best Practices
1. **Test at multiple zoom levels**: 100%, 150%, 200%
2. **Use consistent shadow system**: Small, medium, large, extra-large
3. **Maintain color hierarchy**: Primary (Nordshore), Secondary (Sky), Accent (Gold)
4. **Balance variety with consistency**: Different layouts, same spacing/typography
5. **Print test**: Always print one copy before full run

---

## Playwright PDF Generation Settings

### For High-Quality Print PDFs

```javascript
await page.pdf({
  path: 'output.pdf',
  format: 'Letter',
  printBackground: true,
  preferCSSPageSize: true,
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  displayHeaderFooter: false
});
```

### CSS for Print Media

```css
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  img {
    page-break-inside: avoid;
  }

  .page {
    page-break-after: always;
  }

  .page:last-child {
    page-break-after: avoid;
  }
}
```

---

**End of Guide**

For TEEI-specific brand compliance, see: `T:\Projects\pdf-orchestrator\reports\TEEI_AWS_Design_Fix_Report.md`
