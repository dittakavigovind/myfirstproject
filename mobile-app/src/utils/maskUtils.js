export const maskUserName = (name) => {
    if (!name) return 'Seeker';
    const cleanName = name.trim();
    if (cleanName.length > 5) {
        return cleanName.substring(0, 5) + '*'.repeat(cleanName.length - 5);
    } else if (cleanName.length > 3) {
        return cleanName.substring(0, 3) + '*'.repeat(cleanName.length - 3);
    } else {
        return cleanName + '*'.repeat(3);
    }
};

/**
 * Strips legitimate dates, times, years, and astrological coordinates/measurements
 * from text so they are not falsely treated as phone numbers.
 */
const stripDatesAndTimes = (text) => {
    if (!text) return '';
    let cleaned = text;

    const monthNames = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?';

    // 1. Full dates with month names (e.g. '15 August 1995', '15th Aug, 1995', 'Aug 15 1995', '15 Aug')
    const textualDateRegex1 = new RegExp(`\\b(?:0?[1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?[\\s/.-]+(?:${monthNames})[\\s/.-]+(?:19\\d\\d|20[0-3]\\d|\\d{2})\\b`, 'gi');
    const textualDateRegex2 = new RegExp(`\\b(?:${monthNames})[\\s/.-]+(?:0?[1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?(?:,)?[\\s/.-]+(?:19\\d\\d|20[0-3]\\d|\\d{2})\\b`, 'gi');
    const textualDateRegex3 = new RegExp(`\\b(?:0?[1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?[\\s/.-]+(?:${monthNames})\\b`, 'gi');

    // 2. Numeric dates (DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, YYYY-MM-DD, DD/MM/YY, etc.)
    const numericDateRegex1 = /\b(?:0?[1-9]|[12][0-9]|3[01])[\/.-](?:0?[1-9]|1[0-2])[\/.-](?:19\d\d|20[0-3]\d|\d{2})\b/g;
    const numericDateRegex2 = /\b(?:19\d\d|20[0-3]\d)[\/.-](?:0?[1-9]|1[0-2])[\/.-](?:0?[1-9]|[12][0-9]|3[01])\b/g;
    // Space-separated numeric date (e.g. 15 08 1995)
    const spaceNumericDate = /\b(?:0?[1-9]|[12][0-9]|3[01])\s+(?:0?[1-9]|1[0-2])\s+(?:19\d\d|20[0-3]\d)\b/g;

    // 3. Times (10:30 AM, 10:30:45 PM, 14:30, 10.30 AM, 10-30 AM, 10h 30m, 10 hrs 30 mins)
    const timeRegex1 = /\b(?:[01]?[0-9]|2[0-3])[:.][0-5][0-9](?:[:.][0-5][0-9])?(?:\s*(?:am|pm|hrs?|hours?))?\b/gi;
    const timeRegex2 = /\b(?:0?[1-9]|1[0-2])\s*(?:am|pm)\b/gi;
    const timeRegex3 = /\b(?:[01]?[0-9]|2[0-3])\s*(?:hrs?|hours?)(?:\s*[0-5]?[0-9]\s*(?:mins?|minutes?))?\b/gi;

    // 4. Standalone 4-digit years (1900-2035) commonly discussed in consultations
    const yearRegex = /\b(?:19\d\d|20[0-3]\d)\b/g;

    // 5. Astrological degrees / house numbers / ages / coordinates / pincodes
    const degreeRegex = /\b\d{1,2}(?:\.\d+)?\s*(?:°|deg|degrees?)\b/gi;
    const houseRegex = /\b(?:[1-9]|1[0-2])(?:st|nd|rd|th)?\s*house\b/gi;
    const ageRegex = /\b(?:age\s*)?\b\d{1,2}\s*(?:years?|yrs?|yr)\s*(?:old)?\b/gi;
    const pincodeRegex = /\b(?:pin|pincode|postal|zip)?\s*[1-9][0-9]{5}\b/gi;

    cleaned = cleaned
        .replace(textualDateRegex1, ' ')
        .replace(textualDateRegex2, ' ')
        .replace(textualDateRegex3, ' ')
        .replace(numericDateRegex1, ' ')
        .replace(numericDateRegex2, ' ')
        .replace(spaceNumericDate, ' ')
        .replace(timeRegex1, ' ')
        .replace(timeRegex2, ' ')
        .replace(timeRegex3, ' ')
        .replace(yearRegex, ' ')
        .replace(degreeRegex, ' ')
        .replace(houseRegex, ' ')
        .replace(ageRegex, ' ')
        .replace(pincodeRegex, ' ');

    return cleaned;
};

const checkEmailViolation = (text) => {
    if (!text) return false;

    // Normalize for email detection without falsely turning common English preposition "at" into "@"
    let normalizedForEmail = text.toLowerCase()
        .replace(/\[at\]|\(at\)|\{at\}/g, '@')
        .replace(/\s+(?:at|@)\s+(gmail|yahoo|hotmail|outlook|live|icloud|proton|rediff|zoho|mail|ymail|aol)\b/g, '@$1')
        .replace(/\s+(?:at|@)\s+([a-z0-9.-]+)\s*(?:\.|\s*(?:\[dot\]|\(dot\)|\bdot\b)\s*)\s*(com|in|org|net|co|io)\b/g, '@$1.$2')
        .replace(/\[dot\]|\(dot\)|\{dot\}/g, '.')
        .replace(/\s+/g, '');

    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
    const providersRegex = /@(gmail|yahoo|hotmail|outlook|live|icloud|gamil|ymail|aol)/i;

    return emailRegex.test(normalizedForEmail) || providersRegex.test(normalizedForEmail);
};

