"use client";

import { createContext, useState, useEffect, useContext } from 'react';
import API from '../lib/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [themeColors, setThemeColors] = useState({
        primary: '#1e1b4b',
        secondary: '#fbbf24',
        accent: '#3b82f6'
    });
    const [logos, setLogos] = useState({ desktop: '', mobile: '', report: '', favicon: '' });
    const [navBadges, setNavBadges] = useState([]);
    const [exploreServices, setExploreServices] = useState([]);

    const [featureFlags, setFeatureFlags] = useState({ enableChat: true, enableCall: true });

    useEffect(() => {
        fetchTheme();

        // Global Auto-Select functionality for all inputs
        const handleGlobalFocus = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                if (e.target.type !== 'checkbox' && e.target.type !== 'radio') {
                    e.target.select();
                }
            }
        };

        window.addEventListener('focus', handleGlobalFocus, true);
        return () => window.removeEventListener('focus', handleGlobalFocus, true);
    }, []);

    const fetchTheme = async () => {
        try {
            const res = await API.get('/site-settings');
            if (res.data.success && res.data.settings) {
                const settings = res.data.settings;
                if (settings.themeColors) {
                    setThemeColors(settings.themeColors);
                    applyTheme(settings.themeColors);
                }
                if (settings.navBadges) {
                    setNavBadges(settings.navBadges);
                }
                if (settings.exploreServices) {
                    setExploreServices(settings.exploreServices);
                }
                if (settings.logoDesktop || settings.logoMobile || settings.logoReport || settings.favicon) {
                    setLogos({
                        desktop: settings.logoDesktop || '',
                        mobile: settings.logoMobile || '',
                        report: settings.logoReport || '',
                        favicon: settings.favicon || ''
                    });
                }
                if (settings.featureFlags) {
                    setFeatureFlags({
                        ...settings.featureFlags,
                        promotionImage: settings.promotionImage,
                        promotionUrl: settings.promotionUrl
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching theme settings:', error);
            // Fallback to defaults already in state
            applyTheme(themeColors);
        }
    };

    const applyTheme = (colors) => {
        if (!colors) return;

        const root = document.documentElement;
        if (colors.primary) root.style.setProperty('--theme-primary', colors.primary);
        if (colors.secondary) root.style.setProperty('--theme-secondary', colors.secondary);
        if (colors.accent) root.style.setProperty('--theme-accent', colors.accent);
    };

    return (
        <ThemeContext.Provider value={{ themeColors, logos, navBadges, exploreServices, featureFlags, setExploreServices, applyTheme, fetchTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
