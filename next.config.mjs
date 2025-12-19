/** @type {import('next').NextConfig} */
const nextConfig = {
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

    // Experimental features for faster builds
    experimental: {
        optimizePackageImports: ['@/components', '@/lib'],
    },

    // Enable React strict mode for better performance
    reactStrictMode: false,

    // Reduce bundle size
    poweredByHeader: false,
};

export default nextConfig;
