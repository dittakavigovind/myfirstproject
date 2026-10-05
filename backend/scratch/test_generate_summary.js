const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Session = require('../src/models/Session');
const AiInsightService = require('../src/services/AiInsightService');

async function testGenerate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const session = await Session.findOne({ sessionType: 'chat' }).sort({ createdAt: -1 });
        if (!session) {
            console.log('No chat session found');
            process.exit();
        }

        console.log('Found session:', session._id);
        const result = await AiInsightService.generateSessionSummary(session._id);
        console.log('Result:', result ? 'Success' : 'No result returned');
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testGenerate();
