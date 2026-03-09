import { Suspense } from 'react';
import { API_BASE } from '../../../../lib/urlHelper';
import TempleDetailClient from '../TempleDetailClient';

// This function is required for static export to know which paths to generate
export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_BASE}/pooja/temples`);
        const data = await res.json();

        if (data.success && data.data) {
            return data.data.map((temple) => ({
                slug: temple.slug,
            }));
        }
    } catch (error) {
        console.error('Error fetching dynamic params for temples:', error);
    }
    return [];
}

// Generate dynamic metadata for each temple
export async function generateMetadata({ params }) {
    const { slug } = params;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://way2astro.com';

    try {
        const res = await fetch(`${API_BASE}/pooja/temples/${slug}`);
        const data = await res.json();

        if (data.success && data.data) {
            const temple = data.data;
            const title = `${temple.ogTitle || temple.name} | Way2Astro`;
            const description = temple.ogDescription || (temple.description ? temple.description.substring(0, 160).replace(/(<([^>]+)>)/gi, "") : "Book authentic Temple Sevas and Poojas online.");

            let imageUrl = `${baseUrl}/logo.png`;
            const imageSource = temple.ogImage || (temple.images && temple.images.length > 0 ? temple.images[0] : null);

            if (imageSource) {
                if (imageSource.startsWith('http')) {
                    imageUrl = imageSource.replace(/http:\/\/(localhost|192\.168\.29\.133):5000/, 'https://api.way2astro.com');
                } else {
                    const apiDomain = 'https://api.way2astro.com';
                    const relativePath = imageSource.startsWith('/') ? imageSource : `/${imageSource}`;
                    if (relativePath.startsWith('/uploads/')) {
                        imageUrl = `${apiDomain}/api${relativePath}`;
                    } else {
                        imageUrl = `${apiDomain}${relativePath}`;
                    }
                }
            }

            return {
                title,
                description,
                openGraph: {
                    title,
                    description,
                    url: `${baseUrl}/online-pooja/details/${slug}/`,
                    images: [
                        {
                            url: imageUrl,
                            width: 1200,
                            height: 630,
                            alt: temple.name,
                        },
                    ],
                    type: 'website',
                },
            };
        }
    } catch (error) {
        console.error('Error generating dynamic metadata:', error);
    }

    return {
        title: 'Online Pooja | Way2Astro',
        description: "Book authentic Temple Sevas and Poojas online.",
    };
}

export default function TempleDetailDynamicPage({ params }) {
    const { slug } = params;
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">Loading Temple Details...</div>}>
            <TempleDetailClient slug={slug} />
        </Suspense>
    );
}
