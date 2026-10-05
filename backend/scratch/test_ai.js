const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const AiInsightService = require('./src/services/AiInsightService');

async function test() {
    const res = await AiInsightService.translateInsights({ summary: "Hello" }, "Hindi");
    console.log(res);
}

test();
