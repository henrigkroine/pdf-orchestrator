/**
 * Generate mentorship platform images using OpenAI DALL-E 3
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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

async function generateImages() {
  console.log('🎨 Generating mentorship platform images...\n');

  const images = [
    {
      name: 'mentorship-hero.jpg',
      prompt: 'Professional photo of two women having a mentorship conversation in a modern bright office with white walls and large windows, sitting in comfortable chairs around a coffee table with a stylish lamp, natural daylight, warm authentic moment, photorealistic, high quality'
    },
    {
      name: 'mentorship-desk.jpg',
      prompt: 'Top-down view of a person working at a wooden desk with laptop and external monitor, headphones on, professional workspace, natural warm lighting, photorealistic, high quality'
    },
    {
      name: 'mentorship-team.jpg',
      prompt: 'Three diverse professionals collaborating around a laptop in a bright modern office with windows, natural daylight, friendly atmosphere, authentic moment, photorealistic, high quality'
    },
    {
      name: 'mentorship-hands.jpg',
      prompt: 'Close-up of six diverse hands coming together in a circle over a table with plants and coffee, teamwork and unity concept, natural warm lighting, authentic moment, photorealistic, high quality'
    }
  ];

  for (const img of images) {
    console.log(`\n📸 Generating: ${img.name}`);
    console.log(`   Prompt: ${img.prompt.substring(0, 60)}...`);

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: img.prompt,
        n: 1,
        size: '1792x1024',
        quality: 'hd'
      });

      const imageUrl = response.data[0].url;
      const filepath = path.join(projectRoot, 'assets', 'images', img.name);

      console.log(`   ⬇️  Downloading...`);
      await downloadImage(imageUrl, filepath);
      console.log(`   ✅ Saved: ${img.name}`);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n✅ All mentorship images generated!');
}

generateImages();
