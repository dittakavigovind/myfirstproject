import Head from 'next/head';

/**
 * FAQ Schema Component
 * Renders JSON-LD Schema for Google Rich Snippets
 * @param {Array} items - Array of { question: string, answer: string }
 */
export default function FAQSchema({ items }) {
    if (!items || items.length === 0) return null;

    const schemaData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
    );
}
