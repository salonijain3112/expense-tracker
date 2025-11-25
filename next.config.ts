import type { NextConfig } from "next";

const repo = process.env.NODE_ENV === 'production' ? '/expense-tracker' : '';

const nextConfig: NextConfig = {
    output: 'export',
    trailingSlash: true,
    basePath: repo,
    assetPrefix: repo ? `${repo}/` : undefined,
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
    },
};

export default nextConfig;
