/**
 * Create an Amazing TEEI AWS Partnership PDF
 *
 * This script orchestrates the creation of a world-class PDF using:
 * - OpenAI for hero image generation
 * - Unsplash for authentic photography
 * - TEEI brand standards (Nordshore, Sky, Sand, Gold colors)
 * - Lora and Roboto Flex typography
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// Load environment
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

// TEEI Brand Colors
const TEEI_COLORS = {
  nordshore: '#00393F',  // Deep teal (primary)
  sky: '#C9E4EC',        // Light blue
  sand: '#FFF1E2',       // Warm neutral
  beige: '#EFE1DC',      // Soft neutral
  moss: '#65873B',       // Green accent
  gold: '#BA8F5A',       // Warm metallic
  clay: '#913B2F'        // Terracotta
};

/**
 * Generate hero image with OpenAI DALL-E 3
 */
async function generateHeroImage() {
  console.log('\n🎨 [IMAGE] Generating hero image with OpenAI DALL-E 3...');

  const prompt = `A warm, authentic photograph of diverse students collaborating on laptops in a modern, bright learning space. Natural golden hour lighting streaming through windows, creating a hopeful and empowering atmosphere. Color palette: deep teal (#00393F) and warm beige (#FFF1E2) tones. The scene shows genuine connection and engagement, with students of different backgrounds working together. Professional photography style, photorealistic, high detail, 300 DPI quality. Wide angle shot, bright and optimistic mood.`;

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ [IMAGE] OpenAI API key not configured');
    return null;
  }

  const payload = JSON.stringify({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1792x1024',
    quality: 'hd',
    style: 'natural'
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 60000
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', async () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          const imageUrl = result.data[0].url;
          const revisedPrompt = result.data[0].revised_prompt;

          console.log('✅ [IMAGE] Hero image generated successfully');
          console.log(`📝 [IMAGE] Revised prompt: ${revisedPrompt.substring(0, 100)}...`);
          console.log(`🔗 [IMAGE] URL: ${imageUrl}`);

          // Download image
          const imagePath = path.join(__dirname, '../assets/images/hero-teei-aws.png');
          await downloadImage(imageUrl, imagePath);

          resolve({
            url: imageUrl,
            path: imagePath,
            revisedPrompt,
            cost: 0.12 // DALL-E 3 HD 1792x1024
          });
        } else {
          console.error(`❌ [IMAGE] Generation failed: ${res.statusCode}`);
          console.error(data);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ [IMAGE] Request error:', error.message);
      resolve(null);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error('❌ [IMAGE] Request timeout');
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Download image from URL
 */
async function downloadImage(url, filepath) {
  const dir = path.dirname(filepath);
  await fs.mkdir(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const fileStream = require('fs').createWriteStream(filepath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`💾 [IMAGE] Saved to ${filepath}`);
        resolve(filepath);
      });
    }).on('error', (err) => {
      console.error('❌ [IMAGE] Download error:', err.message);
      reject(err);
    });
  });
}

/**
 * Search Unsplash for section images
 */
async function searchUnsplash(query, color = null) {
  console.log(`\n📸 [UNSPLASH] Searching for: "${query}"...`);

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.error('❌ [UNSPLASH] Access key not configured');
    return null;
  }

  let queryParams = `query=${encodeURIComponent(query)}&orientation=landscape&per_page=3`;
  if (color) {
    queryParams += `&color=${color}`;
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.unsplash.com',
      port: 443,
      path: `/search/photos?${queryParams}`,
      method: 'GET',
      headers: {
        'Authorization': `Client-ID ${accessKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);

          if (result.results && result.results.length > 0) {
            const photo = result.results[0];
            console.log(`✅ [UNSPLASH] Found photo by ${photo.user.name}`);
            console.log(`📷 [UNSPLASH] ${photo.description || photo.alt_description}`);

            resolve({
              url: photo.urls.regular,
              downloadUrl: photo.links.download_location,
              photographer: photo.user.name,
              photographerUrl: photo.user.links.html,
              description: photo.description || photo.alt_description
            });
          } else {
            console.log('⚠️  [UNSPLASH] No photos found');
            resolve(null);
          }
        } else {
          console.error(`❌ [UNSPLASH] Search failed: ${res.statusCode}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ [UNSPLASH] Request error:', error.message);
      resolve(null);
    });

    req.end();
  });
}

