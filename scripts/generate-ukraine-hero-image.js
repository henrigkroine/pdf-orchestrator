/**
 * Generate Together for Ukraine hero image using OpenAI DALL-E 3
 * With TEEI brand colors
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
  console.log('🎨 Generating Together for Ukraine hero image...\n');

  const prompt = `
    A warm, authentic photograph of diverse students collaborating on
    laptops in a modern, bright learning space. Natural golden hour
    lighting streaming through windows, creating a hopeful and empowering
    atmosphere.

    The scene shows genuine connection and engagement, with students of
    different backgrounds working together on education and language learning.

    Color palette: deep teal (#00393F Nordshore) and warm beige (#FFF1E2 Sand) tones.

    Professional photography style, photorealistic, high detail, 300 DPI quality.
    Wide angle shot, bright and optimistic mood. No text or logos.
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
    const filepath = path.join(projectRoot, 'assets', 'images', 'hero-ukraine-education.jpg');

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
    console.log(`   Brand colors: Nordshore #00393F, Sand #FFF1E2`);

    return filepath;
  } catch (error) {
    console.error('❌ Error generating image:', error.message);
    throw error;
  }
}

generateHeroImage();
