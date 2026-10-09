const fs = require('fs');
const files = [
    'c:/Users/DELL/Desktop/Antigravity/WAY2ASTRO/way2astro2/frontend/src/components/KundliChart.js',
    'c:/Users/DELL/Desktop/Antigravity/WAY2ASTRO/way2astro2/mobile-app/src/components/KundliChart.js'
];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');

    // 1. Fix North Indian Chart parsing
    content = content.replace(/const lagnaLabel = lang === 'hi' \? 'लग्न' : 'Lagna';\s*const hasLagna = planets\.includes\(lagnaLabel\);\s*const otherPlanets = planets\.filter\(p => p !== lagnaLabel\);\s*\/\/ Split other planets into lines of 3\s*const lines = \[\];\s*for \(let i = 0; i < otherPlanets\.length; i \+= 3\) \{\s*lines\.push\(otherPlanets\.slice\(i, i \+ 3\)\.join\(', '\)\);\s*\}/g,
    `const lagnaPlanet = planets.find(p => p.isLagna);
        const otherPlanets = planets.filter(p => !p.isLagna).map(p => p.text);

        const lines = [];
        for (let i = 0; i < otherPlanets.length; i += 2) {
            lines.push(otherPlanets.slice(i, i + 2).join(', '));
        }`);

    // North Mobile
    content = content.replace(/const hasLagna = planets\.includes\('Lagna'\);\s*const otherPlanets = planets\.filter\(p => p !== 'Lagna'\);\s*const lines = \[\];\s*for \(let i = 0; i < otherPlanets\.length; i \+= 3\) \{\s*lines\.push\(otherPlanets\.slice\(i, i \+ 3\)\.join\(', '\)\);\s*\}/g,
    `const lagnaPlanet = planets.find(p => p.isLagna);
        const otherPlanets = planets.filter(p => !p.isLagna).map(p => p.text);

        const lines = [];
        for (let i = 0; i < otherPlanets.length; i += 2) {
            lines.push(otherPlanets.slice(i, i + 2).join(', '));
        }`);

    // South Frontend
    content = content.replace(/const lagnaLabel = lang === 'hi' \? 'लग्न' : 'Lagna';\s*const hasLagna = planets\.includes\(lagnaLabel\);\s*const otherPlanets = planets\.filter\(p => p !== lagnaLabel\);\s*const lines = \[\];\s*for \(let i = 0; i < otherPlanets\.length; i \+= 3\) \{\s*lines\.push\(otherPlanets\.slice\(i, i \+ 3\)\.join\(', '\)\);\s*\}/g,
    `const lagnaPlanet = planets.find(p => p.isLagna);
        const otherPlanets = planets.filter(p => !p.isLagna).map(p => p.text);

        const lines = [];
        for (let i = 0; i < otherPlanets.length; i += 2) {
            lines.push(otherPlanets.slice(i, i + 2).join(', '));
        }`);

    // North Rendering (replace hasLagna with lagnaPlanet)
    content = content.replace(/\{hasLagna && \(\s*<tspan x=\{coord\.x\} dy="0" fill="(?:#d8b4fe|#8b5cf6)">.*<\/tspan>\s*\)\}\s*\{lines\.map\(\(line, idx\) => \(\s*<tspan\s*key=\{idx\}\s*x=\{coord\.x\}\s*dy=\{idx === 0 \? \(hasLagna \? \(smallMode \? "11" : "14"\) : "5"\) : \(smallMode \? "10" : "13"\)\}\s*fill="(?:#fcd34d|#fde047)"\s*>\s*\{line\}\s*<\/tspan>\s*\)\)\}/g,
    `{lagnaPlanet && (
                        <tspan x={coord.x} dy="0" fill="#d8b4fe">{lagnaPlanet.text}</tspan>
                    )}
                    {lines.map((line, idx) => (
                        <tspan
                            key={idx}
                            x={coord.x}
                            dy={idx === 0 ? (lagnaPlanet ? (smallMode ? "11" : "14") : "5") : (smallMode ? "10" : "13")}
                            fill="#fcd34d"
                        >
                            {line}
                        </tspan>
                    ))}`);

    // South Rendering (replace hasLagna with lagnaPlanet)
    content = content.replace(/\{hasLagna && \(\s*<tspan x=\{box\.x \+ 50\} dy=\{lines\.length > 0 \? "-5" : "5"\} fill="(?:#d8b4fe|#8b5cf6)">.*<\/tspan>\s*\)\}\s*\{lines\.map\(\(line, idx\) => \(\s*<tspan\s*key=\{idx\}\s*x=\{box\.x \+ 50\}\s*dy=\{idx === 0 \? \(hasLagna \? "14" : "5"\) : "12"\}\s*fill="(?:#fcd34d|#fde047)"\s*>\s*\{line\}\s*<\/tspan>\s*\)\)\}/g,
    `{lagnaPlanet && (
                                <tspan x={box.x + 50} dy={lines.length > 0 ? "-5" : "5"} fill="#d8b4fe">{lagnaPlanet.text}</tspan>
                            )}
                            {lines.map((line, idx) => (
                                <tspan
                                    key={idx}
                                    x={box.x + 50}
                                    dy={idx === 0 ? (lagnaPlanet ? "14" : "5") : "12"}
                                    fill="#fcd34d"
                                >
                                    {line}
                                </tspan>
                            ))}`);

    fs.writeFileSync(f, content);
});
console.log('Fixed object rendering via Regex script file.');
