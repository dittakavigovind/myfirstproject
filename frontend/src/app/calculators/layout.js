import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('calculators', {
        title: 'Astrology Calculators | Free Vedic Astrology Tools',
        description: 'Explore our wide range of free astrology calculators including Kundli, Matchmaking, Moon Sign, Sun Sign, Dasha Periods, and more.',
        keywords: ['Astrology Calculators', 'Free Kundli', 'Moon Sign', 'Sun Sign', 'Love Calculator', 'Vedic Astrology Tools']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
