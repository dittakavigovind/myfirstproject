const AstrologerRequest = require('../models/AstrologerRequest');
const User = require('../models/User');
const Astrologer = require('../models/Astrologer');

// Check Name Availability
exports.checkNameAvailability = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });

        // Case insensitive check
        const regex = new RegExp(`^${name}$`, 'i');

        // Check Active Astrologers
        const existingAstrologer = await Astrologer.findOne({ displayName: regex });
        if (existingAstrologer) {
            return res.json({ success: true, available: false, message: 'This name is already occupied.' });
        }

        // Check Pending Requests
        const existingRequest = await AstrologerRequest.findOne({ name: regex, status: 'pending' });
        if (existingRequest) {
            return res.json({ success: true, available: false, message: 'This name is currently under review.' });
        }

        res.json({ success: true, available: true });
    } catch (error) {
        console.error('Check Name Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Submit a new request
exports.submitRequest = async (req, res) => {
    try {
        console.log("Submit Request Body:", req.body); // DEBUG
        const { userId, name, email, phone, skills, experience, languages, bio, image } = req.body;

        // 1. Check if name is already taken (Server-side validation)
        const regex = new RegExp(`^${name}$`, 'i');
        const existingAstrologer = await Astrologer.findOne({ displayName: regex });
        if (existingAstrologer) {
            return res.status(400).json({ message: 'Display Name is already taken. Please choose another.' });
        }

        const duplicateRequest = await AstrologerRequest.findOne({ name: regex, status: 'pending' });
        if (duplicateRequest) {
            return res.status(400).json({ message: 'This name is already reserved in a pending request.' });
        }

        // 2. Check if user has a pending request
        const existing = await AstrologerRequest.findOne({ userId, status: 'pending' });
        if (existing) {
            return res.status(400).json({ message: 'You already have a pending request.' });
        }

        const newRequest = await AstrologerRequest.create({
            userId, name, email, phone, skills, experience, languages, bio, image
        });

        res.status(201).json({ success: true, message: 'Request submitted successfully', data: newRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Check if user has a pending request
exports.checkRequestStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const request = await AstrologerRequest.findOne({ userId, status: 'pending' });

        if (request) {
            return res.json({ success: true, hasPendingRequest: true, request });
        }

        res.json({ success: true, hasPendingRequest: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Get all requests
exports.getRequests = async (req, res) => {
    try {
        const requests = await AstrologerRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Approve Request
exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await AstrologerRequest.findById(id);

        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

        // 1. Update Request Status
        request.status = 'approved';
        await request.save();

        // 2. Update User Role
        const user = await User.findById(request.userId);
        if (user) {
            user.role = 'astrologer';
            if (request.image) {
                user.profileImage = request.image; // SYNC: Update user avatar to match approved astrologer image
            }
            await user.save();
        }

        // 3. Create Astrologer Profile
        // Check if profile already exists (maybe from previous deleted account?)
        // 3. Create Astrologer Profile
        // Check if profile already exists
        const existingProfile = await Astrologer.findOne({ userId: request.userId });
        if (!existingProfile) {
            // Generate Slug
            const baseSlug = request.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            let slug = baseSlug;
            let counter = 1;
            while (await Astrologer.findOne({ slug })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            await Astrologer.create({
                userId: request.userId,
                displayName: request.name,
                image: request.image,
                skills: request.skills,
                languages: request.languages,
                experienceYears: request.experience,
                bio: request.bio,
                charges: {
                    chatPerMinute: 20,
                    callPerMinute: 30,
                    videoPerMinute: 50
                },
                rating: 3.5,
                isOnline: false,
                slug: slug
            });
        }

        res.json({ success: true, message: 'Request Approved and User Promoted' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Reject Request
exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await AstrologerRequest.findById(id);

        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = 'rejected';
        await request.save();

        res.json({ success: true, message: 'Request Rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
