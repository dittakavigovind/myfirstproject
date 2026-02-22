const mongoose = require('mongoose');
const Interaction = require('./src/models/Interaction');
const User = require('./src/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to DB');

    const allCount = await Interaction.countDocuments({});
    console.log('Total Interactions:', allCount);

    const panchangCount = await Interaction.countDocuments({ cardType: 'PANCHANG' });
    console.log('Panchang Interactions:', panchangCount);

    const calendarCount = await Interaction.countDocuments({ cardType: 'CALENDAR' });
    console.log('Calendar Interactions:', calendarCount);

    const userLinkedCount = await Interaction.countDocuments({ userId: { $ne: null } });
    console.log('Interactions with userId:', userLinkedCount);

    if (userLinkedCount > 0) {
        const linked = await Interaction.find({ userId: { $ne: null } }).populate('userId', 'email').limit(5);
        console.log('Linked Samples:', JSON.stringify(linked, null, 2));
    }

    const panchangSamples = await Interaction.find({ cardType: 'PANCHANG' }).limit(3);
    console.log('Panchang Samples:', JSON.stringify(panchangSamples, null, 2));

    mongoose.disconnect();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
