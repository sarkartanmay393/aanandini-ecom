/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@aanandini/ui'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

module.exports = nextConfig;
