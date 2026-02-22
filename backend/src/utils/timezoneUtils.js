const moment = require('moment-timezone');

/**
 * Validates if the timezone string is valid.
 * @param {string} timezone - Timezone string (e.g., 'Asia/Kolkata')
 * @returns {boolean}
 */
const isValidTimezone = (timezone) => {
    return !!moment.tz.zone(timezone);
};

/**
 * Current Time in Target Timezone
 * @param {string} timezone 
 * @returns {moment.Moment}
 */
const nowInTimezone = (timezone) => {
    return moment().tz(timezone);
};

/**
 * Convert input date to Target Timezone Start of Day (00:00:00)
 * @param {string} date - Date string 'YYYY-MM-DD'
 * @param {string} timezone 
 * @returns {moment.Moment}
 */
const getStarOfDayInTimezone = (date, timezone) => {
    return moment.tz(date, "YYYY-MM-DD", timezone).startOf('day');
};

/**
 * Convert moment object (or date) to UTC Date Object
 * @param {moment.Moment|Date|string} date 
 * @returns {Date}
 */
const toUTC = (date) => {
    return moment(date).utc().toDate();
};

/**
 * Format a UTC Date back to the Target Timezone string
 * @param {Date|moment.Moment} date - UTC date
 * @param {string} timezone - Target timezone
 * @param {string} format - Output format
 * @returns {string}
 */
const formatInTimezone = (date, timezone, format = "YYYY-MM-DD HH:mm:ss") => {
    if (!date) return null;
    return moment(date).tz(timezone).format(format);
};

/**
 * Add minutes to a date in a timezone-safe way
 * @param {Date} date 
 * @param {number} minutes 
 * @returns {Date} New UTC Date
 */
const addMinutes = (date, minutes) => {
    return moment(date).add(minutes, 'minutes').toDate();
};

/**
 * Calculate difference in minutes
 */
const diffMinutes = (date1, date2) => {
    return moment(date1).diff(moment(date2), 'minutes', true);
};

/**
 * Create a UTC Date object from date, time and timezone
 * Support both IANA strings ('Asia/Kolkata') and numeric offsets (5.5)
 */
const getDateFromParts = (dateStr, timeStr, timezone) => {
    // If dateStr is an ISO string (from frontend toISOString()), extract just the date part
    let cleanDate = dateStr;
    if (dateStr && dateStr.includes('T')) {
        cleanDate = dateStr.split('T')[0];
    }

    const dt = `${cleanDate} ${timeStr}`;
    // Supported formats including the standard Indian/User-friendly ones
    const formats = [
        "YYYY-MM-DD HH:mm",
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DD h:mm A",
        "YYYY-MM-DD hh:mm A",
        "DD/MM/YYYY HH:mm",
        "DD-MM-YYYY HH:mm",
        "DD-MM-YYYY h:mm A",
        "DD-MM-YYYY hh:mm A",
        "DD/MM/YYYY h:mm A",
        "DD/MM/YYYY hh:mm A"
    ];

    let m;
    // Try formats one by one to ensure robust parsing
    for (const fmt of formats) {
        if (typeof timezone === 'string' && moment.tz.zone(timezone)) {
            m = moment.tz(dt, fmt, timezone);
        } else {
            const offsetHours = parseFloat(timezone);
            if (!isNaN(offsetHours)) {
                m = moment(dt, fmt).utcOffset(offsetHours * 60, true);
            } else {
                m = moment(dt, fmt);
            }
        }
        if (m.isValid()) break;
    }

    if (!m.isValid()) {
        console.error(`[TZ_UTILS] Invalid Date/Time Construction: "${dt}" (Parsed with formats: ${formats.join(', ')})`);
        return null; // Return null instead of "now" to fail explicitly
    }

    return m.toDate();
};

module.exports = {
    isValidTimezone,
    nowInTimezone,
    getStarOfDayInTimezone,
    toUTC,
    formatInTimezone,
    addMinutes,
    diffMinutes,
    getDateFromParts
};
