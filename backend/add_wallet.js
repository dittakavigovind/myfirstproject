require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const phoneNumber = '+919849097924';
        const amountToAdd = 1000;

        const user = await User.findOne({ phone: phoneNumber });
        if (!user) {
            console.log(`User with phone ${phoneNumber} not found.`);
            process.exit(1);
        }

        user.walletBalance += amountToAdd;
        await user.save();

        const transaction = new Transaction({
            user: user._id,
            type: 'credit',
            amount: amountToAdd,
            totalAmount: amountToAdd,
            description: 'Manual wallet top-up by admin',
            status: 'success',
            referenceModel: 'WalletRecharge'
        });
        await transaction.save();

        console.log(`Successfully added ${amountToAdd} to user ${user.name || user.phone}. New balance is ${user.walletBalance}`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

main();
