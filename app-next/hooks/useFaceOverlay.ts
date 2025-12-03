import { useEffect, type RefObject } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface FaceLandmark {
    x: number;
    y: number;
    z: number;
}

export interface UseFaceOverlayOptions {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    videoRef: RefObject<HTMLVideoElement | null>;
    faceLandmarks: FaceLandmark[] | null;
    isBlinking: boolean;
    enabled?: boolean;
    showEyes?: boolean;
    showHorns?: boolean;
    showTeeth?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

// Eye landmark indices for drawing
const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

// Forehead landmark indices for horn placement
const FOREHEAD_CENTER = 10;
const LEFT_FOREHEAD = 67;
const RIGHT_FOREHEAD = 297;

// Mouth landmark indices for teeth placement
const LEFT_MOUTH_CORNER = 61; // Left corner of mouth
const RIGHT_MOUTH_CORNER = 291; // Right corner of mouth

// Upper inner lip landmarks (left to right) for curved teeth placement
const UPPER_LIP_INNER = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308];
// Lower inner lip landmarks (left to right) for curved teeth placement  
const LOWER_LIP_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308];

// ============================================================================
// Drawing Functions
// ============================================================================

function drawEyeOutline(
    ctx: CanvasRenderingContext2D,
    landmarks: FaceLandmark[],
    eyeIndices: number[],
    color: string,
    w: number,
    h: number
) {
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
}

