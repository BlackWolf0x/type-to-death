import { useWebcam } from "@/hooks/useWebcam";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function Webcam() {
    const {
        isStreaming,
        isLoading,
        error,
        devices,
        permissionState,
        start,
        stop,
        refresh,
        webcamRef,
    } = useWebcam({ autoStart: false });

    // Console logs for debugging
    useEffect(() => {
        console.log('🎥 useWebcam State:', {
            isStreaming,
            isLoading,
            error,
            devices: devices.map(d => ({ id: d.deviceId, label: d.label })),
            permissionState,
            webcamRef: webcamRef.current,
        });
    }, [isStreaming, isLoading, error, devices, permissionState, webcamRef]);

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Video Feed */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                <video
                    ref={webcamRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-white">Loading camera...</div>
                    </div>
                )}

                {/* Error Overlay */}
                {error && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <div className="text-red-400 text-center px-4">
                            <p className="font-semibold mb-2">Camera Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Not Streaming Overlay */}
                {!isStreaming && !isLoading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <div className="text-white text-center">
                            <p>Camera not started</p>
                            <p className="text-sm text-gray-400 mt-2">Click "Start Camera" to begin</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
                {/* Device Selection */}
                {devices.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Select Camera:</label>
                        <select
                            className="px-3 py-2 border rounded-md bg-background"
                            disabled={isStreaming}
                        >
                            {devices.map((device) => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {!isStreaming ? (
                        <Button
                            onClick={() => {
                                console.log('▶️ Starting camera...');
                                start();
                            }}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? 'Starting...' : 'Start Camera'}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                console.log('⏹️ Stopping camera...');
                                stop();
                            }}
                            variant="destructive"
                            className="flex-1"
                        >
                            Stop Camera
                        </Button>
                    )}

                    <Button
                        onClick={() => {
                            console.log('🔄 Refreshing devices...');
                            refresh();
                        }}
                        variant="outline"
                        disabled={isLoading || isStreaming}
                    >
                        Refresh Devices
                    </Button>
                </div>

                {/* Status Info */}
                <div className="text-sm text-muted-foreground">
                    {isStreaming && <p className="text-green-600">✓ Camera is streaming</p>}
                    {devices.length === 0 && !isLoading && (
                        <p className="text-yellow-600">No cameras detected. Click "Refresh Devices" to scan.</p>
                    )}
                    {devices.length > 0 && !isStreaming && (
                        <p>{devices.length} camera(s) available</p>
                    )}
                </div>
            </div>
        </div>
    );
}
