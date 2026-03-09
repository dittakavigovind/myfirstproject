import { generateSeoMetadata } from '../../lib/seoApi';
import MonthlyHoroscopeClient from '../../components/horoscope/MonthlyHoroscopeClient';

export async function generateMetadata() {
    return generateSeoMetadata('monthly-horoscope', {
        title: "Monthly Horoscope - Way2Astro",
        description: "Get your free monthly horoscope predictions for all zodiac signs. Accurate vedic astrology insights.",
        openGraph: {
            images: ['/horoscope-cover.png']
        }
    });
}

export default function MonthlyHoroscope() {
    return <MonthlyHoroscopeClient />;
}
