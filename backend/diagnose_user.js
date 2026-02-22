const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function inspect(phone) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ phone: phone });
        if (!user) {
            console.log(`User ${phone} not found`);
            const all = await User.find({}).limit(5);
            console.log('Available phones:', all.map(u => u.phone));
        } else {
            console.log('User found:');
            console.log(JSON.stringify(user, null, 2));

            const isProfileComplete =
                user.name &&
                user.name !== 'User' &&
                user.gender &&
                user.birthDetails &&
                user.birthDetails.date;

            console.log('Is Profile Complete (Backend Logic):', !!isProfileComplete);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

inspect('+919948505111');
