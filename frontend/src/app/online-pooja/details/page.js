import { Suspense } from 'react';
import { resolveImageUrl, API_BASE } from '../../../lib/urlHelper';
import TempleDetailClient from './TempleDetailClient';

// Static metadata for export.
// Dynamic SEO based on search parameters is not supported with output: 'export'
export const metadata = {
    title: 'Online Pooja | Way2Astro',
    description: "Book authentic Temple Sevas and Poojas online. Get blessings from top temples across India. Prasadam delivered to your doorstep.",
};

export default function TempleDetailPage() {
    return (
        <Suspense fallback={<div>Loading Temple Details...</div>}>
            <TempleDetailClient />
        </Suspense>
    );
}
