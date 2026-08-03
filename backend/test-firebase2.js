require('dotenv').config();
const { getApps } = require('firebase-admin/app');
const admin = require('./src/config/firebase');

async function test() {
    if (getApps().length === 0) {
        console.log('Firebase not initialized');
        return process.exit(1);
    }
    
    try {
        const db = admin.firestore();
        const roomId = 'e423aef8c8a17532ff23636b4e340e40'; 
        const snapshot = await db.collection('chat_sessions').doc(roomId).collection('messages').get();
        console.log(`Found ${snapshot.docs.length} messages in Firebase for ${roomId}`);
    } catch (err) {
        console.error('Firebase error:', err);
    }
    process.exit(0);
}

test();
