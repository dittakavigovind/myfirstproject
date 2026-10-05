const admin = require('../src/config/firebase');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkFirebase() {
    try {
        const db = admin.firestore();
        const roomId = '7f3b2b217c5e9e3dfd2cf2c3f0433cf1';
        console.log('Checking Firebase for Room:', roomId);

        const messagesSnapshot = await db.collection('chat_sessions')
            .doc(roomId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .get();

        console.log(`Found ${messagesSnapshot.size} messages.`);
        messagesSnapshot.forEach(doc => {
             console.log(doc.data());
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkFirebase();
