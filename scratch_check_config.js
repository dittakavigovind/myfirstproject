const mongoose = require('mongoose');
const AppConfig = require('./backend/src/models/AppConfig');
require('dotenv').config({ path: './backend/.env' });

async function checkConfig() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const config = await AppConfig.findOne();
        console.log("Current AppConfig:", config);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkConfig();
