require('dotenv').config(); 
const mongoose = require('mongoose'); 
mongoose.connect(process.env.MONGO_URI).then(async () => { 
  const UserBlock = require('./src/models/UserBlock'); 
  const Astrologer = require('./src/models/Astrologer'); 
  const astroUserId = '69849f62b3afe9b8b7b50a14'; 
  const astro = await Astrologer.findOne({ userId: astroUserId }); 
  const blockerIds = [astroUserId]; 
  if (astro) blockerIds.push(astro._id.toString()); 
  console.log("BlockerIds:", blockerIds);
  const blocks = await UserBlock.find({ blockerId: { $in: blockerIds }, blockerModel: 'Astrologer' }).populate('blockedId', 'name email profilePic avatar role isOnline status').sort({ createdAt: -1 }); 
  console.log(JSON.stringify(blocks, null, 2)); 
  process.exit(0); 
}).catch(e => { console.error(e); process.exit(1); });
