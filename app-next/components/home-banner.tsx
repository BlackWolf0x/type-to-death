"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Award, MoveRight, Skull } from "lucide-react";
import { useEffect, useRef } from "react";
import { ModalLeaderboard } from "./modal-leaderboard";

export function HomeBanner() {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.6;
        }
    }, []);

    return (
        <section className="relative select-none flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">

            {/* Borders */}
            <div className="absolute inset-0 z-10 animate-pulse top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-1 w-[calc(100vw-70px)] h-[calc(100vh-70px)] border border-red-500 rounded-3xl" />
            <div className="absolute inset-0 z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-1 w-[calc(100vw-80px)] h-[calc(100vh-80px)] border border-red-500 rounded-3xl" />


            {/* Background effects */}
            <div className="absolute z-10 inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-red-950/20 via-transparent to-transparent" />
            <div className="absolute z-10 top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-red-900/10 blur-3xl" />
            <div className="absolute z-10 bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-red-800/10 blur-3xl delay-1000" />

            {/* Fullscreen video background */}
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/asylum.mp4" type="video/mp4" />
            </video>

            {/* Signpost */}
            <Image
                src="/signpost.png"
                width={640}
                height={357}
                quality={25}
                alt="Type To Death - Latham Asylum"
                className="absolute -left-40 bottom-0 w-140 grayscale"
            />

            {/* Film grain overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-1 mix-blend-multiply opacity-70"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundColor: 'rgba(0, 0, 0, 1)',
                }}
            />

            <div className="relative z-10 text-center max-w-5xl">
                <h1 className="text-[7rem] font-metalMania font-bold text-red-500 mb-2 text-shadow-sm text-shadow-black tracking-wide drop-shadow-[0_0_25px_rgba(220,38,38,0.8)]">
                    Type To Death
                </h1>

                <p className="mb-6 text-2xl font-light text-shadow-lg text-shadow-black">
                    Welcome to Latham Asylum, where the walls whisper forgotten patient stories and the shadows hunger for the living. Every keystroke is a heartbeat. Every blink brings them closer.
                </p>

                <p className="mb-10 text-xl font-semibold text-red-500 text-shadow-xs text-shadow-black drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] md:text-2xl">
                    Don&apos;t blink. Don&apos;t stop typing. Don&apos;t become the next story.
                </p>

                <div className="mb-10 flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
                    <Button variant="outlineRed" size="xl" className="relative -rotate-4" asChild>
                        <Link href="/play">
                            <div className="absolute -bottom-2 w-3/4 h-px rotate-2 bg-red-500" />
                            <div className="absolute -bottom-2 w-3/5 h-px -rotate-3 bg-red-500" />
                            <Skull />
                            Play Now
                            <MoveRight className="ml-2 translate-y-0.5" />
                        </Link>
                    </Button>

                    <ModalLeaderboard />
                </div>

                <p className="text-base font-light text-shadow-sm text-shadow-black">
                    New typing challenge generated every day!
                </p>
            </div>
        </section>
    );
}
