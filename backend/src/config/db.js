const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        if (uri) {
            // Standard Connection (Atlas/Production)
            try {
                console.log("DB: Attempting Atlas connection...");
                const conn = await mongoose.connect(uri, {
                    serverSelectionTimeoutMS: 5000,
                    family: 4 // Force IPv4 for stability
                });
                console.log(`MongoDB Connected: ${conn.connection.host}`);
                return;
            } catch (err) {
                console.warn(`Atlas connection failed: ${err.message}`);
                // Don't fall back to memory server in production!
                if (process.env.NODE_ENV === 'production') {
                    console.error("FATAL: Database connection failed in production.");
                    process.exit(1);
                }
            }
        }

        // Fallback to In-Memory DB (Development Only)
        if (process.env.NODE_ENV !== 'production') {
            console.log("Attempting to start in-memory MongoDB for development...");
            try {
                const { MongoMemoryServer } = require('mongodb-memory-server');
                const mongod = await MongoMemoryServer.create();
                const memoryUri = mongod.getUri();

                console.log(`In-Memory MongoDB started at: ${memoryUri}`);
                const conn = await mongoose.connect(memoryUri);
                console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
            } catch (err) {
                console.error(`Failed to start in-memory DB: ${err.message}`);
            }
        } else {
            console.error("Critical: MONGO_URI missing in production environment!");
            process.exit(1);
        }

    } catch (error) {
        console.error(`Critical DB Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
