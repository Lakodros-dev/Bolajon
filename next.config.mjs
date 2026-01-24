/** @type {import('next').NextConfig} */
const nextConfig = {
    // Allow large file uploads (500MB for videos)
    experimental: {
        serverActions: {
            bodySizeLimit: '500mb',
        },
        optimizePackageImports: ['lucide-react'], // Optimize icon imports
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

    // Disable caching in development
    onDemandEntries: {
        maxInactiveAge: 0, // Disable caching
        pagesBufferLength: 0,
    },

    // Cache headers for static files
    async headers() {
        const isDev = process.env.NODE_ENV === 'development';
        
        return [
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
