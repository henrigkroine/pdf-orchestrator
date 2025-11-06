#!/usr/bin/env node
/**
 * Together for Ukraine - WORLD-CLASS 8-PAGE PDF
 * Each page has COMPLETELY DIFFERENT layout based on nonprofit best practices
 * Research: 3 agents analyzed UNICEF, Red Cross, Save the Children designs
 */
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

// Helper to read files as base64
function getImageBase64(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    let mimeType = 'image/png';
    if (ext === '.svg') mimeType = 'image/svg+xml';
    else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
    return `data:${mimeType};base64,${fileContent.toString('base64')}`;
  } catch (err) {
    console.warn(`Warning: Could not load ${filePath}:`, err.message);
    return null;
  }
}

(async () => {
  console.log('================================================================================');
  console.log('TOGETHER FOR UKRAINE - WORLD-CLASS 8-PAGE PDF');
  console.log('Each page features unique layout based on nonprofit best practices');
  console.log('Research: UNICEF, Red Cross, Save the Children, Charity: Water');
  console.log('================================================================================\n');

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Load logos
  const teeiLogoWhite = getImageBase64('T:/TEEI/Logos/TEEI logo webpage white.png');
  const teeiLogoDark = getImageBase64('T:/TEEI/Logos/TEEI logo dark.png');
  const togetherUkraineLogo = getImageBase64('T:/TEEI/Logos/Together for Ukraine_Logo_white.png');

  // Partner logos
  const googleLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/google.svg');
  const awsLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/aws.svg');
  const cornellLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/cornell.svg');
  const oxfordLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/oxford.svg');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Together for Ukraine - World-Class Brochure</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: 8.5in 11in;
      margin: 0;
    }

    :root {
      --color-nordshore: #00393F;
      --color-sky: #C9E4EC;
      --color-sand: #FFF1E2;
      --color-beige: #EFE1DC;
      --color-moss: #65873B;
      --color-gold: #BA8F5A;
      --color-clay: #913B2F;
      --font-headline: 'Lora', serif;
      --font-body: 'Roboto', 'Segoe UI', Arial, sans-serif;
    }

    body {
      font-family: var(--font-body);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }

    /* ============================================================
       PAGE 1: FULL-BLEED HERO WITH BOTTOM-THIRD OVERLAY
       ============================================================ */
    .page-1 {
      background: linear-gradient(135deg, var(--color-nordshore) 0%, #005560 50%, var(--color-sky) 100%);
      position: relative;
    }

    .hero-background {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background-image:
        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%);
    }

    .hero-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 50%;
      background: linear-gradient(to top, rgba(0,57,63,0.95) 0%, rgba(0,57,63,0.7) 50%, transparent 100%);
    }

    .logo-top-left {
      position: absolute;
      top: 40pt;
      left: 40pt;
      z-index: 10;
    }

    .logo-top-left img {
      height: 50pt;
    }

    .cover-content {
      position: absolute;
      bottom: 80pt;
      left: 40pt;
      right: 40pt;
      z-index: 10;
      color: white;
    }

    .cover-title {
      font-family: var(--font-headline);
      font-weight: 700;
      font-size: 56pt;
      line-height: 1.1;
      color: var(--color-sand);
      margin-bottom: 20pt;
      max-width: 550pt;
    }

    .cover-subtitle {
      font-size: 20pt;
      line-height: 1.5;
      color: var(--color-sky);
      max-width: 500pt;
      margin-bottom: 30pt;
    }

    .ukraine-logo-cover img {
      height: 45pt;
    }

    /* ============================================================
       PAGE 2: DIAGONAL SPLIT LAYOUT
       ============================================================ */
    .page-2 {
      background: var(--color-sand);
      position: relative;
    }

    .diagonal-image-section {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      clip-path: polygon(0 100%, 100% 20%, 100% 100%);
      background: linear-gradient(135deg, var(--color-nordshore) 0%, var(--color-sky) 100%);
    }

    .diagonal-content-area {
      position: absolute;
      top: 40pt;
      left: 40pt;
      right: 40pt;
      max-width: 55%;
      z-index: 10;
    }

    .teei-logo-small {
      height: 35pt;
      margin-bottom: 30pt;
    }

    .section-title {
      font-family: var(--font-headline);
      font-weight: 700;
      font-size: 42pt;
      color: var(--color-nordshore);
      margin-bottom: 20pt;
      line-height: 1.2;
    }

    .about-text {
      font-size: 12pt;
      line-height: 1.7;
      color: #000;
      margin-bottom: 15pt;
    }

    .mission-box {
      background: white;
      border-left: 6pt solid var(--color-gold);
      padding: 25pt;
      margin-top: 30pt;
      border-radius: 6pt;
      box-shadow: 0 4pt 12pt rgba(0,57,63,0.15);
    }

    .mission-box h3 {
      font-family: var(--font-headline);
      font-weight: 600;
      font-size: 18pt;
      color: var(--color-nordshore);
      margin-bottom: 12pt;
    }

    .mission-box p {
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
    }

    .stats-floating {
      position: absolute;
      bottom: 60pt;
      right: 40pt;
      background: rgba(255,255,255,0.95);
      padding: 30pt;
      border-radius: 8pt;
      box-shadow: 0 8pt 24pt rgba(0,57,63,0.25);
      display: flex;
      gap: 40pt;
      z-index: 15;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-family: var(--font-headline);
      font-weight: 700;
      font-size: 48pt;
      color: var(--color-gold);
      display: block;
      line-height: 1;
    }

    .stat-label {
      font-size: 10pt;
      color: var(--color-nordshore);
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      margin-top: 8pt;
    }

    /* ============================================================
       PAGE 3: CIRCULAR FRAMES + CONTENT CARDS (2-COLUMN)
       ============================================================ */
    .page-3 {
      background: var(--color-beige);
      padding: 40pt;
    }

    .page-3-grid {
      display: grid;
      grid-template-columns: 240pt 1fr;
      gap: 40pt;
      height: 100%;
    }

    .circles-column {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      gap: 25pt;
    }

    .circular-frame {
      width: 200pt;
      height: 200pt;
      border-radius: 50%;
      border: 6pt solid var(--color-nordshore);
      background: linear-gradient(135deg, var(--color-nordshore) 0%, var(--color-sky) 100%);
      box-shadow: 0 8pt 24pt rgba(0,57,63,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-headline);
      font-size: 18pt;
      color: white;
      text-align: center;
      padding: 20pt;
    }

    .cards-column {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      gap: 18pt;
    }

    .program-card {
      background: white;
      padding: 24pt;
      border-radius: 8pt;
      border-left: 5pt solid var(--color-nordshore);
      box-shadow: 0 4pt 16pt rgba(0,0,0,0.1);
    }

    .card-title {
      font-family: var(--font-headline);
      font-weight: 600;
      font-size: 20pt;
      color: var(--color-nordshore);
      margin-bottom: 10pt;
    }

    .card-text {
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
    }

    /* ============================================================
       PAGE 4: ASYMMETRIC TEXT WRAP LAYOUT
       ============================================================ */
    .page-4 {
      background: white;
      padding: 40pt;
      position: relative;
    }

    .floating-image-large {
      float: right;
      width: 400pt;
      height: 450pt;
      margin: -20pt -20pt 20pt 30pt;
      border-radius: 12pt;
      background: linear-gradient(135deg, var(--color-nordshore) 0%, var(--color-sky) 100%);
      box-shadow: 0 12pt 32pt rgba(0,57,63,0.3);
      shape-outside: margin-box;
    }

    .wrap-content {
      font-size: 11pt;
      line-height: 1.7;
      color: #000;
      text-align: justify;
    }

    .pullquote-box {
      position: absolute;
      bottom: 60pt;
      left: 40pt;
      width: 320pt;
      background: var(--color-sky);
      padding: 30pt;
      border-radius: 8pt;
      border-left: 8pt solid var(--color-nordshore);
    }

    .pullquote-text {
      font-family: var(--font-headline);
      font-style: italic;
      font-size: 18pt;
      line-height: 1.5;
      color: var(--color-nordshore);
      margin-bottom: 12pt;
    }

    .pullquote-author {
      font-size: 11pt;
      font-weight: 600;
      color: var(--color-nordshore);
    }

    /* ============================================================
       PAGE 5: STAGGERED 3-COLUMN GRID WITH OVERLAP
       ============================================================ */
    .page-5 {
      background: var(--color-sand);
      padding: 40pt;
    }

    .page-title-centered {
      font-family: var(--font-headline);
      font-weight: 700;
      font-size: 48pt;
      color: var(--color-nordshore);
      text-align: center;
      margin-bottom: 50pt;
    }

    .three-column-stagger {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 25pt;
      align-items: start;
    }

    .column-1,
    .column-3 {
      transform: translateY(0);
    }

    .column-2 {
      transform: translateY(50pt);
    }

    .youth-card {
      background: white;
      border-radius: 12pt;
      overflow: hidden;
      box-shadow: 0 8pt 24pt rgba(0,57,63,0.15);
      margin-bottom: 20pt;
    }

    .youth-card.accent {
      background: var(--color-sky);
    }

    .card-image-placeholder {
      width: 100%;
      height: 140pt;
      background: linear-gradient(135deg, var(--color-nordshore) 0%, var(--color-sky) 100%);
    }

    .youth-icon {
      width: 48pt;
      height: 48pt;
      background: var(--color-nordshore);
      border-radius: 50%;
      margin: -24pt auto 0 auto;
      display: block;
      border: 4pt solid white;
    }

    .youth-card-content {
      padding: 30pt 20pt 24pt 20pt;
      text-align: center;
    }

    .youth-card-title {
      font-family: var(--font-headline);
      font-weight: 600;
      font-size: 18pt;
      color: var(--color-nordshore);
      margin-bottom: 12pt;
    }

    .youth-card-text {
      font-size: 10pt;
      line-height: 1.6;
      color: #333;
    }

    /* ============================================================
       PAGE 6: FULL-WIDTH BANNER + ASYMMETRIC 40/60 SPLIT
       ============================================================ */
    .page-6 {
      background: white;
    }

    .banner-full {
      width: 100%;
      height: 280pt;
      position: relative;
      background: linear-gradient(135deg, var(--color-nordshore) 0%, #005560 50%, var(--color-sky) 100%);
    }

    .banner-overlay-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
      z-index: 10;
    }

    .banner-title {
      font-family: var(--font-headline);
      font-weight: 700;
      font-size: 52pt;
      text-shadow: 0 4pt 12pt rgba(0,0,0,0.5);
      margin-bottom: 12pt;
    }

    .banner-subtitle {
      font-size: 20pt;
      color: var(--color-sand);
      text-shadow: 0 2pt 8pt rgba(0,0,0,0.5);
    }

    .split-content {
      display: grid;
      grid-template-columns: 40% 60%;
      min-height: calc(11in - 280pt);
    }

    .testimonial-panel {
      background: var(--color-beige);
      padding: 40pt;
    }

    .testimonial-circle {
      width: 120pt;
      height: 120pt;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-nordshore) 0%, var(--color-sky) 100%);
      margin: 0 auto 20pt auto;
      border: 6pt solid var(--color-nordshore);
    }

    .testimonial-quote {
      font-family: var(--font-headline);
      font-style: italic;
      font-size: 14pt;
      line-height: 1.6;
      color: var(--color-nordshore);
      margin-bottom: 16pt;
    }

    .testimonial-name {
      font-weight: 600;
      font-size: 11pt;
      color: var(--color-nordshore);
      text-align: right;
    }

    .mini-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 20pt;
      padding: 40pt;
    }

    .mini-card {
      background: white;
      border: 2pt solid var(--color-sky);
      border-radius: 8pt;
      padding: 20pt;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .mini-card-title {
      font-weight: 600;
      font-size: 13pt;
      color: var(--color-nordshore);
      margin-bottom: 8pt;
    }

    .mini-card-stat {
      font-family: var(--font-headline);
      font-weight: 700;
      font-size: 28pt;
      color: var(--color-gold);
    }

    /* ============================================================
       PAGE 7: Z-PATTERN ALTERNATING SECTIONS
       ============================================================ */
    .page-7 {
      background: white;
      padding: 40pt;
    }

    .z-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 40pt;
      margin-bottom: 35pt;
      align-items: center;
    }

    .z-section.reverse {
      direction: rtl;
    }

    .z-section.reverse > * {
      direction: ltr;
    }

    .z-image-box {
      width: 100%;
      height: 220pt;
      border-radius: 12pt;
      background: linear-gradient(135deg, var(--color-nordshore) 0%, var(--color-sky) 100%);
      box-shadow: 0 8pt 20pt rgba(0,57,63,0.2);
    }

    .z-text {
      padding: 15pt;
    }

    .z-heading {
      font-family: var(--font-headline);
      font-weight: 600;
      font-size: 26pt;
      color: var(--color-nordshore);
      margin-bottom: 14pt;
    }

    .z-description {
      font-size: 11pt;
      line-height: 1.7;
      color: #333;
    }

    .cta-centered {
      text-align: center;
      margin-top: 50pt;
      padding: 40pt;
      background: linear-gradient(135deg, var(--color-nordshore) 0%, #00565F 100%);
      border-radius: 12pt;
      color: white;
    }

    .cta-title {
      font-family: var(--font-headline);
      font-weight: 700;
      font-size: 36pt;
      color: var(--color-sand);
      margin-bottom: 20pt;
    }

    .cta-button {
      display: inline-block;
      font-weight: 600;
      font-size: 16pt;
      background: var(--color-gold);
      color: white;
      padding: 16pt 48pt;
      border-radius: 8pt;
      text-decoration: none;
      margin-bottom: 25pt;
    }

    /* ============================================================
       PAGE 8: CONCENTRIC CIRCLES RADIAL DESIGN
       ============================================================ */
    .page-8 {
      background: var(--color-nordshore);
      position: relative;
      overflow: hidden;
    }

    .bg-circle {
      position: absolute;
      border-radius: 50%;
      border: 2pt solid rgba(201,228,236,0.1);
    }

    .circle-1 {
      width: 400pt;
      height: 400pt;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .circle-2 {
      width: 600pt;
      height: 600pt;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .circle-3 {
      width: 800pt;
      height: 800pt;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .center-hub {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 10;
    }

    .logo-stack {
      margin-bottom: 35pt;
    }

    .logo-teei-center {
      width: 200pt;
      margin-bottom: 20pt;
    }

    .logo-ukraine-center {
      width: 180pt;
    }

    .contact-details {
      font-size: 11pt;
      color: var(--color-sky);
      line-height: 1.8;
      margin-bottom: 35pt;
    }

    .contact-details strong {
      color: var(--color-sand);
      font-weight: 600;
    }

    .partner-orbit {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 500pt;
      height: 500pt;
      transform: translate(-50%, -50%);
      z-index: 5;
    }

    .orbital-logo {
      position: absolute;
      width: 80pt;
      height: 60pt;
      background: white;
      border-radius: 8pt;
      padding: 10pt;
      box-shadow: 0 4pt 16pt rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .orbital-logo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .logo-pos-1 {
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    .logo-pos-2 {
      top: 50%;
      right: 0;
      transform: translateY(-50%);
    }

    .logo-pos-3 {
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    .logo-pos-4 {
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }

    .tagline-bottom {
      position: absolute;
      bottom: 40pt;
      left: 50%;
      transform: translateX(-50%);
      font-family: var(--font-headline);
      font-style: italic;
      font-size: 14pt;
      color: var(--color-sand);
      text-align: center;
      z-index: 10;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>

  <!-- PAGE 1: FULL-BLEED HERO -->
  <div class="page page-1">
    <div class="hero-background"></div>
    <div class="hero-overlay"></div>
    <div class="logo-top-left">
      ${teeiLogoWhite ? `<img src="${teeiLogoWhite}" alt="TEEI">` : ''}
    </div>
    <div class="cover-content">
      <h1 class="cover-title">Together for Ukraine</h1>
      <p class="cover-subtitle">Empowering displaced Ukrainians through education, employment, and community support</p>
      <div class="ukraine-logo-cover">
        ${togetherUkraineLogo ? `<img src="${togetherUkraineLogo}" alt="Together for Ukraine">` : ''}
      </div>
    </div>
  </div>

  <!-- PAGE 2: DIAGONAL SPLIT -->
  <div class="page page-2">
    <div class="diagonal-image-section"></div>
    <div class="diagonal-content-area">
      ${teeiLogoDark ? `<img src="${teeiLogoDark}" alt="TEEI" class="teei-logo-small">` : ''}
      <h2 class="section-title">About Us</h2>
      <p class="about-text">Together for Ukraine is a comprehensive initiative by The Educational Equality Institute, dedicated to supporting displaced Ukrainians in rebuilding their lives through education, employment, and community integration.</p>
      <div class="mission-box">
        <h3>Our Mission</h3>
        <p>We empower displaced Ukrainians by providing educational opportunities, professional development, and essential support services to help them thrive in their new communities.</p>
      </div>
    </div>
    <div class="stats-floating">
      <div class="stat-item">
        <span class="stat-number">15+</span>
        <span class="stat-label">Programs</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">1000+</span>
        <span class="stat-label">Families</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">9</span>
        <span class="stat-label">Partners</span>
      </div>
    </div>
  </div>

  <!-- PAGE 3: CIRCULAR FRAMES + CARDS -->
  <div class="page page-3">
    <div class="page-3-grid">
      <div class="circles-column">
        <div class="circular-frame">Language Learning</div>
        <div class="circular-frame">Academic Support</div>
        <div class="circular-frame">Professional Development</div>
      </div>
      <div class="cards-column">
        <div class="program-card">
          <h3 class="card-title">Language Learning</h3>
          <p class="card-text">Comprehensive language courses helping displaced Ukrainians communicate effectively and integrate into their new communities.</p>
        </div>
        <div class="program-card">
          <h3 class="card-title">Academic Support</h3>
          <p class="card-text">Tutoring and educational assistance for students of all ages, ensuring continuity in their academic journey despite displacement.</p>
        </div>
        <div class="program-card">
          <h3 class="card-title">Professional Development</h3>
          <p class="card-text">Career training, resume workshops, and job placement assistance to help professionals re-establish their careers.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- PAGE 4: ASYMMETRIC TEXT WRAP -->
  <div class="page page-4">
    <h2 class="section-title">Employment & Support Programs</h2>
    <div class="floating-image-large"></div>
    <div class="wrap-content">
      <p style="margin-bottom: 15pt;">Our employment programs provide comprehensive support for displaced Ukrainians seeking to rebuild their professional lives. From job placement assistance to entrepreneurship training, we offer pathways to economic stability and independence.</p>
      <p style="margin-bottom: 15pt;">We partner with leading companies to create employment opportunities, provide interview preparation, and offer ongoing career counseling. Our entrepreneurship training supports those who want to start their own businesses.</p>
      <p style="margin-bottom: 15pt;">Mental health support and community integration programs help individuals and families cope with trauma while maintaining their cultural identity. Veterans receive specialized support including career transition assistance.</p>
    </div>
    <div class="pullquote-box">
      <p class="pullquote-text">"This program gave me hope and helped me restart my career in a new country."</p>
      <p class="pullquote-author">— Olena, Program Participant</p>
    </div>
  </div>

  <!-- PAGE 5: STAGGERED 3-COLUMN -->
  <div class="page page-5">
    <h2 class="page-title-centered">Youth Programs</h2>
    <div class="three-column-stagger">
      <div class="column-1">
        <div class="youth-card">
          <div class="card-image-placeholder"></div>
          <div class="youth-icon"></div>
          <div class="youth-card-content">
            <h3 class="youth-card-title">Afterschool Programs</h3>
            <p class="youth-card-text">Safe and engaging activities providing academic support and social connection.</p>
          </div>
        </div>
        <div class="youth-card accent">
          <div class="card-image-placeholder"></div>
          <div class="youth-icon"></div>
          <div class="youth-card-content">
            <h3 class="youth-card-title">Arts & Culture</h3>
            <p class="youth-card-text">Celebrating Ukrainian traditions while helping youth express themselves creatively.</p>
          </div>
        </div>
      </div>
      <div class="column-2">
        <div class="youth-card accent">
          <div class="card-image-placeholder"></div>
          <div class="youth-icon"></div>
          <div class="youth-card-content">
            <h3 class="youth-card-title">Summer Camps</h3>
            <p class="youth-card-text">Educational and recreational camps combining learning and fun.</p>
          </div>
        </div>
        <div class="youth-card">
          <div class="card-image-placeholder"></div>
          <div class="youth-icon"></div>
          <div class="youth-card-content">
            <h3 class="youth-card-title">Sports & Recreation</h3>
            <p class="youth-card-text">Physical activities promoting health and teamwork among displaced youth.</p>
          </div>
        </div>
      </div>
      <div class="column-3">
        <div class="youth-card">
          <div class="card-image-placeholder"></div>
          <div class="youth-icon"></div>
          <div class="youth-card-content">
            <h3 class="youth-card-title">Mentorship Programs</h3>
            <p class="youth-card-text">Connecting young Ukrainians with caring mentors for guidance and support.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- PAGE 6: BANNER + ASYMMETRIC SPLIT -->
  <div class="page page-6">
    <div class="banner-full">
      <div class="banner-overlay-text">
        <h2 class="banner-title">Additional Support</h2>
        <p class="banner-subtitle">Comprehensive services for every need</p>
      </div>
    </div>
    <div class="split-content">
      <div class="testimonial-panel">
        <div class="testimonial-circle"></div>
        <p class="testimonial-quote">"The university support program helped my daughter continue her education. We are forever grateful."</p>
        <p class="testimonial-name">— Viktor & Maria</p>
      </div>
      <div class="mini-grid">
        <div class="mini-card">
          <p class="mini-card-title">University Support</p>
          <p class="mini-card-stat">500+</p>
        </div>
        <div class="mini-card">
          <p class="mini-card-title">Books Provided</p>
          <p class="mini-card-stat">2000+</p>
        </div>
        <div class="mini-card">
          <p class="mini-card-title">NGO Partners</p>
          <p class="mini-card-stat">15+</p>
        </div>
        <div class="mini-card">
          <p class="mini-card-title">Legal Assistance</p>
          <p class="mini-card-stat">300+</p>
        </div>
      </div>
    </div>
  </div>

  <!-- PAGE 7: Z-PATTERN ALTERNATING -->
  <div class="page page-7">
    <h2 class="section-title">Support Together for Ukraine</h2>
    <div class="z-section">
      <div class="z-image-box"></div>
      <div class="z-text">
        <h3 class="z-heading">Corporate Partnerships</h3>
        <p class="z-description">Partner with us to provide employment opportunities, internships, and professional development programs for displaced Ukrainians.</p>
      </div>
    </div>
    <div class="z-section reverse">
      <div class="z-image-box"></div>
      <div class="z-text">
        <h3 class="z-heading">Educational Partnerships</h3>
        <p class="z-description">Schools and universities can provide scholarships, course access, and educational resources to help Ukrainian students continue their education.</p>
      </div>
    </div>
    <div class="cta-centered">
      <h3 class="cta-title">Ready to Make a Difference?</h3>
      <a href="mailto:info@theeducationalequalityinstitute.org" class="cta-button">Get in Touch</a>
      <p style="color: var(--color-sky); font-size: 11pt;">Join our mission to empower displaced Ukrainians</p>
    </div>
  </div>

  <!-- PAGE 8: CONCENTRIC CIRCLES -->
  <div class="page page-8">
    <div class="bg-circle circle-1"></div>
    <div class="bg-circle circle-2"></div>
    <div class="bg-circle circle-3"></div>

    <div class="center-hub">
      <div class="logo-stack">
        ${teeiLogoWhite ? `<img src="${teeiLogoWhite}" alt="TEEI" class="logo-teei-center">` : ''}
        ${togetherUkraineLogo ? `<img src="${togetherUkraineLogo}" alt="Together for Ukraine" class="logo-ukraine-center">` : ''}
      </div>
      <div class="contact-details">
        <strong>Email:</strong> info@theeducationalequalityinstitute.org<br>
        <strong>Website:</strong> www.theeducationalequalityinstitute.org
      </div>
    </div>

    <div class="partner-orbit">
      ${googleLogo ? `
      <div class="orbital-logo logo-pos-1">
        <img src="${googleLogo}" alt="Google">
      </div>` : ''}
      ${awsLogo ? `
      <div class="orbital-logo logo-pos-2">
        <img src="${awsLogo}" alt="AWS">
      </div>` : ''}
      ${cornellLogo ? `
      <div class="orbital-logo logo-pos-3">
        <img src="${cornellLogo}" alt="Cornell">
      </div>` : ''}
      ${oxfordLogo ? `
      <div class="orbital-logo logo-pos-4">
        <img src="${oxfordLogo}" alt="Oxford">
      </div>` : ''}
    </div>

    <p class="tagline-bottom">Empowering displaced Ukrainians to rebuild their lives with dignity and hope</p>
  </div>

</body>
</html>
  `;

  const htmlPath = path.join(__dirname, 'exports', 'Together-for-Ukraine-WORLD-CLASS.html');
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✅ HTML saved: ${htmlPath}\n`);

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const pdfPath = path.join(__dirname, 'exports', 'Together-for-Ukraine-WORLD-CLASS.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log(`✅ PDF Generated: ${pdfPath}`);
  console.log(`📄 Pages: 8 unique layouts`);
  console.log(`📊 File size: ${(fs.statSync(pdfPath).size / 1024).toFixed(1)} KB\n`);

  console.log('🎨 Unique Layouts Per Page:');
  console.log('  Page 1: Full-bleed hero with bottom-third overlay');
  console.log('  Page 2: Diagonal split (45° angle)');
  console.log('  Page 3: Circular frames + content cards');
  console.log('  Page 4: Asymmetric text wrap with pullquote');
  console.log('  Page 5: Staggered 3-column grid');
  console.log('  Page 6: Full-width banner + asymmetric 40/60 split');
  console.log('  Page 7: Z-pattern alternating sections');
  console.log('  Page 8: Concentric circles radial design\n');

  await browser.close();

  const { spawn } = require('child_process');
  spawn('cmd', ['/c', 'start', '', pdfPath], { detached: true, stdio: 'ignore' }).unref();
  console.log('🚀 PDF opened automatically\n');

  console.log('================================================================================');
  console.log('WORLD-CLASS PDF COMPLETE!');
  console.log('Based on research of UNICEF, Red Cross, Save the Children designs');
  console.log('================================================================================');
})();
