import { Suspense } from 'react';
import { API_BASE } from '../../../../lib/urlHelper';
import BlogPostClient from '../category/article/BlogPostClient';

// This function is required for static export to know which paths to generate
export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_BASE}/blog/posts?status=published`);
        const data = await res.json();

        if (data.success && data.data) {
            return data.data.map((post) => ({
                slug: post.slug,
            }));
        }
    } catch (error) {
        console.error('Error fetching dynamic params for blog posts:', error);
    }
    return [];
}

// Generate dynamic metadata for each blog post
export async function generateMetadata({ params }) {
    const { slug } = params;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://way2astro.com';

    try {
        const res = await fetch(`${API_BASE}/blog/posts/${slug}`);
        const data = await res.json();

        if (data.success && data.data) {
            const post = data.data;
            const title = `${post.metaTitle || post.title} | Way2Astro`;
            const description = post.metaDescription || post.excerpt || (post.content ? post.content.substring(0, 160).replace(/(<([^>]+)>)/gi, "") : "Read the latest astrology insights on Way2Astro.");

            let imageUrl = `${baseUrl}/logo.png`;
            if (post.featuredImage) {
                if (post.featuredImage.startsWith('http')) {
                    imageUrl = post.featuredImage.replace(/http:\/\/(localhost|192\.168\.29\.133):5000/, 'https://api.way2astro.com');
                } else {
                    const apiDomain = 'https://api.way2astro.com';
                    const relativePath = post.featuredImage.startsWith('/') ? post.featuredImage : `/${post.featuredImage}`;
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
                metadataBase: new URL(baseUrl),
                openGraph: {
                    title,
                    description,
                    url: `${baseUrl}/blog/article/${slug}/`,
                    images: [imageUrl],
                    type: 'article',
                    siteName: 'Way2Astro',
                },
                twitter: {
                    card: 'summary_large_image',
                    title,
                    description,
                    images: [imageUrl],
                },
            };
        }
    } catch (error) {
        console.error('Error generating dynamic metadata for blog:', error);
    }

    return {
        title: 'Blog | Way2Astro',
        description: "Explore our latest articles and updates on Vedic Astrology.",
    };
}

export default async function BlogPostDynamicPage({ params }) {
    const { slug } = params;

    // Fetch data for the client component
    let post = null;
    try {
        const res = await fetch(`${API_BASE}/blog/posts/${slug}`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success) post = data.data;
    } catch (e) {
        console.error("Error fetching post for dynamic page:", e);
    }

    if (!post) {
        return <div className="p-20 text-center font-bold text-slate-500">Article Not Found</div>;
    }

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">Loading Article...</div>}>
            <BlogPostClient post={post} />
        </Suspense>
    );
}
