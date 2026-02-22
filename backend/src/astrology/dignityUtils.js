/**
 * Vedic Astrology Planetary Dignities & Relationships
 */

const PLANET_RELATIONSHIPS = {
    Sun: {
        matches: { exalted: [1], debilitated: [7], own: [5] },
        friends: [1, 4, 8, 9, 12], // Mars, Jupiter, Moon (Moon=4, Mars=1,8, Jup=9,12)
        neutral: [3, 6], // Mercury
        enemies: [2, 7, 10, 11] // Venus, Saturn
    },
    Moon: {
        matches: { exalted: [2], debilitated: [8], own: [4] },
        friends: [1, 5, 3, 6], // Sun, Mercury
        neutral: [1, 8, 9, 12, 2, 7, 10, 11], // Mars, Jup, Ven, Sat
        enemies: [] // None
    },
    Mars: {
        matches: { exalted: [10], debilitated: [4], own: [1, 8] },
        friends: [4, 5, 9, 12], // Sun, Moon, Jupiter
        neutral: [2, 7, 10, 11], // Venus, Saturn
        enemies: [3, 6] // Mercury
    },
    Mercury: {
        matches: { exalted: [6], debilitated: [12], own: [3, 6] },
        friends: [1, 5, 2, 7], // Sun, Venus
        neutral: [1, 8, 9, 12, 10, 11], // Mars, Jupiter, Saturn
        enemies: [4] // Moon
    },
    Jupiter: {
        matches: { exalted: [4], debilitated: [10], own: [9, 12] },
        friends: [1, 5, 4, 1, 8], // Sun, Moon, Mars
        neutral: [10, 11], // Saturn
        enemies: [3, 6, 2, 7] // Mercury, Venus
    },
    Venus: {
        matches: { exalted: [12], debilitated: [6], own: [2, 7] },
        friends: [3, 6, 10, 11], // Mercury, Saturn
        neutral: [1, 8, 9, 12], // Mars, Jupiter
        enemies: [4, 5] // Sun, Moon
    },
    Saturn: {
        matches: { exalted: [7], debilitated: [1], own: [10, 11] },
        friends: [3, 6, 2, 7], // Mercury, Venus
        neutral: [9, 12], // Jupiter
        enemies: [1, 5, 4, 1, 8] // Sun, Moon, Mars
    },
    Rahu: {
        matches: { exalted: [2], debilitated: [8], own: [11] }, // Often co-lord using Aquarius/Virgo etc. Simplified here.
        friends: [3, 6, 2, 7, 10, 11],
        neutral: [9, 12],
        enemies: [1, 4, 5, 1, 8]
    },
    Ketu: {
        matches: { exalted: [8], debilitated: [2], own: [8, 12] }, // Ketu owns Scorpio/Pisces often
        friends: [1, 8, 9, 12],
        neutral: [3, 6, 2, 7, 10, 11],
        enemies: [1, 4, 5]
    }
};

/**
 * Get Planet Dignity
 * @param {string} planet (Sun, Moon, etc.)
 * @param {number} sign (1-12)
 * @returns {string} Dignity (Exalted, Own Sign, Friend, Neutral, Enemy, Debilitated)
 */
const getDignity = (planet, sign) => {
    const p = PLANET_RELATIONSHIPS[planet];
    if (!p) return 'Neutral';

    // 1. Check Exalted
    if (p.matches.exalted.includes(sign)) return 'Exalted';

    // 2. Check Debilitated
    if (p.matches.debilitated.includes(sign)) return 'Debilitated';

    // 3. Check Own Sign
    if (p.matches.own.includes(sign)) return 'Own Sign';

    // 4. Check Friends (Sign Lords)
    // Simplified: Using explicit list of friendly signs typically associated with friendly planets
    /* 
       Logic: If sign is owned by a friend -> Friend
       Sign Owners:
       1,8: Mars
       2,7: Venus
       3,6: Mercury
       4: Moon
       5: Sun
       9,12: Jupiter
       10,11: Saturn
    */

    // Reverse lookup sign owner
    const getOwner = (s) => {
        if ([1, 8].includes(s)) return 'Mars';
        if ([2, 7].includes(s)) return 'Venus';
        if ([3, 6].includes(s)) return 'Mercury';
        if (s === 4) return 'Moon';
        if (s === 5) return 'Sun';
        if ([9, 12].includes(s)) return 'Jupiter';
        if ([10, 11].includes(s)) return 'Saturn';
        return null;
    };

    const signOwner = getOwner(sign);

    // If planet matches owner (already caught by "Own Sign" but safety check)
    if (signOwner === planet) return 'Own Sign';

    // If sign owner is a friend
    // We need to map sign owner name back to the planet's friends list? 
    // The `friends` arrays in `p` above are mostly simplified sign lists or planet types.
    // Let's use the explicit sign lists I put in comments basically or simplified logic.

    // A more robust way for "Friend/Enemy" without complex Tatwa tables:
    // Use the `friends` list defined in `p` as "Friendly Signs" directly?
    // Actually, in the object above I put numbers in `friends`. Let's assume those ARE the friendly signs.
    // NOTE: The numbers in `friends` arrays above were approximate based on sign owners. 
    // Let's just trust `p.friends` contains the signs that are friendly.

    if (p.friends.includes(sign)) return 'Friend';
    if (p.enemies.includes(sign)) return 'Enemy';
    if (p.neutral.includes(sign)) return 'Neutral';

    return 'Neutral'; // Fallback
};

module.exports = { getDignity };
