
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Astrologer = require('../models/Astrologer');

const checkStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const astrologers = await Astrologer.find({}, 'displayName isOnline');
        console.log('Current Astrologer Statuses:');
        astrologers.forEach(a => {
            console.log(`${a.displayName}: ${a.isOnline}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkStatus();
