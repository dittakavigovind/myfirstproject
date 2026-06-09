require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Astrologer = require('./src/models/Astrologer');
    const astros = await Astrologer.find({ gallery: { $exists: true, $not: {$size: 0} } }).select('displayName gallery');
    console.log(JSON.stringify(astros, null, 2));
    process.exit(0);
}).catch(console.error);
