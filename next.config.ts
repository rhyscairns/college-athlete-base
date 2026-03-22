import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    // Disable ESLint during production builds (warnings won't block)
    eslint: {
        ignoreDuringBuilds: true,
    },
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
