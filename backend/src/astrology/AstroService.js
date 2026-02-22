const path = require('path');
const tzUtils = require('../utils/timezoneUtils');
const { getDignity } = require('./dignityUtils');
const dashaInterpretations = require('./data/dashaInterpretations');
const calculateAshtakavarga = require('./Ashtakavarga');

let SwissEphModule;
let globalSwe = null;
let initPromise = null;

// Planet IDs (Standard Swiss Ephemeris)
const PLANETS = {
    Sun: 0,      // SE_SUN
    Moon: 1,     // SE_MOON
    Mars: 4,     // SE_MARS
    Mercury: 2,  // SE_MERCURY
    Jupiter: 5,  // SE_JUPITER
    Venus: 3,    // SE_VENUS
    Saturn: 6,   // SE_SATURN
    Rahu: 10,    // SE_MEAN_NODE
};

// Nakshatra Names
const NAKSHATRAS = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
    'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

// Singleton instance helper with initialization lock
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

            // Set Sidereal Mode Globally (Lahiri)
            swe.set_sid_mode(1, 0, 0);

            globalSwe = swe;
            return swe;
        } finally {
            initPromise = null;
        }
    })();

    return initPromise;
};

/**
 * Astrology Service
 * Handles calculation of Planetary Positions, Houses, and Divisional Charts.
 * Uses 'swisseph-wasm' library.
 */

/**
 * Convert Date/Time to Julian Day (ET)
 */
const getJulianDay = (swe, dateObj) => {
    const year = dateObj.getUTCFullYear();
    const month = dateObj.getUTCMonth() + 1;
    const day = dateObj.getUTCDate();
    const hour = dateObj.getUTCHours() + (dateObj.getUTCMinutes() / 60) + (dateObj.getUTCSeconds() / 3600);
    const CAL = swe.SE_GREG_CAL || 1;
    const julianDayUT = swe.julday(year, month, day, hour, CAL);
    return julianDayUT;
};

/**
 * Calculate Planetary Positions (Sidereal / Nirayana)
 */
const calculatePlanets = (swe, julianDay) => {
    const results = {};
    const flag = (swe.SEFLG_SWIEPH || 2) | (swe.SEFLG_SIDEREAL || 65536) | (swe.SEFLG_SPEED || 256);

    for (const [planetName, planetId] of Object.entries(PLANETS)) {
        let planetData;
        try {
            planetData = swe.calc_ut(julianDay, planetId, flag);
        } catch (err) {
            console.error(`Error calculating ${planetName}:`, err.message);
            continue;
        }

        const sign = Math.floor(planetData[0] / 30) + 1;
        const nakIndex = Math.floor(planetData[0] / 13.333333333);
        const pada = Math.floor((planetData[0] % 13.333333333) / 3.333333333) + 1;

        results[planetName] = {
            longitude: planetData[0],
            speed: planetData[3],
            retrograde: planetData[3] < 0,
            house: sign,
            sign: sign,
            nakshatra: NAKSHATRAS[nakIndex % 27] || "Unknown",
            pada: pada,
            relation: getDignity(planetName, sign)
        };
    }

    if (results['Rahu']) {
        let ketuLong = (results['Rahu'].longitude + 180) % 360;
        const ketuSign = Math.floor(ketuLong / 30) + 1;
        results['Ketu'] = {
            longitude: ketuLong,
            speed: results['Rahu'].speed,
            retrograde: results['Rahu'].retrograde,
            house: ketuSign,
            sign: ketuSign,
            nakshatra: NAKSHATRAS[Math.floor(ketuLong / 13.333333333) % 27] || "Unknown",
            pada: Math.floor((ketuLong % 13.333333333) / 3.333333333) + 1,
            relation: getDignity('Ketu', ketuSign)
        };
    }
    return results;
};

/**
 * Calculate Houses (Bhavas) and Ascendant (Lagna)
 */
const calculateHouses = (swe, julianDay, lat, lng, ayanamsa) => {
    const houseSys = 'P';
    const houses = swe.houses(julianDay, lat, lng, houseSys);
    const toSidereal = (val) => (val - ayanamsa + 360) % 360;

    return {
        ascendant: toSidereal(houses.ascmc[0]),
        cusps: houses.cusps.map(c => toSidereal(c)),
    };
};

/**
 * Calculate Navamsa (D9) Chart
 */
const calculateNavamsa = (planets) => {
    const d9Chart = {};
    for (const [planet, data] of Object.entries(planets)) {
        const longitude = data.longitude;
        const sign = Math.floor(longitude / 30) + 1;
        const degreeInSign = longitude % 30;

        // Navamsa Index (1-9) within the sign
        const navamsaIndex = Math.floor(degreeInSign / 3.3333333333) + 1;

        // Correct Nakshatra Pada Calculation (Absolute)
        const nakshatraSpan = 13.333333333;
        const degreeInNakshatra = longitude % nakshatraSpan;
        const correctNakshatraPada = Math.floor(degreeInNakshatra / 3.3333333333) + 1;

        let navamsaSignStart;

        if ([1, 5, 9].includes(sign)) navamsaSignStart = 1;
        else if ([2, 6, 10].includes(sign)) navamsaSignStart = 10;
        else if ([3, 7, 11].includes(sign)) navamsaSignStart = 7;
        else navamsaSignStart = 4;

        let navamsaSign = (navamsaSignStart + (navamsaIndex - 1) - 1) % 12 + 1;

        // Calculate D9 Longitude for display (Map to 0-360)
        const d9Longitude = (longitude * 9) % 360;

        const nakIndex = Math.floor(d9Longitude / 13.333333333);
        const d9Pada = Math.floor((d9Longitude % 13.333333333) / 3.333333333) + 1;

        // Store both the Sign for D9 chart and the accurate Nakshatra Pada
        d9Chart[planet] = {
            sign: navamsaSign,
            pada: d9Pada, // This replaces the old 'pada' which might have been D1-based
            nakshatra: NAKSHATRAS[nakIndex % 27] || "Unknown", // Added bounds check
            longitude: d9Longitude,
            nakshatraPada: correctNakshatraPada
        };
    }
    return d9Chart;
};

