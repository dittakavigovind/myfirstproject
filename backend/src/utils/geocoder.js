const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
    family: 4
});

/**
 * Geocode Place Name to Coordinates and Timezone
 * Uses Google Maps Geocoding and Timezone APIs
 * @param {String} placeName
 * @param {String} targetCountry
 * @param {String} place_id
 * @returns {Object} { lat, lng, timezone, formattedAddress, city, state, country, pincode }
 */
const geocodePlace = async (placeName, targetCountry = null, place_id = null) => {
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
        let geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}`;
        if (place_id) {
            geoUrl += `&place_id=${place_id}`;
            // Component restriction is not supported with place_id per Google Docs
        } else {
            geoUrl += `&address=${encodeURIComponent(placeName)}`;
            // Note: We deliberately do NOT apply component restriction here
            // so that our strict country validation below can smoothly
            // throw the expected "Delivery only to India" error instead of ZERO_RESULTS.
        }

        const geoRes = await axios.get(geoUrl, { httpsAgent: agent });

        if (geoRes.data.status !== 'OK') {
            throw new Error(`Geocoding Failed: ${geoRes.data.status}`);
        }

        const location = geoRes.data.results[0].geometry.location;
        const addressComponents = geoRes.data.results[0].address_components;
        const formattedAddress = geoRes.data.results[0].formatted_address;
        const { lat, lng } = location;

        // DEBUG: Log address components to see why pincode might be missing

        // Parse address components
        let city = '', state = '', resCountry = '', pincode = '';

        addressComponents.forEach(component => {
            if (component.types.includes('locality')) {
                city = component.long_name;
            } else if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
            } else if (component.types.includes('country')) {
                resCountry = component.long_name;
            } else if (component.types.includes('postal_code')) {
                pincode = component.long_name;
            }
        });

        // Nellore fix: If pincode is missing, try to extract from formattedAddress
        if (!pincode && formattedAddress) {
            const pinMatch = formattedAddress.match(/\b\d{6}\b/);
            if (pinMatch) {
                pincode = pinMatch[0];
            }
        }

        // Fallback for city if locality is missing
        if (!city) {
            const sublocality = addressComponents.find(c => c.types.includes('administrative_area_level_2'))?.long_name;
            city = sublocality || '';
        }

        // 1.5 Strict Country Validation (Second layer of defense)
        if (targetCountry && targetCountry.toUpperCase() === 'IN') {
            const isIndia = resCountry.toLowerCase() === 'india' || addressComponents.some(c => c.short_name === 'IN');
            if (!isIndia) {
                throw new Error("Delivery only to India");
            }
        }

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
            formattedAddress,
            city,
            state,
            country: resCountry,
            pincode
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
 * @param {String} targetCountry
 * @returns {Array} [{ description, place_id }]
 */
const searchPlaces = async (query, targetCountry = null) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) return [];

        let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`;
        if (targetCountry) {
            url += `&components=country:${targetCountry}`;
        }

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
