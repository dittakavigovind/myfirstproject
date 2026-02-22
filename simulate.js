const calculateAL = (lagnaSign, lordSign, planets) => {
    // 3. Count distance from Lagna to Lagna Lord (x)
    let x = lordSign - lagnaSign + 1;
    if (x <= 0) x += 12;

    // 4. Arudha is x signs away from Lagna Lord
    let alSign = (lordSign + (x - 1) - 1) % 12 + 1;

    // 5. Apply Exceptions
    const houseFromLagna = (alSign - lagnaSign + 1 + 12) % 12 || 12;

    let shift = null;
    let oldAL = alSign;
    if (houseFromLagna === 1) {
        alSign = (lagnaSign + 10 - 1 - 1) % 12 + 1;
        shift = "Shifted to 10th house (AL in 1st)";
    } else if (houseFromLagna === 7) {
        alSign = (lagnaSign + 4 - 1 - 1) % 12 + 1;
        shift = "Shifted to 4th house (AL in 7th)";
    }

    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

    return {
        lagnaSign,
        lordSign,
        distance: x,
        rawAL: oldAL,
        houseFromLagna,
        finalAL: alSign,
        finalSignName: signs[alSign - 1],
        shift
    };
};

console.log("Scenario from Screenshot: Lagna is Gemini (3), Lord Mercury (2 or 3 or 4?) Results in Aquarius (11)");
// If AL is 11 (Aquarius)
// If lord is in house 5 (sign 7): distance 5. 7+4=11. Raw AL is 11. houseFromLagna is 9. No shift. result 11.
console.log("Hypothesis: Mercury is in Sign 7 (Libra), House 5");
console.log(calculateAL(3, 7));

// In the screenshot it says "3 (House 1)". This means Gemini is in house 1.
// If lord Mercury is in Sign 3 (Gemini), x=1. Raw AL = 3. houseFromLagna = 1. Shifted to 10th house from 3 = 12 (Pisces).
console.log("\nIf Mercury is in Sign 3:");
console.log(calculateAL(3, 3));
