require('dotenv').config();
const mongoose = require('mongoose');
const DailyBlessing = require('../src/models/DailyBlessing');

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const blessing = await DailyBlessing.findOne().sort({ createdAt: -1 });
    console.log(blessing);
    process.exit(0);
}

test();
