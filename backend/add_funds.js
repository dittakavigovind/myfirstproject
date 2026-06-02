const mongoose = require('mongoose');

require('dotenv').config();
const dbUrl = process.env.MONGO_URI || 'mongodb+srv://dittakavigovind:v0H8T83z2O1D0gB6@cluster0.glsrixm.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(dbUrl).then(async () => {
    console.log("Connected");
    const result = await mongoose.connection.db.collection('users').updateMany({}, { $set: { walletBalance: 5000 } });
    console.log("Updated:", result);
    process.exit(0);
}).catch(e => console.error(e));
