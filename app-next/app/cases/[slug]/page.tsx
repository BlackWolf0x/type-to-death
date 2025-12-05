"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, FolderClosed, Home, Loader2, Skull } from "lucide-react";

export default function CaseDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const story = useQuery(api.stories.getStoryBySlug, { slug });

    return (
        <div className="max-w-4xl mx-auto">
            {/* Loading State */}
            {story === undefined && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    <span className="ml-3 text-white">Loading case file...</span>
                </div>
            )}

            {/* Not Found State */}
            {story === null && (
                <div className="text-center py-20">
                    <FolderClosed className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h2 className="text-xl text-gray-400 mb-2">Case File Not Found</h2>
                    <p className="text-white mb-6">
                        This case file does not exist in the asylum archives.
                    </p>
                    <Button variant="outline" asChild>
                        <Link href="/cases">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to All Cases
                        </Link>
                    </Button>
                </div>
            )}

            {/* Case Detail */}
            {story && (
                <div className="space-y-12">

                    {/* Patient Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 font-mono text-lg mb-2">
                            <span className="text-2xl">{story.patientNumber}</span>
                            <span className="text-gray-600">|</span>
                            <span>{story.patientName}</span>
                        </div>
                        <h1 className="text-5xl font-metalMania text-red-500 drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]">
                            {story.title}
                        </h1>
                    </div>

                    <div className="flex justify-center">
                        <Button size="xl" variant="outlineRed" asChild>
                            <Link href={`/play?caseid=${story._id}`}>
                                <Skull />
                                Play This Case
                            </Link>
                        </Button>
                    </div>

                    {/* Full Story */}

                    <div className="relative bg-amber-50 shadow-2xl shadow-black rounded-sm border-4 border-amber-900/20">
                        <div
                            className={`absolute z-20 w-full h-full mix-blend-multiply opacity-10`}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                backgroundColor: 'rgba(0, 0, 0, 1)',
                            }}
                        />

                        <div className="absolute -z-10 w-full h-full -rotate-3 rounded-sm bg-amber-50 border-4 border-amber-900/20">
                            <div
                                className={`absolute z-20 w-full h-full mix-blend-multiply opacity-10`}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                    backgroundColor: 'rgba(0, 0, 0, 1)',
                                }}
                            />
                        </div>

                        <p className="relative z-30 leading-relaxed whitespace-pre-line text-lg text-black p-10 font-medium">
                            {(story.story || story.introduction)
                                .replace(/\\n/g, "\n")
                                .replace(/\\"/g, '"')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
