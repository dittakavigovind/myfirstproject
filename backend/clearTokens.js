require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
    console.log('Connected to DB');
    const result = await User.updateMany({}, { $set: { fcmTokens: [] } });
    console.log('Cleared FCM tokens for all users:', result.modifiedCount);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
