const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        refPath: 'reporterModel'
    },
    reporterModel: { 
        type: String, 
        required: true, 
        enum: ['User', 'Astrologer'] 
    },
    reportedId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        refPath: 'reportedModel'
    },
    reportedModel: { 
        type: String, 
        required: true, 
        enum: ['User', 'Astrologer'] 
    },
    reason: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'], 
        default: 'pending' 
    },
    actionTaken: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
