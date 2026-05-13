const fs = require('fs');
const path = require('path');

// Dynamically import node-fetch and form-data since they are ESM or CJS depending on version
async function test() {
    try {
        const fetch = (await import('node-fetch')).default || globalThis.fetch;
        const FormData = require('form-data');

        const dummyAudio = path.join(__dirname, 'dummy.mp3');
        fs.writeFileSync(dummyAudio, 'dummy mp3 content');
        
        const form = new FormData();
        form.append('file', fs.createReadStream(dummyAudio));
        
        const res = await fetch('http://localhost:5000/api/upload/audio', {
            method: 'POST',
            body: form
        });
        
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch (error) {
        console.error("Test Script Error:", error);
    }
}

test();