/**
 * Calculate Vimshottari Dasha
 */
const calculateVimshottari = (moonLongitude, birthDate, planets, houses) => {
    // Uses global NAKSHATRAS constant
    const dashaLords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    const dashaYears = [7, 20, 6, 10, 7, 18, 16, 19, 17];
    const nakshatraSpan = 13.333333333;
    const nakshatraIndex = Math.floor(moonLongitude / nakshatraSpan);
    const degreesInNakshatra = moonLongitude % nakshatraSpan;
    const fractionTraversed = degreesInNakshatra / nakshatraSpan;
    const birthLordIndex = nakshatraIndex % 9;
    const totalYearsOfBirthLord = dashaYears[birthLordIndex];
    const balanceYears = totalYearsOfBirthLord * (1 - fractionTraversed);
    const format = (d) => {
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        return `${year}-${month}-${day}`;
    };
    const signNames = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

    const getAnalysis = (planetName) => {
        if (!planets || !dashaInterpretations[planetName]) return null;
        const p = planets[planetName];
        if (!p) return null;
        const signName = signNames[p.sign - 1];
        const interp = dashaInterpretations[planetName];
        const houseText = interp.houseEffects[p.house] || interp.houseEffects["1"] || "";
        const signText = interp.signEffects[signName] || "";
        return {
            sign: signName,
            house: p.house,
            description: interp.description,
            text: `🎯 House Influence (${p.house}):\n${houseText}\n\n🌟 Zodiac Influence (${signName}):\n${signText}`.trim() || interp.description
        };
    };

    const dashas = [];
    let currentDate = new Date(birthDate);
    const birthLord = dashaLords[birthLordIndex];
    const firstEndDate = new Date(currentDate);
    firstEndDate.setFullYear(firstEndDate.getFullYear() + Math.floor(balanceYears));
    const remDays = (balanceYears % 1) * 365.25;
    firstEndDate.setDate(firstEndDate.getDate() + remDays);

    dashas.push({
        lord: birthLord,
        start: format(new Date(birthDate)),
        startISO: new Date(birthDate).toISOString(),
        end: format(firstEndDate),
        duration: balanceYears,
        analysis: getAnalysis(birthLord)
    });

    currentDate = firstEndDate;
    for (let i = 1; i < 9; i++) {
        const idx = (birthLordIndex + i) % 9;
        const lord = dashaLords[idx];
        const duration = dashaYears[idx];
        const endDate = new Date(currentDate);
        endDate.setFullYear(endDate.getFullYear() + duration);
        dashas.push({ lord: lord, start: format(currentDate), startISO: currentDate.toISOString(), end: format(endDate), duration: duration, analysis: getAnalysis(lord) });
        currentDate = endDate;
    }

    const calculateSubPeriods = (startDate, parentLord, parentDurationYears, level) => {
        if (level > 3) return null; // Max Level 3 (Pratyantardasha)

        const subPeriods = [];
        let currentSubDate = new Date(startDate);
        const parentIndex = dashaLords.indexOf(parentLord);

        for (let i = 0; i < 9; i++) {
            const idx = (parentIndex + i) % 9;
            const subLord = dashaLords[idx];
            const subLordYears = dashaYears[idx];

            // Vimshottari Rule: Sub-period years = (Parent Years * This Planet Years) / 120
            const subDurationYears = (parentDurationYears * subLordYears) / 120;

            const subEndDate = new Date(currentSubDate);
            const totalDays = subDurationYears * 365.2425;
            subEndDate.setTime(subEndDate.getTime() + (totalDays * 24 * 60 * 60 * 1000));

            const subP = {
                lord: subLord,
                start: format(currentSubDate),
                end: format(subEndDate),
                startISO: currentSubDate.toISOString(),
                endISO: subEndDate.toISOString(),
                duration: subDurationYears,
                analysis: getAnalysis(subLord)
            };

            // Recursively calculate next level
            if (level < 3) {
                // For Pratyantardasha
                subP.subPeriods = calculateSubPeriods(currentSubDate, subLord, subDurationYears, level + 1);
            }

            subPeriods.push(subP);
            currentSubDate = subEndDate;
        }
        return subPeriods;
    };

    return {
        list: dashas.map(dasha => ({
            ...dasha,
            // Calculate Antardasha (Level 2)
            subPeriods: calculateSubPeriods(new Date(dasha.startISO), dasha.lord, dasha.duration, 2)
        })),
        birthNakshatra: NAKSHATRAS[nakshatraIndex]
    };
};

/**
 * Calculate Basic Panchang (Tithi & Vara)
 */
/**
 * Calculate Extended Panchang
 */
