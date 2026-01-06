#!/usr/bin/env node
/**
 * Upload Word template to Adobe PDF Services and get asset ID
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

async function uploadTemplate() {
  const templatePath = path.join(__dirname, '../templates/word/teei-showcase-template.docx');

  if (!fs.existsSync(templatePath)) {
    console.error('❌ Template not found:', templatePath);
    process.exit(1);
  }

  const fileStats = fs.statSync(templatePath);
  const fileBuffer = fs.readFileSync(templatePath);

  console.log('📤 Uploading template to Adobe PDF Services...');
  console.log(`   File: ${path.basename(templatePath)}`);
  console.log(`   Size: ${(fileStats.size / 1024).toFixed(2)} KB`);

  // Step 1: Create upload URL
  const uploadOptions = {
    hostname: 'pdf-services.adobe.io',
    path: '/assets',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ADOBE_ACCESS_TOKEN}`,
      'x-api-key': process.env.ADOBE_CLIENT_ID,
      'Content-Type': 'application/json'
    }
  };

  const assetInfo = await new Promise((resolve, reject) => {
    const req = https.request(uploadOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Upload URL creation failed: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify({
      mediaType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }));
    req.end();
  });

  console.log('✓ Upload URL created');

  // Step 2: Upload file to URL
  const uploadUrl = new URL(assetInfo.uploadUri);
  const uploadFileOptions = {
    hostname: uploadUrl.hostname,
    path: uploadUrl.pathname + uploadUrl.search,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Length': fileStats.size
    }
  };

  await new Promise((resolve, reject) => {
    const req = https.request(uploadFileOptions, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => reject(new Error(`File upload failed: ${res.statusCode} ${data}`)));
      }
    });
    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });

  console.log('✓ File uploaded');
  console.log('\n📋 Template Asset ID:', assetInfo.assetID);
  console.log('\nAdd this to your job or template registry:');
  console.log(`  "templateAssetId": "${assetInfo.assetID}"`);

  return assetInfo.assetID;
}

uploadTemplate().catch(err => {
  console.error('❌ Upload failed:', err.message);
  process.exit(1);
});
