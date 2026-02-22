const path = require('path');
const tzUtils = require('../utils/timezoneUtils');
const SunCalc = require('suncalc');
const moment = require('moment-timezone');

let SwissEphModule;

// --- CONSTANTS ---

const TITHI_NAMES = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"
];

const NAKSHATRA_NAMES = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
    "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const YOGA_NAMES = [
    "Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshan", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
];

const KARANA_NAMES = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
    "Shakuni", "Chatushpada", "Naga", "Kimstughna"
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const RASHI_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const SAMVATSARA_NAMES = [
    "Prabhava", "Vibhava", "Shukla", "Pramoda", "Prajapati", "Angirasa", "Srimukha", "Bhava", "Yuva", "Dhatri",
    "Ishwara", "Bahudhanya", "Pramathi", "Vikrama", "Vrishaprajapati", "Chitrabanu", "Subhanu", "Tarana", "Parthiva", "Vyaya",
    "Sarvajit", "Sarvadhari", "Virodhi", "Vikriti", "Khara", "Nandana", "Vijaya", "Jaya", "Manmatha", "Durmukha",
    "Hevilambi", "Vilambi", "Vikari", "Sharvari", "Plava", "Shubhakrit", "Shobhakrit", "Krodhi", "Vishvavasu", "Parabhava",
    "Plavanga", "Kilaka", "Saumya", "Sadharana", "Virodhakrit", "Paridhavi", "Pramadicha", "Ananda", "Rakshasa", "Nala",
    "Pingala", "Kalayukta", "Siddharthi", "Raudra", "Durmati", "Dundubhi", "Rudhirodgari", "Raktakshi", "Krodhana", "Akshaya"
];

const LUNAR_MONTHS = [
    "Chaitra", "Vaisakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
    "Ashvina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
];

const RITU_NAMES = [
    "Vasant (Spring)", "Grishma (Summer)", "Varsha (Monsoon)",
    "Sharad (Autumn)", "Hemant (Pre-Winter)", "Shishir (Winter)"
];

const AMRIT_KAAL_GHATIS_PRASHNAMARGA = [
    42, 48, 54, 52, 38, 35, 54, 44, 56,
    54, 44, 42, 45, 44, 38, 38, 28, 38,
    44, 48, 44, 34, 34, 42, 40, 48, 54
];
const AMRIT_KAAL_DURATION_GHATIS = 4; // 96 mins

const VARJYAM_START_GHATIS = [
    50, 24, 30, 40, 14, 21, 30, 20, 32,
    30, 20, 18, 22, 20, 14, 14, 10, 14,
    20, 24, 20, 10, 10, 18, 16, 24, 30
];