const calculatePanchang = (sunLong, moonLong, dateString, swe, julianDay) => {
    // 1. Tithi
    let diff = moonLong - sunLong;
    if (diff < 0) diff += 360;
    const tithiIndex = Math.floor(diff / 12) + 1;
    const tithiNames = [
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
        "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
        "Trayodashi", "Chaturdashi", "Purnima",
        "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
        "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
        "Trayodashi", "Chaturdashi", "Amavasya"
    ];
    const paksha = tithiIndex <= 15 ? "Shukla-Paksha" : "Krishna-Paksha";
    const tithiName = tithiNames[tithiIndex - 1];

    // 2. Vara (Day)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const d = new Date(dateString);
    const vara = days[d.getDay()];

    // 3. Nakshatra (Moon)
    const nakshatraSpan = 13.333333333;
    const nakIndex = Math.floor(moonLong / nakshatraSpan);
    const nakshatra = NAKSHATRAS[nakIndex];
    const pada = Math.floor((moonLong % nakshatraSpan) / 3.333333333) + 1;

    // 4. Yoga (Sun + Moon)
    const sum = (sunLong + moonLong) % 360;
    const yogaIndex = Math.floor(sum / 13.333333333);
    const yogas = [
        "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
        "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
        "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
    ];
    const yoga = yogas[yogaIndex];

    // 5. Karana (Half Tithi)
    const karanaIndex = Math.floor(diff / 6);
    const karanas = [
        "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
        "Shakuni", "Chatushpada", "Naga", "Kimstughna"
    ];
    // Logic for Karana cycle is complex, simplified mapping:
    // First 7 are movable, last 4 fixed.
    // For MVP/Demo, using a simplified cycle mapping or just returning the index.
    // Fixed logic:
    let karanaName = "";
    if (karanaIndex === 0) karanaName = "Kimstughna";
    else if (karanaIndex >= 57) karanaName = karanas[7 + (karanaIndex - 57)]; // Last 3 fixed
    else karanaName = karanas[(karanaIndex - 1) % 7];

    return {
        tithi: `${tithiName} (${paksha})`,
        vara,
        nakshatra: `${nakshatra} (Pada ${pada})`,
        yoga,
        karana: karanaName
    };
};

/**
 * Generate Full Kundli Data
 */
const generateKundli = async (dateString, timeString, lat, lng, timezone) => {
    const swe = await getGlobalSwe();
    try {
        const utcDate = tzUtils.getDateFromParts(dateString, timeString, timezone);
        if (!utcDate) throw new Error(`Invalid birth details: ${dateString} ${timeString}`);
        const jd = getJulianDay(swe, utcDate);
        const ayanamsa = swe.get_ayanamsa_ut(jd);
        const planets = calculatePlanets(swe, jd);
        const houseData = calculateHouses(swe, jd, lat, lng, ayanamsa);

        // Divisional Charts
        const d9Chart = calculateNavamsa(planets);

        // D10 Logic (Re-using logic inline or importing? Let's implement inline D10 simplified)
        // D10: Each sign divided into 10 parts of 3deg.
        // Rule: 
        // Odd Signs: 1-10 parts go to Same, 9th, 2nd, 7th... wait.
        // Standard D10 Rule:
        // In Odd Signs: Counts from the Sign itself.
        // In Even Signs: Counts from the 9th Sign from it.
        const calculateD10 = (pl) => {
            const d10 = {};
            Object.entries(pl).forEach(([name, p]) => {
                const lng = p.longitude;
                const sign = Math.floor(lng / 30) + 1;
                const deg = lng % 30;
                const part = Math.floor(deg / 3); // 0-9

                let startSign;
                if (sign % 2 !== 0) { // Odd
                    startSign = sign;
                } else { // Even
                    startSign = (sign + 9 - 1) % 12 + 1; // 9th from sign
                }

                const d10Sign = (startSign + part - 1) % 12 + 1;

                // Calculate D10 Longitude for display
                const d10Longitude = (lng * 10) % 360;

                const nakIndex = Math.floor(d10Longitude / 13.333333333);
                const d10Pada = Math.floor((d10Longitude % 13.333333333) / 3.333333333) + 1;

                d10[name] = {
                    sign: d10Sign,
                    house: d10Sign,
                    longitude: d10Longitude,
                    nakshatra: NAKSHATRAS[nakIndex % 27] || "Unknown", // Added bounds check
                    pada: d10Pada
                }; // House is relative, but sign is absolute
            });
            return d10;
        };
        const d10Chart = calculateD10(planets);

        const vimshottari = planets['Moon'] ? calculateVimshottari(planets['Moon'].longitude, dateString, planets, houseData) : null;
        const panchang = planets['Sun'] && planets['Moon'] ? calculatePanchang(planets['Sun'].longitude, planets['Moon'].longitude, dateString, swe, jd) : null;
        const arudha = calculateArudhaLagna(planets, houseData);

        return {
            meta: { date: dateString, time: timeString, lat, lng, timezone, julianDay: jd, ayanamsa: ayanamsa },
            planets,
            houses: houseData,
            charts: { D1: planets, D9: d9Chart, D10: d10Chart },
            dashas: vimshottari,
            panchang: panchang,
            arudha: arudha // Including Arudha in main response for convenience
        };
    } catch (error) {
        console.error("Kundli Calc Error:", error);
        throw error;
    }
};

/**
 * Check for Mangal Dosha
 * Mars in 1, 2, 4, 7, 8, 12 from Lagna and Moon
 */
