require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function resetWallets() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const result = await User.updateMany(
            { 
                phone: { $nin: ['9948505111', '9849097924'] }, 
                role: 'user' 
            }, 
            { $set: { walletBalance: 0 } }
        );

        console.log('Wallet Reset Result:', result);
        process.exit(0);
    } catch (err) {
        console.error('Error resetting wallets:', err);
        process.exit(1);
    }
}

resetWallets();
