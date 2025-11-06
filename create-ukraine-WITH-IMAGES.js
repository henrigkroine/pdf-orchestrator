#!/usr/bin/env node
/**
 * Together for Ukraine - COMPLETE 8-PAGE PDF WITH IMAGES
 * Recreates the official Together for Ukraine brochure with visual elements
 * Uses real partner logos + TEEI brand-colored image placeholders
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
  console.log('TOGETHER FOR UKRAINE - COMPLETE 8-PAGE PDF WITH IMAGES');
  console.log('Full recreation with real partner logos + visual elements');
  console.log('================================================================================\n');

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // TEEI logos
  const teeiLogoWhite = getImageBase64('T:/TEEI/Logos/TEEI logo webpage white.png');
  const teeiLogoDark = getImageBase64('T:/TEEI/Logos/TEEI logo dark.png');
  const togetherUkraineLogo = getImageBase64('T:/TEEI/Logos/Together for Ukraine_Logo_white.png');

  // Partner logos (real SVGs)
  const googleLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/google.svg');
  const awsLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/aws.svg');
  const cornellLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/cornell.svg');
  const oxfordLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/oxford.svg');

  // TEEI Brand Colors
  const COLORS = {
    nordshore: '#00393F',
    sky: '#C9E4EC',
    sand: '#FFF1E2',
    beige: '#EFE1DC',
    moss: '#65873B',
    gold: '#BA8F5A',
    clay: '#913B2F',
    white: '#FFFFFF'
  };

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Together for Ukraine - Complete Brochure</title>
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

    body {
      font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }

    .page {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }

    /* Page 1: Cover with Hero Image */
    .page-1 {
      background: linear-gradient(135deg, ${COLORS.nordshore} 0%, ${COLORS.sky} 100%);
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .hero-image {
      width: 100%;
      height: 60%;
      background: linear-gradient(
        135deg,
        ${COLORS.nordshore} 0%,
        ${COLORS.moss} 30%,
        ${COLORS.sky} 60%,
        ${COLORS.gold} 100%
      );
      position: relative;
      overflow: hidden;
    }

    .hero-image::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image:
        radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
    }

    .hero-overlay {
      position: absolute;
      top: 40px;
      left: 40px;
      right: 40px;
      z-index: 2;
    }

    .hero-overlay img {
      height: 60px;
      width: auto;
    }

    .cover-content {
      flex: 1;
      background: ${COLORS.nordshore};
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .cover-content::before {
      content: '';
      position: absolute;
      top: -40px;
      left: 0;
      width: 100%;
      height: 80px;
      background: linear-gradient(to bottom, transparent, ${COLORS.nordshore});
    }

    .cover-title {
      font-size: 48px;
      font-weight: 700;
      color: ${COLORS.white};
      margin-bottom: 20px;
      line-height: 1.2;
    }

    .cover-subtitle {
      font-size: 20px;
      color: ${COLORS.sky};
      line-height: 1.5;
    }

    .ukraine-logo-cover {
      margin-top: 40px;
    }

    .ukraine-logo-cover img {
      height: 50px;
      width: auto;
    }

    /* Page 2: About Us with Image */
    .page-2 {
      display: flex;
    }

    .about-image {
      width: 40%;
      background: linear-gradient(
        135deg,
        ${COLORS.moss} 0%,
        ${COLORS.gold} 50%,
        ${COLORS.clay} 100%
      );
      position: relative;
    }

    .about-image::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
      border-radius: 50%;
    }

    .about-content {
      width: 60%;
      padding: 60px;
      background: ${COLORS.white};
    }

    .teei-logo {
      height: 40px;
      margin-bottom: 40px;
    }

    h1 {
      font-size: 36px;
      color: ${COLORS.nordshore};
      margin-bottom: 30px;
      font-weight: 700;
    }

    .mission-box {
      background: ${COLORS.sand};
      border-left: 4px solid ${COLORS.gold};
      padding: 30px;
      margin: 30px 0;
    }

    .mission-box h2 {
      font-size: 20px;
      color: ${COLORS.nordshore};
      margin-bottom: 15px;
    }

    .mission-box p {
      font-size: 14px;
      line-height: 1.8;
      color: #333;
    }

    .goals-section {
      margin-top: 30px;
    }

    .goals-section h2 {
      font-size: 24px;
      color: ${COLORS.nordshore};
      margin-bottom: 20px;
    }

    .goal-item {
      display: flex;
      align-items: start;
      margin-bottom: 15px;
    }

    .goal-number {
      width: 30px;
      height: 30px;
      background: ${COLORS.gold};
      color: ${COLORS.white};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin-right: 15px;
      flex-shrink: 0;
    }

    .goal-text {
      font-size: 14px;
      line-height: 1.6;
      padding-top: 3px;
    }

    /* Pages 3-6: Programs with Images */
    .program-page {
      display: flex;
    }

    .program-image {
      width: 35%;
      background: linear-gradient(
        180deg,
        ${COLORS.nordshore} 0%,
        ${COLORS.sky} 100%
      );
      position: relative;
    }

    .program-image::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 50%;
      background: linear-gradient(to top, rgba(0, 57, 63, 0.6), transparent);
    }

    .program-content {
      width: 65%;
      padding: 60px 60px 60px 40px;
      background: ${COLORS.white};
    }

    .section-title {
      font-size: 32px;
      color: ${COLORS.nordshore};
      margin-bottom: 30px;
      font-weight: 700;
    }

    .program-card {
      background: ${COLORS.sand};
      padding: 25px;
      margin-bottom: 20px;
      border-left: 4px solid ${COLORS.gold};
    }

    .program-card h3 {
      font-size: 18px;
      color: ${COLORS.nordshore};
      margin-bottom: 10px;
    }

    .program-card p {
      font-size: 13px;
      line-height: 1.6;
      color: #333;
    }

    /* Page 7: Support Page with Split Image */
    .page-7 {
      display: flex;
    }

    .support-image {
      width: 40%;
      background: linear-gradient(
        45deg,
        ${COLORS.clay} 0%,
        ${COLORS.gold} 50%,
        ${COLORS.moss} 100%
      );
      position: relative;
    }

    .support-image::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image:
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(255, 255, 255, 0.05) 10px,
          rgba(255, 255, 255, 0.05) 20px
        );
    }

    .support-content {
      width: 60%;
      padding: 60px;
      background: ${COLORS.white};
    }

    .support-ways {
      margin-top: 30px;
    }

    .support-card {
      background: ${COLORS.beige};
      padding: 20px;
      margin-bottom: 15px;
      border-left: 4px solid ${COLORS.nordshore};
    }

    .support-card h3 {
      font-size: 16px;
      color: ${COLORS.nordshore};
      margin-bottom: 8px;
    }

    .support-card p {
      font-size: 13px;
      line-height: 1.6;
      color: #333;
    }

    /* Page 8: Back Cover with Partners */
    .page-8 {
      background: ${COLORS.nordshore};
      padding: 60px;
      color: ${COLORS.white};
      display: flex;
      flex-direction: column;
    }

    .back-header {
      margin-bottom: 40px;
    }

    .back-header img {
      height: 50px;
      margin-bottom: 20px;
    }

    .back-header h2 {
      font-size: 28px;
      color: ${COLORS.sky};
      margin-bottom: 20px;
    }

    .contact-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .contact-item {
      margin-bottom: 20px;
    }

    .contact-item h3 {
      font-size: 14px;
      color: ${COLORS.sky};
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .contact-item p {
      font-size: 16px;
      color: ${COLORS.white};
    }

    .partners-section {
      margin-top: 60px;
      padding-top: 40px;
      border-top: 2px solid ${COLORS.sky};
    }

    .partners-section h3 {
      font-size: 16px;
      color: ${COLORS.sky};
      margin-bottom: 30px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .partner-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }

    .partner-logo {
      background: ${COLORS.white};
      border-radius: 8px;
      padding: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
    }

    .partner-logo img {
      max-width: 100%;
      max-height: 50px;
      width: auto;
      height: auto;
    }

    .partner-logo.text-only {
      font-size: 14px;
      font-weight: 600;
      color: ${COLORS.nordshore};
      text-align: center;
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

  <!-- PAGE 1: COVER -->
  <div class="page page-1">
    <div class="hero-image">
      <div class="hero-overlay">
        ${teeiLogoWhite ? `<img src="${teeiLogoWhite}" alt="TEEI Logo">` : ''}
      </div>
    </div>
    <div class="cover-content">
      <h1 class="cover-title">Together for Ukraine</h1>
      <p class="cover-subtitle">Empowering displaced Ukrainians through education, employment, and community support</p>
      <div class="ukraine-logo-cover">
        ${togetherUkraineLogo ? `<img src="${togetherUkraineLogo}" alt="Together for Ukraine Logo">` : ''}
      </div>
    </div>
  </div>

  <!-- PAGE 2: ABOUT US -->
  <div class="page page-2">
    <div class="about-image"></div>
    <div class="about-content">
      ${teeiLogoDark ? `<img src="${teeiLogoDark}" alt="TEEI Logo" class="teei-logo">` : ''}
      <h1>About Us</h1>
      <p>Together for Ukraine is a comprehensive initiative by The Educational Equality Institute, dedicated to supporting displaced Ukrainians in rebuilding their lives through education, employment, and community integration.</p>

      <div class="mission-box">
        <h2>Our Mission</h2>
        <p>We empower displaced Ukrainians by providing educational opportunities, professional development, and essential support services to help them thrive in their new communities.</p>
      </div>

      <div class="goals-section">
        <h2>Our Goals</h2>
        <div class="goal-item">
          <div class="goal-number">1</div>
          <div class="goal-text">Provide access to quality education for all ages</div>
        </div>
        <div class="goal-item">
          <div class="goal-number">2</div>
          <div class="goal-text">Facilitate employment opportunities and career development</div>
        </div>
        <div class="goal-item">
          <div class="goal-number">3</div>
          <div class="goal-text">Support mental health and community integration</div>
        </div>
        <div class="goal-item">
          <div class="goal-number">4</div>
          <div class="goal-text">Preserve Ukrainian culture and language</div>
        </div>
      </div>
    </div>
  </div>

  <!-- PAGE 3: PROGRAMS PART 1 -->
  <div class="page program-page">
    <div class="program-image"></div>
    <div class="program-content">
      <h2 class="section-title">Our Programs</h2>

      <div class="program-card">
        <h3>Language Learning</h3>
        <p>Comprehensive language courses in host country languages, helping displaced Ukrainians communicate effectively and integrate into their new communities.</p>
      </div>

      <div class="program-card">
        <h3>Academic Support</h3>
        <p>Tutoring and educational assistance for students of all ages, ensuring continuity in their academic journey despite displacement.</p>
      </div>

      <div class="program-card">
        <h3>Professional Development</h3>
        <p>Career training, resume workshops, and job placement assistance to help professionals re-establish their careers in new locations.</p>
      </div>

      <div class="program-card">
        <h3>Digital Literacy</h3>
        <p>Technology training programs to enhance digital skills essential for modern workplace success and daily life.</p>
      </div>

      <div class="program-card">
        <h3>Certification Programs</h3>
        <p>Professional certification courses to help Ukrainians gain recognized qualifications in their new countries.</p>
      </div>
    </div>
  </div>

  <!-- PAGE 4: PROGRAMS PART 2 -->
  <div class="page program-page">
    <div class="program-image"></div>
    <div class="program-content">
      <h2 class="section-title">Employment & Support</h2>

      <div class="program-card">
        <h3>Employment Assistance</h3>
        <p>Connecting displaced Ukrainians with job opportunities, providing interview preparation, and offering ongoing career counseling.</p>
      </div>

      <div class="program-card">
        <h3>Entrepreneurship Training</h3>
        <p>Supporting Ukrainians who want to start their own businesses with training, mentorship, and resources.</p>
      </div>

      <div class="program-card">
        <h3>Mental Health Support</h3>
        <p>Counseling services and psychological support to help individuals and families cope with trauma and displacement.</p>
      </div>

      <div class="program-card">
        <h3>Community Integration</h3>
        <p>Programs designed to help Ukrainian families integrate into local communities while maintaining their cultural identity.</p>
      </div>

      <div class="program-card">
        <h3>Veterans Support</h3>
        <p>Specialized programs for Ukrainian veterans, including career transition assistance and trauma-informed support services.</p>
      </div>
    </div>
  </div>

  <!-- PAGE 5: YOUTH PROGRAMS -->
  <div class="page program-page">
    <div class="program-image"></div>
    <div class="program-content">
      <h2 class="section-title">Youth Programs</h2>

      <div class="program-card">
        <h3>Afterschool Programs</h3>
        <p>Safe and engaging afterschool activities that provide academic support, recreation, and social connection for Ukrainian youth.</p>
      </div>

      <div class="program-card">
        <h3>Summer Camps</h3>
        <p>Educational and recreational summer camps that combine learning, cultural activities, and fun in a supportive environment.</p>
      </div>

      <div class="program-card">
        <h3>Mentorship Programs</h3>
        <p>Connecting young Ukrainians with caring mentors who provide guidance, support, and positive role modeling.</p>
      </div>

      <div class="program-card">
        <h3>Arts & Culture</h3>
        <p>Programs celebrating Ukrainian arts, music, and cultural traditions while helping youth express themselves creatively.</p>
      </div>

      <div class="program-card">
        <h3>Sports & Recreation</h3>
        <p>Physical activities and team sports that promote health, teamwork, and social connections among displaced youth.</p>
      </div>
    </div>
  </div>

  <!-- PAGE 6: OTHER PROGRAMS -->
  <div class="page program-page">
    <div class="program-image"></div>
    <div class="program-content">
      <h2 class="section-title">Additional Support</h2>

      <div class="program-card">
        <h3>University Support</h3>
        <p>Helping Ukrainian students access higher education through application assistance, scholarship information, and academic advising.</p>
      </div>

      <div class="program-card">
        <h3>Books & Learning Materials</h3>
        <p>Providing textbooks, educational resources, and learning materials in both Ukrainian and host country languages.</p>
      </div>

      <div class="program-card">
        <h3>NGO Partnerships</h3>
        <p>Collaborating with local and international NGOs to maximize resources and expand support services for displaced Ukrainians.</p>
      </div>

      <div class="program-card">
        <h3>Legal Assistance</h3>
        <p>Connecting families with legal resources for immigration, documentation, and rights protection.</p>
      </div>

      <div class="program-card">
        <h3>Housing Support</h3>
        <p>Assisting displaced Ukrainians in finding safe, stable housing and navigating local housing systems.</p>
      </div>

      <div class="program-card">
        <h3>Healthcare Navigation</h3>
        <p>Helping families access healthcare services and understand medical systems in their new countries.</p>
      </div>
    </div>
  </div>

  <!-- PAGE 7: SUPPORT -->
  <div class="page page-7">
    <div class="support-image"></div>
    <div class="support-content">
      <h1>Support Together for Ukraine</h1>
      <p>Your partnership can make a meaningful difference in the lives of displaced Ukrainians. Join us in providing hope, opportunity, and support.</p>

      <div class="support-ways">
        <div class="support-card">
          <h3>Corporate Partnerships</h3>
          <p>Partner with us to provide employment opportunities, internships, and professional development programs for displaced Ukrainians.</p>
        </div>

        <div class="support-card">
          <h3>Educational Partnerships</h3>
          <p>Schools and universities can partner with us to provide scholarships, course access, and educational resources.</p>
        </div>

        <div class="support-card">
          <h3>Volunteer Opportunities</h3>
          <p>Share your skills and time by becoming a tutor, mentor, or program volunteer.</p>
        </div>

        <div class="support-card">
          <h3>In-Kind Donations</h3>
          <p>Contribute learning materials, technology, or other resources that directly support our programs.</p>
        </div>

        <div class="support-card">
          <h3>Financial Support</h3>
          <p>Make a tax-deductible donation to help us expand our programs and reach more families in need.</p>
        </div>

        <div class="support-card">
          <h3>Advocacy</h3>
          <p>Help raise awareness about the needs of displaced Ukrainians and advocate for supportive policies.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- PAGE 8: BACK COVER -->
  <div class="page page-8">
    <div class="back-header">
      ${togetherUkraineLogo ? `<img src="${togetherUkraineLogo}" alt="Together for Ukraine Logo">` : ''}
      <h2>Get in Touch</h2>
    </div>

    <div class="contact-info">
      <div class="contact-item">
        <h3>Email</h3>
        <p>info@theeducationalequalityinstitute.org</p>
      </div>

      <div class="contact-item">
        <h3>Website</h3>
        <p>www.theeducationalequalityinstitute.org</p>
      </div>

      <div class="contact-item">
        <h3>Address</h3>
        <p>The Educational Equality Institute<br>Nonprofit Organization</p>
      </div>
    </div>

    <div class="partners-section">
      <h3>Our Partners</h3>
      <div class="partner-grid">
        ${googleLogo ? `
        <div class="partner-logo">
          <img src="${googleLogo}" alt="Google">
        </div>` : '<div class="partner-logo text-only">Google</div>'}

        ${awsLogo ? `
        <div class="partner-logo">
          <img src="${awsLogo}" alt="AWS">
        </div>` : '<div class="partner-logo text-only">AWS</div>'}

        ${cornellLogo ? `
        <div class="partner-logo">
          <img src="${cornellLogo}" alt="Cornell">
        </div>` : '<div class="partner-logo text-only">Cornell</div>'}

        ${oxfordLogo ? `
        <div class="partner-logo">
          <img src="${oxfordLogo}" alt="Oxford">
        </div>` : '<div class="partner-logo text-only">Oxford</div>'}

        <div class="partner-logo text-only">Kintell</div>
        <div class="partner-logo text-only">Babbel</div>
        <div class="partner-logo text-only">Sanoma</div>
        <div class="partner-logo text-only">INCO</div>
        <div class="partner-logo text-only">Bain & Co</div>
      </div>
    </div>
  </div>

</body>
</html>
  `;

  // Save HTML for debugging
  const htmlPath = path.join(__dirname, 'exports', 'Together-for-Ukraine-WITH-IMAGES.html');
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`✅ HTML saved: ${htmlPath}\n`);

  // Navigate and generate PDF
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for rendering

  const pdfPath = path.join(__dirname, 'exports', 'Together-for-Ukraine-WITH-IMAGES.pdf');
  await page.pdf({
    path: pdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log(`✅ PDF Generated: ${pdfPath}`);
  console.log(`📄 Pages: 8 complete pages with visual elements`);
  console.log(`📊 File size: ${(fs.statSync(pdfPath).size / 1024).toFixed(1)} KB\n`);

  console.log('✅ Real Partner Logos Integrated:');
  console.log('  - Google (real SVG logo)');
  console.log('  - AWS (real SVG logo)');
  console.log('  - Cornell (real SVG logo)');
  console.log('  - Oxford (real SVG logo)');
  console.log('  - Kintell, Babbel, Sanoma, INCO, Bain & Co (text fallback)\n');

  console.log('🎨 Visual Elements Added:');
  console.log('  - Cover: Gradient hero image with TEEI brand colors');
  console.log('  - About Us: Collaboration-themed gradient');
  console.log('  - Programs pages: Educational theme gradients');
  console.log('  - Support page: Partnership pattern design');
  console.log('  - All images use TEEI brand color palette\n');

  await browser.close();

  // Open PDF automatically
  const { spawn } = require('child_process');
  spawn('cmd', ['/c', 'start', '', pdfPath], { detached: true, stdio: 'ignore' }).unref();
  console.log('🚀 PDF opened automatically for review\n');

  console.log('================================================================================');
  console.log('COMPLETE! Together for Ukraine 8-page brochure with visual elements');
  console.log('================================================================================');
})();
