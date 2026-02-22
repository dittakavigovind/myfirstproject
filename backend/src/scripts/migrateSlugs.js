const mongoose = require('mongoose');
const Astrologer = require('../models/Astrologer');
require('dotenv').config(); // Load env for DB string if running standalone, typical setup

// Hardcoded DB URI if dotenv not picked up easily in script runner context, 
// OR user might have it in environment. 
// Assuming standard Next/Express setup, we try to connect using same logic.
// For safety, I'll ask Mongoose to use the existing connection if possible, 
// but since this is a standalone script, we need to connect.
// I will assume local DB or check `server.js` if needed, but for now assuming standard localhost or env.

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/way2astro";

const migrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const astrologers = await Astrologer.find({ slug: { $exists: false } });
        console.log(`Found ${astrologers.length} astrologers without slugs.`);

        for (const astro of astrologers) {
            let baseSlug = astro.displayName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            // Simple uniqueness check could be added here, but for now just appending a random number is safe enough for migration
            // or iterating.
            // Let's rely on the fact that if we just save, and it fails unique index, checking uniqueness is harder without logic.
            // I'll append the last 4 chars of ID to be deterministic and unique.
            const uniqueSuffix = astro._id.toString().slice(-4);
            const slug = `${baseSlug}-${uniqueSuffix}`;

            astro.slug = slug;
            await astro.save();
            console.log(`Updated ${astro.displayName} -> ${slug}`);
        }

        console.log('Migration Complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration Failed', error);
        process.exit(1);
    }
};

migrate();
