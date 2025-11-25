import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { IntroModal } from "@/components/modals/IntroModal";
import { BlinkCalibrationModal } from "@/components/modal-blink";
import { LeaderboardModal } from "@/components/modals/LeaderboardModal";
import { Rain } from "@/components/ui/Rain";
import { BlinkCalibration } from "@/features/blink-calibration";

export function MainMenu() {
    const { showMainMenu, skipIntro, hideMainMenu, setSkipIntro } = useAppStore();
    const [showIntroModal, setShowIntroModal] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.4; // 0.5 = half speed, 0.75 = 3/4 speed, etc.
        }
    }, []);

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
                {/* Fullscreen video background */}
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-[calc(100vh+90px)] object-cover"
                >
                    <source src="/main-menu.mp4" type="video/mp4" />
                </video>

                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-linear-to-bl from-transparent to-blue-500/20 animate-pulse" />
                <div className="absolute inset-0 bg-linear-to-tr from-transparent to-red-500/40 animate-pulse" />
                <div className="absolute inset-0 bg-black/40" />

                {/* Borders */}
                <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-1 w-[calc(100vw-70px)] h-[calc(100vh-70px)] border border-red-500 rounded-3xl" />
                <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-1 w-[calc(100vw-80px)] h-[calc(100vh-80px)] border border-red-500 rounded-3xl" />

                {/* Rain effect */}
                <Rain />



                {/* Content on top of video */}
                <header className="text-center relative z-10">
                    <h1 className="text-[7rem] font-metal font-bold text-red-500 mb-2 text-shadow-sm text-shadow-black tracking-wide">Type To Death</h1>
                </header>

                <div className="flex flex-col gap-4 relative z-10">
                    <button
                        onClick={handleStartGame}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors drop-shadow-lg"
                    >
                        Start Game
                    </button>

                    <BlinkCalibrationModal />
                    <BlinkCalibration />
                    <LeaderboardModal />

                    <label className="flex items-center gap-2 text-white cursor-pointer drop-shadow-lg">
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