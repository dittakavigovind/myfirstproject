import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('yogini-dasha', {
        title: 'Yogini Dasha Calculator | Vedic Dasha System',
        description: 'Calculate your Yogini Dasha periods. Another powerful dasha system in Vedic Astrology for timing events.',
        keywords: ['Yogini Dasha', 'Vedic Astrology', 'Dasha System', 'Yogini Dasha Calculation']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