const CHOGHADIYA_DAY = {
    "Sunday": ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"],
    "Monday": ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit"],
    "Tuesday": ["Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],
    "Wednesday": ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh"],
    "Thursday": ["Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh"],
    "Friday": ["Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char"],
    "Saturday": ["Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal"]
};

const CHOGHADIYA_NIGHT = {
    "Sunday": ["Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh"],
    "Monday": ["Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char"],
    "Tuesday": ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal"],
    "Wednesday": ["Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg"],
    "Thursday": ["Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit"],
    "Friday": ["Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog"],
    "Saturday": ["Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh"]
};

const RAHU_INDICES = { 0: 7, 1: 1, 2: 6, 3: 4, 4: 5, 5: 3, 6: 2 };
const YAMA_INDICES = { 0: 4, 1: 3, 2: 2, 3: 1, 4: 0, 5: 6, 6: 5 };
const GULIKA_INDICES = { 0: 6, 1: 5, 2: 4, 3: 3, 4: 2, 5: 1, 6: 0 };

// --- HELPERS ---

// Singleton instance
let globalSwe = null;
let initPromise = null;

const getGlobalSwe = async () => {
    if (globalSwe) return globalSwe;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            if (!SwissEphModule) {
                SwissEphModule = (await import('swisseph-wasm')).default;
            }
            const swe = new SwissEphModule();
            // Initialize once
            await swe.initSwissEph();

            const ephePath = path.join(__dirname, '../../ephe');
            swe.set_ephe_path(ephePath.split(path.sep).join('/'));

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

// Calculations
const getTithi = (sunLong, moonLong) => {
    let diff = moonLong - sunLong;
    if (diff < 0) diff += 360;
    return diff / 12;
};
const getNakshatra = (moonLong) => moonLong / 13.333333333;
const getYoga = (sunLong, moonLong) => {
    let sum = sunLong + moonLong;
    if (sum > 360) sum -= 360;
    return sum / 13.333333333;
};
const getKarana = (sunLong, moonLong) => {
    let diff = moonLong - sunLong;
    if (diff < 0) diff += 360;
    return diff / 6;
};

// Calculate Padha (1-4)
const getPadha = (moonLong) => {
    const nakPos = moonLong % 13.333333333;
    return Math.floor(nakPos / 3.333333333) + 1;
};


// --- MAIN FUNCTION ---

const calculatePanchang = async (utcDate, lat, lng, timezone) => {
    const swe = await getGlobalSwe();
    try {
        const SE_SUN = swe.SE_SUN;
        const SE_MOON = swe.SE_MOON;
        const flag = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL;
        // swe.set_sid_mode(1, 0, 0); // Done globally 

        const toJD = (date) => {
            return swe.julday(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
                date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600, 1);
        };

        const fromJD = (jd) => {
            const unixMs = (jd - 2440587.5) * 86400000;
            return new Date(unixMs);
        };

        // 1. Sunrise JD
        const dayStartStr = tzUtils.formatInTimezone(utcDate, timezone, "YYYY-MM-DD");
        const dayStart = tzUtils.getStarOfDayInTimezone(dayStartStr, timezone);
        const dayStartDate = dayStart.toDate();
        const midDayDate = tzUtils.addMinutes(dayStartDate, 12 * 60);

        const scTimes = SunCalc.getTimes(midDayDate, lat, lng);
        const sunriseDate = scTimes.sunrise;
        const sunriseJD = toJD(sunriseDate);
        const sunsetDate = scTimes.sunset;

        // Position Helper
        const getPositions = (jd) => {
            const sun = swe.calc_ut(jd, SE_SUN, flag);
            const moon = swe.calc_ut(jd, SE_MOON, flag);
            return { sun: sun[0], moon: moon[0] };
        };

        // --- 2. TITHI AT SUNRISE ---
        const { sun: sLong, moon: mLong } = getPositions(sunriseJD);
        const tithiValSunrise = getTithi(sLong, mLong);
        const tithiIndex = Math.floor(tithiValSunrise);
        const tithiName = TITHI_NAMES[tithiIndex % 30];
        const isAmavasya = (tithiIndex % 30) === 29;

        // --- 3. GENERIC BOUNDARY SEARCH ---
        const findBoundary = (baseJD, bodyFunc, targetVal, cycle, forward) => {
            let t1 = forward ? baseJD : baseJD - 1.5;
            let t2 = forward ? baseJD + 1.5 : baseJD;

            for (let i = 0; i < 30; i++) {
                let mid = (t1 + t2) / 2;
                let val = bodyFunc(mid);

                let delta = val - targetVal;
                // Normalize wrap
                if (delta > cycle / 2) delta -= cycle;
                if (delta < -cycle / 2) delta += cycle;

                if (delta > 0) t2 = mid;
                else t1 = mid;
            }
            return t2;
        };

        // Tithi
        const tithiEndTimeJD = findBoundary(sunriseJD, (jd) => getTithi(getPositions(jd).sun, getPositions(jd).moon), tithiIndex + 1, 30, true);
        const tithiStartTimeJD = findBoundary(sunriseJD, (jd) => getTithi(getPositions(jd).sun, getPositions(jd).moon), tithiIndex, 30, false);

        // Nakshatra
        const nakVal = getNakshatra(mLong);
        const nakIndex = Math.floor(nakVal);
        const nakName = NAKSHATRA_NAMES[nakIndex % 27];
        const nakPadha = getPadha(mLong);

        const nakEndJD = findBoundary(sunriseJD, (jd) => getNakshatra(getPositions(jd).moon), nakIndex + 1, 27, true);
        const nakStartJD = findBoundary(sunriseJD, (jd) => getNakshatra(getPositions(jd).moon), nakIndex, 27, false);

        // Yoga
        const yogaVal = getYoga(sLong, mLong);
        const yogaIndex = Math.floor(yogaVal);
        const yogaName = YOGA_NAMES[yogaIndex % 27];
        const yogaEndJD = findBoundary(sunriseJD, (jd) => getYoga(getPositions(jd).sun, getPositions(jd).moon), yogaIndex + 1, 27, true);

        // Karana
        const karanaVal = getKarana(sLong, mLong);
        const karanaIndex = Math.floor(karanaVal);
        let kName = "";
        if (karanaIndex === 0) kName = "Kimstughna";
        else if (karanaIndex >= 57) {
            if (karanaIndex === 57) kName = "Shakuni";
            if (karanaIndex === 58) kName = "Chatushpada";
            if (karanaIndex === 59) kName = "Naga";
        } else {
            kName = KARANA_NAMES[(karanaIndex - 1) % 7];
        }
        const karanaEndJD = findBoundary(sunriseJD, (jd) => getKarana(getPositions(jd).sun, getPositions(jd).moon), karanaIndex + 1, 60, true);
        const karanaStartJD = findBoundary(sunriseJD, (jd) => getKarana(getPositions(jd).sun, getPositions(jd).moon), karanaIndex, 60, false);


        // --- FORMATTING ---
        const fmtFull = (d) => tzUtils.formatInTimezone(d, timezone, "YYYY-MM-DD HH:mm:ss");
        const fmtTime = (d) => tzUtils.formatInTimezone(d, timezone, "hh:mm:ss A");

        // --- Other calculations ---
        const nextDayMid = tzUtils.addMinutes(midDayDate, 24 * 60);
        const nextSunrise = SunCalc.getTimes(nextDayMid, lat, lng).sunrise;

        const dayDurationMin = tzUtils.diffMinutes(sunsetDate, sunriseDate);
        const midPointDate = tzUtils.addMinutes(sunriseDate, dayDurationMin / 2);
        const abhijitStart = tzUtils.addMinutes(midPointDate, -24);
        const abhijitEnd = tzUtils.addMinutes(midPointDate, 24);

        // Amrit Kaal
        const nakDurationMin = (nakEndJD - nakStartJD) * 24 * 60;
        const amritStartGhati = AMRIT_KAAL_GHATIS_PRASHNAMARGA[nakIndex % 27];
        const amritDur = (AMRIT_KAAL_DURATION_GHATIS / 60) * nakDurationMin;
        const amritStartMin = (amritStartGhati / 60) * nakDurationMin;
        const amritDate = fromJD(nakStartJD + (amritStartMin / 1440.0));

        // Varjyam (Tyajyam)
        const varjyamStartGhati = VARJYAM_START_GHATIS[nakIndex % 27];
        const varjyamStartMin = (varjyamStartGhati / 60) * nakDurationMin;
        const varjyamDate = fromJD(nakStartJD + (varjyamStartMin / 1440.0));

        // Rahu/Yama/Gulika
        const oneEighthDur = dayDurationMin / 8;
        const rahuIdx = RAHU_INDICES[dayStart.day()];
        const yamaIdx = YAMA_INDICES[dayStart.day()];
        const gulikaIdx = GULIKA_INDICES[dayStart.day()];

        const rahuStart = tzUtils.addMinutes(sunriseDate, rahuIdx * oneEighthDur);
        const rahuEnd = tzUtils.addMinutes(sunriseDate, (rahuIdx + 1) * oneEighthDur);
        const yamaStart = tzUtils.addMinutes(sunriseDate, yamaIdx * oneEighthDur);
        const yamaEnd = tzUtils.addMinutes(sunriseDate, (yamaIdx + 1) * oneEighthDur);
        const gulikaStart = tzUtils.addMinutes(sunriseDate, gulikaIdx * oneEighthDur);
        const gulikaEnd = tzUtils.addMinutes(sunriseDate, (gulikaIdx + 1) * oneEighthDur);

        // Loops
        const WEEKDAY_HORA_START = [0, 3, 6, 2, 5, 1, 4];
        const PLANET_NAMES_HORA = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
        let currentHoraPlanetIdx = WEEKDAY_HORA_START[dayStart.day()];
        const dayHoraDuration = dayDurationMin / 12;
        const dayHoras = [];
        for (let i = 0; i < 12; i++) {
            dayHoras.push({
                planet: PLANET_NAMES_HORA[currentHoraPlanetIdx],
                start: tzUtils.addMinutes(sunriseDate, i * dayHoraDuration),
                end: tzUtils.addMinutes(sunriseDate, (i + 1) * dayHoraDuration)
            });
            currentHoraPlanetIdx = (currentHoraPlanetIdx + 1) % 7;
        }
        const nightDurationMin = tzUtils.diffMinutes(nextSunrise, sunsetDate);
        const nightHoraDuration = nightDurationMin / 12;
        const nightHoras = [];
        for (let i = 0; i < 12; i++) {
            nightHoras.push({
                planet: PLANET_NAMES_HORA[currentHoraPlanetIdx],
                start: tzUtils.addMinutes(sunsetDate, i * nightHoraDuration),
                end: tzUtils.addMinutes(sunsetDate, (i + 1) * nightHoraDuration)
            });
            currentHoraPlanetIdx = (currentHoraPlanetIdx + 1) % 7;
        }

        const dayChogNames = CHOGHADIYA_DAY[WEEKDAYS[dayStart.day()]];
        const nightChogNames = CHOGHADIYA_NIGHT[WEEKDAYS[dayStart.day()]];
        const dayChogDur = dayDurationMin / 8;
        const nightChogDur = nightDurationMin / 8;
        const dayChoghadiya = dayChogNames.map((name, i) => ({
            name,
            start: tzUtils.addMinutes(sunriseDate, i * dayChogDur),
            end: tzUtils.addMinutes(sunriseDate, (i + 1) * dayChogDur)
        }));
        const nightChoghadiya = nightChogNames.map((name, i) => ({
            name,
            start: tzUtils.addMinutes(sunsetDate, i * nightChogDur),
            end: tzUtils.addMinutes(sunsetDate, (i + 1) * nightChogDur)
        }));

        const DURMUHURTHAM_INDICES = {
            0: [{ idx: 13, dur: 1 }],
            1: [{ idx: 8, dur: 1 }, { idx: 11, dur: 1 }],
            2: [{ idx: 3, dur: 1 }],
            3: [{ idx: 7, dur: 1 }],
            4: [{ idx: 5, dur: 1 }, { idx: 11, dur: 1 }],
            5: [{ idx: 3, dur: 1 }, { idx: 11, dur: 1 }],
            6: [{ idx: 0, dur: 2 }]
        };
        const durRules = DURMUHURTHAM_INDICES[dayStart.day()] || [];
        const oneMuhurthaMin = dayDurationMin / 15;
        const durmuhurtham = durRules.map(rule => ({
            start: tzUtils.addMinutes(sunriseDate, rule.idx * oneMuhurthaMin),
            end: tzUtils.addMinutes(sunriseDate, (rule.idx + rule.dur) * oneMuhurthaMin)
        }));

        // Samvat
        const month = utcDate.getUTCMonth();
        const currentYear = utcDate.getFullYear();
        let isBeforeNewYear = false;
        if (month <= 1) isBeforeNewYear = true;
        else if (month === 2 || month === 3) {
            if (sLong < 330 && sLong > 250) isBeforeNewYear = true;
            else if (sLong >= 330) {
                const tPhase = getTithi(sLong, mLong);
                if (tPhase >= 15) isBeforeNewYear = true;
            }
        }

        const samvatsaraIndex = ((isBeforeNewYear ? currentYear - 1 : currentYear) - 1987 + 60) % 60;
        const samvat = {
            name: SAMVATSARA_NAMES[samvatsaraIndex],
            vikram: isBeforeNewYear ? currentYear + 56 : currentYear + 57,
            shaka: isBeforeNewYear ? currentYear - 79 : currentYear - 78
        };

        // --- MASA (Lunar Month) & RITU (Season) ---
        // Rule: Amanta Month is determined by the Rashi the Sun is in at the moment of the *New Moon* (Amavasya) that began the month.
        // We approximate the Sun's position at the last New Moon by subtracting the degrees the Sun moved since then.
        // Days since New Moon ~= tithiValSunrise (1 tithi ~= 1 day, Sun moves ~1 degree/day).
        // So: Sun@NewMoon ~= CurrentSun - tithiValSunrise.

        let sunLongAtNewMoon = sLong - tithiValSunrise;
        if (sunLongAtNewMoon < 0) sunLongAtNewMoon += 360;

        const sunRashiIndexAtNewMoon = Math.floor(sunLongAtNewMoon / 30);
        let amantaIndex = (sunRashiIndexAtNewMoon + 1) % 12;

        // Purnimanta is one month ahead during Krishna Paksha (Tithi 15-30)
        // Note: North Indian tradition usually jumps to next month name right after Full Moon.
        const isKrishna = tithiIndex >= 15;
        let purnimantaIndex = isKrishna ? (amantaIndex + 1) % 12 : amantaIndex;

        const amantaMonth = LUNAR_MONTHS[amantaIndex];
        // For Purnimanta, we need to handle the case where it wraps around years.
        // But the array index modulo handles the month name correctly.
        const purnimantaMonth = LUNAR_MONTHS[purnimantaIndex];

        // Ritu is based on Amanta Month
        // 0 (Chaitra), 1 (Vaisakha) -> Vasant (0)
        // 2,3 -> Grishma (1)
        const rituIndex = Math.floor(amantaIndex / 2);
        const ritu = RITU_NAMES[rituIndex % 6];


        return {
            timezone,
            meta: { date: fmtFull(utcDate), latitude: lat, longitude: lng },
            samvat,
            masa: {
                amanta: amantaMonth,
                purnimanta: purnimantaMonth
            },
            ritu: ritu,
            vara: WEEKDAYS[dayStart.day()],
            sun: {
                sunrise: fmtTime(sunriseDate),
                sunset: fmtTime(sunsetDate),
                nextSunrise: fmtTime(nextSunrise),
                rashi: RASHI_NAMES[Math.floor(sLong / 30)]
            },
            moon: {
                moonrise: fmtTime(SunCalc.getMoonTimes(midDayDate, lat, lng).rise),
                moonset: fmtTime(SunCalc.getMoonTimes(midDayDate, lat, lng).set),
                rashi: RASHI_NAMES[Math.floor(mLong / 30)]
            },

            tithi: {
                name: tithiName,
                paksha: tithiIndex < 15 ? "Shukla" : "Krishna",
                index: tithiIndex + 1,
                start: fmtFull(fromJD(tithiStartTimeJD)),
                end: fmtFull(fromJD(tithiEndTimeJD)),
                is_amavasya: isAmavasya
            },

            nakshatra: {
                name: nakName,
                index: nakIndex + 1,
                padha: nakPadha, // Output Padha
                start: fmtFull(fromJD(nakStartJD)),
                end: fmtFull(fromJD(nakEndJD))
            },
            yoga: {
                name: yogaName,
                index: yogaIndex + 1,
                start: fmtFull(fromJD(findBoundary(sunriseJD, (j) => getYoga(getPositions(j).sun, getPositions(j).moon), yogaIndex, 27, false))),
                end: fmtFull(fromJD(yogaEndJD))
            },
            karana: {
                name: kName,
                start: fmtFull(fromJD(karanaStartJD)),
                end: fmtFull(fromJD(karanaEndJD))
            },

            abhijitMuhurta: { start: fmtTime(abhijitStart), end: fmtTime(abhijitEnd) },
            amritKaal: { start: fmtTime(amritDate), end: fmtTime(fromJD(nakStartJD + ((amritStartMin + amritDur) / 1440.0))) },
            varjyam: { start: fmtTime(varjyamDate), end: fmtTime(fromJD(nakStartJD + ((varjyamStartMin + amritDur) / 1440.0))) },

            rahuKalam: { start: fmtTime(rahuStart), end: fmtTime(rahuEnd) },
            yamaganda: { start: fmtTime(yamaStart), end: fmtTime(yamaEnd) },
            gulikaKalam: { start: fmtTime(gulikaStart), end: fmtTime(gulikaEnd) },

            choghadiya: {
                day: dayChoghadiya.map(c => ({ name: c.name, start: fmtTime(c.start), end: fmtTime(c.end) })),
                night: nightChoghadiya.map(c => ({ name: c.name, start: fmtTime(c.start), end: fmtTime(c.end) }))
            },
            hora: {
                day: dayHoras.map(h => ({ planet: h.planet, start: fmtTime(h.start), end: fmtTime(h.end) })),
                night: nightHoras.map(h => ({ planet: h.planet, start: fmtTime(h.start), end: fmtTime(h.end) }))
            },
            durmuhurtham: durmuhurtham.map(d => ({ start: fmtTime(d.start), end: fmtTime(d.end) }))
        };

    } catch (e) {
        console.error("Panchang Calc Error", e);
        throw e;
    }
    // No finally block to close swe
};

const calculateMonthlyPanchangLite = async (year, month, lat, lng, timezone) => {
    const swe = await getGlobalSwe();
    try {
        const SE_SUN = swe.SE_SUN;
        const SE_MOON = swe.SE_MOON;
        const flag = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED | swe.SEFLG_SIDEREAL;
        // swe.set_sid_mode(1, 0, 0); // Done globally 

        const toJD = (date) => {
            return swe.julday(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
                date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600, 1);
        };

        // Helper to optimize moment usage
        const daysInMonth = moment.tz({ year, month, day: 1 }, timezone).daysInMonth();
        const results = [];

        for (let i = 1; i <= daysInMonth; i++) {
            // 1. Sunrise JD
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            // Efficient star of day
            const dayStart = moment.tz(dateStr, "YYYY-MM-DD", timezone).startOf('day');
            const utcDate = dayStart.clone().utc().toDate(); // For return meta

            // Midday for SunCalc
            const midDayDate = dayStart.clone().add(12, 'hours').toDate();

            const scTimes = SunCalc.getTimes(midDayDate, lat, lng);
            const sunriseDate = scTimes.sunrise;
            const sunriseJD = toJD(sunriseDate);

            // Position Helper
            const getPositions = (jd) => {
                const sun = swe.calc_ut(jd, SE_SUN, flag);
                const moon = swe.calc_ut(jd, SE_MOON, flag);
                return { sun: sun[0], moon: moon[0] };
            };

            // --- 2. TITHI AT SUNRISE ---
            const { sun: sLong, moon: mLong } = getPositions(sunriseJD);
            const tithiValSunrise = getTithi(sLong, mLong);
            const tithiIndex = Math.floor(tithiValSunrise);
            const tithiName = TITHI_NAMES[tithiIndex % 30];
            const isAmavasya = (tithiIndex % 30) === 29;

            // --- 3. NAKSHATRA AT SUNRISE ---
            const nakVal = getNakshatra(mLong);
            const nakIndex = Math.floor(nakVal);
            const nakName = NAKSHATRA_NAMES[nakIndex % 27];
            const nakPadha = getPadha(mLong);

            // --- 4. MASA (Lunar Month) ---
            let sunLongAtNewMoon = sLong - tithiValSunrise;
            if (sunLongAtNewMoon < 0) sunLongAtNewMoon += 360;

            const sunRashiIndexAtNewMoon = Math.floor(sunLongAtNewMoon / 30);
            let amantaIndex = (sunRashiIndexAtNewMoon + 1) % 12;

            const isKrishna = tithiIndex >= 15;
            let purnimantaIndex = isKrishna ? (amantaIndex + 1) % 12 : amantaIndex;

            const amantaMonth = LUNAR_MONTHS[amantaIndex];
            const purnimantaMonth = LUNAR_MONTHS[purnimantaIndex];

            // Ritu
            const rituIndex = Math.floor(amantaIndex / 2);
            const ritu = RITU_NAMES[rituIndex % 6];

            // Samvat
            const m = utcDate.getUTCMonth();
            const y = utcDate.getFullYear();
            let isBeforeNewYear = false;
            if (m <= 1) isBeforeNewYear = true;
            else if (m === 2 || m === 3) {
                if (sLong < 330 && sLong > 250) isBeforeNewYear = true;
                else if (sLong >= 330) {
                    const tPhase = getTithi(sLong, mLong);
                    if (tPhase >= 15) isBeforeNewYear = true;
                }
            }
            const samvatsaraIndex = ((isBeforeNewYear ? y - 1 : y) - 1987 + 60) % 60;
            const samvat = {
                name: SAMVATSARA_NAMES[samvatsaraIndex],
                vikram: isBeforeNewYear ? y + 56 : y + 57,
                shaka: isBeforeNewYear ? y - 79 : y - 78
            };

            results.push({
                date: dayStart.format('YYYY-MM-DD'),
                day: i,
                dayOfWeek: dayStart.format('dddd'),
                timezone,
                meta: { date: tzUtils.formatInTimezone(utcDate, timezone, "YYYY-MM-DD HH:mm:ss"), latitude: lat, longitude: lng },
                samvat,
                masa: {
                    amanta: amantaMonth,
                    purnimanta: purnimantaMonth
                },
                ritu: ritu,
                vara: WEEKDAYS[dayStart.day()],
                tithi: {
                    name: tithiName,
                    paksha: tithiIndex < 15 ? "Shukla" : "Krishna",
                    index: tithiIndex + 1,
                    is_amavasya: isAmavasya,
                },
                nakshatra: {
                    name: nakName,
                    index: nakIndex + 1,
                    padha: nakPadha,
                },
            });
        }
        return results;

    } catch (e) {
        console.error("Panchang Lite Monthly Calc Error", e);
        throw e;
    }
    // No finally block to close swe
};

module.exports = { calculatePanchang, calculateMonthlyPanchangLite };
