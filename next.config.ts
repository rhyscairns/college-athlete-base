import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    // Image optimization configuration
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Exclude infrastructure directory from Next.js compilation
    webpack: (config, { isServer }) => {
        config.watchOptions = {
            ...config.watchOptions,
            ignored: ['**/infrastructure/**', '**/node_modules/**'],
        };
        return config;
    },
};

export default nextConfig;
