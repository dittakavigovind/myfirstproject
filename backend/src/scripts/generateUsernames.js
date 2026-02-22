const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Force Atlas URI to ensure we migrate the correct DB
const MONGODB_URI = "mongodb+srv://WAY2ASTRO:adithya123@cluster0.lt2myuz.mongodb.net/Way2Astro";

const migrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            // Generate base username from name or email part
            let baseName = user.name || (user.email ? user.email.split('@')[0] : 'user');
            // Basic slugify
            let baseSlug = baseName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            if (!baseSlug) baseSlug = 'user';

            let username = baseSlug;
            let counter = 1;

            // Check if this username exists for ANY OTHER user
            while (await User.findOne({ username, _id: { $ne: user._id } })) {
                username = `${baseSlug}-${counter}`;
                counter++;
            }

            if (user.username !== username) {
                user.username = username;
                await user.save();
                console.log(`Updated User ${user._id}: ${user.name} -> ${username}`);
            } else {
                console.log(`Skipped User ${user.name}: already has username (${username})`);
            }
        }

        console.log('User Username Migration Complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration Failed', error);
        process.exit(1);
    }
};

migrate();
