/**
 * Divisional Charts (Varga Chakras) Calculation Module
 * Implements Parashara's Shodashvarga system.
 */

// Helper: Normalize degrees to 0-360
const norm360 = (deg) => {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
};

// Helper: Get Sign (1-12) from Longitude
const getSign = (long) => Math.floor(long / 30) + 1;

/**
 * Common Logic for Regular Divisions (where each sign is divided equally)
 * @param {Number} long - Planet Longitude
 * @param {Number} div - Division Number (e.g., 7 for Saptamsa)
 * @param {Function} mappingFn - Function(sign, part) => resultingSign
 */
const calculateDivision = (long, div, mappingFn) => {
    const sign = getSign(long);
    const degInSign = long % 30;
    const partSize = 30 / div;
    const part = Math.floor(degInSign / partSize) + 1; // 1-based part index

    return mappingFn(sign, part);
};

// --- CHART ALGORITHMS ---

// D1 - Rasi
const calculateD1 = (long) => getSign(long);

// D2 - Hora (Parashara)
// Odd Signs: 1st half Sun (Leo-5), 2nd half Moon (Cancer-4)
// Even Signs: 1st half Moon (Cancer-4), 2nd half Sun (Leo-5)
const calculateD2 = (long) => {
    const sign = getSign(long);
    const deg = long % 30;
    const isOdd = sign % 2 !== 0;
    const isFirstHalf = deg < 15;

    if (isOdd) {
        return isFirstHalf ? 5 : 4;
    } else {
        return isFirstHalf ? 4 : 5;
    }
};

// D3 - Drekkana (Parashara)
// Part 1: Same Sign
// Part 2: 5th from Sign
// Part 3: 9th from Sign
const calculateD3 = (long) => {
    return calculateDivision(long, 3, (sign, part) => {
        if (part === 1) return sign;
        if (part === 2) return norm12(sign + 4); // 5th house
        if (part === 3) return norm12(sign + 8); // 9th house
    });
};

// D4 - Chaturthamsa
// Part 1: Same Sign
// Part 2: 4th from Sign
// Part 3: 7th from Sign
// Part 4: 10th from Sign
const calculateD4 = (long) => {
    return calculateDivision(long, 4, (sign, part) => {
        if (part === 1) return sign;
        if (part === 2) return norm12(sign + 3);
        if (part === 3) return norm12(sign + 6);
        if (part === 4) return norm12(sign + 9);
    });
};

// D7 - Saptamsa
// Odd Signs: Count from Same Sign
// Even Signs: Count from 7th from Sign
const calculateD7 = (long) => {
    return calculateDivision(long, 7, (sign, part) => {
        const startSign = (sign % 2 !== 0) ? sign : norm12(sign + 6);
        return norm12(startSign + (part - 1));
    });
};

// D9 - Navamsa (Classic)
// Count from:
// Fire (1,5,9): Aries (1)
// Earth (2,6,10): Capricorn (10)
// Air (3,7,11): Libra (7)
// Water (4,8,12): Cancer (4)
const calculateD9 = (long) => {
    return calculateDivision(long, 9, (sign, part) => {
        let startSign;
        if ([1, 5, 9].includes(sign)) startSign = 1;
        else if ([2, 6, 10].includes(sign)) startSign = 10;
        else if ([3, 7, 11].includes(sign)) startSign = 7;
        else startSign = 4;

        return norm12(startSign + (part - 1));
    });
};

// D10 - Dasamsa
// Odd Signs: Count from Same
// Even Signs: Count from 9th from Sign
const calculateD10 = (long) => {
    return calculateDivision(long, 10, (sign, part) => {
        const startSign = (sign % 2 !== 0) ? sign : norm12(sign + 8);
        return norm12(startSign + (part - 1));
    });
};

// D12 - Dwadasamsa
// Count from Same Sign
const calculateD12 = (long) => {
    return calculateDivision(long, 12, (sign, part) => {
        return norm12(sign + (part - 1));
    });
};

// D16 - Shodasamsa
// Moveable (1,4,7,10): Aries(1)
// Fixed (2,5,8,11): Leo(5)
// Dual (3,6,9,12): Sagittarius(9)
const calculateD16 = (long) => {
    return calculateDivision(long, 16, (sign, part) => {
        let startSign;
        if ([1, 4, 7, 10].includes(sign)) startSign = 1;
        else if ([2, 5, 8, 11].includes(sign)) startSign = 5;
        else startSign = 9;

        return norm12(startSign + (part - 1));
    });
};

