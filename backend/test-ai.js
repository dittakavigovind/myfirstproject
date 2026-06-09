require('dotenv').config();
const mongoose = require('mongoose');
const Session = require('./src/models/Session');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const sessions = await Session.find().sort({ createdAt: -1 }).limit(5);
    sessions.forEach(s => console.log(`Session ${s._id} - roomId: ${s.roomId} - status: ${s.status} - type: ${s.sessionType} - startTime: ${s.startTime}`));
    process.exit(0);
}

test();
