"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, FolderClosed } from "lucide-react";
import { VHSStatic } from "@/components/vhs-static";

export default function CasesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isDetailPage = pathname !== "/cases";

    return (
        <div className="relative min-h-screen bg-black text-white">

            <div className="fixed top-0 left-0 right-0 bottom-0">

                {/* Background image - cycles through horror images on blink */}
                <Image
                    src="/archive.png"
                    alt="Background"
                    fill
                    className={`object-cover sepia opacity-40`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                />

                {/* Film grain overlay */}
                <VHSStatic className="opacity-30!" />
            </div>

            {/* Header */}
            <div className="border-b border-red-900/30 bg-black/5 backdrop-blur-lg sticky w-full top-0 z-50">
                <div className="relative container mx-auto px-6 py-6 flex items-center gap-4">

                    {!isDetailPage && (
                        <Button
                            variant="outlineRed"
                            size="lg"
                            asChild>
                            <Link href="/">
                                <ArrowLeft className="w-4 h-4" />
                                Main Menu
                            </Link>
                        </Button>
                    )}

                    {isDetailPage && (
                        <Button
                            variant="outlineRed"
                            size="lg"
                            asChild>
                            <Link href="/cases">
                                <ArrowLeft className="w-4 h-4" />
                                View all Cases
                            </Link>
                        </Button>
                    )}

                    <h1 className={`absolute left-1/2 -translate-x-1/2 text-4xl tracking-wide font-metalMania ${!isDetailPage ? 'text-red-500' : 'opacity-30'} `}>
                        {!isDetailPage ? 'Latham Asylum Case Files' : 'Latham Asylum Case'}
                    </h1>
                </div>
            </div>

            <div className="relative z-10 container mx-auto px-6 py-20">
                {children}
            </div>
        </div>
    );
}
