import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('numerology-calculator', {
        title: 'Numerology Calculator | Life Path & Destiny Number',
        description: 'Discover your Life Path Number, Destiny Number, and Soul Urge Number with our free Numerology Calculator.',
        keywords: ['Numerology', 'Life Path Number', 'Destiny Number', 'Numerology Reading', 'Name Numerology']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
