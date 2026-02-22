import { generateSeoMetadata } from '../../../lib/seoApi';
import SignClient from '../../../components/horoscope/SignClient';

export async function generateMetadata({ params }) {
    const sign = params.sign;

    // Fetch SEO template for "horoscope/[sign]"
    // The slug in encoded form: horoscope%2F%5Bsign%5D
    const slug = encodeURIComponent('horoscope/[sign]');

    try {
        const res = await fetch(`http://localhost:5000/api/seo/${slug}`, {
            next: { revalidate: 0 }
        });

        let seo = {};
        if (res.ok) {
            const data = await res.json();
            seo = data.data || {};
        } else {
            console.warn('[SEO] Failed to fetch horoscope template, using defaults.');
        }

        // Default / Current Values
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-'); // Format: DD-MM-YYYY

        // Capitalize Sign
        const capitalizedSign = sign.charAt(0).toUpperCase() + sign.slice(1);

        // Template Replacement Helper
        const replacePlaceholders = (text) => {
            if (!text || typeof text !== 'string') return text;
            return text
                .replace(/{sign}|\[sign\]/gi, capitalizedSign)
                .replace(/{date}|\[date\]/gi, dateStr);
        };

        const title = replacePlaceholders(seo.metaTitle || `${capitalizedSign} Horoscope | Way2Astro`);
        const description = replacePlaceholders(seo.metaDescription || `Daily Horoscope for ${capitalizedSign} on ${dateStr}`);

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
                canonical: seo.canonicalUrl ? replacePlaceholders(seo.canonicalUrl) : `https://www.way2astro.com/horoscope/${sign}`
            }
        };

    } catch (e) {
        console.error('SEO Error horoscope/[sign]:', e);
        return {
            title: `${sign} Daily Horoscope`,
            description: `Daily predictions for ${sign}`
        };
    }
}

export default function HoroscopeDetail() {
    return <SignClient />;
}
