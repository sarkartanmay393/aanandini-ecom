/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@anandibi/ui'],
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
