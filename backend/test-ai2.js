require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./src/models/Message');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const messages = await Message.find({ sessionId: '6a253a1db09f9ec9fa66f2c9' });
    console.log(`Found ${messages.length} messages in MongoDB for this session.`);
    process.exit(0);
}

test();
