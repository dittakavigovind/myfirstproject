import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('astrologers', {
        title: "Talk to Best Astrologers Online | Way2Astro",
        description: "Consult with India's top Vedic astrologers for guidance on career, love, and life.",
    });
}

export default function AstrologersLayout({ children }) {
    return <>{children}</>;
}
