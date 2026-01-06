/**
 * DALL-E Image Generation MCP Flow
 *
 * Generates AI images for designated slots in PDF documents using OpenAI's DALL-E API.
 * Non-blocking - failures gracefully degrade without stopping the pipeline.
 *
 * @module mcp-flows/dalle-image-generator
 */

const fs = require('fs');
const path = require('path');

/**
 * Run DALL-E image generation flow
 *
 * @param {Object} jobContext - Job configuration with aiImageSlots
 * @param {Object} mcpManager - MCP Manager instance
 * @returns {Promise<Object>} Flow result with status and generated images
 */
async function runDalleFlow(jobContext, mcpManager) {
  const startTime = Date.now();

  // Check if AI images are enabled
  const enabled = jobContext.mcpFeatures?.useAiImages || false;
  if (!enabled) {
    return {
      status: 'skipped',
      reason: 'not_enabled',
      message: 'AI image generation not enabled in job config'
    };
  }

  // Check if DALL-E server is configured
  const serverStatus = mcpManager.getServerStatus('dalle');
  if (serverStatus.status === 'not_found') {
    console.log('[MCP Flow] DALL-E - Server not configured, skipping');
    return {
      status: 'skipped',
      reason: 'not_configured',
      message: 'DALL-E MCP server not found in configuration'
    };
  }

  // Check for required credentials
  const requiredEnv = process.env.OPENAI_API_KEY;
  if (!requiredEnv) {
    console.log('[MCP Flow] DALL-E - Missing OPENAI_API_KEY, skipping');
    return {
      status: 'skipped',
      reason: 'missing_credentials',
      message: 'OPENAI_API_KEY environment variable not set'
    };
  }

  try {
    console.log('[MCP Flow] DALL-E - RUNNING...');

    // Get AI image slots from job context
    const aiImageSlots = jobContext.data?.aiImageSlots || {};
    const slots = Object.keys(aiImageSlots);

    if (slots.length === 0) {
      console.log('[MCP Flow] DALL-E - No image slots defined, skipping');
      return {
        status: 'skipped',
        reason: 'no_slots_defined',
        message: 'No aiImageSlots defined in job data'
      };
    }

    console.log(`[MCP Flow] DALL-E - Found ${slots.length} image slots to generate`);

    const generatedImages = {};
    const errors = [];

    // Generate each image
    for (const slotName of slots) {
      const prompt = aiImageSlots[slotName];
      console.log(`[MCP Flow] DALL-E - Generating image for slot: ${slotName}`);
      console.log(`[MCP Flow] DALL-E - Prompt: "${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}"`);

      try {
        // Call DALL-E MCP server
        const result = await mcpManager.invoke('dalle', 'generate_image', {
          prompt: prompt,
          model: 'dall-e-3',
          quality: 'hd',
          size: '1792x1024', // Landscape format for document images
          style: 'natural'
        });

        if (result.status === 'success') {
          // Create output directory
          const imagePath = `assets/ai/${jobContext.jobId}/${slotName}.png`;
          const dir = path.dirname(imagePath);

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // Download and save image
          const imageUrl = result.data.url || result.data.image_url;

          // If we have a URL, fetch and save
          if (imageUrl) {
            const response = await fetch(imageUrl);
            const buffer = await response.buffer();
            fs.writeFileSync(imagePath, buffer);

            generatedImages[slotName] = {
              path: imagePath,
              url: imageUrl,
              prompt: prompt,
              model: 'dall-e-3',
              size: '1792x1024'
            };

            console.log(`[MCP Flow] DALL-E - ✅ Saved: ${imagePath}`);
          }
          // If we have base64 data instead
          else if (result.data.b64_json) {
            const imageBuffer = Buffer.from(result.data.b64_json, 'base64');
            fs.writeFileSync(imagePath, imageBuffer);

            generatedImages[slotName] = {
              path: imagePath,
              base64: true,
              prompt: prompt,
              model: 'dall-e-3',
              size: '1792x1024'
            };

            console.log(`[MCP Flow] DALL-E - ✅ Saved: ${imagePath} (from base64)`);
          } else {
            throw new Error('No image URL or base64 data in response');
          }
        } else {
          const errorMsg = result.message || 'Generation failed';
          console.error(`[MCP Flow] DALL-E - ❌ Generation failed for ${slotName}: ${errorMsg}`);
          errors.push({ slot: slotName, error: errorMsg });
        }
      } catch (slotError) {
        console.error(`[MCP Flow] DALL-E - ❌ Error generating ${slotName}: ${slotError.message}`);
        errors.push({ slot: slotName, error: slotError.message });
        // Continue with other slots - non-blocking
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Determine overall status
    const successCount = Object.keys(generatedImages).length;
    const status = successCount > 0 ? 'success' : 'error';

    console.log(`[MCP Flow] DALL-E - ${status.toUpperCase()}: ${successCount}/${slots.length} images generated in ${duration}s`);

    return {
      status: status,
      data: {
        generatedImages: generatedImages,
        slotsProcessed: slots.length,
        slotsSucceeded: successCount,
        slotsFailed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        duration_seconds: parseFloat(duration)
      }
    };

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.error(`[MCP Flow] DALL-E - ERROR: ${error.message}`);

    return {
      status: 'error',
      error: error.message,
      duration_seconds: parseFloat(duration)
    };
  }
}

module.exports = { runDalleFlow };
