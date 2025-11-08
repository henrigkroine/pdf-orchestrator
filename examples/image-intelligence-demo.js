#!/usr/bin/env node
/**
 * IMAGE INTELLIGENCE DEMONSTRATION
 * Complete walkthrough of all image automation features
 */

const ImageIntelligence = require('../image-intelligence.js');
const path = require('path');
const fs = require('fs').promises;

async function runDemo() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║       IMAGE INTELLIGENCE ENGINE - DEMONSTRATION           ║
║              TEEI Brand Compliance System                 ║
╚═══════════════════════════════════════════════════════════╝
`);

  const imageAI = new ImageIntelligence();

  // Demo images
  const assetsDir = path.join(__dirname, '..', 'assets', 'images');
  const heroImage = path.join(assetsDir, 'hero-teei-aws.png');
  const logo = path.join(assetsDir, 'teei-logo-dark.png');
  const mentorshipImage = path.join(assetsDir, 'mentorship-hero.jpg');

  // ============================================================
  // DEMO 1: INTELLIGENT IMAGE SIZING
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('DEMO 1: INTELLIGENT IMAGE SIZING & PLACEMENT');
  console.log('='.repeat(60));

  try {
    // Letter size: 612 x 792 points (8.5 x 11 inches)
    // Hero frame: full width, half height
    const heroFrameWidth = 612;
    const heroFrameHeight = 396;

    console.log('\nSizing hero image for frame...');
    console.log(`Target: ${heroFrameWidth}x${heroFrameHeight}px (Letter half-page)`);

    const sized = await imageAI.placeImageInFrame(
      heroImage,
      heroFrameWidth,
      heroFrameHeight,
      {
        fit: 'cover',          // Fill frame, maintain aspect
        position: 'center',    // Center positioning
        smartPosition: false,  // Use center (golden ratio requires more time)
        brandGrading: true,    // Apply TEEI warm color grading
        quality: imageAI.qualityPresets.digital
      }
    );

    const outputPath = path.join(imageAI.outputDir, 'demo-sized-hero.jpg');
    await fs.writeFile(outputPath, sized);

    console.log(`✅ Hero sized and saved: ${outputPath}`);
    console.log(`   Resolution: ${heroFrameWidth}x${heroFrameHeight}px`);
    console.log(`   Format: JPEG (150 DPI digital)`);
    console.log(`   Brand grading: Applied (warm tones)`);

  } catch (error) {
    console.error(`❌ Demo 1 failed: ${error.message}`);
  }

  // ============================================================
  // DEMO 2: LOGO CLEARSPACE ENFORCEMENT
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('DEMO 2: LOGO CLEARSPACE ENFORCEMENT');
  console.log('='.repeat(60));

  try {
    console.log('\nCalculating TEEI logo clearspace...');
    console.log('Per TEEI brand guidelines: clearspace = logo height');

    const clearspace = await imageAI.calculateLogoClearspace(
      logo,
      { createGuide: true }  // Generate visual guide
    );

    console.log(`\n✅ Clearspace calculated:`);
    console.log(`   Minimum: ${clearspace.minimum}px on all sides`);
    console.log(`   Recommended: ${clearspace.recommended}px (extra safety)`);

    if (clearspace.guidePath) {
      console.log(`   Visual guide: ${clearspace.guidePath}`);
    }

    // Validate clearspace in layout
    console.log('\nValidating clearspace in document layout...');

    const logoPosition = { x: 100, y: 100, width: 150, height: 75 };
    const otherElements = [
      { name: 'Header Text', x: 50, y: 50, width: 200, height: 30 },
      { name: 'Hero Image', x: 0, y: 200, width: 612, height: 396 }
    ];

    const validation = await imageAI.validateClearspace(
      logoPosition,
      otherElements,
      clearspace
    );

    if (validation.valid) {
      console.log('✅ No clearspace violations detected');
    } else {
      console.log(`❌ ${validation.violations.length} violation(s):`);
      validation.violations.forEach(v => {
        console.log(`   - ${v.element}: ${v.suggestion}`);
      });
    }

  } catch (error) {
    console.error(`❌ Demo 2 failed: ${error.message}`);
  }

  // ============================================================
  // DEMO 3: BRAND COLOR OVERLAY
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('DEMO 3: BRAND COLOR OVERLAY');
  console.log('='.repeat(60));

  try {
    console.log('\nApplying Nordshore overlay for text readability...');
    console.log('Color: Nordshore (#00393F - TEEI primary brand color)');
    console.log('Opacity: 40% (recommended for hero images)');

    const overlaid = await imageAI.applyBrandOverlay(
      mentorshipImage,
      'nordshore',
      0.4
    );

    console.log(`\n✅ Overlay applied: ${overlaid.path}`);
    console.log(`   Original: ${mentorshipImage}`);
    console.log(`   Color: ${overlaid.color.name} (${overlaid.color.hex})`);
    console.log(`   Opacity: ${overlaid.opacity * 100}%`);
    console.log(`   Use case: Place white text over this image for hero sections`);

  } catch (error) {
    console.error(`❌ Demo 3 failed: ${error.message}`);
  }

  // ============================================================
  // DEMO 4: INTELLIGENT CROPPING
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('DEMO 4: INTELLIGENT CROPPING');
  console.log('='.repeat(60));

  try {
    console.log('\nCropping using Golden Ratio (phi = 1.618)...');
    console.log('Creates naturally pleasing proportions');

    const cropped = await imageAI.intelligentCrop(
      mentorshipImage,
      { strategy: 'golden-ratio' }
    );

    console.log(`\n✅ Image cropped: ${cropped.path}`);
    console.log(`   Strategy: ${cropped.strategy}`);
    console.log(`   Crop area: ${Math.round(cropped.cropArea.width)}x${Math.round(cropped.cropArea.height)}px`);
    console.log(`   Composition score: ${cropped.composition.score.toFixed(1)}/100`);

  } catch (error) {
    console.error(`❌ Demo 4 failed: ${error.message}`);
  }

  // ============================================================
  // DEMO 5: IMAGE QUALITY OPTIMIZATION
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('DEMO 5: IMAGE QUALITY OPTIMIZATION');
  console.log('='.repeat(60));

  try {
    console.log('\nOptimizing for print quality (300 DPI)...');

    const optimized = await imageAI.optimizeImageQuality(
      heroImage,
      'print',  // 300 DPI, PNG format
      { sharpen: true }
    );

    console.log(`\n✅ Image optimized: ${optimized.path}`);
    console.log(`   Preset: ${optimized.preset.description}`);
    console.log(`   Original size: ${(optimized.stats.originalSize / 1024).toFixed(1)} KB`);
    console.log(`   Optimized size: ${(optimized.stats.optimizedSize / 1024).toFixed(1)} KB`);
    console.log(`   Size reduction: ${optimized.stats.reduction}`);
    console.log(`   DPI: ${optimized.stats.dpi}`);
    console.log(`   Format: ${optimized.stats.format.toUpperCase()}`);

    // Show all quality presets
    console.log('\n📋 Available quality presets:');
    Object.entries(imageAI.qualityPresets).forEach(([name, preset]) => {
      console.log(`   ${name.padEnd(8)} - ${preset.description}`);
    });

  } catch (error) {
    console.error(`❌ Demo 5 failed: ${error.message}`);
  }

  // ============================================================
  // DEMO 6: BATCH PROCESSING
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('DEMO 6: BATCH IMAGE PROCESSING');
  console.log('='.repeat(60));

  try {
    const images = [
      path.join(assetsDir, 'mentorship-hero.jpg'),
      path.join(assetsDir, 'mentorship-hands.jpg'),
      path.join(assetsDir, 'mentorship-desk.jpg')
    ];

    // Filter to only existing images
    const existingImages = [];
    for (const img of images) {
      try {
        await fs.access(img);
        existingImages.push(img);
      } catch {
        console.log(`   Skipping ${path.basename(img)} (not found)`);
      }
    }

    if (existingImages.length > 0) {
      console.log(`\nBatch optimizing ${existingImages.length} images for digital use...`);

      const results = await imageAI.batchProcess(
        existingImages,
        'optimize',
        { targetUse: 'digital' }
      );

      const successCount = results.filter(r => r.success).length;
      console.log(`\n✅ Batch processing complete!`);
      console.log(`   Success: ${successCount}/${existingImages.length}`);

      results.forEach((r, i) => {
        if (r.success) {
          console.log(`   ${i + 1}. ${path.basename(r.original)} → ${r.result.stats.reduction} reduction`);
        }
      });
    } else {
      console.log('⚠️  No images found for batch processing demo');
    }

  } catch (error) {
    console.error(`❌ Demo 6 failed: ${error.message}`);
  }

  // ============================================================
  // DEMO 7: AI-POWERED HERO GENERATION (Optional - requires API key)
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('DEMO 7: AI-POWERED HERO IMAGE GENERATION');
  console.log('='.repeat(60));

  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('\nGenerating hero image with DALL-E 3...');
      console.log('Concept: "Students collaborating on educational technology"');
      console.log('Quality: HD (1792x1024)');
      console.log('Cost: $0.12');

      const generated = await imageAI.generateHeroImage(
        'Diverse students collaborating on educational technology projects in modern learning space',
        {
          size: '1792x1024',
          quality: 'hd',
          context: 'TEEI AWS partnership document',
          mood: 'hopeful, inspiring, empowering'
        }
      );

      console.log(`\n✅ Hero image generated!`);
      console.log(`   Original: ${generated.original.path}`);
      console.log(`   Print (300 DPI): ${generated.optimized.print}`);
      console.log(`   Digital (150 DPI): ${generated.optimized.digital}`);
      console.log(`   Web (72 DPI): ${generated.optimized.web}`);
      console.log(`   Cost: $${generated.metadata.cost}`);

    } catch (error) {
      console.error(`❌ Demo 7 failed: ${error.message}`);
    }
  } else {
    console.log('\n⚠️  Skipped: OPENAI_API_KEY not set');
    console.log('   Set environment variable to enable DALL-E 3 generation:');
    console.log('   export OPENAI_API_KEY="sk-..."');
  }

  // ============================================================
  // SUMMARY & STATISTICS
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY & STATISTICS');
  console.log('='.repeat(60));

  const stats = await imageAI.getStats();

  console.log('\n📊 Generated assets:');
  console.log(`   Hero images: ${stats.heroes}`);
  console.log(`   Optimized: ${stats.optimized}`);
  console.log(`   Overlays: ${stats.overlays}`);
  console.log(`   Total: ${stats.total}`);
  console.log(`\n📁 Output directory: ${stats.outputDir}`);

  console.log('\n✅ Demo complete!');
  console.log('\nNext steps:');
  console.log('1. Review generated images in: ' + stats.outputDir);
  console.log('2. Read full documentation: docs/IMAGE-INTELLIGENCE-GUIDE.md');
  console.log('3. Try CLI: node image-intelligence.js --help');
  console.log('4. Python integration: python3 image_automation.py example');

  console.log('\n' + '='.repeat(60));
}

// Run demo
runDemo().catch(error => {
  console.error('\n❌ Demo failed:', error.message);
  process.exit(1);
});