const checkPhoneViolation = (text) => {
    if (!text) return false;

    // Strip legitimate dates and times first so they are not treated as phone digits
    const textWithoutDateTime = stripDatesAndTimes(text);

    // Standard phone formats:
    // (a) Indian mobile numbers starting with 6, 7, 8, 9 (10 digits) with optional +91 / 0
    const indianMobileRegex = /(?:\+?91[\s.-]?|0)?[6-9]\d{4}[\s.-]?\d{5}\b/;
    const indianMobileFormatted = /(?:\+?91[\s.-]?|0)?[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{4}\b/;

    // (b) Spaced-out or symbol-separated digits e.g. "9 8 7 6 5 4 3 2 1 0" or "9.8.7.6.5.4.3.2.1.0"
    const spacedDigitsRegex = /(?:\+?91[\s.-]*)?[6-9](?:[\s.*_-]*\d){9}/;

    // (c) International standard format e.g. +1-234-567-8901, (123) 456-7890
    const generalPhoneRegex = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

    // (d) Catch-all for remaining digits (after stripping dates/times/years/pincodes)
    const remainingNumbers = textWithoutDateTime.replace(/[^0-9]/g, '');

    return (
        indianMobileRegex.test(textWithoutDateTime) ||
        indianMobileFormatted.test(textWithoutDateTime) ||
        spacedDigitsRegex.test(textWithoutDateTime) ||
        generalPhoneRegex.test(textWithoutDateTime) ||
        remainingNumbers.length >= 10
    );
};

export const containsContactInfo = (text) => {
    if (!text) return false;
    return checkEmailViolation(text) || checkPhoneViolation(text);
};

export const getContactViolationType = (text) => {
    if (!text) return null;
    if (checkEmailViolation(text)) return 'email';
    if (checkPhoneViolation(text)) return 'phone';
    return null;
};

export const containsAbusiveLanguage = (text) => {
    if (!text) return false;

    // 0. Whitelist common sacred Sanskrit, Vedic, and Astrological terms to completely prevent false positives
    const sacredTerms = [
        "nilanjana", "nilanjanam", "neelanjana", "neelanjanam", 
        "niranjana", "niranjanam", "anjana", "anjaneya", "anjaneyaya",
        "chamunda", "chamundaye", "chamundeshwari", "pukhraj", "pukharaj", "mandavya"
    ];

    let cleanText = text.toLowerCase();
    for (const term of sacredTerms) {
        cleanText = cleanText.replace(new RegExp(`\\b${term}\\b`, 'gi'), ' ');
    }

    // 1. Check exact word matches (with spaces intact)
    // This allows us to catch short bad words like "rey" without false positives from "sure you".
    const textWithSpaces = cleanText.replace(/[^a-z0-9\s]/g, ' ');
    const words = textWithSpaces.split(/\s+/);
    
    const abusiveWords = [
        "fuck", "bitch", "asshole", "bastard", "slut", "whore", "cunt", "motherfucker",
        "chutiya", "madarchod", "bhenchod", "bhosdike", "gandu", "bhadwe", "laude", "harami",
        "lavada", "modda", "pooku", "pooka", "pukaa", "puka", "puku", "lanja", "lanja kodaka",
        "lanja munda", "donganakodaka", "donga munda", "pove lanja", "dengutha", "dengai", "kodaka",
        "bodi", "denguthanu", "reyy", "rey", "rai", "munda", "bodi munda", "bodimunda"
    ];

    for (let w of words) {
        if (abusiveWords.includes(w)) {
            return true;
        }
    }

    // Check multi-word abusive phrases
    const multiWordAbuses = [
        "lanja kodaka", "lanja munda", "donga munda", "donganakodaka", "pove lanja", "bodi munda"
    ];
    for (const phrase of multiWordAbuses) {
        if (textWithSpaces.includes(phrase)) {
            return true;
        }
    }

    // 2. Check obfuscations like "f u c k" or "l a n j a"
    // Short or common substrings that could appear inside legitimate words are excluded from global space-stripped search
    const shortOrCommonSubstrings = ["rey", "rai", "bodi", "puka", "puku", "cunt", "slut", "munda", "lanja", "kodaka", "gandu"];

    // First: Check letter-spaced obfuscation (e.g., "f u c k", "l a n j a", "b i t c h")
    for (let word of abusiveWords) {
        if (word.includes(" ")) continue;
        if (word.length >= 3) {
            const spacedPattern = new RegExp(`\\b${word.split('').join('[\\s._\\-*]+')}\\b`, 'i');
            if (spacedPattern.test(cleanText)) {
                return true;
            }
        }
    }

    // Second: Check space-stripped text for long, specific profanities only (e.g. "motherfucker", "madarchod", "bhosdike")
    const normalizedTextWithoutSpaces = cleanText.replace(/[^a-z0-9]/g, '');
    for (let word of abusiveWords) {
        if (!shortOrCommonSubstrings.includes(word) && !word.includes(" ")) {
            if (normalizedTextWithoutSpaces.includes(word)) {
                return true;
            }
        }
    }

    return false;
};
