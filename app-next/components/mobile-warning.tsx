'use client'

import { useState, useEffect } from 'react'
import { Monitor, Keyboard, AlertTriangle, Webcam } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

const MOBILE_BREAKPOINT = 1280

export function MobileWarning() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Check initial viewport width
        const checkViewport = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }

        // Check on mount
        checkViewport()

        // Add resize listener
        window.addEventListener('resize', checkViewport)

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', checkViewport)
        }
    }, [])

    // Don't render anything if viewport is desktop size
    if (!isMobile) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center mb-10">
                    <div className="flex justify-center gap-4 mb-4 text-red-500">
                        <AlertTriangle className="w-12 h-12" />
                    </div>
                    <CardTitle className="text-3xl font-metal-mania text-red-500">
                        DESKTOP REQUIRED
                    </CardTitle>
                    <CardDescription className="text-base text-gray-300">
                        This game requires a desktop computer with a physical keyboard
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-6 text-center space-y-4">
                    <div className="mb-10 flex justify-center gap-10 text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <Monitor className="w-10 h-10" />
                            <span className="text-xs">Desktop</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Keyboard className="w-10 h-10" />
                            <span className="text-xs">Keyboard</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Webcam className="w-10 h-10" />
                            <span className="text-xs">Webcam</span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-400 leading-relaxed">
                        Please switch to a desktop device for the full typing horror experience.
                    </p>
                </CardContent>

                <CardFooter className="justify-center border-t border-red-500/20">
                    <p className="text-xs text-gray-500">
                        Minimum screen width: {MOBILE_BREAKPOINT}px
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
