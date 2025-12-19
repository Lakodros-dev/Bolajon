/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow large file uploads (500MB for videos)
    experimental: {
        serverActions: {
            bodySizeLimit: '500mb',
        },
    },

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        minimumCacheTTL: 60,
    },

    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },



    // Enable React strict mode for better performance
    reactStrictMode: false,

    // Reduce bundle size
    poweredByHeader: false,
};

export default nextConfig;
