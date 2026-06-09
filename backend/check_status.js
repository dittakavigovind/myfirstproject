const mongoose = require('mongoose');
require('dotenv').config();
const dbUrl = process.env.MONGO_URI || 'mongodb+srv://dittakavigovind:v0H8T83z2O1D0gB6@cluster0.glsrixm.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dbUrl).then(async () => {
    const a = await mongoose.connection.db.collection('astrologers').findOne({});
    console.log('Astrologer:', a.displayName, 'Earnings:', a.totalEarnings, 'Wallet:', a.walletBalance);
    const u = await mongoose.connection.db.collection('users').find({ phone: { $in: ['+919948505111', '+919849097924'] } }).toArray();
    console.log('Users:', u.map(x => ({phone: x.phone, balance: x.walletBalance})));
    process.exit(0);
}).catch(e => console.error(e));
