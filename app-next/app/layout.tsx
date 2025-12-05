import type { Metadata } from "next";
import { Geist, Geist_Mono, Metal_Mania } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { MobileWarning } from "@/components/mobile-warning";
import { PostHogProvider } from "./PostHogProvider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const metalMania = Metal_Mania({
	weight: "400",
	variable: "--font-metal-mania",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "𝕋𝕪𝕡𝕖 𝕋𝕠 𝔻𝕖𝕒𝕥𝕙",
	description: "A terrifying typing game where daily AI-generated stories push your speed and focus to the limit. Blink and the monster gets closer. Type fast, stay calm, and climb the leaderboard in this intense horror challenge.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body className={`${geistSans.variable} ${geistMono.variable} ${metalMania.variable} antialiased`} >
				<MobileWarning />
				<ConvexClientProvider>
					<PostHogProvider>
						{children}
					</PostHogProvider>
				</ConvexClientProvider>
			</body>
		</html>
	);
}
