const PanchangService = require('../astrology/PanchangService');
const Geocoder = require('../utils/geocoder');
const moment = require('moment-timezone');

const FestivalService = require('../astrology/FestivalService');

exports.getPanchang = async (req, res) => {
    try {
        const { date, location, lat, lng, timezone } = req.body;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        let geoData;

        // 1. Resolve location
        if (lat !== undefined && lng !== undefined && timezone !== undefined) {
            geoData = {
                lat,
                lng,
                timezone,
                formattedAddress: location || "Custom Location"
            };
        } else if (location) {
            geoData = await Geocoder.geocodePlace(location);
        } else {
            return res.status(400).json({
                message: 'Location or Coordinates (lat, lng, timezone) are required'
            });
        }

        // 2. ALWAYS start from LOCAL MIDNIGHT
        const localDate = moment.tz(
            `${date} 00:00:00`,
            "YYYY-MM-DD HH:mm:ss",
            geoData.timezone // Use the location's timezone
        );

        // 3. Convert to UTC for astronomy calculations
        const utcDate = localDate.clone().utc().toDate();

        // 4. Calculate Panchang
        const panchangRaw = await PanchangService.calculatePanchang(
            utcDate,
            geoData.lat,
            geoData.lng,
            geoData.timezone
        );

        // 5. Get Festivals
        const festivals = FestivalService.getFestivals(panchangRaw);

        // 6. Format Response
        const responseData = {
            timezone: geoData.timezone,
            sun: panchangRaw.sun,
            moon: panchangRaw.moon,
            tithi: panchangRaw.tithi,
            nakshatra: panchangRaw.nakshatra,
            yoga: panchangRaw.yoga,
            karana: panchangRaw.karana,
            abhijitMuhurta: panchangRaw.abhijitMuhurta,
            amritKaal: panchangRaw.amritKaal,
            varjyam: panchangRaw.varjyam,
            rahuKalam: panchangRaw.rahuKalam,
            yamaganda: panchangRaw.yamaganda,
            gulikaKalam: panchangRaw.gulikaKalam,
            hora: panchangRaw.hora,
            durmuhurtham: panchangRaw.durmuhurtham,
            choghadiya: panchangRaw.choghadiya,
            samvat: panchangRaw.samvat,
            masa: panchangRaw.masa,
            ritu: panchangRaw.ritu,
            vara: panchangRaw.vara,
            festivals: festivals, // Added festivals
            meta: panchangRaw.meta
        };

        res.json({
            success: true,
            data: {
                geo: geoData,
                panchang: responseData
            }
        });

    } catch (error) {
        console.error('Panchang API Error:', error);
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        });
    }
};

// Simple in-memory cache
const monthlyCache = new Map();

exports.getMonthlyPanchang = async (req, res) => {
    try {
        const { year, month, lat, lng, timezone, location } = req.body;

        if (!year || month === undefined) {
            return res.status(400).json({ message: 'Year and Month are required' });
        }

        // Cache Key Generation
        const cacheKey = `${year}-${month}-${lat}-${lng}-${timezone}`;

        if (monthlyCache.has(cacheKey)) {
            console.log("Serving from cache:", cacheKey);
            return res.json(monthlyCache.get(cacheKey));
        }

        // Resolve location if not provided
        let geoData = { lat, lng, timezone, formattedAddress: location };
        if (!lat || !lng || !timezone) {
            if (location) {
                geoData = await Geocoder.geocodePlace(location);
            } else {
                // Default to New Delhi if nothing provided (or return error)
                geoData = { lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata', formattedAddress: 'New Delhi, India' };
            }
        }

        const startOfMonth = moment.tz({ year, month, day: 1 }, geoData.timezone);
        const daysInMonth = startOfMonth.daysInMonth();
        const monthlyData = [];

        // Use Batch Lite Calculation
        const batchedPanchang = await PanchangService.calculateMonthlyPanchangLite(
            year,
            month,
            geoData.lat,
            geoData.lng,
            geoData.timezone
        );

        monthlyData.push(...batchedPanchang.map(p => {
            const festivals = FestivalService.getFestivals(p);
            return {
                ...p,
                festivals
            };
        }));

        const responseData = {
            success: true,
            data: {
                year,
                month,
                location: geoData,
                days: monthlyData
            }
        };

        // Store in cache (expire after 24 hours or just keep it? Memory might grow.)
        // For now, simple LRU or just size limit would be better, but Map is fine for V1.
        // Let's implement a rudimentary size check.
        if (monthlyCache.size > 100) {
            const firstKey = monthlyCache.keys().next().value;
            monthlyCache.delete(firstKey);
        }
        monthlyCache.set(cacheKey, responseData);

        res.json(responseData);

    } catch (error) {
        console.error('Monthly Panchang Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
