const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function test() {
    try {
        const dummyAudio = path.join(__dirname, 'dummy.mp3');
        fs.writeFileSync(dummyAudio, 'dummy content');
        
        const form = new FormData();
        form.append('file', fs.createReadStream(dummyAudio));
        
        const fetch = (await import('node-fetch')).default || globalThis.fetch;
        
        const res = await fetch('http://localhost:5000/api/upload/audio', {
            method: 'POST',
            body: form
        });
        
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data);
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
