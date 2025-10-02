/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 'media.istockphoto.com'],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        }
    }
};

export default nextConfig;
