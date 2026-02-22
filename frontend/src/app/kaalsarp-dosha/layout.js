import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('kaalsarp-dosha', {
        title: "Kaalsarp Dosha Calculator | Way2Astro",
        description: "Check if your Kundli has Kaalsarp Dosha and discover effective Vedic remedies.",
    });
}

export default function KaalsarpDoshaLayout({ children }) {
    return <>{children}</>;
}
