#!/usr/bin/env node
/**
 * Together for Ukraine - COMPLETE 8-PAGE PDF WITH REAL LOGOS
 * Recreates the official Together for Ukraine brochure
 * Uses real partner logos where available
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
    light_sky: '#E8F4F8',
};

function getImageBase64(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.svg' ? 'image/svg+xml' : 'image/png';
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
}

// TEEI logos
const teeiLogoWhite = getImageBase64('T:/TEEI/Logos/TEEI logo webpage white.png');
const teeiLogoDark = getImageBase64('T:/TEEI/Logos/TEEI logo dark.png');
const togetherUkraineLogo = getImageBase64('T:/TEEI/Logos/Together for Ukraine_Logo_white.png');

// Partner logos (real SVGs)
const googleLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/google.svg');
const awsLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/aws.svg');
const cornellLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/cornell.svg');
const oxfordLogo = getImageBase64('T:/Projects/pdf-orchestrator/assets/partner-logos/oxford.svg');

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

        /* TYPOGRAPHY */
        .serif {
            font-family: Georgia, serif;
        }

        .sans {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* PAGE 1: COVER */
        .cover {
            background: ${COLORS.nordshore};
            padding: 50px 60px;
            color: ${COLORS.white};
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .cover-logo {
            width: 200px;
            margin-bottom: 30px;
        }

        .cover-hero-image {
            width: 100%;
            max-width: 600px;
            margin: 0 auto 40px;
            border-radius: 12px;
        }

        .cover-title {
            font-size: 52pt;
            font-weight: normal;
            margin-bottom: 12px;
            text-align: center;
        }

        .cover-subtitle {
            font-size: 11pt;
            letter-spacing: 3px;
            text-align: center;
            font-family: -apple-system, sans-serif;
        }

        /* CONTENT PAGES */
        .content-page {
            background: ${COLORS.white};
            padding: 50px 60px 100px 60px;
        }

        .page-title {
            font-size: 36pt;
            color: ${COLORS.nordshore};
            margin-bottom: 30px;
            font-weight: normal;
        }

        .page-subtitle {
            font-size: 16pt;
            color: ${COLORS.nordshore};
            margin-bottom: 24px;
            font-family: -apple-system, sans-serif;
        }

        .section-divider {
            width: 100%;
            height: 2px;
            background: ${COLORS.gold};
            margin: 20px 0 30px 0;
        }

        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }

        .body-text {
            margin-bottom: 16px;
            line-height: 1.7;
            font-size: 11pt;
            font-family: -apple-system, sans-serif;
        }

        .body-text.bold {
            font-weight: 600;
        }

        .body-text.large {
            font-size: 12pt;
            margin-bottom: 20px;
        }

        /* Programs */
        .program {
            margin-bottom: 30px;
        }

        .program-name {
            font-size: 20pt;
            color: ${COLORS.nordshore};
            margin-bottom: 8px;
            font-weight: normal;
        }

        .program-subtitle {
            font-size: 9pt;
            letter-spacing: 2px;
            color: ${COLORS.nordshore};
            margin-bottom: 12px;
            font-family: -apple-system, sans-serif;
            font-weight: 600;
        }

        .program-description {
            font-size: 10.5pt;
            line-height: 1.6;
            font-family: -apple-system, sans-serif;
        }

        /* Goals Box */
        .goals-box {
            background: ${COLORS.light_sky};
            padding: 30px;
            border-left: 4px solid ${COLORS.nordshore};
        }

        .goals-title {
            font-size: 24pt;
            color: ${COLORS.nordshore};
            margin-bottom: 20px;
            font-weight: normal;
        }

        .goal-item {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid ${COLORS.nordshore};
        }

        .goal-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .goal-number {
            font-size: 32pt;
            color: ${COLORS.nordshore};
            font-weight: bold;
            font-family: -apple-system, sans-serif;
        }

        .goal-label {
            font-size: 9pt;
            letter-spacing: 1px;
            color: ${COLORS.nordshore};
            font-family: -apple-system, sans-serif;
        }

        /* Quote Box */
        .quote-box {
            background: ${COLORS.light_sky};
            padding: 30px;
            margin: 30px 0;
            border-left: 4px solid ${COLORS.gold};
            font-style: italic;
            font-size: 13pt;
            line-height: 1.6;
        }

        .quote-attribution {
            margin-top: 16px;
            font-style: normal;
            font-weight: 600;
            font-size: 11pt;
            font-family: -apple-system, sans-serif;
        }

        .quote-title {
            font-size: 9pt;
            letter-spacing: 1px;
            font-family: -apple-system, sans-serif;
        }

        /* Partnership Options */
        .partnership-option {
            margin-bottom: 40px;
        }

        .partnership-title {
            font-size: 16pt;
            color: ${COLORS.nordshore};
            margin-bottom: 12px;
            font-weight: 600;
            letter-spacing: 2px;
            font-family: -apple-system, sans-serif;
        }

        /* Images */
        .content-image {
            width: 100%;
            max-width: 400px;
            border-radius: 12px;
            margin: 20px 0;
        }

        /* Footer Logo */
        .page-footer {
            position: absolute;
            bottom: 40px;
            right: 60px;
            height: 40px;
        }

        .page-footer-center {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            height: 40px;
        }

        /* BACK COVER */
        .back-cover {
            background: ${COLORS.nordshore};
            color: ${COLORS.white};
            padding: 60px;
            text-align: center;
        }

        .back-logo {
            width: 300px;
            margin: 0 auto 50px;
        }

        .back-title {
            font-size: 32pt;
            line-height: 1.4;
            margin: 30px 0 20px;
            font-weight: normal;
        }

        .back-subtitle {
            font-size: 13pt;
            margin-bottom: 40px;
            opacity: 0.9;
            font-family: -apple-system, sans-serif;
        }

        .contact-info {
            font-size: 11pt;
            margin: 40px 0;
            font-family: -apple-system, sans-serif;
        }

        .partners-label {
            font-size: 11pt;
            letter-spacing: 2px;
            margin-bottom: 30px;
            font-family: -apple-system, sans-serif;
            font-weight: 600;
        }

        /* Partner Grid */
        .partner-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            max-width: 600px;
            margin: 0 auto 40px;
        }

        .partner-logo-card {
            background: ${COLORS.white};
            border-radius: 8px;
            padding: 24px 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 90px;
        }

        .partner-logo-img {
            max-width: 100%;
            max-height: 50px;
            width: auto;
            height: auto;
            object-fit: contain;
        }

        .partner-logo-text {
            font-size: 15pt;
            font-weight: bold;
            color: ${COLORS.nordshore};
            font-family: -apple-system, sans-serif;
        }
    </style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page cover">
    <img src="${teeiLogoWhite}" alt="TEEI" class="cover-logo">

    <div>
        <div class="cover-title serif">Together for Ukraine</div>
        <div class="cover-subtitle">EDUCATIONAL PROGRAMS FOR UKRAINIAN REFUGEES</div>
    </div>
