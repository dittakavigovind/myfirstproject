const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const ASSETS_DIR = path.join(__dirname, '../assets');

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Helper to download a file
const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        
        console.log(`Downloading ${url} to ${dest}...`);
        
        const file = fs.createWriteStream(dest);
        client.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

const syncBranding = async () => {
    try {
        console.log(`Fetching site settings from ${API_URL}/site-settings...`);
        
        const client = API_URL.startsWith('https') ? https : http;
        
        const settingsUrl = `${API_URL}/site-settings`;
        
        const data = await new Promise((resolve, reject) => {
            client.get(settingsUrl, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch(e) {
                        console.error("Failed to parse JSON. Body received:", body);
                        reject(new Error("Invalid JSON: " + e.message));
                    }
                });
            }).on('error', reject);
        });

        const settings = data.settings;
        if (!settings) {
            throw new Error("No settings found from API");
        }

        let downloaded = false;

        // Resolve absolute URLs
        const resolveUrl = (urlStr) => {
            if (urlStr.startsWith('http')) return urlStr;
            const base = API_URL.replace('/api', '');
            if (urlStr.startsWith('/uploads')) return `${base}/api${urlStr}`;
            return `${base}${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
        };

        if (settings.mobileAppIconUrl) {
            const iconUrl = resolveUrl(settings.mobileAppIconUrl);
            await downloadFile(iconUrl, path.join(ASSETS_DIR, 'icon.png'));
            downloaded = true;
        }

        if (settings.mobileAppSplashUrl) {
            const splashUrl = resolveUrl(settings.mobileAppSplashUrl);
            await downloadFile(splashUrl, path.join(ASSETS_DIR, 'splash.png'));
            downloaded = true;
        }

        if (downloaded) {
            console.log("Successfully downloaded branding assets!");
            console.log("Running capacitor assets generator...");
            execSync('npx @capacitor/assets generate', { 
                cwd: path.join(__dirname, '..'), 
                stdio: 'inherit' 
            });
            console.log("Native assets generated successfully!");
            
            // Automatically patch Android 12 splash screen to use the square image (anti-squeezing fix)
            const sourceSplash = path.join(ASSETS_DIR, 'splash.png');
            const destSplash = path.join(__dirname, '../android/app/src/main/res/drawable/splash_icon.png');
            if (fs.existsSync(sourceSplash) && fs.existsSync(path.dirname(destSplash))) {
                fs.copyFileSync(sourceSplash, destSplash);
                console.log("Applied Android 12 anti-squeezing splash fix.");
            }
        } else {
            console.log("No branding URLs configured in the dashboard. Nothing to sync.");
        }

    } catch (error) {
        console.error("Failed to sync branding:", error.message);
        process.exit(1);
    }
};

syncBranding();
