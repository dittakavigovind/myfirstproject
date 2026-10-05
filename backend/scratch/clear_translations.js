const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const UserMemory = require('./src/models/UserMemory');

async function clearTranslationsCache() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const result = await UserMemory.updateMany(
            {}, 
            { $set: { translations: {} } }
        );

        console.log(`Cleared translations cache for ${result.modifiedCount} user memories.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

clearTranslationsCache();
