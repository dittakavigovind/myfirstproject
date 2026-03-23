import HoraMuhuratClient from './HoraMuhuratClient';

export async function generateMetadata({ searchParams }) {
    const city = searchParams.city || 'New Delhi';
    const dateParam = searchParams.date || new Date().toISOString().split('T')[0];
    
    // Format date for display in title (e.g., 23-Mar-2026)
    const d = new Date(dateParam);
    const dateStr = isNaN(d.getTime()) 
        ? dateParam 
        : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

    const title = `Today Hora Muhurat - ${dateStr} - ${city} | Way2Astro`;
    const description = `Get precise auspicious and inauspicious Hora timings for ${dateStr} in ${city}. Plan your important activities with our daily celestial almanac for effective results.`;

    return {
        title,
        description,
        alternates: {
            canonical: `https://way2astro.com/today-hora-muhurat?city=${encodeURIComponent(city)}&date=${dateParam}`,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://way2astro.com/today-hora-muhurat?city=${encodeURIComponent(city)}&date=${dateParam}`,
        }
    };
}

export default function Page() {
    return <HoraMuhuratClient />;
}
