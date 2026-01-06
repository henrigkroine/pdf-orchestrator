#!/usr/bin/env node
/**
 * Test python-docx template with EXACT field matching
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

async function uploadAsset(filePathOrBuffer, mediaType) {
  let fileBuffer, fileStats;

  if (Buffer.isBuffer(filePathOrBuffer)) {
    fileBuffer = filePathOrBuffer;
    fileStats = { size: fileBuffer.length };
  } else {
    fileStats = fs.statSync(filePathOrBuffer);
    fileBuffer = fs.readFileSync(filePathOrBuffer);
  }

  console.log(`  Uploading ${Buffer.isBuffer(filePathOrBuffer) ? 'data buffer' : path.basename(filePathOrBuffer)} (${fileStats.size} bytes)...`);

  // Create upload URL
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
    req.write(JSON.stringify({ mediaType }));
    req.end();
  });

  // Upload file
  const uploadUrl = new URL(assetInfo.uploadUri);
  await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: uploadUrl.hostname,
      path: uploadUrl.pathname + uploadUrl.search,
      method: 'PUT',
      headers: {
        'Content-Type': mediaType,
        'Content-Length': fileStats.size
      }
    }, (res) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => reject(new Error(`Upload failed: ${res.statusCode} ${data}`)));
      }
    });
    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });

  console.log(`  Asset ID: ${assetInfo.assetID}`);
  return assetInfo.assetID;
}

async function testExactMatch() {
  console.log('[TEST] python-docx template with EXACT field matching\n');

  // Upload template
  const templatePath = path.join(__dirname, '../templates/word/teei-exact-match-test.docx');
  console.log('[1/5] Uploading template...');
  const templateAssetId = await uploadAsset(
    templatePath,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );

  // Create test data - EXACTLY matching template fields
  const testData = {
    title: 'TEEI Partnership Showcase',
    subtitle: 'Revolutionizing Education Through AI'
  };

  console.log('\n[2/5] Uploading test data...');
  console.log('  Data:', JSON.stringify(testData, null, 2));
  const dataAssetId = await uploadAsset(
    Buffer.from(JSON.stringify(testData)),
    'application/json'
  );

  // Create generation job
  console.log('\n[3/5] Creating PDF generation job...');
  const requestBody = {
    assetID: templateAssetId,
    jsonDataForMerge: { assetID: dataAssetId },
    outputFormat: 'pdf'
  };

  const jobResponse = await new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'pdf-services.adobe.io',
      path: '/operation/documentgeneration',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ADOBE_ACCESS_TOKEN}`,
        'x-api-key': process.env.ADOBE_CLIENT_ID,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        if (res.statusCode === 201) {
          // Job ID is in location header
          const location = res.headers['location'] || res.headers['x-request-id'];
          resolve({ jobId: location, headers: res.headers });
        } else {
          reject(new Error(`Job creation failed: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(requestBody));
    req.end();
  });

  console.log(`  Job ID: ${jobResponse.jobId}`);

  // Poll for completion
  console.log('\n[4/5] Waiting for PDF generation...');
  let pdfUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const status = await new Promise((resolve, reject) => {
      https.request({
        hostname: 'pdf-services.adobe.io',
        path: `/operation/documentgeneration/${jobResponse.jobId}/status`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.ADOBE_ACCESS_TOKEN}`,
          'x-api-key': process.env.ADOBE_CLIENT_ID
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            resolve({ status: 'error', message: data });
          }
        });
      }).on('error', reject).end();
    });

    console.log(`  Status: ${status.status}`);

    if (status.status === 'done') {
      pdfUrl = status.asset.downloadUri;
      break;
    } else if (status.status === 'failed') {
      throw new Error('PDF generation failed: ' + JSON.stringify(status));
    }
  }

  if (!pdfUrl) {
    throw new Error('PDF generation timeout');
  }

  // Download PDF
  console.log('\n[5/5] Downloading PDF...');
  const outputPath = path.join(__dirname, '../exports/exact-match-test.pdf');

  await new Promise((resolve, reject) => {
    https.get(pdfUrl, (res) => {
      const fileStream = fs.createWriteStream(outputPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });

  console.log(`  Saved: ${outputPath}`);

  // Verify content
  console.log('\n[VERIFICATION] Checking PDF content...');
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(outputPath);
  const pdfData = await pdfParse(dataBuffer);

  console.log('First 500 chars of PDF:');
  console.log('='.repeat(50));
  console.log(pdfData.text.substring(0, 500));
  console.log('='.repeat(50));

  const hasTitle = pdfData.text.includes('TEEI Partnership Showcase');
  const hasSubtitle = pdfData.text.includes('Revolutionizing Education Through AI');
  const hasTemplateFields = pdfData.text.includes('{{title}}') || pdfData.text.includes('{{subtitle}}');

  console.log('\nResults:');
  console.log(`  Title merged: ${hasTitle ? 'YES' : 'NO'}`);
  console.log(`  Subtitle merged: ${hasSubtitle ? 'YES' : 'NO'}`);
  console.log(`  Template fields visible: ${hasTemplateFields ? 'YES (FAIL)' : 'NO (GOOD)'}`);

  if (hasTitle && hasSubtitle && !hasTemplateFields) {
    console.log('\n[SUCCESS] python-docx template works with exact field matching!');
    return true;
  } else {
    console.log('\n[FAILURE] Data merge did not work correctly');
    return false;
  }
}

testExactMatch().catch(err => {
  console.error('\n[ERROR]', err.message);
  process.exit(1);
});
