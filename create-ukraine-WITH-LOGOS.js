#!/usr/bin/env node
/**
 * Together for Ukraine - WITH ACTUAL LOGOS
 * Fixes: Page 2 footer overlap
 * Adds: Real TEEI and Together for Ukraine logos
 */

const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

// TEEI Brand Colors
const COLORS = {
    nordshore: '#00393F',
    nordshore_light: '#006B7D',
    sky: '#C9E4EC',
    sand: '#FFF1E2',
    gold: '#BA8F5A',
    ukraine_blue: '#4169E1',
    ukraine_yellow: '#FFD700',
    white: '#FFFFFF',
    light_bg: '#f8fafc',
    gray: '#666666',
};

// Convert logo images to base64
function getImageBase64(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
}

const togetherUkraineLogo = getImageBase64('T:/TEEI/Logos/Together for Ukraine_Logo_white.png');
const teeiLogoWhite = getImageBase64('T:/TEEI/Logos/TEEI logo webpage white.png');

const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: Letter;
            margin: 0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Georgia, serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
        }

        .page {
            width: 8.5in;
            height: 11in;
            page-break-after: always;
            position: relative;
        }

        /* PAGE 1: COVER */
        .cover {
            background: ${COLORS.nordshore};
            padding: 60px 80px;
            color: ${COLORS.white};
        }

        .cover-header {
            font-size: 10pt;
            letter-spacing: 3px;
            margin-bottom: 80px;
        }

        .logo-ukraine-img {
            width: 350px;
            margin-bottom: 180px;
        }

        .cover-title {
            font-size: 48pt;
            line-height: 1.3;
            margin-bottom: 150px;
        }

        .teei-logo-img {
            position: absolute;
            bottom: 60px;
            right: 80px;
            height: 50px;
        }

        /* CONTENT PAGES */
        .content-page {
            background: ${COLORS.white};
            padding: 50px 80px 120px 80px;  /* INCREASED bottom padding to prevent footer overlap */
        }

        .page-header {
            font-size: 9pt;
            letter-spacing: 3px;
            color: ${COLORS.nordshore};
            margin-bottom: 40px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e0e0e0;
        }

        .section-title {
            color: ${COLORS.nordshore};
            font-size: 28pt;
            font-weight: bold;
            margin-bottom: 20px;
        }

        .section-subtitle {
            color: ${COLORS.nordshore};
            font-size: 16pt;
            font-weight: 600;
            margin-bottom: 16px;
        }

        .body-text {
            margin-bottom: 16px;
            line-height: 1.7;
            font-size: 10.5pt;
        }

        /* Program Cards */
        .program-list {
            margin: 30px 0 20px 0;  /* Reduced bottom margin */
            padding-left: 20px;
        }

        .program-item {
            margin-bottom: 10px;  /* Reduced from 12px */
            padding: 14px;  /* Reduced from 16px */
            background: ${COLORS.light_bg};
            border-left: 4px solid ${COLORS.gold};
        }

        .program-code {
            color: ${COLORS.nordshore};
            font-weight: bold;
            font-size: 14pt;
        }

        .program-name {
            color: ${COLORS.gray};
            font-size: 10pt;
        }

        /* Section Headers */
        .section-header {
            font-size: 24pt;
            font-weight: bold;
            color: ${COLORS.nordshore};
            margin: 30px 0 16px;
            padding-left: 16px;
            border-left: 6px solid ${COLORS.gold};
        }

        /* BACK COVER */
        .back-cover {
            background: ${COLORS.nordshore};
            color: ${COLORS.white};
            padding: 80px;
            text-align: center;
        }

        .back-logo-img {
            width: 300px;
            margin-bottom: 60px;
        }

        .cta-title {
            font-size: 28pt;
            line-height: 1.4;
            margin: 40px 0 20px;
        }

        .cta-subtitle {
            font-size: 12pt;
            margin-bottom: 60px;
            opacity: 0.9;
        }

        .partner-grid {
            display: inline-block;
            text-align: center;
            margin-bottom: 80px;
        }

        .partner-row {
            margin: 10px 0;
        }

        .partner-card {
            display: inline-block;
            background: ${COLORS.nordshore_light};
            padding: 12px 24px;
            margin: 0 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12pt;
            min-width: 120px;
        }

        .contact-info {
            font-size: 9pt;
            opacity: 0.8;
        }

        .page-footer {
            position: absolute;
            bottom: 40px;
            right: 80px;
            height: 35px;
        }

        .page-footer-center {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            height: 35px;
        }

        .page-footer-text {
            text-align: right;
            font-size: 7pt;
            font-weight: bold;
            letter-spacing: 2px;
            line-height: 1.3;
            color: ${COLORS.nordshore};
        }
    </style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page cover">
    <div class="cover-header">TOGETHER FOR UKRAINE</div>

    <img src="${togetherUkraineLogo}" alt="Together for Ukraine" class="logo-ukraine-img">

    <div class="cover-title">
        Female<br>
        Entrepreneurship<br>
        Program
    </div>

    <img src="${teeiLogoWhite}" alt="Educational Equality Institute" class="teei-logo-img">