const checkMangalDosha = (planets, houses) => {
    const marsSign = planets['Mars'].sign;
    const moonSign = planets['Moon'].sign;
    // Ascendant (Lagna) Sign
    const ascSign = Math.floor(houses.ascendant / 30) + 1;

    // Helper to calculate house position relative to a start sign
    const getHouseFrom = (startSign, currentSign) => {
        let h = currentSign - startSign + 1;
        if (h <= 0) h += 12;
        return h;
    };

    const marsFromLagna = getHouseFrom(ascSign, marsSign);
    const marsFromMoon = getHouseFrom(moonSign, marsSign);

    const doshaHouses = [1, 2, 4, 7, 8, 12];

    const isLagnaDosha = doshaHouses.includes(marsFromLagna);
    const isMoonDosha = doshaHouses.includes(marsFromMoon);

    let hasDosha = isLagnaDosha || isMoonDosha;
    let type = 'None';
    let cancellationReason = null;
    let isCancelled = false;

    if (hasDosha) {
        if (isLagnaDosha && isMoonDosha) type = 'High';
        else type = 'Low';

        // --- Cancellation / Nullification Rules ---
        // 1. Mars in Own Signs (Aries 1, Scorpio 8) or Exaltation (Capricorn 10) or Leo (5 - Friend/Special)
        if ([1, 8, 10, 5].includes(marsSign)) {
            isCancelled = true;
            cancellationReason = `Mars is in ${[1, 8].includes(marsSign) ? 'Own Sign' : marsSign === 10 ? 'Exaltation' : 'Leo (Simha)'}, which nullifies the Dosha.`;
        }
        // 2. Jupiter Conjunction (Jupiter in same sign)
        else if (planets['Jupiter'] && planets['Jupiter'].sign === marsSign) {
            isCancelled = true;
            cancellationReason = "Jupiter (Brihaspati) conjoins Mars, nullifying the Dosha.";
        }
        // 3. Moon ConjunctionExaltation (Moon in Cancer/Center) - Simplified check
        // 4. House Specific Exceptions (Parashara/Standard)
        // Mars in 2nd in Gemini(3)/Virgo(6)
        else if (isLagnaDosha && marsFromLagna === 2 && [3, 6].includes(marsSign)) isCancelled = true;
        // Mars in 4th in Aries(1)/Scorpio(8)
        else if (isLagnaDosha && marsFromLagna === 4 && [1, 8].includes(marsSign)) isCancelled = true;
        // Mars in 7th in Cancer(4)/Capricorn(10)
        else if (isLagnaDosha && marsFromLagna === 7 && [4, 10].includes(marsSign)) isCancelled = true;
        // Mars in 8th in Sagittarius(9)/Pisces(12)
        else if (isLagnaDosha && marsFromLagna === 8 && [9, 12].includes(marsSign)) isCancelled = true;
        // Mars in 12th in Taurus(2)/Libra(7) - Note: Reference image listed Mars in 4th?
        else if (isLagnaDosha && marsFromLagna === 12 && [2, 7].includes(marsSign)) isCancelled = true;

        if (isCancelled && !cancellationReason) {
            cancellationReason = "Dosha is nullified due to favorable planetary position (Exception Rule).";
        }
    }

    return {
        hasDosha: hasDosha, // Keep true to show it exists but is cancelled? Or false? reference says "Nullified (X)" implies Safe.
        // Better: hasDosha = !isCancelled.
        isPresent: hasDosha,
        isCancelled: isCancelled,
        type: isCancelled ? 'Nullified' : type,
        cancellationReason: cancellationReason,
        factors: {
            fromLagna: { hasDosha: isLagnaDosha, marsHouse: marsFromLagna },
            fromMoon: { hasDosha: isMoonDosha, marsHouse: marsFromMoon }
        },
        description: isCancelled
            ? `Mangal Dosha is present but **Nullified**. ${cancellationReason}`
            : (hasDosha
                ? `Mars is positioned in house ${isLagnaDosha ? marsFromLagna + ' from Lagna' : ''} ${isLagnaDosha && isMoonDosha ? 'and' : ''} ${isMoonDosha ? marsFromMoon + ' from Moon' : ''}, indicating Mangal Dosha.`
                : "Mars is well-positioned. No Mangal Dosha present.")
    };
};

/**
 * Check for Kaalsarp Dosha
 * All planets hemmed between Rahu and Ketu
 */
const checkKaalsarpDosha = (planets) => {
    const rahu = planets['Rahu'].longitude;
    const ketu = planets['Ketu'].longitude;

    // Other 7 major planets
    const others = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    let sideA = 0; // Planets between Rahu -> Ketu
    let sideB = 0; // Planets between Ketu -> Rahu

    // Normalize logic
    // Rahu to Ketu path (Rahu Longitude + dist to Ketu)
    // We check purely by longitude range

    // Define Range 1: Rahu to Ketu (Clockwise/Zodiacal order)
    // If Rahu < Ketu: Range is [Rahu, Ketu]
    // If Rahu > Ketu: Range is [Rahu, 360] U [0, Ketu]

    const isBetween = (planetLong, start, end) => {
        if (start < end) {
            return planetLong >= start && planetLong <= end;
        } else {
            return planetLong >= start || planetLong <= end;
        }
    };

    others.forEach(pName => {
        const pLong = planets[pName].longitude;
        // Check if in Rahu -> Ketu arc
        if (isBetween(pLong, rahu, ketu)) {
            sideA++;
        } else {
            sideB++;
        }
    });

    let type = null;
    let name = null;

    if (sideA === 7) {
        type = 'Rahu-Ketu (Anant)'; // Simplified naming, technically implies direction
        name = 'Kaalsarp Dosha is present (Planets between Rahu and Ketu)';
    } else if (sideB === 7) {
        type = 'Ketu-Rahu (Reverse)';
        name = 'Kaalsarp Dosha is present (Planets between Ketu and Rahu)';
    } else {
        return { hasDosha: false, description: "No Kaalsarp Dosha detected. Planets are distributed outside the Rahu-Ketu axis." };
    }

    return {
        hasDosha: true,
        type: type,
        description: name
    };
};

/**
 * Check for Shani Sade Sati
 * Sade Sati occurs when transit Saturn is in the sign before, the same sign, or the sign after the natal Moon.
 * @param {Object} planets - Natal planetary positions
 */
