#!/usr/bin/env node
/**
 * Download remaining partner logos (Babbel, Sanoma, Bain) from Wikimedia Commons
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'assets', 'partner-logos');

// Remaining logos from Wikimedia Commons (most reliable source)
const logos = {
    'babbel': 'https://upload.wikimedia.org/wikipedia/commons/7/74/Babbel_logo.svg',
    'sanoma': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Sanoma_Corporation_logo.svg',
    'bain': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Bain_%26_Company_logo.svg',
};

function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);

        https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
        }, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(filename);
                    const sizeKB = (stats.size / 1024).toFixed(1);
                    console.log(`✓ Downloaded: ${path.basename(filename)} (${sizeKB} KB)`);
                    resolve();
                });
            } else {
                fs.unlink(filename, () => {});
                reject(new Error(`Failed: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(filename, () => {});
            reject(err);
        });
    });
}

async function downloadRemainingLogos() {
    console.log('\n' + '='.repeat(60));
    console.log('DOWNLOADING REMAINING LOGOS (Babbel, Sanoma, Bain)');
    console.log('Source: Wikimedia Commons');
    console.log('='.repeat(60) + '\n');

    for (const [name, url] of Object.entries(logos)) {
        const filename = path.join(outputDir, `${name}.svg`);

        console.log(`Downloading ${name}...`);
        try {
            await downloadFile(url, filename);
        } catch (error) {
            console.log(`✗ Failed: ${name} - ${error.message}`);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('DOWNLOAD COMPLETE');
    console.log('='.repeat(60));
    console.log(`\nAll logos now in: ${outputDir}\n`);
}

downloadRemainingLogos().catch(console.error);
