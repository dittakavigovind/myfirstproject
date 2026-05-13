const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
    try {
        const serviceAccount = require('./firebase-service-account.json');
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        
        console.log('🔥 Firebase Admin SDK Initialized Successfully.');
    } catch (error) {
        console.error('❌ Firebase Admin Initialization Error:', error);
    }
} else {
    console.warn('⚠️ Firebase Service Account Key not found. Push notifications will be simulating only.');
}

module.exports = admin;
