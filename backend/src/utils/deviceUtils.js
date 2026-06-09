const geoip = require('geoip-lite');

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

    let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.connection?.remoteAddress || req.ip || '';
    if (ip && typeof ip === 'string' && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    // Handle localhost IPv6 loopback
    if (ip === '::1' || ip.startsWith('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }

    let location = { ip };
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        const geo = geoip.lookup(ip);
        if (geo) {
            location.country = geo.country;
            location.region = geo.region;
            location.city = geo.city;
            location.ll = geo.ll; // [latitude, longitude]
        }
    }

    return {
        os,
        deviceModel,
        deviceMake,
        appVersion,
        userAgent,
        location
    };
};
