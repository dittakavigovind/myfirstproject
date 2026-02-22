import { generateSeoMetadata } from '../../lib/seoApi';
import HoroscopeSelectClient from '../../components/horoscope/HoroscopeSelectClient';

export async function generateMetadata() {
    return generateSeoMetadata('horoscope', {
        title: "Daily Horoscope - Way2Astro",
        description: "Get your free daily, weekly, and monthly horoscope predictions for all zodiac signs. Accurate vedic astrology insights.",
        openGraph: {
            images: ['/horoscope-cover.png']
        }
    });
}

export default function HoroscopeSelect() {
    return <HoroscopeSelectClient />;
}
