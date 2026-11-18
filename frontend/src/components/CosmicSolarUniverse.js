"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass, Info, RotateCw, Activity } from 'lucide-react';

const ZODIAC_SIGNS = [
    { id: 1, name: "Aries", sanskrit: "Mesha", symbol: "♈", element: "Fire", color: "#f87171" },
    { id: 2, name: "Taurus", sanskrit: "Vrishabha", symbol: "♉", element: "Earth", color: "#34d399" },
    { id: 3, name: "Gemini", sanskrit: "Mithuna", symbol: "♊", element: "Air", color: "#38bdf8" },
    { id: 4, name: "Cancer", sanskrit: "Karka", symbol: "♋", element: "Water", color: "#818cf8" },
    { id: 5, name: "Leo", sanskrit: "Simha", symbol: "♌", element: "Fire", color: "#fbbf24" },
    { id: 6, name: "Virgo", sanskrit: "Kanya", symbol: "♍", element: "Earth", color: "#4ade80" },
    { id: 7, name: "Libra", sanskrit: "Tula", symbol: "♎", element: "Air", color: "#22d3ee" },
    { id: 8, name: "Scorpio", sanskrit: "Vrischika", symbol: "♏", element: "Water", color: "#a78bfa" },
    { id: 9, name: "Sagittarius", sanskrit: "Dhanu", symbol: "♐", element: "Fire", color: "#f59e0b" },
    { id: 10, name: "Capricorn", sanskrit: "Makara", symbol: "♑", element: "Earth", color: "#10b981" },
    { id: 11, name: "Aquarius", sanskrit: "Kumbha", symbol: "♒", element: "Air", color: "#06b6d4" },
    { id: 12, name: "Pisces", sanskrit: "Meena", symbol: "♓", element: "Water", color: "#c084fc" }
];

const PLANET_META = {
    Sun: {
        name: "Sun",
        sanskrit: "Surya",
        symbol: "☀️",
        color: "#fbbf24",
        glow: "rgba(251, 191, 36, 0.6)",
        defaultR: 85,
        radius: 12,
        nature: "Soul, Vitality & Cosmic Core",
        gem: "Ruby",
        ruling: "Leo"
    },
    Moon: {
        name: "Moon",
        sanskrit: "Chandra",
        symbol: "🌙",
        color: "#e2e8f0",
        glow: "rgba(226, 232, 240, 0.7)",
        defaultR: 65,
        radius: 9,
        nature: "Mind, Emotions & Intuition",
        gem: "Pearl",
        ruling: "Cancer"
    },
    Mars: {
        name: "Mars",
        sanskrit: "Mangal",
        symbol: "♂️",
        color: "#ef4444",
        glow: "rgba(239, 68, 68, 0.6)",
        defaultR: 115,
        radius: 9,
        nature: "Energy, Courage & Passion",
        gem: "Red Coral",
        ruling: "Aries & Scorpio"
    },
    Mercury: {
        name: "Mercury",
        sanskrit: "Budha",
        symbol: "☿",
        color: "#10b981",
        glow: "rgba(16, 185, 129, 0.6)",
        defaultR: 50,
        radius: 7,
        nature: "Intellect, Speech & Commerce",
        gem: "Emerald",
        ruling: "Gemini & Virgo"
    },
    Jupiter: {
        name: "Jupiter",
        sanskrit: "Guru / Brihaspati",
        symbol: "♃",
        color: "#f59e0b",
        glow: "rgba(245, 158, 11, 0.6)",
        defaultR: 145,
        radius: 13,
        nature: "Wisdom, Dharma & Prosperity",
        gem: "Yellow Sapphire",
        ruling: "Sagittarius & Pisces"
    },
    Venus: {
        name: "Venus",
        sanskrit: "Shukra",
        symbol: "♀",
        color: "#f472b6",
        glow: "rgba(244, 114, 182, 0.6)",
        defaultR: 98,
        radius: 10,
        nature: "Love, Art, Luxury & Beauty",
        gem: "Diamond",
        ruling: "Taurus & Libra"
    },
    Saturn: {
        name: "Saturn",
        sanskrit: "Shani",
        symbol: "♄",
        color: "#818cf8",
        glow: "rgba(129, 140, 248, 0.6)",
        defaultR: 175,
        radius: 11,
        nature: "Karma, Discipline & Longevity",
        gem: "Blue Sapphire",
        ruling: "Capricorn & Aquarius",
        hasRings: true
    },
    Rahu: {
        name: "Rahu",
        sanskrit: "North Node",
        symbol: "☊",
        color: "#c084fc",
        glow: "rgba(192, 132, 252, 0.6)",
        defaultR: 130,
        radius: 8,
        nature: "Material Ambition & Worldly Illusion",
        gem: "Hessonite",
        ruling: "Shadow Planet"
    },
    Ketu: {
        name: "Ketu",
        sanskrit: "South Node",
        symbol: "☋",
        color: "#22d3ee",
        glow: "rgba(34, 211, 238, 0.6)",
        defaultR: 130,
        radius: 8,
        nature: "Spiritual Liberation (Moksha) & Detachment",
        gem: "Cat's Eye",
        ruling: "Shadow Planet"
    }
};

