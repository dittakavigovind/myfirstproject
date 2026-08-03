require('dotenv').config();
const admin = require('./src/config/firebase');

async function test() {
    if (!admin || admin.apps.length === 0) {
        console.log('Firebase not initialized');
        return process.exit(1);
    }
    
    try {
        const db = admin.firestore();
        const roomId = 'c2b1ebe96dc8bece8aaeef4910d7c961'; // one of the 0 message sessions
        const snapshot = await db.collection('chat_sessions').doc(roomId).collection('messages').get();
        console.log(`Found ${snapshot.docs.length} messages in Firebase for ${roomId}`);
    } catch (err) {
        console.error('Firebase error:', err);
    }
    process.exit(0);
}

test();