</div>

<!-- PAGE 2: PROGRAM OVERVIEW -->
<div class="page content-page">
    <div class="page-header">TOGETHER FOR UKRAINE</div>

    <div class="section-title">Female Entrepreneurship Program</div>

    <div class="section-subtitle">
        The Women's Entrepreneurship and Empowerment Initiative (WEEI)
    </div>

    <div class="body-text">
        The Women's Entrepreneurship and Empowerment Initiative (WEEI) aims to foster the growth and
        development of Ukrainian women entrepreneurs through a comprehensive and tailored program focusing
        on impact and sustainable entrepreneurship. The program supports women, new businesses, established
        small businesses, and startups led by women, offering them valuable resources and support.
    </div>

    <div class="body-text">
        A crucial element WEEI is its emphasis on technology, partnerships and collaboration. By working closely
        with local and international organisations, private sector partners, and educational institutions, WEEI
        leverages a diverse network of resources and expertise.
    </div>

    <div class="program-list">
        <div class="program-item">
            <div class="program-code">U:LEARN</div>
            <div class="program-name">Individual Entrepreneurship Training for Women</div>
        </div>

        <div class="program-item">
            <div class="program-code">U:START</div>
            <div class="program-name">Women's MVP Incubator</div>
        </div>

        <div class="program-item">
            <div class="program-code">U:GROW</div>
            <div class="program-name">Female Startup Accelerator</div>
        </div>

        <div class="program-item">
            <div class="program-code">U:LEAD</div>
            <div class="program-name">Female Leadership Program</div>
        </div>
    </div>

    <div class="body-text" style="margin-top: 16px; font-size: 9.5pt;">
        In addition to the core entrepreneurship program, WEEI provides specialised training courses in digital skills,
        leadership, and coding through the TEEI upskilling program.
    </div>

    <img src="${teeiLogoWhite}" alt="Educational Equality Institute" class="page-footer" style="filter: brightness(0) saturate(100%) invert(16%) sepia(18%) saturate(2611%) hue-rotate(152deg) brightness(95%) contrast(101%);">
</div>

<!-- PAGE 3: BACKGROUND & MISSION -->
<div class="page content-page">
    <div class="page-header">TOGETHER FOR UKRAINE</div>

    <div class="section-header">Background</div>

    <div class="body-text">
        As the war continues, the needs of refugees out of Ukraine are evolving. With the expectation, in early 2022,
        that the war will end shortly, addressing basic humanitarian needs was a priority. With the war reaching its
        one-year anniversary, with no end in sight to the fighting - the needs are broadening, with education
        becoming a vital element of the survival kit in exile and aspirations to restart a new life in a post-war Ukraine.
    </div>

    <div class="body-text">
        The war is expected to have a significant impact not only on Ukraine's economy and infrastructure but also on
        its demographics. As Ukrainian men are engaged in the military, drawn away from their civil time functions
        and, sadly, dying or getting wounded, women face the need to step up and take over management roles in the
        most challenging economic environment.
    </div>

    <div class="body-text">
        As Ukraine aspires to become a future EU member, it is crucial to elevate entrepreneurship, technical
        upskilling, soft-skills training, career coaching, and active language training among women.
    </div>

    <div class="section-header">Mission</div>

    <div class="body-text">
        Our mission is to empower Ukrainian women entrepreneurs through comprehensive and tailored programs
        that foster impact and sustainable entrepreneurship. We provide valuable resources, mentorship, and
        support to women in business, from new ventures to established small businesses and startups.
    </div>

    <div class="section-header">Key Elements</div>

    <div class="body-text">
        WEEI offers a comprehensive program that is specifically designed to meet the unique needs of Ukrainian
        women entrepreneurs. The program provides valuable resources and support for women at all stages of
        business development.
    </div>

    <img src="${teeiLogoWhite}" alt="Educational Equality Institute" class="page-footer" style="filter: brightness(0) saturate(100%) invert(16%) sepia(18%) saturate(2611%) hue-rotate(152deg) brightness(95%) contrast(101%);">
