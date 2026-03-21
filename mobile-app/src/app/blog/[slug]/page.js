import BlogDetailClient from "./BlogDetailClient";

export function generateStaticParams() {
    return [{ slug: 'latest' }];
}

export default function Page({ params }) {
    return <BlogDetailClient params={params} />;
}
