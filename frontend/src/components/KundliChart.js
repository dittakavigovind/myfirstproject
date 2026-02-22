import React, { useMemo } from 'react';

// Signs for reference
const SIGNS = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Cp', 'Aq', 'Pi'];

/**
 * KundliChart Component
 * Renders a Vedic Astrology Chart in North or South Indian style.
 * 
 * @param {Object} planets - { Sun: { sign: 1, ... }, Moon: { sign: 4, ... } }
 * @param {Number} ascendantSign - The sign number (1-12) of the Ascendant
 * @param {String} style - 'north' | 'south'
 */
/**
 * KundliChart Component
 * Renders a Vedic Astrology Chart in North or South Indian style.
 * 
 * @param {Object} planets - { Sun: { sign: 1, ... }, Moon: { sign: 4, ... } }
 * @param {Number} ascendantSign - The sign number (1-12) of the Ascendant
 * @param {String} style - 'north' | 'south'
 */
export default function KundliChart({ planets, ascendantSign, style = 'north', smallMode = false }) {

    // Group planets by sign for easy rendering
    // result: { 1: ['Sun', 'Mer'], 2: ['Jup'], ... }
    const planetsBySign = useMemo(() => {
        const map = {};
        for (let i = 1; i <= 12; i++) map[i] = [];

        // Add Ascendant (Lagna) Label
        if (ascendantSign) {
            map[ascendantSign].push('Lagna');
        }

        Object.entries(planets).forEach(([name, data]) => {
            // Skip 'Ascendant' as we already added 'Lagna'
            if (name === 'Ascendant' || name === 'As') return;

            // Data might come as { sign: 1 } (D9) or { longitude: 45.4 } (D1)
            let sign;
            if (data.sign) {
                sign = data.sign;
            } else if (data.longitude !== undefined) {
                sign = Math.floor(data.longitude / 30) + 1;
            }

            if (sign && map[sign]) {
                // Abbreviate planet names
                const abbr = name.substring(0, 2);
                if (!map[sign].includes(abbr)) { // Avoid dupes if any
                    map[sign].push(abbr);
                }
            }
        });

        return map;
    }, [planets, ascendantSign]);

    if (style === 'north') {
        return <NorthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} />;
    } else {
        return <SouthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} />;
    }
}

/**
 * North Indian Chart (Diamond Style)
 */
function NorthIndianChart({ planetsBySign, ascendantSign, smallMode }) {

    // POSITIONS (x,y in 0-400 grid)
    // House positions for text
    const houses = [
        { id: 1, x: 200, y: 80 },  // Top Diamond (1)
        { id: 2, x: 100, y: 35 },  // Top Left (2)
        { id: 3, x: 35, y: 100 },  // Left Top (3)
        { id: 4, x: 80, y: 200 },  // Left Diamond (4)
        { id: 5, x: 35, y: 300 },  // Left Bottom (5)
        { id: 6, x: 100, y: 365 }, // Bottom Left (6)
        { id: 7, x: 200, y: 320 }, // Bottom Diamond (7)
        { id: 8, x: 300, y: 365 }, // Bottom Right (8)
        { id: 9, x: 365, y: 300 }, // Right Bottom (9)
        { id: 10, x: 320, y: 200 }, // Right Diamond (10)
        { id: 11, x: 365, y: 100 }, // Right Top (11)
        { id: 12, x: 300, y: 35 },  // Top Right (12)
    ];

    const renderHouse = (houseIndex) => {
        // House Index 1-12
        const signVal = ((ascendantSign + houseIndex - 2) % 12) + 1;
        const planets = planetsBySign[signVal] || [];
        const coord = houses[houseIndex - 1];

        // Highlight planets vs empty
        const hasPlanets = planets.length > 0;

        // Scaling for Small Mode
        const signSize = smallMode ? "8" : "10";
        const planetSize = smallMode ? "9" : "12";

        return (
            <g key={houseIndex}>
                {/* Sign Number */}
                <text x={coord.x} y={coord.y} textAnchor="middle" fontSize={signSize} fill="#f59e0b" fillOpacity="0.5" fontWeight="bold" dy="-12">
                    {signVal}
                </text>
                {/* Planets */}
                <text x={coord.x} y={coord.y} textAnchor="middle" fontSize={planetSize} fontWeight="bold">
                    {/* Render Lagna */}
                    {planets.some(p => p === 'Lagna') && (
                        <tspan x={coord.x} dy="8" fill="#d8b4fe">Lagna</tspan>
                    )}
                    {/* Render Other Planets */}
                    {planets.filter(p => p !== 'Lagna').length > 0 && (
                        <tspan x={coord.x} dy={planets.some(p => p === 'Lagna') ? "14" : "8"} fill="#fcd34d">
                            {planets.filter(p => p !== 'Lagna').join(', ')}
                        </tspan>
                    )}
                </text>
            </g>
        );
    };

    // SVG Lines
    return (
        <svg viewBox="0 0 400 400" className="w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <defs>
                <radialGradient id="cosmicGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>
                <pattern id="starPattern" width="100" height="100" patternUnits="userSpaceOnUse">
                    <circle cx="50" cy="50" r="0.5" fill="white" opacity="0.3" />
                    <circle cx="10" cy="80" r="0.5" fill="white" opacity="0.2" />
                    <circle cx="80" cy="10" r="0.5" fill="white" opacity="0.2" />
                </pattern>

                {/* Gold Glow Filter */}
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Background */}
            <rect width="400" height="400" fill="url(#cosmicGradient)" />
            <rect width="400" height="400" fill="url(#starPattern)" />

            {/* Outer Box */}
            <rect x="2" y="2" width="396" height="396" fill="none" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" rx="4" />
            <rect x="0" y="0" width="400" height="400" fill="none" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.1" />

            {/* Main Geometry Group with Gold Stroke */}
            <g stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.6">
                {/* Diagonals */}
                <line x1="0" y1="0" x2="400" y2="400" />
                <line x1="400" y1="0" x2="0" y2="400" />

                {/* Inner Diamonds (Midpoints) */}
                <line x1="200" y1="0" x2="0" y2="200" />
                <line x1="0" y1="200" x2="200" y2="400" />
                <line x1="200" y1="400" x2="400" y2="200" />
                <line x1="400" y1="200" x2="200" y2="0" />
            </g>

            {/* House Numbers (Fixed House Locations) */}
            {houses.map(h => renderHouse(h.id))}

        </svg>
    );
}