const checkSadeSati = async (planets, lat, lng, timezone) => {
    // 1. Get Natal Moon Sign (Rashi)
    const natalMoonSign = Math.floor(planets['Moon'].longitude / 30) + 1;

    // 2. Get Transit Saturn Sign
    // We calculate transit for "Now"
    const now = new Date();
    const transitDate = now.toISOString().split('T')[0];
    const transitTime = now.toTimeString().slice(0, 5);

    const transitData = await generateKundli(transitDate, transitTime, lat, lng, timezone);
    const transitSaturnSign = Math.floor(transitData.planets['Saturn'].longitude / 30) + 1;

    // 3. Define the 3 signs that trigger Sade Sati (12th, 1st, 2nd from natal Moon)
    const s12 = natalMoonSign === 1 ? 12 : natalMoonSign - 1;
    const s1 = natalMoonSign;
    const s2 = natalMoonSign === 12 ? 1 : natalMoonSign + 1;

    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

    let isSadeSati = false;
    let phase = "None";
    let phaseDescription = "";

    if (transitSaturnSign === s12) {
        isSadeSati = true;
        phase = "First Phase (Rising)";
        phaseDescription = "Saturn is transiting the 12th house from your natal Moon. This marks the beginning of Sade Sati, often involving emotional shifts and new responsibilities.";
    } else if (transitSaturnSign === s1) {
        isSadeSati = true;
        phase = "Peak Phase (Core)";
        phaseDescription = "Saturn is transiting over your natal Moon sign. This is the most intense period, requiring discipline, hard work, and patience.";
    } else if (transitSaturnSign === s2) {
        isSadeSati = true;
        phase = "Final Phase (Setting)";
        phaseDescription = "Saturn is in the 2nd house from your natal Moon. This is the concluding phase where you start seeing results of your previous efforts.";
    }

    return {
        isSadeSati,
        phase,
        phaseDescription,
        natalMoonSign: signs[natalMoonSign - 1],
        transitSaturnSign: signs[transitSaturnSign - 1],
        remedies: isSadeSati ? [
            "Chant 'Om Sham Shanaishcharaya Namah' 108 times on Saturdays.",
            "Donate black sesame seeds, mustard oil, or black clothes to the needy.",
            "Light a mustard oil lamp under a Peepal tree on Saturday evenings.",
            "Practice humility and help the elderly or disabled.",
            "Worship Lord Hanuman for protection from Saturn's malefic effects."
        ] : []
    };
};

/**
 * Calculate Match Making (Ashta Koot Milan)
 * Returns score out of 36
 */
const calculateMatch = (boyMoonLong, girlMoonLong) => {
    // 1. Get Nakshatra and Pada
    const getNakshatra = (long) => Math.floor(long / 13.333333333);
    const getSign = (long) => Math.floor(long / 30) + 1;

    const boyNak = getNakshatra(boyMoonLong);
    const girlNak = getNakshatra(girlMoonLong);
    const boySign = getSign(boyMoonLong);
    const girlSign = getSign(girlMoonLong);

    // Simplified Ashta Koot Logic (Demo logic for robustness, real logic is huge lookup tables)
    // We will simulate a score based on simple harmonic relationships for this MVP/Demo.
    // In a real app, you need a 27x27 matrix for each of the 8 Koots.

    let score = {
        varna: 1,      // 1
        vashya: 2,     // 2
        tara: 1.5,     // 3
        yoni: 2,       // 4
        maitri: 3,     // 5
        gana: 3,       // 6
        bhakoot: 5,    // 7
        nadi: 0        // 8
    };

    // Simple logic:
    // Same Sign or Trine (1, 5, 9 houses apart) = Good Maitri
    // Same Nadi = Bad (0)
    // Same Gana = Good (6)

    // Mock Calculation for meaningful demo variation:
    const diffNak = Math.abs(boyNak - girlNak);

    if (diffNak % 2 === 0) {
        score.nadi = 0; // Dosha
    } else {
        score.nadi = 8;
    }

    if (boySign === girlSign || Math.abs(boySign - girlSign) === 4 || Math.abs(boySign - girlSign) === 8) {
        score.bhakoot = 7;
    } else {
        score.bhakoot = 0;
    }

    if (diffNak % 3 === 0) score.gana = 6; else score.gana = 0;

    const totalScore = Object.values(score).reduce((a, b) => a + b, 0);

    return {
        total: totalScore,
        minPass: 18,
        details: score,
        boyNak: boyNak + 1, // 1-27
        girlNak: girlNak + 1,
        boySign,
        girlSign
    };
};

/**
 * Generate All Divisional Charts (D1-D60)
 */
const generateDivisionalCharts = async (dateString, timeString, lat, lng, timezone) => {
    const swe = await getGlobalSwe();
    const DivisionalCharts = require('./DivisionalCharts');

    try {
        const utcDate = tzUtils.getDateFromParts(dateString, timeString, timezone);
        const jd = getJulianDay(swe, utcDate);
        const ayanamsa = swe.get_ayanamsa_ut(jd);

        // 1. Calculate Core Planets (Sidereal)
        const planets = calculatePlanets(swe, jd);

        // 2. Calculate Ascendant (Sidereal)
        const houseData = calculateHouses(swe, jd, lat, lng, ayanamsa);
        const ascendantLong = houseData.ascendant;

        // 3. Generate Charts
        const charts = {};
        const vargas = [
            { key: 'D1', fn: DivisionalCharts.calculateD1 },
            { key: 'D2', fn: DivisionalCharts.calculateD2 },
            { key: 'D3', fn: DivisionalCharts.calculateD3 },
            { key: 'D4', fn: DivisionalCharts.calculateD4 },
            { key: 'D7', fn: DivisionalCharts.calculateD7 },
            { key: 'D9', fn: DivisionalCharts.calculateD9 },
            { key: 'D10', fn: DivisionalCharts.calculateD10 },
            { key: 'D12', fn: DivisionalCharts.calculateD12 },
            { key: 'D16', fn: DivisionalCharts.calculateD16 },
            { key: 'D20', fn: DivisionalCharts.calculateD20 },
            { key: 'D24', fn: DivisionalCharts.calculateD24 },
            { key: 'D27', fn: DivisionalCharts.calculateD27 },
            { key: 'D30', fn: DivisionalCharts.calculateD30 },
            { key: 'D40', fn: DivisionalCharts.calculateD40 },
            { key: 'D45', fn: DivisionalCharts.calculateD45 },
            { key: 'D60', fn: DivisionalCharts.calculateD60 }
        ];

        // Process each Varga
        vargas.forEach(({ key, fn }) => {
            const chartData = {};

            // Calculate for each Planet
            Object.entries(planets).forEach(([planetName, pData]) => {
                chartData[planetName] = {
                    sign: fn(pData.longitude),
                    longitude: pData.longitude
                };
            });

            // Calculate for Ascendant
            chartData['Ascendant'] = {
                sign: fn(ascendantLong),
                longitude: ascendantLong
            };

            charts[key] = chartData;
        });

        return {
            meta: {
                date: dateString,
                time: timeString,
                lat, lng, timezone,
                ayanamsa
            },
            charts
        };

    } catch (error) {
        console.error("Divisional Charts Calc Error:", error);
        throw error;
    }
};

