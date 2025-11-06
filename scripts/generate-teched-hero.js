/**
 * Generate TECH-Ed Curriculum hero image using OpenAI DALL-E 3
 * Professional development theme with TEEI brand colors
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load OpenAI API key
const apiKeyPath = 'T:\\Secrets\\openai\\openai key.txt';
const apiKey = fs.readFileSync(apiKeyPath, 'utf-8').trim();

const openai = new OpenAI({
  apiKey: apiKey
});

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function generateHeroImage() {
  console.log('🎨 Generating TECH-Ed Curriculum hero image...\n');

  const prompt = `
    Professional photograph of diverse adult educators in a modern professional development workshop,
    collaborating around laptops and tablets in a bright, contemporary training room.

    Natural daylight streaming through large windows, creating an energetic yet professional atmosphere.
    The scene shows teachers engaged with educational technology - some taking notes, others
    discussing digital tools, with presentation screens visible in the background.

    Color palette: deep teal (#00393F Nordshore) and warm beige (#FFF1E2 Sand) tones,
    with hints of sky blue (#C9E4EC).

    Professional corporate photography style, photorealistic, high detail, 300 DPI quality.
    Wide angle shot capturing the collaborative energy of professional learning.
    Bright, optimistic, and forward-thinking mood. No text or logos.
  `.trim();

  console.log('📝 Prompt:');
  console.log(prompt);
  console.log('\n⏳ Generating with DALL-E 3 HD...');
  console.log('💰 Cost: $0.12\n');

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024',
      quality: 'hd'
    });

    const imageUrl = response.data[0].url;
    const filepath = path.join(projectRoot, 'assets', 'images', 'hero-teched-curriculum.jpg');

    // Ensure directory exists
    const assetsDir = path.join(projectRoot, 'assets', 'images');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    console.log('⬇️  Downloading from:', imageUrl);
    await downloadImage(imageUrl, filepath);
    console.log(`✅ Hero image saved: ${filepath}`);
    console.log(`\n🎨 Image specifications:`);
    console.log(`   Size: 1792×1024px (HD)`);
    console.log(`   Format: JPG`);
    console.log(`   Cost: $0.12`);
    console.log(`   Brand colors: Nordshore #00393F, Sky #C9E4EC, Sand #FFF1E2`);
    console.log(`   Theme: Professional development / educator training`);

    return filepath;
  } catch (error) {
    console.error('❌ Error generating image:', error.message);
    throw error;
  }
}

generateHeroImage();
