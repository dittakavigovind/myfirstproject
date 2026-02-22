import BlogPostClient from './BlogPostClient';

// Helper to fetch data on server
async function getPost(slug) {
    // Determine API Base URL for server-side fetch
    // In production, use your actual domain. Localy, use localhost:5000 or the Next.js API route if proxying.
    // Assuming backend is at http://localhost:5000 based on previous code.
    const res = await fetch(`http://localhost:5000/api/blog/posts/${slug}`, {
        cache: 'no-store', // Ensure fresh data, or use 'force-cache' / revalidate for ISR
    });

    if (!res.ok) {
        // Handle 404 or errors
        return null;
    }

    const data = await res.json();
    return data.data; // Structure based on controller: res.json({ success: true, data: post })
}

export async function generateMetadata({ params }) {
    const post = await getPost(params.slug);

    if (!post) {
        return {
            title: 'Post Not Found - Way2Astro',
            description: 'The requested blog post could not be found.'
        };
    }

    // --- SEO Logic ---
    const seo = post.seo || {};

    // 1. Title Priority: Custom Meta Title -> Post Title
    const title = seo.metaTitle || post.title;

    // 2. Description Priority: Custom Meta Description -> Excerpt -> Content First 160 chars
    let description = seo.metaDescription;
    if (!description && post.excerpt) {
        description = post.excerpt;
    }
    if (!description && post.content) {
        const strippedContent = post.content.replace(/<[^>]+>/g, '');
        description = strippedContent.substring(0, 160).trim() + '...';
    }

    // 3. Open Graph Priority: Custom OG Title -> Meta Title -> Post Title
    const ogTitle = seo.ogTitle || title;
    const ogDescription = seo.ogDescription || description;

    // 4. Image Priority: Custom OG Image -> Featured Image
    // Ensure image URL is absolute if it's a local upload
    let ogImage = seo.ogImage || post.featuredImage;
    if (ogImage && !ogImage.startsWith('http')) {
        ogImage = `http://localhost:5000${ogImage}`;
    }

    return {
        title: title,
        description: description,
        keywords: seo.metaKeywords || '', // Add keywords support
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            images: ogImage ? [{ url: ogImage }] : [],
            type: 'article',
            url: `https://www.way2astro.com/blog/${post.categories?.[0]?.slug}/${post.slug}`, // Best practice to set OG URL
        },
        alternates: {
            canonical: seo.canonicalUrl || `https://www.way2astro.com/blog/${post.categories?.[0]?.slug}/${post.slug}`,
        }
    };
}

export default async function SinglePostPage({ params }) {
    const post = await getPost(params.slug);

    if (!post) {
        // You might want to trigger a proper Next.js notFound() here
        return <div className="p-20 text-center">Article Not Found</div>;
    }

    return <BlogPostClient post={post} />;
}
