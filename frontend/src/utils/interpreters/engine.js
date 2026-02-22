import { PLANETS_IN_SIGNS, PLANETS_IN_HOUSES, CHARTS_SPECIFIC } from './data';

const PLANET_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

/**
 * Generates interpretations for a given chart (Object).
 * 
 * @param {Object} planets - The chart object { Sun: { sign: 1, ... }, Ascendant: { sign: 1 } }
 * @param {string} chartKey - The chart identifier (e.g., 'D1', 'D9')
 * @returns {Array} - Array of interpretation objects { planet, signText, houseText }
 */
export function getPlanetInterpretations(planets, chartKey = 'D1') {
    if (!planets || !planets.Ascendant) return [];

    const ascendantSign = planets.Ascendant.sign;
    const results = [];

    PLANET_NAMES.forEach(planetName => {
        const planetData = planets[planetName];
        if (!planetData) return;

        // Determine Sign
        let sign = planetData.sign;
        if (!sign && planetData.longitude !== undefined) {
            sign = Math.floor(planetData.longitude / 30) + 1;
        }

        if (!sign) return;

        // Determine House
        // Formula: (PlanetSign - AscendantSign + 12) % 12 + 1
        // Example: Asc = 1 (Aries), Planet = 4 (Cancer) -> (4 - 1 + 12) % 12 + 1 = 4th House
        const house = ((sign - ascendantSign + 12) % 12) + 1;

        // Fetch Texts with Fallback Logic
        // 1. Specific Chart Override (e.g. D9 Sun House 1)
        // 2. Generic Reading

        let signText = PLANETS_IN_SIGNS[planetName]?.[sign] || `${planetName} in Sign ${sign}`;
        let houseText = PLANETS_IN_HOUSES[planetName]?.[house] || `${planetName} in House ${house}`;

        // Check for Specific Chart Overrides
        if (CHARTS_SPECIFIC[chartKey]) {
            // Check House Override
            if (CHARTS_SPECIFIC[chartKey][planetName]?.House?.[house]) {
                houseText = CHARTS_SPECIFIC[chartKey][planetName].House[house];
            }
            // Check Sign Override (Future proofing, if we add specific sign readings)
            if (CHARTS_SPECIFIC[chartKey][planetName]?.Sign?.[sign]) {
                signText = CHARTS_SPECIFIC[chartKey][planetName].Sign[sign];
            }
        }

        results.push({
            planet: planetName,
            sign,
            house,
            signText,
            houseText
        });
    });

    return results;
}
