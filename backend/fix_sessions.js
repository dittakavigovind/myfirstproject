const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const sessions = await mongoose.connection.db.collection('sessions').find({ status: 'completed' }).toArray();
    for (let s of sessions) {
        if (!s.totalAmountDeducted) {
            const amt = s.pricePerMinute * Math.ceil((s.totalDuration || 60) / 60);
            await mongoose.connection.db.collection('sessions').updateOne({ _id: s._id }, { $set: { totalAmountDeducted: amt } });
        }
    }
    console.log('Fixed old sessions');
    process.exit(0);
});
