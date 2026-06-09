require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./backend/src/models/User');

async function test() {
    await mongoose.connect('mongodb+srv://admin:admin@cluster0.p75u3s4.mongodb.net/way2astro?retryWrites=true&w=majority');
    
    const userId = "64f1b2c3d4e5f6a7b8c9d0e1"; // Replace with actual ID if possible, or just create a mock user
    
    // Create mock user
    const user = new User({ email: "testastro@test.com", role: "astrologer" });
    await user.save();
    
    console.log("Initial:", user.isChatOnline, user.isVoiceOnline);
    
    // Toggle Chat
    let updates = { isChatOnline: true };
    let updatedUser = await User.findByIdAndUpdate(user._id, { $set: updates }, { new: true });
    console.log("After Chat:", updatedUser.isChatOnline, updatedUser.isVoiceOnline);
    
    // Toggle Voice
    updates = { isVoiceOnline: true };
    updatedUser = await User.findByIdAndUpdate(user._id, { $set: updates }, { new: true });
    console.log("After Voice:", updatedUser.isChatOnline, updatedUser.isVoiceOnline);
    
    process.exit(0);
}

test();
