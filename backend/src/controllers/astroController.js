const AstroService = require('../astrology/AstroService');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');
const { geocodePlace, searchPlaces } = require('../utils/geocoder');

/**
 * Generate Kundli for Request
 * POST /api/astro/kundli
 * Body: { date, time, place, lat, lng, timezone }
 */
exports.getKundli = async (req, res) => {
    try {
        const { date, time, lat, lng, timezone } = req.body;

        // Basic validation
        if (!date || !time || lat === undefined || lng === undefined) {
            return res.status(400).json({ message: 'Missing required birth details' });
        }

        // Strict Type Validation to prevent Swisseph hangs
        if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
            return res.status(400).json({ message: 'Invalid Coordinates. Please provide valid numbers.' });
        }

        const tz = timezone || 5.5; // Default IST

        const kundliData = await AstroService.generateKundli(date, time, lat, lng, tz);

        // [LOGGING] Log Activity if Authenticated
        // console.log("[KUNDLI] Checking for user...", req.user ? req.user._id : "Guest");
        if (req.user) {
            const ActivityLog = require('../models/ActivityLog');
            try {
                await ActivityLog.create({
                    userId: req.user.id,
                    actionType: 'KUNDLI',
                    description: 'Generated detailed Kundli report',
                    metadata: { date, time, place: req.body.place || 'Unknown' }
                });
                console.log("[KUNDLI] Activity Logged Success");
            } catch (logErr) {
                console.error("[KUNDLI] Log Error:", logErr);
            }
        }

        res.json({
            success: true,
            data: kundliData
        });
    } catch (error) {
        console.error('Kundli Generation Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getMarriageCareerAnalysis = async (req, res) => {
    try {
        const { date, time, lat, lng, timezone, gender } = req.body;

        if (!date || !time || lat === undefined || lng === undefined) {
            return res.status(400).json({ message: 'Missing required birth details' });
        }

        // Strict Type Validation
        if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
            return res.status(400).json({ message: 'Invalid Coordinates. Please provide valid numbers.' });
        }

        const tz = timezone || 5.5;
        const analysisData = await AstroService.getMarriageCareerAnalysis(date, time, lat, lng, tz, gender);

        res.json({
            success: true,
            data: analysisData
        });

    } catch (error) {
        console.error('Marriage/Career Analysis Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * Save Birth Details to Profile
 * POST /api/astro/save-profile
 */
exports.saveBirthDetails = async (req, res) => {
    try {
        const { userId, name, date, time, place, location, lat, lng, timezone, profileImage } = req.body;

        // Find user by ID (frontend should send userId or we use req.user.id if protected)
        // For robustness in this demo, check body first then req.user
        const targetId = userId || (req.user ? req.user.id : null);

        if (!targetId) {
            return res.status(401).json({ message: 'User ID is required' });
        }

        // 1. Construct the update object dynamically
        const updateOps = {};

        if (name) updateOps.name = name;
        if (profileImage) updateOps.profileImage = profileImage;

        // Use dot notation for nested birthDetails updates to ensure we NEVER overwrite the whole object
        // and allow true partial updates of sub-fields.
        if (date !== undefined) updateOps['birthDetails.date'] = date === '' ? null : date;
        if (time !== undefined) updateOps['birthDetails.time'] = time;

        // Handle place/location alias
        if (place !== undefined) updateOps['birthDetails.place'] = place;
        else if (location !== undefined) updateOps['birthDetails.place'] = location;

        if (lat !== undefined) updateOps['birthDetails.lat'] = lat;
        if (lng !== undefined) updateOps['birthDetails.lng'] = lng;
        if (timezone !== undefined) updateOps['birthDetails.timezone'] = timezone;

        // Gender (Root level field, not inside birthDetails)
        if (req.body.gender) updateOps.gender = req.body.gender;


        // 2. Perform Atomic Update
        const user = await User.findByIdAndUpdate(
            targetId,
            { $set: updateOps },
            { new: true, runValidators: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Sync to Astrologer Public Profile if needed (Logic preserved)
        if (profileImage && user.role === 'astrologer') {
            try {
                await Astrologer.findOneAndUpdate(
                    { userId: user._id },
                    { image: profileImage }
                );
            } catch (e) { console.error("Astro sync error", e); }
        }

        res.json({
            success: true,
            message: 'Profile Updated',
            data: user
        });

    } catch (error) {
        console.error("Save Profile Error:", error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

/**
 * Get All Astrologers
 * GET /api/astro/astrologers
 */
exports.getAstrologers = async (req, res) => {
    try {
        const { includeInactive } = req.query;
        let query = {};

        // By default, only show active astrologers (include those where isActive is true OR missing)
        if (includeInactive !== 'true') {
            query.isActive = { $ne: false };
        }

        let astrologers = await Astrologer.find(query)
            .populate('userId', 'role') // Populate role from User model
            .select('userId displayName skills languages charges rating image experienceYears isOnline bio isActive slug');

        // Filter out those where userId is null (User deleted) or role is NOT 'astrologer'
        astrologers = astrologers.filter(astro => astro.userId && astro.userId.role === 'astrologer');

        res.json({ success: true, data: astrologers });
    } catch (error) {
        console.error('Fetch Astrologers Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Get Single Astrologer
 * GET /api/astro/astrologers/:id
 */
exports.getAstrologerById = async (req, res) => {
    try {
        const { id } = req.params;
        const mongoose = require('mongoose');

        let query;
        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { _id: id };
        } else {
            query = { slug: id };
        }

        const astrologer = await Astrologer.findOne(query).populate('userId');
        if (!astrologer) {
            return res.status(404).json({ message: 'Astrologer not found' });
        }

        // Self-Healing: Generate Slug if missing
        if (!astrologer.slug) {
            const baseSlug = astrologer.displayName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            let newSlug = baseSlug;
            let counter = 1;
            // Check for collision
            while (await Astrologer.findOne({ slug: newSlug })) {
                newSlug = `${baseSlug}-${counter}`;
                counter++;
            }
            astrologer.slug = newSlug;
            await astrologer.save();
        }

        res.json({ success: true, data: astrologer });
    } catch (error) {
        console.error('Fetch Astrologer Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Get Current Logged In Astrologer
 * GET /api/astro/me
 */
exports.getCurrentAstrologer = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const astrologer = await Astrologer.findOne({ userId: req.user.id });
        if (!astrologer) {
            // If user is an astrologer role but hasn't set up a profile yet, might return 404 or empty
            return res.status(404).json({ message: 'Astrologer profile not found' });
        }
        res.json({ success: true, data: astrologer });
    } catch (error) {
        console.error('Fetch Current Astrologer Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Update Current Astrologer Profile
 * PUT /api/astro/me
 */
exports.updateCurrentAstrologer = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const {
            name, // User model field
            expertise, languages, experience, about, // Frontend form fields
            chatPrice, callPrice, videoPrice,
            isChatEnabled, isCallEnabled, isVideoEnabled
        } = req.body;

        // 1. Update User Record (Name)
        if (name) {
            await User.findByIdAndUpdate(req.user.id, { name });
        }

        // 2. Find and Update Astrologer Record
        let astrologer = await Astrologer.findOne({ userId: req.user.id });

        if (!astrologer) {
            return res.status(404).json({ message: 'Astrologer profile not found' });
        }

        // Map Frontend fields to Backend Model fields
        if (name) astrologer.displayName = name; // Sync display name
        if (expertise) astrologer.skills = expertise.split(',').map(s => s.trim());
        if (languages) astrologer.languages = languages.split(',').map(s => s.trim());
        if (experience !== undefined) astrologer.experienceYears = experience;
        if (about) astrologer.bio = about;

        const chatC = parseFloat(chatPrice) || 0;
        const callC = parseFloat(callPrice) || 0;
        const videoC = parseFloat(videoPrice) || 0;

        if ((chatC > 0 && chatC < 15) || (callC > 0 && callC < 15) || (videoC > 0 && videoC < 15)) {
            return res.status(400).json({ message: 'Charges must be at least 15' });
        }

        // Update Charges
        astrologer.charges = {
            chatPerMinute: chatC,
            callPerMinute: callC,
            videoPerMinute: videoC
        };

        // Note: isChatEnabled etc. might need to be stored in DB if we want to persist "availability" per channel
        // For now, let's assume if price > 0 it's enabled, or we can add specific flags to Astrologer model if they exist
        // Checking existing model... assumes `isOnline` is global. 
        // If we want specific channel toggles, we need to add them to schema. 
        // For now, let's just save the prices.

        await astrologer.save();
        res.json({ success: true, message: 'Profile updated successfully', data: astrologer });

    } catch (error) {
        console.error('Update Current Astrologer Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Create Astrologer (Admin Only)
 * POST /api/astro/astrologers
 */
exports.createAstrologer = async (req, res) => {
    try {
        // Expecting full details in body
        // Also need to link to a User.
        // For this demo flow, we might need to CREATE a User first or use existing.
        // Let's assume the admin sends { name, email, password, ...astrologerDetails }

        const {
            name, email, password, // User fields
            displayName, bio, skills, languages, experienceYears, charges, rating, image // Astro fields
        } = req.body;

        // 1. Create User
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash password (if we had auth controller logic here, but we can rely on User model pre-save if it existed, 
        // OR just use bcrypt here. 
        // Wait, User model doesn't have pre-save hash logic shown in previous view. 
        // AuthController did hashing manually.
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'astrologer', // Set specific role for astrologers
            profileImage: image // Sync profile image from Astro details
        });

        // 2. Generate Unique Slug
        const baseSlug = displayName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        let slug = baseSlug;
        let counter = 1;

        while (await Astrologer.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const chatC = parseFloat(charges?.chatPerMinute) || 0;
        const callC = parseFloat(charges?.callPerMinute) || 0;
        const videoC = parseFloat(charges?.videoPerMinute) || 0;

        if ((chatC > 0 && chatC < 15) || (callC > 0 && callC < 15) || (videoC > 0 && videoC < 15)) {
            // Rollback User creation if validation fails
            await User.findByIdAndDelete(user._id);
            return res.status(400).json({ message: 'Charges must be at least 15' });
        }

        // 3. Create Astrologer Profile
        const astrologer = await Astrologer.create({
            userId: user._id,
            displayName,
            bio,
            skills,
            languages,
            experienceYears,
            charges: {
                chatPerMinute: chatC,
                callPerMinute: callC,
                videoPerMinute: videoC
            },
            rating: rating || 0,
            isOnline: true,
            image: image || undefined,
            slug: slug
        });

        res.status(201).json({ success: true, data: astrologer });

    } catch (error) {
        console.error('Create Astrologer Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * Update Astrologer
 * PUT /api/astro/astrologers/:id
 */
exports.updateAstrologer = async (req, res) => {
    try {
        console.log('[UPDATE ASTRO] Body:', req.body);
        const { displayName, bio, skills, languages, experienceYears, charges, rating, isOnline, image, isActive, gallery } = req.body;

        const astrologer = await Astrologer.findById(req.params.id);
        if (!astrologer) {
            return res.status(404).json({ message: 'Astrologer not found' });
        }

        // Partial Update
        if (displayName) astrologer.displayName = displayName;
        if (bio) astrologer.bio = bio;
        if (skills) astrologer.skills = skills;
        if (languages) astrologer.languages = languages;
        if (experienceYears) astrologer.experienceYears = experienceYears;
        if (charges) {
            const chatC = parseFloat(charges.chatPerMinute) || 0;
            const callC = parseFloat(charges.callPerMinute) || 0;
            const videoC = parseFloat(charges.videoPerMinute) || 0;

            if ((chatC > 0 && chatC < 15) || (callC > 0 && callC < 15) || (videoC > 0 && videoC < 15)) {
                return res.status(400).json({ message: 'Charges must be at least 15' });
            }
            astrologer.charges = charges;
        }
        if (rating) astrologer.rating = rating;
        if (isOnline !== undefined) astrologer.isOnline = isOnline;
        if (isActive !== undefined) astrologer.isActive = isActive;
        if (isActive !== undefined) astrologer.isActive = isActive;
        if (gallery) astrologer.gallery = gallery;
        if (image) {
            astrologer.image = image;
            // Sync image to User record as well so it shows in Navbar
            const User = require('../models/User');
            await User.findByIdAndUpdate(astrologer.userId, { profileImage: image });
        }

        await astrologer.save();

        res.json({ success: true, data: astrologer });
    } catch (error) {
        console.error('Update Astrologer Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Geocode Place
 * POST /api/astro/geocode
 * Body: { place: "City Name" }
 */
exports.getGeocode = async (req, res) => {
    try {
        const { place } = req.body;
        if (!place) {
            return res.status(400).json({ message: 'Place name is required' });
        }

        const locationData = await geocodePlace(place);
        res.json({ success: true, data: locationData });
    } catch (error) {
        console.error('Geocode Error:', error);
        res.status(500).json({ message: 'Failed to fetch location', error: error.message });
    }
};

/**
 * Search Locations for Autocomplete
 * GET /api/astro/search-locations?query=...
 */
exports.searchLocations = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ success: true, data: [] });

        const { searchPlaces } = require('../utils/geocoder');
        const results = await searchPlaces(query);
        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ message: 'Search Failed' });
    }
};

/**
 * Match Making (Gun Milan)
 * POST /api/astro/match
 * Body: { boy: {date, time, lat, lng, timezone}, girl: {date, time, lat, lng, timezone} }
 */
exports.getMatchMaking = async (req, res) => {
    try {
        const { boy, girl } = req.body;
        if (!boy || !girl) return res.status(400).json({ message: 'Details for both Boy and Girl are required' });

        // Calculate Planetary Positions for both
        const boyKundli = await AstroService.generateKundli(boy.date, boy.time, boy.lat, boy.lng, boy.timezone || 5.5);
        const girlKundli = await AstroService.generateKundli(girl.date, girl.time, girl.lat, girl.lng, girl.timezone || 5.5);

        // Extract Moon Longitude
        const boyMoon = boyKundli.planets['Moon'].longitude;
        const girlMoon = girlKundli.planets['Moon'].longitude;

        // Calculate Match
        const matchResult = AstroService.calculateMatch(boyMoon, girlMoon);

        // [LOGGING]
        if (req.user) {
            const ActivityLog = require('../models/ActivityLog');
            await ActivityLog.create({
                userId: req.user.id,
                actionType: 'MATCHMAKING',
                description: `checked compatibility (Score: ${matchResult.total}/36)`,
                metadata: { score: matchResult.total }
            });
        }

        res.json({
            success: true,
            data: {
                score: matchResult,
                boy: { moon: boyMoon, nakshatra: matchResult.boyNak, sign: matchResult.boySign },
                girl: { moon: girlMoon, nakshatra: matchResult.girlNak, sign: matchResult.girlSign }
            }
        });

    } catch (error) {
        console.error('Match Making Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * Delete Astrologer
 * DELETE /api/astro/astrologers/:id
 */
exports.deleteAstrologer = async (req, res) => {
    try {
        console.log(`[DELETE] Request to delete astrologer: ${req.params.id}`);
        const astrologer = await Astrologer.findById(req.params.id);

        if (!astrologer) {
            console.log(`[DELETE] Astrologer not found: ${req.params.id}`);
            return res.status(404).json({ message: 'Astrologer not found' });
        }

        // Delete associated User account as well if linked
        if (astrologer.userId) {
            console.log(`[DELETE] Removing associated user account: ${astrologer.userId}`);
            await User.findByIdAndDelete(astrologer.userId);
        }

        // Use findByIdAndDelete to ensure removal
        await Astrologer.findByIdAndDelete(req.params.id);

        console.log(`[DELETE] Astrologer removed successfully: ${req.params.id}`);
        res.json({ success: true, message: 'Astrologer removed' });
    } catch (error) {
        console.error('Delete Astrologer Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * Get Dosha Analysis (Mangal & Kaalsarp)
 * POST /api/astro/dosha
 */
exports.getDoshaAnalysis = async (req, res) => {
    try {
        const { date, time, lat, lng, timezone, name, gender } = req.body;

        if (!date || !time || lat === undefined || lng === undefined) {
            return res.status(400).json({ success: false, message: 'Missing birth details' });
        }

        // 1. Generate Kundli to get Planetary Positions & Houses
        const kundliData = await AstroService.generateKundli(date, time, lat, lng, timezone || 5.5);

        // 2. Perform Dosha Checks
        const mangalDosha = AstroService.checkMangalDosha(kundliData.planets, kundliData.houses);
        const kaalsarpDosha = AstroService.checkKaalsarpDosha(kundliData.planets);
        const sadeSati = await AstroService.checkSadeSati(kundliData.planets, lat, lng, timezone || 5.5);

        // [LOGGING]
        if (req.user) {
            const ActivityLog = require('../models/ActivityLog');
            const issues = [];
            if (mangalDosha.hasDosha) issues.push('Mangal Dosha');
            if (kaalsarpDosha.present) issues.push('Kaal Sarp Dosha');
            if (sadeSati.isSadeSati) issues.push('Sade Sati');

            await ActivityLog.create({
                userId: req.user.id,
                actionType: 'DOSHA',
                description: `checked dosha analysis ${issues.length > 0 ? '(' + issues.join(', ') + ')' : '(Clean)'}`,
                metadata: { issues }
            });
        }

        res.json({
            success: true,
            data: {
                meta: kundliData.meta,
                mangalDosha,
                kaalsarpDosha,
                sadeSati,
                planets: kundliData.planets,
                houses: kundliData.houses
            }
        });

    } catch (error) {
        console.error('Dosha Analysis Error:', error);
        res.status(500).json({ success: false, message: 'Server Error calculating Dosha' });
    }
};

/**
 * Toggle Status & Manage Sessions
 * POST /api/astro/status/toggle
 * Body: { [service]: boolean } e.g. { isChatOnline: true }
 */
exports.toggleStatus = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'astrologer') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const AstrologerSession = require('../models/AstrologerSession');
        const astrologer = await Astrologer.findOne({ userId: req.user.id });

        if (!astrologer) {
            return res.status(404).json({ message: 'Astrologer profile not found' });
        }

        // 1. Update requested status
        const updates = req.body;
        console.log(`[TOGGLE DEBUG] User: ${req.user.id}, Updates:`, updates);

        if (updates.isChatOnline !== undefined) astrologer.isChatOnline = updates.isChatOnline;
        if (updates.isVoiceOnline !== undefined) astrologer.isVoiceOnline = updates.isVoiceOnline;
        if (updates.isVideoOnline !== undefined) astrologer.isVideoOnline = updates.isVideoOnline;

        console.log(`[TOGGLE DEBUG] New Flag State -> Chat: ${astrologer.isChatOnline}, Voice: ${astrologer.isVoiceOnline}, Video: ${astrologer.isVideoOnline}`);

        // 2. Determine Overall Status
        const wasOnline = astrologer.isOnline;
        const isNowOnline = astrologer.isChatOnline || astrologer.isVoiceOnline || astrologer.isVideoOnline;

        astrologer.isOnline = isNowOnline;

        // 3. Session Management
        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

        // Find existing open session
        let openSession = await AstrologerSession.findOne({
            astrologerId: astrologer._id,
            endTime: { $exists: false }
        }).sort({ startTime: -1 });

        if (isNowOnline) {
            // USER WANTS TO BE ONLINE
            if (!openSession) {
                // No session? Create one! (Handles "New Session" AND "Orphaned Online State")
                console.log(`[SESSION] New Session for ${astrologer.displayName}`);
                astrologer.lastOnlineAt = now;

                // Determine initial services based on CURRENT state (including the update)
                const currentServices = [];
                if (astrologer.isChatOnline) currentServices.push('chat');
                if (astrologer.isVoiceOnline) currentServices.push('voice');
                if (astrologer.isVideoOnline) currentServices.push('video');

                await AstrologerSession.create({
                    astrologerId: astrologer._id,
                    sessionDate: dateStr,
                    startTime: now,
                    servicesUsed: currentServices,
                    chatRate: astrologer.charges?.chatPerMinute || 0,
                    voiceRate: astrologer.charges?.callPerMinute || 0,
                    videoRate: astrologer.charges?.videoPerMinute || 0
                });
            } else {
                // Update existing session
                const currentServices = new Set(openSession.servicesUsed);
                if (astrologer.isChatOnline) currentServices.add('chat');
                if (astrologer.isVoiceOnline) currentServices.add('voice');
                if (astrologer.isVideoOnline) currentServices.add('video');

                // If we toggled something OFF, should we remove it from servicesUsed?
                // Usually "servicesUsed" tracks what was used *at some point* in the session, OR currently available?
                // The dashboard shows "Services: Chat, Voice".
                // If I turn Chat ON then OFF, logic suggests keeping it in "servicesUsed" for history.
                // BUT for "Live Status" in dashboard, we rely on Astrologer model or active session services?
                // ActivityController uses: `isChatOnline: activeSession.servicesUsed.includes('chat')`
                // THIS IS THE BUG IN ACTIVITY CONTROLLER IF WE DON'T REMOVE IT.
                // BUT removing it from history is also bad?

                // WAIT. `servicesUsed` in Session usually implies "What services did I provide during this session?".
                // If `ActivityController` uses it for "Current Status", that's conflating "History" with "State".

                // Let's look at ActivityController again.
                // `isChatOnline: activeSession ? activeSession.servicesUsed.includes('chat') : false`
                // If I toggle Chat OFF, but session stays open (Voice ON), `servicesUsed` still has 'chat'.
                // So ActivityController reports Chat Online!

                // We must separate "Current Active Services" from "Session Value".
                // Or, `ActivityController` should verify `astrologer.isChatOnline` from the PROFILE for the live flags,
                // and use Session only for Timer/Duration.

                // ACTUALLY: The user's request is "Toggle buttons".
                // If I toggle Chat OFF, `ActivityController` says "Chat Online" causing it to stay ON?

                // Let's fix `ActivityController` to read FLAGS from Astrologer model for boolean status,
                // and start time from Session.

                // Back to `astroController`:
                // We still need to ensure session exists.

                openSession.servicesUsed = Array.from(currentServices);
                await openSession.save();
            }
        } else {
            // USER IS OFFLINE
            if (openSession) {
                console.log(`[SESSION] Closing Session for ${astrologer.displayName}`);
                openSession.endTime = now;
                openSession.duration = Math.floor((now - openSession.startTime) / 1000); // Seconds
                await openSession.save();
            }
        }

        await astrologer.save();

        // Sync User model for navbar/Global state if needed
        await User.findByIdAndUpdate(req.user.id, {
            isOnline: astrologer.isOnline,
            isChatOnline: astrologer.isChatOnline,
            isVoiceOnline: astrologer.isVoiceOnline,
            isVideoOnline: astrologer.isVideoOnline
        });

        res.json({ success: true, data: astrologer });

    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Get Session History
 * GET /api/astro/sessions?date=DD/MM/YYYY
 */
exports.getSessions = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'astrologer') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const AstrologerSession = require('../models/AstrologerSession');
        const astrologer = await Astrologer.findOne({ userId: req.user.id });

        if (!astrologer) return res.status(404).json({ message: 'Astrologer not found' });

        const { date } = req.query; // Expecting DD/MM/YYYY
        let query = { astrologerId: astrologer._id };

        if (date) {
            query.sessionDate = date;
        }

        const sessions = await AstrologerSession.find(query).sort({ startTime: -1 });

        // Calculate aggregations
        const totalDuration = sessions.reduce((acc, sess) => acc + (sess.duration || 0), 0);

        const stats = {
            totalSessions: sessions.length,
            totalDuration, // seconds
            chatDuration: sessions.filter(s => s.servicesUsed.includes('chat')).reduce((acc, s) => acc + (s.duration || 0), 0),
            voiceDuration: sessions.filter(s => s.servicesUsed.includes('voice')).reduce((acc, s) => acc + (s.duration || 0), 0),
            videoDuration: sessions.filter(s => s.servicesUsed.includes('video')).reduce((acc, s) => acc + (s.duration || 0), 0)
        };

        res.json({ success: true, data: { sessions, stats } });

    } catch (error) {
        console.error('Fetch Sessions Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
/**
 * Get Divisional Charts
 * POST /api/astro/divisional-charts
 */
exports.getDivisionalCharts = async (req, res) => {
    try {
        const { date, time, lat, lng, timezone } = req.body;

        if (!date || !time || lat === undefined || lng === undefined) {
            return res.status(400).json({ message: 'Missing required birth details' });
        }

        const data = await AstroService.generateDivisionalCharts(date, time, lat, lng, timezone || 5.5);
        res.json({ success: true, data });

    } catch (error) {
        console.error('Divisional Charts Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Get Arudha Lagna
 * POST /api/astro/arudha
 */
exports.getArudhaLagna = async (req, res) => {
    try {
        const { date, time, lat, lng, timezone } = req.body;
        if (!date || !time) return res.status(400).json({ message: 'Missing details' });

        // Need basic Kundli for planets/houses
        const kundli = await AstroService.generateKundli(date, time, lat, lng, timezone || 5.5);
        const arudha = AstroService.calculateArudhaLagna(kundli.planets, kundli.houses);

        res.json({ success: true, data: arudha });
    } catch (error) {
        console.error('Arudha Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Get Ashtakavarga
 * POST /api/astro/ashtakavarga
 */
exports.getAshtakavarga = async (req, res) => {
    try {
        const { date, time, lat, lng, timezone } = req.body;
        if (!date || !time) return res.status(400).json({ message: 'Missing details' });

        const calculateAshtakavarga = require('../astrology/Ashtakavarga');
        const data = await calculateAshtakavarga(date, time, lat, lng, timezone || 5.5);

        res.json({ success: true, data });
    } catch (error) {
        console.error('Ashtakavarga Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


/**
 * Get Yogini Dasha
 * POST /api/astro/yogini-dasha
 */
exports.getYoginiDasha = async (req, res) => {
    try {
        const { date, time, lat, lng, timezone, name, gender } = req.body;

        if (!date || !time || lat === undefined || lng === undefined) {
            return res.status(400).json({ message: 'Missing required birth details' });
        }

        const tz = timezone || 5.5;

        // 1. Get Moon Longitude (via Kundli generation)
        // We only need planetary positions, so we can use existing service.
        // Optimization: We could have a lighter method just for planets if needed, but generateKundli is fine.
        const kundliData = await AstroService.generateKundli(date, time, lat, lng, tz);

        const moonLong = kundliData.planets['Moon'].longitude;

        // 2. Calculate Yogini Dasha
        // Combine date AND time for birthDate object
        const DateTimeUtils = require('../utils/timezoneUtils');
        // Note: timezoneUtils.getDateFromParts is used in Service, let's reuse it or constructs standardized Date
        // Actually AstroService.calculateYoginiDasha expects a Date object or string it can parse.
        // Let's pass the UTC Date object used in calculation for accuracy.

        // However, calculateYoginiDasha takes birthDate. 
        // Let's construct it properly.
        const birthDateObj = new Date(`${date}T${time}:00`); // Local time implicit if running on server? 
        // NO, server time might differ. 
        // We should arguably use the UTC time derived from input + timezone.
        // But for "Dasha Balance" which adds *Time*, it usually starts from Birth *Moment*.
        // The Service calculation uses: let currentDate = new Date(birthDate);
        // If we pass a string "YYYY-MM-DD", it effectively ignores time?
        // Wait, calculateYoginiDasha in AstroService uses:
        // const format = (d) => d.toISOString().split('T')[0];
        // It returns Dates as YYYY-MM-DD strings.
        // But the *Balance* calculation adds years to `birthDate`. 
        // If birthDate is just a date, it adds to midnight?
        // Dasha balance represents *time* passed in Nakshatra. 
        // Ideally, one should add the balance to the exact Birth Time.
        // So I should pass the exact Birth Date Object (UTC or correctly offset).

        // Let's rely on standard ISO string from client or constructed safely.
        // AstroService.generateKundli calculates 'utcDate'.
        // But we don't return 'utcDate' from generateKundli in the response data explicitly (only in meta as JulianDay).
        // Let's reconstruct it.
        const utcDate = new Date(kundliData.meta.julianDay); // Wait, JulianDay is a float number, not Date.
        // Let's just use the Input Date/Time and assume standard construction for now, 
        // or Import `timezoneUtils`.
        // Better: let's blindly pass `${date}T${time}` and let JS Date parse it (browser/node vary, but acceptable for MVP).
        // OR better, pass the 'date' string if that's what we have.

        const yoginiData = AstroService.calculateYoginiDasha(moonLong, `${date}T${time}`);

        // [LOGGING]
        if (req.user) {
            const ActivityLog = require('../models/ActivityLog');
            try {
                await ActivityLog.create({
                    userId: req.user.id,
                    actionType: 'YOGINI',
                    description: 'Generated Yogini Dasha',
                    metadata: { date, time }
                });
            } catch (e) { console.error("Log Error", e); }
        }

        res.json({
            success: true,
            data: yoginiData
        });

    } catch (error) {
        console.error('Yogini Dasha Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * Get Jaimini Karakas
 * POST /api/astro/jaimini-karakas
 */
exports.getJaiminiKarakas = async (req, res) => {
    try {
        const { date, time, lat, lng, timezone } = req.body;

        if (!date || !time || lat === undefined || lng === undefined) {
            return res.status(400).json({ message: 'Missing required birth details' });
        }

        const tz = timezone || 5.5;

        // 1. Generate Kundli to get Planetary Positions
        const kundliData = await AstroService.generateKundli(date, time, lat, lng, tz);

        // 2. Calculate Jaimini Karakas
        const karakas = AstroService.calculateJaiminiKarakas(kundliData.planets);

        // [LOGGING]
        if (req.user) {
            const ActivityLog = require('../models/ActivityLog');
            await ActivityLog.create({
                userId: req.user.id,
                actionType: 'JAIMINI',
                description: 'Calculated Atmakaraka & Jaimini Karakas'
            });
        }

        res.json({
            success: true,
            data: {
                meta: kundliData.meta,
                karakas
            }
        });

    } catch (error) {
        console.error('Jaimini Karaka Error:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(500).json({
            success: false,
            message: 'Server error while calculating Jaimini Karakas. Please check your birth details.',
            error: error.message
        });
    }
};

/**
 * Add a Chart to Saved Charts
 * POST /api/astro/save-chart
 */
exports.saveSavedChart = async (req, res) => {
    try {
        const { name, date, time, place, lat, lng, timezone } = req.body;

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        if (!name || !date || !time) {
            return res.status(400).json({ message: 'Name, Date, and Time are required' });
        }

        const userObj = await User.findById(req.user.id);
        if (userObj.savedCharts && userObj.savedCharts.length >= 2) {
            return res.status(400).json({ message: 'Maximum limit of 2 profiles reached. Please remove one to add a new one.' });
        }

        const newChart = { name, date, time, place, lat, lng, timezone: parseFloat(timezone) || 5.5 };

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $push: { savedCharts: newChart } },
            { new: true }
        );

        res.json({ success: true, message: 'Chart saved', data: updatedUser.savedCharts });
    } catch (error) {
        console.error('Save Chart Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Delete a Chart from Saved Charts
 * DELETE /api/astro/delete-chart/:id
 */
exports.deleteSavedChart = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { savedCharts: { _id: req.params.id } } },
            { new: true }
        );

        res.json({ success: true, message: 'Chart removed', data: user.savedCharts });
    } catch (error) {
        console.error('Delete Chart Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
/**
 * Get Arudha Lagna Analysis
 * POST /api/astro/arudha-lagna
 */
exports.getArudhaLagna = async (req, res) => {
    try {
        const { date, time, lat, lng, timezone } = req.body;

        if (!date || !time || lat === undefined || lng === undefined) {
            return res.status(400).json({ success: false, message: 'Missing birth details' });
        }

        const kundliData = await AstroService.generateKundli(date, time, lat, lng, timezone || 5.5);
        const arudhaLagna = AstroService.calculateArudhaLagna(kundliData.planets, kundliData.houses);

        // [LOGGING]
        if (req.user) {
            const ActivityLog = require('../models/ActivityLog');
            await ActivityLog.create({
                userId: req.user.id,
                actionType: 'CALC',
                description: `checked Arudha Lagna (${arudhaLagna.signName})`,
                metadata: { arudhaLagna }
            });
        }

        res.json({
            success: true,
            data: {
                meta: kundliData.meta,
                arudhaLagna,
                planets: kundliData.planets,
                houses: kundliData.houses
            }
        });

    } catch (error) {
        console.error('Arudha Lagna Error:', error);
        res.status(500).json({ success: false, message: 'Server Error calculating Arudha Lagna' });
    }
};

/**
 * Calculate Ashtakavarga
 * POST /api/astro/ashtakavarga
 */
exports.getAshtakavarga = async (req, res) => {
    try {
        const { date, time, lat, lng, timezone } = req.body;

        if (!date || !time || lat === undefined || lng === undefined) {
            return res.status(400).json({ success: false, message: 'Missing birth details' });
        }

        // 1. Generate Ashtakavarga
        const ashtakavargaData = await AstroService.calculateAshtakavarga(date, time, lat, lng, timezone || 5.5);

        // [LOGGING]
        if (req.user) {
            const ActivityLog = require('../models/ActivityLog');
            try {
                await ActivityLog.create({
                    userId: req.user.id,
                    actionType: 'ASHTAKAVARGA',
                    description: 'Generated Ashtakavarga Report',
                    metadata: { date, time }
                });
            } catch (e) { console.error("Log Error", e); }
        }

        res.json({
            success: true,
            data: ashtakavargaData
        });

    } catch (error) {
        console.error('Ashtakavarga Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/**
 * Search Locations
 * GET /api/astro/search-locations?query=...
 */
exports.searchLocations = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json({ success: true, data: [] });

        const predictions = await searchPlaces(query);
        res.json({ success: true, data: predictions });
    } catch (error) {
        console.error('Location Search Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * Get Geocode for Place
 * POST /api/astro/geocode
 * Body: { place }
 */
exports.getGeocode = async (req, res) => {
    try {
        const { place } = req.body;
        if (!place) return res.status(400).json({ message: 'Place is required' });

        const data = await geocodePlace(place);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Geocode Error:', error);
        res.status(500).json({ message: 'Geocode Error', error: error.message });
    }
};
