require('dotenv').config();
const mongoose = require('mongoose');
const admin = require('./src/config/firebase');

async function test() {
    console.log("Admin apps:", admin.apps.length);
    if (admin.apps.length > 0) {
        const db = admin.firestore();
        const roomId = "0269c2845009e19bc27002843c16068d"; // example roomId from earlier logs
        const snapshot = await db.collection('chat_sessions').doc(roomId).collection('messages').get();
        console.log("Firebase docs found:", snapshot.empty ? 0 : snapshot.size);
    }
}
test();
