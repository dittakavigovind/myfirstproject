import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('horoscope', {
        title: "Daily, Weekly & Monthly Horoscopes | Way2Astro",
        description: "Get accurate zodiac sign predictions for today, this week, and the entire month.",
    });
}

export default function HoroscopeLayout({ children }) {
    return <>{children}</>;
}
