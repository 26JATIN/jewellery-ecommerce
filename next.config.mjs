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
        ],
        qualities: [75, 90, 100],
        formats: ['image/avif', 'image/webp'],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        }
    },
};

export default nextConfig;
