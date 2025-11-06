#!/usr/bin/env node
/**
 * Together for Ukraine - STUNNING HTML→PDF Version
 * Using the PROVEN pipeline that created yesterday's beautiful PDFs!
 *
 * Features:
 * - CSS gradients (Nordshore → darker)
 * - Box shadows for depth
 * - Card-based layouts
 * - Decorative elements with opacity
 * - Professional typography (Georgia for Lora-like serif)
 */

const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

// TEEI Brand Colors
const COLORS = {
    nordshore: '#00393F',
    nordshore_dark: '#002f35',
    sky: '#C9E4EC',
    sand: '#FFF1E2',
    gold: '#BA8F5A',
    ukraine_blue: '#4169E1',
    ukraine_yellow: '#FFD700',
    white: '#FFFFFF',
    light_bg: '#f8fafc',
};

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
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 11pt;
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

        /* PAGE 1: COVER */
        .cover {
            background: linear-gradient(135deg, ${COLORS.nordshore_dark} 0%, ${COLORS.nordshore} 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            padding: 80px;
            position: relative;
        }

        /* Decorative circles */
        .circle {
            position: absolute;
            border-radius: 50%;
            opacity: 0.15;
        }

        .circle-1 {
            width: 300px;
            height: 300px;
            background: ${COLORS.ukraine_blue};
            top: 50px;
            right: -50px;
        }

        .circle-2 {
            width: 250px;
            height: 250px;
            background: ${COLORS.ukraine_yellow};
            top: 120px;
            right: 20px;
            opacity: 0.2;
        }

        .logo-container {
            margin-bottom: 200px;
            z-index: 10;
        }

        .logo-box {
            background: ${COLORS.ukraine_blue};
            padding: 20px 30px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            display: inline-block;
        }

        .logo-together {
            color: ${COLORS.white};
            font-size: 36pt;
            font-weight: normal;
            margin: 0;
        }

        .logo-ukraine {
            background: ${COLORS.ukraine_yellow};
            color: ${COLORS.nordshore};
            font-size: 42pt;
            font-weight: bold;
            padding: 8px 24px;
            margin-top: 8px;
            display: inline-block;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .cover-title {
            color: ${COLORS.white};
            font-size: 56pt;
            line-height: 1.2;
            margin-top: 100px;
            font-weight: normal;
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 10;
        }

        .gold-line {
            width: 200px;
            height: 3px;
            background: ${COLORS.gold};
            margin-top: -20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .teei-logo {
            position: absolute;
            bottom: 60px;
            right: 80px;
            text-align: right;
            color: ${COLORS.white};
            font-size: 10pt;
            font-weight: bold;
            letter-spacing: 2px;
            line-height: 1.3;
        }

        /* PAGE 2: PROGRAM OVERVIEW */
        .content-page {
            background: ${COLORS.white};
            padding: 60px 80px;
        }

        .header-bar {
            background: ${COLORS.light_bg};
            margin: -60px -80px 40px;
            padding: 20px 80px;
            font-size: 12pt;
            color: ${COLORS.nordshore};
            font-weight: bold;
            letter-spacing: 3px;
        }

        .section-title {
            color: ${COLORS.nordshore};
            font-size: 32pt;
            font-weight: bold;
            margin-bottom: 16px;
        }

        .section-subtitle {
            color: ${COLORS.nordshore};
            font-size: 18pt;
            font-weight: 600;
            margin-bottom: 20px;
        }

        .body-text {
            margin-bottom: 20px;
            line-height: 1.8;
        }

        /* Program Cards */
        .program-cards {
            margin-top: 40px;
        }

        .program-card {
            background: ${COLORS.light_bg};
            padding: 20px;
            margin-bottom: 16px;
            border-radius: 8px;
            border-left: 8px solid ${COLORS.gold};
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: transform 0.2s;
        }

        .program-code {
            color: ${COLORS.nordshore};
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 8px;
        }

        .program-title {
            color: #555;
            font-size: 13pt;
        }

        /* PAGE 3: BACKGROUND & MISSION */
        .sidebar-section {
            display: flex;
            gap: 20px;
            margin-bottom: 40px;
        }

        .gold-sidebar {
            width: 8px;
            background: linear-gradient(180deg, ${COLORS.gold} 0%, #9a6f45 100%);
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .sidebar-content {
            flex: 1;
        }

        .section-header {
            font-size: 28pt;
            font-weight: bold;
            color: ${COLORS.nordshore};
            margin-bottom: 20px;
        }

        /* PAGE 4: BACK COVER */
        .back-cover {
            background: linear-gradient(135deg, ${COLORS.nordshore} 0%, ${COLORS.nordshore_dark} 100%);
            color: ${COLORS.white};
            padding: 80px;
            text-align: center;
            position: relative;
        }

        .cta-main {
            font-size: 32pt;
            font-weight: normal;
            margin: 60px 0 30px;
            line-height: 1.3;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .cta-sub {
            font-size: 14pt;
            margin-bottom: 60px;
            opacity: 0.9;
        }

        .partner-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            max-width: 500px;
            margin: 0 auto 60px;
        }

        .partner-card {
            background: ${COLORS.nordshore_dark};
            padding: 16px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 14pt;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            opacity: 0.85;
        }

        .contact-info {
            font-size: 10pt;
            opacity: 0.8;
            margin-top: 40px;
        }
    </style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page cover">
    <div class="circle circle-1"></div>
    <div class="circle circle-2"></div>

    <div class="logo-container">
        <div class="logo-box">
            <div class="logo-together">Together for</div>
        </div>
        <div class="logo-ukraine">UKRAINE</div>
    </div>

    <div class="gold-line"></div>

    <div class="cover-title">
        Female<br>
        Entrepreneurship<br>
        Program
    </div>

    <div class="teei-logo">
        EDUCATIONAL<br>
        EQUALITY<br>
        INSTITUTE
    </div>
</div>

<!-- PAGE 2: PROGRAM OVERVIEW -->
<div class="page content-page">
    <div class="header-bar">TOGETHER FOR UKRAINE</div>

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

    <div class="program-cards">
        <div class="program-card">
            <div class="program-code">U:LEARN</div>
            <div class="program-title">Individual Entrepreneurship Training for Women</div>
        </div>

        <div class="program-card">
            <div class="program-code">U:START</div>
            <div class="program-title">Women's MVP Incubator</div>
        </div>

        <div class="program-card">
            <div class="program-code">U:GROW</div>
            <div class="program-title">Female Startup Accelerator</div>
        </div>

        <div class="program-card">
            <div class="program-code">U:LEAD</div>
            <div class="program-title">Female Leadership Program</div>
        </div>
    </div>

    <div class="body-text" style="margin-top: 30px; font-size: 10pt;">
        In addition to the core entrepreneurship program, WEEI provides specialised training courses in digital skills,
        leadership, and coding through the TEEI upskilling program. To accommodate the vast geographical scope and
        needs, the program has a digital-first approach.
    </div>

    <div class="teei-logo" style="position: absolute; bottom: 30px; right: 80px; color: ${COLORS.nordshore}; font-size: 6pt;">
        EDUCATIONAL EQUALITY INSTITUTE
    </div>
</div>

<!-- PAGE 3: BACKGROUND & MISSION -->
<div class="page content-page">
    <div class="header-bar">TOGETHER FOR UKRAINE</div>

    <div class="sidebar-section" style="height: 300px;">
        <div class="gold-sidebar"></div>
        <div class="sidebar-content">
            <div class="section-header">Background</div>
            <div class="body-text" style="font-size: 10pt;">
                As the war continues, the needs of refugees out of Ukraine are evolving. With the expectation, in early 2022,
                that the war will end shortly, addressing basic humanitarian needs was a priority. With the war reaching its
                one-year anniversary, with no end in sight to the fighting - the needs are broadening, with education
                becoming a vital element of the survival kit in exile and aspirations to restart a new life in a post-war Ukraine.
            </div>
            <div class="body-text" style="font-size: 10pt;">
                The war is expected to have a significant impact not only on Ukraine's economy and infrastructure but also on
                its demographics. As Ukrainian men are engaged in the military, drawn away from their civil time functions
                and, sadly, dying or getting wounded, women face the need to step up and take over management roles in the
                most challenging economic environment.
            </div>
            <div class="body-text" style="font-size: 10pt;">
                As Ukraine aspires to become a future EU member, it is crucial to elevate entrepreneurship, technical
                upskilling, soft-skills training, career coaching, and active language training among women.
            </div>
        </div>
    </div>

    <div class="sidebar-section" style="height: 200px;">
        <div class="gold-sidebar"></div>
        <div class="sidebar-content">
            <div class="section-header">Mission</div>
            <div class="body-text" style="font-size: 11pt;">
                Our mission is to empower Ukrainian women entrepreneurs through comprehensive and tailored programs
                that foster impact and sustainable entrepreneurship. We provide valuable resources, mentorship, and
                support to women in business, from new ventures to established small businesses and startups.
            </div>
        </div>
    </div>

    <div class="section-header" style="font-size: 24pt; margin-top: 40px;">Key Elements</div>
    <div class="body-text" style="font-size: 11pt;">
        WEEI offers a comprehensive program that is specifically designed to meet the unique needs of Ukrainian
        women entrepreneurs. The program provides valuable resources and support for women at all stages of
        business development.
    </div>

    <div class="teei-logo" style="position: absolute; bottom: 30px; right: 80px; color: ${COLORS.nordshore}; font-size: 6pt;">
        EDUCATIONAL EQUALITY INSTITUTE
    </div>
</div>

<!-- PAGE 4: BACK COVER -->
<div class="page back-cover">
    <div class="circle circle-1" style="top: auto; bottom: 50px; left: -100px;"></div>

    <div class="logo-container" style="margin-bottom: 0;">
        <div class="logo-box">
            <div class="logo-together" style="font-size: 28pt;">Together for</div>
        </div>
        <div class="logo-ukraine" style="font-size: 32pt;">UKRAINE</div>
    </div>

    <div class="cta-main">
        We are looking for more partners and<br>
        supporters to work with us.
    </div>

    <div class="cta-sub">
        Partnering with Together for Ukraine will have a strong impact on<br>
        the future of Ukraine and its people.
    </div>

    <div class="partner-grid">
        <div class="partner-card">Google</div>
        <div class="partner-card">Kintell</div>
        <div class="partner-card">+Babbel</div>
        <div class="partner-card">Sanoma</div>
        <div class="partner-card">Oxford UP</div>
        <div class="partner-card">AWS</div>
        <div class="partner-card">Cornell</div>
        <div class="partner-card">INCO</div>
        <div class="partner-card">Bain & Co</div>
    </div>

    <div class="contact-info">
        Phone: +47 919 08 939 | Email: contact@theeducationalequalityinstitute.org
    </div>

    <div class="teei-logo" style="position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); font-size: 10pt;">
        EDUCATIONAL EQUALITY INSTITUTE
    </div>
</div>

</body>
</html>
`;

async function createStunningPDF() {
    console.log('\n' + '='.repeat(80));
    console.log('TOGETHER FOR UKRAINE - STUNNING HTML→PDF');
    console.log('Using the PROVEN pipeline from yesterday!');
    console.log('='.repeat(80) + '\n');

    console.log('[1/3] Launching browser...');
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();

    console.log('[2/3] Rendering HTML...');
    await page.setContent(html);

    const outputPath = path.join(__dirname, 'exports', 'ukraine-STUNNING.pdf');

    console.log('[3/3] Generating PDF...');
    await page.pdf({
        path: outputPath,
        format: 'Letter',
        printBackground: true,
        margin: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    });

    await browser.close();

    const stats = fs.statSync(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(1);

    console.log('\n' + '='.repeat(80));
    console.log('SUCCESS! PDF CREATED!');
    console.log('='.repeat(80));
    console.log(`\nFile: ${outputPath}`);
    console.log(`Size: ${fileSizeKB} KB`);
    console.log('\nFeatures:');
    console.log('  ✓ CSS gradients (Nordshore → darker)');
    console.log('  ✓ Box shadows for depth');
    console.log('  ✓ Card-based program layout');
    console.log('  ✓ Decorative circles with opacity');
    console.log('  ✓ Gold sidebar accents');
    console.log('  ✓ Professional typography');
    console.log('  ✓ 4 pages, Letter size');
    console.log('\nOpening PDF...\n');

    // Open the PDF
    require('child_process').exec(`start "" "${outputPath}"`);
}

createStunningPDF().catch(console.error);
