'use client';

import { useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useWebcam } from "@/hooks/useWebcam";
import { useBlinkDetector } from "@/hooks/useBlinkDetector";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function PlayPage() {
    const { unityProvider, loadingProgression, isLoaded, sendMessage } = useUnityContext({
        loaderUrl: "/game/build.loader.js",
        dataUrl: "/game/build.data",
        frameworkUrl: "/game/build.framework.js",
        codeUrl: "/game/build.wasm",
    });

    // Webcam and blink detection
    const webcam = useWebcam();
    const blink = useBlinkDetector({ videoRef: webcam.videoRef });

    // Start webcam on mount
    useEffect(() => {
        webcam.start();
    }, []);

    // Start detection when ready
    useEffect(() => {
        if (webcam.isStreaming && blink.isInitialized && !blink.isDetecting) {
            blink.startDetection();
        }
    }, [webcam.isStreaming, blink.isInitialized, blink.isDetecting, blink.startDetection]);

    // Send blink events to Unity
    useEffect(() => {
        if (blink.blinkData.isBlinking) {
            sendMessage("Monster", "OnBlinkDetected");
        }
    }, [blink.blinkData.isBlinking, sendMessage]);

    function handleStartGame() {
        sendMessage("MainMenuManager", "GoToGameScene");
    }

    function handleBlink() {
        sendMessage("Monster", "OnBlinkDetected");
    }

    return (
        <>
            {/* Hidden webcam video for blink detection */}
            <video
                ref={webcam.setVideoRef}
                autoPlay
                playsInline
                muted
                className="hidden"
            />

            {!isLoaded && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-2xl z-20">
                    Loading... {Math.round(loadingProgression * 100)}%
                </div>
            )}
            <Unity
                unityProvider={unityProvider}
                style={{ visibility: isLoaded ? "visible" : "hidden" }}
                className="fixed inset-0 w-screen h-screen z-0 pointer-events-none!"
            />

            {/* Debug UI */}
            <div className="fixed top-4 left-4 z-10 space-x-2">
                <Button onClick={handleStartGame}>
                    Start
                </Button>
                <Button onClick={handleBlink}>
                    Manual Blink
                </Button>
            </div>

            {/* Blink status indicator */}
            <div className="fixed bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-black/60 px-4 py-2 text-white">
                {blink.blinkData.isBlinking ? (
                    <EyeOff className="h-5 w-5 text-yellow-400" />
                ) : (
                    <Eye className="h-5 w-5 text-green-400" />
                )}
                <span>Blinks: {blink.blinkData.blinkCount}</span>
            </div>
        </>
    );
}
