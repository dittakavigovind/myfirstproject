require('dotenv').config();
require('./src/config/firebase');
const { getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function test() {
    if (getApps().length === 0) {
        console.log('Firebase not initialized');
        return process.exit(1);
    }
    
    try {
        const db = getFirestore();
        // Use the roomId that has 0 messages in MongoDB
        const roomId = 'c2b1ebe96dc8bece8aaeef4910d7c961'; 
        const snapshot = await db.collection('chat_sessions').doc(roomId).collection('messages').get();
        console.log(`Found ${snapshot.docs.length} messages in Firebase for ${roomId}`);
    } catch (err) {
        console.error('Firebase error:', err);
    }
    process.exit(0);
}

test();
