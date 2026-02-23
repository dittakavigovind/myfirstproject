const SiteSettings = require('../models/SiteSettings');

const defaultServices = [
    { id: 'chat', title: 'Chat', desc: 'First Free', icon: 'MessageCircle', color: 'blue', href: '/chat-with-astrologer', order: 1 },
    { id: 'call', title: 'Call', desc: 'Connect Now', icon: 'Phone', color: 'green', href: '/astrologers', order: 2 },
    { id: 'kundli', title: 'Free Kundli', desc: 'Full Report', icon: 'FileText', color: 'purple', href: '/kundli', order: 3 },
    { id: 'matchmaking', title: 'Matchmaking', desc: 'Compatibility', icon: 'Users', color: 'indigo', href: '/matchmaking', order: 4 },
    { id: 'horoscope', title: 'Horoscope', desc: 'Daily Insights', icon: 'PlayCircle', color: 'red', href: '/horoscope', order: 5 },
    { id: 'panchang', title: 'Panchang', desc: 'Muhurat', icon: 'Calendar', color: 'orange', href: '/today-panchang', order: 6 },
    { id: 'blog', title: 'Blog', desc: 'Knowledge', icon: 'BookOpen', color: 'indigo', href: '/blog', order: 7 },
    { id: 'love-calc', title: 'Love Calc', desc: 'Compatibility', icon: 'Heart', color: 'red', href: '/calculators/love-calculator', order: 8 },
    { id: 'moon-sign', title: 'Moon Sign', desc: 'Rashi Calc', icon: 'Moon', color: 'purple', href: '/calculators/moon-sign-calculator', order: 9 },
    { id: 'sun-sign', title: 'Sun Sign', desc: 'Zodiac Calc', icon: 'Sun', color: 'orange', href: '/calculators/sun-sign-calculator', order: 10 },
    { id: 'sade-sati', title: 'Sade Sati', desc: 'Saturn Cycle', icon: 'Activity', color: 'blue', href: '/calculators/sade-sati-calculator', order: 11 },
    { id: 'dasha', title: 'Dasha', desc: 'Planetary Period', icon: 'Clock', color: 'indigo', href: '/calculators/dasha-periods', order: 12 },
    { id: 'yogini-dasha', title: 'Yogini Dasha', desc: 'Mystic Cycle', icon: 'Sparkles', color: 'purple', href: '/calculators/yogini-dasha', order: 13 },
    { id: 'numerology', title: 'Numerology', desc: 'Numbers Guide', icon: 'Hash', color: 'green', href: '/calculators/numerology-calculator', order: 14 },
    { id: 'transit', title: 'Transit', desc: 'Gochar Now', icon: 'Activity', color: 'blue', href: '/calculators/gochar', order: 15 },
    { id: 'friendship', title: 'Friendship', desc: 'Bond Check', icon: 'Users', color: 'blue', href: '/calculators/friendship-calculator', order: 16 },
    { id: 'arudha-lagna', title: 'Arudha Lagna', desc: 'Public Image', icon: 'Shield', color: 'indigo', href: '/arudha-lagna', order: 17 },
    { id: 'kaalsarp', title: 'Kaal Sarp', desc: 'Dosha Check', icon: 'AlertTriangle', color: 'red', href: '/kaalsarp-dosha', order: 18 },
    { id: 'mangal', title: 'Mangal Dosha', desc: 'Vedic Analysis', icon: 'Zap', color: 'orange', href: '/mangal-dosha', order: 19 },
    { id: 'marriage-career', title: 'Marriage & Career', desc: 'Timing Analysis', icon: 'Briefcase', color: 'pink', href: '/calculators/marriage-career', order: 20 }
];

