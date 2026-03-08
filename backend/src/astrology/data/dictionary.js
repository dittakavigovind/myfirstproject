const dictionary = {
    // English to Hindi Mappings
    enToHi: {
        // Planets
        'Sun': 'सूर्य (Sun)',
        'Moon': 'चन्द्र (Moon)',
        'Mars': 'मंगल (Mars)',
        'Mercury': 'बुध (Mercury)',
        'Jupiter': 'गुरु (Jupiter)',
        'Venus': 'शुक्र (Venus)',
        'Saturn': 'शनि (Saturn)',
        'Rahu': 'राहु (Rahu)',
        'Ketu': 'केतु (Ketu)',

        // Zodiac Signs
        'Aries': 'मेष',
        'Taurus': 'वृषभ',
        'Gemini': 'मिथुन',
        'Cancer': 'कर्क',
        'Leo': 'सिंह',
        'Virgo': 'कन्या',
        'Libra': 'तुला',
        'Scorpio': 'वृश्चिक',
        'Sagittarius': 'धनु',
        'Capricorn': 'मकर',
        'Aquarius': 'कुंभ',
        'Pisces': 'मीन',

        // Relations / Dignities
        'Exalted': 'उच्च',
        'Mooltrikona': 'मूलत्रिकोण',
        'Own Sign': 'स्वराशि',
        'Great Friend': 'अति मित्र',
        'Friend': 'मित्र',
        'Neutral': 'सम',
        'Enemy': 'शत्रु',
        'Great Enemy': 'अति शत्रु',
        'Debilitated': 'नीच',

        // Nakshatras
        'Ashwini': 'अश्विनी',
        'Bharani': 'भरणी',
        'Krittika': 'कृत्तिका',
        'Rohini': 'रोहिणी',
        'Mrigashira': 'मॄगशिरा',
        'Ardra': 'आर्द्रा',
        'Punarvasu': 'पुनर्वसु',
        'Pushya': 'पुष्य',
        'Ashlesha': 'आश्लेषा',
        'Magha': 'मघा',
        'Purva Phalguni': 'पूर्वाफाल्गुनी',
        'Uttara Phalguni': 'उत्तराफाल्गुनी',
        'Hasta': 'हस्त',
        'Chitra': 'चित्रा',
        'Swati': 'स्वाति',
        'Vishakha': 'विशाखा',
        'Anuradha': 'अनुराधा',
        'Jyeshtha': 'ज्येष्ठा',
        'Mula': 'मूल',
        'Purva Ashadha': 'पूर्वाषाढा',
        'Uttara Ashadha': 'उत्तराषाढा',
        'Shravana': 'श्रवण',
        'Dhanishta': 'धनिष्ठा',
        'Shatabhisha': 'शतभिषा',
        'Purva Bhadrapada': 'पूर्वाभाद्रपदा',
        'Uttara Bhadrapada': 'उत्तराभाद्रपदा',
        'Revati': 'रेवती',

        // Yogas
        'Vishkumbha': 'विष्कुम्भ',
        'Priti': 'प्रीति',
        'Ayushman': 'आयुष्मान',
        'Saubhagya': 'सौभाग्य',
        'Shobhana': 'शोभन',
        'Atiganda': 'अतिगण्ड',
        'Sukarma': 'सुकर्मा',
        'Dhriti': 'धृति',
        'Shula': 'शूल',
        'Ganda': 'गण्ड',
        'Vriddhi': 'वृद्धि',
        'Dhruva': 'ध्रुव',
        'Vyaghata': 'व्याघात',
        'Harshana': 'हर्षण',
        'Vajra': 'वज्र',
        'Siddhi': 'सिद्धि',
        'Vyatipata': 'व्यतीपात',
        'Variyan': 'वरीयान्',
        'Parigha': 'परिघ',
        'Shiva': 'शिव',
        'Siddha': 'सिद्ध',
        'Sadhya': 'साध्य',
        'Shubha': 'शुभ',
        'Shukla': 'शुक्ल',
        'Brahma': 'ब्रह्म',
        'Indra': 'इन्द्र',
        'Vaidhriti': 'वैधृति',

        // Karanas
        'Bava': 'बव',
        'Balava': 'बालव',
        'Kaulava': 'कौलव',
        'Taitila': 'तैतिल',
        'Gara': 'गर',
        'Vanija': 'वणिज',
        'Vishti': 'भद्रा (विष्टि)',
        'Shakuni': 'शकुनि',
        'Chatushpada': 'चतुष्पद',
        'Naga': 'नाग',
        'Kimstughna': 'किंस्तुघ्न',

        // Days
        'Sunday': 'रविवार',
        'Monday': 'सोमवार',
        'Tuesday': 'मंगलवार',
        'Wednesday': 'बुधवार',
        'Thursday': 'गुरुवार',
        'Friday': 'शुक्रवार',
        'Saturday': 'शनिवार'
    }
};

/**
 * Translates a given English term to Hindi.
 * If the term is a panchang string like "Pratipada (Shukla-Paksha)",
 * it parses and translates it.
 */
const translateToHi = (text) => {
    if (!text) return text;

    // Direct match
    if (dictionary.enToHi[text]) {
        return dictionary.enToHi[text];
    }

    let translated = text;

    // Paksha handling
    translated = translated.replace('(Shukla-Paksha)', '(शुक्ल पक्ष)');
    translated = translated.replace('(Krishna-Paksha)', '(कृष्ण पक्ष)');

    // Tithi handling
    const tithis = {
        'Pratipada': 'प्रतिपदा',
        'Dwitiya': 'द्वितीया',
        'Tritiya': 'तृतीया',
        'Chaturthi': 'चतुर्थी',
        'Panchami': 'पंचमी',
        'Shashthi': 'षष्ठी',
        'Saptami': 'सप्तमी',
        'Ashtami': 'अष्टमी',
        'Navami': 'नवमी',
        'Dashami': 'दशमी',
        'Ekadashi': 'एकादशी',
        'Dwadashi': 'द्वादशी',
        'Trayodashi': 'त्रयोदशी',
        'Chaturdashi': 'चतुर्दशी',
        'Purnima': 'पूर्णिमा',
        'Amavasya': 'अमावस्या'
    };

    for (const [en, hi] of Object.entries(tithis)) {
        if (translated.includes(en)) {
            translated = translated.replace(en, hi);
        }
    }

    // Pada handling
    if (translated.includes('(Pada ')) {
        translated = translated.replace('(Pada 1)', '(पद १)');
        translated = translated.replace('(Pada 2)', '(पद २)');
        translated = translated.replace('(Pada 3)', '(पद ३)');
        translated = translated.replace('(Pada 4)', '(पद ४)');
    }

    return translated;
};

module.exports = {
    dictionary,
    translateToHi
};
