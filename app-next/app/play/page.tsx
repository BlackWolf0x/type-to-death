'use client';

import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { GameWebcam } from "@/components/game/GameWebcam";
import { TypingGame } from "@/typing-game";
import { Loader2 } from "lucide-react";

export default function PlayPage() {
    const [isReady, setIsReady] = useState(false);
    const [unityReady, setUnityReady] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(true);
    const [textVisible, setTextVisible] = useState(true);

    const { unityProvider, isLoaded, sendMessage, addEventListener, removeEventListener } = useUnityContext({
        loaderUrl: "/game/build.loader.js",
        dataUrl: "/game/build.data",
        frameworkUrl: "/game/build.framework.js",
        codeUrl: "/game/build.wasm",
        streamingAssetsUrl: "/game/StreamingAssets"
    });

    // Listen for Unity's GameIsReady event
    const handleGameIsReady = useCallback(() => {
        setUnityReady(true);
    }, []);

    useEffect(() => {
        addEventListener("GameIsReady", handleGameIsReady);
        return () => {
            removeEventListener("GameIsReady", handleGameIsReady);
        };
    }, [addEventListener, removeEventListener, handleGameIsReady]);

    // Auto-start game when Unity is ready, with fade-out transition
    useEffect(() => {
        if (unityReady && !gameStarted) {
            sendMessage("MainMenuManager", "GoToGameScene");
            setGameStarted(true);
            // Fade out text immediately, then overlay after delay
            setTextVisible(false);
            setTimeout(() => {
                setLoadingVisible(false);
            }, 600);
        }
    }, [unityReady, gameStarted, sendMessage]);

    const handleBlink = useCallback(() => {
        sendMessage("Monster", "OnBlinkDetected");
    }, [sendMessage]);

    const handleReady = useCallback(() => {
        setIsReady(true);
    }, []);

    // Determine loading screen state
    const showLoading = !isReady || !unityReady;
    const loadingText = !isReady ? "Checking requirements..." : "Loading game...";

    return (
        <>
            {/* GameWebcam handles calibration/permission checks and signals when ready */}
            <GameWebcam onBlink={handleBlink} onReady={handleReady} gameStarted={gameStarted} />

            {/* Loading screen with fade transition */}
            <div
                className={`fixed inset-0 flex items-center justify-center bg-black text-white z-20 transition-opacity duration-1000 ${showLoading && loadingVisible
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
                    }`}
            >
                <div className={`flex items-center gap-3 transition-opacity duration-75 ${textVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>{loadingText}</span>
                </div>
            </div>

            {/* Only render Unity after ready */}
            {isReady && (
                <>
                    <Unity
                        unityProvider={unityProvider}
                        style={{ visibility: isLoaded ? "visible" : "hidden" }}
                        className="fixed inset-0 w-screen h-screen z-0 pointer-events-none!"
                    />

                    {/* Typing game UI - slides up when game starts */}
                    <TypingGame isVisible={gameStarted} />
                </>
            )}
        </>
    );
}
