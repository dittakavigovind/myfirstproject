const fs = require('fs');
const file = 'c:/Users/DELL/Desktop/Antigravity/WAY2ASTRO/way2astro2/frontend/src/components/KundliChart.js';
let content = fs.readFileSync(file, 'utf8');

const target = `                const lagnaLabel = lang === 'hi' ? 'लग्न' : lang === 'te' ? 'లగ్నం' : 'Lagna';
                const hasLagna = planets.includes(lagnaLabel);
                const otherPlanets = planets.filter(p => p !== lagnaLabel);

                // Split other planets into lines of 3 or 4 based on density
                const lines = [];
                const chunkSize = otherPlanets.length > 5 ? 3 : 4;
                for (let i = 0; i < otherPlanets.length; i += chunkSize) {
                    lines.push(otherPlanets.slice(i, i + chunkSize).join(', '));
                }`;
                
const replace = `                const lagnaPlanet = planets.find(p => p.isLagna);
                const otherPlanets = planets.filter(p => !p.isLagna).map(p => p.text);

                // Split other planets into lines of 2 due to degree/symbols length
                const lines = [];
                const chunkSize = 2;
                for (let i = 0; i < otherPlanets.length; i += chunkSize) {
                    lines.push(otherPlanets.slice(i, i + chunkSize).join(', '));
                }`;

content = content.replace(target, replace);
fs.writeFileSync(file, content);
console.log('Patched');
