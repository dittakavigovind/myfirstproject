const Temple = require('../models/Temple');
const PoojaBooking = require('../models/PoojaBooking');
const seoController = require('./seoController');
const Coupon = require('../models/Coupon');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const Counter = require('../models/Counter');
const moment = require('moment-timezone');
const { triggerDeployment } = require('../services/deploymentService');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Get all active temples
// @route   GET /api/pooja/temples
// @access  Public
exports.getTemples = async (req, res) => {
    try {
        const temples = await Temple.find({ isActive: true });
        res.status(200).json({ success: true, count: temples.length, data: temples });
    } catch (error) {
        console.error('Get Temples Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single temple by slug
// @route   GET /api/pooja/temples/:slug
// @access  Public
exports.getTempleBySlug = async (req, res) => {
    try {
        const temple = await Temple.findOne({ slug: req.params.slug, isActive: true });
        if (!temple) {
            return res.status(404).json({ success: false, message: 'Temple not found' });
        }
        res.status(200).json({ success: true, data: temple });
    } catch (error) {
        console.error('Get Temple Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all temples for admin (active & inactive)
// @route   GET /api/pooja/admin/temples
// @access  Private/Admin
exports.getAllTemplesAdmin = async (req, res) => {
    try {
        const temples = await Temple.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: temples.length, data: temples });
    } catch (error) {
        console.error('Get All Temples Admin Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Validate a coupon code
// @route   POST /api/pooja/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res) => {
    try {
        const { code, amount, templeId } = req.body;
        if (!code || !amount || !templeId) {
            return res.status(400).json({ success: false, message: 'Code, amount and templeId are required' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid or inactive coupon' });
        }

        // 0. Check Temple Specificity
        if (coupon.temple && coupon.temple.toString() !== templeId) {
            return res.status(400).json({ success: false, message: 'This coupon is not valid for this temple' });
        }

        // 1. Check Expiry
        if (new Date() > new Date(coupon.validUntil)) {
            return res.status(400).json({ success: false, message: 'Coupon has expired' });
        }
        if (new Date() < new Date(coupon.validFrom)) {
            return res.status(400).json({ success: false, message: 'Coupon is not yet valid' });
        }

        // 2. Check Usage Limits
        if (coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }

        // 3. Check Min Order Value
        if (amount < coupon.minOrderValue) {
            return res.status(400).json({ success: false, message: `Minimum order value for this coupon is ₹${coupon.minOrderValue}` });
        }

        // Calculate Discount
        let calculatedDiscount = 0;
        if (coupon.discountType === 'FIXED') {
            calculatedDiscount = coupon.discountValue;
        } else {
            // PERCENTAGE
            calculatedDiscount = (amount * coupon.discountValue) / 100;
            if (coupon.maxDiscount && calculatedDiscount > coupon.maxDiscount) {
                calculatedDiscount = coupon.maxDiscount;
            }
        }

        // Safety check to not discount more than total amount
        calculatedDiscount = Math.min(calculatedDiscount, amount);

        res.status(200).json({
            success: true,
            discountAmount: calculatedDiscount,
            finalAmount: amount - calculatedDiscount,
            couponId: coupon._id
        });

    } catch (error) {
        console.error('Validate Coupon Error:', error);
        res.status(500).json({ success: false, message: 'Server error validating coupon' });
    }
};

// @desc    Create Razorpay order for pooja booking
// @route   POST /api/pooja/booking/create-order
// @access  Private
exports.createBookingOrder = async (req, res) => {
    const { templeId, sevaName, sevaPrice, devoteeDetails, deliveryAddress, performDate, couponCode } = req.body;

    if (!templeId || !sevaName || !sevaPrice || !devoteeDetails || !deliveryAddress) {
        return res.status(400).json({ success: false, message: 'Please provide all required details' });
    }

    if (!devoteeDetails.phoneNumber || devoteeDetails.phoneNumber.length < 10 || !/^\+?\d+$/.test(devoteeDetails.phoneNumber)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid phone number with country code' });
    }

    try {
        // 1. Fetch Temple to determine Seva Slots
        const temple = await Temple.findById(templeId);
        if (!temple) return res.status(404).json({ success: false, message: 'Temple not found' });

        const seva = temple.sevas.find(s => s.name === sevaName);
        if (!seva) return res.status(404).json({ success: false, message: 'Seva not found' });

        // 2. Enforce Max Slots if applicable
        if (seva.maxSlots && performDate) {
            // Check existing paid or scheduled bookings for this exact date
            const startOfDay = new Date(performDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(performDate);
            endOfDay.setHours(23, 59, 59, 999);

            const existingBookingsCount = await PoojaBooking.countDocuments({
                temple: templeId,
                'sevaDetails.name': sevaName,
                performDate: { $gte: startOfDay, $lte: endOfDay },
                'payment.status': { $in: ['Paid', 'Pending'] } // Pending slots are reserved until failed
            });

            if (existingBookingsCount >= seva.maxSlots) {
                return res.status(400).json({ success: false, message: 'All slots for this seva are booked on the selected date. Please choose another date.' });
            }
        }

        // 3. Process Coupon Logic
        let finalPrice = parseInt(sevaPrice);
        let appliedCouponId = null;
        let discountApplied = 0;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

            // Validate the coupon hasn't expired, has uses left, meets min order, AND matches the temple (if specific)
            if (
                coupon &&
                new Date() <= new Date(coupon.validUntil) &&
                coupon.usedCount < coupon.usageLimit &&
                finalPrice >= coupon.minOrderValue &&
                (!coupon.temple || coupon.temple.toString() === templeId)
            ) {
                if (coupon.discountType === 'FIXED') {
                    discountApplied = coupon.discountValue;
                } else {
                    discountApplied = (finalPrice * coupon.discountValue) / 100;
                    if (coupon.maxDiscount && discountApplied > coupon.maxDiscount) discountApplied = coupon.maxDiscount;
                }
                discountApplied = Math.min(discountApplied, finalPrice);

                finalPrice -= discountApplied;
                appliedCouponId = coupon._id;

                // Optimistically increment usage limit. 
                // A more robust implementation handles incrementing only on payment success, 
                // but incrementing now prevents rapid concurrency overflows.
                coupon.usedCount += 1;
                await coupon.save();
            }
        }

        // 4. Create Razorpay Order
        const options = {
            amount: finalPrice * 100, // Amount in paise
            currency: "INR",
            receipt: `pooja_receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // 5. Create a Pending Booking
        // 5. Create a Pending Booking with sequential ID
        const counter = await Counter.findOneAndUpdate(
            { id: 'pooja_booking_seq' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const timestampPart = moment().tz('Asia/Kolkata').format('YYMMDDHHmm');
        const bookingId = `W2A-PJ-${timestampPart}-${counter.seq}`;

        await PoojaBooking.create({
            bookingId,
            user: req.user.id,
            temple: templeId,
            sevaDetails: {
                name: sevaName,
                price: sevaPrice // Store original price
            },
            couponApplied: appliedCouponId,
            discountAmount: discountApplied,
            devoteeDetails,
            deliveryAddress,
            performDate,
            payment: {
                razorpayOrderId: order.id,
                status: 'Pending'
            }
        });

        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: finalPrice, // Send discounted amount to client
            original_amount: sevaPrice,
            discount: discountApplied,
            currency: "INR",
            key_id: process.env.RAZORPAY_KEY_ID,
            bookingId
        });

    } catch (error) {
        console.error('Create Booking Order Error:', error);
        res.status(500).json({ success: false, message: 'Server error creating order' });
    }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/pooja/booking/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment Success
            const booking = await PoojaBooking.findOne({ bookingId })
                .populate('temple', 'name slug profileImage coverImage')
                .populate('user', 'email phone name');

            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            booking.payment.razorpayPaymentId = razorpay_payment_id;
            booking.payment.razorpaySignature = razorpay_signature;
            booking.payment.status = 'Paid';
            await booking.save();

            // Send Notifications as fire-and-forget (do not block the response)
            emailService.sendBookingConfirmationEmail(booking).catch(err => console.error("Email notification failed:", err));
            whatsappService.sendBookingConfirmationWhatsapp(booking).catch(err => console.error("WhatsApp notification failed:", err));

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                booking
            });

        } else {
            // Signature Mismatch
            await PoojaBooking.findOneAndUpdate(
                { bookingId },
                { 'payment.status': 'Failed' }
            );
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }

    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ success: false, message: 'Server verification error' });
    }
};

// @desc    Get logged in user's pooja bookings
// @route   GET /api/pooja/booking/my-bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await PoojaBooking.find({ user: req.user.id })
            .populate('temple', 'name slug profileImage coverImage')
            .populate('couponApplied', 'code discountValue')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        console.error('Get User Bookings Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- Admin Controllers ---

// @desc    Create new temple
// @route   POST /api/pooja/admin/temples
// @access  Private/Admin
exports.createTemple = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const temple = await Temple.create(req.body);

        // Ping search engines for sitemap update
        seoController.pingSearchEngines();

        // Trigger Cloudflare deployment to reflect new temple in static frontend
        triggerDeployment('Create Temple');

        res.status(201).json({ success: true, data: temple });
    } catch (error) {
        console.error('Create Temple Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Server Error' });
    }
};

// @desc    Update temple
// @route   PUT /api/pooja/admin/temples/:id
// @access  Private/Admin
exports.updateTemple = async (req, res) => {
    try {
        const temple = await Temple.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!temple) {
            return res.status(404).json({ success: false, message: 'Temple not found' });
        }

        // Ping search engines for sitemap update
        seoController.pingSearchEngines();

        // Trigger Cloudflare deployment to reflect updated temple in static frontend
        triggerDeployment('Update Temple');

        res.status(200).json({ success: true, data: temple });
    } catch (error) {
        console.error('Update Temple Error:', error);
        res.status(400).json({ success: false, message: error.message || 'Server Error' });
    }
};

// @desc    Delete temple (Soft delete or hard delete based on requirement - here we update isActive)
// @route   DELETE /api/pooja/admin/temples/:id
// @access  Private/Admin
exports.deleteTemple = async (req, res) => {
    try {
        const temple = await Temple.findById(req.params.id);
        if (!temple) {
            return res.status(404).json({ success: false, message: 'Temple not found' });
        }
        await temple.deleteOne();

        // Ping search engines for sitemap update
        seoController.pingSearchEngines();

        // Trigger Cloudflare deployment to reflect temple removal in static frontend
        triggerDeployment('Delete Temple');

        res.status(200).json({ success: true, message: 'Temple removed' });
    } catch (error) {
        console.error('Delete Temple Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/pooja/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
    try {
        const { temple, status, startDate, endDate, coupon, performStartDate, performEndDate, bookingId, city, state, devoteeName } = req.query;
        let query = {};

        if (city) query['deliveryAddress.city'] = { $regex: city, $options: 'i' };
        if (state) query['deliveryAddress.state'] = { $regex: state, $options: 'i' };
        if (devoteeName) {
            query['devoteeDetails.devotees.name'] = { $regex: devoteeName, $options: 'i' };
        }

        if (temple) query.temple = temple;
        if (status) query['payment.status'] = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (performStartDate || performEndDate) {
            query.performDate = {};
            if (performStartDate) query.performDate.$gte = new Date(performStartDate);
            if (performEndDate) query.performDate.$lte = new Date(performEndDate);
        }

        if (bookingId) {
            query.bookingId = { $regex: bookingId, $options: 'i' };
        }

        if (coupon) {
            const coupons = await Coupon.find({ code: { $regex: coupon, $options: 'i' } });
            if (coupons.length > 0) {
                query.couponApplied = { $in: coupons.map(c => c._id) };
            } else {
                // If coupon provided but not found, ensure no results
                query.couponApplied = '000000000000000000000000';
            }
        }

        const bookings = await PoojaBooking.find(query)
            .populate('temple', 'name')
            .populate('user', 'name email phone')
            .populate('couponApplied', 'code')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        console.error('Get All Bookings Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Export bookings as CSV
// @route   GET /api/pooja/admin/bookings/export
// @access  Private/Admin
exports.exportBookings = async (req, res) => {
    try {
        const { temple, status, startDate, endDate, coupon, performStartDate, performEndDate, bookingId, city, state, devoteeName } = req.query;
        let query = {};

        if (city) query['deliveryAddress.city'] = { $regex: city, $options: 'i' };
        if (state) query['deliveryAddress.state'] = { $regex: state, $options: 'i' };
        if (devoteeName) {
            query['devoteeDetails.devotees.name'] = { $regex: devoteeName, $options: 'i' };
        }

        if (temple) query.temple = temple;
        if (status) query['payment.status'] = status;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (performStartDate || performEndDate) {
            query.performDate = {};
            if (performStartDate) query.performDate.$gte = new Date(performStartDate);
            if (performEndDate) query.performDate.$lte = new Date(performEndDate);
        }

        if (bookingId) {
            query.bookingId = { $regex: bookingId, $options: 'i' };
        }

        if (coupon) {
            const coupons = await Coupon.find({ code: { $regex: coupon, $options: 'i' } });
            if (coupons.length > 0) {
                query.couponApplied = { $in: coupons.map(c => c._id) };
            } else {
                query.couponApplied = '000000000000000000000000';
            }
        }

        const bookings = await PoojaBooking.find(query)
            .populate('temple', 'name')
            .populate('user', 'name email phone')
            .populate('couponApplied', 'code')
            .sort({ createdAt: -1 });

        // Generate CSV content
        let csv = 'Booking ID,Devotee Name,Gotram,Phone,Email,Temple,Seva,Base Amount,Discount,Coupon Used,Final Amount,Payment Status,Perform Date,Booking Date,Delivery Address\n';

        bookings.forEach(b => {
            const devoteeList = b.devoteeDetails.devotees?.map(d => `${d.name}${d.nakshatra ? ` (${d.nakshatra})` : ''}`).join(' | ');
            const performDate = b.performDate ? new Date(b.performDate).toLocaleDateString('en-IN') : 'Scheduled';
            const address = b.deliveryAddress ? `${b.deliveryAddress.address}, ${b.deliveryAddress.city}, ${b.deliveryAddress.state} - ${b.deliveryAddress.pincode}, ${b.deliveryAddress.country}` : 'N/A';
            const finalAmount = b.sevaDetails.price - (b.discountAmount || 0);
            const couponCode = b.couponApplied ? b.couponApplied.code : 'None';

            csv += `"${b.bookingId}","${devoteeList}","${b.devoteeDetails.gotram}","${b.devoteeDetails.phoneNumber}","${b.devoteeDetails.email}","${b.temple ? b.temple.name : 'N/A'}","${b.sevaDetails.name}",${b.sevaDetails.price},${b.discountAmount || 0},"${couponCode}",${finalAmount},"${b.payment.status}","${performDate}","${b.createdAt.toISOString()}","${address}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=pooja-bookings-${Date.now()}.csv`);
        res.status(200).send(csv);

    } catch (error) {
        console.error('Export Bookings Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update booking status
// @route   PUT /api/pooja/admin/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingStatus } = req.body;

        if (!['Confirmed', 'Completed', 'Cancelled'].includes(bookingStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const booking = await PoojaBooking.findByIdAndUpdate(
            req.params.id,
            { bookingStatus },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({ success: true, message: 'Status updated successfully', data: booking });
    } catch (error) {
        console.error('Update Booking Status Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- Admin Coupon Controllers ---

// @desc    Get active public coupons
// @route   GET /api/pooja/coupons/active
// @access  Public
exports.getActiveCoupons = async (req, res) => {
    try {
        const { templeId } = req.query;
        let query = {
            isActive: true,
            validUntil: { $gte: new Date() },
            $expr: { $lt: ["$usedCount", "$usageLimit"] }
        };

        if (templeId) {
            query.$or = [{ temple: templeId }, { temple: null }];
        } else {
            query.temple = null;
        }

        const coupons = await Coupon.find(query)
            .select('-usageLimit -usedCount -createdAt -updatedAt -__v')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: coupons.length, data: coupons });
    } catch (error) {
        console.error('Get Active Coupons Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all coupons
// @route   GET /api/pooja/admin/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create new coupon
// @route   POST /api/pooja/admin/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Server Error' });
    }
};

// @desc    Update coupon
// @route   PUT /api/pooja/admin/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, data: coupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Server Error' });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/pooja/admin/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update delivery address for a booking
// @route   PUT /api/pooja/booking/:id/address
// @access  Private
exports.updateBookingAddress = async (req, res) => {
    try {
        let { address, city, state, pincode, country } = req.body;

        // Handle nested deliveryAddress if present (from frontend)
        if (req.body.deliveryAddress) {
            ({ address, city, state, pincode, country } = req.body.deliveryAddress);
        }

        const fs = require('fs');
        const logMsg = `\n[${new Date().toISOString()}] UPDATE ADDRESS - ID: ${req.params.id}\nData: ${JSON.stringify({ address, city, state, pincode, country })}\n`;
        fs.appendFileSync('debug_address.log', logMsg);

        if (!address || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all address details'
            });
        }

        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pincode. Please provide a 6-digit numeric pincode'
            });
        }

        const booking = await PoojaBooking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Check 36-hour restriction
        if (booking.performDate) {
            const performDate = new Date(booking.performDate);
            const now = new Date();
            const hoursUntilPooja = (performDate - now) / (1000 * 60 * 60);

            if (hoursUntilPooja < 36) {
                return res.status(400).json({
                    success: false,
                    message: 'Address updates are only allowed up to 36 hours before the Pooja performance time'
                });
            }
        }

        // Check ownership
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Don't allow updates for completed or cancelled bookings
        if (['Completed', 'Cancelled'].includes(booking.bookingStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot update address for ${booking.bookingStatus} orders`
            });
        }

        booking.deliveryAddress = {
            address,
            city,
            state,
            pincode,
            country: 'India' // Force lock to India as requested
        };

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Delivery address updated successfully',
            data: booking.deliveryAddress
        });
    } catch (error) {
        console.error('Update address error:', error);
        const fs = require('fs');
        fs.appendFileSync('debug_address.log', `[${new Date().toISOString()}] ERROR: ${error.message}\n${error.stack}\n`);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
