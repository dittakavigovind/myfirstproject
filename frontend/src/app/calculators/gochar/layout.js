import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('gochar', {
        title: 'Planetary Transits (Gochar) | Current Planetary Positions',
        description: 'Track current planetary transits (Gochar) and their effects on your moon sign. Daily planetary positions and movements.',
        keywords: ['Gochar', 'Planetary Transits', 'Current Planet Positions', 'Transit Effects', 'Vedic Astrology']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
