import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('mangal-dosha', {
        title: "Mangal Dosha Analysis | Way2Astro",
        description: "Analyze the influence of Mars (Mangal) on your horoscope and relationship compatibility.",
    });
}

export default function MangalDoshaLayout({ children }) {
    return <>{children}</>;
}
