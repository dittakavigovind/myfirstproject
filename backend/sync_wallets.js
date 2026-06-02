const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const astrologers = await mongoose.connection.db.collection('astrologers').find({}).toArray();
    for (let a of astrologers) {
        if (a.walletBalance > 0) {
            console.log(`Syncing ${a.displayName}: ${a.walletBalance}`);
            await mongoose.connection.db.collection('users').updateOne(
                { _id: a.userId },
                { $set: { walletBalance: a.walletBalance } }
            );
        }
    }
    console.log('Synced User wallet balances with Astrologer earnings');
    process.exit(0);
});
