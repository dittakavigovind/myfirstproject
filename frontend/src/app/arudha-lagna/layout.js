
import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('arudha-lagna', {
        title: 'Arudha Lagna Calculator | Free Jaimini Astrology',
        description: 'Calculate your Arudha Lagna (AL) online for free. Understand how the world perceives you and analyze your status, career, and public image using Jaimini Astrology.',
        keywords: ['Arudha Lagna', 'Arudha Lagna Calculator', 'Jaimini Astrology', 'Vedic Astrology', 'Pada Lagna', 'Public Image Astrology']
    });
}

export default function ArudhaLagnaLayout({ children }) {
    return (
        <>
            {children}
        </>
    );
}
