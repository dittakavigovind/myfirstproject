const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
    family: 4
});

/**
 * Geocode Place Name to Coordinates and Timezone
 * Uses Google Maps Geocoding and Timezone APIs
 * @param {String} placeName
 * @returns {Object} { lat, lng, timezone, formattedAddress }
 */
const geocodePlace = async (placeName) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            // Fallback for development if no key provided
            console.warn("GOOGLE_MAPS_API_KEY not found. Returning default Delhi coordinates.");
            return {
                lat: 28.6139,
                lng: 77.2090,
                timezone: "Asia/Kolkata",
                formattedAddress: "New Delhi, Delhi, India (Default)"
            };
        }

        // 1. Get Lat/Lng
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName)}&key=${apiKey}`;
        const geoRes = await axios.get(geoUrl, { httpsAgent: agent });

        if (geoRes.data.status !== 'OK') {
            throw new Error(`Geocoding Failed: ${geoRes.data.status}`);
        }

        const location = geoRes.data.results[0].geometry.location;
        const formattedAddress = geoRes.data.results[0].formatted_address;
        const { lat, lng } = location;

        // 2. Get Timezone
        // Timestamp is required for timezone offset (DST awareness)
        const timestamp = Math.floor(Date.now() / 1000);
        const tzUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`;
        const tzRes = await axios.get(tzUrl, { httpsAgent: agent });

        if (tzRes.data.status !== 'OK') {
            throw new Error(`Timezone Failed: ${tzRes.data.status}`);
        }

        // We want the Timezone ID string for strict moment-timezone handling
        const timezone = tzRes.data.timeZoneId || "UTC";

        return {
            lat,
            lng,
            timezone,
            formattedAddress
        };

    } catch (error) {
        console.error('Geocoding Service Error:', error.message);

        // Fallback for network errors to prevent app crash/blockage
        if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
            console.warn("Network Error in Geocoding. Using default Delhi coordinates.");
            return {
                lat: 28.6139,
                lng: 77.2090,
                timezone: "Asia/Kolkata",
                formattedAddress: "New Delhi, Delhi, India (Default - Network Error)"
            };
        }

        throw error;
    }
};

/**
 * Search Places for Autocomplete
 * Uses Google Places Autocomplete API
 * @param {String} query
 * @returns {Array} [{ description, place_id }]
 */
const searchPlaces = async (query) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) return [];

        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`;

        // Simple retry logic
        let retries = 3;
        while (retries > 0) {
            try {
                const res = await axios.get(url, {
                    timeout: 5000,
                    httpsAgent: agent
                });
                if (res.data.status === 'OK') {
                    return res.data.predictions.map(p => ({
                        description: p.description,
                        place_id: p.place_id
                    }));
                }
                break; // If status is not OK but no network error, don't retry
            } catch (err) {
                retries--;
                if (retries === 0) throw err;
                await new Promise(r => setTimeout(r, 1000));
            }
        }
        return [];
    } catch (error) {
        console.error('Place Search Error:', error.message);
        return [];
    }
};

module.exports = { geocodePlace, searchPlaces };
