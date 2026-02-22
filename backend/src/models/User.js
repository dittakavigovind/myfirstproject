const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        // required: [true, 'Please add an email'], // Make optional if phone login is primary
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        lowercase: true
    },
    password: {
        type: String,
        // required: [true, 'Please add a password'],
        select: false, // Don't return by default
    },
    role: {
        type: String,
        enum: ['user', 'astrologer', 'admin', 'manager'],
        default: 'user',
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    profileImage: {
        type: String,
        default: 'default-avatar.png' // Or URL
    },
    lastLogin: {
        type: Date
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    // Application Specific Fields
    birthDetails: {
        date: Date,
        time: String,
        place: String,
        lat: Number,
        lng: Number,
        timezone: String,
        dob: Date, // Legacy support
        tob: String, // Legacy support
        pob: String // Legacy support
    },
    savedCharts: [{
        name: String,
        date: Date,
        time: String,
        place: String,
        lat: Number,
        lng: Number,
        timezone: Number,
    }],
    // Astrologer Specific Fields
    expertise: { type: String },
    languages: { type: String },
    experience: { type: Number, default: 0 },
    about: { type: String },
    chatPrice: { type: Number, default: 0 },
    callPrice: { type: Number, default: 0 },
    videoPrice: { type: Number, default: 0 },
    isChatEnabled: { type: Boolean, default: false },
    isCallEnabled: { type: Boolean, default: false },
    isVideoEnabled: { type: Boolean, default: false },

    // Status Logic
    isOnline: { type: Boolean, default: false }, // Master Status
    isChatOnline: { type: Boolean, default: false },
    isVoiceOnline: { type: Boolean, default: false },
    isVideoOnline: { type: Boolean, default: false },
    lastOnlineAt: { type: Date }, // Timestamp when they went online
}, { timestamps: true });

// Pre-validate hook to lowercase gender
userSchema.pre('validate', function (next) {
    if (this.gender) {
        this.gender = this.gender.toLowerCase();
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
