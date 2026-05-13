const AppConfig = require('../models/AppConfig');

exports.checkMaintenanceMode = async (req, res, next) => {
    try {
        // Skip maintenance check for admin routes and auth login (so admins can still login and manage)
        if (req.originalUrl.startsWith('/api/admin') || req.originalUrl.startsWith('/api/auth/login')) {
            return next();
        }

        const config = await AppConfig.findOne();
        
        if (config && config.maintenanceMode && config.maintenanceMode.enabled) {
            return res.status(503).json({
                success: false,
                isMaintenance: true,
                message: config.maintenanceMode.message || "App is currently under maintenance. Please try again later."
            });
        }

        next();
    } catch (error) {
        console.error("Maintenance Mode Check Error:", error);
        next(); // Fail open if DB issue, or we could fail closed. Fail open avoids total outage on config crash.
    }
};
