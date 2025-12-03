'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, type LucideIcon } from 'lucide-react';

export interface CalibrationCardProps {
    step: number;
    title: string;
    description: string;
    completedDescription?: string;
    disabledDescription?: string;
    icon: LucideIcon;
    isComplete: boolean;
    isDisabled?: boolean;
    isRecording: boolean;
    recordingMessage: string;
    canRecord: boolean;
    onRecord: () => void;
}

export function CalibrationCard({
    step,
    title,
    description,
    completedDescription,
    disabledDescription,
    icon: Icon,
    isComplete,
    isDisabled = false,
    isRecording,
    recordingMessage,
    canRecord,
    onRecord,
}: CalibrationCardProps) {
    const getDescription = () => {
        if (isRecording) return recordingMessage;
        if (isComplete && completedDescription) return completedDescription;
        if (isDisabled && disabledDescription) return disabledDescription;
        return description;
    };

    const getBorderClass = () => {
        if (isComplete) return 'border-green-500 bg-green-50 dark:bg-green-950';
        return 'border-zinc-200 dark:border-zinc-800';
    };

    return (
        <div
            className={`rounded-lg border p-4 transition-opacity ${getBorderClass()} ${isDisabled ? 'opacity-20' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {isComplete ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-zinc-200 text-lg font-bold dark:bg-zinc-700">
                            {step}
                        </div>
                    )}
                    <div>
                        <div className="font-medium">{title}</div>
                        <div className={`text-sm ${isRecording ? 'text-amber-600' : 'text-zinc-500'}`}>
                            {getDescription()}
                        </div>
                    </div>
                </div>
                {!isComplete && !isDisabled && (
                    <Button
                        onClick={onRecord}
                        variant="outlineRed"
                        size="xl"
                        disabled={!canRecord || isRecording}
                    >
                        {isRecording ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Recording...
                            </>
                        ) : (
                            <>
                                <Icon />
                                Record (3 sec)
                            </>
                        )}
                    </Button>
                )}
            </div>

        </div>
    );
}
