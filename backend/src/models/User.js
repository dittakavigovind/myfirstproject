const mongoose = require('mongoose');
const AstroService = require('../astrology/AstroService');
const tzUtils = require('../utils/timezoneUtils');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
    },
    mobileNumber: {
        type: String,
        sparse: true,
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
        select: false,
    },
    authProvider: {
        type: String,
        enum: ['email', 'google', 'whatsapp'],
        default: 'whatsapp',
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
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
        moonSign: String, // Persisted for horoscope redirection
        ascendant: String, // Persisted for cosmic identity display
        tithi: String,
        vara: String,
        nakshatra: String,
        pada: Number,
        yoga: String,
        karana: String,
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
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

// Pre-validate hook to lowercase gender
userSchema.pre('validate', function (next) {
    if (this.gender) {
        this.gender = this.gender.toLowerCase();
    }
    next();
});

// Centralized Astrological Calculation Helper
const calculateCosmicIdentity = async (birthDetails) => {
    if (!birthDetails) return null;
    const date = birthDetails.date || birthDetails.dob;
    const time = birthDetails.time || birthDetails.tob;
    const { lat, lng, latitude, longitude, timezone } = birthDetails;

    const calcLat = lat || latitude;
    const calcLng = lng || longitude;

    if (date && time && calcLat !== undefined && calcLng !== undefined) {
        try {
            const dateStr = tzUtils.formatInTimezone(date, timezone || 'Asia/Kolkata', "YYYY-MM-DD");
            const calcTz = timezone || 5.5;
            const kundli = await AstroService.generateKundli(dateStr, time, calcLat, calcLng, calcTz);
            const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

            const updates = {};
            if (kundli && kundli.planets && kundli.planets.Moon) {
                updates.moonSign = signs[kundli.planets.Moon.sign - 1];
            }
            if (kundli && kundli.houses && kundli.houses.ascendant !== undefined) {
                updates.ascendant = signs[Math.floor((kundli.houses.ascendant / 30) % 12)];
            }

            // Calculate Extended Panchang for Cosmic Identity
            if (kundli && kundli.panchang) {
                updates.tithi = kundli.panchang.tithi;
                updates.vara = kundli.panchang.vara;
                updates.yoga = kundli.panchang.yoga;
                updates.karana = kundli.panchang.karana;

                // Extract Nakshatra and Pada from panchang string or raw moon data
                // AstroService panchang.nakshatra looks like "Ashvini (Pada 1)"
                if (kundli.panchang.nakshatra) {
                    const nakMatch = kundli.panchang.nakshatra.match(/^(.+?)\s*\(Pada\s*(\d+)\)$/);
                    if (nakMatch) {
                        updates.nakshatra = nakMatch[1];
                        updates.pada = parseInt(nakMatch[2]);
                    } else {
                        updates.nakshatra = kundli.panchang.nakshatra;
                    }
                }
            }

            return updates;
        } catch (err) {
            console.error('Error calculating cosmic identity in model:', err);
        }
    }
    return null;
};

// Pre-save hook for normal save/create
userSchema.pre('save', async function (next) {
    if (this.isModified('birthDetails')) {
        const cosmic = await calculateCosmicIdentity(this.birthDetails);
        if (cosmic) {
            this.birthDetails.moonSign = cosmic.moonSign || this.birthDetails.moonSign;
            this.birthDetails.ascendant = cosmic.ascendant || this.birthDetails.ascendant;
            this.birthDetails.tithi = cosmic.tithi || this.birthDetails.tithi;
            this.birthDetails.vara = cosmic.vara || this.birthDetails.vara;
            this.birthDetails.nakshatra = cosmic.nakshatra || this.birthDetails.nakshatra;
            this.birthDetails.pada = cosmic.pada || this.birthDetails.pada;
            this.birthDetails.yoga = cosmic.yoga || this.birthDetails.yoga;
            this.birthDetails.karana = cosmic.karana || this.birthDetails.karana;
        }
    }
    next();
});

// Pre-findOneAndUpdate hook for findByIdAndUpdate/findOneAndUpdate
userSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (!update) return next();

    // Check if any birthDetails fields are being updated
    const isBirthUpdate = update.birthDetails ||
        (update.$set && (update.$set.birthDetails || Object.keys(update.$set).some(k => k.startsWith('birthDetails.'))));

    if (isBirthUpdate) {
        try {
            // Fetch the current user to merge updates with existing data
            const currentUser = await this.model.findOne(this.getQuery());
            if (!currentUser) return next();

            // Prepare merged birth details for calculation
            const mergedBirth = { ...(currentUser.birthDetails?.toObject() || {}) };

            if (update.birthDetails) {
                Object.assign(mergedBirth, update.birthDetails);
            } else if (update.$set) {
                if (update.$set.birthDetails) {
                    Object.assign(mergedBirth, update.$set.birthDetails);
                }
                // Also handle dot notation
                Object.keys(update.$set).forEach(key => {
                    if (key.startsWith('birthDetails.')) {
                        const field = key.split('.')[1];
                        mergedBirth[field] = update.$set[key];
                    }
                });
            }

            const cosmic = await calculateCosmicIdentity(mergedBirth);
            if (cosmic) {
                if (!update.$set) update.$set = {};

                if (update.birthDetails) {
                    update.birthDetails.moonSign = cosmic.moonSign;
                    update.birthDetails.ascendant = cosmic.ascendant;
                    update.birthDetails.tithi = cosmic.tithi;
                    update.birthDetails.vara = cosmic.vara;
                    update.birthDetails.nakshatra = cosmic.nakshatra;
                    update.birthDetails.pada = cosmic.pada;
                    update.birthDetails.yoga = cosmic.yoga;
                    update.birthDetails.karana = cosmic.karana;
                } else {
                    update.$set['birthDetails.moonSign'] = cosmic.moonSign;
                    update.$set['birthDetails.ascendant'] = cosmic.ascendant;
                    update.$set['birthDetails.tithi'] = cosmic.tithi;
                    update.$set['birthDetails.vara'] = cosmic.vara;
                    update.$set['birthDetails.nakshatra'] = cosmic.nakshatra;
                    update.$set['birthDetails.pada'] = cosmic.pada;
                    update.$set['birthDetails.yoga'] = cosmic.yoga;
                    update.$set['birthDetails.karana'] = cosmic.karana;
                }
            }
        } catch (err) {
            console.error('Error in pre-findOneAndUpdate cosmic identity hook:', err);
        }
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
