const mongoose = require('mongoose');

const siteVisitSchema = new mongoose.Schema({
    date: {
        type: String, // format: YYYY-MM-DD
        required: true,
        unique: true,
        index: true
    },
    count: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('SiteVisit', siteVisitSchema);
