/**
 * TEEI Mentorship Platform Overview
 * 5-page document with photography and TEEI branding
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function generateMentorshipHTML() {
  const assetsPath = 'file:///' + path.join(projectRoot, 'assets', 'images').replace(/\\/g, '/');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>TEEI Mentorship Platform Overview</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
@page{size:8.5in 11in;margin:0}
body{font-family:Georgia,serif;font-size:11pt;line-height:1.55;color:#333;margin:0;padding:0}
.page{width:8.5in;height:11in;position:relative;page-break-after:always;overflow:hidden;display:flex;flex-direction:column}

/* Cover Page */
.cover{background:#00393F;padding:40pt 35pt;display:flex;flex-direction:column;justify-content:space-between}
.cover-logo{width:200px;margin-bottom:20pt}
.cover-hero{width:100%;height:520pt;object-fit:cover;border-radius:8pt;margin-bottom:30pt}
.cover-title{font-size:48pt;font-weight:400;line-height:1.1;color:#FFF;text-align:center;margin-bottom:8pt}
.cover-subtitle{font-size:10pt;letter-spacing:3px;text-transform:uppercase;color:#FFF;text-align:center}

/* Content Pages */
.content{padding:50pt 50pt 50pt 50pt;background:#FFF}
.content-hero{width:100%;height:280pt;object-fit:cover;border-radius:6pt;margin-bottom:35pt}
.content-title{font-size:32pt;font-weight:600;color:#00393F;margin-bottom:22pt;line-height:1.2}
.content-intro{font-size:11.5pt;line-height:1.65;color:#333;margin-bottom:28pt}
.content-section{margin-bottom:28pt}
.section-title{font-size:9pt;letter-spacing:2px;text-transform:uppercase;color:#00393F;font-weight:700;margin-bottom:12pt}
.section-text{font-size:10.5pt;line-height:1.6;color:#333;margin-bottom:12pt}
.section-list{font-size:10.5pt;line-height:1.6;color:#333;margin-left:16pt}

/* Two Column Layout */
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:25pt;margin:30pt 0}
.col-box{padding:25pt;border-radius:4pt}
.col-box.sand{background:#FFF1E2}
.col-box.sky{background:#C9E4EC}
.col-box-text{font-size:11pt;line-height:1.5;color:#00393F;text-align:center}

/* Footer Logo */
.footer-logo{position:absolute;bottom:35pt;right:50pt;width:130px}

/* CTA Page */
.cta-page{padding:45pt 50pt;background:#FFF;display:flex;flex-direction:column}
.cta-hero{width:100%;height:360pt;object-fit:cover;border-radius:6pt;margin-bottom:35pt}
.cta-divider{width:60pt;height:2pt;background:#00393F;margin-bottom:20pt}
.cta-title{font-size:10pt;letter-spacing:2.5px;text-transform:uppercase;color:#00393F;font-weight:700;margin-bottom:15pt}
.cta-text{font-size:10.5pt;line-height:1.65;color:#333;margin-bottom:15pt}
.cta-contact{font-size:10.5pt;color:#00393F;margin-bottom:15pt}
.cta-contact a{color:#00393F;text-decoration:underline}
.cta-closing{font-size:11pt;line-height:1.6;color:#00393F;font-weight:600;margin-top:15pt}
.cta-footer-logo{position:absolute;bottom:35pt;right:50pt;width:130px}

/* Back Cover */
.back-cover{background:#00393F;padding:50pt 40pt 35pt;display:flex;flex-direction:column;align-items:center;text-align:center}
.bc-logo-ukraine{width:240px;margin-bottom:50pt}
.bc-title{font-size:34pt;font-weight:400;line-height:1.25;color:#FFF;margin-bottom:16pt}
.bc-subtitle{font-size:11pt;line-height:1.6;color:#FFF;margin-bottom:50pt;max-width:500pt}
.bc-divider{width:100%;max-width:600pt;height:1px;background:rgba(255,255,255,0.25);margin-bottom:30pt}
.bc-partners-label{font-size:9pt;letter-spacing:2px;text-transform:uppercase;color:#FFF;margin-bottom:25pt;text-align:left;width:100%;max-width:600pt}
.partner-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:25pt;max-width:600pt;margin-bottom:50pt}
.partner-box{background:rgba(255,255,255,0.1);padding:20pt;border-radius:4pt;display:flex;align-items:center;justify-content:center;min-height:60pt;color:#FFF;font-size:11pt;font-weight:700}
.bc-divider-bottom{width:100%;max-width:600pt;height:1px;background:rgba(255,255,255,0.25);margin-bottom:25pt}
.bc-contact{font-size:9pt;color:#FFF;margin-bottom:30pt}
.bc-logo-teei{width:120px}

@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{page-break-inside:avoid}}
</style>
</head>
<body>

<!-- PAGE 1: Cover -->
<div class="page cover">
<img src="${assetsPath}/teei-logo-white.png" alt="TEEI" class="cover-logo">
<img src="${assetsPath}/mentorship-hero.jpg" alt="Mentorship" class="cover-hero">
<div>
<h1 class="cover-title">Mentorship for Ukraine</h1>
<p class="cover-subtitle">Upskilling, Mentorship & Employment</p>
</div>
</div>

<!-- PAGE 2: Platform Introduction -->
<div class="page content">
<img src="${assetsPath}/mentorship-desk.jpg" alt="Working" class="content-hero">
<h2 class="content-title">Mentorship platform</h2>
<p class="content-intro">The Educational Equality Institute is proud to present our Mentorship for Ukraine program, an initiative designed to provide Ukrainians with valuable insights from experienced corporate mentors.</p>

<div class="two-col">
<div class="col-box sand">
<p class="col-box-text">Our program offers two types of mentoring: flexible on-demand and structured.</p>
</div>
<div class="col-box sky">
<p class="col-box-text">Both types are hosted on our platform with world-class UX and minimum admin work and providing engagement analytics.</p>
</div>
</div>

<div class="content-section">
<h3 class="section-title">Flexible On-Demand Mentoring</h3>
<p class="section-text">This approach allows mentees to seek immediate guidance as required and access swift advice. Mentors signing up for this program will have their profiles published and can set their availability in the system's backend. The sign-up process is quick and easy, taking only 2–5 minutes.</p>
<p class="section-text">Mentors can always adjust their availability, reschedule meetings, or cancel requests from mentees. This flexibility allows mentees to book one-off advice sessions and form long-term relationships by booking the same mentor repeatedly.</p>
</div>

<img src="${assetsPath}/teei-logo-dark.png" alt="TEEI" class="footer-logo">
</div>

<!-- PAGE 3: Structured Mentoring & Benefits -->
<div class="page content">
<div class="content-section">
<h3 class="section-title">Structured Mentoring</h3>
<p class="section-text">In this format, both mentors and mentees sign up to the program and share their professional interests. Using a scalable AI algorithm, the program matches mentors and mentees according to their interests and sends out recommendations to mentees for reaching out to their matched mentor(s).</p>
<p class="section-text">This program encourages long-term mentor–mentee relationships with a defined duration (e.g., 6 months) and regular meetings to discuss goals, progress, and development.</p>
</div>

<div class="content-section">
<h3 class="section-title">One Platform for Both Types of Mentoring</h3>
<p class="section-text">Our platform hosts both flexible on-demand and structured mentoring in one place. With world-class user experience and minimal administrative work, we provide engagement analytics to keep track of the program's progress and effectiveness.</p>
</div>

<div class="content-section">
<h3 class="section-title">Program Benefits</h3>
<p class="section-text">Experienced corporate mentors, enhancing their professional skills and knowledge, and helping them seek career guidance. Participants will be able to broaden their network and access potential future opportunities, contributing to their personal and professional growth.</p>
</div>

<div class="content-section">
<h3 class="section-title">Areas of Mentorship</h3>
<p class="section-text">As a mentor in our program, you have the opportunity to share your expertise and provide guidance in a diverse array of areas.</p>
<p class="section-text">The following list is an example of areas where you could offer mentorship: <strong>Web Development | Software Engineering | Data Science and Machine Learning Automation | Human Resources (HR) | Marketing | Project Management | Business Intelligence | Communication | CV and Interview Training | Entrepreneurship | Finance | Business | Leadership Development | Strategic Planning | UX</strong></p>
<p class="section-text">Your insights and guidance can make a significant difference in the professional development and growth of the Ukrainians in our program.</p>
</div>

<div class="content-section">
<h3 class="section-title">Program Transparency</h3>
<p class="section-text">We believe in the importance of transparency and accountability. Corporate administrators and the Educational Equality Institute have access to data analytics of program performance, including the number of bookings and participant activities, such as cancelling or not showing up for meetings. This allows us to monitor the program's impact and make necessary improvements.</p>
</div>

<img src="${assetsPath}/mentorship-team.jpg" alt="Team" style="width:100%;height:240pt;object-fit:cover;border-radius:6pt;margin-top:20pt">

<img src="${assetsPath}/teei-logo-dark.png" alt="TEEI" class="footer-logo">
</div>

<!-- PAGE 4: Get Started CTA -->
<div class="page cta-page">
<img src="${assetsPath}/mentorship-hands.jpg" alt="Together" class="cta-hero">
<div class="cta-divider"></div>
<h3 class="cta-title">Get Started Today</h3>
<p class="cta-text">If your organization is interested in joining our Mentorship for Ukraine program, we're here to make the process as easy as possible. Please contact us at:</p>
<p class="cta-contact">
<a href="mailto:contact@theeducationalequalityinstitute.org">contact@theeducationalequalityinstitute.org</a> |
<a href="#">Contact us page</a> |
+47 919 08 939
</p>
<p class="cta-text">and we'll provide the necessary link and take care of the setup for you. By joining us, you're not only providing invaluable support to Ukrainians in need, but also offering a rewarding experience for your employees.</p>
<p class="cta-closing">We look forward to welcoming you to our community of mentors and making a difference together.</p>
<img src="${assetsPath}/teei-logo-dark.png" alt="TEEI" class="cta-footer-logo">
</div>

<!-- PAGE 5: Back Cover -->
<div class="page back-cover">
<img src="${assetsPath}/together-ukraine-logo.png" alt="Together for Ukraine" class="bc-logo-ukraine">
<h2 class="bc-title">Join Us in Making a Difference</h2>
<p class="bc-subtitle">Partnering with Together for Ukraine will have a strong impact on the future of Ukraine and its people.</p>
<div class="bc-divider"></div>
<div class="bc-partners-label">OUR MAIN PARTNERS:</div>
<div class="partner-grid">
<div class="partner-box">Google</div>
<div class="partner-box">Kintell</div>
<div class="partner-box">+Babbel</div>
<div class="partner-box">Sanoma</div>
<div class="partner-box">Oxford UP</div>
<div class="partner-box">AWS</div>
<div class="partner-box">Cornell</div>
<div class="partner-box">INCO</div>
<div class="partner-box">Bain & Co</div>
</div>
<div class="bc-divider-bottom"></div>
<p class="bc-contact">Phone: +47 919 08 939 | Email: contact@theeducationalequalityinstitute.org</p>
<img src="${assetsPath}/teei-logo-white.png" alt="TEEI" class="bc-logo-teei">
</div>

</body>
</html>`;
}

async function main() {
  console.log('🚀 TEEI Mentorship Platform Overview\n');
  console.log('✨ Creating 5-page document...');

  const html = generateMentorshipHTML();
  const htmlPath = path.join(projectRoot, 'exports', 'mentorship-platform.html');

  await fs.writeFile(htmlPath, html, 'utf-8');

  console.log('✅ Generated: ' + path.relative(projectRoot, htmlPath));
  console.log('💾 Size: ' + (html.length / 1024).toFixed(1) + ' KB\n');
  console.log('📄 Pages: 5 (Cover + 3 content + Back cover)');
  console.log('🎨 Features:');
  console.log('   ✅ Professional photography');
  console.log('   ✅ TEEI brand colors');
  console.log('   ✅ Two mentoring types explained');
  console.log('   ✅ Partner logos on back cover');
  console.log('\n🖨️  Next: Convert to PDF');
}

main();