function drawDemonHorns(
    ctx: CanvasRenderingContext2D,
    landmarks: FaceLandmark[],
    w: number,
    h: number
) {
    const foreheadCenter = landmarks[FOREHEAD_CENTER];
    const leftForehead = landmarks[LEFT_FOREHEAD];
    const rightForehead = landmarks[RIGHT_FOREHEAD];

    if (!foreheadCenter || !leftForehead || !rightForehead) return;

    // Calculate head size for scaling horns
    const headWidth = Math.abs(rightForehead.x - leftForehead.x) * w;
    const hornHeight = headWidth * 0.8;
    const hornWidth = headWidth * 0.25;

    // Draw left horn
    const leftHornBaseX = leftForehead.x * w;
    const leftHornBaseY = foreheadCenter.y * h - hornHeight * 0.1;

    ctx.beginPath();
    ctx.moveTo(leftHornBaseX - hornWidth * 0.3, leftHornBaseY);
    ctx.quadraticCurveTo(
        leftHornBaseX - hornWidth * 0.8,
        leftHornBaseY - hornHeight * 0.5,
        leftHornBaseX - hornWidth * 0.5,
        leftHornBaseY - hornHeight
    );
    ctx.quadraticCurveTo(
        leftHornBaseX - hornWidth * 0.2,
        leftHornBaseY - hornHeight * 0.6,
        leftHornBaseX + hornWidth * 0.3,
        leftHornBaseY
    );
    ctx.closePath();

    // Horn gradient fill
    const leftGradient = ctx.createLinearGradient(
        leftHornBaseX,
        leftHornBaseY,
        leftHornBaseX - hornWidth * 0.5,
        leftHornBaseY - hornHeight
    );
    leftGradient.addColorStop(0, '#4a0000');
    leftGradient.addColorStop(0.5, '#8b0000');
    leftGradient.addColorStop(1, '#2d0000');
    ctx.fillStyle = leftGradient;
    ctx.fill();
    ctx.strokeStyle = '#1a0000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw right horn
    const rightHornBaseX = rightForehead.x * w;
    const rightHornBaseY = foreheadCenter.y * h - hornHeight * 0.1;

    ctx.beginPath();
    ctx.moveTo(rightHornBaseX - hornWidth * 0.3, rightHornBaseY);
    ctx.quadraticCurveTo(
        rightHornBaseX + hornWidth * 0.2,
        rightHornBaseY - hornHeight * 0.6,
        rightHornBaseX + hornWidth * 0.5,
        rightHornBaseY - hornHeight
    );
    ctx.quadraticCurveTo(
        rightHornBaseX + hornWidth * 0.8,
        rightHornBaseY - hornHeight * 0.5,
        rightHornBaseX + hornWidth * 0.3,
        rightHornBaseY
    );
    ctx.closePath();

    // Horn gradient fill
    const rightGradient = ctx.createLinearGradient(
        rightHornBaseX,
        rightHornBaseY,
        rightHornBaseX + hornWidth * 0.5,
        rightHornBaseY - hornHeight
    );
    rightGradient.addColorStop(0, '#4a0000');
    rightGradient.addColorStop(0.5, '#8b0000');
    rightGradient.addColorStop(1, '#2d0000');
    ctx.fillStyle = rightGradient;
    ctx.fill();
    ctx.strokeStyle = '#1a0000';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawDemonTeeth(
    ctx: CanvasRenderingContext2D,
    landmarks: FaceLandmark[],
    w: number,
    h: number
) {
    const leftCorner = landmarks[LEFT_MOUTH_CORNER];
    const rightCorner = landmarks[RIGHT_MOUTH_CORNER];

    if (!leftCorner || !rightCorner) return;

    // Get upper lip curve points
    const upperLipPoints: { x: number; y: number }[] = [];
    for (const idx of UPPER_LIP_INNER) {
        const point = landmarks[idx];
        if (point) {
            upperLipPoints.push({ x: point.x * w, y: point.y * h });
        }
    }

    // Get lower lip curve points
    const lowerLipPoints: { x: number; y: number }[] = [];
    for (const idx of LOWER_LIP_INNER) {
        const point = landmarks[idx];
        if (point) {
            lowerLipPoints.push({ x: point.x * w, y: point.y * h });
        }
    }

    if (upperLipPoints.length < 5 || lowerLipPoints.length < 5) return;

    // Calculate mouth dimensions
    const mouthWidth = Math.abs(rightCorner.x - leftCorner.x) * w;
    const upperCenter = upperLipPoints[Math.floor(upperLipPoints.length / 2)];
    const lowerCenter = lowerLipPoints[Math.floor(lowerLipPoints.length / 2)];
    const mouthOpenness = Math.abs(lowerCenter.y - upperCenter.y);

    // Only show teeth if mouth is slightly open
    const minOpenness = mouthWidth * 0.02;
    if (mouthOpenness < minOpenness) return;

    // Scale teeth based on mouth openness - larger teeth
    const teethScale = Math.min(mouthOpenness / (mouthWidth * 0.2), 1.2);
    const baseToothWidth = mouthWidth * 0.08;

    // Upper teeth - follow the curve of the upper lip
    const upperTeethCount = Math.min(upperLipPoints.length - 2, 10);
    for (let i = 1; i < upperTeethCount + 1; i++) {
        const point = upperLipPoints[i];
        if (!point) continue;

        const t = i / (upperTeethCount + 1); // 0 to 1 position
        const isCanine = i === 2 || i === upperTeethCount - 1; // Canines near edges
        const isCenter = t > 0.3 && t < 0.7; // Center teeth

        let toothLength: number;
        let toothWidth: number;

        if (isCanine) {
            // Prominent vampire fangs - much larger
            toothLength = mouthWidth * 0.28 * teethScale;
            toothWidth = baseToothWidth * 1.3;
        } else if (isCenter) {
            // Front incisors - larger
            toothLength = mouthWidth * 0.16 * teethScale;
            toothWidth = baseToothWidth * 1.1;
        } else {
            // Side teeth
            toothLength = mouthWidth * 0.12 * teethScale;
            toothWidth = baseToothWidth * 0.95;
        }

        drawTooth(ctx, point.x, point.y, toothWidth, toothLength, true, isCanine);
    }

    // Lower teeth - follow the curve of the lower lip
    const lowerTeethCount = Math.min(lowerLipPoints.length - 2, 8);
    for (let i = 1; i < lowerTeethCount + 1; i++) {
        const point = lowerLipPoints[i];
        if (!point) continue;

        const t = i / (lowerTeethCount + 1);
        const isCanine = i === 2 || i === lowerTeethCount - 1;
        const isCenter = t > 0.3 && t < 0.7;

        let toothLength: number;
        let toothWidth: number;

        if (isCanine) {
            toothLength = mouthWidth * 0.16 * teethScale;
            toothWidth = baseToothWidth * 1.1;
        } else if (isCenter) {
            toothLength = mouthWidth * 0.12 * teethScale;
            toothWidth = baseToothWidth * 0.95;
        } else {
            toothLength = mouthWidth * 0.08 * teethScale;
            toothWidth = baseToothWidth * 0.85;
        }

        drawTooth(ctx, point.x, point.y, toothWidth, toothLength, false, isCanine);
    }
}

function drawTooth(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    length: number,
    pointDown: boolean,
    isCanine: boolean
) {
    const tipY = pointDown ? y + length : y - length;

    ctx.beginPath();
    if (isCanine) {
        // Sharp pointed fang
        ctx.moveTo(x - width / 2, y);
        ctx.lineTo(x, tipY);
        ctx.lineTo(x + width / 2, y);
    } else {
        // Slightly rounded regular tooth
        ctx.moveTo(x - width / 2, y);
        ctx.quadraticCurveTo(x - width / 3, tipY, x, tipY);
        ctx.quadraticCurveTo(x + width / 3, tipY, x + width / 2, y);
    }
    ctx.closePath();

    // Tooth gradient (white to slightly gray/yellow for demon look)
    const gradient = ctx.createLinearGradient(x, y, x, tipY);
    if (isCanine) {
        gradient.addColorStop(0, '#f8f8f8');
        gradient.addColorStop(0.5, '#f0f0e8');
        gradient.addColorStop(1, '#d8d8c8');
    } else {
        gradient.addColorStop(0, '#f5f5f0');
        gradient.addColorStop(0.7, '#e8e8e0');
        gradient.addColorStop(1, '#d0d0c0');
    }
    ctx.fillStyle = gradient;
    ctx.fill();

    // Outline
    ctx.strokeStyle = 'rgba(80, 80, 70, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// ============================================================================
// Hook
// ============================================================================

export function useFaceOverlay(options: UseFaceOverlayOptions) {
    const {
        canvasRef,
        videoRef,
        faceLandmarks,
        isBlinking,
        enabled = true,
        showEyes = true,
        showHorns = true,
        showTeeth = true,
    } = options;

    useEffect(() => {
        if (!enabled) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video || !faceLandmarks) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;

        ctx.clearRect(0, 0, w, h);

        // Draw eye outlines
        if (showEyes) {
            const eyeColor = isBlinking ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)';
            drawEyeOutline(ctx, faceLandmarks, LEFT_EYE_INDICES, eyeColor, w, h);
            drawEyeOutline(ctx, faceLandmarks, RIGHT_EYE_INDICES, eyeColor, w, h);
        }

        // Draw demon horns
        if (showHorns) {
            drawDemonHorns(ctx, faceLandmarks, w, h);
        }

        // Draw demon teeth/fangs
        if (showTeeth) {
            drawDemonTeeth(ctx, faceLandmarks, w, h);
        }
    }, [canvasRef, videoRef, faceLandmarks, isBlinking, enabled, showEyes, showHorns, showTeeth]);
}
