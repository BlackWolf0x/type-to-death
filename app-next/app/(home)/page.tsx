import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<>
			<Button size="lg" className="w-full md:w-[158px]">
				Click Me!
			</Button>
			<Button variant="outline" size="lg" className="w-full md:w-[158px]">
				Outline Button
			</Button>
			<Button variant="destructive" size="lg" className="w-full md:w-[158px]">
				Destructive
			</Button>
		</>
	);
}
