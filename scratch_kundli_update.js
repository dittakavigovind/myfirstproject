const fs = require('fs');
const path = require('path');

function updateChartFile(filePath, isMobile) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Update Props
    const propsTarget = isMobile 
        ? "export default function KundliChart({ planets, ascendantSign, style = 'north', smallMode = false }) {" 
        : "export default function KundliChart({ planets, ascendantSign, style = 'north', smallMode = false, lang = 'en' }) {";
    const propsReplacement = isMobile
        ? "export default function KundliChart({ planets, ascendantSign, style = 'north', smallMode = false, ascendantDegree, sav }) {" 
        : "export default function KundliChart({ planets, ascendantSign, style = 'north', smallMode = false, lang = 'en', ascendantDegree, sav }) {";
    content = content.replace(propsTarget, propsReplacement);

    // 2. Add checkCombust and update useMemo
    const useMemoTargetEnd = isMobile
        ? "    }, [planets, ascendantSign]);"
        : "    }, [planets, ascendantSign]);";
        
    const checkCombustFn = `
    const checkCombust = (planetName, planetLong, sunLong, isRetrograde) => {
        if (!sunLong || ['Sun', 'Moon', 'Rahu', 'Ketu', 'Lagna', 'Ascendant'].includes(planetName)) return false;
        let diff = Math.abs(planetLong - sunLong);
        if (diff > 180) diff = 360 - diff;
        switch (planetName) {
            case 'Mars': return diff <= 17;
            case 'Mercury': return diff <= (isRetrograde ? 12 : 14);
            case 'Jupiter': return diff <= 11;
            case 'Venus': return diff <= (isRetrograde ? 8 : 10);
            case 'Saturn': return diff <= 15;
            default: return false;
        }
    };
`;

    const useMemoCodeMobile = `    const planetsBySign = useMemo(() => {
        const map = {};
        for (let i = 1; i <= 12; i++) map[i] = [];

        const sunLong = planets?.['Sun']?.longitude;

        if (ascendantSign) {
            let text = 'Lagna';
            if (ascendantDegree !== undefined) {
                text += \` \${Math.floor(ascendantDegree).toString().padStart(2, '0')}\`;
            }
            map[ascendantSign].push({ text, isLagna: true });
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
                    let text = abbr;
                    if (data.longitude !== undefined) {
                        const degStr = Math.floor(data.longitude % 30).toString().padStart(2, '0');
                        const isRet = data.retrograde;
                        const isCombust = checkCombust(name, data.longitude, sunLong, isRet);
                        let sym = '';
                        if (isRet) sym += '®';
                        if (isCombust) sym += '©';
                        text = \`\${abbr} \${degStr}\${sym ? ' ' + sym : ''}\`;
                    }
                    if (!map[sign].some(p => p.text.startsWith(abbr))) {
                        map[sign].push({ text, isLagna: false });
                    }
                }
            });
        }
        return map;
    }, [planets, ascendantSign, ascendantDegree]);`;

    const useMemoCodeFrontend = `    const planetsBySign = useMemo(() => {
        const map = {};
        for (let i = 1; i <= 12; i++) map[i] = [];

        const sunLong = planets?.['Sun']?.longitude;

        if (ascendantSign) {
            const lagnaLabel = lang === 'hi' ? 'लग्न' : lang === 'te' ? 'లగ్నం' : 'Lagna';
            let text = lagnaLabel;
            if (ascendantDegree !== undefined) {
                text += \` \${Math.floor(ascendantDegree).toString().padStart(2, '0')}\`;
            }
            map[ascendantSign].push({ text, isLagna: true });
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
                    const PLANET_ABBR_EN = { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' };
                    const PLANET_ABBR_HI = { Sun: 'सू', Moon: 'च', Mars: 'मं', Mercury: 'बु', Jupiter: 'गु', Venus: 'शु', Saturn: 'श', Rahu: 'रा', Ketu: 'के' };
                    const PLANET_ABBR_TE = { Sun: 'సూ', Moon: 'చం', Mars: 'కు', Mercury: 'బు', Jupiter: 'గు', Venus: 'శు', Saturn: 'శ', రా: 'రా', Ketu: 'కే' };
                    
                    const abbr = lang === 'hi' ? (PLANET_ABBR_HI[name] || name.substring(0, 2)) : lang === 'te' ? (PLANET_ABBR_TE[name] || name.substring(0, 2)) : (PLANET_ABBR_EN[name] || name.substring(0, 2));
                    let text = abbr;
                    
                    if (data.longitude !== undefined) {
                        const degStr = Math.floor(data.longitude % 30).toString().padStart(2, '0');
                        const isRet = data.retrograde;
                        const isCombust = checkCombust(name, data.longitude, sunLong, isRet);
                        let sym = '';
                        if (isRet) sym += '®';
                        if (isCombust) sym += '©';
                        text = \`\${abbr} \${degStr}\${sym ? ' ' + sym : ''}\`;
                    }

                    if (!map[sign].some(p => p.text.startsWith(abbr))) {
                        map[sign].push({ text, isLagna: false });
                    }
                }
            });
        }
        return map;
    }, [planets, ascendantSign, ascendantDegree, lang]);`;

    const regexUseMemo = /\s*\/\/\s*Group planets by sign[\s\S]*?\}, \[planets, ascendantSign\]\);/g;
    content = content.replace(regexUseMemo, checkCombustFn + (isMobile ? useMemoCodeMobile : useMemoCodeFrontend));

    // 3. Pass sav down
    if (isMobile) {
        content = content.replace("<NorthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} />", "<NorthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} sav={sav} />");
        content = content.replace("<SouthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} />", "<SouthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} sav={sav} />");
        content = content.replace("function NorthIndianChart({ planetsBySign, ascendantSign, smallMode }) {", "function NorthIndianChart({ planetsBySign, ascendantSign, smallMode, sav }) {");
        content = content.replace("function SouthIndianChart({ planetsBySign, ascendantSign }) {", "function SouthIndianChart({ planetsBySign, ascendantSign, sav }) {");
    } else {
        content = content.replace("<NorthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} lang={lang} />", "<NorthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} lang={lang} sav={sav} />");
        content = content.replace("<SouthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} lang={lang} />", "<SouthIndianChart planetsBySign={planetsBySign} ascendantSign={ascendantSign} smallMode={smallMode} lang={lang} sav={sav} />");
        content = content.replace("function NorthIndianChart({ planetsBySign, ascendantSign, smallMode, lang }) {", "function NorthIndianChart({ planetsBySign, ascendantSign, smallMode, lang, sav }) {");
        content = content.replace("function SouthIndianChart({ planetsBySign, ascendantSign, lang }) {", "function SouthIndianChart({ planetsBySign, ascendantSign, lang, sav }) {");
    }

    // 4. Update NorthIndianChart Rendering
    let hasLagnaRegex = /const hasLagna = (planets\.includes\('Lagna'\)|planets\.includes\(lagnaLabel\));\s*const otherPlanets = planets\.filter\(p => p !== (?:'Lagna'|lagnaLabel)\);\s*const lines = \[\];\s*for \(let i = 0; i < otherPlanets\.length; i \+= 3\) \{\s*lines\.push\(otherPlanets\.slice\(i, i \+ 3\)\.join\(\', \'\)\);\s*\}/g;
    
    let northRenderCode = `const lagnaPlanet = planets.find(p => p.isLagna);
        const otherPlanets = planets.filter(p => !p.isLagna).map(p => p.text);

        const lines = [];
        for (let i = 0; i < otherPlanets.length; i += 2) {
            lines.push(otherPlanets.slice(i, i + 2).join(', '));
        }`;
    content = content.replace(hasLagnaRegex, northRenderCode);

    let northHouseTextRegex = /<text x=\{coord\.x\} y=\{coord\.y\} textAnchor="middle" fontSize=\{signSize\} fill="#facc15" fillOpacity="0\.4" fontWeight="bold" dy="-25">\s*\{signVal\}\s*<\/text>/g;
    content = content.replace(northHouseTextRegex, `<text x={coord.x} y={coord.y} textAnchor="middle" fontSize={signSize} fill="#facc15" fillOpacity="0.4" fontWeight="bold" dy="-25">\n                    {signVal} {sav && sav[signVal] !== undefined ? \`[\${sav[signVal]}]\` : ''}\n                </text>`);

    let northTspanRegex = /\{hasLagna && \(\s*<tspan x=\{coord\.x\} dy="0" fill="#8b5cf6">.*<\/tspan>\s*\)\}\s*\{lines\.map\(\(line, idx\) => \(\s*<tspan\s*key=\{idx\}\s*x=\{coord\.x\}\s*dy=\{idx === 0 \? \(hasLagna \? \(smallMode \? "11" : "14"\) : "5"\) : \(smallMode \? "10" : "13"\)\}\s*fill="#fde047"\s*>\s*\{line\}\s*<\/tspan>\s*\)\)\}/g;
    let northTspanReplacement = `{lagnaPlanet && (
                        <tspan x={coord.x} dy="0" fill="#8b5cf6">{lagnaPlanet.text}</tspan>
                    )}
                    {lines.map((line, idx) => (
                        <tspan
                            key={idx}
                            x={coord.x}
                            dy={idx === 0 ? (lagnaPlanet ? (smallMode ? "11" : "14") : "5") : (smallMode ? "10" : "13")}
                            fill="#fde047"
                        >
                            {line}
                        </tspan>
                    ))}`;
    content = content.replace(northTspanRegex, northTspanReplacement);

    // 5. Update SouthIndianChart Rendering
    let southTextRegex = /<text x=\{box\.x \+ 5\} y=\{box\.y \+ 15\} fontSize="9" fill="#facc15" fillOpacity="0\.4" fontWeight="bold">\s*\{SIGNS\[box\.sign - 1\]\}\s*<\/text>/g;
    content = content.replace(southTextRegex, `<text x={box.x + 5} y={box.y + 15} fontSize="9" fill="#facc15" fillOpacity="0.4" fontWeight="bold">\n                            {SIGNS[box.sign - 1]}\n                        </text>\n                        {sav && sav[box.sign] !== undefined && (\n                            <text x={box.x + 85} y={box.y + 90} fontSize="11" fill="#34d399" fontWeight="bold">\n                                {sav[box.sign]}\n                            </text>\n                        )}`);

    let southTspanRegex = /\{hasLagna && \(\s*<tspan x=\{box\.x \+ 50\} dy=\{lines\.length > 0 \? "-5" : "5"\} fill="#8b5cf6">.*<\/tspan>\s*\)\}\s*\{lines\.map\(\(line, idx\) => \(\s*<tspan\s*key=\{idx\}\s*x=\{box\.x \+ 50\}\s*dy=\{idx === 0 \? \(hasLagna \? "14" : "5"\) : "12"\}\s*fill="#fde047"\s*>\s*\{line\}\s*<\/tspan>\s*\)\)\}/g;
    let southTspanReplacement = `{lagnaPlanet && (
                                <tspan x={box.x + 50} dy={lines.length > 0 ? "-5" : "5"} fill="#8b5cf6">{lagnaPlanet.text}</tspan>
                            )}
                            {lines.map((line, idx) => (
                                <tspan
                                    key={idx}
                                    x={box.x + 50}
                                    dy={idx === 0 ? (lagnaPlanet ? "14" : "5") : "12"}
                                    fill="#fde047"
                                >
                                    {line}
                                </tspan>
                            ))}`;
    content = content.replace(southTspanRegex, southTspanReplacement);

    fs.writeFileSync(filePath, content);
}

updateChartFile('c:/Users/DELL/Desktop/Antigravity/WAY2ASTRO/way2astro2/frontend/src/components/KundliChart.js', false);
updateChartFile('c:/Users/DELL/Desktop/Antigravity/WAY2ASTRO/way2astro2/mobile-app/src/components/KundliChart.js', true);
console.log('Done!');
