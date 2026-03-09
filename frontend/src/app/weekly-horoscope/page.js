import { generateSeoMetadata } from '../../lib/seoApi';
import WeeklyHoroscopeClient from '../../components/horoscope/WeeklyHoroscopeClient';

export async function generateMetadata() {
    return generateSeoMetadata('weekly-horoscope', {
        title: "Weekly Horoscope - Way2Astro",
        description: "Get your free weekly horoscope predictions for all zodiac signs. Accurate vedic astrology insights.",
        openGraph: {
            images: ['/horoscope-cover.png']
        }
    });
}

export default function WeeklyHoroscope() {
    return <WeeklyHoroscopeClient />;
}
