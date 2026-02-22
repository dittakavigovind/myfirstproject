import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('sun-sign-calculator', {
        title: 'Sun Sign Calculator | Western Zodiac Sign',
        description: 'Find your Western Zodiac Sun Sign based on your date of birth. Discover your core personality traits.',
        keywords: ['Sun Sign', 'Zodiac Sign', 'Western Astrology', 'Star Sign']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
