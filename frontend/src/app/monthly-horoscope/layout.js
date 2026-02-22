import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('monthly-horoscope', {
        title: "Free Monthly Horoscope Predictions | Way2Astro",
        description: "Check your monthly zodiac predictions and major astrological events for the month.",
    });
}

export default function MonthlyHoroscopeLayout({ children }) {
    return <>{children}</>;
}
