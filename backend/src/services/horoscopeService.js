// const swisseph = require('swisseph');
// const { swe_julday, swe_calc_ut, SE_MOON, SEFLG_SwIEPH, SEFLG_SIDEREAL, SEFLG_SPEED, SE_SIDM_LAHIRI } = swisseph;

const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Mock Content for "Predictions"
// In a real app, this would query a CMS or use GPT to generate text based on transit positions.
const PREDICTIONS = {
    good: [
        "Today brings clarity and focus to your goals.",
        "A great day for financial gains and investments.",
        "Relationships blossom with improved communication.",
        "Health and vitality are at their peak today.",
        "Unexpected opportunities may knock on your door."
    ],
    average: [
        "A steady day with routine activities dominating.",
        "Keep a check on your expenses today.",
        "Avoid unnecessary arguments with loved ones.",
        "Focus on completing pending tasks.",
        "Balance is key to your mental peace today."
    ],
    challenging: [
        "You may feel a bit low on energy; take rest.",
        "Watch your words as misunderstandings are likely.",
        "Avoid major decisions or heavy investments today.",
        "Patience is your best ally right now.",
        "Work pressure might be high, stay organized."
    ]
};

/**
 * Get Horoscope for a specific sign
 * @param {String} signName - e.g., "Aries"
 * @param {String} type - "daily", "weekly", "monthly"
 */
const getHoroscope = (signName, type = 'daily') => {
    const signIndex = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === signName.toLowerCase());

    if (signIndex === -1) throw new Error("Invalid Zodiac Sign");

    // Determine "Luck" randomly for demo, or based on Moon transit in real implementation
    // Ideally: Calculate Moon's current sign. 
    // If Moon is in 6, 8, 12 from User Sign -> Challenging.
    // If Moon is in 1, 5, 9 -> Good.
    // Others -> Average.

    // Deterministic Mock based on Date + Sign Length
    const dateVal = new Date().getDate();
    const seed = (signIndex + dateVal) % 3;

    let mood = 'average';
    if (seed === 0) mood = 'good';
    if (seed === 1) mood = 'average';
    if (seed === 2) mood = 'challenging';

    // Customize text based on Type
    let title = `Daily Horoscope for ${signName}`;
    if (type === 'weekly') title = `Weekly Forecast`;
    if (type === 'monthly') title = `Monthly Overview`;

    const predictionText = PREDICTIONS[mood][Math.floor(Math.random() * PREDICTIONS[mood].length)];

    return {
        sign: signName,
        type,
        date: new Date().toISOString(),
        prediction: predictionText,
        rating: Math.floor(Math.random() * 5) + 1, // 1-5 stars
        luckyColor: ['Red', 'Blue', 'Green', 'Yellow', 'White'][Math.floor(Math.random() * 5)],
        luckyNumber: Math.floor(Math.random() * 9) + 1
    };
};

module.exports = { getHoroscope };
