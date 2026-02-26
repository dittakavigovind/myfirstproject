import { API_BASE } from "./urlHelper";

/**
 * Fetches SEO data for a specific page slug.
 * @param {string} slug - The page slug to fetch SEO data for.
 * @returns {Promise<object|null>} - The SEO data object or null if not found.
 */
export async function fetchSeoData(slug) {
    try {
        const { data } = await API.get(`/seo/${slug}`);
        if (data.success) {
            return data.data;
        }
        return null;
    } catch (error) {
        console.warn(`Failed to fetch SEO data for slug: ${slug}`, error.response?.status === 404 ? 'Not Found' : error?.message);
        return null; // Return null on error to allow fallback
    }
}

/**
 * Generates the Metadata object for Next.js App Router.
 * @param {string} slug - The page slug.
 * @param {object} defaultMeta - Fallback metadata.
 * @returns {Promise<object>} - Next.js Metadata object.
 */
export async function generateSeoMetadata(slug, defaultMeta = {}) {
    // In Next.js App Router (Server Components), we can't use our Axios instance directly 
    // if it relies on browser-only features (like localStorage for auth). 
    // But for public GET requests, it might be fine IF 'api.js' is universal.
    // HOWEVER, standard practice for Server Components is pure fetch.

    // Let's use a direct fetch to the backend URL for Server Side generation.
    // Env var for backend URL is needed.
    const baseUrl = API_BASE;

    console.log(`[SEO Debug] Fetching for slug: ${slug} from ${baseUrl}/seo/${slug}`);

    try {
        const res = await fetch(`${baseUrl}/seo/${slug}`);

        console.log(`[SEO Debug] Response status: ${res.status}`);

        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();

        console.log(`[SEO Debug] Data received:`, json.success);

        if (json.success && json.data) {
            const seo = json.data;
            return {
                title: seo.metaTitle,
                description: seo.metaDescription,
                applicationName: 'Way2Astro',
                generator: 'Next.js',
                keywords: seo.metaKeywords,
                authors: [{ name: seo.metaAuthor }],
                robots: {
                    index: true,
                    follow: true,
                    googleBot: {
                        index: true,
                        follow: true,
                    },
                },
                alternates: {
                    canonical: seo.canonicalUrl || undefined,
                },
                openGraph: {
                    title: seo.ogTitle || seo.metaTitle,
                    description: seo.ogDescription || seo.metaDescription,
                    siteName: 'Way2Astro',
                    images: seo.ogImage ? [{ url: seo.ogImage, width: 1200, height: 630 }] : defaultMeta.openGraph?.images,
                    type: seo.ogType || 'website',
                    locale: 'en_US',
                },
                twitter: {
                    card: seo.twitterCard || 'summary_large_image',
                    title: seo.twitterTitle || seo.metaTitle,
                    description: seo.twitterDescription || seo.metaDescription,
                    images: seo.twitterImage ? [seo.twitterImage] : defaultMeta.twitter?.images,
                }
            };
        }
    } catch (error) {
        console.warn(`[SEO] Fallback for ${slug}`, error?.message);
    }

    return defaultMeta;
}
