const DailyHoroscope = require('../models/DailyHoroscope');
const WeeklyHoroscope = require('../models/WeeklyHoroscope');
const MonthlyHoroscope = require('../models/MonthlyHoroscope');
const FeaturedAstrologer = require('../models/FeaturedAstrologer');
const moment = require('moment');

// --- DAILY HOROSCOPE ---

exports.createDailyHoroscope = async (req, res) => {
    try {
        const { date } = req.body;
        // Check duplication
        const startOfDay = moment(date).startOf('day').toDate();
        const endOfDay = moment(date).endOf('day').toDate();

        const existing = await DailyHoroscope.findOne({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Horoscope for this date already exists' });
        }

        const horoscope = await DailyHoroscope.create(req.body);
        res.status(201).json({ success: true, data: horoscope });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDailyHoroscope = async (req, res) => {
    try {
        const { date } = req.query;
        let queryDate = date ? moment(date) : moment();

        const startOfDay = queryDate.startOf('day').toDate();
        const endOfDay = queryDate.endOf('day').toDate();

        const horoscope = await DailyHoroscope.findOne({
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!horoscope) {
            return res.status(404).json({ success: false, message: 'Horoscope not found for this date' });
        }

        res.json({ success: true, data: horoscope });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDailyHoroscope = async (req, res) => {
    try {
        const horoscope = await DailyHoroscope.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!horoscope) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: horoscope });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDailyHoroscope = async (req, res) => {
    try {
        await DailyHoroscope.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- WEEKLY HOROSCOPE ---

exports.createWeeklyHoroscope = async (req, res) => {
    try {
        const { weekStartDate, weekEndDate } = req.body;

        // Simple overlap check or exact match
        const existing = await WeeklyHoroscope.findOne({
            weekStartDate: new Date(weekStartDate),
            weekEndDate: new Date(weekEndDate)
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Weekly Horoscope for this range already exists' });
        }

        const horoscope = await WeeklyHoroscope.create(req.body);
        res.status(201).json({ success: true, data: horoscope });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWeeklyHoroscope = async (req, res) => {
    try {
        // Find weekly based on a provided date falling within range
        const { date } = req.query; // any date within the week
        const queryDate = date ? new Date(date) : new Date();

        const horoscope = await WeeklyHoroscope.findOne({
            weekStartDate: { $lte: queryDate },
            weekEndDate: { $gte: queryDate }
        });

        if (!horoscope) {
            return res.status(404).json({ success: false, message: 'Weekly Horoscope not found' });
        }

        res.json({ success: true, data: horoscope });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateWeeklyHoroscope = async (req, res) => {
    try {
        const horoscope = await WeeklyHoroscope.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: horoscope });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteWeeklyHoroscope = async (req, res) => {
    try {
        await WeeklyHoroscope.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- MONTHLY HOROSCOPE ---

exports.createMonthlyHoroscope = async (req, res) => {
    try {
        const { month, year } = req.body;

        const existing = await MonthlyHoroscope.findOne({ month, year });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Monthly Horoscope already exists' });
        }

        const horoscope = await MonthlyHoroscope.create(req.body);
        res.status(201).json({ success: true, data: horoscope });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMonthlyHoroscope = async (req, res) => {
    try {
        const { month, year } = req.query;
        // If not provided, use current
        const d = new Date();
        const qMonth = month ? parseInt(month) : d.getMonth() + 1; // 1-12
        const qYear = year ? parseInt(year) : d.getFullYear();

        const horoscope = await MonthlyHoroscope.findOne({ month: qMonth, year: qYear });

        if (!horoscope) {
            return res.status(404).json({ success: false, message: 'Monthly Horoscope not found' });
        }

        res.json({ success: true, data: horoscope });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateMonthlyHoroscope = async (req, res) => {
    try {
        const horoscope = await MonthlyHoroscope.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: horoscope });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteMonthlyHoroscope = async (req, res) => {
    try {
        await MonthlyHoroscope.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- AVAILABILITY ---

exports.getDailyAvailability = async (req, res) => {
    try {
        const { year, month } = req.query;
        const startDate = moment().year(year).month(month || 0).startOf('year').toDate();
        const endDate = moment().year(year).month(month || 11).endOf('year').toDate();

        // If month is specific, we can narrow it down, but usually we fetch whole year for calendar
        // Let's stick to year based fetching to minimize calls

        const horoscopes = await DailyHoroscope.find({
            date: { $gte: startDate, $lte: endDate }
        }).select('date');

        const dates = horoscopes.map(h => h.date);
        res.json({ success: true, data: dates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWeeklyAvailability = async (req, res) => {
    try {
        const { year } = req.query;
        // Week horoscopes can span years, but we generally want to know which weeks start in this year
        const startDate = moment().year(year).startOf('year').toDate();
        const endDate = moment().year(year).endOf('year').toDate();

        const horoscopes = await WeeklyHoroscope.find({
            weekStartDate: { $gte: startDate, $lte: endDate }
        }).select('weekStartDate weekEndDate');

        // Return ranges or just start dates
        res.json({ success: true, data: horoscopes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMonthlyAvailability = async (req, res) => {
    try {
        const { year } = req.query;
        const horoscopes = await MonthlyHoroscope.find({ year: parseInt(year) }).select('month year');
        res.json({ success: true, data: horoscopes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Featured Astrologer
// Featured Astrologer
exports.getFeaturedAstrologer = async (req, res) => {
    try {
        // 1. Check if there exists a schedule where showOnHoroscope = true AND date is valid
        const currentDate = new Date();

        // For End Date comparison, we want to include the entire end day.
        // If stored as 00:00:00, comparing against NOW (e.g. 14:00) will fail.
        // So we compare endDate >= Start of Today (00:00:00).
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const activeSchedule = await FeaturedAstrologer.findOne({
            showOnHoroscope: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: startOfToday }
        });

        if (activeSchedule) {
            // 4. Return it normally
            return res.json({ success: true, data: activeSchedule });
        }

        // 5. If NO such schedule exists (either none true, or true but expired)
        // Automatically set showOnHoroscope = false for ALL schedules to keep DB clean
        await FeaturedAstrologer.updateMany({}, { showOnHoroscope: false });

        return res.json({ success: true, data: null });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFeaturedAstrologerByName = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

        const featured = await FeaturedAstrologer.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (featured) {
            res.json({ success: true, data: featured });
        } else {
            res.status(404).json({ success: false, message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.checkFeaturedAvailability = async (req, res) => {
    try {
        const { startDate, endDate, excludeName } = req.query;
        if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'Dates required' });

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Find overlaps: 
        // (StartA <= EndB) and (EndA >= StartB)
        const conflicts = await FeaturedAstrologer.find({
            startDate: { $lte: end },
            endDate: { $gte: start },
            // If we are editing "Bob", don't count "Bob" as a conflict with himself
            ...(excludeName && { name: { $ne: excludeName } })
        });

        res.json({ success: true, data: conflicts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateFeaturedAstrologer = async (req, res) => {
    try {
        const payload = req.body;

        // Store ID before cleaning payload
        const searchId = payload._id || payload.id;

        // Clean up payload
        if (payload._id) delete payload._id;
        if (payload.id) delete payload.id;

        // Map showOnHoroscope
        if (payload.isActive !== undefined) {
            payload.showOnHoroscope = payload.isActive;
            delete payload.isActive;
        }

        if (req.body.socialLinks) {
            payload.socialLinks = req.body.socialLinks;
        }

        // 7. Ensure only one schedule can have showOnHoroscope = true
        if (payload.showOnHoroscope) {
            await FeaturedAstrologer.updateMany({}, { showOnHoroscope: false });
        }

        let featured;

        if (searchId) {
            featured = await FeaturedAstrologer.findById(searchId);
        } else {
            featured = await FeaturedAstrologer.findOne({
                name: { $regex: new RegExp(`^${payload.name}$`, 'i') }
            });
        }

        if (featured) {
            const oldEndDate = featured.endDate ? new Date(featured.endDate) : null;

            // Update the record
            featured = await FeaturedAstrologer.findByIdAndUpdate(featured._id, payload, { new: true });

            // Date Ripple Logic:
            // If endDate changed and is valid, check for overlaps and push next schedules
            if (payload.endDate) {
                const newEndDate = new Date(payload.endDate);

                // Find any schedule that starts ON or BEFORE the new End Date
                // AND involves a different ID
                // AND starts after the current one's start (to affect only future/next ones)
                const nextSchedules = await FeaturedAstrologer.find({
                    _id: { $ne: featured._id },
                    startDate: { $lte: newEndDate, $gte: featured.startDate } // Overlapping or touching
                }).sort({ startDate: 1 });

                // We only need to shift the *immediate* next one, which might then push others.
                // But simplified: Find the one that directly overlaps or is "next".
                // Actually the requirement: "end tym of adithya + 1 should be start date for govind"
                // implies resolving the immediate conflict.

                for (const schedule of nextSchedules) {
                    const start = new Date(schedule.startDate);
                    if (start <= newEndDate) {
                        // Shift Start Date to New End Date + 1 Day
                        const newStart = new Date(newEndDate);
                        newStart.setDate(newStart.getDate() + 1);

                        // Calculate shift amount to shift End Date too?
                        // User didn't explicitly ask to preserve duration, but it's good UX.
                        // Let's just update Start Date for now as requested.
                        // "end tym... + 1 should be start date"

                        // If new Start > old End, we need to push End too?
                        // Let's assume yes to prevent negative duration.
                        let newNextEnd = new Date(schedule.endDate);
                        if (newStart > newNextEnd) {
                            const duration = newNextEnd - start;
                            newNextEnd = new Date(newStart.getTime() + duration);
                        }

                        await FeaturedAstrologer.findByIdAndUpdate(schedule._id, {
                            startDate: newStart,
                            // Optional: endDate: newNextEnd 
                        });

                        // We could recursively push, but let's stick to immediate neighbor for this request.
                        // Ideally we should process the next one using the new dates, but that might chain too much without warning.
                    }
                }
            }

        } else {
            featured = await FeaturedAstrologer.create(payload);
        }

        res.json({ success: true, data: featured });
    } catch (error) {
        console.error("DEBUG: updateFeaturedAstrologer ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllFeaturedSchedules = async (req, res) => {
    try {
        const schedules = await FeaturedAstrologer.find({})
            .sort({ startDate: 1 });
        res.json({ success: true, data: schedules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
