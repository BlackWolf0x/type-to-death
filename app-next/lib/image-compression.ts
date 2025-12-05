/**
 * Image compression utilities for server-side image processing.
 *
 * Since Convex actions run in a serverless environment without browser APIs
 * (no canvas, Image, document), we use external compression services.
 */

export interface CompressionOptions {
    /** Maximum width or height in pixels. Default: 1024 */
    maxWidthOrHeight?: number;
    /** Target quality (0-1). Default: 0.7 */
    quality?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
    maxWidthOrHeight: 1024,
    quality: 0.7,
};

/**
 * Compresses an image blob using TinyPNG API.
 * Falls back to original if compression fails or API key not configured.
 *
 * @param blob - The original image blob to compress
 * @param options - Compression options
 * @returns Compressed image blob (or original if compression fails)
 */
export async function compressImage(
    blob: Blob,
    options: CompressionOptions = {}
): Promise<Blob> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const originalSize = blob.size;

    // Check for TinyPNG API key
    const apiKey = process.env.TINIFY_API_KEY;
    if (!apiKey) {
        console.log("TINIFY_API_KEY not set - skipping compression, returning original image");
        return blob;
    }

    try {
        // Step 1: Upload and compress with TinyPNG
        const shrinkResponse = await fetch("https://api.tinify.com/shrink", {
            method: "POST",
            headers: {
                Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
            },
            body: blob,
        });

        if (!shrinkResponse.ok) {
            const errorText = await shrinkResponse.text();
            console.error(`TinyPNG shrink error (${shrinkResponse.status}): ${errorText}`);
            return blob;
        }

        const shrinkResult = await shrinkResponse.json();

        // Step 2: Resize if needed (TinyPNG supports resize in a second request)
        const resizeBody = {
            resize: {
                method: "fit",
                width: opts.maxWidthOrHeight,
                height: opts.maxWidthOrHeight,
            },
        };

        const resizeResponse = await fetch(shrinkResult.output.url, {
            method: "POST",
            headers: {
                Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(resizeBody),
        });

        if (!resizeResponse.ok) {
            // If resize fails, just download the compressed version without resize
            console.warn("TinyPNG resize failed, downloading compressed-only version");
            const compressedResponse = await fetch(shrinkResult.output.url);
            if (!compressedResponse.ok) {
                return blob;
            }
            const compressedBlob = await compressedResponse.blob();
            logCompression(originalSize, compressedBlob.size);
            return compressedBlob;
        }

        const compressedBlob = await resizeResponse.blob();
        logCompression(originalSize, compressedBlob.size);
        return compressedBlob;
    } catch (error) {
        console.error("Image compression failed, returning original:", error);
        return blob;
    }
}

/**
 * Log compression results
 */
function logCompression(originalSize: number, compressedSize: number): void {
    const reduction = Math.round((1 - compressedSize / originalSize) * 100);
    const originalKB = Math.round(originalSize / 1024);
    const compressedKB = Math.round(compressedSize / 1024);
    console.log(
        `Image compressed: ${originalKB}KB -> ${compressedKB}KB (${reduction}% reduction)`
    );
}
