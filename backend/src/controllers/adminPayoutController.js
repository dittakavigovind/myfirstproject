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

exports.exportSinglePayoutCSV = async (req, res) => {
    try {
        const { id } = req.params;
        const payout = await AstrologerPayout.findById(id).populate('astrologerId', 'name displayName');
        if (!payout) return res.status(404).json({ message: 'Payout not found' });

        const Session = require('../models/Session');
        
        // Find the most recent completed payout before this one to act as a lower bound
        const lastCompletedPayout = await AstrologerPayout.findOne({
            astrologerId: payout.astrologerId._id,
            status: 'completed',
            cycleEndDate: { $lt: payout.cycleEndDate }
        }).sort({ cycleEndDate: -1 });

        const query = {
            astrologerId: payout.astrologerId._id,
            status: 'completed'
        };

        if (payout.cycleEndDate) {
            query.startTime = { $lte: payout.cycleEndDate };
            if (lastCompletedPayout && lastCompletedPayout.cycleEndDate) {
                query.startTime.$gt = lastCompletedPayout.cycleEndDate;
            }
        } else if (payout.cycleStartDate) {
            query.startTime = { $gte: payout.cycleStartDate };
        }

        const sessions = await Session.find(query).populate('userId', 'name').sort({ startTime: -1 });

        let totalDuration = 0;
        let totalAstroShare = 0;
        let totalDeducted = 0;

        const formattedData = sessions.map(session => {
            const date = session.startTime ? new Date(session.startTime) : null;
            
            let dateStr = '';
            let timeStr = '';
            if (date) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                dateStr = `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${String(date.getFullYear()).slice(2)}`;
                timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
            }

            const sharePct = session.totalAmountDeducted > 0 
                ? Math.round((session.astrologerShare / session.totalAmountDeducted) * 100)
                : (session.pricePerMinute > 0 && session.astrologerShare > 0 ? Math.round((session.astrologerShare / (session.pricePerMinute * (session.totalDuration / 60))) * 100) : 0);
                
            totalDuration += (session.totalDuration || 0);
            totalAstroShare += (session.astrologerShare || 0);
            totalDeducted += (session.totalAmountDeducted || 0);

            return {
                Date: dateStr,
                'Start Time': timeStr,
                'Session ID': session._id.toString(),
                User: session.userId?.name || 'Unknown',
                Type: session.sessionType || '',
                Status: session.status || '',
                'Ended By': session.endedBy || '',
                'Astrologer Reason': session.astrologerEndReason || '',
                'Session Duration (s)': session.totalDuration || 0,
                Rate: session.pricePerMinute || 0,
                'Astro Share %': `${sharePct}%`,
                'Astro Share': session.astrologerShare || 0,
                'Total Deducted': session.totalAmountDeducted || 0
            };
        });

        // Add empty row
        formattedData.push({});
        
        // Add summary row
        formattedData.push({
            Date: 'SUMMARY',
            'Session Duration (s)': totalDuration,
            'Astro Share': totalAstroShare,
            'Total Deducted': totalDeducted
        });

        const fields = [
            'Date', 'Start Time', 'Session ID', 'User', 'Type', 'Status', 'Ended By', 'Astrologer Reason', 
            'Session Duration (s)', 'Rate', 'Astro Share %', 'Astro Share', 'Total Deducted'
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(formattedData);

        res.header('Content-Type', 'text/csv');
        res.attachment(`payout_${payout.astrologerId?.displayName || 'details'}_${new Date().toISOString().split('T')[0]}.csv`);
        return res.send(csv);
    } catch (error) {
        console.error('Export Single Payout CSV Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPayoutSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const payout = await AstrologerPayout.findById(id);
        if (!payout) return res.status(404).json({ message: 'Payout not found' });

        const Session = require('../models/Session');
        
        // Find the most recent completed payout before this one to act as a lower bound
        const lastCompletedPayout = await AstrologerPayout.findOne({
            astrologerId: payout.astrologerId,
            status: 'completed',
            cycleEndDate: { $lt: payout.cycleEndDate }
        }).sort({ cycleEndDate: -1 });

        const query = {
            astrologerId: payout.astrologerId,
            status: 'completed'
        };

        if (payout.cycleEndDate) {
            query.startTime = { $lte: payout.cycleEndDate };
            if (lastCompletedPayout && lastCompletedPayout.cycleEndDate) {
                query.startTime.$gt = lastCompletedPayout.cycleEndDate;
            }
        } else if (payout.cycleStartDate) {
            query.startTime = { $gte: payout.cycleStartDate };
        }

        const sessions = await Session.find(query);
        let platformEarnings = 0;
        sessions.forEach(s => {
            platformEarnings += (s.platformShare || 0);
        });

        res.status(200).json({ success: true, platformEarnings });
    } catch (error) {
        console.error('Get Payout Summary Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
