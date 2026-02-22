import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('matchmaking', {
        title: "Kundli Matching | Gun Milan for Marriage | Way2Astro",
        description: "Check marital compatibility using ancient Vedic matchmaking (Gun Milan) principles.",
    });
}

export default function MatchmakingLayout({ children }) {
    return <>{children}</>;
}
