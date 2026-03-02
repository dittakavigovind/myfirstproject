import { resolveImageUrl, API_BASE } from '../../../lib/urlHelper';
import TempleDetailClient from './TempleDetailClient';

export async function generateMetadata({ searchParams }) {
    const slug = searchParams.slug;
    if (!slug) return { title: 'Online Pooja | Way2Astro' };

    try {
        const response = await fetch(`${API_BASE}/pooja/temples/${slug}`, { next: { revalidate: 60 } });
        const data = await response.json();

        if (data.success && data.data) {
            const temple = data.data;
            return {
                title: temple.metaTitle || temple.name,
                description: temple.metaDescription || temple.seoDescription || temple.description.substring(0, 160),
                keywords: temple.metaKeywords || '',
                openGraph: {
                    title: temple.ogTitle || temple.name,
                    description: temple.ogDescription || temple.metaDescription || temple.seoDescription || temple.description.substring(0, 160),
                    images: temple.ogImage ? [temple.ogImage] : temple.images?.length > 0 ? [resolveImageUrl(temple.images[0])] : [],
                    type: 'website',
                },
                twitter: {
                    card: 'summary_large_image',
                    title: temple.twitterTitle || temple.ogTitle || temple.name,
                    description: temple.twitterDescription || temple.ogDescription || temple.metaDescription || temple.seoDescription || temple.description.substring(0, 160),
                    images: temple.twitterImage ? [temple.twitterImage] : temple.ogImage ? [temple.ogImage] : temple.images?.length > 0 ? [resolveImageUrl(temple.images[0])] : [],
                }
            };
        }
    } catch (e) {
        console.error("Failed to generate metadata", e);
    }

    return { title: 'Online Pooja | Way2Astro' };
}

export default function TempleDetailPage() {
    return <TempleDetailClient />;
}