// D20 - Vimsamsa
// Moveable: Calculated from Aries
// Fixed: Calculated from Sagittarius
// Dual: Calculated from Leo
const calculateD20 = (long) => {
    return calculateDivision(long, 20, (sign, part) => {
        let startSign;
        if ([1, 4, 7, 10].includes(sign)) startSign = 1;
        else if ([2, 5, 8, 11].includes(sign)) startSign = 9;
        else startSign = 5;

        return norm12(startSign + (part - 1));
    });
};

// D24 - Chaturvimsamsa
// Odd Signs: Start from Leo (5)
// Even Signs: Start from Cancer (4)
// Wait, classic Parashara rule:
// Odd: Start from Leo
// Even: Start from Cancer
// Reference: BPHS
const calculateD24 = (long) => {
    return calculateDivision(long, 24, (sign, part) => {
        const startSign = (sign % 2 !== 0) ? 5 : 4;
        return norm12(startSign + (part - 1));
    });
};

// D27 - Bhamsha / Saptavimsamsa
// Fire: Aries
// Earth: Cancer
// Air: Libra
// Water: Capricorn
// (Starts like Nakshatra Padas)
const calculateD27 = (long) => {
    return calculateDivision(long, 27, (sign, part) => {
        let startSign;
        if ([1, 5, 9].includes(sign)) startSign = 1;
        else if ([2, 6, 10].includes(sign)) startSign = 4;
        else if ([3, 7, 11].includes(sign)) startSign = 7;
        else startSign = 10;

        return norm12(startSign + (part - 1));
    });
};

// D30 - Trimsamsa (Parashara)
// Unique Structure based on degree ranges (not equal parts per se in standard counting way)
// Odd Signs: 0-5 Mars(1), 5-10 Sat(11), 10-18 Jup(9), 18-25 Merc(3), 25-30 Ven(7)
// Even Signs: 0-5 Ven(2), 5-12 Merc(6), 12-20 Jup(12), 20-25 Sat(10), 25-30 Mars(8)
const calculateD30 = (long) => {
    const sign = getSign(long);
    const deg = long % 30;
    const isOdd = sign % 2 !== 0;

    if (isOdd) {
        if (deg < 5) return 1; // Aries (Mars)
        if (deg < 10) return 11; // Aquarius (Saturn)
        if (deg < 18) return 9; // Sagittarius (Jupiter)
        if (deg < 25) return 3; // Gemini (Mercury)
        return 7; // Libra (Venus)
    } else {
        if (deg < 5) return 2; // Taurus (Venus)
        if (deg < 12) return 6; // Virgo (Mercury)
        if (deg < 20) return 12; // Pisces (Jupiter)
        if (deg < 25) return 10; // Capricorn (Saturn)
        return 8; // Scorpio (Mars)
    }
};

// D40 - Khavedamsa
// Odd: Aries
// Even: Libra
const calculateD40 = (long) => {
    return calculateDivision(long, 40, (sign, part) => {
        const startSign = (sign % 2 !== 0) ? 1 : 7;
        return norm12(startSign + (part - 1));
    });
};

// D45 - Akshavedamsa
// Moveable: Aries
// Fixed: Leo
// Dual: Sagittarius
const calculateD45 = (long) => {
    return calculateDivision(long, 45, (sign, part) => {
        let startSign;
        if ([1, 4, 7, 10].includes(sign)) startSign = 1;
        else if ([2, 5, 8, 11].includes(sign)) startSign = 5;
        else startSign = 9;

        return norm12(startSign + (part - 1));
    });
};

// D60 - Shashtyamsa
// Simply count from Sign itself (Parashara General Rule)
// Note: Some use specific deities, but for chart construction, it is sequential.
const calculateD60 = (long) => {
    return calculateDivision(long, 60, (sign, part) => {
        return norm12(sign + (part - 1));
    });
};

// Utility to normalize to 1-12 range
const norm12 = (val) => {
    let v = val % 12;
    if (v === 0) return 12;
    if (v < 0) return 12 + v;
    return v;
};

// Main Export
module.exports = {
    calculateD1,
    calculateD2,
    calculateD3,
    calculateD4,
    calculateD7,
    calculateD9,
    calculateD10,
    calculateD12,
    calculateD16,
    calculateD20,
    calculateD24,
    calculateD27,
    calculateD30,
    calculateD40,
    calculateD45,
    calculateD60
};
