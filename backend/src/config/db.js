const mongoose = require('mongoose');

const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;

        if (!uri) {
            console.error("No MONGO_URI in env. Falling back to in-memory.");
        } else {
            // Attempt 1: Standard Connection
            try {
                console.log("DB: Attempting Atlas connection...");
                const conn = await mongoose.connect(uri, {
                    serverSelectionTimeoutMS: 5000,
                    family: 4 // Force IPv4
                });
                console.log(`MongoDB Connected: ${conn.connection.host}`);
                return;
            } catch (err) {
                console.warn(`Atlas connection failed: ${err.message}`);
                console.log("TIP: Ensure your current IP is whitelisted in MongoDB Atlas Network Access.");
            }
        }

        // Fallback to In-Memory DB
        console.log("Attempting to start in-memory MongoDB as last resort...");
        const mongod = await MongoMemoryServer.create();
        const memoryUri = mongod.getUri();

        console.log(`In-Memory MongoDB started at: ${memoryUri}`);
        const conn = await mongoose.connect(memoryUri);

        console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
        console.warn("WARNING: Using In-Memory Database. Persistent data is NOT available.");

    } catch (error) {
        console.error(`Critical DB Error: ${error.message}`);
    }
};

module.exports = connectDB;
