const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/Antigravity/WAY2ASTRO/way2astro2/frontend/src/components/KundliChart.js';
let content = fs.readFileSync(file, 'utf8');

// The exact string in the file (using indexOf or generic replace)
const replace = `                const lagnaPlanet = planets.find(p => p.isLagna);
                const otherPlanets = planets.filter(p => !p.isLagna).map(p => p.text);

                // Split other planets into lines of 2 due to degree/symbols length
                const lines = [];
                const chunkSize = 2;
                for (let i = 0; i < otherPlanets.length; i += chunkSize) {
                    lines.push(otherPlanets.slice(i, i + chunkSize).join(', '));
                }`;

// Use a regex with s modifier to match across newlines
const re = /const lagnaLabel = lang === 'hi' \? 'लग्न' : lang === 'te' \? 'లగ్నం' : 'Lagna';\s*const hasLagna = planets\.includes\(lagnaLabel\);\s*const otherPlanets = planets\.filter\(p => p !== lagnaLabel\);\s*\/\/ Split other planets into lines of 3 or 4 based on density\s*const lines = \[\];\s*const chunkSize = otherPlanets\.length > 5 \? 3 : 4;\s*for \(let i = 0; i < otherPlanets\.length; i \+= chunkSize\) \{\s*lines\.push\(otherPlanets\.slice\(i, i \+ chunkSize\)\.join\(', '\)\);\s*\}/g;

content = content.replace(re, replace);
fs.writeFileSync(file, content);
console.log('Regex patch complete');
