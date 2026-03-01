const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'DELL', 'Desktop', 'Antigravity', 'WAY2ASTRO', 'way2astro2', 'backend', 'src', 'controllers', 'astroController.js');
let content = fs.readFileSync(filePath, 'utf8');

// The problematic block:
// res.json({ success: true, data: locationData });
//     });
// } catch (error) {

const searchStr = 'res.json({ success: true, data: locationData });\n        });\n    } catch (error) {';
// Wait, sometimes it might be different whitespace.
// Let's use a regex to be safe.

const regex = /res\.json\(\{ success: true, data: locationData \}\);\s+\}\);\s+\} catch \(error\) \{/m;
const replacement = 'res.json({ success: true, data: locationData });\n    } catch (error) {';

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Successfully fixed astroController.js');
} else {
    // Try another variation if regex failed
    const regex2 = /res\.json\(\{ success: true, data: locationData \}\);\s+\);\s+\} catch \(error\) \{/m;
    if (regex2.test(content)) {
        content = content.replace(regex2, replacement);
        fs.writeFileSync(filePath, content);
        console.log('Successfully fixed astroController.js (v2)');
    } else {
        console.log('Regex did not match. Current content around 460:');
        const lines = content.split('\n');
        console.log(lines.slice(455, 475).join('\n'));
    }
}
