"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Home, Loader2 } from "lucide-react";

export default function CaseDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const story = useQuery(api.stories.getStoryBySlug, { slug });

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-red-900/30 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/cases">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            All Cases
                        </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Main Menu
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-8 max-w-4xl">
                {/* Loading State */}
                {story === undefined && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                        <span className="ml-3 text-gray-400">Loading case file...</span>
                    </div>
                )}

                {/* Not Found State */}
                {story === null && (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h2 className="text-xl text-gray-400 mb-2">Case File Not Found</h2>
                        <p className="text-gray-500 mb-6">
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
                    <div className="space-y-8">
                        {/* Patient Header */}
                        <div className="text-center">
                            <div className="inline-flex items-center gap-3 text-red-400 font-mono text-lg mb-2">
                                <span className="text-2xl">{story.patientNumber}</span>
                                <span className="text-gray-600">|</span>
                                <span className="text-gray-300">{story.patientName}</span>
                            </div>
                            <h1 className="text-4xl font-metalMania text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                                {story.title}
                            </h1>
                        </div>

                        <Separator className="bg-red-900/30" />

                        {/* Full Story */}
                        <Card disableRain className="bg-gray-900/30 border-red-900/20">
                            <CardContent className="pt-6">
                                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                                    {(story.story || story.introduction)
                                        .replace(/\\n/g, "\n")
                                        .replace(/\\"/g, '"')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
