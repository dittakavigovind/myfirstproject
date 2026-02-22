const HoroscopeService = require('../services/horoscopeService');

exports.getHoroscope = (req, res) => {
    try {
        const { sign } = req.params;
        const { type } = req.query; // daily, weekly, monthly

        const data = HoroscopeService.getHoroscope(sign, type);

        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
