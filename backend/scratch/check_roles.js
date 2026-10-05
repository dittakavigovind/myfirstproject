const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config({ path: '.env' });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to DB');

        const phones = ['+919948505111', '+919849097924', '+919491537320', '+919032594469', '+919999999999'];
        
        for (let phone of phones) {
            const user = await User.findOne({ phone: phone });
            if (user) {
                console.log(`Phone: ${phone} -> Found! Role: ${user.role}, Name: ${user.name}`);
            } else {
                console.log(`Phone: ${phone} -> NOT FOUND!`);
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();
    }
};

checkUsers();