/**
 * South Indian Chart (Square Style)
 */
function SouthIndianChart({ planetsBySign, ascendantSign }) {
    // Matrix of Signs (1-12)
    const GRID = [
        { sign: 12, x: 0, y: 0 }, { sign: 1, x: 100, y: 0 }, { sign: 2, x: 200, y: 0 }, { sign: 3, x: 300, y: 0 },
        { sign: 11, x: 0, y: 100 }, { sign: 4, x: 300, y: 100 },
        { sign: 10, x: 0, y: 200 }, { sign: 5, x: 300, y: 200 },
        { sign: 9, x: 0, y: 300 }, { sign: 8, x: 100, y: 300 }, { sign: 7, x: 200, y: 300 }, { sign: 6, x: 300, y: 300 },
    ];

    return (
        <svg viewBox="0 0 400 400" className="w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
            <defs>
                <radialGradient id="cosmicGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0f172a" />
                </radialGradient>
                <pattern id="starPattern" width="100" height="100" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="0.5" fill="white" opacity="0.3" />
                    <circle cx="70" cy="60" r="0.5" fill="white" opacity="0.2" />
                </pattern>
            </defs>

            {/* Background */}
            <rect width="400" height="400" fill="url(#cosmicGradient)" />
            <rect width="400" height="400" fill="url(#starPattern)" />

            {/* Outer and Inner Borders */}
            <rect x="1" y="1" width="398" height="398" fill="none" stroke="#f59e0b" strokeWidth="2" strokeOpacity="0.4" rx="4" />

            {/* Grid Lines */}
            {/* Grid Lines */}
            <g stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4">
                {/* Vertical Lines */}
                <line x1="100" y1="0" x2="100" y2="400" />
                <line x1="300" y1="0" x2="300" y2="400" />

                {/* Middle Vertical (Split) */}
                <line x1="200" y1="0" x2="200" y2="100" />
                <line x1="200" y1="300" x2="200" y2="400" />

                {/* Horizontal Lines */}
                <line x1="0" y1="100" x2="400" y2="100" />
                <line x1="0" y1="300" x2="400" y2="300" />

                {/* Middle Horizontal (Split) */}
                <line x1="0" y1="200" x2="100" y2="200" />
                <line x1="300" y1="200" x2="400" y2="200" />
            </g>

            {/* Center Branding */}
            <g opacity="1">
                {/* Halo/Glow behind logo */}
                <circle cx="200" cy="200" r="60" fill="url(#cosmicGradient)" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.3" filter="url(#goldGlow)" />

                <image
                    href="/logo.svg"
                    x="130"
                    y="130"
                    width="140"
                    height="140"
                    preserveAspectRatio="xMidYMid meet"
                />
            </g>

            {/* Boxes */}
            {GRID.map(box => {
                const planets = planetsBySign[box.sign] || [];

                return (
                    <g key={box.sign}>
                        {/* Hover/BG Effect for active boxes */}
                        {planets.length > 0 && (
                            <rect x={box.x + 1} y={box.y + 1} width="98" height="98" className="fill-amber-500/5" />
                        )}

                        {/* Sign Name (Small) */}
                        <text x={box.x + 5} y={box.y + 15} fontSize="9" fill="#f59e0b" fillOpacity="0.5" fontWeight="bold">
                            {SIGNS[box.sign - 1]}
                        </text>

                        <text x={box.x + 50} y={box.y + 50} textAnchor="middle" fontSize="11" fontWeight="bold">
                            {planets.some(p => p === 'Lagna') && (
                                <tspan x={box.x + 50} dy="0" fill="#d8b4fe">Lagna</tspan>
                            )}
                            {planets.filter(p => p !== 'Lagna').length > 0 && (
                                <tspan x={box.x + 50} dy={planets.some(p => p === 'Lagna') ? "14" : "0"} fill="#fcd34d">
                                    {planets.filter(p => p !== 'Lagna').join(', ')}
                                </tspan>
                            )}
                        </text>
                    </g>
                );
            })}
        </svg>
    )
}
