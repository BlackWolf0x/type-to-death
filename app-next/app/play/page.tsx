'use client';

import { useCallback, useEffect, useState, useRef } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GameWebcam } from "@/components/game-webcam";
import { TypingGame, useTypingGameStore } from "@/typing-game";
import { useGameStatsStore, formatTime, calculateWPM, calculateAccuracy } from "@/stores/gameStatsStore";
import { Button } from "@/components/ui/button";
import { Loader2, MoveRight } from "lucide-react";

export default function PlayPage() {
    const [isReady, setIsReady] = useState(false);
    const [showIntro, setShowIntro] = useState(false);
    const [introSeen, setIntroSeen] = useState(false);
    const [unityReady, setUnityReady] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameLost, setGameLost] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(true);
    const [textVisible, setTextVisible] = useState(true);
    const [blinkData, setBlinkData] = useState({ isBlinking: false, blinkCount: -1 });
    const introScrollRef = useRef<HTMLDivElement>(null);

    // Fetch story from Convex backend
    const story = useQuery(api.stories.getLatestStory);

    const resetTypingGame = useTypingGameStore((state) => state.reset);
    const loadStory = useTypingGameStore((state) => state.loadStory);
    const reloadStory = useTypingGameStore((state) => state.reloadStory);
    const isStoryComplete = useTypingGameStore((state) => state.isStoryComplete);

    // Game stats
    const elapsedTime = useGameStatsStore((state) => state.elapsedTime);
    const charactersTyped = useGameStatsStore((state) => state.charactersTyped);
    const totalKeystrokes = useGameStatsStore((state) => state.totalKeystrokes);
    const correctKeystrokes = useGameStatsStore((state) => state.correctKeystrokes);
    const startTimer = useGameStatsStore((state) => state.startTimer);
    const stopTimer = useGameStatsStore((state) => state.stopTimer);
    const resetStats = useGameStatsStore((state) => state.resetStats);
    const tick = useGameStatsStore((state) => state.tick);
    const isTimerRunning = useGameStatsStore((state) => state.isTimerRunning);
    const wpm = calculateWPM(charactersTyped, elapsedTime);
    const accuracy = calculateAccuracy(correctKeystrokes, totalKeystrokes);

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
        stopTimer();
        resetTypingGame();
    }, [resetTypingGame, stopTimer]);

    useEffect(() => {
        addEventListener("GameIsReady", handleGameIsReady);
        addEventListener("GameLost", handleGameLost);
        return () => {
            removeEventListener("GameIsReady", handleGameIsReady);
            removeEventListener("GameLost", handleGameLost);
        };
    }, [addEventListener, removeEventListener, handleGameIsReady, handleGameLost]);

    // Show intro when game is fully loaded (but only if not seen yet)
    useEffect(() => {
        if (isReady && unityReady && story && !introSeen && !showIntro) {
            // Fade out loading screen first
            setTextVisible(false);
            setTimeout(() => {
                setLoadingVisible(false);
                // Show intro after loading screen fades
                setTimeout(() => {
                    setShowIntro(true);
                }, 300);
            }, 600);
        }
    }, [isReady, unityReady, story, introSeen, showIntro]);

    // Start game when intro has been seen (called by Begin button)
    useEffect(() => {
        if (unityReady && introSeen && story && !gameStarted && !gameLost && !gameWon) {
            sendMessage("MainMenuManager", "GoToGameScene");
            setGameStarted(true);
            loadStory(story);
            resetStats();
            startTimer();
        }
    }, [unityReady, introSeen, story, gameStarted, gameLost, gameWon, sendMessage, loadStory, resetStats, startTimer]);

    const handleStartGame = useCallback(() => {
        setShowIntro(false);
        setIntroSeen(true);
    }, []);

    // Timer tick effect
    useEffect(() => {
        if (!isTimerRunning) return;
        const interval = setInterval(() => {
            tick();
        }, 1000);
        return () => clearInterval(interval);
    }, [isTimerRunning, tick]);

    // Send win event to Unity when story is complete
    useEffect(() => {
        if (isStoryComplete && gameStarted && !gameWon) {
            sendMessage("GameManager", "GameWon");
            setGameWon(true);
            setGameStarted(false);
            stopTimer();
            resetTypingGame();
        }
    }, [isStoryComplete, gameStarted, gameWon, sendMessage, resetTypingGame, stopTimer]);

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
        reloadStory();
        resetStats();
        startTimer();
        setGameLost(false);
        setGameWon(false);
        setGameStarted(true);
    }, [sendMessage, resetTypingGame, reloadStory, resetStats, startTimer]);

    // Determine loading screen state (only show when intro is not visible and game not ready)
    const showLoading = (!isReady || !unityReady || !story) && !showIntro;
    const loadingText = !isReady ? "Checking requirements..." : !story ? "Loading story..." : "Loading game...";

    return (
        <>
            {/* GameWebcam handles calibration/permission checks and signals when ready */}
            <GameWebcam
                onBlink={handleBlink}
                onReady={handleReady}
                onBlinkDataChange={setBlinkData}
                gameStarted={gameStarted}
            />

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

            {/* Intro screen */}
            <div
                className={`fixed inset-0 flex items-center justify-center bg-black text-white z-25 transition-opacity duration-700 ${showIntro
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
                    }`}
            >
                <div className="max-w-6xl mx-auto px-8 flex flex-col items-center gap-14">
                    <h1 className="text-6xl font-bold font-metalMania text-center tracking-wide text-red-500 animate-in">
                        {story?.title}
                    </h1>
                    <div
                        ref={introScrollRef}
                        className="overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                    >
                        <p className="min-h-120 text-xl leading-relaxed text-justify text-white/80 whitespace-pre-line">
                            {story?.introduction.replace(/\\n/g, '\n')}
                        </p>
                    </div>
                    <Button
                        onClick={handleStartGame}
                        variant="outlineRed"
                        size="xl"
                    >
                        Start Challenge
                        <MoveRight className="ml-2 translate-y-0.5" />
                    </Button>
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
                <div className="flex items-center gap-6 text-white/80 text-lg">
                    <span>Time: {formatTime(elapsedTime)}</span>
                    <span>•</span>
                    <span>{wpm} WPM</span>
                    <span>•</span>
                    <span>{accuracy}% Accuracy</span>
                </div>
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
                    <div className="flex items-center gap-6 text-white/80 text-lg">
                        <span>Time: {formatTime(elapsedTime)}</span>
                        <span>•</span>
                        <span>{wpm} WPM</span>
                        <span>•</span>
                        <span>{accuracy}% Accuracy</span>
                    </div>
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
                    <TypingGame isVisible={gameStarted} blinkData={blinkData} />
                </>
            )}
        </>
    );
}
