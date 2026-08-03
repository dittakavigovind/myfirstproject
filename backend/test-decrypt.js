require('dotenv').config();
const mongoose = require('mongoose');
const Session = require('./src/models/Session');
const Message = require('./src/models/Message');
const CryptoUtil = require('./src/utils/cryptoUtil');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const roomId = 'e423aef8c8a17532ff23636b4e340e40';
    const session = await Session.findOne({ roomId });
    if (!session) {
        console.log('Session not found');
        return process.exit(1);
    }
    
    let messages = await Message.find({ sessionId: session._id }).sort({ createdAt: 1 });
    console.log(`Found ${messages.length} messages`);
    
    try {
        messages = messages.map(msg => {
            const m = msg.toObject();
            if (m.isEncrypted && m.iv) {
                m.content = CryptoUtil.decrypt(m.content, m.iv);
            }
            return m;
        });
        console.log('Decrypted messages successfully:', messages);
    } catch (err) {
        console.error('Decryption error:', err);
    }
    
    process.exit(0);
}

test();
