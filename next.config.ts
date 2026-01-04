import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
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