export default function CosmicSolarUniverse({ planets }) {
    const [selectedPlanet, setSelectedPlanet] = useState("Sun");

    // Center coordinates and dimensions
    const CX = 250;
    const CY = 250;
    const ZODIAC_OUTER_R = 240;
    const ZODIAC_INNER_R = 205;

    // Process all planet coordinates with exact DMS formatting matching Table
    const planetList = useMemo(() => {
        if (!planets) return [];

        // 1. Group planets by zodiac sign to avoid orbital visual collision
        const signBuckets = {};
        Object.entries(planets).forEach(([pName, pData]) => {
            if (pName === 'Ascendant' || pName === 'As') return;
            if (!PLANET_META[pName]) return;

            const longitude = pData.longitude !== undefined ? pData.longitude : ((pData.sign - 1) * 30 + 15);
            const signIndex = pData.sign ? pData.sign - 1 : Math.floor(longitude / 30);
            if (!signBuckets[signIndex]) signBuckets[signIndex] = [];
            signBuckets[signIndex].push({ pName, pData, longitude, signIndex });
        });

        const list = [];

        // 2. Compute positions for each planet with collision-free radial spacing
        Object.entries(signBuckets).forEach(([signIdxStr, bucket]) => {
            // Sort by longitude within sign
            bucket.sort((a, b) => a.longitude - b.longitude);
            const count = bucket.length;

            bucket.forEach((item, posIndex) => {
                const { pName, pData, longitude, signIndex } = item;
                const meta = PLANET_META[pName];
                const signData = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];

                // Exact Degrees and Minutes (identical to Table: deg° min')
                const degVal = longitude % 30;
                const deg = Math.floor(degVal);
                const min = Math.floor((degVal % 1) * 60);
                const sec = Math.floor(((degVal % 1) * 60 % 1) * 60);
                const formattedAngle = `${deg}° ${min}'`;
                const formattedFull = `${deg}° ${min}' ${sec}"`;
                const totalDeg = Math.floor(longitude);
                const totalMin = Math.floor((longitude % 1) * 60);
                const totalFormatted = `${totalDeg}° ${totalMin}'`;

                // Distinct radial bands when multiple planets share a sign (e.g. Ketu, Jupiter, Mars in Leo)
                let effectiveR = meta.defaultR;
                if (count === 2) {
                    effectiveR = posIndex === 0 ? 80 : 155;
                } else if (count >= 3) {
                    effectiveR = posIndex === 0 ? 65 : posIndex === 1 ? 115 : 165;
                }

                // Celestial angle: 0° Aries starts at 12 o'clock (-90°), clockwise around 360°
                const angleDeg = (longitude - 90);
                const angleRad = (angleDeg * Math.PI) / 180;

                const x = CX + effectiveR * Math.cos(angleRad);
                const y = CY + effectiveR * Math.sin(angleRad);

                // Guide line destination on the inner zodiac ring
                const ringX = CX + ZODIAC_INNER_R * Math.cos(angleRad);
                const ringY = CY + ZODIAC_INNER_R * Math.sin(angleRad);

                list.push({
                    key: pName,
                    ...meta,
                    ...pData,
                    longitude,
                    signData,
                    deg,
                    min,
                    sec,
                    formattedAngle,
                    formattedFull,
                    totalFormatted,
                    effectiveR,
                    x,
                    y,
                    ringX,
                    ringY,
                    angleDeg
                });
            });
        });

        // Keep standard planet order in quick switcher
        const order = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
        return list.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
    }, [planets]);

    const activePlanetData = useMemo(() => {
        return planetList.find(p => p.key === selectedPlanet) || planetList[0];
    }, [planetList, selectedPlanet]);

    return (
        <div className="space-y-4">
            {/* Quick Planet Selector Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                {planetList.map(p => {
                    const isSelected = selectedPlanet === p.key;
                    return (
                        <button
                            key={p.key}
                            onClick={() => setSelectedPlanet(p.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 border ${
                                isSelected
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400 shadow-md shadow-violet-500/30 scale-105'
                                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08]'
                            }`}
                        >
                            <span>{p.symbol}</span>
                            <span>{p.name}</span>
                            <span className="text-[10px] text-amber-300 font-mono font-semibold">{p.formattedAngle}</span>
                            {p.retrograde && (
                                <span className="text-[9px] font-black text-rose-300 bg-rose-500/20 px-1 rounded">R</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Universe Cosmos Canvas */}
            <div className="relative w-full aspect-square max-w-[430px] mx-auto rounded-3xl bg-[#060919] border border-white/10 shadow-2xl overflow-hidden p-2">
                <svg viewBox="0 0 500 500" className="w-full h-full select-none">
                    <defs>
                        {/* Space Radial Glow */}
                        <radialGradient id="spaceGradient" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.8" />
                            <stop offset="45%" stopColor="#0d1127" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#04060f" stopOpacity="1" />
                        </radialGradient>

                        {/* Sun Core Corona */}
                        <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.8" />
                            <stop offset="80%" stopColor="#d97706" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                        </radialGradient>

                        {/* Planet Glow Filters */}
                        <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
                            <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Cosmic Deep Space Background */}
                    <rect width="500" height="500" fill="url(#spaceGradient)" rx="24" />

                    {/* Starfield Particles */}
                    <g opacity="0.6">
                        {[
                            [45, 60, 1.2], [120, 40, 0.8], [380, 75, 1.4], [430, 130, 0.9],
                            [70, 420, 1.1], [420, 410, 1.3], [290, 460, 0.7], [35, 270, 0.9],
                            [465, 280, 1.0], [90, 150, 0.8], [400, 210, 1.2], [140, 390, 0.9]
                        ].map(([sx, sy, sr], i) => (
                            <circle key={i} cx={sx} cy={sy} r={sr} fill="#ffffff" opacity={0.4 + (i % 5) * 0.12} />
                        ))}
                    </g>

                    {/* Concentric Orbit Distance Rings */}
                    {[50, 75, 100, 125, 150, 175].map((r, i) => (
                        <circle
                            key={i}
                            cx={CX}
                            cy={CY}
                            r={r}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="1"
                            strokeOpacity={0.12 + (i % 2) * 0.05}
                            strokeDasharray="3 4"
                        />
                    ))}

                    {/* 12 Zodiac Constellation Sectors (30° each) */}
                    <g>
                        {ZODIAC_SIGNS.map((z, idx) => {
                            const startAngle = idx * 30 - 90;
                            const endAngle = (idx + 1) * 30 - 90;
                            const midAngle = (startAngle + endAngle) / 2;
                            const midRad = (midAngle * Math.PI) / 180;
                            const divRad = (startAngle * Math.PI) / 180;

                            // Outer boundary division lines
                            const x1 = CX + ZODIAC_INNER_R * Math.cos(divRad);
                            const y1 = CY + ZODIAC_INNER_R * Math.sin(divRad);
                            const x2 = CX + ZODIAC_OUTER_R * Math.cos(divRad);
                            const y2 = CY + ZODIAC_OUTER_R * Math.sin(divRad);

                            // Center label coordinate
                            const labelR = (ZODIAC_INNER_R + ZODIAC_OUTER_R) / 2;
                            const lx = CX + labelR * Math.cos(midRad);
                            const ly = CY + labelR * Math.sin(midRad);

                            const isActiveSign = activePlanetData?.signData?.id === z.id;

                            return (
                                <g key={z.id}>
                                    {/* Division boundary line */}
                                    <line
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke="#facc15"
                                        strokeOpacity="0.25"
                                        strokeWidth="1"
                                    />
                                    {/* Highlight sector arc if active */}
                                    {isActiveSign && (
                                        <circle
                                            cx={CX}
                                            cy={CY}
                                            r={labelR}
                                            fill="none"
                                            stroke={z.color}
                                            strokeWidth="26"
                                            strokeOpacity="0.18"
                                        />
                                    )}
                                    {/* Zodiac Symbol & Name */}
                                    <text
                                        x={lx}
                                        y={ly - 2}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="12"
                                        fontWeight="900"
                                        fill={isActiveSign ? z.color : "#f1f5f9"}
                                        opacity={isActiveSign ? 1 : 0.85}
                                    >
                                        {z.symbol}
                                    </text>
                                    <text
                                        x={lx}
                                        y={ly + 9}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="7.5"
                                        fontWeight="bold"
                                        fill={isActiveSign ? z.color : "#94a3b8"}
                                        opacity={isActiveSign ? 1 : 0.65}
                                    >
                                        {z.name.slice(0, 3)}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Outer and Inner Circle Rings */}
                        <circle cx={CX} cy={CY} r={ZODIAC_OUTER_R} fill="none" stroke="#facc15" strokeOpacity="0.3" strokeWidth="1.5" />
                        <circle cx={CX} cy={CY} r={ZODIAC_INNER_R} fill="none" stroke="#facc15" strokeOpacity="0.3" strokeWidth="1.5" />
                    </g>

                    {/* Central Cosmic Sun Core */}
                    <g>
                        <circle cx={CX} cy={CY} r="28" fill="url(#sunCorona)" className="animate-pulse" />
                        <circle cx={CX} cy={CY} r="14" fill="#fbbf24" filter="url(#planetGlow)" />
                        <circle cx={CX} cy={CY} r="9" fill="#fffbeb" />
                    </g>

                    {/* Selected Planet Projection Beam to Zodiac */}
                    {activePlanetData && (
                        <line
                            x1={CX}
                            y1={CY}
                            x2={activePlanetData.ringX}
                            y2={activePlanetData.ringY}
                            stroke={activePlanetData.color}
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            strokeOpacity="0.75"
                        />
                    )}

                    {/* Render All 9 Planetary Orbs in Space */}
                    {planetList.map(p => {
                        const isSelected = selectedPlanet === p.key;

                        return (
                            <g
                                key={p.key}
                                onClick={() => setSelectedPlanet(p.key)}
                                className="cursor-pointer transition-transform duration-300"
                            >
                                {/* Saturn Planetary Rings */}
                                {p.hasRings && (
                                    <ellipse
                                        cx={p.x}
                                        cy={p.y}
                                        rx={p.radius + 9}
                                        ry={p.radius - 4}
                                        fill="none"
                                        stroke="#c7d2fe"
                                        strokeWidth="2.5"
                                        strokeOpacity="0.75"
                                        transform={`rotate(-25, ${p.x}, ${p.y})`}
                                    />
                                )}

                                {/* Outer Planet Glow / Pulse Halo */}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={p.radius + (isSelected ? 7 : 3)}
                                    fill={p.color}
                                    opacity={isSelected ? 0.7 : 0.2}
                                    filter="url(#planetGlow)"
                                    className={isSelected ? "animate-pulse" : ""}
                                />

                                {/* Selected Planet Stationary Focus Ring (glowing in place, no moving ring) */}
                                {isSelected && (
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r={p.radius + 4}
                                        fill="none"
                                        stroke="#ffffff"
                                        strokeWidth="1.5"
                                        strokeOpacity="0.8"
                                        className="animate-pulse"
                                    />
                                )}

                                {/* Solid Planet Sphere */}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={p.radius}
                                    fill={p.color}
                                    stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.3)"}
                                    strokeWidth={isSelected ? 2.5 : 1}
                                />

                                {/* Planet Emblem / Initial */}
                                <text
                                    x={p.x}
                                    y={p.y}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={p.radius > 10 ? "10" : "8"}
                                    fontWeight="900"
                                    fill={p.key === 'Sun' ? '#78350f' : p.key === 'Moon' ? '#0f172a' : '#ffffff'}
                                >
                                    {p.key.slice(0, 2)}
                                </text>

                                {/* Planet Floating Label Badge (Displays Exact Deg & Min Matching Table!) */}
                                <g transform={`translate(${p.x}, ${p.y + p.radius + 4})`}>
                                    <rect
                                        x="-28"
                                        y="0"
                                        width="56"
                                        height="15"
                                        rx="7.5"
                                        fill={isSelected ? "#4f46e5" : "rgba(15, 23, 42, 0.9)"}
                                        stroke={isSelected ? "#a5b4fc" : "rgba(255, 255, 255, 0.2)"}
                                        strokeWidth="0.8"
                                    />
                                    <text
                                        x="0"
                                        y="8.5"
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="7.5"
                                        fontWeight="bold"
                                        fill="#ffffff"
                                    >
                                        {p.formattedAngle}{p.retrograde ? ' R' : ''}
                                    </text>
                                </g>
                            </g>
                        );
                    })}
                </svg>

                {/* Floating Legend / Compass Watermark */}
                <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-1.5 text-[9px] font-black text-amber-300 uppercase tracking-widest bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <Compass size={12} className="text-amber-400" /> Nirayana Ecliptic
                </div>

                <div className="absolute top-4 right-4 pointer-events-none text-[9px] font-black text-emerald-300 uppercase tracking-wider bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Cosmos
                </div>
            </div>

            {/* Selected Planet Status Card (Exact Degrees and Minutes Matching Table!) */}
            {activePlanetData && (
                <motion.div
                    key={activePlanetData.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-3"
                >
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2.5">
                            <div 
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border shadow-inner"
                                style={{ backgroundColor: `${activePlanetData.color}22`, borderColor: `${activePlanetData.color}55`, color: activePlanetData.color }}
                            >
                                {activePlanetData.symbol}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-black text-white">{activePlanetData.name}</h4>
                                    <span className="text-[10px] text-slate-400 font-semibold">({activePlanetData.sanskrit})</span>
                                </div>
                                <p className="text-[10px] text-slate-300 font-medium">
                                    {activePlanetData.nature}
                                </p>
                            </div>
                        </div>

                        {activePlanetData.retrograde ? (
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Retrograde (Vakri)
                            </span>
                        ) : (
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                                Direct Motion
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-left">
                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Zodiac Sign</span>
                            <span className="text-xs font-black text-white block mt-0.5">
                                {activePlanetData.signData?.symbol} {activePlanetData.signData?.name}
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium">{activePlanetData.signData?.sanskrit}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Sign Degree</span>
                            <span className="text-xs font-mono font-black text-amber-300 block mt-0.5">
                                {activePlanetData.formattedAngle}
                            </span>
                            <span className="text-[9px] text-slate-500 font-medium">Total: {activePlanetData.totalFormatted}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">Nakshatra</span>
                            <span className="text-xs font-bold text-white block mt-0.5 truncate">
                                {activePlanetData.nakshatra || "Janma"}
                            </span>
                            <span className="text-[9px] text-violet-300 font-medium">Pada {activePlanetData.pada || 1}</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
