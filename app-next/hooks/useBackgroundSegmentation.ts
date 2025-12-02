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
    ghostEffect?: boolean; // Make the person look like a ghost (pale, desaturated, eerie)
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

// ============================================================================
// Hook
// ============================================================================

export function useBackgroundSegmentation(options: UseBackgroundSegmentationOptions): UseBackgroundSegmentationReturn {
    const { videoRef, canvasRef, enabled = true, backgroundDarkness = 0.7, vhsEffect = false, ghostEffect = false } = options;

    const [isInitialized, setIsInitialized] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const segmenterRef = useRef<ImageSegmenter | null>(null);
    const processingRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);

    // Ghost trail effect - store previous person silhouettes
    const ghostFramesRef = useRef<{ data: Uint8ClampedArray; mask: Float32Array; timestamp: number }[]>([]);
    const activeGhostRef = useRef<{ data: Uint8ClampedArray; mask: Float32Array; offsetX: number; opacity: number; startTime: number } | null>(null);

    // Initialize MediaPipe Image Segmenter
    useEffect(() => {
        if (!enabled) return;

        let mounted = true;

        async function init() {
            try {
                console.log('Initializing MediaPipe Image Segmenter...');

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

                if (mounted) {
                    segmenterRef.current = segmenter;
                    setIsInitialized(true);
                    console.log('Background segmentation initialized successfully');
                }
            } catch (err) {
                console.error('Failed to initialize background segmentation:', err);
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to initialize segmentation'));
                }
            }
        }

        init();

        return () => {
            mounted = false;
            if (segmenterRef.current) {
                segmenterRef.current.close();
                segmenterRef.current = null;
            }
        };
    }, [enabled]);


    // Process video frames with segmentation
    const processFrame = useCallback(() => {
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

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }

        // Set canvas size to match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        try {
            // Get segmentation result
            const result = segmenter.segmentForVideo(video, performance.now());
            const confidenceMasks = result.confidenceMasks;

            if (confidenceMasks && confidenceMasks.length > 0) {
                const mask = confidenceMasks[0];

                // Draw original video frame
                ctx.drawImage(video, 0, 0);

                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const pixels = imageData.data;
                const maskData = mask.getAsFloat32Array();

                const width = canvas.width;
                const height = canvas.height;

                const now = performance.now();

                // Store current frame for ghost trail (every 500ms, keep last 5)
                if (ghostEffect && (ghostFramesRef.current.length === 0 || now - ghostFramesRef.current[ghostFramesRef.current.length - 1].timestamp > 500)) {
                    ghostFramesRef.current.push({
                        data: new Uint8ClampedArray(pixels),
                        mask: new Float32Array(maskData),
                        timestamp: now,
                    });
                    if (ghostFramesRef.current.length > 5) {
                        ghostFramesRef.current.shift();
                    }
                }

                // Occasionally spawn a ghost trail (higher chance, more frequent)
                if (ghostEffect && !activeGhostRef.current && ghostFramesRef.current.length >= 2 && Math.random() < 0.02) {
                    const oldFrame = ghostFramesRef.current[Math.floor(Math.random() * ghostFramesRef.current.length)];
                    activeGhostRef.current = {
                        data: oldFrame.data,
                        mask: oldFrame.mask,
                        offsetX: (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 50),
                        opacity: 0.6,
                        startTime: now,
                    };
                }

                // Apply effects based on confidence (0 = background, 1 = person)
                for (let i = 0; i < maskData.length; i++) {
                    const pixelIndex = i * 4;
                    const personConfidence = maskData[i];

                    let r = pixels[pixelIndex];
                    let g = pixels[pixelIndex + 1];
                    let b = pixels[pixelIndex + 2];

                    if (personConfidence > 0.3 && ghostEffect) {
                        // Ghost effect: desaturate the person
                        const grey = r * 0.299 + g * 0.587 + b * 0.114;
                        const ghostStrength = Math.min(1, (personConfidence - 0.3) / 0.5);
                        r = r * (1 - ghostStrength * 0.7) + grey * (ghostStrength * 0.7);
                        g = g * (1 - ghostStrength * 0.7) + grey * (ghostStrength * 0.7);
                        b = b * (1 - ghostStrength * 0.7) + grey * (ghostStrength * 0.7);
                    }

                    // Darken background
                    const darkenAmount = (1 - personConfidence) * backgroundDarkness;
                    pixels[pixelIndex] = r * (1 - darkenAmount);
                    pixels[pixelIndex + 1] = g * (1 - darkenAmount);
                    pixels[pixelIndex + 2] = b * (1 - darkenAmount);
                }

                // Apply VHS effects if enabled
                if (vhsEffect) {
                    const time = performance.now() * 0.001;

                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            const i = (y * width + x) * 4;

                            // Chromatic aberration - shift red channel slightly
                            const aberrationOffset = 6;
                            if (x + aberrationOffset < width) {
                                const sourceIdx = (y * width + x + aberrationOffset) * 4;
                                pixels[i] = pixels[sourceIdx] * 0.8 + pixels[i] * 0.2;
                            }

                            // Random noise (subtle)
                            const noise = (Math.random() - 0.5) * 30;
                            pixels[i] = Math.max(0, Math.min(255, pixels[i] + noise));
                            pixels[i + 1] = Math.max(0, Math.min(255, pixels[i + 1] + noise));
                            pixels[i + 2] = Math.max(0, Math.min(255, pixels[i + 2] + noise));
                        }
                    }

                    // Vertical rolling bar effect (slow and subtle)
                    const barY = Math.floor((time * 8) % height);
                    const barHeight = 30;
                    for (let by = 0; by < barHeight; by++) {
                        const y = (barY + by) % height;
                        for (let x = 0; x < width; x++) {
                            const i = (y * width + x) * 4;
                            const brightness = 1 + (Math.sin(by / barHeight * Math.PI) * 0.06);
                            pixels[i] = Math.min(255, pixels[i] * brightness);
                            pixels[i + 1] = Math.min(255, pixels[i + 1] * brightness);
                            pixels[i + 2] = Math.min(255, pixels[i + 2] * brightness);
                        }
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                mask.close();
            }

            if (!isProcessing) setIsProcessing(true);
        } catch (err) {
            // Silently handle frame processing errors
            console.error('Segmentation frame error:', err);
        }

        animationFrameRef.current = requestAnimationFrame(processFrame);
    }, [videoRef, canvasRef, enabled, backgroundDarkness, isProcessing]);

    // Start/stop processing loop
    useEffect(() => {
        if (!isInitialized || !enabled) return;

        processingRef.current = true;
        animationFrameRef.current = requestAnimationFrame(processFrame);

        return () => {
            processingRef.current = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            setIsProcessing(false);
        };
    }, [isInitialized, enabled, processFrame]);

    return {
        isInitialized,
        isProcessing,
        error,
    };
}
