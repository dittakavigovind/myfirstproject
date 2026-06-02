const fs = require('fs');
const path = require('path');
const glob = require('glob');

glob('src/**/*.js', (err, files) => {
    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let updated = false;
        
        // Find getImageUrl function definitions
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('const getImageUrl = (path) => {')) {
                // Check if it already has normalization
                if (content.includes('const normalizedPath = path.replace(/\\\\\\\\/g, "/");')) continue;
                
                // Replace the function body
                let endIdx = i;
                for (let j = i; j < lines.length; j++) {
                    if (lines[j].includes('};') && (j - i) <= 5) {
                        endIdx = j;
                        break;
                    }
                }
                
                if (endIdx > i) {
                    const newFn =     const getImageUrl = (path) => {
        if (!path) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
        if (path.startsWith("http")) return path;
        const normalizedPath = path.replace(/\\\\\\\\/g, "/");
        return \http://192.168.29.133:5000\\\;
    };;
                    lines.splice(i, endIdx - i + 1, newFn);
                    updated = true;
                }
            }
        }
        
        if (updated) {
            fs.writeFileSync(file, lines.join('\n'));
            console.log('Updated ' + file);
        }
    });
});
