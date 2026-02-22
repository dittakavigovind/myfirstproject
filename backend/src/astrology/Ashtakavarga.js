
const tzUtils = require('../utils/timezoneUtils');
const path = require('path');

let SwissEphModule;
let globalSwe = null;
let initPromise = null;

// Re-use the global SWE init logic or import it?
// Better to import getGlobalSwe and helper functions if possible, but AstroService is monolithic.
// For now, I'll assume AstroService passes the 'swe' instance or I replicate init.
// Replicating Init for safety as AstroService exports big functions.

// Singleton instance helper with initialization lock (Duplicated from AstroService to keep standalone safe)
const getGlobalSwe = async () => {
    if (globalSwe) return globalSwe;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            if (!SwissEphModule) {
                SwissEphModule = (await import('swisseph-wasm')).default;
            }
            const swe = new SwissEphModule();
            await swe.initSwissEph();

            const ephePath = path.join(__dirname, '../../ephe');
            const normalizedPath = ephePath.split(path.sep).join('/');
            swe.set_ephe_path(normalizedPath);
            swe.set_sid_mode(1, 0, 0); // Lahiri

            globalSwe = swe;
            return swe;
        } finally {
            initPromise = null;
        }
    })();
    return initPromise;
};

// Julian Day Helper
const getJulianDay = (swe, dateObj) => {
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const day = dateObj.getUTCDate();
    const hour = dateObj.getUTCHours() + (dateObj.getUTCMinutes() / 60) + (dateObj.getUTCSeconds() / 3600);
    const CAL = swe.SE_GREG_CAL || 1;
    return swe.julday(year, month, day, hour, CAL);
};

// Planet Calc Helper
const calculatePlanets = (swe, julianDay, ayanamsa) => {
    const PLANETS = { Sun: 0, Moon: 1, Mars: 4, Mercury: 2, Jupiter: 5, Venus: 3, Saturn: 6, Rahu: 10 };
    const results = {};
    const flag = (swe.SEFLG_SWIEPH) | (swe.SEFLG_SIDEREAL) | (swe.SEFLG_SPEED);

    for (const [planetName, planetId] of Object.entries(PLANETS)) {
        let planetData = swe.calc_ut(julianDay, planetId, flag);
        // Sometimes calc_ut with SIDEREAL flag might still need manual adjustment depending on environment
        // But here we'll trust the flag if it's set correctly. 
        // We'll also return the longitude for debugging.
        const longitude = planetData[0];
        const sign = Math.floor(longitude / 30) + 1;
        results[planetName] = { longitude: longitude, sign: sign };
    }
    return results;
};

