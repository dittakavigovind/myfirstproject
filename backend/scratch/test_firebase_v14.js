const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const admin = require('../src/config/firebase');
const { getFirestore } = require('firebase-admin/firestore');

async function testFirebaseV14() {
    try {
        const db = getFirestore();
        const roomId = '7f3b2b217c5e9e3dfd2cf2c3f0433cf1'; // The room id of the latest chat
        console.log('Checking Firebase for Room:', roomId);

        const messagesSnapshot = await db.collection('chat_sessions')
            .doc(roomId)
            .collection('messages')
            .orderBy('createdAt', 'asc')
            .get();

        console.log(`Found ${messagesSnapshot.size} messages.`);
        messagesSnapshot.forEach(doc => {
             console.log(doc.data().senderModel, doc.data().content);
        });
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
testFirebaseV14();