</div>

<!-- PAGE 2: ABOUT US -->
<div class="page content-page">
    <div class="page-title serif">About Us</div>

    <div class="two-column">
        <div>
            <div class="body-text large bold">
                The Educational Equality Institute is an NGO based in Norway committed to educating and empowering disadvantaged girls through education.
            </div>

            <div class="body-text bold">
                In response to the war in Ukraine, we started the project "Together for Ukraine" to provide free educational programs for 100,000 Ukrainians.
            </div>

            <div class="body-text bold">
                We strongly believe education, upskilling, and employment are among the most impactful ways to support and help rebuild Ukraine.
            </div>

            <div class="body-text">
                We prioritize designing and implementing highly effective programs to support our beneficiaries. Utilizing the latest technology, automation, and a streamlined organizational structure, we efficiently deliver targeted assistance to those in need. Our dedicated team consistently seeks innovative ways to enhance our impact.
            </div>

            <div class="body-text">
                In partnership with leading businesses and organizations worldwide, we collaborate closely to develop programs that align with industry needs and trends. This ensures that our beneficiaries receive the skills and knowledge necessary for success.
            </div>
        </div>

        <div class="goals-box">
            <div class="goals-title serif">Our Goals</div>

            <div class="goal-item">
                <div class="goal-number">100,000</div>
                <div class="goal-label">STUDENTS</div>
            </div>

            <div class="goal-item">
                <div class="goal-number">5,000</div>
                <div class="goal-label">TEACHERS</div>
            </div>

            <div class="goal-item">
                <div class="goal-number">50</div>
                <div class="goal-label">KEY PARTNERS</div>
            </div>

            <div class="goal-item">
                <div class="goal-number">50</div>
                <div class="goal-label">UNIVERSITIES</div>
            </div>
        </div>
    </div>

    <img src="${teeiLogoDark}" alt="TEEI" class="page-footer">
