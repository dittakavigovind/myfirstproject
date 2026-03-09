import { generateSeoMetadata } from '../../lib/seoApi';
import DailyHoroscopeClient from '../../components/horoscope/DailyHoroscopeClient';

export async function generateMetadata() {
    return generateSeoMetadata('daily-horoscope', {
        title: "Daily Horoscope - Way2Astro",
        description: "Free daily horoscope predictions for all zodiac signs. Accurate vedic astrology insights.",
        openGraph: {
            images: ['/horoscope-cover.png']
        }
    });
}

export default function DailyHoroscope() {
    return <DailyHoroscopeClient />;
}
