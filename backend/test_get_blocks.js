require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    require('./src/models/User');
    require('./src/models/Astrologer');
    const UserBlock = require('./src/models/UserBlock');
    const Astrologer = mongoose.model('Astrologer');

    const astroUserId = '69849f62b3afe9b8b7b50a14'; // This is req.user._id (string)
    const blockerModel = 'Astrologer';
    const blockerIds = [astroUserId];

    const astro = await Astrologer.findOne({ userId: astroUserId });
    if (astro) {
        blockerIds.push(astro._id.toString());
    }

    console.log("BlockerIds query parameter:", blockerIds);

    const blocks = await UserBlock.find({ 
        blockerId: { $in: blockerIds }, 
        blockerModel 
    })
    .populate('blockedId', 'name email profilePic avatar role isOnline status')
    .sort({ createdAt: -1 });
    
    console.log("Blocks found:", blocks.length);
    console.log(JSON.stringify(blocks, null, 2));

    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