</div>

<!-- PAGE 3: OUR PROGRAMS (PART 1) -->
<div class="page content-page">
    <div class="page-title serif">Our Programs</div>
    <div class="section-divider"></div>

    <div class="two-column">
        <div>
            <div class="program">
                <div class="program-name serif">TEEI buddy program</div>
                <div class="program-subtitle">A MENTOR PROGRAM FOR UKRAINIANS</div>
                <div class="program-description">
                    Volunteers from around the world help with language practice, provide a conversational partner, professional mentoring and advice or even just meeting up for coffee.
                </div>
            </div>

            <div class="program">
                <div class="program-name serif">Language Connect for Ukraine</div>
                <div class="program-subtitle">FREE 1-1 LANGUAGE LEARNING PLATFORM</div>
                <div class="program-description">
                    A digital hub connecting Ukrainians with international volunteers to practice language skills over 1-1 video sessions. A great addition to our language classes to get some first-hand practical experience.
                </div>
            </div>

            <div class="program">
                <div class="program-name serif">TEEI online Ukrainian school</div>
                <div class="program-subtitle">A SCHOOL FOR UKRAINIAN CHILDREN EVERYWHERE</div>
                <div class="program-description">
                    An online school offering the official Ukrainian school curriculum and Ukrainian school teachers hired by TEEI. Ukrainian children all over Europe can learn with us in a safe and familiar environment.
                </div>
            </div>
        </div>

        <div>
            <div class="program">
                <div class="program-name serif">TEEI language courses</div>
                <div class="program-subtitle">FREE LANGUAGE CLASSES FOR UKRAINIANS</div>
                <div class="program-description">
                    Teaching is delivered online and in person, and courses provide a conversation partner, professional mentoring and advice.
                </div>
            </div>

            <div class="program">
                <div class="program-name serif">TEEI open university for Ukrainians</div>
                <div class="program-subtitle">FREE ONLINE UNIVERSITY-LEVEL EDUCATION FOR UKRAINIANS</div>
                <div class="program-description">
                    Students can start new university studies or continue existing studies via TEEI and undertake exams at our partner universities for full accreditation. The students study through TEEI's own LMS system for Ukrainians, TEEI itslearning.
                </div>
                <div class="program-description bold" style="margin-top: 12px;">
                    TEEI are currently in final talks for a partnership with the Ukrainian Global University, an initiative by the Office of the President of Ukraine.
                </div>
            </div>
        </div>
    </div>

    <img src="${teeiLogoDark}" alt="TEEI" class="page-footer">
</div>

