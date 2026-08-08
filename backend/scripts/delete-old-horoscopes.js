const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require('moment');

// Models
const DailyHoroscope = require('../src/models/DailyHoroscope');
const WeeklyHoroscope = require('../src/models/WeeklyHoroscope');
const MonthlyHoroscope = require('../src/models/MonthlyHoroscope');

// Load environment variables
dotenv.config();

const deleteOldHoroscopes = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Database connected successfully.');

        const today = moment().startOf('day').toDate();
        const currentMonth = moment().month() + 1; // 1-12
        const currentYear = moment().year();

        console.log('--- Deleting Old Horoscopes ---');

        // Delete past daily horoscopes
        const dailyResult = await DailyHoroscope.deleteMany({
            date: { $lt: today }
        });
        console.log(`Deleted ${dailyResult.deletedCount} past Daily Horoscopes.`);

        // Delete past weekly horoscopes
        const weeklyResult = await WeeklyHoroscope.deleteMany({
            weekEndDate: { $lt: today }
        });
        console.log(`Deleted ${weeklyResult.deletedCount} past Weekly Horoscopes.`);

        // Delete past monthly horoscopes
        const monthlyResult = await MonthlyHoroscope.deleteMany({
            $or: [
                { year: { $lt: currentYear } },
                { year: currentYear, month: { $lt: currentMonth } }
            ]
        });
        console.log(`Deleted ${monthlyResult.deletedCount} past Monthly Horoscopes.`);

        console.log('--- Deletion Completed ---');

    } catch (error) {
        console.error('Error deleting old horoscopes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database disconnected.');
        process.exit(0);
    }
};

deleteOldHoroscopes();
