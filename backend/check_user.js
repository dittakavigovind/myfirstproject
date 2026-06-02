require('mongoose').connect(require('dotenv').config().parsed.MONGO_URI).then(async () => { 
    const User = require('./src/models/User'); 
    const users = await User.find({ phone: { $regex: '9849097924' } }); 
    console.log(users); 
    process.exit(0); 
}).catch(console.error);
