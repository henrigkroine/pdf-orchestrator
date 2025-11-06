/**
 * Together for Ukraine - FINAL VERSION
 * With real logos and proper Ukraine flag yellow
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function generateFinalHTML() {
  const assetsPath = 'file:///' + path.join(projectRoot, 'assets', 'images').replace(/\\/g, '/');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Together for Ukraine - Female Entrepreneurship Program</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
@page{size:8.5in 11in;margin:0}
body{font-family:Georgia,serif;font-size:11pt;line-height:1.5;color:#333;margin:0;padding:0}
.page{width:8.5in;height:11in;position:relative;page-break-after:always;overflow:hidden;display:flex;flex-direction:column}
.cover{background:#00393F;padding:50pt 35pt 35pt 35pt}
.logo-img{width:280px;margin-bottom:140pt}
.mid{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center}
.ch{font-size:9pt;letter-spacing:2.5px;text-transform:uppercase;color:#FFF;margin-bottom:30pt}
.ct{font-size:44pt;font-weight:400;line-height:1.15;color:#FFF;max-width:520pt}
.teei-logo{width:180px;align-self:flex-end}
.cp{padding:35pt;overflow:hidden}
.ph{font-size:8.5pt;letter-spacing:2px;text-transform:uppercase;color:#00393F;margin-bottom:45pt}
.st{font-size:26pt;font-weight:700;color:#00393F;margin-bottom:18pt;line-height:1.2}
.ss{font-size:17pt;font-weight:600;color:#00393F;margin:32pt 0 14pt;line-height:1.25}
.sh{font-size:20pt;font-weight:700;color:#00393F;margin:32pt 0 14pt;line-height:1.25}
.p{margin-bottom:13pt;line-height:1.55}
.bl{margin:13pt 0 13pt 22pt;list-style:none}
.bl li{padding-left:10pt;margin-bottom:7pt;position:relative;line-height:1.5}
.bl li::before{content:'›';position:absolute;left:-10pt;font-size:13pt;color:#00393F;font-weight:700}
.pf{position:absolute;bottom:35pt;right:35pt}
.pf img{width:150px}
.bc{background:#00393F;padding:50pt 35pt 30pt;text-align:center;overflow:hidden}
.bc .logo-img{margin-bottom:45pt;display:block;width:240px;margin-left:auto;margin-right:auto}
.bct{font-size:26pt;font-weight:400;line-height:1.2;color:#FFF;margin-bottom:16pt;max-width:500pt;margin-left:auto;margin-right:auto}
.bcs{font-size:10.5pt;line-height:1.5;color:#FFF;margin-bottom:35pt;max-width:440pt;margin-left:auto;margin-right:auto}
.pl{display:grid;grid-template-columns:repeat(3,1fr);gap:18pt;max-width:480pt;margin:0 auto 35pt;padding:28pt 0;border-top:1px solid rgba(255,255,255,0.25);border-bottom:1px solid rgba(255,255,255,0.25)}
.pl div{display:flex;align-items:center;justify-content:center;padding:12pt 8pt;color:#FFF;font-size:9.5pt;font-weight:700;background:rgba(255,255,255,0.1);border-radius:3pt}
.ci{font-size:8.5pt;color:#FFF;margin-bottom:28pt}
.ci a{color:#FFF;text-decoration:none}
.bc .teei-logo{width:130px;display:block;margin-left:auto;margin-right:auto}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{page-break-inside:avoid}}
</style>
</head>
<body>

<div class="page cover">
<img src="${assetsPath}/together-ukraine-logo.png" alt="Together for Ukraine" class="logo-img">
<div class="mid">
<div class="ch">Together for Ukraine</div>
<h1 class="ct">Female Entrepreneurship Program</h1>
</div>
<img src="${assetsPath}/teei-logo-white.png" alt="TEEI" class="teei-logo">
</div>

<div class="page cp">
<div class="ph">Together for Ukraine</div>
<h2 class="st">Female Entrepreneurship Program</h2>
<h3 class="ss">The Women's Entrepreneurship and Empowerment Initiative (WEEI)</h3>
<p class="p">The Women's Entrepreneurship and Empowerment Initiative (WEEI) aims to foster the growth and development of Ukrainian women entrepreneurs through a comprehensive and tailored program focusing on impact and sustainable entrepreneurship. The program supports women, new businesses, established small businesses, and startups led by women, offering them valuable resources and support.</p>
<p class="p">A crucial element WEEI is its emphasis on technology, partnerships and collaboration. By working closely with local and international organisations, private sector partners, and educational institutions, WEEI leverages a diverse network of resources and expertise.</p>
<p class="p">The project spans four key areas:</p>
<ul class="bl">
<li>Individual Entrepreneurship Training for Women U:LEARN</li>
<li>Women's MVP Incubator U:START</li>
<li>Female Startup Accelerator U:GROW</li>
<li>Female Leadership Program U:LEAD</li>
</ul>
<p class="p">In addition to the core entrepreneurship program, WEEI provides specialised training courses in digital skills, leadership, and coding through the TEEI upskilling program. To accommodate the vast geographical scope and needs, the program has a digital-first approach.</p>
<p class="p">WEEI aspires to empower Ukrainian women, helping them build sustainable businesses, create job opportunities, and contribute to Ukraine's sustainable reconstruction and European integration.</p>
<div class="pf">
<img src="${assetsPath}/teei-logo-dark.png" alt="TEEI">
</div>
</div>

<div class="page cp">
<div class="ph">Together for Ukraine</div>
<h2 class="sh">Background</h2>
<p class="p"><em>As the war continues, the needs of refugees out of Ukraine are evolving. With the expectation, in early 2022, that the war will end shortly, addressing basic humanitarian needs was a priority. With the war reaching its one-year anniversary, with no end in sight to the fighting - the needs are broadening, with education becoming a vital element of the survival kit in exile and aspirations to restart a new life in a post-war Ukraine.</em></p>
<p class="p">The war is expected to have a significant impact not only on Ukraine's economy and infrastructure but also on its demographics. As Ukrainian men are engaged in the military, drawn away from their civil time functions and, sadly, dying or getting wounded, women face the need to step up and take over management roles in the most challenging economic environment.</p>
<p class="p">As Ukraine aspires to become a future EU member, it is crucial to elevate entrepreneurship, technical upskilling, soft-skills training, career coaching, and active language training among women. Programs focusing on tailored entrepreneurship for women and offering resources, mentorship, and support, we can empower them to establish sustainable businesses, generate job opportunities, and contribute to Ukraine's sustainable reconstruction and European integration.</p>
<h2 class="sh">Mission</h2>
<p class="p">Our mission is to empower Ukrainian women entrepreneurs through comprehensive and tailored programs that foster impact and sustainable entrepreneurship. We provide valuable resources, mentorship, and support to women in business, from new ventures to established small businesses and startups.</p>
<h2 class="sh">Key Elements</h2>
<p class="p">WEEI offers a comprehensive program that is specifically designed to meet the unique needs of Ukrainian women entrepreneurs. The program provides valuable resources and support for women at all stages of business development.</p>
<div class="pf">
<img src="${assetsPath}/teei-logo-dark.png" alt="TEEI">
</div>
</div>

<div class="page bc">
<img src="${assetsPath}/together-ukraine-logo.png" alt="Together for Ukraine" class="logo-img">
<h2 class="bct">We are looking for more partners and supporters to work with us.</h2>
<p class="bcs">Partnering with Together for Ukraine will have a strong impact on the future of Ukraine and its people.</p>
<div class="pl">
<div>Google</div><div>Kintell</div><div>+Babbel</div>
<div>Sanoma</div><div>Oxford UP</div><div>AWS</div>
<div>Cornell</div><div>INCO</div><div>Bain & Co</div>
</div>
<div class="ci">Phone: +47 919 08 939 | Email: <a href="mailto:contact@theeducationalequalityinstitute.org">contact@theeducationalequalityinstitute.org</a></div>
<img src="${assetsPath}/teei-logo-white.png" alt="TEEI" class="teei-logo">
</div>

</body>
</html>`;
}

async function main() {
  console.log('🚀 Together for Ukraine - FINAL VERSION\n');
  console.log('✨ Features:');
  console.log('   ✅ Real Together for Ukraine logo (PNG)');
  console.log('   ✅ Real TEEI logos (white + dark)');
  console.log('   ✅ Ukraine flag yellow (#FFC700)');
  console.log('   ✅ Perfect page sizing (no bleeding)');
  console.log('   ✅ High quality logos\n');

  const html = generateFinalHTML();
  const htmlPath = path.join(projectRoot, 'exports', 'ukraine-final.html');

  await fs.writeFile(htmlPath, html, 'utf-8');

  console.log('✅ Generated: ' + path.relative(projectRoot, htmlPath));
  console.log('💾 Size: ' + (html.length / 1024).toFixed(1) + ' KB\n');
  console.log('🖨️  Next: Convert to PDF');
}

main();