</div>

<!-- PAGE 4: BACK COVER -->
<div class="page back-cover">
    <img src="${togetherUkraineLogo}" alt="Together for Ukraine" class="back-logo-img">

    <div class="cta-title">
        We are looking for more partners<br>
        and supporters to work with us.
    </div>

    <div class="cta-subtitle">
        Partnering with Together for Ukraine will have a strong impact on<br>
        the future of Ukraine and its people.
    </div>

    <div class="partner-grid">
        <div class="partner-row">
            <div class="partner-card">Google</div>
            <div class="partner-card">Kintell</div>
            <div class="partner-card">+Babbel</div>
        </div>
        <div class="partner-row">
            <div class="partner-card">Sanoma</div>
            <div class="partner-card">Oxford UP</div>
            <div class="partner-card">AWS</div>
        </div>
        <div class="partner-row">
            <div class="partner-card">Cornell</div>
            <div class="partner-card">INCO</div>
            <div class="partner-card">Bain & Co</div>
        </div>
    </div>

    <div class="contact-info">
        Phone: +47 919 08 939 | Email: contact@theeducationalequalityinstitute.org
    </div>

    <img src="${teeiLogoWhite}" alt="Educational Equality Institute" class="page-footer-center">
</div>

</body>
</html>
`;

async function createLogosPDF() {
    console.log('\n' + '='.repeat(80));
    console.log('TOGETHER FOR UKRAINE - WITH ACTUAL LOGOS');
    console.log('Fixes:');
    console.log('  • Page 2 footer overlap (increased bottom padding)');
    console.log('  • Actual Together for Ukraine logo');
    console.log('  • Actual TEEI logo (with color filter for Nordshore)');
    console.log('='.repeat(80) + '\n');

    console.log('[1/4] Launching browser...');
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();

    console.log('[2/4] Rendering HTML with logos...');
    await page.setContent(html);
    await page.waitForTimeout(1000);  // Wait for images to load

    const outputPathHTML = path.join(__dirname, 'exports', 'ukraine-WITH-LOGOS.html');
    const outputPathPDF = path.join(__dirname, 'exports', 'ukraine-WITH-LOGOS.pdf');

    fs.writeFileSync(outputPathHTML, html);

    console.log('[3/4] Generating PDF...');
    await page.pdf({
        path: outputPathPDF,
        format: 'Letter',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    const stats = fs.statSync(outputPathPDF);
    const fileSizeKB = (stats.size / 1024).toFixed(1);

    console.log('\n' + '='.repeat(80));
    console.log('PDF WITH LOGOS CREATED');
    console.log('='.repeat(80));
    console.log(`\nPDF: ${outputPathPDF}`);
    console.log(`HTML: ${outputPathHTML}`);
    console.log(`Size: ${fileSizeKB} KB`);
    console.log('\nEnhancements:');
    console.log('  ✓ Together for Ukraine logo (actual image)');
    console.log('  ✓ TEEI logo (actual image with Nordshore filter)');
    console.log('  ✓ Fixed page 2 footer overlap');
    console.log('  ✓ Reduced spacing to fit content');
    console.log('\nOpening in browser...\n');

    require('child_process').exec(`start "" "http://localhost:8080/exports/ukraine-WITH-LOGOS.html"`);
}

createLogosPDF().catch(console.error);
