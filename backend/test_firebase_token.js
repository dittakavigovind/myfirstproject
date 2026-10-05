require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const db = require('./src/config/db');

async function test() {
    await db();
    
    // Find any user
    const user = await User.findOne({});
    if (!user) {
        console.log("No user found");
        process.exit(1);
    }

    console.log("Found user:", user.email || user.phone);

    // Generate token
    const token = jwt.sign({ id: user._id, sessionVersion: user.sessionVersion }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    // Simulate the API request to /auth/firebase-token
    const axios = require('axios');
    try {
        const res = await axios.get(`https://api.way2astro.com/api/auth/firebase-token`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log("Response SUCCESS:", res.data);
    } catch (e) {
        console.log("Response ERROR:", e.response ? e.response.data : e.message);
    }

    process.exit(0);
}

test();