<!-- PAGE 4: OUR PROGRAMS (PART 2) -->
<div class="page content-page">
    <div class="page-title serif">Our Programs</div>
    <div class="section-divider"></div>

    <div class="two-column">
        <div>
            <div class="program">
                <div class="program-name serif">Upskilling & employment programs</div>
                <div class="program-description">
                    Together with our partners, we aim to help 100,000 Ukrainians find a job remotely through our upskilling and job-related educational programs.
                </div>
                <div class="program-description">
                    TEEI's "Careers for Ukraine" job board lets companies list jobs for Ukrainians with us.
                </div>
                <div class="program-description">
                    Skilled Ukrainians have the opportunity to coach people around the world through our coaching platform.
                </div>
                <div class="program-description">
                    We structure our training schedules to ensure relevant pathways between fundamentals and advanced training, ensuring students are ready for full-time paid roles upon completing their courses. All our courses are open to all Ukrainians.
                </div>
                <div class="program-description">
                    All Ukrainians studying in our upskilling programs can study our language courses in parallel and change over to study in a different language when they are ready.
                </div>
            </div>

            <div class="program">
                <div class="program-name serif">Ukrainian female entrepreneurship program</div>
                <div class="program-description">
                    TEEI and its partners are supporting Ukrainian females through a 6-month entrepreneurial program, which provides Ukrainian women with the capital, tools, and network they need to start or scale their businesses.
                </div>
            </div>
        </div>

        <div>
            <div class="program">
                <div class="program-name serif">Digital academy for veterans and their families</div>
                <div class="program-description">
                    We have developed a digital academy for veterans and their families in cooperation with the Ukrainian Ministry of Veteran Affairs. Its purpose is to provide an easier path for reintegration, education, and employment for Ukrainian veterans.
                </div>
            </div>
        </div>
    </div>

    <img src="${teeiLogoDark}" alt="TEEI" class="page-footer">
</div>

<!-- PAGE 5: YOUTH PROGRAMS -->
<div class="page content-page">
    <div class="page-title serif">Youth Programs</div>
    <div class="page-subtitle">In cooperation with The Ministry of Sports and Youth of Ukraine.</div>
    <div class="section-divider"></div>

    <div class="two-column">
        <div>
            <div class="program">
                <div class="program-name serif">Support program for IDPs, youth centres and integration centres</div>
                <div class="program-description">
                    The program supports IDPs through converted youth centres and in-person education. Its aim is to integrate IDPs into local communities through educational and civic education programs. This will strengthen social cohesion and cultural exchange and increase the resilience of IDPs and local youth.
                </div>
                <div class="program-description">
                    There are 121 youth centres open in Ukraine. We expect to open the programs in at least 20 youth centres and support the opening of 10 new integration centres western of Ukraine in 2023.
                </div>
            </div>
        </div>

        <div>
            <div class="program">
                <div class="program-name serif">Tech Academy for youth</div>
                <div class="program-description">
                    A training program for youth based on our upskilling program.
                </div>
                <div class="program-description">
                    TEEI is developing online courses for young people and assisting in the development of the online platform E-Youth, which will post opportunities, online training and educational courses for youth.
                </div>
                <div class="program-description">
                    Before the end of 2023, there scheduled 10 offline courses for 250 participants in Ukraine.
                </div>
            </div>

            <div class="program">
                <div class="program-name serif">Youth entrepreneurship</div>
                <div class="program-description">
                    The program consists of educational courses in entrepreneurship, a mentorship program and grants for the best projects. The program supports young entrepreneurs to develop their skills and improve ideas with grants for projects that can establish new working places for youth.
                </div>
                <div class="program-description">
                    TEEI are supporting the Ministry's work to establish a Ukrainian Youth Foundation, a state institution that will be responsible for grants to youth initiatives and projects.
                </div>
            </div>
        </div>
    </div>

    <img src="${teeiLogoDark}" alt="TEEI" class="page-footer">
</div>

