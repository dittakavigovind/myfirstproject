import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('dasha-periods', { // Cleaned slug
        title: 'Vimshottari Dasha Calculator | Planetary Periods',
        description: 'Calculate your current Vimshottari Dasha, Bhukti, and Antardasha periods. Understand the influence of planetary periods on your life.',
        keywords: ['Vimshottari Dasha', 'Mahadasha', 'Antardasha', 'Planetary Periods', 'Vedic Astrology']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
