import { Button } from "@/components/ui/button";

interface BlinkCalibrationControlsProps {
    // Calibration state
    calibrationState: 'none' | 'open' | 'closed';
    eyesOpenEAR: number | null;
    eyesClosedEAR: number | null;
    isCalibrated: boolean;
    earThreshold: number;

    // Calibration functions
    startCalibrateOpen: () => void;
    saveCalibrateOpen: () => void;
    startCalibrateClosed: () => void;
    saveCalibrateClosed: () => void;
    resetCalibration: () => void;
}

export function BlinkCalibrationControls({
    calibrationState,
    eyesOpenEAR,
    eyesClosedEAR,
    isCalibrated,
    earThreshold,
    startCalibrateOpen,
    saveCalibrateOpen,
    startCalibrateClosed,
    saveCalibrateClosed,
    resetCalibration,
}: BlinkCalibrationControlsProps) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Calibration</h3>

            {/* Step 1: Eyes Open */}
            <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className={eyesOpenEAR !== null ? 'text-green-600' : 'text-gray-800'}>
                        {eyesOpenEAR !== null ? '✅' : '1️⃣'}
                    </span>
                    Step 1: Eyes Open
                </h4>
                {eyesOpenEAR !== null ? (
                    <div className="text-green-600 text-sm">Saved: {eyesOpenEAR.toFixed(3)}</div>
                ) : (
                    <p className="text-sm text-gray-600 mb-3">
                        Keep your eyes wide open and click "Start", then click "Save" after a few seconds.
                    </p>
                )}
                {eyesOpenEAR === null && (
                    <div className="flex gap-2">
                        {calibrationState === 'open' ? (
                            <Button
                                onClick={saveCalibrateOpen}
                                className="w-full"
                                variant="default"
                            >
                                💾 Save Eyes Open
                            </Button>
                        ) : (
                            <Button
                                onClick={startCalibrateOpen}
                                className="w-full"
                                variant="outline"
                            >
                                ▶️ Start Recording Open
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Step 2: Eyes Closed */}
            <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className={eyesClosedEAR !== null ? 'text-green-600' : 'text-gray-800'}>
                        {eyesClosedEAR !== null ? '✅' : '2️⃣'}
                    </span>
                    Step 2: Eyes Closed
                </h4>
                {eyesClosedEAR !== null ? (
                    <div className="text-green-600 text-sm">Saved: {eyesClosedEAR.toFixed(3)}</div>
                ) : (
                    <p className="text-sm text-gray-600 mb-3">
                        Close your eyes and click "Start", then click "Save" after a few seconds.
                    </p>
                )}
                {eyesClosedEAR === null && (
                    <div className="flex gap-2">
                        {calibrationState === 'closed' ? (
                            <Button
                                onClick={saveCalibrateClosed}
                                className="w-full"
                                variant="default"
                            >
                                💾 Save Eyes Closed
                            </Button>
                        ) : (
                            <Button
                                onClick={startCalibrateClosed}
                                disabled={eyesOpenEAR === null}
                                className="w-full"
                                variant="outline"
                            >
                                ▶️ Start Recording Closed
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Calibration completion message */}
            {eyesOpenEAR !== null && eyesClosedEAR !== null && !isCalibrated && (
                <div className="text-center text-green-600 text-sm">
                    Calibration will complete automatically after saving closed eyes!
                </div>
            )}

            {/* Calibration Complete */}
            {isCalibrated && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-semibold">
                        ✅ Calibration Complete!
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                        Threshold calculated: {earThreshold.toFixed(3)}
                    </p>
                    <p className="text-sm text-green-700">
                        You can now use blink detection in the game.
                    </p>
                </div>
            )}

            {/* Reset Calibration */}
            <Button
                onClick={resetCalibration}
                variant="destructive"
                size="sm"
            >
                Reset Calibration
            </Button>
        </div>
    );
}
