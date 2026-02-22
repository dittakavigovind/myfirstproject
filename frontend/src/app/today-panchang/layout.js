import { generateSeoMetadata } from '../../lib/seoApi';
import { API_BASE } from '../../lib/urlHelper';

export async function generateMetadata() {
    try {
        const res = await fetch(`${API_BASE}/seo/today-panchang`, {
            next: { revalidate: 0 }
        });

        let seo = {};
        if (res.ok) {
            const data = await res.json();
            seo = data.data || {};
        }

        // Default / Current Values
        const now = new Date();
        const city = 'Hyderabad'; // Default city for the main page
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateStr = `${day}-${month}-${year}`;

        // Template Replacement Helper
        const replacePlaceholders = (text) => {
            if (!text || typeof text !== 'string') return text;
            return text
                .replace(/{city}|\[city\]/gi, city)
                .replace(/{date}|\[date\]/gi, dateStr)
                .replace(/{day}|\[day\]/gi, day)
                .replace(/{month}|\[month\]/gi, month)
                .replace(/{year}|\[year\]/gi, year);
        };

        let title = replacePlaceholders(seo.metaTitle || 'Today\'s Panchang {date} | Way2Astro');
        let description = replacePlaceholders(seo.metaDescription || 'Get today\'s detailed Panchang for {city} on {date}.');

        let keywords = seo.metaKeywords;
        if (typeof keywords === 'string') {
            keywords = replacePlaceholders(keywords);
        } else if (Array.isArray(keywords)) {
            keywords = keywords.map(k => replacePlaceholders(k));
        }

        return {
            title: title,
            description: description,
            keywords: keywords,
            openGraph: {
                title: seo.ogTitle ? replacePlaceholders(seo.ogTitle) : title,
                description: seo.ogDescription ? replacePlaceholders(seo.ogDescription) : description,
                images: seo.ogImage ? [{ url: seo.ogImage }] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: seo.twitterTitle ? replacePlaceholders(seo.twitterTitle) : title,
                description: seo.twitterDescription ? replacePlaceholders(seo.twitterDescription) : description,
                images: seo.twitterImage ? [seo.twitterImage] : [],
            },
            alternates: {
                canonical: seo.canonicalUrl ? replacePlaceholders(seo.canonicalUrl) : 'https://www.way2astro.com/today-panchang'
            }
        };
    } catch (e) {
        console.error('SEO Error today-panchang:', e);
        return {
            title: 'Today\'s Panchang | Way2Astro',
            description: 'Get today\'s detailed Panchang, Tithi, Nakshatra and auspicious timings.'
        };
    }
}

export default function Layout({ children }) {
    return children;
}
