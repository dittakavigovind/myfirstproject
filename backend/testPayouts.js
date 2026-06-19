require('dotenv').config();
const mongoose = require('mongoose');
const Astrologer = require('./src/models/Astrologer');
const User = require('./src/models/User');
const { generatePayouts } = require('./src/cron/payoutCron');

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Finding an active astrologer...");
        const astro = await Astrologer.findOne({ isActive: true });
        if (!astro) {
            console.log("No active astrologers found.");
            process.exit(0);
        }

        console.log(`Setting wallet balance for ${astro.displayName} to 1500`);
        astro.walletBalance = 1500;
        await astro.save();

        console.log(`Setting TDS to 5% and PG to 3% for user ${astro.userId}`);
        const user = await User.findById(astro.userId);
        if (user) {
            user.tdsPercentage = 5;
            user.pgPercentage = 3;
            await user.save();
        }

        console.log("Running payout cron...");
        await generatePayouts();
        
        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
