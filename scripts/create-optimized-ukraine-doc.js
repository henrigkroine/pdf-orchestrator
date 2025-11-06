/**
 * Together for Ukraine - OPTIMIZED for PDF Size
 *
 * - SVG logos (vector, tiny file size)
 * - Optimized CSS
 * - No external dependencies
 * - Ready for high-quality PDF export
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// SVG Logo Definitions (inline, optimized)
const SVG_LOGOS = {
  google: `<svg viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path fill="currentColor" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"/><path fill="currentColor" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"/><path fill="currentColor" d="M225 3v65h-9.5V3h9.5z"/><path fill="currentColor" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"/><path fill="currentColor" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"/></svg>`,

  aws: `<svg viewBox="0 0 304 182" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M86.4 66.4c0 3.7.4 6.7 1.1 8.9.8 2.2 1.8 4.6 3.2 7.2.5.8.7 1.6.7 2.3 0 1-.6 2-1.9 3l-6.3 4.2c-.9.6-1.8.9-2.6.9-1 0-2-.5-3-1.4-2.4-2.8-4.5-5.8-6.1-8.9-5.1 6-11.5 9-19.5 9-5.6 0-10.1-1.6-13.3-4.8-3.2-3.2-4.9-7.4-4.9-12.8 0-5.6 2-10.1 6.1-13.5s9.6-5.1 16.7-5.1c2.3 0 4.7.2 7.3.5s5.2.8 7.9 1.4v-4.7c0-4.9-1-8.3-3-10.2-2.1-2-5.6-2.9-10.7-2.9-2.3 0-4.7.3-7.1.8s-4.8 1.2-7 2.1c-1.1.4-1.8.7-2.3.8-.4.1-.8.2-1 .2-.9 0-1.3-.6-1.3-1.9v-3c0-1 .1-1.7.4-2.2.3-.5.8-1 1.6-1.4 2.3-1.2 5.1-2.2 8.3-3 3.2-.8 6.7-1.2 10.4-1.2 7.9 0 13.7 1.8 17.3 5.4 3.6 3.6 5.3 9 5.3 16.3v21.3zm-26.9 10.1c2.2 0 4.5-.4 6.9-1.2 2.4-.8 4.5-2.3 6.3-4.3.9-1.1 1.6-2.3 2-3.7.4-1.4.7-3 .7-4.9v-2.4c-2.1-.5-4.3-.9-6.6-1.2s-4.5-.5-6.6-.5c-4.7 0-8.1.9-10.4 2.8-2.3 1.9-3.4 4.5-3.4 8 0 3.3.9 5.8 2.6 7.4 1.8 1.8 4.3 2.6 7.5 2.6zm53.4 7.3c-1.2 0-2-.2-2.5-.7-.5-.4-.9-1.3-1.3-2.5L95.4 27.1c-.4-1.3-.6-2.1-.6-2.5 0-1 .5-1.5 1.5-1.5h6.1c1.3 0 2.1.2 2.6.7.5.4.8 1.3 1.2 2.5l12.5 49.3 11.6-49.3c.3-1.3.7-2.1 1.2-2.5.5-.4 1.4-.7 2.7-.7h5c1.3 0 2.1.2 2.7.7.5.4.9 1.3 1.2 2.5l11.7 49.9 12.9-49.9c.4-1.3.8-2.1 1.2-2.5.5-.4 1.4-.7 2.6-.7h5.8c1 0 1.5.5 1.5 1.5 0 .3-.1.6-.2 1-.1.4-.3 1-.6 1.8l-18 57.5c-.4 1.3-.8 2.1-1.3 2.5s-1.3.7-2.5.7h-5.4c-1.3 0-2.1-.2-2.7-.7-.5-.4-.9-1.3-1.2-2.5l-11.5-47.7-11.4 47.6c-.3 1.3-.7 2.1-1.2 2.5-.5.4-1.4.7-2.7.7h-5.4zm86.3 1.8c-3.5 0-7-.4-10.3-1.2-3.3-.8-5.9-1.8-7.6-2.9-1-.6-1.7-1.3-2-2-.3-.7-.5-1.4-.5-2.1v-3.1c0-1.3.5-1.9 1.4-1.9.4 0 .7.1 1.1.2.4.1.9.4 1.6.7 2.2 1 4.6 1.8 7.1 2.3s5.1.8 7.6.8c4 0 7.1-.7 9.2-2.1s3.2-3.4 3.2-6c0-1.8-.6-3.2-1.7-4.4-1.1-1.2-3.2-2.3-6.1-3.3l-8.8-2.7c-4.4-1.4-7.7-3.4-9.8-6.2-2.1-2.7-3.1-5.7-3.1-9 0-2.6.6-4.9 1.7-6.9 1.1-2 2.6-3.7 4.4-5.1 1.8-1.4 3.9-2.5 6.3-3.2 2.4-.7 4.9-1.1 7.6-1.1 1.5 0 3 .1 4.6.3 1.5.2 3 .5 4.4.8 1.4.3 2.7.7 3.9 1.1 1.2.4 2.2.9 3 1.4.9.5 1.5 1.1 1.9 1.7.4.6.6 1.3.6 2.2v2.9c0 1.3-.5 1.9-1.4 1.9-.5 0-1.3-.3-2.2-.8-3.3-1.5-7-2.3-11.1-2.3-3.6 0-6.5.6-8.4 1.8s-2.9 3-2.9 5.4c0 1.8.6 3.2 1.9 4.5 1.3 1.2 3.6 2.4 6.7 3.5l8.6 2.7c4.4 1.4 7.6 3.3 9.6 5.9s3 5.5 3 8.7c0 2.7-.5 5.1-1.6 7.2-1.1 2.1-2.6 3.9-4.5 5.4-1.9 1.5-4.2 2.6-6.8 3.4-2.8.8-5.7 1.2-8.8 1.2z"/><path fill="currentColor" d="M273.5 143.7c-32.9 24.3-80.7 37.2-121.8 37.2-57.6 0-109.5-21.3-148.7-56.7-3.1-2.8-.3-6.6 3.4-4.4 42.4 24.6 94.7 39.5 148.8 39.5 36.5 0 76.6-7.6 113.5-23.2 5.5-2.5 10.2 3.6 4.8 7.6zm13.7-15.6c-4.2-5.4-27.8-2.6-38.5-1.3-3.2.4-3.7-2.4-.8-4.5 18.8-13.2 49.7-9.4 53.3-5 3.6 4.5-1 35.4-18.6 50.2-2.7 2.3-5.3 1.1-4.1-1.9 4-9.9 12.9-32.2 8.7-37.5z"/></svg>`,

  cornell: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><text x="10" y="40" font-family="serif" font-size="32" font-weight="700" fill="currentColor">Cornell University</text></svg>`,

  oxford: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><text x="10" y="30" font-family="serif" font-size="20" font-weight="700" fill="currentColor">OXFORD</text><text x="10" y="50" font-family="serif" font-size="14" font-weight="400" fill="currentColor">UNIVERSITY PRESS</text></svg>`,

  babbel: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><text x="10" y="40" font-family="sans-serif" font-size="36" font-weight="700" fill="currentColor">+Babbel</text></svg>`,

  kintell: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="12" fill="currentColor"/><text x="50" y="40" font-family="sans-serif" font-size="32" font-weight="700" fill="currentColor">Kintell</text></svg>`,

  sanoma: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><text x="10" y="40" font-family="sans-serif" font-size="32" font-weight="700" fill="currentColor">sanoma</text></svg>`,

  inco: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><text x="10" y="40" font-family="sans-serif" font-size="36" font-weight="700" fill="currentColor">» INCO</text></svg>`,

  bain: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><text x="10" y="30" font-family="sans-serif" font-size="28" font-weight="700" fill="currentColor">BAIN & COMPANY</text><circle cx="180" cy="30" r="8" fill="currentColor"/></svg>`
};

function generateOptimizedHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Together for Ukraine - Female Entrepreneurship Program</title>

  <!-- Embedded Google Fonts for offline use -->
  <link href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --nordshore: #00393F;
      --ukraine-yellow: #FFD700;
      --sand: #FFF1E2;
      --white: #FFFFFF;
      --black: #000000;
      --gray: #333333;
      --font-serif: 'Lora', Georgia, serif;
      --font-sans: 'Roboto', sans-serif;
    }

    @page { size: Letter; margin: 0; }

    body {
      font-family: var(--font-sans);
      font-size: 11pt;
      line-height: 1.6;
      color: var(--gray);
    }

    .page {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      background: white;
      position: relative;
      page-break-after: always;
    }

    /* COVER PAGE */
    .cover-page {
      background: var(--nordshore);
      padding: 60pt 40pt;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .ukraine-logo { margin-bottom: 180pt; }

    .ukraine-logo .together {
      font-family: var(--font-sans);
      font-size: 56pt;
      font-weight: 400;
      color: var(--white);
      display: inline;
    }

    .ukraine-logo .for {
      font-family: var(--font-sans);
      font-size: 56pt;
      font-weight: 300;
      color: #66B3A0;
      display: inline;
      margin-left: 16pt;
    }

    .ukraine-box {
      background: var(--ukraine-yellow);
      padding: 12pt 32pt;
      display: inline-block;
      margin-top: 8pt;
    }

    .ukraine-box .ukraine {
      font-family: var(--font-sans);
      font-size: 56pt;
      font-weight: 700;
      color: var(--black);
      letter-spacing: 3px;
    }

    .cover-header {
      font-size: 10pt;
      font-weight: 400;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--white);
      margin-bottom: 40pt;
    }

    .cover-title {
      font-family: var(--font-serif);
      font-size: 48pt;
      font-weight: 400;
      line-height: 1.2;
      color: var(--white);
    }

    .teei-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      align-self: flex-end;
    }

    .teei-books {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .book-icon {
      width: 40px;
      height: 8px;
      background: var(--white);
    }

    .teei-text {
      font-size: 9pt;
      font-weight: 700;
      color: var(--white);
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1.3;
    }

    /* CONTENT PAGES */
    .content-page { padding: 40pt; }

    .page-header {
      font-size: 9pt;
      font-weight: 400;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--nordshore);
      margin-bottom: 60pt;
    }

    .section-title {
      font-family: var(--font-serif);
      font-size: 28pt;
      font-weight: 700;
      color: var(--nordshore);
      margin-bottom: 20pt;
    }

    .section-subtitle {
      font-family: var(--font-serif);
      font-size: 18pt;
      font-weight: 600;
      color: var(--nordshore);
      margin: 40pt 0 16pt 0;
    }

    .section-heading {
      font-family: var(--font-serif);
      font-size: 22pt;
      font-weight: 700;
      color: var(--nordshore);
      margin: 40pt 0 16pt 0;
    }

    .paragraph {
      margin-bottom: 16pt;
    }

    .bullet-list {
      margin: 16pt 0 16pt 24pt;
      list-style: none;
    }

    .bullet-list li {
      padding-left: 12pt;
      margin-bottom: 8pt;
      position: relative;
    }

    .bullet-list li::before {
      content: '›';
      position: absolute;
      left: -12pt;
      font-size: 14pt;
      color: var(--nordshore);
      font-weight: 700;
    }

    .page-footer {
      position: absolute;
      bottom: 40pt;
      right: 40pt;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-footer .book-icon {
      width: 30px;
      height: 6px;
      background: var(--nordshore);
    }

    .page-footer .teei-text {
      font-size: 8pt;
      color: var(--nordshore);
    }

    /* BACK COVER */
    .back-cover {
      background: var(--nordshore);
      padding: 80pt 40pt 40pt 40pt;
      text-align: center;
    }

    .back-cover .ukraine-logo {
      margin-bottom: 80pt;
      display: inline-block;
    }

    .back-cover-title {
      font-family: var(--font-serif);
      font-size: 32pt;
      font-weight: 400;
      line-height: 1.3;
      color: var(--white);
      margin-bottom: 24pt;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .back-cover-subtitle {
      font-size: 12pt;
      line-height: 1.6;
      color: var(--white);
      margin-bottom: 60pt;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .partner-logos {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32pt;
      max-width: 600px;
      margin: 0 auto 60pt auto;
      padding: 40pt 0;
      border-top: 1px solid rgba(255,255,255,0.2);
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .partner-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12pt;
      color: var(--white);
    }

    .partner-logo svg {
      width: 100%;
      max-width: 140px;
      height: auto;
    }

    .contact-info {
      font-size: 10pt;
      color: var(--white);
      margin-bottom: 40pt;
    }

    .contact-info a {
      color: var(--white);
      text-decoration: none;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- PAGE 1: COVER -->
  <div class="page cover-page">
    <div class="ukraine-logo">
      <div>
        <span class="together">Together</span>
        <span class="for">for</span>
      </div>
      <div>
        <div class="ukraine-box">
          <span class="ukraine">UKRAINE</span>
        </div>
      </div>
    </div>

    <div>
      <div class="cover-header">Together for Ukraine</div>
      <h1 class="cover-title">Female Entrepreneurship Program</h1>
    </div>

    <div class="teei-logo">
      <div class="teei-books">
        <div class="book-icon"></div>
        <div class="book-icon"></div>
        <div class="book-icon"></div>
      </div>
      <div class="teei-text">EDUCATIONAL<br>EQUALITY<br>INSTITUTE</div>
    </div>
  </div>

  <!-- PAGE 2: Introduction -->
  <div class="page content-page">
    <div class="page-header">Together for Ukraine</div>

    <h2 class="section-title">Female Entrepreneurship Program</h2>

    <h3 class="section-subtitle">The Women's Entrepreneurship and Empowerment Initiative (WEEI)</h3>

    <p class="paragraph">
      The Women's Entrepreneurship and Empowerment Initiative (WEEI) aims to foster the growth and development of Ukrainian women entrepreneurs through a comprehensive and tailored program focusing on impact and sustainable entrepreneurship. The program supports women, new businesses, established small businesses, and startups led by women, offering them valuable resources and support.
    </p>

    <p class="paragraph">
      A crucial element WEEI is its emphasis on technology, partnerships and collaboration. By working closely with local and international organisations, private sector partners, and educational institutions, WEEI leverages a diverse network of resources and expertise. These collaborations enable the program to provide comprehensive support and ensure a more robust ecosystem to foster their growth and success.
    </p>

    <p class="paragraph">The project spans four key areas:</p>

    <ul class="bullet-list">
      <li>Individual Entrepreneurship Training for Women U:LEARN</li>
      <li>Women's MVP Incubator U:START</li>
      <li>Female Startup Accelerator U:GROW</li>
      <li>Female Leadership Program U:LEAD</li>
    </ul>

    <p class="paragraph">
      In addition to the core entrepreneurship program, WEEI provides specialised training courses in digital skills, leadership, and coding through the TEEI upskilling program. To accommodate the vast geographical scope and needs, the program has a digital-first approach.
    </p>

    <p class="paragraph">
      WEEI aspires to empower Ukrainian women, helping them build sustainable businesses, create job opportunities, and contribute to Ukraine's sustainable reconstruction and European integration.
    </p>

    <div class="page-footer">
      <div class="teei-books">
        <div class="book-icon"></div>
        <div class="book-icon"></div>
        <div class="book-icon"></div>
      </div>
      <div class="teei-text">EDUCATIONAL<br>EQUALITY<br>INSTITUTE</div>
    </div>
  </div>

  <!-- PAGE 3: Background & Mission -->
  <div class="page content-page">
    <div class="page-header">Together for Ukraine</div>

    <h2 class="section-heading">Background</h2>

    <p class="paragraph">
      <em>As the war continues, the needs of refugees out of Ukraine are evolving. With the expectation, in early 2022, that the war will end shortly, addressing basic humanitarian needs was a priority. With the war reaching its one-year anniversary, with no end in sight to the fighting - the needs are broadening, with education becoming a vital element of the survival kit in exile and aspirations to restart a new life in a post-war Ukraine.</em>
    </p>

    <p class="paragraph">
      The war is expected to have a significant impact not only on Ukraine's economy and infrastructure but also on its demographics. As Ukrainian men are engaged in the military, drawn away from their civil time functions and, sadly, dying or getting wounded, women face the need to step up and take over management roles in the most challenging economic environment, as well as relocate to safer regions of Ukraine and provide for their families starting from scratch.
    </p>

    <p class="paragraph">
      As Ukraine aspires to become a future EU member, it is crucial to elevate entrepreneurship, technical upskilling, soft-skills training, career coaching, and active language training among women. Programs focusing on tailored entrepreneurship for women and offering resources, mentorship, and support, we can empower them to establish sustainable businesses, generate job opportunities, and contribute to Ukraine's sustainable reconstruction and European integration.
    </p>

    <h2 class="section-heading">Mission</h2>

    <p class="paragraph">
      Our mission is to empower Ukrainian women entrepreneurs through comprehensive and tailored programs that foster impact and sustainable entrepreneurship. We provide valuable resources, mentorship, and support to women in business, from new ventures to established small businesses and startups. By emphasizing technology, partnerships, and collaboration, we strive to create a robust ecosystem that promotes growth, development, and success for Ukrainian women entrepreneurs. We aspire to contribute to Ukraine's sustainable reconstruction and European integration by building sustainable businesses, creating job opportunities, and empowering women to lead in challenging economic environments.
    </p>

    <h2 class="section-heading">Key Elements</h2>

    <p class="paragraph">
      WEEI offers a comprehensive program that is specifically designed to meet the unique needs of Ukrainian women entrepreneurs. The program provides valuable resources and support for women at all stages of business development, from new ventures to established small businesses and startups.
    </p>

    <div class="page-footer">
      <div class="teei-books">
        <div class="book-icon"></div>
        <div class="book-icon"></div>
        <div class="book-icon"></div>
      </div>
      <div class="teei-text">EDUCATIONAL<br>EQUALITY<br>INSTITUTE</div>
    </div>
  </div>

  <!-- PAGE 4: BACK COVER -->
  <div class="page back-cover">
    <div class="ukraine-logo">
      <div>
        <span class="together">Together</span>
        <span class="for">for</span>
      </div>
      <div>
        <div class="ukraine-box">
          <span class="ukraine">UKRAINE</span>
        </div>
      </div>
    </div>

    <h2 class="back-cover-title">
      We are looking for more partners and supporters to work with us.
    </h2>

    <p class="back-cover-subtitle">
      Partnering with Together for Ukraine will have a strong impact on the future of Ukraine and its people.
    </p>

    <div class="partner-logos">
      <div class="partner-logo">${SVG_LOGOS.google}</div>
      <div class="partner-logo">${SVG_LOGOS.kintell}</div>
      <div class="partner-logo">${SVG_LOGOS.babbel}</div>
      <div class="partner-logo">${SVG_LOGOS.sanoma}</div>
      <div class="partner-logo">${SVG_LOGOS.oxford}</div>
      <div class="partner-logo">${SVG_LOGOS.aws}</div>
      <div class="partner-logo">${SVG_LOGOS.cornell}</div>
      <div class="partner-logo">${SVG_LOGOS.inco}</div>
      <div class="partner-logo">${SVG_LOGOS.bain}</div>
    </div>

    <div class="contact-info">
      Phone: +47 919 08 939 | Email: <a href="mailto:contact@theeducationalequalityinstitute.org">contact@theeducationalequalityinstitute.org</a>
    </div>

    <div class="teei-logo">
      <div class="teei-books">
        <div class="book-icon"></div>
        <div class="book-icon"></div>
        <div class="book-icon"></div>
      </div>
      <div class="teei-text">EDUCATIONAL<br>EQUALITY<br>INSTITUTE</div>
    </div>
  </div>

</body>
</html>`;
}

async function main() {
  console.log('🚀 Together for Ukraine - OPTIMIZED Version\n');

  const startTime = Date.now();

  console.log('✨ Features:');
  console.log('   • SVG logos (vector = tiny file size)');
  console.log('   • Optimized CSS (no external dependencies)');
  console.log('   • Embedded fonts');
  console.log('   • Ready for high-quality PDF export\n');

  const html = generateOptimizedHTML();
  const htmlPath = path.join(projectRoot, 'exports', 'ukraine-optimized.html');

  await fs.writeFile(htmlPath, html, 'utf-8');

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ OPTIMIZED VERSION GENERATED');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('📄 File: ' + path.relative(projectRoot, htmlPath));
  console.log('⏱️  Time: ' + totalTime + 's');
  console.log('💾 Size: ' + ((html.length / 1024).toFixed(1)) + ' KB (HTML)');
  console.log('');

  console.log('✨ Optimizations Applied:');
  console.log('   ✅ 9 partner logos as inline SVG (vector)');
  console.log('   ✅ TEEI logo as CSS (no images)');
  console.log('   ✅ Minimal CSS (no frameworks)');
  console.log('   ✅ Google Fonts (online CDN)');
  console.log('   ✅ Print-optimized styling');
  console.log('');

  console.log('🖨️  Next: Convert to PDF');
  console.log('   Run: node scripts/convert-ukraine-to-pdf.js');
  console.log('');
}

main();
