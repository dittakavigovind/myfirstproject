const mongoose = require('mongoose');
require('dotenv').config();
const dbUrl = process.env.MONGO_URI || 'mongodb+srv://dittakavigovind:v0H8T83z2O1D0gB6@cluster0.glsrixm.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dbUrl).then(async () => {
    const users = await mongoose.connection.db.collection('users').find({ phone: { $in: ['+919948505111', '+919849097924', '9948505111', '9849097924'] } }).toArray();
    console.log(users.map(u => ({ phone: u.phone, balance: u.walletBalance })));
    process.exit(0);
}).catch(e => console.error(e));
