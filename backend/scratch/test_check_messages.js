const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Message = require('../src/models/Message');

async function testMessages() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Message.countDocuments();
        console.log('Total Messages:', count);
        const lastMsg = await Message.findOne().sort({ createdAt: -1 });
        if (lastMsg) {
             console.log('Last message:', lastMsg.toObject());
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
testMessages();
