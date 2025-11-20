import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/appStore";

export function BackButton() {
    const showMainMenu = useAppStore((state) => state.showMainMenu);
    const setShowMainMenu = useAppStore((state) => state.setShowMainMenu);

    // Hide button when main menu is visible
    if (showMainMenu) {
        return null;
    }

    return (
        <Button
            onClick={() => setShowMainMenu(true)}
            variant="outline"
            className="fixed top-4 left-4 z-20 flex items-center gap-2"
        >
            <ArrowLeft className="size-4" />
            Back to Menu
        </Button>
    );
}
