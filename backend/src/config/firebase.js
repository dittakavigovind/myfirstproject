const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
        serviceAccount = JSON.parse(decoded);
    } catch (e) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64.');
    }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON environment variable.');
    }
} else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require('./firebase-service-account.json');
}

if (serviceAccount) {
    try {
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
