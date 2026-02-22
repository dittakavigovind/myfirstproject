import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('talk', {
        title: 'Talk to Astrologer | Way2Astro',
        description: 'Connect with expert astrologers on call for instant solutions.'
    });
}

export default function Layout({ children }) {
    return children;
}
