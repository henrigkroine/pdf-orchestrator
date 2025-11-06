/**
 * Create placeholder images for mentorship document
 * Using simple colored rectangles with text
 */

import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function createPlaceholder(width, height, text, color, filename) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // Save
  const filepath = path.join(projectRoot, 'assets', 'images', filename);
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
  fs.writeFileSync(filepath, buffer);

  console.log(`✅ Created: ${filename}`);
}

console.log('🎨 Creating placeholder images...\n');

createPlaceholder(1792, 1024, 'Mentorship Meeting', '#C9E4EC', 'mentorship-hero.jpg');
createPlaceholder(1792, 1024, 'Professional Workspace', '#FFF1E2', 'mentorship-desk.jpg');
createPlaceholder(1792, 1024, 'Team Collaboration', '#C9E4EC', 'mentorship-team.jpg');
createPlaceholder(1792, 1024, 'Unity & Teamwork', '#FFF1E2', 'mentorship-hands.jpg');

console.log('\n✅ All placeholder images created!');
