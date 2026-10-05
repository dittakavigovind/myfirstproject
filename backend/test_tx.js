require('dotenv').config();
const mongoose = require('mongoose');

const checkTransactions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // First find the user
        // Assuming the model is 'User'
        const User = require('./src/models/User');
        const Transaction = require('./src/models/Transaction');

        let user = await User.findOne({ 
            $or: [
                { phone: '9849097924' },
                { phone: '+919849097924' },
                { email: /9849097924/i },
                { _id: '9849097924' } // in case it's somehow a custom ID
            ]
        });

        if (!user) {
            // try by just doing a regex search on any string field that might contain 9849097924
            user = await User.findOne({ $text: { $search: '9849097924' } });
            if (!user) {
                // let's just find any user to see the schema
                user = await User.findOne({ phone: /9849097924/ });
            }
        }

        if (!user) {
            console.log('User not found. Printing all users phone numbers to see format:');
            const sampleUsers = await User.find().limit(5);
            console.log(sampleUsers.map(u => ({ id: u._id, phone: u.phone, email: u.email })));
            process.exit(0);
        }

        console.log(`Found user: ${user._id} - ${user.phone}`);

        const transactions = await Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);
        console.log('Recent transactions for user:');
        console.log(transactions.map(t => ({
            id: t._id,
            amount: t.amount,
            status: t.status,
            description: t.description,
            date: t.createdAt
        })));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
};

checkTransactions();
