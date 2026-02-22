
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Astrologer = require('../models/Astrologer');

const resetStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const result = await Astrologer.updateMany({}, { isOnline: false });
        console.log('Reset result:', result);

        console.log('All astrologers set to OFFLINE.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

resetStatus();
