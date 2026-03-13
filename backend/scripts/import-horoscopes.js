const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require('moment');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const DailyHoroscope = require('../src/models/DailyHoroscope');
const WeeklyHoroscope = require('../src/models/WeeklyHoroscope');
const MonthlyHoroscope = require('../src/models/MonthlyHoroscope');

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('Error: MONGO_URI not found in .env file');
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

const importData = async () => {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Usage: node scripts/import-horoscopes.js <path-to-json-file>');
        process.exit(1);
    }

    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`Error: File not found at ${absolutePath}`);
        process.exit(1);
    }

    try {
        const fileContent = fs.readFileSync(absolutePath, 'utf8');
        const data = JSON.parse(fileContent);

        if (!Array.isArray(data)) {
            console.error('Error: JSON data must be an array of horoscope objects');
            process.exit(1);
        }

        console.log(`Starting import of ${data.length} entries...`);

        for (const entry of data) {
            const { type, signs, title } = entry;

            if (!type || !signs || !title) {
                console.warn('Skipping invalid entry: missing type, signs, or title');
                continue;
            }

            if (type === 'daily') {
                const { date } = entry;
                if (!date) {
                    console.warn('Skipping daily entry: missing date');
                    continue;
                }
                
                // Use UTC Midnight for absolute consistency across all servers/browsers
                const utcDate = moment.utc(date).startOf('day').toDate();
                
                // Find existing records within 12 hours of this date to catch IST/local shifts
                const startWindow = moment.utc(utcDate).subtract(12, 'hours').toDate();
                const endWindow = moment.utc(utcDate).add(12, 'hours').toDate();

                await DailyHoroscope.findOneAndUpdate(
                    { date: { $gte: startWindow, $lte: endWindow } },
                    { date: utcDate, title, signs },
                    { upsert: true, new: true }
                );
                console.log(`[Daily] Imported horoscope for ${moment.utc(utcDate).format('YYYY-MM-DD')} (UTC)`);

            } else if (type === 'weekly') {
                const { weekStartDate, weekEndDate } = entry;
                if (!weekStartDate || !weekEndDate) {
                    console.warn('Skipping weekly entry: missing start or end date');
                    continue;
                }

                // Use UTC Midnight for absolute consistency
                const start = moment.utc(weekStartDate).startOf('day').toDate();
                const end = moment.utc(weekEndDate).startOf('day').toDate();

                // Fuzzy match for existing weekly ranges (+/- 12h)
                const startWindowLow = moment.utc(start).subtract(12, 'hours').toDate();
                const startWindowHigh = moment.utc(start).add(12, 'hours').toDate();

                await WeeklyHoroscope.findOneAndUpdate(
                    { 
                        weekStartDate: { $gte: startWindowLow, $lte: startWindowHigh }
                    },
                    { weekStartDate: start, weekEndDate: end, title, signs },
                    { upsert: true, new: true }
                );
                console.log(`[Weekly] Imported horoscope for ${moment.utc(start).format('YYYY-MM-DD')} to ${moment.utc(end).format('YYYY-MM-DD')} (UTC)`);

            } else if (type === 'monthly') {
                const { month, year } = entry;
                if (!month || !year) {
                    console.warn('Skipping monthly entry: missing month or year');
                    continue;
                }
                await MonthlyHoroscope.findOneAndUpdate(
                    { month: parseInt(month), year: parseInt(year) },
                    { month, year, title, signs },
                    { upsert: true, new: true }
                );
                console.log(`[Monthly] Imported horoscope for ${month}/${year}`);

            } else {
                console.warn(`Skipping unknown horoscope type: ${type}`);
            }
        }

        console.log('Import completed successfully!');
    } catch (err) {
        console.error('Import error:', err.message);
    } finally {
        mongoose.connection.close();
    }
};

const run = async () => {
    await connectDB();
    await importData();
};

run();
