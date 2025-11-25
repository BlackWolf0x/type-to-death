interface BlinkCalibrationStatusProps {
    isInitialized: boolean;
    isStreaming: boolean;
    isCalibrated: boolean;
    calibrationState: 'none' | 'open' | 'closed';
    leftEAR: number;
    rightEAR: number;
    averageEAR: number;
    earThreshold: number;
    isBlinking: boolean;
    eyesOpenEAR: number | null;
    eyesClosedEAR: number | null;
}

export function BlinkCalibrationStatus({
    isInitialized,
    isStreaming,
    isCalibrated,
    calibrationState,
    leftEAR,
    rightEAR,
    averageEAR,
    earThreshold,
    isBlinking,
    eyesOpenEAR,
    eyesClosedEAR,
}: BlinkCalibrationStatusProps) {
    return (
        <div className="space-y-4">
            {/* System Status */}
            <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-semibold mb-2">System Status</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>MediaPipe: {isInitialized ? '✅ Ready' : '⏳ Loading...'}</p>
                    <p>Webcam: {isStreaming ? '✅ Streaming' : '❌ Not streaming'}</p>
                    <p>Calibrated: {isCalibrated ? '✅ Yes' : '❌ No'}</p>
                    <p>State: {calibrationState}</p>
                </div>
            </div>

            {/* Eye Aspect Ratio with Progress Bars */}
            <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Eye Aspect Ratio (EAR)</h3>
                <div className="space-y-4">
                    {/* Average EAR */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Average</span>
                            <span className="text-lg font-mono font-semibold">{averageEAR.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full transition-all duration-150 ${isBlinking ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(averageEAR * 200, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Left Eye EAR */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Left Eye</span>
                            <span className="text-sm font-mono">{leftEAR.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-150"
                                style={{ width: `${Math.min(leftEAR * 200, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Right Eye EAR */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Right Eye</span>
                            <span className="text-sm font-mono">{rightEAR.toFixed(3)}</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-purple-500 transition-all duration-150"
                                style={{ width: `${Math.min(rightEAR * 200, 100)}%` }}
                            />
                        </div>
                    </div>

                    {/* Threshold indicator */}
                    <div className="pt-2 border-t border-gray-300">
                        {isCalibrated ? (
                            <>
                                <div className="text-xs text-gray-600 mb-1">Threshold: {earThreshold.toFixed(3)}</div>
                                <div className="text-xs text-gray-500">
                                    Open: {eyesOpenEAR?.toFixed(3)} | Closed: {eyesClosedEAR?.toFixed(3)}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-xs text-gray-600 mb-1">Not calibrated</div>
                                <div className="text-xs text-gray-500">Complete calibration steps to start</div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-semibold mb-2">How It Works</h3>
                <div className="text-sm text-gray-600 space-y-2">
                    <p>
                        <strong className="text-gray-800">EAR Algorithm:</strong> Measures eye openness using facial landmarks.
                    </p>
                    <p>
                        When EAR drops below the calibrated threshold for consecutive frames, a blink is registered.
                    </p>
                    <p className="text-xs pt-2 border-t border-gray-300">
                        Based on "Real-Time Eye Blink Detection using Facial Landmarks"
                    </p>
                </div>
            </div>
        </div>
    );
}
