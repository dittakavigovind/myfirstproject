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

export const containsContactInfo = (text) => {
    if (!text) return false;

    // Normalize string to make obfuscation harder
    let normalizedText = text.toLowerCase()
        .replace(/\[at\]/g, '@')
        .replace(/\(at\)/g, '@')
        .replace(/\{at\}/g, '@')
        .replace(/\s+at\s+/g, '@')
        .replace(/\[dot\]/g, '.')
        .replace(/\(dot\)/g, '.')
        .replace(/\{dot\}/g, '.')
        .replace(/\s+dot\s+/g, '.')
        .replace(/\s+/g, ''); // Remove spaces to catch "gov @ gmail . com" -> "gov@gmail.com"

    // Regex for basic email detection after normalization
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

    // Catch common email providers even if the TLD (.com) is missing like "user@gmail" or "user@gamil"
    const providersRegex = /@(gmail|yahoo|hotmail|outlook|live|icloud|gamil|ymail|aol)/i;

    // Regex for phone numbers (detects 10+ digits, even with spaces, dashes, or country codes)
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

    // Catch-all for continuous sequence of numbers like 9876543210 or spaced out like 9 8 7 6 5 4 3 2 1 0
    const numbersOnly = text.replace(/[^0-9]/g, '');

    return emailRegex.test(normalizedText) ||
        providersRegex.test(normalizedText) ||
        phoneRegex.test(text) ||
        numbersOnly.length >= 10;
};

export const getContactViolationType = (text) => {
    if (!text) return null;

    let normalizedText = text.toLowerCase()
        .replace(/\[at\]/g, '@')
        .replace(/\(at\)/g, '@')
        .replace(/\{at\}/g, '@')
        .replace(/\s+at\s+/g, '@')
        .replace(/\[dot\]/g, '.')
        .replace(/\(dot\)/g, '.')
        .replace(/\{dot\}/g, '.')
        .replace(/\s+dot\s+/g, '.')
        .replace(/\s+/g, '');

    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
    const providersRegex = /@(gmail|yahoo|hotmail|outlook|live|icloud|gamil|ymail|aol)/i;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const numbersOnly = text.replace(/[^0-9]/g, '');

    if (emailRegex.test(normalizedText) || providersRegex.test(normalizedText)) {
        return 'email';
    }
    if (phoneRegex.test(text) || numbersOnly.length >= 10) {
        return 'phone';
    }
    return null;
};

export const containsAbusiveLanguage = (text) => {
    if (!text) return false;

    // 1. Check exact word matches (with spaces intact)
    // This allows us to catch short bad words like "rey" without false positives from "sure you".
    const textWithSpaces = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
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

    // 2. Check space-stripped text to catch obfuscation like "f u c k"
    // We EXCLUDE very short words (3-4 chars) from this check because they cause massive false positives.
    // For example, "sure you" -> "sureyou" -> contains "rey".
    const normalizedTextWithoutSpaces = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    const shortOrCommonSubstrings = ["rey", "rai", "bodi", "puka", "puku", "cunt", "slut", "munda"];

    for (let word of abusiveWords) {
        // Skip short words for the space-stripped check to avoid Scunthorpe problems
        if (!shortOrCommonSubstrings.includes(word)) {
            if (normalizedTextWithoutSpaces.includes(word.replace(/\s+/g, ''))) {
                return true;
            }
        }
    }

    return false;
};
