require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Session = require('./src/models/Session');
    const sessions = await Session.find({ roomId: { $in: ['71d489a92659b287f4e5fbb50f9b5882', '9e5a4b548dc0edf02c495ec32904c01e'] } });
    console.log(sessions.map(s => ({roomId: s.roomId, status: s.status})));
    
    // Also log how many active sessions exist
    const activeCount = await Session.countDocuments({ status: 'active' });
    console.log('Total active sessions count:', activeCount);
    
    // And what are the statuses of all sessions?
    const statuses = await Session.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('Session status breakdown:', statuses);

    process.exit(0);
}).catch(console.error);
