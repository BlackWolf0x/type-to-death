import { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useBlinkDetector } from "@/hooks/useBlinkDetector";
import { BlinkCalibrationControls } from './BlinkCalibrationControls';

export function BlinkCalibrationContent() {
    console.log('[BlinkCalibration] Component mounted/rendered');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const {
        // Blink data
        leftEAR,
        rightEAR,
        averageEAR,
        isBlinking,
        blinkCount,

        // Controls
        startTracking,
        stopTracking,
        resetCounter,
        isInitialized,
        error,

        // Calibration
        isCalibrated,
        calibrationState,
        eyesOpenEAR,
        eyesClosedEAR,
        earThreshold,
        startCalibrateOpen,
        saveCalibrateOpen,
        startCalibrateClosed,
        saveCalibrateClosed,
        resetCalibration,

        // Webcam
        videoRef,
        isStreaming,

        // Landmarks
        faceLandmarks,
    } = useBlinkDetector();

    // Debug logging
    useEffect(() => {
        console.log('[BlinkCalibration] State:', { isInitialized, isStreaming, error });
    }, [isInitialized, isStreaming, error]);

    // Auto-start tracking when component mounts (modal opens)
    useEffect(() => {
        if (isInitialized && !isStreaming && !error) {
            console.log('[BlinkCalibration] Auto-starting webcam...');
            startTracking();
        }
        // Cleanup: stop tracking when component unmounts
        return () => {
            if (isStreaming) {
                stopTracking();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInitialized]);

    // Draw eye landmarks on canvas
    useEffect(() => {
        if (!canvasRef.current || !videoRef.current || !isStreaming || !faceLandmarks) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match video
        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;

        // Clear canvas
        ctx.clearRect(0, 0, w, h);

        const landmarks = faceLandmarks[0];
        if (!landmarks) return;

        // MediaPipe eye landmark indices
        const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
        const RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

        const drawEyeOutline = (eyeIndices: number[], color: string) => {
            ctx.beginPath();
            eyeIndices.forEach((idx, i) => {
                const point = landmarks[idx];
                if (!point) return;
                const x = point.x * w;
                const y = point.y * h;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();
        };

        // Color based on blink state
        const eyeColor = isBlinking ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.8)';
        drawEyeOutline(LEFT_EYE, eyeColor);
        drawEyeOutline(RIGHT_EYE, eyeColor);
    }, [faceLandmarks, isStreaming, videoRef, isBlinking]);

    return (
        <div className="space-y-6">

            {/* Error Banner */}
            {error && !isStreaming && (
                <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <p className="text-red-200 font-semibold">⚠️ {error}</p>
                    {(error.toLowerCase().includes('permission') || error.toLowerCase().includes('denied')) && (
                        <div className="text-sm text-red-300 mt-2 space-y-1">
                            <p className="font-semibold">Camera access was blocked.</p>
                            <p>To fix this:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Click the 🔒 or 🎥 icon in your browser's address bar</li>
                                <li>Change camera permission to "Allow"</li>
                                <li>Click "Start Webcam" below to try again</li>
                            </ol>
                        </div>
                    )}
                </div>
            )}

            {/* Calibration Status Banner */}
            {!isCalibrated && isStreaming && (
                <div className="p-4 bg-yellow-900/50 border border-yellow-500 rounded-lg">
                    <p className="text-yellow-200 font-semibold">⚠️ Calibration Required</p>
                    <p className="text-yellow-300 text-sm mt-1">
                        You need to calibrate the system with your eyes open and closed before blink detection will work.
                    </p>
                </div>
            )}
            {isCalibrated && (
                <div className="p-3 bg-green-900/50 border border-green-500 rounded-lg">
                    <p className="text-green-200 font-semibold">✅ Calibrated - Blink detection active!</p>
                </div>
            )}


            <section className='grid grid-cols-3 gap-6'>
                <div className='col-span-2 space-y-6'>

                    {/* Webcam Video with Canvas Overlay */}
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {!isStreaming && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-6">
                                {error ? (
                                    <div className="text-center max-w-md">
                                        <p className="text-red-400 mb-3 font-semibold text-lg">⚠️ {error}</p>
                                        {error.toLowerCase().includes('permission') || error.toLowerCase().includes('denied') ? (
                                            <div className="text-sm text-gray-300 mb-4 space-y-2">
                                                <p className="font-semibold text-yellow-300">Camera access was blocked.</p>
                                                <p>To fix this:</p>
                                                <ol className="text-left list-decimal list-inside space-y-1">
                                                    <li>Click the 🔒 or 🎥 icon in your address bar</li>
                                                    <li>Change camera permission to "Allow"</li>
                                                    <li>Refresh the page or click "Try Again"</li>
                                                </ol>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-300 mb-4">
                                                Please check your camera connection and try again.
                                            </p>
                                        )}
                                        <Button onClick={startTracking} variant="outline">
                                            Try Again
                                        </Button>
                                    </div>
                                ) : (
                                    <Button onClick={startTracking} disabled={isStreaming} variant="outline" size="lg">
                                        Start Webcam
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Webcam Controls */}
                    <div className="flex gap-2">
                        <Button onClick={stopTracking} disabled={!isStreaming} variant="outline">
                            Stop Webcam
                        </Button>
                    </div>

                    {/* Status Display */}
                    {/* <BlinkCalibrationStatus
                        isInitialized={isInitialized}
                        isStreaming={isStreaming}
                        isCalibrated={isCalibrated}
                        calibrationState={calibrationState}
                        leftEAR={leftEAR}
                        rightEAR={rightEAR}
                        averageEAR={averageEAR}
                        earThreshold={earThreshold}
                        isBlinking={isBlinking}
                        eyesOpenEAR={eyesOpenEAR}
                        eyesClosedEAR={eyesClosedEAR}
                    /> */}

                </div>{/* first col */}


                <div>


                    {/* Blink Detection Display */}
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">Blink Detection</h3>
                                <p className="text-sm text-gray-600">
                                    {isCalibrated ? 'Detecting blinks...' : 'Please calibrate first'}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={`text-4xl font-bold ${isBlinking ? 'text-red-600' : 'text-green-600'}`}>
                                    {isBlinking ? '👁️ BLINK!' : '👀 Open'}
                                </div>
                                <p className="text-2xl font-semibold mt-2">
                                    Blinks: {blinkCount}
                                </p>
                            </div>
                        </div>
                        <Button onClick={resetCounter} variant="outline" size="sm" className="mt-2">
                            Reset Counter
                        </Button>
                    </div>

                    {/* Calibration Controls */}
                    <BlinkCalibrationControls
                        calibrationState={calibrationState}
                        eyesOpenEAR={eyesOpenEAR}
                        eyesClosedEAR={eyesClosedEAR}
                        isCalibrated={isCalibrated}
                        earThreshold={earThreshold}
                        startCalibrateOpen={startCalibrateOpen}
                        saveCalibrateOpen={saveCalibrateOpen}
                        startCalibrateClosed={startCalibrateClosed}
                        saveCalibrateClosed={saveCalibrateClosed}
                        resetCalibration={resetCalibration}
                    />


                </div>
            </section>




        </div>
    );
}