/**
 * Calculate Yogini Dasha
 * Cycle of 36 Years.
 * Planets: Mangala(1), Pingala(2), Dhanya(3), Bhramari(4), Bhadrika(5), Ulka(6), Siddha(7), Sankata(8)
 * Starting Dasha determined by Nakshatra.
 */
const calculateYoginiDasha = (moonLongitude, birthDate) => {
    // 1. Define Yogini Lords, Years and Order
    // Order: Mangala, Pingala, Dhanya, Bhramari, Bhadrika, Ulka, Siddha, Sankata
    const yoginis = [
        { name: 'Mangala', lord: 'Moon', years: 1 },
        { name: 'Pingala', lord: 'Sun', years: 2 },
        { name: 'Dhanya', lord: 'Jupiter', years: 3 },
        { name: 'Bhramari', lord: 'Mars', years: 4 },
        { name: 'Bhadrika', lord: 'Mercury', years: 5 },
        { name: 'Ulka', lord: 'Saturn', years: 6 },
        { name: 'Siddha', lord: 'Venus', years: 7 },
        { name: 'Sankata', lord: 'Rahu', years: 8 }
    ];

    const nakshatras = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
        'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];

    // 2. Determine Birth Nakshatra
    const nakshatraSpan = 13.333333333; // 13 degrees 20 minutes
    const nakshatraIndex = Math.floor(moonLongitude / nakshatraSpan); // 0-26
    const degreesInNakshatra = moonLongitude % nakshatraSpan;
    const fractionTraversed = degreesInNakshatra / nakshatraSpan; // 0 to 1

    // 3. Determine Starting Yogini
    // Formula: (Nakshatra Index + 3) % 8
    // Note: Standard mapping often cites Ashwini->Mangala, but validating against popular online calculators (VedicRishi, DrikPanchang, InstaAstro) shows a different shift.
    // For example, Swati (Nakshatra 15, index 14) typically starts with Pingala (Index 1).
    // Our previous logic (14 % 8 = 6 -> Siddha) was consistent with Ashwini->Mangala.
    // To match Swati->Pingala, we need (14 + x) % 8 = 1. => 6+x = 1 (mod 8) => x = 3.
    // So New Formula: (nakshatraIndex + 3) % 8.
    // This implies Ashwini (0) -> (0+3) = 3 -> Bhramari.

    // 3. Determine Starting Yogini
    // Formula: (Nakshatra Index + 3) % 8
    // Confirmed Mapping: Magha (Index 9) -> Bhadrika (Index 4). 
    // Logic: (9 + 3) % 8 = 12 % 8 = 4 (Bhadrika).
    // Also Ashwini (0) -> Bhramari (3).
    const startYoginiIndex = (nakshatraIndex + 3) % 8;

    // 4. Calculate Balance and Theoretical Start Date
    // To match the reference style where a Dasha period is shown as a full block (e.g. 1976-1981) even if born in 1979.
    // Use fraction traversed to find the "start" of the current Dasha.

    const startYogini = yoginis[startYoginiIndex];
    // fractionTraversed is already calculated above
    const traversedYears = startYogini.years * fractionTraversed;
    const balanceYears = startYogini.years - traversedYears; // Remaining duration from birth

    // Calculate Theoretical Start Date of the first Dasha
    // Start Date = Birth Date - Traversed Duration
    const birthTime = new Date(birthDate).getTime();
    const traversedMs = traversedYears * 365.2425 * 24 * 60 * 60 * 1000;
    const theoreticalStartDate = new Date(birthTime - traversedMs);

    // 5. Generate Dasha Sequence
    const dashas = [];
    const format = (d) => {
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const year = d.getUTCFullYear();
        return `${year}-${month}-${day}`;
    };
    let currentDate = new Date(theoreticalStartDate);

    // First Dasha (Full Duration from Theoretical Start)
    const firstEndDate = new Date(currentDate);
    const daysToAdd = startYogini.years * 365.2425;
    firstEndDate.setTime(firstEndDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));

    dashas.push({
        isBalance: false,
        name: startYogini.name,
        lord: startYogini.lord,
        start: format(currentDate), // Theoretical Start (e.g. 1976)
        end: format(firstEndDate), // Theoretical End (e.g. 1983) => Birth (1979) is inside this.
        duration: startYogini.years,
        fullDuration: startYogini.years,
        remainingAtBirth: balanceYears // Optional metadata
    });

    currentDate = firstEndDate;

    // Generate subsequent cycles
    const totalCycles = 3;
    let currentYoginiIdx = (startYoginiIndex + 1) % 8;



    for (let i = 0; i < (8 * totalCycles); i++) {
        const yogini = yoginis[currentYoginiIdx];
        const duration = yogini.years;

        const endDate = new Date(currentDate);
        endDate.setFullYear(endDate.getFullYear() + duration);
        // Adjust for leap years/exact days if needed, but setFullYear is standard "Calendar Year" addition
        // For astrological precision, we might want days, but setFullYear is generally accepted for long dashas unless specified "Savana" (360 days).
        // Mixing "Balance calculated with days" and "Full years with Calendar" implies a slight drift, but is standard via Date object.

        dashas.push({
            name: yogini.name,
            lord: yogini.lord,
            start: format(currentDate),
            end: format(endDate),
            duration: duration,
            fullDuration: duration
        });

        currentDate = endDate;
        currentYoginiIdx = (currentYoginiIdx + 1) % 8;
    }

    // 6. Sub-Period (Antardasha) Calculation Helper
    // Logic: Sub Period Duration = (Main Period Years * Sub Period Years) / 36 (Total Cycle)
    // Order: Starts from the Lord itself and follows sequence.
    const calculateAntardashas = (parentDasha) => {
        const parentYogini = yoginis.find(y => y.name === parentDasha.name);
        const parentIdx = yoginis.indexOf(parentYogini);
        const subPeriods = [];
        let subDate = new Date(parentDasha.start);

        // If it's a balance dasha, the start date is birth date, but logical start was in past.
        // Antardashas are fixed slices of time.
        // If balance dasha, we must calculate ALL sub-periods, then filter/clip them to birth date.

        // Logical Start of this Mahadasha
        let logicalStartDate = new Date(parentDasha.start);
        if (parentDasha.isBalance) {
            // Backtrack to find when this Mahadasha theoretically started
            // Traversed Years = Full Duration - Balance
            const traversedYears = parentDasha.fullDuration - parentDasha.duration;
            const traversedDays = traversedYears * 365.2425;
            logicalStartDate = new Date(new Date(parentDasha.start).getTime() - (traversedDays * 24 * 60 * 60 * 1000));
            subDate = logicalStartDate;
        }

        for (let i = 0; i < 8; i++) {
            const idx = (parentIdx + i) % 8;
            const sub = yoginis[idx];

            // Formula: (Main Years * Sub Years) / 36
            // Result is in Years.
            const subDurationYears = (parentDasha.fullDuration * sub.years) / 36;

            const subEndDate = new Date(subDate);
            const subDays = subDurationYears * 365.2425;
            subEndDate.setTime(subEndDate.getTime() + (subDays * 24 * 60 * 60 * 1000));

            // If Balance Dasha, only include if it ends after Birth Date (parentDasha.start)
            if (parentDasha.isBalance) {
                const birthTime = new Date(parentDasha.start).getTime();
                const subEndTime = subEndDate.getTime();

                if (subEndTime > birthTime) {
                    // This sub-period is effective.
                    // Start might be clipped to birth date
                    const effectiveStart = subDate.getTime() < birthTime ? parentDasha.start : format(subDate);

                    subPeriods.push({
                        name: sub.name,
                        lord: sub.lord,
                        start: effectiveStart,
                        end: format(subEndDate),
                        duration: subDurationYears // Note: This is full theoretical duration, not clipped duration
                    });
                }
            } else {
                subPeriods.push({
                    name: sub.name,
                    lord: sub.lord,
                    start: format(subDate),
                    end: format(subEndDate),
                    duration: subDurationYears
                });
            }

            subDate = subEndDate;
        }
        return subPeriods;
    };

    return {
        birthNakshatra: nakshatras[nakshatraIndex],
        list: dashas.map(d => ({
            ...d,
            subPeriods: calculateAntardashas(d)
        }))
    };
};

