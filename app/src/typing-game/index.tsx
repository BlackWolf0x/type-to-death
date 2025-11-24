import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/stores/appStore";
import { useAutoFocus } from "@/hooks/useAutoFocus";

export function TypingGame() {
	const showMainMenu = useAppStore((state) => state.showMainMenu);
	const inputRef = useAutoFocus<HTMLInputElement>();

	// Refocus when menu is hidden
	useEffect(() => {
		if (!showMainMenu) {
			inputRef.current?.focus();
		}
	}, [showMainMenu]);

	return (
		<div className={`pointer-events-auto fixed z-10 -bottom-1 left-1/2 -translate-x-1/2 w-5xl space-y-6 bg-black/80 rounded-tl-2xl rounded-tr-2xl pt-10 pb-6 px-8 border-2 border-red-950 border-t border-t-red-500 ${showMainMenu ? "hidden" : ""}`}>

			<div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[calc(100%-60px)] h-px animate-pulse bg-linear-to-r from-red-400/50 to-red-500 -rotate-1" />
			<div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[calc(100%-150px)] h-px animate-pulse bg-linear-to-r from-red-400/50 to-red-500 rotate-1" />
			<div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] h-px animate-pulse bg-linear-to-r from-red-400/50 to-red-500" />

			{/* TEXT CONTAINER */}
			<div className="rounded-lg bg-orange-100 border-2 border-orange-300 text-black p-4 text-left text-lg font-mono">
				A zealot might be, for instance, an individual with a personal motive for revenge so overpowering that it ensures complete dedication to the cause. Or, through intensive training and psychological manipulation, an elite team of fanatic followers can be trained to sacrifice even their own lives to accomplish a given mission.
			</div>

			{/* INPUT FIELD */}
			<Input ref={inputRef} className="pointer-events-auto font-mono focus-visible:border-orange-100" />
		</div>
	);
}
