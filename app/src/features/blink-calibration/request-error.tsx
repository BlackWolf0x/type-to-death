import { Button } from "@/components/ui/button";
import { useBlinkCalibrationStore } from "./store";
import { useBlinkDetector, BlinkDetectorErrorCode } from "@/hooks/useBlinkDetector";

export function BlinkCalibrationRequestError() {
    const { setSetupStep } = useBlinkCalibrationStore();
    const { startTracking, error } = useBlinkDetector();

    const getErrorContent = () => {
        if (!error) return null;

        switch (error.code) {
            case BlinkDetectorErrorCode.CAMERA_PERMISSION_DENIED:
                return (
                    <>
                        <p className="text-red-200 font-semibold">⚠️ Camera Permission Denied</p>
                        <div className="text-sm text-red-300 mt-2 space-y-1">
                            <p className="font-semibold">Camera access was blocked.</p>
                            <p>To fix this:</p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Click the 🔒 or 🎥 icon in your browser's address bar</li>
                                <li>Change camera permission to "Allow"</li>
                                <li>Click "Try Again" below</li>
                            </ol>
                        </div>
                    </>
                );

            case BlinkDetectorErrorCode.CAMERA_NOT_FOUND:
                return (
                    <>
                        <p className="text-red-200 font-semibold">⚠️ No Camera Found</p>
                        <div className="text-sm text-red-300 mt-2 space-y-1">
                            <p>No camera device was detected on your system.</p>
                            <p>Please ensure:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Your camera is properly connected</li>
                                <li>Camera drivers are installed</li>
                                <li>No other application is using the camera</li>
                            </ul>
                        </div>
                    </>
                );

            case BlinkDetectorErrorCode.CAMERA_REQUIRES_HTTPS:
                return (
                    <>
                        <p className="text-red-200 font-semibold">⚠️ Secure Connection Required</p>
                        <div className="text-sm text-red-300 mt-2 space-y-1">
                            <p>Camera access requires a secure connection (HTTPS) or localhost.</p>
                            <p>Please access this application via:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>HTTPS URL (https://...)</li>
                                <li>Localhost (http://localhost:...)</li>
                            </ul>
                        </div>
                    </>
                );

            case BlinkDetectorErrorCode.CAMERA_API_NOT_SUPPORTED:
                return (
                    <>
                        <p className="text-red-200 font-semibold">⚠️ Browser Not Supported</p>
                        <div className="text-sm text-red-300 mt-2 space-y-1">
                            <p>Your browser doesn't support camera access.</p>
                            <p>Please use a modern browser:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Chrome (recommended)</li>
                                <li>Firefox</li>
                                <li>Edge</li>
                                <li>Safari</li>
                            </ul>
                        </div>
                    </>
                );

            case BlinkDetectorErrorCode.CAMERA_CONSTRAINTS_NOT_SUPPORTED:
                return (
                    <>
                        <p className="text-red-200 font-semibold">⚠️ Camera Settings Not Supported</p>
                        <div className="text-sm text-red-300 mt-2 space-y-1">
                            <p>Your camera doesn't support the required settings.</p>
                            <p>Try using a different camera or updating your drivers.</p>
                        </div>
                    </>
                );

            case BlinkDetectorErrorCode.MEDIAPIPE_INIT_FAILED:
            case BlinkDetectorErrorCode.MEDIAPIPE_WASM_LOAD_FAILED:
            case BlinkDetectorErrorCode.MEDIAPIPE_MODEL_LOAD_FAILED:
                return (
                    <>
                        <p className="text-red-200 font-semibold">⚠️ Failed to Load Detection System</p>
                        <div className="text-sm text-red-300 mt-2 space-y-1">
                            <p>The blink detection system failed to initialize.</p>
                            <p>This may be due to:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Network connectivity issues</li>
                                <li>Browser compatibility</li>
                                <li>Ad blockers or security extensions</li>
                            </ul>
                            <p className="mt-2 text-xs text-red-400">Error: {error.message}</p>
                        </div>
                    </>
                );

            default:
                return (
                    <>
                        <p className="text-red-200 font-semibold">⚠️ {error.message}</p>
                        <div className="text-sm text-red-300 mt-2">
                            <p>An unexpected error occurred. Please try again.</p>
                            {error.code && (
                                <p className="mt-2 text-xs text-red-400">Error Code: {error.code}</p>
                            )}
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg max-w-md">
                {getErrorContent()}
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
