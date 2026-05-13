const AppConfig = require('../models/AppConfig');
const PricingConfig = require('../models/PricingConfig');

// APP CONFIG

exports.getAppConfig = async (req, res) => {
    try {
        let config = await AppConfig.findOne();
        if (!config) {
            config = await AppConfig.create({}); // Create default
        }
        res.status(200).json({ success: true, config });
    } catch (err) {
        console.error('Get App Config Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateAppConfig = async (req, res) => {
    try {
        let config = await AppConfig.findOne();
        if (!config) {
            config = new AppConfig();
        }

        // Apply updates
        Object.assign(config, req.body);
        
        await config.save();
        res.status(200).json({ success: true, config, message: 'App configuration updated' });
    } catch (err) {
        console.error('Update App Config Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// PRICING CONFIG

exports.getPricingConfig = async (req, res) => {
    try {
        let config = await PricingConfig.findOne();
        if (!config) {
            config = await PricingConfig.create({}); // Create default
        }
        res.status(200).json({ success: true, config });
    } catch (err) {
        console.error('Get Pricing Config Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updatePricingConfig = async (req, res) => {
    try {
        let config = await PricingConfig.findOne();
        if (!config) {
            config = new PricingConfig();
        }

        Object.assign(config, req.body);

        // Calculate active if manual override isn't set
        config.isPeakHourActive = config.isPeakHourActive || false;
        
        await config.save();
        res.status(200).json({ success: true, config, message: 'Pricing configuration updated' });
    } catch (err) {
        console.error('Update Pricing Config Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
