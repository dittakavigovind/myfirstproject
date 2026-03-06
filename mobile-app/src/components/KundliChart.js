"use client";

import React, { useMemo } from 'react';

// Signs for reference
const SIGNS = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Cp', 'Aq', 'Pi'];

/**
 * KundliChart Component
 * Renders a Vedic Astrology Chart in North or South Indian style.
 */
export default function KundliChart({ planets, ascendantSign, style = 'north', smallMode = false }) {

    // Group planets by sign for easy rendering
    const planetsBySign = useMemo(() => {
        const map = {};
        for (let i = 1; i <= 12; i++) map[i] = [];

        // Add Ascendant (Lagna) Label
        if (ascendantSign) {
            map[ascendantSign].push('Lagna');
        }

        if (planets) {
            Object.entries(planets).forEach(([name, data]) => {
                if (name === 'Ascendant' || name === 'As') return;

                let sign;
                if (data.sign) {
                    sign = data.sign;
                } else if (data.longitude !== undefined) {
                    sign = Math.floor(data.longitude / 30) + 1;
                }

                if (sign && map[sign]) {
                    const abbr = name.substring(0, 2);
                    if (!map[sign].includes(abbr)) {
                        map[sign].push(abbr);
                    }
                }
            });
        }

        return map;
    }, [planets, ascendantSign]);

    if (style === 'north') {
        return <NorthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} />;
    } else {
        return <SouthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} />;
    }
}

function NorthIndianChart({ planetsBySign, ascendantSign, smallMode }) {
    const houses = [
        { id: 1, x: 200, y: 100 },
        { id: 2, x: 100, y: 50 },
        { id: 3, x: 50, y: 100 },
        { id: 4, x: 100, y: 200 },
        { id: 5, x: 50, y: 300 },
        { id: 6, x: 100, y: 350 },
        { id: 7, x: 200, y: 300 },
        { id: 8, x: 300, y: 350 },
        { id: 9, x: 350, y: 300 },
        { id: 10, x: 300, y: 200 },
        { id: 11, x: 350, y: 100 },
        { id: 12, x: 300, y: 50 },
    ];

    const renderHouse = (houseIndex) => {
        const signVal = ((ascendantSign + houseIndex - 2) % 12) + 1;
        const planets = planetsBySign[signVal] || [];
        const coord = houses[houseIndex - 1];

        const signSize = smallMode ? "8" : "10";
        const planetSize = smallMode ? "9" : "11";

        const hasLagna = planets.includes('Lagna');
        const otherPlanets = planets.filter(p => p !== 'Lagna');

        const lines = [];
        for (let i = 0; i < otherPlanets.length; i += 3) {
            lines.push(otherPlanets.slice(i, i + 3).join(', '));
        }

        return (
            <g key={houseIndex}>
                <text x={coord.x} y={coord.y} textAnchor="middle" fontSize={signSize} fill="#facc15" fillOpacity="0.4" fontWeight="bold" dy="-25">
                    {signVal}
                </text>
                <text x={coord.x} y={coord.y} textAnchor="middle" fontSize={planetSize} fontWeight="bold">
                    {hasLagna && (
                        <tspan x={coord.x} dy="0" fill="#8b5cf6">Lagna</tspan>
                    )}
                    {lines.map((line, idx) => (
                        <tspan
                            key={idx}
                            x={coord.x}
                            dy={idx === 0 ? (hasLagna ? (smallMode ? "11" : "14") : "5") : (smallMode ? "10" : "13")}
                            fill="#fde047"
                        >
                            {line}
                        </tspan>
                    ))}
                </text>
            </g>
        );
    };

    return (
        <svg viewBox="0 0 400 400" className="w-full h-full bg-[#0b1026] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <defs>
                <radialGradient id="cosmicChartGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0b1026" />
                </radialGradient>
            </defs>

            <rect width="400" height="400" fill="url(#cosmicChartGradient)" />

            <g stroke="#facc15" strokeWidth="1.5" strokeOpacity="0.4">
                <line x1="0" y1="0" x2="400" y2="400" />
                <line x1="400" y1="0" x2="0" y2="400" />
                <line x1="200" y1="0" x2="0" y2="200" />
                <line x1="0" y1="200" x2="200" y2="400" />
                <line x1="200" y1="400" x2="400" y2="200" />
                <line x1="400" y1="200" x2="200" y2="0" />
            </g>

            {houses.map(h => renderHouse(h.id))}
        </svg>
    );
}

function SouthIndianChart({ planetsBySign, ascendantSign }) {
    const GRID = [
        { sign: 12, x: 0, y: 0 }, { sign: 1, x: 100, y: 0 }, { sign: 2, x: 200, y: 0 }, { sign: 3, x: 300, y: 0 },
        { sign: 11, x: 0, y: 100 }, { sign: 4, x: 300, y: 100 },
        { sign: 10, x: 0, y: 200 }, { sign: 5, x: 300, y: 200 },
        { sign: 9, x: 0, y: 300 }, { sign: 8, x: 100, y: 300 }, { sign: 7, x: 200, y: 300 }, { sign: 6, x: 300, y: 300 },
    ];

    return (
        <svg viewBox="0 0 400 400" className="w-full h-full bg-[#0b1026] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <rect width="400" height="400" fill="#0b1026" />

            <g stroke="#facc15" strokeWidth="1" strokeOpacity="0.4">
                <line x1="100" y1="0" x2="100" y2="400" />
                <line x1="300" y1="0" x2="300" y2="400" />
                <line x1="200" y1="0" x2="200" y2="100" />
                <line x1="200" y1="300" x2="200" y2="400" />
                <line x1="0" y1="100" x2="400" y2="100" />
                <line x1="0" y1="300" x2="400" y2="300" />
                <line x1="0" y1="200" x2="100" y2="200" />
                <line x1="300" y1="200" x2="400" y2="200" />
            </g>

            {GRID.map(box => {
                const planets = planetsBySign[box.sign] || [];
                const hasLagna = planets.includes('Lagna');
                const otherPlanets = planets.filter(p => p !== 'Lagna');

                const lines = [];
                for (let i = 0; i < otherPlanets.length; i += 3) {
                    lines.push(otherPlanets.slice(i, i + 3).join(', '));
                }

                return (
                    <g key={box.sign}>
                        <text x={box.x + 5} y={box.y + 15} fontSize="9" fill="#facc15" fillOpacity="0.4" fontWeight="bold">
                            {SIGNS[box.sign - 1]}
                        </text>
                        <text x={box.x + 50} y={box.y + 50} textAnchor="middle" fontSize="11" fontWeight="bold">
                            {hasLagna && (
                                <tspan x={box.x + 50} dy={lines.length > 0 ? "-5" : "5"} fill="#8b5cf6">Lagna</tspan>
                            )}
                            {lines.map((line, idx) => (
                                <tspan
                                    key={idx}
                                    x={box.x + 50}
                                    dy={idx === 0 ? (hasLagna ? "14" : "5") : "12"}
                                    fill="#fde047"
                                >
                                    {line}
                                </tspan>
                            ))}
                        </text>
                    </g>
                );
            })}
        </svg>
    )
}
