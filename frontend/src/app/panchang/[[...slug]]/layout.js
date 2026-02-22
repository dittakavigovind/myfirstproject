export async function generateMetadata(props) {
    // Await params if necessary (Next.js 15+ sometimes treats params as a promise, but usually accessible on props.params in 14. 
    // Safest to access props.params directly or via await depending on version, assuming Next.js 13/14 standard here)
    const params = props.params;
    console.log('[DEBUG] generateMetadata Params:', JSON.stringify(params, null, 2));

    try {
        // User requested independent SEO for this route, and the slug includes brackets/slashes in DB
        const slug = encodeURIComponent('panchang/[[...slug]]');
        const res = await fetch(`http://localhost:5000/api/seo/${slug}`, {
            next: { revalidate: 0 }
        });

        let seo = {};
        if (res.ok) {
            const data = await res.json();
            seo = data.data || {};
        } else {
            console.error('[SEO] Fallback for panchang Failed to fetch');
        }

        // Base values
        let title = seo.metaTitle || 'Today\'s Panchang for {city} on {date} | Way2Astro';
        let description = seo.metaDescription || 'Get detailed daily Panchang, Tithi, Nakshatra, and Auspicious Timings for {city} on {date}.';
        let keywords = seo.metaKeywords || ['panchang', 'hindu calendar', 'tithi', 'nakshatra'];
        let canonical = seo.canonicalUrl || 'https://www.way2astro.com/today-panchang';

        // Dynamic Injection
        if (params && params.slug && params.slug.length >= 2) {
            const [cityParam, dateParam, monthParam, yearParam] = params.slug;
            const city = decodeURIComponent(cityParam || '');

            let day, month, year;
            let dateStr = '';

            // Handle New Format: Kavali/09-February-2026
            if (params.slug.length === 2 && dateParam.includes('-')) {
                const parts = dateParam.split('-');
                if (parts.length === 3) {
                    [day, month, year] = parts;
                    dateStr = dateParam;
                }
            }
            // Handle Old Format: Kavali/09/02/2026
            else if (params.slug.length === 4) {
                day = dateParam;
                month = monthParam;
                year = yearParam;
                dateStr = `${day}-${month}-${year}`;
            }

            if (city && day && month && year) {
                // Template Replacement Helper
                const replacePlaceholders = (text) => {
                    if (!text || typeof text !== 'string') return text;
                    // This part of the instruction seems to be an incomplete or misplaced snippet.
                    // The original function only performs string replacements.
                    // If date parsing is intended, it needs to be structured correctly.
                    // For now, I'll assume the user intended to ensure parseInt uses radix 10 if it were to be used.
                    // As there's no direct parseInt for date components here, I'll keep the existing logic.
                    return text
                        .replace(/{city}|\[city\]/gi, city)
                        .replace(/{date}|\[date\]/gi, dateStr)
                        .replace(/{day}|\[day\]/gi, day)
                        .replace(/{month}|\[month\]/gi, month)
                        .replace(/{year}|\[year\]/gi, year);
                };

                // Apply replacements to fetched SEO data
                title = replacePlaceholders(seo.metaTitle || title);
                description = replacePlaceholders(seo.metaDescription || description);

                // Keywords handling
                let seoKeywords = seo.metaKeywords;
                if (typeof seoKeywords === 'string') {
                    keywords = replacePlaceholders(seoKeywords);
                } else if (Array.isArray(seoKeywords)) {
                    keywords = seoKeywords.map(k => replacePlaceholders(k));
                } else {
                    const dynamicKw = [`panchang in ${city}`, `panchang ${dateStr}`, `${city} panchang`];
                    keywords = [...(Array.isArray(keywords) ? keywords : []), ...dynamicKw];
                }

                canonical = `https://www.way2astro.com/panchang/${cityParam}/${dateStr}`;
            }
        }

        return {
            title: title,
            description: description,
            keywords: keywords,
            openGraph: {
                title: seo.ogTitle ? `${seo.ogTitle} - ${params?.slug ? decodeURIComponent(params.slug[0]) : ''}` : title,
                description: seo.ogDescription || description,
                images: seo.ogImage ? [{ url: seo.ogImage }] : [],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: seo.twitterTitle ? `${seo.twitterTitle} - ${params?.slug ? decodeURIComponent(params.slug[0]) : ''}` : title,
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