<!-- PAGE 6: OTHER PROGRAMS -->
<div class="page content-page">
    <div class="page-title serif">Other Programs</div>
    <div class="section-divider"></div>

    <div class="two-column">
        <div>
            <div class="program">
                <div class="program-name serif">Support program for Ukrainian universities</div>
                <div class="program-subtitle">FREE ONLINE UNIVERSITY-LEVEL EDUCATION FOR UKRAINIANS</div>
                <div class="program-description">
                    TEEI provides support with hardware, software, teachers, LMS, admin staff and help with fundraising. TEEI has support agreements and has started relief action for 7 universities that need international support to continue their work.
                </div>
                <div class="program-description">
                    TEEI is currently in talks with more than a dozen Ukrainian universities that need international support to continue their work.
                </div>
                <div class="program-description">
                    TEEI is developing a scholarship fund to enable Ukrainian students to continue their studies under war conditions.
                </div>
                <div class="program-description">
                    TEEI is proud that our partnership with KhSA, enables them to be a ground-breaking institution in Ukraine's higher education system.
                </div>
            </div>

            <div class="quote-box serif">
                "I know that it is Kharkiv School of Architecture that will be the first higher education institution in which the modules of the barrier-free curriculum can be implemented. I applaud this important step! I believe it will be an example for other universities. Yes, war scars will remain on our streets. But only as a reminder of what you can't forget. A new life will begin on a newfoundation we lay together."
                <div class="quote-attribution">
                    Olena Zelenska<br>
                    <span class="quote-title">FIRST LADY OF UKRAINE</span>
                </div>
            </div>
        </div>

        <div>
            <div class="program">
                <div class="program-name serif">Books for kids</div>
                <div class="program-subtitle">DISTRIBUTION OF UKRAINIAN CHILDREN BOOKS AROUND EUROPE</div>
                <div class="program-description">
                    Together with our partner Shevchenko Central Library for Kids, the biggest library for kids in Ukraine, we are supporting the project Ukrainian Books Without Borders.
                </div>
            </div>

            <div class="program">
                <div class="program-name serif">Support program for Ukrainian NGO's, companies, start-ups & organisations</div>

                <div class="program-description bold" style="margin-top: 16px;">Recovery camp - Sincere Heart</div>
                <div class="program-description">
                    Through their "Recovery Camp" - a centre for psychological rehabilitation of children who suffers from the war, Sincere Heart has helped over 4,000 children and 2,500 families find healing and hope.
                </div>

                <div class="program-description bold" style="margin-top: 16px;">Helpukrainedonbas + Illinivka Institution</div>
                <div class="program-description">
                    A humanitarian foundation that provides assistance and support to people affected by the ongoing war in Ukraine.
                </div>

                <div class="program-description bold" style="margin-top: 16px;">Orphanages</div>
                <div class="program-description">
                    We support several orphanages in Ukraine. Teachers, caretakers and assistants stay with the children 24 hours a day. Among the number of children are those displaced from the war zone.
                </div>
            </div>
        </div>
    </div>

    <img src="${teeiLogoDark}" alt="TEEI" class="page-footer">
</div>

<!-- PAGE 7: SUPPORT TOGETHER FOR UKRAINE -->
<div class="page content-page">
    <div class="page-title serif">Support Together for Ukraine</div>
    <div class="page-subtitle">
        We are looking for more partners and supporters to work with us. Partnering with Together for Ukraine will have a strong impact on the future of Ukraine and its people.
    </div>
    <div class="section-divider"></div>

    <div class="partnership-option">
        <div class="partnership-title">PARTNERSHIP</div>
        <div class="body-text">
            TEEI seeks to partner with leading organisations and companies that want to make a positive and lasting impact. A partnership with TEEI is a mutually beneficial relationship. Work with us to co-develop programs or provide technical assistance, software, equipment, training, knowledge exchange, collaborative learning or any other capacity-development opportunities. Our partners have the chance to make a positive social impact, build relationships, and develop and deploy ethical and sustainable business strategies.
        </div>
    </div>

    <div class="partnership-option">
        <div class="partnership-title">SPONSORSHIP</div>
        <div class="body-text">
            Support Together for Ukraine by sponsoring us with an in-kind or monetary donation. We make sure every sponsor gets the most out of their corporate social responsibility budget by putting every euro given to work on our projects. Our corporate sponsorship program is an opportunity for your company to bring real impact to the people of Ukraine. Become an annual sponsor with a single donation that gives your company year-round exposure or sponsor individual programs to show your community support as a good corporate citizen.
        </div>
    </div>

    <div class="partnership-option">
        <div class="partnership-title">VOLUNTEER PROGRAM</div>
        <div class="body-text">
            Studies have shown that volunteer programs boost productivity, increase employee engagement, and improve hiring and retention. Develop your corporate volunteer program with TEEI. Employees can support Ukraine by volunteering in one of our programs, becoming a mentor or signing up for "Language Connect for Ukraine".
        </div>
    </div>

    <div class="body-text" style="margin-top: 30px;">
        Besides giving a direct way to help Ukraine to all our valuable partners and sponsors, we also highlight all partners on our web page, social media, partner newsletter and marketing channels.
    </div>

    <img src="${teeiLogoDark}" alt="TEEI" class="page-footer">
