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
};

export default nextConfig;
