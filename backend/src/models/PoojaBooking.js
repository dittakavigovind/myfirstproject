const mongoose = require('mongoose');

const poojaBookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    temple: {
        type: mongoose.Schema.ObjectId,
        ref: 'Temple',
        required: true
    },
    sevaDetails: {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    },
    performDate: {
        type: Date
    },
    devoteeDetails: {
        devotees: [{
            name: {
                type: String,
                required: [true, 'Please add name']
            },
            nakshatra: {
                type: String
            }
        }],
        gotram: {
            type: String,
            required: [true, 'Please add gotram']
        },
        phoneNumber: {
            type: String,
            required: [true, 'Please add phone number']
        },
        email: {
            type: String,
            required: [true, 'Please add email']
        }
    },
    deliveryAddress: {
        address: {
            type: String,
            required: [true, 'Please add address']
        },
        city: {
            type: String,
            required: [true, 'Please add city']
        },
        state: {
            type: String,
            required: [true, 'Please add state']
        },
        pincode: {
            type: String,
            required: [true, 'Please add pincode']
        },
        country: {
            type: String,
            required: [true, 'Please add country']
        }
    },
    payment: {
        razorpayOrderId: {
            type: String
        },
        razorpayPaymentId: {
            type: String
        },
        razorpaySignature: {
            type: String
        },
        status: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending'
        }
    },
    bookingStatus: {
        type: String,
        enum: ['Confirmed', 'Completed', 'Cancelled'],
        default: 'Confirmed' // Paid implies confirmed
    }
}, { timestamps: true });

module.exports = mongoose.model('PoojaBooking', poojaBookingSchema);
