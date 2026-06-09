require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Session = require('./src/models/Session');
    const User = require('./src/models/User');
    const Astrologer = require('./src/models/Astrologer');
    
    const user = await User.findOne({ name: 'Govind Airtel-User' });
    const astro = await Astrologer.findOne();
    
    let session = new Session({
        roomId: 'test_' + Date.now(),
        sessionType: 'chat',
        userId: user._id,
        astrologerId: astro._id,
        pricePerMinute: 15,
        status: 'active',
        startTime: new Date()
    });
    await session.save();
    
    console.log('Testing performDeduction...');
    try {
            const pricePerMinute = session.pricePerMinute;
            const u = await User.findById(session.userId);

            if (u.walletBalance < pricePerMinute) {
                console.log('Insufficient wallet balance');
                return;
            }

            u.walletBalance -= pricePerMinute;
            await u.save();

            const astrologerInfo = await Astrologer.findById(session.astrologerId).select('commissionRate userId');
            let platformFeePercentage = 40; 
            if (astrologerInfo.commissionRate !== undefined && astrologerInfo.commissionRate !== null) {
                platformFeePercentage = astrologerInfo.commissionRate;
            }

            const platformFee = (pricePerMinute * platformFeePercentage) / 100;
            const earnings = pricePerMinute - platformFee;

            await Session.findByIdAndUpdate(session._id, {
                $inc: { 
                    totalAmountDeducted: pricePerMinute,
                    platformShare: platformFee,
                    astrologerShare: earnings
                }
            });

            await Astrologer.findByIdAndUpdate(session.astrologerId, {
                $inc: { totalEarnings: earnings, walletBalance: earnings }
            });

            await User.findByIdAndUpdate(astrologerInfo.userId, {
                $inc: { walletBalance: earnings }
            });

            session.totalDuration += 60;
            await session.save();
            
            console.log('Success! New Balance:', u.walletBalance);
    } catch (e) {
        console.error('Error in deduction:', e);
    }
    process.exit(0);
});
