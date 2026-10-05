const axios = require('axios');

async function test() {
    try {
        console.log("Fetching today's blessing...");
        const res = await axios.get('http://192.168.29.133:5000/api/daily-blessing/today');
        const blessing = res.data.blessing;
        console.log(blessing);
        
        const imageUrl = blessing.imageUrl;
        console.log("Image URL from DB:", imageUrl);
        
        let targetUrl = imageUrl;
        if (targetUrl.includes('/api/uploads/')) {
            const parts = targetUrl.split('/api/uploads/');
            targetUrl = `http://192.168.29.133:5000/api/uploads/${parts[1]}`;
        }
        
        console.log("Trying to fetch image from:", targetUrl);
        const imgRes = await axios.get(targetUrl, { responseType: 'arraybuffer' });
        console.log("Image fetch success! Size:", imgRes.data.length);
        
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", e.response.data.toString('utf8'));
        }
    }
}

test();
