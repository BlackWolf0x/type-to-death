import { useState, useEffect, useRef, useCallback, type RefObject } from 'react';
import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

// ============================================================================
// Types
// ============================================================================

export interface UseBackgroundSegmentationOptions {
    videoRef: RefObject<HTMLVideoElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    enabled?: boolean;
    backgroundDarkness?: number; // 0-1, how dark the background should be
    vhsEffect?: boolean; // Enable VHS-style effects (chromatic aberration, noise)
}

export interface UseBackgroundSegmentationReturn {
    isInitialized: boolean;
    isProcessing: boolean;
    error: Error | null;
}

// ============================================================================
// Constants
// ============================================================================

const MEDIAPIPE_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
const SEGMENTATION_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';

// VHS effect constants - pre-calculated for performance
const CHROMATIC_OFFSET = 10;
const NOISE_INTENSITY = 30;

// ============================================================================
// Hook
// ============================================================================

export function useBackgroundSegmentation(options: UseBackgroundSegmentationOptions): UseBackgroundSegmentationReturn {
    const { videoRef, canvasRef, enabled = true, backgroundDarkness = 0.7, vhsEffect = false } = options;

    const [isInitialized, setIsInitialized] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const segmenterRef = useRef<ImageSegmenter | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number>(0);
    const mountedRef = useRef(true);

    // Pre-allocated buffers for performance - avoid GC pressure
    const noiseBufferRef = useRef<Float32Array | null>(null);
    const noiseIndexRef = useRef(0);

    // Initialize MediaPipe Image Segmenter
    useEffect(() => {
        if (!enabled) return;

        mountedRef.current = true;

        async function init() {
            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

                const segmenter = await ImageSegmenter.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: SEGMENTATION_MODEL_URL,
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    outputCategoryMask: false,
                    outputConfidenceMasks: true,
                });

                if (mountedRef.current) {
                    segmenterRef.current = segmenter;
                    setIsInitialized(true);
                }
            } catch (err) {
                console.error('Failed to initialize background segmentation:', err);
                if (mountedRef.current) {
                    setError(err instanceof Error ? err : new Error('Failed to initialize segmentation'));
                }
            }
        }

        init();

        return () => {
            mountedRef.current = false;
            if (segmenterRef.current) {
                segmenterRef.current.close();
                segmenterRef.current = null;
            }
        };
    }, [enabled]);

    // Pre-generate noise buffer for VHS effect (avoids Math.random() per pixel)
    useEffect(() => {
        if (vhsEffect && !noiseBufferRef.current) {
            // Pre-generate 10000 random noise values
            const buffer = new Float32Array(10000);
            for (let i = 0; i < buffer.length; i++) {
                buffer[i] = (Math.random() - 0.5) * NOISE_INTENSITY;
            }
            noiseBufferRef.current = buffer;
        }
    }, [vhsEffect]);

    // Process video frames with segmentation
    const processFrame = useCallback((timestamp: number) => {
        if (!mountedRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const segmenter = segmenterRef.current;

        if (!video || !canvas || !segmenter || !enabled) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }

        if (video.readyState !== video.HAVE_ENOUGH_DATA) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }

        // Throttle to ~30fps for performance (every ~33ms)
        if (timestamp - lastFrameTimeRef.current < 33) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }
        lastFrameTimeRef.current = timestamp;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }

        // Set canvas size to match video (only when changed)
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
            canvas.width = videoWidth;
            canvas.height = videoHeight;
        }

        try {
            // Get segmentation result
            const result = segmenter.segmentForVideo(video, timestamp);
            const confidenceMasks = result.confidenceMasks;

            if (confidenceMasks && confidenceMasks.length > 0) {
                const mask = confidenceMasks[0];

                // Draw original video frame
                ctx.drawImage(video, 0, 0);

                // Get image data
                const imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
                const pixels = imageData.data;
                const maskData = mask.getAsFloat32Array();
                const pixelCount = maskData.length;

                // Apply background darkening in a single pass
                // Optimized: avoid function calls, use local variables
                const darkness = backgroundDarkness;
                for (let i = 0; i < pixelCount; i++) {
                    const idx = i << 2; // i * 4 using bit shift
                    const personConfidence = maskData[i];
                    const darkenFactor = 1 - (1 - personConfidence) * darkness;

                    pixels[idx] = pixels[idx] * darkenFactor;
                    pixels[idx + 1] = pixels[idx + 1] * darkenFactor;
                    pixels[idx + 2] = pixels[idx + 2] * darkenFactor;
                }

                // Apply VHS effects if enabled (optimized)
                if (vhsEffect) {
                    const time = timestamp * 0.001;
                    const noiseBuffer = noiseBufferRef.current;
                    let noiseIdx = noiseIndexRef.current;

                    // Chromatic aberration - process in scanlines for cache efficiency
                    for (let y = 0; y < videoHeight; y++) {
                        const rowStart = y * videoWidth;
                        for (let x = 0; x < videoWidth - CHROMATIC_OFFSET; x++) {
                            const idx = (rowStart + x) << 2;
                            const sourceIdx = (rowStart + x + CHROMATIC_OFFSET) << 2;
                            // Blend red channel from offset position
                            pixels[idx] = (pixels[sourceIdx] * 0.7 + pixels[idx] * 0.3) | 0;
                        }
                    }

                    // Add noise using pre-generated buffer
                    if (noiseBuffer) {
                        const bufferLen = noiseBuffer.length;
                        for (let i = 0; i < pixelCount; i++) {
                            const idx = i << 2;
                            const noise = noiseBuffer[noiseIdx];
                            noiseIdx = (noiseIdx + 1) % bufferLen;

                            // Clamp values inline
                            let r = pixels[idx] + noise;
                            let g = pixels[idx + 1] + noise;
                            let b = pixels[idx + 2] + noise;
                            pixels[idx] = r < 0 ? 0 : r > 255 ? 255 : r;
                            pixels[idx + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
                            pixels[idx + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
                        }
                        noiseIndexRef.current = noiseIdx;
                    }


                }

                ctx.putImageData(imageData, 0, 0);
                mask.close();
            }

            if (!isProcessing && mountedRef.current) {
                setIsProcessing(true);
            }
        } catch {
            // Silently handle frame processing errors - don't spam console
        }

        animationFrameRef.current = requestAnimationFrame(processFrame);
    }, [videoRef, canvasRef, enabled, backgroundDarkness, vhsEffect, isProcessing]);

    // Start/stop processing loop
    useEffect(() => {
        if (!isInitialized || !enabled) return;

        animationFrameRef.current = requestAnimationFrame(processFrame);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            if (mountedRef.current) {
                setIsProcessing(false);
            }
        };
    }, [isInitialized, enabled, processFrame]);

    return {
        isInitialized,
        isProcessing,
        error,
    };
}