</div>

<!-- PAGE 8: BACK COVER -->
<div class="page back-cover">
    <img src="${togetherUkraineLogo}" alt="Together for Ukraine" class="back-logo">

    <div class="back-title serif">
        We are looking for more partners<br>
        and supporters to work with us.
    </div>

    <div class="back-subtitle">
        Partnering with Together for Ukraine will have a strong impact on<br>
        the future of Ukraine and its people.
    </div>

    <div class="contact-info">
        Phone: +47 408 94 846 +1 (844) 445-1367 | Email: contact@theeducationalequalityinstitute.org
    </div>

    <div class="partners-label">OUR MAIN PARTNERS:</div>

    <div class="partner-grid">
        <div class="partner-logo-card">
            <img src="${googleLogo}" alt="Google" class="partner-logo-img">
        </div>

        <div class="partner-logo-card">
            <div class="partner-logo-text">Kintell</div>
        </div>

        <div class="partner-logo-card">
            <div class="partner-logo-text">Babbel</div>
        </div>

        <div class="partner-logo-card">
            <div class="partner-logo-text">Sanoma</div>
        </div>

        <div class="partner-logo-card">
            <img src="${oxfordLogo}" alt="Oxford University Press" class="partner-logo-img">
        </div>

        <div class="partner-logo-card">
            <img src="${awsLogo}" alt="AWS" class="partner-logo-img">
        </div>

        <div class="partner-logo-card">
            <img src="${cornellLogo}" alt="Cornell" class="partner-logo-img">
        </div>

        <div class="partner-logo-card">
            <div class="partner-logo-text">INCO</div>
        </div>

        <div class="partner-logo-card">
            <div class="partner-logo-text">Bain & Co</div>
        </div>
    </div>

    <img src="${teeiLogoWhite}" alt="TEEI" class="page-footer-center">
</div>

</body>
</html>
`;

async function createFullUkrainePDF() {
    console.log('\n' + '='.repeat(80));
    console.log('TOGETHER FOR UKRAINE - COMPLETE 8-PAGE PDF');
    console.log('Full recreation with real partner logos');
    console.log('='.repeat(80) + '\n');

    console.log('[1/4] Launching browser...');
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();

    console.log('[2/4] Rendering 8-page HTML...');
    await page.setContent(html);
    await page.waitForTimeout(2000);  // Wait for all images to load

    const outputPathHTML = path.join(__dirname, 'exports', 'Together-for-Ukraine-FULL-8-PAGES.html');
    const outputPathPDF = path.join(__dirname, 'exports', 'Together-for-Ukraine-FULL-8-PAGES.pdf');

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
    console.log('8-PAGE PDF CREATED');
    console.log('='.repeat(80));
    console.log(`\nPDF: ${outputPathPDF}`);
    console.log(`HTML: ${outputPathHTML}`);
    console.log(`Size: ${fileSizeKB} KB`);
    console.log('\nPages:');
    console.log('  1. Cover');
    console.log('  2. About Us');
    console.log('  3. Our Programs (Part 1)');
    console.log('  4. Our Programs (Part 2)');
    console.log('  5. Youth Programs');
    console.log('  6. Other Programs');
    console.log('  7. Support Together for Ukraine');
    console.log('  8. Back Cover (with partner logos)');
    console.log('\nPartner Logos:');
    console.log('  ✓ Google (real SVG)');
    console.log('  ✓ AWS (real SVG)');
    console.log('  ✓ Cornell (real SVG)');
    console.log('  ✓ Oxford (real SVG)');
    console.log('  ⚠ Kintell, Babbel, Sanoma, INCO, Bain & Co (text fallback)');
    console.log('\n[4/4] Opening PDF...\n');

    require('child_process').exec(`start "" "${outputPathPDF}"`);
}

createFullUkrainePDF().catch(console.error);
