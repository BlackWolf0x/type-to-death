import { useEffect, useRef } from "react";

export function Rain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const raindrops: Array<{
            x: number;
            y: number;
            length: number;
            speed: number;
            opacity: number;
        }> = [];

        // Create raindrops
        const createRaindrops = () => {
            const dropCount = 150;
            for (let i = 0; i < dropCount; i++) {
                raindrops.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    length: Math.random() * 20 + 10,
                    speed: Math.random() * 30,
                    opacity: Math.random() * 0.5 + 0.3,
                });
            }
        };

        createRaindrops();

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            raindrops.forEach((drop) => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x, drop.y + drop.length);
                ctx.strokeStyle = `rgba(251, 44, 54, ${drop.opacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Update position
                drop.y += drop.speed;

                // Reset raindrop when it goes off screen
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            });

            requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-20"
        // style={{ mixBlendMode: "screen" }}
        />
    );
}