const axios = require('axios');

/**
 * Triggers a Cloudflare deployment rebuild via webhook.
 * The webhook URL should be configured in the CLOUDFLARE_DEPLOY_WEBHOOK environment variable.
 */
const triggerDeployment = async (source = 'Unknown') => {
    const webhookUrl = process.env.CLOUDFLARE_DEPLOY_WEBHOOK;
    
    if (!webhookUrl || webhookUrl === 'YOUR_CLOUDFLARE_WEBHOOK_URL') {
        console.log(`[Deploy] No deployment webhook configured (triggered by ${source})`);
        return;
    }

    try {
        console.log(`[Deploy] Triggering frontend rebuild (Source: ${source})...`);
        await axios.post(webhookUrl, {});
        console.log(`[Deploy] Rebuild triggered successfully (Source: ${source})`);
    } catch (error) {
        console.error(`[Deploy] Failed to trigger rebuild (Source: ${source}):`, error.message);
    }
};

module.exports = {
    triggerDeployment
};
