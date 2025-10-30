/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'media.istockphoto.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
        ],
        // Optimize image loading
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/avif', 'image/webp'],
        qualities: [75, 80, 90, 100], // Add quality configurations for Next.js 16
        minimumCacheTTL: 60, // Cache images for at least 60 seconds
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    // Compiler optimizations
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },
    // Production optimizations
    ...(process.env.NODE_ENV === 'production' ? {
        compress: true,
        productionBrowserSourceMaps: false,
        poweredByHeader: false,
        generateEtags: true,
    } : {
        // Development settings
        onDemandEntries: {
            maxInactiveAge: 25 * 1000,
            pagesBufferLength: 2,
        },
    }),
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        },
        optimizeCss: true,
        optimizePackageImports: ['framer-motion', 'lucide-react'],
    },
};

export default nextConfig;
