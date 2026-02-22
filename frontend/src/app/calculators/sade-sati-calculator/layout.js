import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('sade-sati-calculator', {
        title: 'Shani Sade Sati Calculator | Saturn Transit Check',
        description: 'Check if you are going through Shani Sade Sati, Dhaiya, or Kantaka Shani. Get remedies and timeline.',
        keywords: ['Sade Sati', 'Shani Sade Sati', 'Saturn Transit', 'Sade Sati Report', 'Shani Dosha']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
