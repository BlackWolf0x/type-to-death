import { HomeBanner } from "@/components/home-banner";
import { ModalAuth } from "@/components/modal-auth";

export default function Home() {
	return (
		<div className="min-h-screen bg-black">
			<HomeBanner />
			<ModalAuth />
		</div>
	);
}
