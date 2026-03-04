const fs = require('fs');
const path = 'c:\\Users\\DELL\\Desktop\\Antigravity\\WAY2ASTRO\\way2astro2\\backend\\src\\controllers\\astroController.js';

let content = fs.readFileSync(path, 'utf8');

const oldBlock = `        // Map Frontend fields to Backend Model fields
        if (name) astrologer.displayName = name; // Sync display name
        if (expertise) astrologer.skills = expertise.split(',').map(s => s.trim());
        if (languages) astrologer.languages = languages.split(',').map(s => s.trim());`;

const newBlock = `        // Map Frontend fields to Backend Model fields
        if (name) astrologer.displayName = name; // Sync display name
        
        if (expertise !== undefined) {
             astrologer.skills = typeof expertise === 'string' ? expertise.split(',').map(s => s.trim()) : (Array.isArray(expertise) ? expertise : []);
        }
        
        if (languages !== undefined) {
             astrologer.languages = typeof languages === 'string' ? languages.split(',').map(s => s.trim()) : (Array.isArray(languages) ? languages : []);
        }`;

if (content.includes(oldBlock)) {
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(path, content, 'utf8');
    console.log("File updated successfully.");
} else {
    const oldBlockCRLF = oldBlock.replace(/\n/g, '\r\n');
    if (content.includes(oldBlockCRLF)) {
        const newBlockCRLF = newBlock.replace(/\n/g, '\r\n');
        content = content.replace(oldBlockCRLF, newBlockCRLF);
        fs.writeFileSync(path, content, 'utf8');
        console.log("File updated successfully (with CRLF).");
    } else {
        console.log("Target block still not found.");
    }
}

// Also update the success response with a log
const oldSuccess = `        await astrologer.save();
        res.json({ success: true, message: 'Profile updated successfully', data: astrologer });`;
const newSuccess = `        await astrologer.save();
        console.log("[UPDATE_PROFILE] Success for Astrologer:", astrologer._id);
        res.json({ success: true, message: 'Profile updated successfully', data: astrologer });`;

content = fs.readFileSync(path, 'utf8');
if (content.includes(oldSuccess)) {
    content = content.replace(oldSuccess, newSuccess);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Success response updated.");
} else {
    const oldSuccessCRLF = oldSuccess.replace(/\n/g, '\r\n');
    if (content.includes(oldSuccessCRLF)) {
        const newSuccessCRLF = newSuccess.replace(/\n/g, '\r\n');
        content = content.replace(oldSuccessCRLF, newSuccessCRLF);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Success response updated (with CRLF).");
    }
}
