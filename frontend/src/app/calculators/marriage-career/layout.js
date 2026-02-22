import { getSEOMetadata } from '@/lib/seoHelper';

export async function generateMetadata() {
    return await getSEOMetadata('marriage-career', {
        title: 'Marriage & Career Predictions | Vedic Astrology',
        description: 'Get free Vedic Astrology predictions for your marriage timing and career prospects based on your birth chart.',
        keywords: ['Marriage Timing', 'Career Prediction', 'Vedic Astrology', 'Marriage Calculator', 'Career Horoscope']
    });
}

export default function Layout({ children }) {
    return <>{children}</>;
}
