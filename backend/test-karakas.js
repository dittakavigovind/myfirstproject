const AstroService = require('./src/astrology/AstroService');

async function test() {
    try {
        console.log("Starting test...");
        // Sample birth details for Ongole (from user screenshot)
        // 12-Mar-1979, 08:15:00 AM, Ongole, Andhra Pradesh
        const date = "1979-03-12";
        const time = "08:15";
        const lat = 15.5057;
        const lng = 80.0493;
        const tz = 5.5;

        console.log("Generating Kundli...");
        const kundli = await AstroService.generateKundli(date, time, lat, lng, tz);
        console.log("Kundli generated successfully.");

        console.log("Calculating Karakas...");
        const karakas = AstroService.calculateJaiminiKarakas(kundli.planets);
        console.log("Karakas calculated:");
        console.log(JSON.stringify(karakas, null, 2));

    } catch (err) {
        console.error("Test failed:", err);
    }
}

test();
