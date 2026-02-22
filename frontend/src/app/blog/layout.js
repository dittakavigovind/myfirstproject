import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('blog', {
        title: "Astrology Blog | Vedic Insights & News | Way2Astro",
        description: "Read latest blogs on Vedic astrology, planetary transits, and spiritual guidance.",
    });
}

export default function BlogLayout({ children }) {
    return <>{children}</>;
}
