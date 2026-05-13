const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'senderModel',
        required: true
    },
    senderModel: {
        type: String,
        enum: ['User', 'Astrologer'],
        default: 'User'
    },
    content: {
        type: String,
        required: true
    },
    isEncrypted: {
        type: Boolean,
        default: false
    },
    iv: {
        type: String // Initialization Vector for decryption if stored encrypted
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'seen'],
        default: 'sent'
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
