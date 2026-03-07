const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
    callbackURL: (process.env.BACKEND_URL || "") + "/api/auth/google/callback",
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const name = profile.displayName;
        const profileImage = profile.photos[0]?.value;

        // Find or create user
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // Update existing user if needed (e.g., set googleId if it was email-only before)
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                user.emailVerified = true;
                await user.save();
            }
            return done(null, user);
        }

        // Create new user for Google Login
        user = await User.create({
            name,
            email,
            googleId,
            authProvider: 'google',
            emailVerified: true,
            profileImage: profileImage || 'default-avatar.png'
        });

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
