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
