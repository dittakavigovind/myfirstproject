/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    }
}

// Only use 'export' in production to allow rewrites/middleware in development
if (process.env.NODE_ENV === 'production') {
    nextConfig.output = 'export';
} else {
    nextConfig.rewrites = async () => {
        return [
            {
                source: '/astrology-session/:id/',
                destination: '/astrology-session/chat-session/',
            },
        ];
    };
}

module.exports = nextConfig
