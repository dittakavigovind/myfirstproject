require('dotenv').config();
const mongoose = require('mongoose');
const Astrologer = require('./src/models/Astrologer');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    try {
        const astrologer = await Astrologer.findOne({ slug: 'lakshmi-suneetha-6402' });
        if(astrologer) {
            console.log('Found', astrologer.displayName);
            
            // Try updating
            astrologer.displayName = 'lakshmi suneetha';
            astrologer.badgeText = 'PREMIUM';
            astrologer.rating = 3.9;
            astrologer.charges = { chatPerMinute: 25, callPerMinute: 30, videoPerMinute: 40 };

            if (astrologer.displayName && astrologer.displayName !== astrologer.displayName) {
                // this block won't run because of the bug
            }
            // Oh wait! The bug is here!
            // I wrote: if (displayName && displayName !== astrologer.displayName) { ... }
            // If they change display name, the new slug is generated.
            
            await astrologer.save();
            console.log('Saved');
        } else {
             console.log('Not found');
        }
    } catch(err) {
        console.error('Error saving', err);
    }
    process.exit(0);
});
