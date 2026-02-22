const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
