const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Session = require('../src/models/Session');

async function testSessions() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Session.countDocuments({ sessionType: 'chat' });
        console.log('Total Chat Sessions:', count);
        
        const sessions = await Session.find({ sessionType: 'chat' }).sort({ createdAt: -1 }).limit(5);
        sessions.forEach(s => {
             console.log(`Session: ${s._id}, Status: ${s.status}, Room: ${s.roomId}, CreatedAt: ${s.createdAt}`);
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
testSessions();
