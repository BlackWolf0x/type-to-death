import { HomeBanner } from "@/components/home-banner";
import { AuthModal } from "@/components/modals/AuthModal";

export default function Home() {
	return (
		<div className="min-h-screen bg-black">
			<HomeBanner />
			<AuthModal />
		</div>
	);
}
