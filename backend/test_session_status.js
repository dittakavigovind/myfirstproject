require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/way2astro');
const Session = require('./src/models/Session');

async function test() {
    const session = await Session.findOne().sort({ createdAt: -1 });
    console.log("Latest Session details:", JSON.stringify(session, null, 2));
    process.exit(0);
}
test();