// @desc    Get Site Settings (Logos, etc.)
// @route   GET /api/site-settings
// @access  Public
exports.getSiteSettings = async (req, res) => {
    try {
        // Find the first document, or create one if it doesn't exist
        let settings = await SiteSettings.findOne();

        if (!settings) {
            settings = await SiteSettings.create({
                logoDesktop: '/logo.svg',
                logoMobile: '/logo.svg',
                exploreServices: defaultServices
            });
            console.log("Created initial SiteSettings with default services.");
        } else {
            // Robust check for missing default services
            let updated = false;

            if (!settings.exploreServices || settings.exploreServices.length === 0) {
                settings.exploreServices = defaultServices;
                updated = true;
                console.log("Restored all default services to empty SiteSettings.");
            } else {
                // Normalize paths for comparison (remove trailing slashes)
                const normalizePath = (p) => p?.replace(/\/+$/, '') || '';
                const currentPaths = settings.exploreServices.map(s => normalizePath(s.href));
                const currentIds = settings.exploreServices.map(s => s.id).filter(Boolean);

                const missingServices = defaultServices.filter(s => {
                    const isMissingById = s.id && !currentIds.includes(s.id);
                    const isMissingByPath = !currentPaths.includes(normalizePath(s.href));
                    return isMissingById && isMissingByPath;
                });

                if (missingServices.length > 0) {
                    console.log(`Found ${missingServices.length} missing default services:`, missingServices.map(s => s.title));

                    // Add missing services at the end
                    const maxOrder = settings.exploreServices.reduce((max, s) => Math.max(max, s.order || 0), 0);

                    const servicesToAdd = missingServices.map((s, i) => ({
                        ...s,
                        enabled: true, // Ensure they are enabled by default
                        order: maxOrder + i + 1
                    }));

                    settings.exploreServices = [...settings.exploreServices, ...servicesToAdd];
                    updated = true;
                }
            }

            if (updated) {
                // Ensure Mongoose detects the change in the array
                settings.markModified('exploreServices');
                await settings.save();
                console.log("SiteSettings updated with missing default services.");
            }
        }

        // Ensure logoReport exists in the output
        const rawSettings = settings.toObject();
        const settingsResponse = {
            ...rawSettings,
            logoReport: rawSettings.logoReport || settings.logoReport || '/logo.svg'
        };

        console.log("DEBUG: Final settingsResponse logoReport:", settingsResponse.logoReport);
        res.json({ success: true, settings: settingsResponse });
    } catch (error) {
        console.error("getSiteSettings Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Site Settings
// @route   PUT /api/site-settings
// @access  Private/Admin
exports.updateSiteSettings = async (req, res) => {
    try {
        const { logoDesktop, logoMobile, logoReport } = req.body;

        let settings = await SiteSettings.findOne();

        if (!settings) {
            settings = new SiteSettings();
        }

        if (logoDesktop) settings.logoDesktop = logoDesktop;
        if (logoMobile) settings.logoMobile = logoMobile;
        if (logoReport) settings.logoReport = logoReport;
        if (req.body.favicon) settings.favicon = req.body.favicon;
        if (req.body.promotionImage !== undefined) settings.promotionImage = req.body.promotionImage;
        if (req.body.promotionUrl !== undefined) settings.promotionUrl = req.body.promotionUrl;
        if (req.body.googleAdsId !== undefined) settings.googleAdsId = req.body.googleAdsId;
        if (req.body.googleAnalyticsId !== undefined) settings.googleAnalyticsId = req.body.googleAnalyticsId;

        // Feature Flags
        if (req.body.featureFlags) {
            settings.featureFlags = { ...settings.featureFlags, ...req.body.featureFlags };
        }

        // Update theme colors if provided
        if (req.body.themeColors) {
            settings.themeColors = { ...settings.themeColors, ...req.body.themeColors };
        }

        // --- NEW FIELDS ---
        if (typeof req.body.useCustomColors !== 'undefined') {
            settings.useCustomColors = req.body.useCustomColors;
        }

        if (req.body.customColors) {
            settings.customColors = { ...settings.customColors, ...req.body.customColors };
        }

        if (req.body.navBadges) {
            settings.navBadges = req.body.navBadges; // Replace entire array as it's fully managed
        }

        if (req.body.exploreServices) {
            console.log(`Updating exploreServices with ${req.body.exploreServices.length} items`);
            settings.exploreServices = req.body.exploreServices;
        }

        settings.updatedBy = req.user._id;

        await settings.save();

        res.json({ success: true, settings, message: 'Settings updated successfully' });
    } catch (error) {
        console.error("updateSiteSettings Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
