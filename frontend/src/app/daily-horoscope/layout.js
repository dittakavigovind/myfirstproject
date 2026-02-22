import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('daily-horoscope', {
        title: "Free Daily Horoscope Predictions | Way2Astro",
        description: "Check your free daily zodiac sign predictions and plan your day ahead.",
    });
}

export default function DailyHoroscopeLayout({ children }) {
    return <>{children}</>;
}
