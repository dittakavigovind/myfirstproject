const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');

const calculateDormantMoney = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const result = await User.aggregate([
            {
                $match: {
                    isDeleted: true,
                    walletBalance: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDormantMoney: { $sum: '$walletBalance' },
                    deletedUsersCount: { $sum: 1 }
                }
            }
        ]);

        if (result.length > 0) {
            console.log('\n--- Dormant Money Report ---');
            console.log(`Total Dormant Money: ₹${result[0].totalDormantMoney.toFixed(2)}`);
            console.log(`From ${result[0].deletedUsersCount} deleted users.`);
            console.log('----------------------------\n');
        } else {
            console.log('No dormant money found. All deleted users have 0 wallet balance.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

calculateDormantMoney();
