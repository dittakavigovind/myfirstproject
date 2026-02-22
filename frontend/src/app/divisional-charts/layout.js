import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('divisional-charts', {
        title: 'Divisional Charts Calculator | Varga Chakras',
        description: 'Generate detailed Divisional Charts (Varga Chakras) including Hora, Drekkana, Saptamsa, Navamsa, Dasamsa and more for deep astrological analysis.',
        keywords: ['Divisional Charts', 'Varga Chakra', 'Shodashvarga', 'D9 Chart', 'Navamsa', 'Dasamsa', 'Vedic Astrology']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
