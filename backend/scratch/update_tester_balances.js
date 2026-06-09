require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function updateBalances() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await User.updateMany(
            { 
                phone: { $in: ['+919948505111', '+919849097924', '9948505111', '9849097924'] }
            }, 
            { $set: { walletBalance: 2000 } }
        );

        console.log('Balance Update Result:', result);
        process.exit(0);
    } catch (err) {
        console.error('Error updating balances:', err);
        process.exit(1);
    }
}

updateBalances();
