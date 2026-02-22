import { resolveImageUrl } from './urlHelper';

export async function getSEOMetadata(slug, defaultMetadata = {}) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.way2astro.com';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    let meta = {
        title: defaultMetadata.title || 'Way2Astro | Vedic Astrology',
        description: defaultMetadata.description || 'Premium Astrology Consultations, Kundli & Daily Horoscopes.',
        keywords: defaultMetadata.keywords || [],
        openGraph: {
            title: defaultMetadata.title || 'Way2Astro',
            description: defaultMetadata.description || 'Way2Astro Astrology Services',
            url: `${baseUrl}/${slug}`,
            type: 'website',
            images: ['/logo.png']
        }
    };

    try {
        // Fetch Site Settings for Logo/Favicon
        const settingsRes = await fetch(`${apiUrl}/site-settings`, { next: { revalidate: 60 } });
        const settingsData = await settingsRes.json();
        let iconUrl = '/logo.png';

        if (settingsData.success && settingsData.settings) {
            const { logoMobile, logoDesktop, favicon } = settingsData.settings;
            const logo = favicon || logoMobile || logoDesktop;
            if (logo) iconUrl = resolveImageUrl(logo);
        }

        // Fetch Specific Page Content
        const contentRes = await fetch(`${apiUrl}/page-content/${slug}`, { next: { revalidate: 60 } });
        const contentData = await contentRes.json();

        if (contentData.success && contentData.data) {
            const { metaTitle, metaDescription, keywords } = contentData.data;

            if (metaTitle) {
                meta.title = metaTitle;
                meta.openGraph.title = metaTitle;
            }

            if (metaDescription) {
                meta.description = metaDescription;
                meta.openGraph.description = metaDescription;
            }

            if (keywords) {
                // Handle both array and string (comma separated)
                if (Array.isArray(keywords)) {
                    meta.keywords = keywords;
                } else if (typeof keywords === 'string') {
                    meta.keywords = keywords.split(',').map(k => k.trim());
                }
            }
        }

        meta.icons = {
            icon: iconUrl,
            shortcut: iconUrl,
            apple: iconUrl,
        };

    } catch (error) {
        console.error(`Error fetching SEO for ${slug}:`, error);
    }

    return meta;
}
