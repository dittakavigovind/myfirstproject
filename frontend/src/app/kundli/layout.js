import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('kundli', {
        title: "Free Janam Kundli | Online Birth Chart | Way2Astro",
        description: "Generate your free Vedic Janam Kundli online. Get detailed birth chart analysis and predictions.",
    });
}

export default function KundliLayout({ children }) {
    return <>{children}</>;
}
