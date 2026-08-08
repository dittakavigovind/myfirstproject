'use client';

import { useEffect } from 'react';
import API from '../lib/api';

export default function SiteVisitTracker() {
    useEffect(() => {
        // Only run once per session
        if (!sessionStorage.getItem('site_visit_tracked')) {
            API.post('/analytics/visit')
                .then(() => {
                    sessionStorage.setItem('site_visit_tracked', 'true');
                })
                .catch(err => {
                    console.error('Failed to track site visit', err);
                });
        }
    }, []);

    return null; // Component does not render anything
}
