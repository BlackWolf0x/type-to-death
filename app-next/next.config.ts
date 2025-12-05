import type { NextConfig } from "next";

// Extract hostname from NEXT_PUBLIC_CONVEX_URL (strip https://)
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || '';
const convexHostname = convexUrl.replace(/^https?:\/\//, '');

const nextConfig: NextConfig = {
	images: {
		qualities: [25, 50, 75],
		remotePatterns: [
			{
				protocol: 'https',
				hostname: convexHostname,
			},
		],
	},

	async rewrites() {
		return [
			{
				source: '/ingest/static/:path*',
				destination: 'https://us-assets.i.posthog.com/static/:path*',
			},
			{
				source: '/ingest/:path*',
				destination: 'https://us.i.posthog.com/:path*',
			},
		];
	},

	// This is required to support PostHog trailing slash API requests
	skipTrailingSlashRedirect: true,
};

export default nextConfig;