/**
 * Create HTML version of the PDF (for preview/fallback)
 */
async function createHTML(data) {
  console.log('\n📄 [HTML] Creating HTML version...');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Roboto+Flex:wght@400;500&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Roboto Flex', sans-serif;
      line-height: 1.6;
      color: #333;
      background: ${TEEI_COLORS.sand};
    }

    .page {
      width: 8.5in;
      min-height: 11in;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .hero {
      position: relative;
      height: 4in;
      background: linear-gradient(135deg, ${TEEI_COLORS.nordshore} 0%, ${TEEI_COLORS.sky} 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      color: white;
    }

    .hero-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.3;
    }

    .hero-content {
      position: relative;
      z-index: 2;
    }

    h1 {
      font-family: 'Lora', serif;
      font-size: 48pt;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .subtitle {
      font-family: 'Roboto Flex', sans-serif;
      font-size: 24pt;
      font-weight: 400;
      opacity: 0.95;
    }

    .content {
      padding: 2rem 2.5rem;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin: 2rem 0;
      padding: 2rem 0;
      border-top: 3px solid ${TEEI_COLORS.nordshore};
      border-bottom: 3px solid ${TEEI_COLORS.nordshore};
    }

    .metric {
      text-align: center;
    }

    .metric-value {
      font-family: 'Lora', serif;
      font-size: 42pt;
      font-weight: 700;
      color: ${TEEI_COLORS.gold};
      display: block;
      margin-bottom: 0.25rem;
    }

    .metric-label {
      font-size: 14pt;
      color: ${TEEI_COLORS.nordshore};
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    h2 {
      font-family: 'Lora', serif;
      font-size: 28pt;
      font-weight: 600;
      color: ${TEEI_COLORS.nordshore};
      margin: 2rem 0 1rem 0;
    }

    p {
      font-size: 11pt;
      line-height: 1.7;
      margin-bottom: 1rem;
      color: #333;
    }

    .cta {
      background: ${TEEI_COLORS.nordshore};
      color: white;
      padding: 2rem;
      margin: 2rem 0;
      border-radius: 8px;
      text-align: center;
    }

    .cta h2 {
      color: white;
      margin: 0 0 0.5rem 0;
    }

    .cta p {
      color: white;
      opacity: 0.95;
      margin-bottom: 1rem;
    }

    .cta-contact {
      font-size: 14pt;
      font-weight: 500;
      color: ${TEEI_COLORS.gold};
    }

    .footer {
      background: ${TEEI_COLORS.sand};
      padding: 1.5rem 2.5rem;
      text-align: center;
      font-size: 9pt;
      color: #666;
      border-top: 1px solid #ddd;
    }

    @media print {
      body {
        background: white;
      }

      .page {
        width: 100%;
        margin: 0;
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="hero">
      ${data.heroImage ? `<img src="${data.heroImage}" alt="Hero" class="hero-image">` : ''}
      <div class="hero-content">
        <h1>${data.title}</h1>
        <div class="subtitle">${data.subtitle}</div>
      </div>
    </div>

    <div class="content">
      <div class="metrics">
        <div class="metric">
          <span class="metric-value">${data.metrics.studentsReached}</span>
          <span class="metric-label">Students Reached</span>
        </div>
        <div class="metric">
          <span class="metric-value">${data.metrics.partnersEngaged}</span>
          <span class="metric-label">Partners Engaged</span>
        </div>
        <div class="metric">
          <span class="metric-value">${data.metrics.programsActive}</span>
          <span class="metric-label">Programs Active</span>
        </div>
      </div>

      ${data.sections.map(section => `
        <h2>${section.heading}</h2>
        <p>${section.content}</p>
      `).join('')}

      <div class="cta">
        <h2>${data.callToAction.heading}</h2>
        <p>${data.callToAction.text}</p>
        <div class="cta-contact">${data.callToAction.contact}</div>
      </div>
    </div>

    <div class="footer">
      <p>The Educational Equality Institute • ${new Date().getFullYear()}</p>
      <p>Generated with PDF Orchestrator</p>
    </div>
  </div>
</body>
</html>
  `;

  const htmlPath = path.join(__dirname, '../exports/teei-aws-partnership-amazing.html');
  await fs.writeFile(htmlPath, html, 'utf8');

  console.log(`✅ [HTML] Saved to ${htmlPath}`);
  console.log(`🌐 [HTML] Open in browser: file:///${htmlPath.replace(/\\/g, '/')}`);

  return htmlPath;
}

/**
 * Main execution
 */
async function main() {
  console.log('═'.repeat(80));
  console.log('🎨 PDF Orchestrator - Creating Amazing TEEI AWS Partnership PDF');
  console.log('═'.repeat(80));

  const startTime = Date.now();

  // Document data
  const documentData = {
    title: 'TEEI AWS Partnership',
    subtitle: 'Together for Ukraine Program Overview',
    partnerName: 'Amazon Web Services',
    programName: 'Together for Ukraine',
    metrics: {
      studentsReached: 850,
      partnersEngaged: 12,
      programsActive: 3
    },
    sections: [
      {
        heading: 'About TEEI',
        content: 'The Educational Equality Institute works to provide quality education access to underserved communities worldwide. Through innovative partnerships and technology-driven solutions, we\'re breaking down barriers to education and creating opportunities for students who need them most.'
      },
      {
        heading: 'Together for Ukraine',
        content: 'Our flagship program supporting displaced Ukrainian students with access to online learning resources, technology equipment, and educational support services. Partnering with AWS provides the cloud infrastructure that powers our learning platform, enabling reliable, secure access to educational resources for students across Europe.'
      },
      {
        heading: 'Partnership Impact',
        content: 'With AWS cloud services, we\'ve scaled our platform to serve 850+ students across 12 partner organizations in 8 countries. The partnership enables reliable, secure access to educational resources, real-time collaboration tools, and adaptive learning systems that meet each student where they are. Together, we\'re not just providing education—we\'re building hope and opportunity for the future.'
      }
    ],
    callToAction: {
      heading: 'Ready to Partner with TEEI?',
      text: 'Join us in transforming educational access for underserved communities worldwide. Together, we can make quality education a reality for every student.',
      contact: 'partnerships@theeducationalequalityinstitute.org'
    }
  };

  let totalCost = 0;

  // Step 1: Generate hero image
  const heroImage = await generateHeroImage();
  if (heroImage) {
    documentData.heroImage = heroImage.path;
    totalCost += heroImage.cost;
  }

  // Step 2: Search for section images (optional)
  const sectionImage = await searchUnsplash('students learning technology', 'blue');
  if (sectionImage) {
    console.log(`📷 [UNSPLASH] Photo by ${sectionImage.photographer}`);
  }

  // Step 3: Create HTML version
  const htmlPath = await createHTML(documentData);

  // Calculate total time
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('✅ DOCUMENT CREATED SUCCESSFULLY');
  console.log('═'.repeat(80));
  console.log(`⏱️  Total Time: ${duration}s`);
  console.log(`💰 Total Cost: $${totalCost.toFixed(2)}`);
  console.log(`📄 HTML Version: ${htmlPath}`);
  console.log(`🎨 Hero Image: ${heroImage ? heroImage.path : 'Not generated'}`);
  console.log('═'.repeat(80));
  console.log('\n📝 Next Steps:');
  console.log('1. Open HTML file in browser to preview');
  console.log('2. Print to PDF (⌘+P / Ctrl+P) with these settings:');
  console.log('   - Paper size: Letter (8.5 x 11 inches)');
  console.log('   - Margins: None');
  console.log('   - Background graphics: Enabled');
  console.log('3. Save as: teei-aws-partnership-amazing.pdf');
  console.log('');
}

// Run
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ ERROR:', error);
    process.exit(1);
  });
}

module.exports = { generateHeroImage, searchUnsplash, createHTML };
