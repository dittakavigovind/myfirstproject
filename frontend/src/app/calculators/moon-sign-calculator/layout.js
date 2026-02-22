import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('moon-sign-calculator', {
        title: 'Moon Sign Calculator | Find Your Rashi',
        description: 'Calculate your Moon Sign (Rashi) according to Vedic Astrology. Understand your emotional nature and mind.',
        keywords: ['Moon Sign', 'Rashi Calculator', 'Vedic Moon Sign', 'Janma Rashi']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
