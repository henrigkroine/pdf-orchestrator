#!/usr/bin/env node
/**
 * Test Adobe Document Generation with inline JSON (not uploaded as asset)
 */

const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

async function testInlineJSON() {
  const requestBody = {
    assetID: 'urn:aaid:AS:UE1:688f1fac-6acc-482e-a82f-9bc0b982efd9',
    jsonDataForMerge: {
      title: '🌟 TEEI AI-Powered Education Revolution 2025',
      subtitle: 'World-Class Partnership Showcase Document',
      content: [
        'Line 1: Test content',
        'Line 2: More test content',
        'Line 3: Final test'
      ],
      metadata: {
        author: 'The Educational Equality Institute',
        date: '2025-01-07',
        organization: 'TEEI'
      }
    },
    outputFormat: 'pdf'
  };

  console.log('Testing inline JSON with Adobe Document Generation...');
  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(requestBody);
    const options = {
      hostname: 'pdf-services.adobe.io',
      path: '/operation/documentgeneration',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ADOBE_ACCESS_TOKEN}`,
        'x-api-key': process.env.ADOBE_CLIENT_ID,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log('\nResponse status:', res.statusCode);
        console.log('Response headers:', JSON.stringify(res.headers, null, 2));
        console.log('Response body:', body);
        
        if (res.statusCode === 201) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`API returned status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

testInlineJSON().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
