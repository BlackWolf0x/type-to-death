"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award } from "lucide-react";

export function ModalCredits() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="lg" variant="secondary" className="shadow-sm shadow-white bg-secondary/80">
                    <Award /> Credits
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Credits</DialogTitle>
                    <DialogDescription>
                        Type to Death - A Kiroween Hackathon Project
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-6 mt-4">
                        {/* Monster & Animations */}
                        <section>
                            <h3 className="text-lg font-semibold mb-2">Monster & Animations</h3>
                            <p className="text-sm text-muted-foreground">
                                <a
                                    href="https://www.mixamo.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Mixamo
                                </a>
                                {" - Character models and animations"}
                            </p>
                        </section>

                        {/* FX & Music */}
                        <section>
                            <h3 className="text-lg font-semibold mb-2">FX & Music</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>
                                    <span className="font-medium">Music</span> - Licensed from Sidearm Studios
                                </li>
                                <li>
                                    <a
                                        href="https://pixabay.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        Pixabay
                                    </a>
                                    {" - Sound effects and additional audio"}
                                </li>
                            </ul>
                        </section>

                        {/* Level Design */}
                        <section>
                            <h3 className="text-lg font-semibold mb-2">Level Design</h3>
                            <p className="text-sm text-muted-foreground">
                                Abandoned Asylum Free Asset Pack - Environment assets
                            </p>
                        </section>

                        {/* AI Tools */}
                        <section>
                            <h3 className="text-lg font-semibold mb-2">AI Tools</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>
                                    <a
                                        href="https://pixverse.ai/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        Pixverse
                                    </a>
                                    {" - AI video generation"}
                                </li>
                                <li>
                                    <a
                                        href="https://www.recraft.ai/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        Recraft
                                    </a>
                                    {" - AI design and graphics"}
                                </li>
                            </ul>
                        </section>

                        {/* Development */}
                        <section>
                            <h3 className="text-lg font-semibold mb-2">Development</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>Unity 6.1 - Game engine</li>
                                <li>Next.js - Web framework</li>
                                <li>Google MediaPipe - Blink detection</li>
                                <li>shadcn/ui - UI components</li>
                            </ul>
                        </section>

                        {/* Thank You */}
                        <section className="pt-4 border-t">
                            <p className="text-sm text-center text-muted-foreground italic">
                                Thank you to all the creators and platforms that made this project possible!
                            </p>
                        </section>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
