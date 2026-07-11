const mongoose = require('mongoose');

const userBlockSchema = new mongoose.Schema({
    blockerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        refPath: 'blockerModel'
    },
    blockerModel: { 
        type: String, 
        required: true, 
        enum: ['User', 'Astrologer'] 
    },
    blockedId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        refPath: 'blockedModel'
    },
    blockedModel: { 
        type: String, 
        required: true, 
        enum: ['User', 'Astrologer'] 
    }
}, { timestamps: true });

// Ensure a user can only block someone once
userBlockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });

module.exports = mongoose.model('UserBlock', userBlockSchema);
