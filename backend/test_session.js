require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/way2astro');
const Session = require('./src/models/Session');

async function test() {
    const sessions = await Session.find().sort({ createdAt: -1 }).limit(10);
    sessions.forEach((s, i) => {
        console.log(`Session ${i}: id=${s._id} | roomId=${s.roomId}`);
    });
    process.exit(0);
}
test();
