import { useState } from "react";
import { useAppStore } from "@/stores/appStore";
import { IntroModal } from "@/components/modals/IntroModal";
import { EyeTrackingModal } from "@/components/modals/EyeTrackingModal";
import { LeaderboardModal } from "@/components/modals/LeaderboardModal";

export function MainMenu() {
    const { showMainMenu, skipIntro, hideMainMenu, setSkipIntro } = useAppStore();
    const [showIntroModal, setShowIntroModal] = useState(false);

    const handleStartGame = () => {
        if (skipIntro) {
            hideMainMenu();
        } else {
            setShowIntroModal(true);
        }
    };

    const handleIntroClose = () => {
        setShowIntroModal(false);
        hideMainMenu();
    };

    if (!showMainMenu) {
        return null;
    }

    return (
        <>
            <div className="fixed z-40 top-0 left-0 right-0 bottom-0 bg-[#50000a] flex flex-col items-center justify-center gap-6 p-8">
                <header className="text-center">
                    <h1 className="text-6xl font-bold text-white mb-2">Type To Death</h1>
                </header>

                <div className="flex flex-col gap-4 w-full max-w-md">
                    <button
                        onClick={handleStartGame}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Start Game
                    </button>

                    <EyeTrackingModal />
                    <LeaderboardModal />

                    <label className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                            type="checkbox"
                            checked={skipIntro}
                            onChange={(e) => setSkipIntro(e.target.checked)}
                            className="w-4 h-4 cursor-pointer"
                        />
                        <span>Skip Intro</span>
                    </label>
                </div>
            </div>

            <IntroModal open={showIntroModal} onClose={handleIntroClose} />
        </>
    );
}