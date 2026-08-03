require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./src/models/Message');
const Session = require('./src/models/Session');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const messagesCount = await Message.countDocuments();
    console.log(`Total messages in DB: ${messagesCount}`);

    if (messagesCount > 0) {
        const sampleMsg = await Message.findOne();
        console.log('Sample Message:', sampleMsg);

        // check if sessionId is an ObjectId or string
        const sessionIdType = typeof sampleMsg.sessionId;
        console.log('sessionId type:', sessionIdType, sampleMsg.sessionId);
        
        // Find session
        const session = await Session.findById(sampleMsg.sessionId);
        console.log('Corresponding Session:', session ? `Found, roomId: ${session.roomId}` : 'Not found');
    }
    
    // Find a session with messages
    const sessions = await Session.find().limit(5);
    for (let s of sessions) {
        const msgs = await Message.find({ sessionId: s._id });
        console.log(`Session ${s.roomId} (${s._id}) has ${msgs.length} messages`);
    }

    process.exit(0);
}

test();
