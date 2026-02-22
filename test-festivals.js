const { getFestivals } = require('./backend/src/astrology/FestivalService');

const testCases = [
    {
        name: "Shukla Chaturthi in Magha (e.g. Feb 22, 2026)",
        panchang: {
            tithi: { index: 4 },
            masa: { amanta: "Magha" }
        }
    },
    {
        name: "Shukla Chaturthi in Bhadrapada",
        panchang: {
            tithi: { index: 4 },
            masa: { amanta: "Bhadrapada" }
        }
    },
    {
        name: "Krishna Chaturthi (Sankashti) in Magha",
        panchang: {
            tithi: { index: 19 },
            masa: { amanta: "Magha" }
        }
    }
];

console.log("--- Festival Logic Verification ---");
testCases.forEach(tc => {
    const festivals = getFestivals(tc.panchang);
    console.log(`\nCase: ${tc.name}`);
    console.log(`Month: ${tc.panchang.masa.amanta}, Tithi Index: ${tc.panchang.tithi.index}`);
    if (festivals.length === 0) {
        console.log("No festivals found.");
    } else {
        festivals.forEach(f => console.log(`- ${f.name}: ${f.description}`));
    }
});
