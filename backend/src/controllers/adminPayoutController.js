const AstrologerPayout = require('../models/AstrologerPayout');
const Astrologer = require('../models/Astrologer');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');
const { Parser } = require('json2csv');

exports.getPayouts = async (req, res) => {
    try {
        const { status, cycleStartDate, astrologerId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (cycleStartDate) query.cycleStartDate = cycleStartDate;
        if (astrologerId) query.astrologerId = astrologerId;

        const payouts = await AstrologerPayout.find(query)
            .populate('astrologerId', 'displayName image userId')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: payouts.length, data: payouts });
    } catch (error) {
        console.error('Error fetching admin payouts:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.putOnHold = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminRemarks } = req.body;

        if (!adminRemarks) {
            return res.status(400).json({ success: false, message: 'Admin remarks are required to hold a payment.' });
        }

        const payout = await AstrologerPayout.findByIdAndUpdate(
            id,
            { status: 'on_hold', adminRemarks },
            { new: true }
        );

        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });

        res.status(200).json({ success: true, data: payout });
    } catch (error) {
        console.error('Error holding payout:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.releaseHold = async (req, res) => {
    try {
        const { id } = req.params;
        
        const payout = await AstrologerPayout.findByIdAndUpdate(
            id,
            { status: 'pending', adminRemarks: 'Hold released by admin.' },
            { new: true }
        );

        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });

        res.status(200).json({ success: true, data: payout });
    } catch (error) {
        console.error('Error releasing payout:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.editPayout = async (req, res) => {
    try {
        const { id } = req.params;
        const { newGrossAmount, adminRemarks } = req.body;

        if (newGrossAmount === undefined || !adminRemarks) {
            return res.status(400).json({ success: false, message: 'New gross amount and admin remarks are required.' });
        }

        const payout = await AstrologerPayout.findById(id);
        if (!payout) return res.status(404).json({ success: false, message: 'Payout not found' });

        if (payout.status === 'completed' || payout.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Cannot edit a completed or cancelled payout.' });
        }

        const tdsAmount = (newGrossAmount * payout.tdsPercentage) / 100;
        const pgAmount = (newGrossAmount * payout.pgPercentage) / 100;
        const netPayableAmount = newGrossAmount - tdsAmount - pgAmount;

        payout.grossAmount = newGrossAmount;
        payout.tdsAmount = tdsAmount;
        payout.pgAmount = pgAmount;
        payout.netPayableAmount = netPayableAmount;
        payout.amount = netPayableAmount; // legacy sync
        payout.adminRemarks = adminRemarks;

        await payout.save();

        res.status(200).json({ success: true, data: payout });
    } catch (error) {
        console.error('Error editing payout:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.markPaid = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { transactionId, notes } = req.body;

        const payout = await AstrologerPayout.findById(id).session(session);
        if (!payout) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Payout not found' });
        }

        if (payout.status === 'completed') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Payout is already marked as completed.' });
        }

        // Deduct from wallet
        const astro = await Astrologer.findById(payout.astrologerId).select('+walletBalance').session(session);
        if (!astro) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Astrologer not found' });
        }

        if (astro.walletBalance < payout.grossAmount) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: `Astrologer only has ₹${astro.walletBalance} but payout gross is ₹${payout.grossAmount}` });
        }

        astro.walletBalance -= payout.grossAmount;
        await astro.save({ session });

        // Mark payout complete
        payout.status = 'completed';
        payout.transactionId = transactionId || `PAYOUT_${Date.now()}`;
        if (notes) payout.notes = notes;
        payout.processedAt = new Date();
        await payout.save({ session });

        // Log transaction
        await Transaction.create([{
            user: astro.userId, // Link to User model
            amount: payout.grossAmount,
            type: 'debit',
            status: 'success',
            description: `Wallet deduction for payout cycle ${payout.cycleStartDate ? payout.cycleStartDate.toISOString().split('T')[0] : ''}`,
            referenceModel: 'AstrologerPayout',
            referenceId: payout._id
        }], { session });

        await session.commitTransaction();
        res.status(200).json({ success: true, data: payout });
    } catch (error) {
        console.error('Error marking payout as paid:', error);
        await session.abortTransaction();
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        session.endSession();
    }
};

exports.exportPayoutsCSV = async (req, res) => {
    try {
        const payouts = await AstrologerPayout.find()
            .populate('astrologerId', 'name displayName email phone')
            .sort({ createdAt: -1 });

        const fields = [
            { label: 'Astrologer', value: (row) => row.astrologerId?.displayName || row.astrologerId?.name || 'Unknown' },
            { label: 'Cycle Start', value: (row) => row.cycleStartDate ? new Date(row.cycleStartDate).toLocaleDateString() : '' },
            { label: 'Cycle End', value: (row) => row.cycleEndDate ? new Date(row.cycleEndDate).toLocaleDateString() : '' },
            { label: 'Gross Amount', value: 'grossAmount' },
            { label: 'TDS Deduction', value: 'tdsAmount' },
            { label: 'PG Deduction', value: 'pgAmount' },
            { label: 'Net Payable', value: (row) => row.netPayableAmount || row.amount || 0 },
            { label: 'Status', value: 'status' },
            { label: 'Remarks', value: 'adminRemarks' },
            { label: 'Transaction ID', value: 'transactionId' }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(payouts);

        res.header('Content-Type', 'text/csv');
        res.attachment(`payouts_${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);
    } catch (error) {
        console.error('Export Payouts CSV Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
