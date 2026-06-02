exports.getDeviceInfo = (req) => {
    const userAgent = req.headers['user-agent'] || '';
    
    // Explicit headers passed by the mobile app
    const explicitOs = req.headers['x-device-os'];
    const deviceModel = req.headers['x-device-model'] || '';
    const deviceMake = req.headers['x-device-make'] || '';
    const appVersion = req.headers['x-app-version'] || '';

    let os = 'Unknown';
    if (explicitOs) {
        os = explicitOs;
    } else {
        const uaLower = userAgent.toLowerCase();
        if (uaLower.includes('android')) os = 'Android';
        else if (uaLower.includes('iphone') || uaLower.includes('ipad') || uaLower.includes('ipod')) os = 'iOS';
        else if (uaLower.includes('windows')) os = 'Windows';
        else if (uaLower.includes('mac os') || uaLower.includes('macintosh')) os = 'Mac';
        else if (uaLower.includes('linux')) os = 'Linux';
    }

    return {
        os,
        deviceModel,
        deviceMake,
        appVersion,
        userAgent
    };
};
