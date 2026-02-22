import { generateSeoMetadata } from '../../lib/seoApi';

export async function generateMetadata() {
    return generateSeoMetadata('chat', {
        title: 'Chat with Astrologers | Way2Astro',
        description: 'Instant chat consultation with verified astrologers.'
    });
}

export default function Layout({ children }) {
    return children;
}
