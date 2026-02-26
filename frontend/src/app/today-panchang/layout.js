export async function generateMetadata() {
    return {
        title: 'Today\'s Panchang | Way2Astro',
        description: 'Get today\'s detailed Panchang, Tithi, Nakshatra and auspicious timings.',
        keywords: ['panchang', 'hindu calendar', 'tithi', 'nakshatra', 'auspicious timings'],
        alternates: {
            canonical: 'https://www.way2astro.com/today-panchang'
        }
    };
}

export default function Layout({ children }) {
    return children;
}
