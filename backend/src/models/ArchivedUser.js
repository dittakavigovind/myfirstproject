const mongoose = require('mongoose');

const archivedUserSchema = new mongoose.Schema({
    originalUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    role: {
        type: String,
        default: 'user'
    },
    userData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    astrologerData: {
        type: mongoose.Schema.Types.Mixed
    },
    deletedBy: {
        type: String,
        enum: ['user', 'admin'],
        required: true
    },
    deletedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('ArchivedUser', archivedUserSchema);
