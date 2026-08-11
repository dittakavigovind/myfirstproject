require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const ArchivedUser = require('../src/models/ArchivedUser');
const adminController = require('../src/controllers/adminController');

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // 1. Create a dummy user
        const dummyUser = new User({
            name: 'Test Archiver',
            email: 'testarchive@example.com',
            phone: '+919999999999',
            mobileNumber: '+919999999999',
            role: 'user',
            walletBalance: 500
        });
        await dummyUser.save();
        console.log(`✅ Dummy User created with ID: ${dummyUser._id} and Phone: ${dummyUser.phone}`);

        // 2. Mock Request and Response for adminController.deleteUser
        const req = {
            params: { id: dummyUser._id.toString() }
        };
        
        const res = {
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) {
                console.log(`✅ Admin Controller responded with status ${this.statusCode || 200}:`, data.message || data);
            }
        };

        // 3. Call the deletion logic
        console.log('🔄 Calling deleteUser...');
        await adminController.deleteUser(req, res);

        // 4. Verify ArchivedUser exists
        const archived = await ArchivedUser.findOne({ originalUserId: dummyUser._id });
        if (archived) {
            console.log('✅ SUCCESS: ArchivedUser record found!');
            console.log('   Archived Name:', archived.userData.name);
            console.log('   Archived Phone:', archived.userData.phone);
        } else {
            console.error('❌ FAILED: ArchivedUser record NOT found!');
        }

        // 5. Verify User is scrubbed
        const scrubbedUser = await User.findById(dummyUser._id);
        if (scrubbedUser.name === 'Deleted User' && scrubbedUser.phone.startsWith('deleted_')) {
            console.log('✅ SUCCESS: Original User PII is scrubbed!');
            console.log('   Current Name:', scrubbedUser.name);
            console.log('   Current Phone:', scrubbedUser.phone);
            console.log('   Wallet Balance Retained:', scrubbedUser.walletBalance);
        } else {
            console.error('❌ FAILED: Original User PII was not scrubbed properly!');
        }

        // Cleanup
        await User.findByIdAndDelete(dummyUser._id);
        if (archived) await ArchivedUser.findByIdAndDelete(archived._id);
        console.log('🧹 Cleanup complete.');

        process.exit(0);
    } catch (error) {
        console.error('Error during test:', error);
        process.exit(1);
    }
};

runTest();
