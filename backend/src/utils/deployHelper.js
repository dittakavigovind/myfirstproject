const axios = require('axios');

/**
 * Triggers a Cloudflare Pages deploy hook to rebuild the frontend.
 * This is used when data changes in the backend that affects 
 * statically generated content (like OG images, metadata, etc.)
 */
const triggerCloudflareRebuild = async () => {
    try {
        const deployHookUrl = process.env.CLOUDFLARE_DEPLOY_HOOK_URL;

        if (!deployHookUrl) {
            console.warn('[DEPLOY] Cloudflare Deploy Hook URL not found. Skipping rebuild trigger.');
            return false;
        }

        console.log('[DEPLOY] Triggering Cloudflare Pages rebuild...');
        const response = await axios.post(deployHookUrl);

        if (response.status === 200 || response.status === 202) {
            console.log('[DEPLOY] Successfully triggered rebuild.');
            return true;
        } else {
            console.error('[DEPLOY] Unexpected response from Cloudflare:', response.status);
            return false;
        }
    } catch (error) {
        console.error('[DEPLOY] Error triggering Cloudflare rebuild:', error.message);
        return false;
    }
};

module.exports = { triggerCloudflareRebuild };
