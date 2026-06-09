const mongoose = require('mongoose');
require('dotenv').config();

const dbUrl = process.env.MONGO_URI || 'mongodb+srv://dittakavigovind:v0H8T83z2O1D0gB6@cluster0.glsrixm.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(dbUrl).then(async () => {
    console.log("Connected");
    
    // Set everyone to 0
    await mongoose.connection.db.collection('users').updateMany(
        { phone: { $nin: ['+919948505111', '+919849097924', '9948505111', '9849097924'] } },
        { $set: { walletBalance: 0 } }
    );
    
    // Set specific users to 5000
    const result = await mongoose.connection.db.collection('users').updateMany(
        { phone: { $in: ['+919948505111', '+919849097924', '9948505111', '9849097924'] } },
        { $set: { walletBalance: 5000 } }
    );
    
    console.log("Updated specific users:", result.modifiedCount);
    process.exit(0);
}).catch(e => console.error(e));
