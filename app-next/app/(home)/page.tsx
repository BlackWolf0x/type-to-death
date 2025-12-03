import { HomeBanner } from "@/components/home-banner";
import { ModalAuth } from "@/components/modal-auth";
import { UsernameCheck } from "@/components/username-check";

export default function Home() {
	return (
		<div className="min-h-screen bg-black">
			<HomeBanner />
			<ModalAuth />
			<UsernameCheck />
		</div>
	);
}
