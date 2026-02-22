import { generateSeoMetadata } from '../../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('matchmaking/zodiac-compatibility', {
        title: "Zodiac Compatibility | Love, Sex, Friendship & Communication | Way2Astro",
        description: "Discover the cosmic connection between any two zodiac signs. Detailed analysis of love, sex, friendship, and communication styles.",
    });
}

export default function ZodiacCompatibilityLayout({ children }) {
    return <section className="zodiac-compatibility-root">{children}</section>;
}
