import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('weekly-horoscope', {
        title: "Free Weekly Horoscope Predictions | Way2Astro",
        description: "Get your weekly zodiac sign insights and astrological guidance for the week.",
    });
}

export default function WeeklyHoroscopeLayout({ children }) {
    return <>{children}</>;
}