// House Calc Helper
const calculateHouses = (swe, julianDay, lat, lng, ayanamsa) => {
    const houses = swe.houses(julianDay, lat, lng, 'P');
    const toSidereal = (val) => (val - ayanamsa + 360) % 360;
    return { ascendant: toSidereal(houses.ascmc[0]) };
};
const calculateAshtakavarga = async (dateString, timeString, lat, lng, timezone) => {
    const swe = await getGlobalSwe();
    try {
        const utcDate = tzUtils.getDateFromParts(dateString, timeString, timezone);
        const jd = getJulianDay(swe, utcDate);
        const ayanamsa = swe.get_ayanamsa_ut(jd);
        const planets = calculatePlanets(swe, jd, ayanamsa);
        const houseData = calculateHouses(swe, jd, lat, lng, ayanamsa);
        const ascendantSign = Math.floor(houseData.ascendant / 30) + 1;

        // Reference Points: Sun(1) to Saturn(7) + Lagna(Ascendant)
        // We need the Sign (1-12) for each.
        const refs = {
            Sun: planets['Sun'].sign,
            Moon: planets['Moon'].sign,
            Mars: planets['Mars'].sign,
            Mercury: planets['Mercury'].sign,
            Jupiter: planets['Jupiter'].sign,
            Venus: planets['Venus'].sign,
            Saturn: planets['Saturn'].sign,
            Lagna: ascendantSign
        };

        // Standard Parashara Ashtakavarga benefic points (Bindus)
        // Format: Planet -> { ReferencePoint: [Houses from Ref where point is given] }
        // 1=Aries ... 12=Pisces (Relative to Ref)
        const rules = {
            Sun: {
                Sun: [1, 2, 4, 7, 8, 9, 10, 11],
                Moon: [3, 6, 10, 11],
                Mars: [1, 2, 4, 7, 8, 9, 10, 11],
                Mercury: [3, 5, 6, 9, 10, 11, 12],
                Jupiter: [5, 6, 9, 11],
                Venus: [6, 7, 12],
                Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
                Lagna: [3, 4, 6, 10, 11, 12]
            },
            Moon: {
                Sun: [3, 6, 7, 8, 10, 11],
                Moon: [1, 3, 6, 7, 10, 11],
                Mars: [2, 3, 5, 6, 9, 10, 11],
                Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
                Jupiter: [1, 4, 7, 8, 10, 11, 12],
                Venus: [3, 4, 5, 7, 9, 10, 11],
                Saturn: [3, 5, 6, 11],
                Lagna: [3, 6, 10, 11]
            },
            Mars: {
                Sun: [3, 5, 6, 10, 11],
                Moon: [3, 6, 11],
                Mars: [1, 2, 4, 7, 8, 10, 11],
                Mercury: [3, 5, 6, 11],
                Jupiter: [6, 10, 11, 12],
                Venus: [6, 8, 11, 12],
                Saturn: [1, 4, 7, 8, 9, 10, 11],
                Lagna: [1, 3, 6, 10, 11]
            },
            Mercury: {
                Sun: [5, 6, 9, 11, 12],
                Moon: [2, 4, 6, 8, 10, 11],
                Mars: [1, 2, 4, 7, 8, 9, 10, 11],
                Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
                Jupiter: [6, 8, 11, 12],
                Venus: [1, 2, 3, 4, 5, 8, 9, 11],
                Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
                Lagna: [1, 2, 4, 6, 8, 10, 11]
            },
            Jupiter: {
                Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
                Moon: [2, 5, 7, 9, 11],
                Mars: [1, 2, 4, 7, 8, 10, 11],
                Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
                Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
                Venus: [2, 5, 6, 9, 10, 11],
                Saturn: [3, 5, 6, 12],
                Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11]
            },
            Venus: {
                Sun: [8, 11, 12],
                Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
                Mars: [3, 5, 6, 9, 11, 12],
                Mercury: [3, 5, 6, 9, 11],
                Jupiter: [5, 8, 9, 10, 11],
                Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
                Saturn: [3, 4, 5, 8, 9, 10, 11],
                Lagna: [1, 2, 3, 4, 5, 8, 9, 11]
            },
            Saturn: {
                Sun: [1, 2, 4, 7, 8, 10, 11],
                Moon: [3, 6, 11],
                Mars: [3, 5, 6, 10, 11, 12],
                Mercury: [6, 8, 9, 10, 11, 12],
                Jupiter: [5, 6, 11, 12],
                Venus: [6, 11, 12],
                Saturn: [3, 5, 6, 11],
                Lagna: [1, 3, 4, 6, 10, 11]
            }
        };

        const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

        // Initialize BAV tables initialized to 0
        // Structure: { Sun: { Aries: 0, ... }, Moon: ... }
        const bav = {};
        const sav = {}; // Summary
        signs.forEach(s => sav[s] = 0);

        Object.keys(rules).forEach(planet => {
            bav[planet] = {};
            signs.forEach(s => bav[planet][s] = 0); // Init signs

            // For each reference point (e.g. Sun, Moon...)
            Object.entries(rules[planet]).forEach(([refPoint, goodHouses]) => {
                const refSign = refs[refPoint]; // e.g., Sun's sign (1-12)

                // Add points to relevant houses from refSign
                goodHouses.forEach(h => {
                    // Sign index 1-12. 
                    // Target Sign = (RefSign + House - 1 - 1)%12 + 1 ??
                    // Calc: (RefSign + h - 1)
                    // Example: Ref=1 (Aries), House=1 -> Aries.
                    // Example: Ref=1 (Aries), House=2 -> Taurus.
                    // Normalization to 0-11 for array index or just 1-12

                    let targetSignIndex = (refSign + h - 2) % 12; // 0-11
                    if (targetSignIndex < 0) targetSignIndex += 12; // JS modulo safety
                    const targetSignName = signs[targetSignIndex];

                    // Add to BAV
                    bav[planet][targetSignName] = (bav[planet][targetSignName] || 0) + 1;
                });
            });

            // Add this planet's BAV to SAV
            Object.keys(bav[planet]).forEach(sign => {
                sav[sign] += bav[planet][sign];
            });
        });

        // Structure for frontend:
        // Returns BAV tables (detailed points from each ref not usually shown, just the totals per sign per planet are standard BAV).
        // Wait, "Prokerala check this page results" -> Prokerala shows the 8x12 grid for BAV?
        // Usually BAV is just "Sun in Aries: 4 bindus". The *breakdown* (Sun contributed, Moon contributed...) is Prastharashtakavarga (PAV).
        // The user asked for Ashtakavarga. Standard output is BAV (Totals per sign for each planet) and SAV (Total of all planets).
        // However, if they want "like Prokerala", Prokerala shows "Bhinnashtakava - Sun" table with rows for Signs and Cols for Planets?
        // Let's assume standard BAV (Totals) first. 
        // If they want the grid (PAV), I'd need to send the breakdown.
        // Let's send the breakdown just in case.
        // Actually, the standard "Ashtakavarga Calculator" on Prokerala shows:
        // 1. Sarvashtakavarga Table (Signs vs Planets + Total)
        // 2. Bhinnashtakavarga Tables (One per planet).

        // Detailed PAV (Prasthara) is better for "North/South" charts? No, SAV is sufficient.

        return {
            meta: {
                date: dateString,
                lat,
                lng,
                ayanamsa,
                julianDay: jd
            },
            ascendantSign, // 1=Aries, 12=Pisces
            planets, // Sign details for verification
            bav, // { Sun: { Aries: 4, Taurus: 3... }, Moon: ... }
            sav, // { Aries: 28, Taurus: 30 ... }
            signs,
            refs // Debug: Planet Signs
        };

    } catch (error) {
        console.error("Ashtakavarga Calc Error:", error);
        throw error;
    }
};

module.exports = calculateAshtakavarga;
