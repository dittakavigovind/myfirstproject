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
                console.log("DB: Attempting standard connection...");
                const conn = await mongoose.connect(uri, {
                    serverSelectionTimeoutMS: 8000,
                    connectTimeoutMS: 10000
                });
                console.log(`MongoDB Connected: ${conn.connection.host}`);
                return;
            } catch (err) {
                console.warn(`Primary connection failed: ${err.message}`);

                // Attempt 2: Force IPv4 and Google DNS for SRV issues
                try {
                    console.log("DB: Attempting DNS fix (Google OpenDNS)...");
                    const dns = require('dns');
                    dns.setServers(['8.8.8.8', '8.8.4.4']);

                    await mongoose.connect(uri, {
                        family: 4,
                        serverSelectionTimeoutMS: 5000 // Reduced timeout for faster fallback
                    });
                    console.log(`MongoDB Connected (via Google DNS): ${mongoose.connection.host}`);
                    return;
                } catch (dnsErr) {
                    console.error(`DNS Fix failed: ${dnsErr.message}`);
                    // Continue to fallback
                }
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
