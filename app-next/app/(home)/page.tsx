import { HomeBanner } from "@/components/home-banner";
import { ModalAuth } from "@/components/modal-auth";
import { ModalCredits } from "@/components/modal-credits";
import { Button } from "@/components/ui/button";
import { UsernameCheck } from "@/components/username-check";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen bg-black">
			<HomeBanner />
			<UsernameCheck />
			<div className="fixed z-10 bottom-16 left-0 w-full h-14 px-20 flex justify-center gap-6">
				<ModalAuth />
				<Button size="lg" variant="secondary" className="shadow-sm shadow-white bg-secondary/80" asChild>
					<Link href="/calibration">
						<SlidersHorizontal /> Eye Calibration
					</Link>
				</Button>
				<ModalCredits />
			</div>
		</div>
	);
}
