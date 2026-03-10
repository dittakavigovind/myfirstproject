
const temple = {
    "_id": "69a1d693657281d890513948",
    "name": "Sree Seethaaramachandra Swamy",
    "images": [
        "https://api.way2astro.com/api/uploads/file-1772836536250.png",
        "https://api.way2astro.com/api/uploads/file-1772836569084.png"
    ],
    "description": "...",
    "slug": "sree-seethaaramachandra-swamy-vaari-devasthanam",
    "metaDescription": "Book Online Pooja at Bhadrachalam Sri Seetharamachandra Swamy Temple. Receive Archana, Akshantalu & Kalyana Prasadam delivered to your home.",
    "metaKeywords": "...",
    "metaTitle": "Online Pooja Bhadrachalam | Sri Rama Seva Booking",
    "ogDescription": "Book Online Pooja at Bhadrachalam Sri Seetharamachandra Swamy Temple. Receive Archana, Akshantalu & Kalyana Prasadam delivered to your home.",
    "ogTitle": "Online Pooja Bhadrachalam | Sri Rama Seva Booking",
    "ogImage": "https://api.way2astro.com/api/uploads/file-1773160412062.jpg"
};

const slug = temple.slug;
const baseUrl = 'https://way2astro.com';

function generateMetadataSim() {
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

    const metadata = {
        title,
        description,
        metadataBase: new URL(baseUrl),
        openGraph: {
            title,
            description,
            url: `${baseUrl}/online-pooja/details/${slug}/`,
            images: [imageUrl],
            type: 'website',
            siteName: 'Way2Astro',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };

    console.log(JSON.stringify(metadata, null, 2));
}

generateMetadataSim();
