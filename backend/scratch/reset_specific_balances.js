const mongoose = require('mongoose');
const User = require('../src/models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const resetBalances = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const phones = ['9948505111', '9849097924', '+919948505111', '+919849097924'];
        const result = await User.updateMany(
            { phone: { $in: phones } },
            { $set: { walletBalance: 2000 } }
        );

        console.log(`Updated ${result.modifiedCount} users to ₹2000 balance.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetBalances();
