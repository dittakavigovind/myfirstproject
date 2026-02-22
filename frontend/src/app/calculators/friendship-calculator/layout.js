import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('friendship-calculator', {
        title: 'Friendship Calculator | Check Compatibility',
        description: 'Check friendship compatibility between you and your friend based on zodiac signs and astrology.',
        keywords: ['Friendship Calculator', 'Best Friend Match', 'Zodiac Compatibility', 'Astrology Match']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