const calculateArudhaLagna = (planets, houses) => {
    // 1. Get Ascendant Sign (Lagna)
    const lagnaSign = Math.floor(houses.ascendant / 30) + 1;

    // 2. Find Lagna Lord (with Dual Lordship for Scorpio 8 and Aquarius 11)
    const getStrongerLord = (sign) => {
        if (sign === 8) { // Scorpio
            const mars = planets['Mars'];
            const ketu = planets['Ketu'];
            // Rule: Sign with more planets is stronger. If equal, one being higher degree/stronger dignity etc. 
            // Simplified: Use dignity/strength or just standard Mars for now but allow for logic expansion
            // Common Jaimini: If Ketu and Mars are both in Scorpio, use the one with more degrees? 
            // Actually, most sites use the stronger one based on planetary associations.
            // For now, let's stick to standard Mars unless we implement full Jaimini strength.
            return 'Mars';
        }
        if (sign === 11) { // Aquarius
            // Saturn and Rahu
            return 'Saturn';
        }
        const lordship = {
            1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun', 6: 'Mercury',
            7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
        };
        return lordship[sign];
    };

    const lagnaLordName = getStrongerLord(lagnaSign);
    const lagnaLordSign = planets[lagnaLordName].sign;

    // 3. Count distance from Lagna to Lagna Lord (x)
    let x = lagnaLordSign - lagnaSign + 1;
    if (x <= 0) x += 12;

    // 4. Arudha is x signs away from Lagna Lord
    let alSign = (lagnaLordSign + (x - 1) - 1) % 12 + 1;

    // 5. Apply Exceptions (BPHS Chapter 29)
    // If AL falls in 1st (Lagna) or 7th from Lagna
    const houseFromLagna = (alSign - lagnaSign + 1 + 12) % 12 || 12;

    let shift = null;
    if (houseFromLagna === 1) {
        // If AL falls in House 1, shift to House 10 from Lagna
        alSign = (lagnaSign + 10 - 1 - 1) % 12 + 1;
        shift = "Shifted to 10th house (AL in 1st)";
    } else if (houseFromLagna === 7) {
        // If AL falls in House 7, shift to House 4 from Lagna
        alSign = (lagnaSign + 4 - 1 - 1) % 12 + 1;
        shift = "Shifted to 4th house (AL in 7th)";
    }

    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

    const result = {
        sign: alSign,
        signName: signs[alSign - 1],
        lagnaSign: lagnaSign,
        lagnaSignName: signs[lagnaSign - 1], // Added for clarity
        lagnaLord: lagnaLordName,
        finalHouseFromLagna: (alSign - lagnaSign + 1 + 12) % 12 || 12,
        exception: shift
    };

    return result;
};



/**
 * Generate Marriage & Career Specific Analysis
 */
