'use client';

import { useCallback, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { GameWebcam } from "@/components/game/GameWebcam";
import { TypingGame } from "@/typing-game";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function PlayPage() {
    const [isReady, setIsReady] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    const { unityProvider, isLoaded, sendMessage } = useUnityContext({
        loaderUrl: "/game/build.loader.js",
        dataUrl: "/game/build.data",
        frameworkUrl: "/game/build.framework.js",
        codeUrl: "/game/build.wasm",
        streamingAssetsUrl: "/game/StreamingAssets"
    });

    const handleBlink = useCallback(() => {
        sendMessage("Monster", "OnBlinkDetected");
    }, [sendMessage]);

    const handleReady = useCallback(() => {
        setIsReady(true);
    }, []);

    function handleStartGame() {
        sendMessage("MainMenuManager", "GoToGameScene");
        setGameStarted(true);
    }

    return (
        <>
            {/* GameWebcam handles calibration/permission checks and signals when ready */}
            <GameWebcam onBlink={handleBlink} onReady={handleReady} gameStarted={gameStarted} />

            {/* Show checking state before ready */}
            {!isReady && (
                <div className="fixed inset-0 flex items-center justify-center bg-black text-white z-20">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Checking requirements...</span>
                    </div>
                </div>
            )}

            {/* Only render Unity after ready */}
            {isReady && (
                <>
                    <Unity
                        unityProvider={unityProvider}
                        style={{ visibility: isLoaded ? "visible" : "hidden" }}
                        className="fixed inset-0 w-screen h-screen z-0 pointer-events-none!"
                    />

                    {/* Debug UI - hide after game starts */}
                    {!gameStarted && (
                        <div className="fixed top-4 left-4 z-10 space-x-2">
                            <Button onClick={handleStartGame}>
                                Start
                            </Button>
                        </div>
                    )}

                    {/* Typing game UI - slides up when game starts */}
                    <TypingGame isVisible={gameStarted} />
                </>
            )}
        </>
    );
}
