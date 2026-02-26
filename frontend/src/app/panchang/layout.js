import { API_BASE } from '../../lib/urlHelper';

export async function generateMetadata() {
    try {
        const slug = encodeURIComponent('panchang/[[...slug]]');
        const res = await fetch(`${API_BASE}/seo/${slug}`);

        let seo = {};
        if (res.ok) {
            const data = await res.json();
            seo = data.data || {};
        }

        const title = seo.metaTitle || "Today's Panchang | Way2Astro";
        const description = seo.metaDescription || "Get detailed daily Panchang, Tithi, Nakshatra, and Auspicious Timings.";
        const keywords = seo.metaKeywords || ['panchang', 'hindu calendar', 'tithi', 'nakshatra', 'auspicious timings'];
        const canonical = seo.canonicalUrl || 'https://www.way2astro.com/today-panchang';

        return {
            title: title,
            description: description,
            keywords: keywords,
            openGraph: {
                title: seo.ogTitle || title,
                description: seo.ogDescription || description,
                images: seo.ogImage ? [{ url: seo.ogImage }] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: seo.twitterTitle || title,
                description: seo.twitterDescription || description,
                images: seo.twitterImage ? [seo.twitterImage] : [],
            },
            alternates: {
                canonical: canonical
            }
        };

    } catch (error) {
        console.error('[SEO] Error fetching panchang metadata:', error);
        return {
            title: 'Today Panchang | Way2Astro',
            description: 'Daily Panchang, Tithi, Nakshatra, Yoga, and Auspicious Timings.'
        };
    }
}

export default function PanchangLayout({ children }) {
    return (
        <>
            {children}
        </>
    );
}
