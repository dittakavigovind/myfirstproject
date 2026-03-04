const fs = require('fs');
const path = 'c:\\Users\\DELL\\Desktop\\Antigravity\\WAY2ASTRO\\way2astro2\\backend\\src\\controllers\\astroController.js';

let content = fs.readFileSync(path, 'utf8');

const oldBlock = `        // 2. Find and Update Astrologer Record
        let astrologer = await Astrologer.findOne({ userId: req.user.id });

        if (!astrologer) {
            return res.status(404).json({ message: 'Astrologer profile not found' });
        }`;

const newBlock = `        // 2. Find or Create Astrologer Record
        let astrologer = await Astrologer.findOne({ userId: req.user.id });

        if (!astrologer) {
            console.log("[UPDATE_PROFILE] Creating new profile for User:", req.user.id);
            astrologer = new Astrologer({
                userId: req.user.id,
                displayName: name || "Astrologer",
                slug: (name || "astrologer").toLowerCase().replace(/ /g, '-').replace(/[^\\w-]+/g, '') + '-' + Date.now().toString().slice(-4)
            });
        }`;

if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(path, content, 'utf8');
    console.log("File updated successfully.");
} else {
    console.log("Could not find the target block.");
    // Try with CRLF just in case
    const oldBlockCRLF = oldBlock.replace(/\n/g, '\r\n');
    if (content.includes(oldBlockCRLF)) {
        const newBlockCRLF = newBlock.replace(/\n/g, '\r\n');
        content = content.replace(oldBlockCRLF, newBlockCRLF);
        fs.writeFileSync(path, content, 'utf8');
        console.log("File updated successfully (with CRLF).");
    } else {
        console.log("Target block still not found after CRLF check.");
        // Try very simple match
        const simpleSearch = 'let astrologer = await Astrologer.findOne({ userId: req.user.id });';
        if (content.includes(simpleSearch)) {
            console.log("Simple search found the line. Replacing only that part.");
            // ... too complex here, let's just log what we see
            const index = content.indexOf(simpleSearch);
            console.log("Context around line:", content.substring(index - 50, index + 150));
        }
    }
}
