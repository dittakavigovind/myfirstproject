const lordship = {
    1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun', 6: 'Mercury',
    7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

const calculateAL = (lagnaSign, lordSign) => {
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

    return {
        lagnaSign,
        lordSign,
        distance: x,
        rawAL: oldAL,
        houseFromLagna,
        finalAL: alSign,
        shift
    };
};

console.log("Test 1: Lagna 12, Lord 3 (Hit 7)");
console.log(calculateAL(12, 3));

console.log("\nTest 2: Lagna 1, Lord 1 (Hit 1)");
console.log(calculateAL(1, 1));

console.log("\nTest 3: Lagna 3, Lord 7 (Standard, No Hit)");
console.log(calculateAL(3, 7));
