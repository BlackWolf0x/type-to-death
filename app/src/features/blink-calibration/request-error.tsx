import { Button } from "@/components/ui/button";
import { useBlinkCalibrationStore } from "./store";
import { useBlinkDetector } from "@/hooks/useBlinkDetector";

export function BlinkCalibrationRequestError() {
    const { setSetupStep } = useBlinkCalibrationStore();
    const { startTracking, error } = useBlinkDetector();

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg max-w-md">
                <p className="text-red-200 font-semibold">⚠️ {error}</p>
                {(error?.toLowerCase().includes('permission') || error?.toLowerCase().includes('denied')) && (
                    <div className="text-sm text-red-300 mt-2 space-y-1">
                        <p className="font-semibold">Camera access was blocked.</p>
                        <p>To fix this:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Click the 🔒 or 🎥 icon in your browser's address bar</li>
                            <li>Change camera permission to "Allow"</li>
                            <li>Click "Try Again" below</li>
                        </ol>
                    </div>
                )}
            </div>
            <Button onClick={() => {
                setSetupStep('requestPermission');
                startTracking();
            }} variant="outline">
                Try Again
            </Button>
        </div>
    );
}
