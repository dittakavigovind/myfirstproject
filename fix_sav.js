const fs = require('fs');
const files = [
    'c:/Users/DELL/Desktop/Antigravity/WAY2ASTRO/way2astro2/frontend/src/components/KundliChart.js',
    'c:/Users/DELL/Desktop/Antigravity/WAY2ASTRO/way2astro2/mobile-app/src/components/KundliChart.js'
];
files.forEach(f => {
    let code = fs.readFileSync(f, 'utf8');
    const fixRegexNorth = /sav\[signVal\]/g;
    code = code.replace(fixRegexNorth, 'sav[SIGNS_FULL[signVal - 1]]');
    
    const fixRegexSouth = /sav\[box\.sign\]/g;
    code = code.replace(fixRegexSouth, 'sav[SIGNS_FULL[box.sign - 1]]');
    
    const insertSignsFull = "const SIGNS_FULL = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];\n";
    
    if (!code.includes('SIGNS_FULL')) {
        code = code.replace(/const SIGNS = .*/, match => match + '\n' + insertSignsFull);
    }
    
    fs.writeFileSync(f, code);
});
console.log('Fixed sav indexing');
