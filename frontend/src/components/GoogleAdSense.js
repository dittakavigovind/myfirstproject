'use strict';
'use client';

import Script from 'next/script';

export default function GoogleAdSense({ publisherId }) {
    if (!publisherId) return null;

    return (
        <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
