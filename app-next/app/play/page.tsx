'use client';

import { useCallback, useEffect, useState } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { GameWebcam } from "@/components/game/GameWebcam";
import { TypingGame, useTypingGameStore } from "@/typing-game";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function PlayPage() {
    const [isReady, setIsReady] = useState(false);
    const [unityReady, setUnityReady] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameLost, setGameLost] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(true);
    const [textVisible, setTextVisible] = useState(true);

    const resetTypingGame = useTypingGameStore((state) => state.reset);
    const loadStory = useTypingGameStore((state) => state.loadStory);
    const isStoryComplete = useTypingGameStore((state) => state.isStoryComplete);

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

    // Listen for Unity's GameLost event
    const handleGameLost = useCallback(() => {
        setGameLost(true);
        setGameStarted(false);
        resetTypingGame();
    }, [resetTypingGame]);

    useEffect(() => {
        addEventListener("GameIsReady", handleGameIsReady);
        addEventListener("GameLost", handleGameLost);
        return () => {
            removeEventListener("GameIsReady", handleGameIsReady);
            removeEventListener("GameLost", handleGameLost);
        };
    }, [addEventListener, removeEventListener, handleGameIsReady, handleGameLost]);

    // Auto-start game when Unity is ready, with fade-out transition
    useEffect(() => {
        if (unityReady && !gameStarted && !gameLost && !gameWon) {
            sendMessage("MainMenuManager", "GoToGameScene");
            setGameStarted(true);
            // Fade out text immediately, then overlay after delay
            setTextVisible(false);
            setTimeout(() => {
                setLoadingVisible(false);
            }, 600);
        }
    }, [unityReady, gameStarted, gameLost, gameWon, sendMessage]);

    // Send win event to Unity when story is complete
    useEffect(() => {
        if (isStoryComplete && gameStarted && !gameWon) {
            sendMessage("GameManager", "GameWon");
            setGameWon(true);
            setGameStarted(false);
            resetTypingGame();
        }
    }, [isStoryComplete, gameStarted, gameWon, sendMessage, resetTypingGame]);

    const handleBlink = useCallback(() => {
        sendMessage("Monster", "OnBlinkDetected");
    }, [sendMessage]);

    const handleReady = useCallback(() => {
        setIsReady(true);
    }, []);

    // Reusable restart function (for game over and win screens)
    const handleRestartGame = useCallback(() => {
        sendMessage("GameManager", "RestartScene");
        resetTypingGame();
        loadStory();
        setGameLost(false);
        setGameWon(false);
        setGameStarted(true);
    }, [sendMessage, resetTypingGame, loadStory]);

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

            {/* Game Over overlay */}
            <div
                className={`fixed inset-0 flex flex-col items-center justify-center gap-8 bg-black/90 z-30 transition-opacity duration-700 ${gameLost
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
                    }`}
            >
                <h1 className="text-6xl font-bold text-red-600 tracking-wider">You Died</h1>
                <Button
                    onClick={handleRestartGame}
                    variant="outline"
                    size="lg"
                >
                    Try Again
                </Button>
            </div>

            {/* Win overlay - no dark background, just centered content */}
            <div
                className={`fixed inset-0 flex flex-col items-center justify-center gap-8 z-30 transition-opacity duration-700 ${gameWon
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
                    }`}
            >
                <div className="bg-black/80 px-12 py-8 rounded-2xl flex flex-col items-center gap-6">
                    <h1 className="text-5xl font-bold text-green-500 tracking-wider">You Survived!</h1>
                    <Button
                        onClick={handleRestartGame}
                        variant="outline"
                        size="lg"
                        className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                    >
                        Play Again
                    </Button>
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
