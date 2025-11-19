import { Input } from "../ui/input";
import { useAppStore } from "../../stores/appStore";

export function Game() {
	const showMainMenu = useAppStore((state) => state.showMainMenu);

	return (
		<div className={`pointer-events-auto fixed bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-background z-10 p-4 ${showMainMenu ? 'hidden' : ''}`}>

			<Input className=" pointer-events-auto" />

		</div>
	);
}
