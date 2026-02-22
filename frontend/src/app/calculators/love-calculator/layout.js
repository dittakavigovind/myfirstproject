import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('love-calculator', {
        title: 'Love Calculator | Check Your Love Compatibility',
        description: 'Calculate love compatibility percentage between you and your partner using name and zodiac analysis.',
        keywords: ['Love Calculator', 'Love Compatibility', 'Relationship Match', 'Zodiac Love Match']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
