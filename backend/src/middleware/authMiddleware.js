const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // console.log("[AUTH DEBUG] Token received:", token.substring(0, 10) + "...");

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.log("[AUTH DEBUG] User not found for token ID:", decoded.id);
                return res.status(401).json({ message: 'User not found' });
            }

            // console.log("[AUTH DEBUG] User authenticated:", req.user.email, "| Role:", req.user.role);
            next();
        } catch (error) {
            console.error("[AUTH DEBUG] Verify Error:", error.message);
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        console.log("[AUTH DEBUG] No token provided in headers");
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user ? req.user.role : 'none'} is not authorized to access this route`
            });
        }
        next();
    };
};

const optionalProtect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // console.log("[OPT-AUTH] Token found:", token.substring(0, 10) + "...");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            // console.log("[OPT-AUTH] User resolved:", req.user ? req.user.email : "None");
        } catch (error) {
            console.error("[OPT-AUTH] Error:", error.message);
            // Do not fail, just continue without req.user
        }
    } else {
        // console.log("[OPT-AUTH] No Authorization Header found");
    }
    next();
};

module.exports = { protect, admin, authorize, optionalProtect };
