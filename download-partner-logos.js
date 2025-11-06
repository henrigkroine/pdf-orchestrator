#!/usr/bin/env node
/**
 * Download partner logos from CDN sources
 * Creates a partner logos directory with all company logos
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'assets', 'partner-logos');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Partner logo URLs (from brandfetch and other CDN sources)
const logos = {
    'google': 'https://cdn.brandfetch.io/idZDaI1T1D/w/400/theme/dark/logo.svg',
    'aws': 'https://cdn.brandfetch.io/id0X3MulT9/w/400/theme/dark/logo.svg',
    'babbel': 'https://cdn.brandfetch.io/idE9JsvPy3/w/400/theme/dark/logo.svg',
    'oxford': 'https://cdn.brandfetch.io/idQvN6kHZz/w/400/theme/dark/logo.svg',
    'bain': 'https://cdn.brandfetch.io/idd01EA1ZR/w/400/theme/light/logo.png',
    'sanoma': 'https://cdn.brandfetch.io/idZUWyzX60/w/400/theme/dark/logo.svg',
    'cornell': 'https://cdn.brandfetch.io/idVs8wHKzp/w/400/theme/dark/logo.svg',
    // INCO and Kintell - will use text fallback
};

function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✓ Downloaded: ${path.basename(filename)}`);
                    resolve();
                });
            } else {
                fs.unlink(filename, () => {});
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(filename, () => {});
            reject(err);
        });
    });
}

async function downloadAllLogos() {
    console.log('\n' + '='.repeat(60));
    console.log('DOWNLOADING PARTNER LOGOS');
    console.log('='.repeat(60) + '\n');

    for (const [name, url] of Object.entries(logos)) {
        const ext = url.endsWith('.png') ? 'png' : 'svg';
        const filename = path.join(outputDir, `${name}.${ext}`);

        try {
            await downloadFile(url, filename);
        } catch (error) {
            console.log(`✗ Failed: ${name} - ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('DOWNLOAD COMPLETE');
    console.log('='.repeat(60));
    console.log(`\nLogos saved to: ${outputDir}\n`);
}

downloadAllLogos().catch(console.error);
