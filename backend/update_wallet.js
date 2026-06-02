require('mongoose').connect(require('dotenv').config().parsed.MONGO_URI).then(async () => { 
    const User = require('./src/models/User'); 
    await User.updateOne({ phone: '9849097924' }, { $set: { walletBalance: 1000 } }); 
    console.log('Wallet updated!'); 
    process.exit(0); 
}).catch(console.error);
