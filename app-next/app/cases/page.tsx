"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, FolderClosed, Loader2, User } from "lucide-react";
import { slugify } from "@/lib/slug";
import Image from "next/image";
import { VHSStatic } from "@/components/vhs-static";

// Generate random rotation between 2-10 degrees, can be positive or negative
function getRandomRotation(): number {
    const magnitude = 2 + Math.random() * 8; // 2 to 10
    const sign = Math.random() > 0.5 ? 1 : -1;
    return magnitude * sign;
}

export default function CasesPage() {
    const stories = useQuery(api.stories.getAllStories);

    return (
        <>

            {/* Content */}
            {/* Loading State */}
            {stories === undefined && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    <span className="ml-3 text-white">Loading case files...</span>
                </div>
            )}

            {/* Empty State */}
            {stories !== undefined && stories.length === 0 && (
                <div className="text-center py-20">
                    <FolderClosed className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <h2 className="text-xl text-gray-400 mb-2">No Case Files Found</h2>
                    <p className="text-white">
                        The asylum archives are empty. Check back later.
                    </p>
                </div>
            )}

            {/* Case List */}
            {stories !== undefined && stories.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {stories.map((story) => {
                        const imageRotation = getRandomRotation();

                        return (
                            <Link
                                key={story._id}
                                href={`/cases/${slugify(story.title)}`}
                                className="relative transition-all scale-90 hover:scale-100 hover:-rotate-2 will-change-transform shadow-xl shadow-black"
                            >
                                <div className="overflow-hidden absolute left-6 -top-4 w-20 h-4 rounded-lg rounded-b-none bg-[#D5BD8F]">
                                    <div
                                        className={`absolute z-20 w-full h-full mix-blend-multiply opacity-30`}
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                            backgroundColor: 'rgba(0, 0, 0, 1)',
                                        }}
                                    />
                                </div>

                                <div className="overflow-hidden relative aspect-video rounded-2xl rounded-b-sm bg-[#D5BD8F]" >

                                    <div
                                        className={`absolute z-20 w-full h-full mix-blend-multiply opacity-30`}
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                                            backgroundColor: 'rgba(0, 0, 0, 1)',
                                        }}
                                    />

                                    {/* Outer piece */}


                                    <div className="relative z-10 left-0 bottom-0 w-full h-full rounded-t-sm rounded-b-sm overflow-hidden">
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[calc(100%-20px)] h-[calc(100%-10px)] rounded-t-sm rotate-1 bg-yellow-50 shadow-[0px_-2px_2px_0px_rgba(0,0,0,0.2)]"></div>
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[calc(100%-20px)] h-[calc(100%-10px)] rounded-t-sm -rotate-2 bg-yellow-50 shadow-[0px_-2px_2px_0px_rgba(0,0,0,0.2)]"></div>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-10px)] h-[calc(100%-20px)] rounded-t-xl shadow-[0px_-4px_4px_0px_rgba(0,0,0,0.4)] bg-[#D5BD8F]">

                                            <figure
                                                className="absolute top-10 left-6 border-4 border-white shadow-lg shadow-black/60"
                                                style={{ transform: `rotate(${imageRotation}deg)` }}
                                            >
                                                {story.imageUrl ? (

                                                    <Image src={`${story.imageUrl}`} width={100} height={150} alt="case" />
                                                ) : (
                                                    <div className="w-[100px] h-[150px] flex justify-center items-center">
                                                        <User size={80} />
                                                    </div>
                                                )}
                                            </figure>

                                            <div className="pl-38 pr-2 pt-10 text-black italic">
                                                <h3 className="font-bold text-xl leading-5 mb-4"> {story.title}</h3>
                                                <p className="text-sm font-medium">Case ID: {story.patientNumber}</p>
                                                <p className="text-sm font-medium">Full Name: {story.patientName}</p>
                                                <p className="mt-6 text-sm font-medium opacity-60">Created:&nbsp;
                                                    {new Date(story.createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </>
    );
}
