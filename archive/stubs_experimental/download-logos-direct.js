#!/usr/bin/env node
/**
 * Download partner logos from direct sources
 * Uses Wikimedia Commons and official sources (not CDN that redirect)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'assets', 'partner-logos');

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Partner logo URLs from direct sources
const logos = {
    // Wikimedia Commons (most reliable, no redirects)
    'google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    'aws': 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    'cornell': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Cornell_University_seal.svg',
    'oxford': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Oxford-University-Circlet.svg',

    // SeekLogo (direct SVG downloads)
    'babbel': 'https://seeklogo.com/images/B/babbel-logo-34F8472593-seeklogo.com.png',
    'sanoma': 'https://seeklogo.com/images/S/sanoma-logo-0C08D0A5C5-seeklogo.com.png',

    // Logo.wine (direct PNG downloads)
    'bain': 'https://logo.wine/a/logo/Bain_%26_Company/Bain_%26_Company-Logo.wine.svg',
};

function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);

        https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            followRedirect: true
        }, (response) => {
            // Follow redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                const redirectUrl = response.headers.location;
                console.log(`  → Following redirect to: ${redirectUrl}`);

                https.get(redirectUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (redirectResponse) => {
                    if (redirectResponse.statusCode === 200) {
                        redirectResponse.pipe(file);
                        file.on('finish', () => {
                            file.close();
                            console.log(`✓ Downloaded: ${path.basename(filename)}`);
                            resolve();
                        });
                    } else {
                        fs.unlink(filename, () => {});
                        reject(new Error(`Redirect failed: ${redirectResponse.statusCode}`));
                    }
                }).on('error', (err) => {
                    fs.unlink(filename, () => {});
                    reject(err);
                });

                return;
            }

            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✓ Downloaded: ${path.basename(filename)}`);
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

async function downloadAllLogos() {
    console.log('\n' + '='.repeat(60));
    console.log('DOWNLOADING PARTNER LOGOS (Direct Sources)');
    console.log('='.repeat(60) + '\n');

    for (const [name, url] of Object.entries(logos)) {
        const ext = url.endsWith('.png') ? 'png' : 'svg';
        const filename = path.join(outputDir, `${name}.${ext}`);

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
    console.log(`\nLogos saved to: ${outputDir}`);
    console.log('\nNote: INCO and Kintell logos need to be sourced manually\n');
}

downloadAllLogos().catch(console.error);
