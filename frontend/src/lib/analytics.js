import API from './api';

const analytics = {
    /**
     * track event
     * @param {string} type - VIEW, CLICK, SHARE
     * @param {string} cardType - PANCHANG, CALENDAR, SHARE_BUTTON
     * @param {string} action - detail like 'whatsapp', 'download', 'cell_click'
     * @param {object} metadata - extra data
     */
    track: async (type, cardType, action, metadata = {}) => {
        try {
            // Check for guest ID in localStorage
            let guestId = localStorage.getItem('way2astro_guest_id');
            if (!guestId) {
                guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('way2astro_guest_id', guestId);
            }

            await API.post('/analytics/track', {
                type,
                cardType,
                action,
                metadata,
                guestId
            });
        } catch (error) {
            // Silent fail for analytics
            console.warn('Analytics Tracking Failed', error);
        }
    }
};

export default analytics;
