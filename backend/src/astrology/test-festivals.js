const { getFestivals } = require('./FestivalService');

const panchang = {
    tithi: { index: 10, paksha: 'Shukla' }, // Dashami
    masa: { amanta: 'Ashvina', purnimanta: 'Kartika' } // Ashvina Masa
};

console.log("Testing Dashami in Ashvina:");
const result = getFestivals(panchang);
console.log(result);
