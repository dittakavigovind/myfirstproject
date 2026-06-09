require('dotenv').config();
const mongoose = require('mongoose');
const astroController = require('./src/controllers/astroController');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const req = {
        params: { id: '69aae0e80a3bb20217853e6f' },
        body: {
            displayName: 'lakshmi suneetha',
            image: 'http://192.168.29.133:5000/api/uploads/file-1779987315233.webp',
            bio: 'Iam an Astrologer since 4yrs of experience in Vedic Astrology...',
            skills: ['Vedic', 'Palmistry'],
            languages: ['English', 'Telugu'],
            location: 'Hyderabad, Telangana, India',
            rating: 3.9,
            experienceYears: 5,
            charges: { chatPerMinute: 25, callPerMinute: 30, videoPerMinute: 40 },
            badgeText: 'PREMIUM'
        }
    };

    const res = {
        status: function(code) {
            console.log('Status:', code);
            return this;
        },
        json: function(data) {
            console.log('Response:', data);
        }
    };

    try {
        await astroController.updateAstrologer(req, res);
    } catch(err) {
        console.error('Uncaught Error:', err);
    }
    process.exit(0);
});
