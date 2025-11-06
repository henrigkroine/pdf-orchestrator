/**
 * PDF Services Worker
 *
 * Calls Adobe PDF Services API for serverless PDF automation
 * Used for automated jobs not requiring human sessions
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class PDFServicesWorker {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://pdf-services.adobe.io';
    this.authUrl = config.authUrl || 'https://ims-na1.adobelogin.com';
    this.clientId = process.env.ADOBE_CLIENT_ID;
    this.clientSecret = process.env.ADOBE_CLIENT_SECRET;
    this.organizationId = process.env.ADOBE_ORGANIZATION_ID;
    this.timeout = config.timeout || 120000; // 2 minutes default
    this.accessToken = null;
    this.tokenExpiry = null;

    // Validate required credentials
    if (!this.clientId || !this.clientSecret) {
      console.warn('[PDF Services Worker] WARNING: Adobe credentials not configured');
      console.warn('[PDF Services Worker] Set ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET in .env');
    }

    console.log('[PDF Services Worker] Initialized');
  }

  /**
   * Execute job via Adobe PDF Services API
   */
  async execute(job) {
    console.log('[PDF Services Worker] Starting job execution...');
    console.log(`[PDF Services Worker] Job type: ${job.jobType}, Template: ${job.templateId || 'dynamic'}`);

    try {
      // Step 1: Get access token
      await this.authenticate();

      // Step 2: Upload template file (if exists)
      let templateAssetId = null;
      if (job.templateId && this.isTemplateFile(job.templateId)) {
        console.log('[PDF Services Worker] Uploading template file...');
        templateAssetId = await this.uploadAsset(job.templateId, 'template');
      }

      // Step 3: Upload data JSON as asset
      console.log('[PDF Services Worker] Uploading data JSON...');
      const dataAssetId = await this.uploadDataJSON(job.data);

      // Step 4: Create PDF generation job
      console.log('[PDF Services Worker] Creating document generation job...');
      const jobId = await this.createGenerationJob({
        templateAssetId,
        dataAssetId,
        output: job.output
      });

      // Step 5: Poll for completion
      console.log('[PDF Services Worker] Polling job status...');
      const result = await this.pollJobStatus(jobId);

      // Step 6: Download result
      console.log('[PDF Services Worker] Downloading result...');
      const outputPath = await this.downloadResult(result, job.output);

      console.log('[PDF Services Worker] Job completed successfully');
      return {
        status: 'success',
        worker: 'pdfServices',
        outputPath: outputPath,
        outputUrl: result.outputUrl || null,
        metadata: {
          jobId: jobId,
          processingTime: result.processingTime,
          pages: result.pages
        }
      };

    } catch (error) {
      console.error('[PDF Services Worker] Job failed:', error.message);
      throw error;
    }
  }

  /**
   * Check if template ID is a file path
   */
  isTemplateFile(templateId) {
    return templateId && (
      templateId.endsWith('.indd') ||
      templateId.endsWith('.docx') ||
      templateId.endsWith('.pptx') ||
      fs.existsSync(templateId)
    );
  }

  /**
   * Authenticate with Adobe PDF Services using OAuth 2.0
   */
  async authenticate() {
    // Check if token is still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      console.log('[PDF Services Worker] Using cached access token');
      return this.accessToken;
    }

    console.log('[PDF Services Worker] Authenticating with Adobe IMS...');

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Adobe credentials not configured. Set ADOBE_CLIENT_ID and ADOBE_CLIENT_SECRET in .env');
    }

    try {
      const authData = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
        scope: 'openid,AdobeID,read_organizations,additional_info.projectedProductContext'
      }).toString();

      const response = await this.makeAuthRequest('/ims/token/v3', 'POST', authData, {
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      this.accessToken = response.access_token;
      this.tokenExpiry = Date.now() + (response.expires_in * 1000) - 60000; // 1 minute buffer

      console.log('[PDF Services Worker] Authentication successful');
      return this.accessToken;

    } catch (error) {
      console.error('[PDF Services Worker] Authentication failed:', error.message);
      throw new Error(`Adobe authentication failed: ${error.message}`);
    }
  }

  /**
   * Make authentication request to Adobe IMS
   */
  async makeAuthRequest(path, method = 'POST', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.authUrl);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          ...headers,
          'Content-Length': body ? Buffer.byteLength(body) : 0
        },
        timeout: 30000
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              const parsed = JSON.parse(responseData);
              resolve(parsed);
            } else {
              reject(new Error(`Auth server returned status ${res.statusCode}: ${responseData}`));
            }
          } catch (parseError) {
            reject(new Error(`Failed to parse auth response: ${parseError.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Failed to connect to Adobe IMS: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Authentication request timed out'));
      });

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  /**
   * Upload a file asset to Adobe Cloud Storage
   */
  async uploadAsset(filePath, assetType = 'input') {
    console.log(`[PDF Services Worker] Uploading ${assetType}: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    try {
      // Step 1: Request upload URL
      const uploadInfo = await this.makeRequest('/assets', 'POST', {
        mediaType: this.getMediaType(filePath)
      });

      const { uploadUri, assetID } = uploadInfo;

      // Step 2: Upload file content to the presigned URL
      const fileContent = fs.readFileSync(filePath);
      await this.uploadToPresignedUrl(uploadUri, fileContent, this.getMediaType(filePath));

      console.log(`[PDF Services Worker] Upload complete: ${assetID}`);
      return assetID;

    } catch (error) {
      throw new Error(`Failed to upload ${assetType}: ${error.message}`);
    }
  }

  /**
   * Upload data JSON as an asset
   */
  async uploadDataJSON(data) {
    console.log('[PDF Services Worker] Uploading data JSON...');

    try {
      // Step 1: Request upload URL
      const uploadInfo = await this.makeRequest('/assets', 'POST', {
        mediaType: 'application/json'
      });

      const { uploadUri, assetID } = uploadInfo;

      // Step 2: Upload JSON content
      const jsonContent = JSON.stringify(data);
      await this.uploadToPresignedUrl(uploadUri, Buffer.from(jsonContent), 'application/json');

      console.log(`[PDF Services Worker] Data JSON uploaded: ${assetID}`);
      return assetID;

    } catch (error) {
      throw new Error(`Failed to upload data JSON: ${error.message}`);
    }
  }

  /**
   * Upload content to presigned URL
   */
  async uploadToPresignedUrl(presignedUrl, content, contentType) {
    return new Promise((resolve, reject) => {
      const url = new URL(presignedUrl);
      const isHttps = url.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          'Content-Length': content.length
        },
        timeout: 60000
      };

      const req = httpModule.request(options, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          let responseData = '';
          res.on('data', (chunk) => { responseData += chunk; });
          res.on('end', () => {
            reject(new Error(`Upload failed with status ${res.statusCode}: ${responseData}`));
          });
        }
      });

      req.on('error', (error) => {
        reject(new Error(`Failed to upload to presigned URL: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Upload to presigned URL timed out'));
      });

      req.write(content);
      req.end();
    });
  }

  /**
   * Get media type from file extension
   */
  getMediaType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mediaTypes = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.indd': 'application/x-indesign',
      '.json': 'application/json',
      '.html': 'text/html',
      '.zip': 'application/zip'
    };
    return mediaTypes[ext] || 'application/octet-stream';
  }

  /**
   * Create PDF generation job
   */
  async createGenerationJob(jobSpec) {
    console.log('[PDF Services Worker] Creating document generation job...');

    try {
      const requestBody = {
        assetID: jobSpec.dataAssetId // Data JSON asset
      };

      // Add template if provided
      if (jobSpec.templateAssetId) {
        requestBody.templateAssetID = jobSpec.templateAssetId;
      }

      // Add output format options
      if (jobSpec.output) {
        requestBody.outputFormat = jobSpec.output.format || 'pdf';
      }

      const response = await this.makeRequest('/operation/documentgeneration', 'POST', requestBody);

      const jobId = response.jobId || response.location;
      console.log(`[PDF Services Worker] Job created: ${jobId}`);

      return jobId;

    } catch (error) {
      throw new Error(`Failed to create generation job: ${error.message}`);
    }
  }

  /**
   * Poll job status until complete
   */
  async pollJobStatus(jobId, maxAttempts = 60, interval = 2000) {
    console.log(`[PDF Services Worker] Polling job ${jobId}...`);

    const startTime = Date.now();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Extract job ID from location header if needed
        const cleanJobId = jobId.split('/').pop();

        const response = await this.makeRequest(`/operation/status/${cleanJobId}`, 'GET');

        console.log(`[PDF Services Worker] Attempt ${attempt}/${maxAttempts}: ${response.status}`);

        if (response.status === 'done' || response.status === 'completed') {
          const processingTime = Date.now() - startTime;
          console.log(`[PDF Services Worker] Job completed in ${processingTime}ms`);

          return {
            status: 'done',
            assetId: response.asset?.assetID || response.assetID,
            downloadUri: response.asset?.downloadUri || response.downloadUri,
            outputUrl: response.asset?.downloadUri || response.downloadUri,
            processingTime: processingTime,
            pages: response.metadata?.pages
          };
        } else if (response.status === 'failed' || response.status === 'error') {
          throw new Error(`Job failed: ${response.error || response.message || 'Unknown error'}`);
        }

        // Job still running, wait before next poll
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }

      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(`Job polling failed after ${maxAttempts} attempts: ${error.message}`);
        }
        console.warn(`[PDF Services Worker] Poll attempt ${attempt} failed: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    throw new Error(`Job did not complete within ${maxAttempts * interval}ms`);
  }

  /**
   * Download result PDF
   */
  async downloadResult(result, outputSpec) {
    console.log('[PDF Services Worker] Downloading result PDF...');

    try {
      const downloadUri = result.downloadUri;
      if (!downloadUri) {
        throw new Error('No download URI in result');
      }

      // Determine output path
      const outputDir = outputSpec?.path || path.join(__dirname, '../../exports');
      const outputFileName = outputSpec?.fileName || `output-${Date.now()}.pdf`;
      const outputPath = path.join(outputDir, outputFileName);

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Download file
      await this.downloadFile(downloadUri, outputPath);

      console.log(`[PDF Services Worker] Result saved to: ${outputPath}`);

      // Optional: Upload to R2 if configured
      if (process.env.R2_BUCKET_OUTPUTS && process.env.R2_ACCESS_KEY_ID) {
        console.log('[PDF Services Worker] Uploading to R2 storage...');
        // R2 upload would go here
        // const r2Url = await this.uploadToR2(outputPath);
        // return r2Url;
      }

      return outputPath;

    } catch (error) {
      throw new Error(`Failed to download result: ${error.message}`);
    }
  }

  /**
   * Download file from URL to local path
   */
  async downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const req = httpModule.get(url, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          // Handle redirect
          return this.downloadFile(res.headers.location, outputPath)
            .then(resolve)
            .catch(reject);
        }

        if (res.statusCode !== 200) {
          reject(new Error(`Download failed with status ${res.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(outputPath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve(outputPath);
        });

        fileStream.on('error', (error) => {
          fs.unlink(outputPath, () => {}); // Clean up partial file
          reject(error);
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Failed to download file: ${error.message}`));
      });

      req.setTimeout(60000, () => {
        req.destroy();
        reject(new Error('Download timed out'));
      });
    });
  }

  /**
   * Make authenticated request to Adobe API
   */
  async makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);

      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'x-api-key': this.clientId,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      };

      if (body) {
        const data = JSON.stringify(body);
        options.headers['Content-Length'] = data.length;
      }

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(responseData));
          } else {
            reject(new Error(`Adobe API returned status ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Failed to connect to Adobe API: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Adobe API request timed out'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  /**
   * Check if Adobe PDF Services is available
   */
  async healthCheck() {
    try {
      console.log('[PDF Services Worker] Running health check...');

      // Try to authenticate
      await this.authenticate();

      // If authentication succeeded, service is available
      console.log('[PDF Services Worker] Health check: ✓ Service is available');
      return true;

    } catch (error) {
      console.warn('[PDF Services Worker] Health check: ✗ Service unavailable');
      console.warn('[PDF Services Worker] Error:', error.message);
      return false;
    }
  }

  /**
   * Get worker status and capabilities
   */
  getStatus() {
    return {
      worker: 'pdfServices',
      baseUrl: this.baseUrl,
      authenticated: !!this.accessToken,
      tokenExpiry: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
      credentialsConfigured: !!(this.clientId && this.clientSecret),
      capabilities: ['document_generation', 'pdf_export', 'combine_pdf', 'compress_pdf'],
      ready: !!(this.clientId && this.clientSecret)
    };
  }
}

module.exports = PDFServicesWorker;
