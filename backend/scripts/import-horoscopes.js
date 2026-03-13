const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require('moment-timezone');

// Set default timezone to IST for all calculations
moment.tz.setDefault('Asia/Kolkata');

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
                
                // Use IST Noon (12:00) for maximum compatibility across all server timezones
                // 12:00 IST is 06:30 UTC, which is safely inside the same calendar day on both UTC and IST servers.
                const istNoon = moment(date).hour(12).startOf('hour').toDate();
                
                // Fuzzy match (+/- 12h) to find and replace any previous wrong-timezone records
                const startWindow = moment(istNoon).subtract(12, 'hours').toDate();
                const endWindow = moment(istNoon).add(12, 'hours').toDate();

                await DailyHoroscope.findOneAndUpdate(
                    { date: { $gte: startWindow, $lte: endWindow } },
                    { date: istNoon, title, signs },
                    { upsert: true, new: true }
                );
                console.log(`[Daily] Imported horoscope for ${moment(istNoon).format('YYYY-MM-DD')} (Noon IST)`);

            } else if (type === 'weekly') {
                const { weekStartDate, weekEndDate } = entry;
                if (!weekStartDate || !weekEndDate) {
                    console.warn('Skipping weekly entry: missing start or end date');
                    continue;
                }

                // Use IST Noon for consistency
                const start = moment(weekStartDate).hour(12).startOf('hour').toDate();
                const end = moment(weekEndDate).hour(12).startOf('hour').toDate();

                // Fuzzy match for existing weekly ranges (+/- 12h)
                const startWindowLow = moment(start).subtract(12, 'hours').toDate();
                const startWindowHigh = moment(start).add(12, 'hours').toDate();

                await WeeklyHoroscope.findOneAndUpdate(
                    { 
                        weekStartDate: { $gte: startWindowLow, $lte: startWindowHigh }
                    },
                    { weekStartDate: start, weekEndDate: end, title, signs },
                    { upsert: true, new: true }
                );
                console.log(`[Weekly] Imported horoscope for ${moment(start).format('YYYY-MM-DD')} to ${moment(end).format('YYYY-MM-DD')} (Noon IST)`);

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