const getMarriageCareerAnalysis = async (dateString, timeString, lat, lng, timezone, gender = 'male') => {
    const swe = await getGlobalSwe();
    try {
        const utcDate = tzUtils.getDateFromParts(dateString, timeString, timezone);
        if (!utcDate) throw new Error("Invalid Date/Time");
        const jd = getJulianDay(swe, utcDate);
        const ayanamsa = swe.get_ayanamsa_ut(jd);
        const planets = calculatePlanets(swe, jd); // D1 Chart
        const houseData = calculateHouses(swe, jd, lat, lng, ayanamsa); // D1 Houses

        // 1. Identify Lords
        // House 1 starts at houseData.cusps[0]. We need signs for 7th and 10th.
        // houses.cusps is [Asc, 2, 3, ... 12] in degrees.
        // Sign Index = Math.floor(degree / 30) (0=Aries, 1=Taurus...)

        const getSignByDegree = (deg) => Math.floor(deg / 30);
        const getLordOfSign = (signIndex) => {
            const rulers = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
            return rulers[signIndex % 12];
        };

        const seventhHouseCusp = houseData.cusps[6]; // 0-indexed, so 6 is 7th house
        const tenthHouseCusp = houseData.cusps[9];  // 9 is 10th house

        const seventhLord = getLordOfSign(getSignByDegree(seventhHouseCusp));
        const tenthLord = getLordOfSign(getSignByDegree(tenthHouseCusp));

        // 2. Identify Significators (Karakas)
        const marriageKarakas = [seventhLord, 'Venus'];
        if (gender === 'female') marriageKarakas.push('Jupiter');

        const careerKarakas = [tenthLord, 'Saturn', 'Sun', 'Mercury'];

        // 3. Calculate Dasha Periods (Full Lifespan)
        // We need a helper here. calculateVimshottari returns a structure, we need to iterate it.
        // For simplicity, we re-use calculateVimshottari but filter the output.
        const dashaData = planets['Moon'] ? calculateVimshottari(planets['Moon'].longitude, dateString, planets, houseData) : { list: [] };

        // 4. Filter for Favorable Periods
        const analyzePeriods = (karakas) => {
            const favorablePeriods = [];
            dashaData.list.forEach(mahadasha => {
                // Check Mahadasha Lord
                const isMahadashaFavorable = karakas.includes(mahadasha.lord);

                // If Mahadasha is favorable, all sub-periods are somewhat favorable/supported
                // But specifically highlighting strong sub-periods

                if (mahadasha.subPeriods) {
                    mahadasha.subPeriods.forEach(antardasha => {
                        const isAntardashaFavorable = karakas.includes(antardasha.lord);

                        // We want periods where EITHER Maha or Antar is a Karaka, 
                        // but strongest when BOTH or when Antar is strong.
                        // User asked for "possible period and dasha at that time only".

                        if (isMahadashaFavorable || isAntardashaFavorable) {
                            favorablePeriods.push({
                                start: antardasha.start,
                                end: antardasha.end,
                                mahadasha: mahadasha.lord,
                                antardasha: antardasha.lord,
                                strength: (isMahadashaFavorable && isAntardashaFavorable) ? "Very High" : "High",
                                reason: `${isMahadashaFavorable ? 'MD Lord ' + mahadasha.lord + ' is significant. ' : ''}${isAntardashaFavorable ? 'AD Lord ' + antardasha.lord + ' is significant.' : ''}`
                            });
                        }
                    });
                }
            });
            return favorablePeriods;
        };

        const marriagePeriods = analyzePeriods(marriageKarakas);
        const careerPeriods = analyzePeriods(careerKarakas);

        return {
            meta: { seventhLord, tenthLord, marriageKarakas, careerKarakas },
            marriage: marriagePeriods,
            career: careerPeriods
        };

    } catch (error) {
        console.error("Marriage/Career Calc Error:", error);
        throw error;
    }
};

/**
 * Calculate Jaimini Chara Karakas (7 Planet Scheme)
 * Order: Atmakaraka (Self), Amatyakaraka (Career), Bhratrukaraka (Siblings),
 * Matrukaraka (Mother), Putrakaraka (Children), Gnatikaraka (Relations), Darakaraka (Spouse)
 */
const calculateJaiminiKarakas = (planets) => {
    const karakaNames = [
        { key: 'AK', name: 'Atmakaraka', signifies: 'Self, Soul, Health' },
        { key: 'AmK', name: 'Amatyakaraka', signifies: 'Career, Status' },
        { key: 'BK', name: 'Bhratrukaraka', signifies: 'Siblings, Guru' },
        { key: 'MK', name: 'Matrukaraka', signifies: 'Mother, Emotions' },
        { key: 'PK', name: 'Putrakaraka', signifies: 'Children, Creativity' },
        { key: 'GK', name: 'Gnatikaraka', signifies: 'Obstacles, Relations' },
        { key: 'DK', name: 'Darakaraka', signifies: 'Spouse, Partnerships' }
    ];

    // 7 Karaka Scheme uses: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn
    // Rahu/Ketu are typically excluded in 7-scheme (some use 8-scheme with Rahu)
    const candidates = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    const planetDegrees = candidates.map(pName => {
        const p = planets[pName];
        if (!p) return null;
        return {
            name: pName,
            longitude: p.longitude,
            degree: p.longitude % 30 // Degree within sign
        };
    }).filter(Boolean);

    // Sort descending by degree. 
    // If degrees are exactly same, minute/second logic applies (higher minute wins).
    // JavaScript sort is stable enough for basic floats, but best to be explicit if needed.
    // For now simple float comparison is standard.
    planetDegrees.sort((a, b) => b.degree - a.degree);

    // Assign Karakas
    const karakas = karakaNames.map((k, index) => {
        const p = planetDegrees[index];
        return {
            ...k,
            planet: p ? p.name : 'Unknown',
            degree: p ? p.degree : 0
        };
    });

    return karakas;
};

module.exports = {
    generateKundli,
    calculatePlanets,
    calculateHouses,
    calculateNavamsa,
    calculateVimshottari,
    calculatePanchang,
    checkMangalDosha,
    checkKaalsarpDosha,
    checkSadeSati,
    calculateMatch,
    generateDivisionalCharts,
    calculateYoginiDasha,
    getMarriageCareerAnalysis,
    calculateArudhaLagna,
    calculateAshtakavarga,
    calculateJaiminiKarakas
};
