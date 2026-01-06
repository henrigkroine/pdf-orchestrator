#!/usr/bin/env node
/**
 * Test Adobe's official sample template to verify merge functionality works
 * This will prove whether the issue is with template format or API configuration
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
    req.write(JSON.stringify({ mediaType }));
    req.end();
  });

  // Step 2: Upload file
  const uploadUrl = new URL(assetInfo.uploadUri);
  const uploadFileOptions = {
    hostname: uploadUrl.hostname,
    path: uploadUrl.pathname + uploadUrl.search,
    method: 'PUT',
    headers: {
      'Content-Type': mediaType,
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

  return assetInfo.assetID;
}

async function testAdobeSample() {
  console.log('[TEST] Testing Adobe official sample template');
  console.log('[TEST] This will verify if merge works with properly formatted templates\n');

  // Upload template
  const templatePath = path.join(__dirname, '../templates/word/adobe-sample-test.docx');
  console.log('[1/4] Uploading template...');
  const templateAssetId = await uploadAsset(
    templatePath,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
  console.log('  Template Asset ID:', templateAssetId);

  // Create simple test data matching TEEI structure
  const testData = {
    title: 'TEEI Test Document',
    subtitle: 'Simple merge test with Adobe template'
  };

  console.log('\n[2/4] Uploading test data...');
  console.log('  Data:', JSON.stringify(testData, null, 2));
  
  // Upload data as JSON asset
  const dataAssetId = await uploadAsset(
    Buffer.from(JSON.stringify(testData)),
    'application/json'
  );
  console.log('  Data Asset ID:', dataAssetId);

  // Create generation job
  console.log('\n[3/4] Creating PDF generation job...');
  const jobOptions = {
    hostname: 'pdf-services.adobe.io',
    path: '/operation/documentgeneration',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ADOBE_ACCESS_TOKEN}`,
      'x-api-key': process.env.ADOBE_CLIENT_ID,
      'Content-Type': 'application/json'
    }
  };

  const requestBody = {
    assetID: templateAssetId,
    jsonDataForMerge: { assetID: dataAssetId },
    outputFormat: 'pdf'
  };

  const jobId = await new Promise((resolve, reject) => {
    const req = https.request(jobOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('  Response status:', res.statusCode);
        console.log('  Response headers:', JSON.stringify(res.headers, null, 2));
        
        if (res.statusCode === 201) {
          // Adobe returns job location in x-request-id header
          const location = res.headers['x-request-id'] || res.headers['location'];
          if (!location) {
            reject(new Error('No job ID in response headers'));
            return;
          }
          // x-request-id is the job ID directly
          resolve(location);
        } else {
          reject(new Error(`Job creation failed: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(requestBody));
    req.end();
  });

  console.log('  Job ID:', jobId);

  // Poll for completion
  console.log('\n[4/4] Waiting for PDF generation...');
  let pdfUrl = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const statusOptions = {
      hostname: 'pdf-services.adobe.io',
      path: `/operation/documentgeneration/${jobId}/status`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.ADOBE_ACCESS_TOKEN}`,
        'x-api-key': process.env.ADOBE_CLIENT_ID
      }
    };

    const status = await new Promise((resolve, reject) => {
      const req = https.request(statusOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.end();
    });

    if (status.status === 'done') {
      pdfUrl = status.asset.downloadUri;
      break;
    }
    process.stdout.write('.');
  }

  if (!pdfUrl) {
    throw new Error('PDF generation timed out');
  }

  // Download PDF
  console.log('\n  PDF generated successfully!');
  console.log('  Download URL:', pdfUrl);

  const outputPath = path.join(__dirname, '../exports/adobe-sample-test.pdf');
  const pdfFile = fs.createWriteStream(outputPath);
  
  await new Promise((resolve, reject) => {
    https.get(pdfUrl, (res) => {
      res.pipe(pdfFile);
      pdfFile.on('finish', () => {
        pdfFile.close();
        resolve();
      });
    }).on('error', reject);
  });

  console.log('  Saved to:', outputPath);
  
  // Extract and verify text
  console.log('\n[VERIFICATION] Extracting PDF text...');
  const pdfParse = require('pdf-parse');
  const dataBuffer = fs.readFileSync(outputPath);
  const pdfData = await pdfParse(dataBuffer);
  
  console.log('\n[PDF CONTENT]');
  console.log(pdfData.text.substring(0, 500));
  
  // Check if merge worked
  if (pdfData.text.includes('TEEI Test Document')) {
    console.log('\n[SUCCESS] Data merged correctly! Template fields were replaced with actual data.');
  } else if (pdfData.text.includes('{{')) {
    console.log('\n[FAILURE] Template fields NOT merged - PDF contains {{}} syntax');
  } else {
    console.log('\n[UNKNOWN] Cannot determine merge status from PDF text');
  }
}

testAdobeSample().catch(err => {
  console.error('\n[ERROR]', err.message);
  process.exit(1);
});
