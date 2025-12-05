'use client';

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { Unity, useUnityContext } from "react-unity-webgl";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GameWebcamSimple } from "@/components/game-webcam-simple";
import { FaceDetectionWarning } from "@/components/face-detection-warning";
import { TypingGame, useTypingGameStore } from "@/typing-game";
import { useGameStatsStore, formatTime, calculateWPM, calculateAccuracy, calculateWPMRaw, calculateAccuracyRaw } from "@/stores/gameStatsStore";
import { Button } from "@/components/ui/button";
import { ModalLeaderboard } from "@/components/modal-leaderboard";
import { Clock, Eye, Fullscreen, Headphones, Keyboard, Loader2, MoveRight, Target, Trophy, XCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModalAuth } from "@/components/modal-auth";
import { Id } from "@/convex/_generated/dataModel";

export default function PlayPage() {
    const [isReady, setIsReady] = useState(false);
    const [showIntro, setShowIntro] = useState(false);
    const [introSeen, setIntroSeen] = useState(false);
    const [unityReady, setUnityReady] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameLost, setGameLost] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [showWinOverlay, setShowWinOverlay] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(true);
    const [textVisible, setTextVisible] = useState(true);
    const [blinkData, setBlinkData] = useState({ isBlinking: false, blinkCount: -1, faceDetected: true });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scoreSubmitStatus, setScoreSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [scoreSubmitError, setScoreSubmitError] = useState<string | null>(null);

    // Fetch story from Convex backend
    const searchParams = useSearchParams()
    const caseId = searchParams.get('caseid')

    const story = useQuery(api.stories.getStory, {
        storyId: caseId as Id<"stories"> || undefined
    });

    const submitScore = useMutation(api.highscores.submitScore);
    const { isAuthenticated } = useConvexAuth();

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
    // Raw values for database submission (no rounding)
    const wpmRaw = calculateWPMRaw(charactersTyped, elapsedTime);
    const accuracyRaw = calculateAccuracyRaw(correctKeystrokes, totalKeystrokes);

    const { unityProvider, isLoaded, sendMessage, addEventListener, removeEventListener, unload } = useUnityContext({
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

    // Cleanup Unity instance on unmount - handle FMOD audio worklet cleanup
    useEffect(() => {
        return () => {
            const cleanup = async () => {
                try {
                    // Try to close Unity's FMOD audio context before unloading
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const unityModule = (window as any).unityInstance;
                    if (unityModule?.Module?.audioContext) {
                        await unityModule.Module.audioContext.close().catch(() => { });
                    }
                } catch {
                    // Ignore audio cleanup errors
                }

                // Unload Unity instance
                await unload().catch(() => { });
            };

            cleanup();
        };
    }, [unload]);

    // Show intro when game is fully loaded (but only if not seen yet)
    useEffect(() => {
        if (isReady && unityReady && story && !introSeen && !showIntro) {
            // Show intro and hide loading immediately
            setShowIntro(true);
            setTextVisible(false);
            setLoadingVisible(false);
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

    // Send win event to Unity when story is complete and submit score
    useEffect(() => {
        if (isStoryComplete && gameStarted && !gameWon) {
            sendMessage("GameManager", "GameWon");
            setGameWon(true);
            setGameStarted(false);
            stopTimer();
            resetTypingGame();

            // Show win overlay after a delay (1.5 seconds)
            setTimeout(() => {
                setShowWinOverlay(true);
            }, 1500);

            // Submit score to leaderboard (using raw values without rounding)
            if (story?._id) {
                setScoreSubmitStatus('submitting');
                setScoreSubmitError(null);
                submitScore({
                    storyId: story._id,
                    wordPerMinute: wpmRaw,
                    accuracy: accuracyRaw,
                    timeTaken: elapsedTime,
                })
                    .then(() => {
                        setScoreSubmitStatus('success');
                    })
                    .catch((error) => {
                        setScoreSubmitStatus('error');
                        const errorMessage = error instanceof Error ? error.message : "Failed to submit score";
                        setScoreSubmitError(errorMessage.includes("Unauthenticated") ? "Sign in to save your score" : errorMessage);
                        console.error("Failed to submit score:", error);
                    });
            }
        }
    }, [isStoryComplete, gameStarted, gameWon, sendMessage, resetTypingGame, stopTimer, story, submitScore, wpmRaw, accuracyRaw, elapsedTime]);

    const handleBlink = useCallback(() => {
        sendMessage("Monster", "OnBlinkDetected");
    }, [sendMessage]);

    const handleReady = useCallback(() => {
        setIsReady(true);
    }, []);

    // Retry score submission (for when user logs in after failing)
    const handleRetrySubmit = useCallback(() => {
        if (story?._id && isAuthenticated) {
            setScoreSubmitStatus('submitting');
            setScoreSubmitError(null);
            submitScore({
                storyId: story._id,
                wordPerMinute: wpmRaw,
                accuracy: accuracyRaw,
                timeTaken: elapsedTime,
            })
                .then(() => {
                    setScoreSubmitStatus('success');
                })
                .catch((error) => {
                    setScoreSubmitStatus('error');
                    const errorMessage = error instanceof Error ? error.message : "Failed to submit score";
                    setScoreSubmitError(errorMessage.includes("Unauthenticated") ? "Sign in to save your score" : errorMessage);
                    console.error("Failed to submit score:", error);
                });
        }
    }, [story, isAuthenticated, submitScore, wpmRaw, accuracyRaw, elapsedTime]);

    // Reusable restart function (for game over and win screens)
    const handleRestartGame = useCallback(() => {
        sendMessage("GameManager", "RestartScene");
        resetTypingGame();
        reloadStory();
        resetStats();
        startTimer();
        setGameLost(false);
        setGameWon(false);
        setShowWinOverlay(false);
        setGameStarted(true);
        setScoreSubmitStatus('idle');
        setScoreSubmitError(null);
    }, [sendMessage, resetTypingGame, reloadStory, resetStats, startTimer]);

    // Auto-retry score submission when user logs in after auth error
    useEffect(() => {
        if (isAuthenticated && scoreSubmitStatus === 'error' && scoreSubmitError?.includes("Sign in")) {
            handleRetrySubmit();
        }
    }, [isAuthenticated, scoreSubmitStatus, scoreSubmitError, handleRetrySubmit]);

    // Fullscreen toggle handler
    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    }, []);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Determine loading screen state (only show when intro is not visible and game not ready)
    const showLoading = (!isReady || !unityReady || !story) && !showIntro;
    const loadingText = !isReady ? "Checking requirements..." : !story ? "Loading story..." : "Loading game... It might take a little longer to load the first time.";

    return (
        <>
            {/* Simple webcam - blink detection only, no visual effects */}
            <GameWebcamSimple
                onBlink={handleBlink}
                onReady={handleReady}
                onBlinkDataChange={setBlinkData}
                gameStarted={gameStarted}
            />

            {/* Face detection warning - only active during gameplay */}
            <FaceDetectionWarning
                faceDetected={blinkData.faceDetected}
                enabled={gameStarted}
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
                className={`fixed inset-0 flex items-center justify-center bg-black text-white z-25 ${showIntro
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
                    }`}
            >
                <div className="max-w-6xl mx-auto px-8 flex flex-col items-center gap-12">

                    <Card disableRain className="pt-10">
                        <h1 className="mb-4 text-6xl font-bold font-metalMania text-center tracking-wide text-red-500 animate-in">
                            {story?.title}
                        </h1>
                        <CardContent>
                            <ScrollArea className="h-[350px] w-full rounded-md pr-2">
                                <p className="p-4 text-2xl leading-relaxed text-justify whitespace-pre-line">
                                    {story?.introduction.replace(/\\n/g, '\n')}
                                </p>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-6">
                        <div className="border py-4 px-6 rounded-xl flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                            <div className="bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                                <Eye size={20} />
                            </div>
                            Do not blink,<br />
                            Do not look down
                        </div>

                        <div className="border py-4 px-6 rounded-xl flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                            <div className="bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                                <Headphones size={20} />
                            </div>
                            Headphones<br />Recommended
                        </div>

                        <div className="border py-4 px-6 rounded-xl flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                            <div className="bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                                <Fullscreen size={20} />
                            </div>
                            Fullscreen <br />Recommended
                            <Button size="sm" className="ml-6" onClick={toggleFullscreen}>
                                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                            </Button>
                        </div>
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
                className={`fixed inset-0 flex flex-col items-center justify-center gap-12 bg-black/90 z-30 transition-opacity duration-700 ${gameLost
                    ? 'opacity-100'
                    : 'opacity-0 pointer-events-none'
                    }`}
            >
                <h1 className="text-8xl font-metalMania font-bold text-red-600 tracking-wider">You Died</h1>

                <div className="flex items-center gap-6 border rounded-xl">
                    <div className="py-4 px-6 flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                        <div className="bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        Time: {formatTime(elapsedTime)}
                    </div>

                    <Separator orientation="vertical" className="h-8!" />

                    <div className="py-4 px-6 flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                        <div className="bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                            <Keyboard size={20} />
                        </div>
                        {wpm} WPM
                    </div>

                    <Separator orientation="vertical" className="h-8!" />

                    <div className="py-4 px-6 flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                        <div className="bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                            <Target size={20} />
                        </div>
                        {accuracy}% Accuracy
                    </div>
                </div>

                <div className="space-x-6">
                    <Button
                        variant="secondary"
                        size="xl"
                        asChild
                    >
                        <a href="/">
                            Main Menu
                        </a>
                    </Button>

                    <Button
                        onClick={handleRestartGame}
                        variant="outlineRed"
                        size="xl"
                    >
                        Try Again
                    </Button>
                </div>
            </div>

            {/* Win overlay - no dark background, just centered content with delay and smooth transition */}
            <div
                className={`fixed inset-0 flex flex-col items-center justify-center gap-8 z-30 transition-all duration-1000 ease-out ${showWinOverlay
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-95 pointer-events-none'
                    }`}
            >
                <Card disableRain className="py-10">
                    <CardHeader className="mb-4">
                        <h1 className="text-6xl font-metalMania font-bold text-green-500 tracking-wider text-center">You Survived!</h1>
                    </CardHeader>

                    <CardContent className="mb-8 flex flex-col items-center">
                        <div className="mb-8 flex items-center gap-6 border rounded-xl">
                            <div className="py-4 px-6 flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                                <div className="bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                Time: {formatTime(elapsedTime)}
                            </div>

                            <Separator orientation="vertical" className="h-8!" />

                            <div className="py-4 px-6 flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                                <div className="bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                                    <Keyboard size={20} />
                                </div>
                                {wpm} WPM
                            </div>

                            <Separator orientation="vertical" className="h-8!" />

                            <div className="py-4 px-6 flex items-center justify-center gap-4 leading-tight text-muted-foreground">
                                <div className="bg-zinc-900 size-10 rounded-full flex items-center justify-center">
                                    <Target size={20} />
                                </div>
                                {accuracy}% Accuracy
                            </div>
                        </div>

                        {/* Score submission status */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-sm">
                                {scoreSubmitStatus === 'submitting' && (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-muted-foreground">Saving score...</span>
                                    </>
                                )}
                                {scoreSubmitStatus === 'success' && (
                                    <>
                                        <Trophy className="h-4 w-4 text-yellow-500" />
                                        <span className="text-green-500">Score saved to leaderboard!</span>
                                    </>
                                )}
                                {scoreSubmitStatus === 'error' && (
                                    <>
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-red-400">{scoreSubmitError}</span>
                                    </>
                                )}
                            </div>
                            {/* Show auth modal if submission failed due to authentication */}
                            {scoreSubmitStatus === 'error' && scoreSubmitError?.includes("Sign in") && !isAuthenticated && (
                                <ModalAuth />
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex-col justify-center gap-8">
                        <div className="flex items-center gap-6">
                            <ModalLeaderboard />

                            <Button
                                onClick={handleRestartGame}
                                variant="outlineRed"
                                size="xl"
                            >
                                Restart Game
                            </Button>

                            <Button
                                variant="outline"
                                size="xl"
                                asChild
                            >
                                <a href="/">
                                    Exit Game
                                </a>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
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
