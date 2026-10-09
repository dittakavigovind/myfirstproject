const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/Antigravity/WAY2ASTRO/way2astro2/mobile-app/src/components/KundliChart.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /const signSize = smallMode \? "8" : "10";\s*const planetSize = smallMode \? "9" : "11";/,
    'const signSize = smallMode ? "10" : "12";\n        const planetSize = smallMode ? "11" : "14";'
);

content = content.replace(
    /<text x=\{box\.x \+ 5\} y=\{box\.y \+ 15\} fontSize="9"/g,
    '<text x={box.x + 5} y={box.y + 16} fontSize="11"'
);

content = content.replace(
    /<text x=\{box\.x \+ 50\} y=\{box\.y \+ 50\} textAnchor="middle" fontSize="11"/g,
    '<text x={box.x + 50} y={box.y + 50} textAnchor="middle" fontSize="13"'
);

content = content.replace(
    /dy=\{lines\.length > 0 \? "-5" : "5"\}/g,
    'dy={lines.length > 0 ? "-5" : "5"}'
);
content = content.replace(
    /dy=\{idx === 0 \? \(lagnaPlanet \? "14" : "5"\) : "12"\}/g,
    'dy={idx === 0 ? (lagnaPlanet ? "16" : "5") : "14"}'
);

fs.writeFileSync(file, content);
console.log('Mobile Chart sizes bumped');
