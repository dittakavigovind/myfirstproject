const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    const User = require('./src/models/User');
    
    // Find an admin user
    const adminUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
    if (!adminUser) {
        console.log('No admin found');
        return process.exit(1);
    }
    
    // Generate token
    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    // Pick a roomId that has messages
    const roomId = 'e423aef8c8a17532ff23636b4e340e40'; 
    
    try {
        const res = await axios.get(`http://localhost:5000/api/chat/session/${roomId}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Response:', res.data.success);
        console.log(`Received ${res.data.messages.length} messages`);
        if (res.data.messages.length > 0) {
            console.log('First message content:', res.data.messages[0].content);
        }
    } catch (err) {
        console.error('API Error:', err.response ? err.response.data : err.message);
    }
    
    process.exit(0);
}

test();
