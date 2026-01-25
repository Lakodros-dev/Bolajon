/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow large file uploads (500MB for videos)
    experimental: {
        serverActions: {
            bodySizeLimit: '500mb',
        },
        optimizePackageImports: ['lucide-react', 'react-bootstrap'], // Optimize imports
        // Enable faster navigation
        optimisticClientCache: true,
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
        formats: ['image/webp'], // Use WebP format
        minimumCacheTTL: 86400, // Cache images for 24 hours
    },

    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Enable React strict mode for better performance
    reactStrictMode: false,

    // Reduce bundle size
    poweredByHeader: false,

    // Optimize production builds
    swcMinify: true,

    // Optimize page loading
    onDemandEntries: {
        maxInactiveAge: 25 * 1000, // Keep pages in memory for 25 seconds
        pagesBufferLength: 5, // Keep 5 pages in buffer
    },

    // Cache headers for static files
    async headers() {
        const isDev = process.env.NODE_ENV === 'development';
        
        return [
            {
                source: '/video/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: isDev ? 'no-store, no-cache, must-revalidate' : 'public, max-age=86400, must-revalidate',
                    },
                    {
                        key: 'Accept-Ranges',
                        value: 'bytes',
                    },
                    {
                        key: 'Content-Type',
                        value: 'video/mp4',
                    },
                ],
            },
            {
                source: '/book/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: isDev ? 'no-store, no-cache, must-revalidate' : 'public, max-age=86400, must-revalidate',
                    },
                    {
                        key: 'Accept-Ranges',
                        value: 'bytes',
                    },
                ],
            },
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, no-cache, must-revalidate', // No cache for API
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: isDev ? 'no-store, no-cache, must-revalidate' : 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/uploads/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: isDev ? 'no-store, no-cache, must-revalidate' : 'public, max-age=86400, must-revalidate',
                    },
                ],
            },
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: isDev ? 'no-store, no-cache, must-revalidate' : 'public, max-age=0, must-revalidate',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
