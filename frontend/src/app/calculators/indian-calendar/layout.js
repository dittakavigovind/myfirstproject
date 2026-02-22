import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('indian-calendar', {
        title: 'Indian Calendar | Hindu Tithi & Festivals',
        description: 'View the Hindu Calendar with Tithi, Nakshatra, Yoga, and Karan. Check dates for major Indian festivals and fasting days.',
        keywords: ['Indian Calendar', 'Hindu Calendar', 'Tithi', 'Festivals', 'Panchang', 'Vrat Dates']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
