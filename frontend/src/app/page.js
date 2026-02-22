import { generateSeoMetadata } from '../lib/seoApi';
import HomeClient from '../components/home/HomeClient';

export async function generateMetadata() {
    return generateSeoMetadata('home', {
        title: "Way2Astro - Your Destiny, Decoded",
        description: "India's #1 Astrology Platform. Chat with Vedic experts, get free Kundli, daily horoscope and more.",
        openGraph: {
            images: ['/logo.png']
        }
    });
}

export default function Home() {
    return <HomeClient />;
}
