const Temple = require('../models/Temple');
const PoojaBooking = require('../models/PoojaBooking');
const Razorpay = require('razorpay');
const crypto = require('crypto');

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

// @desc    Create Razorpay order for pooja booking
// @route   POST /api/pooja/booking/create-order
// @access  Private
exports.createBookingOrder = async (req, res) => {
    const { templeId, sevaName, sevaPrice, devoteeDetails, deliveryAddress, performDate } = req.body;

    if (!templeId || !sevaName || !sevaPrice || !devoteeDetails || !deliveryAddress) {
        return res.status(400).json({ success: false, message: 'Please provide all required details' });
    }

    if (!devoteeDetails.phoneNumber || devoteeDetails.phoneNumber.length !== 10 || !/^\d+$/.test(devoteeDetails.phoneNumber)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number' });
    }

    try {
        // 1. Create Razorpay Order
        const options = {
            amount: sevaPrice * 100, // Amount in paise
            currency: "INR",
            receipt: `pooja_receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // 2. Create a Pending Booking
        const bookingId = `W2A-PJ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await PoojaBooking.create({
            bookingId,
            user: req.user.id,
            temple: templeId,
            sevaDetails: {
                name: sevaName,
                price: sevaPrice
            },
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
            amount: sevaPrice,
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
            const booking = await PoojaBooking.findOne({ bookingId });

            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            booking.payment.razorpayPaymentId = razorpay_payment_id;
            booking.payment.razorpaySignature = razorpay_signature;
            booking.payment.status = 'Paid';
            await booking.save();

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

// --- Admin Controllers ---

// @desc    Create new temple
// @route   POST /api/pooja/admin/temples
// @access  Private/Admin
exports.createTemple = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const temple = await Temple.create(req.body);
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
        const { temple, status, startDate, endDate } = req.query;
        let query = {};

        if (temple) query.temple = temple;
        if (status) query['payment.status'] = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const bookings = await PoojaBooking.find(query)
            .populate('temple', 'name')
            .populate('user', 'name email phone')
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
        const { temple, status, startDate, endDate } = req.query;
        let query = {};

        if (temple) query.temple = temple;
        if (status) query['payment.status'] = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const bookings = await PoojaBooking.find(query)
            .populate('temple', 'name')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        // Generate CSV content
        let csv = 'Booking ID,Devotee Name,Gotram,Phone,Email,Temple,Seva,Amount,Payment Status,Perform Date,Booking Date,Delivery Address\n';

        bookings.forEach(b => {
            const devoteeList = b.devoteeDetails.devotees?.map(d => `${d.name}${d.nakshatra ? ` (${d.nakshatra})` : ''}`).join(' | ');
            const performDate = b.performDate ? new Date(b.performDate).toLocaleDateString('en-IN') : 'Scheduled';
            const address = b.deliveryAddress ? `${b.deliveryAddress.address}, ${b.deliveryAddress.city}, ${b.deliveryAddress.state} - ${b.deliveryAddress.pincode}, ${b.deliveryAddress.country}` : 'N/A';
            csv += `"${b.bookingId}","${devoteeList}","${b.devoteeDetails.gotram}","${b.devoteeDetails.phoneNumber}","${b.devoteeDetails.email}","${b.temple ? b.temple.name : 'N/A'}","${b.sevaDetails.name}",${b.sevaDetails.price},"${b.payment.status}","${performDate}","${b.createdAt.toISOString()}","${address}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=pooja-bookings-${Date.now()}.csv`);
        res.status(200).send(csv);

    } catch (error) {
        console.error('Export Bookings Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
