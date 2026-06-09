const mongoose = require('mongoose');
const Astrologer = require('./backend/src/models/Astrologer');
const User = require('./backend/src/models/User');
const Session = require('./backend/src/models/Session');
const AstrologerSession = require('./backend/src/models/AstrologerSession');
const AstrologerOnlineSession = require('./backend/src/models/AstrologerOnlineSession');

async function verifyState() {
    await mongoose.connect('mongodb://localhost:27017/way2astro');
    console.log("Connected to MongoDB");

    // This is just a placeholder to check if models are loadable and queries work
    const astrologers = await Astrologer.find({ isOnline: true });
    console.log("Online Astrologers count:", astrologers.length);

    const activeBilled = await Session.find({ status: { $in: ['active', 'initiated'] } });
    console.log("Active Billed Sessions count:", activeBilled.length);

    await mongoose.disconnect();
}

// verifyState();
console.log("Verification script ready. Run with node if needed.");
