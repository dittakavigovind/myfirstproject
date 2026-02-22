const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}).sort({ createdAt: -1 }).limit(10);

        console.log('Last 10 users:');
        users.forEach(u => {
            console.log(`ID: ${u._id}`);
            console.log(`Name: ${u.name}`);
            console.log(`Phone: ${u.phone}`);
            console.log(`Gender: ${u.gender}`);
            console.log(`BirthDetails: ${JSON.stringify(u.birthDetails)}`);
            console.log(`Created: ${u.createdAt}`);
            console.log('-------------------');
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
