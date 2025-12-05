"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { slugify } from "@/lib/slug";
import Image from "next/image";

export default function CasesPage() {
    const stories = useQuery(api.stories.getAllStories);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-red-900/30 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Main Menu
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-metalMania text-red-500">
                        Asylum Case Files
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-8">
                {/* Loading State */}
                {stories === undefined && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                        <span className="ml-3 text-gray-400">Loading case files...</span>
                    </div>
                )}

                {/* Empty State */}
                {stories !== undefined && stories.length === 0 && (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h2 className="text-xl text-gray-400 mb-2">No Case Files Found</h2>
                        <p className="text-gray-500">
                            The asylum archives are empty. Check back later.
                        </p>
                    </div>
                )}

                {/* Case List */}
                {stories !== undefined && stories.length > 0 && (
                    <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-3">
                        {stories.map((story) => (
                            <Link
                                key={story._id}
                                href={`/cases/${slugify(story.title)}`}
                            >
                                <Card className="bg-gray-900/50 border-red-900/30 hover:border-red-500/50 hover:bg-gray-900/70 transition-all cursor-pointer h-full">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center gap-2 text-red-400 text-sm font-mono mb-1">
                                            <span>{story.patientNumber}</span>
                                            <span className="text-gray-600">•</span>
                                            <span className="text-gray-400">{story.patientName}</span>
                                        </div>
                                        <CardTitle className="text-lg text-white leading-tight">
                                            {story.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-500 text-sm">
                                            {new Date(story.createdAt).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}



                        {stories.map((story) => (
                            <Link
                                key={story._id}
                                href={`/cases/${slugify(story.title)}`}
                            >
                                <div className="relative aspect-video rounded-2xl mt-8 rounded-b-sm bg-[#D5BD8F] rotate-1">

                                    {/* Outer piece */}
                                    <div className="absolute left-6 -top-4 w-20 h-4 rounded-lg rounded-b-none bg-[#D5BD8F]" />

                                    <div className="relative z-10 left-0 bottom-0 w-full h-full rounded-t-sm rounded-b-sm overflow-hidden">
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[calc(100%-20px)] h-[calc(100%-10px)] rounded-t-sm rotate-1 bg-yellow-50 shadow-[0px_-2px_2px_0px_rgba(0,0,0,0.2)]"></div>
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[calc(100%-20px)] h-[calc(100%-10px)] rounded-t-sm -rotate-2 bg-yellow-50 shadow-[0px_-2px_2px_0px_rgba(0,0,0,0.2)]"></div>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-10px)] h-[calc(100%-20px)] rounded-t-xl shadow-[0px_-4px_4px_0px_rgba(0,0,0,0.4)] bg-[#D5BD8F]">

                                            <figure className="absolute left-3 rotate-3">
                                                <Image src={`/case-images/test.jpg`} width={100} height={133} alt="case" className="border-4 border-white shadow-lg shadow-black/60" />
                                            </figure>

                                            <div className="pl-32 pt-4 text-black">
                                                <h3 className="font-bold"> {story.title}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
