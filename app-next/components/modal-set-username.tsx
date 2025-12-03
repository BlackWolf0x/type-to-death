"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

function validateUsername(username: string): { valid: boolean; error?: string } {
    const trimmed = username.trim();
    if (trimmed.length === 0) {
        return { valid: false };
    }
    if (trimmed.length < USERNAME_MIN_LENGTH) {
        return { valid: false, error: `Username must be at least ${USERNAME_MIN_LENGTH} characters` };
    }
    if (trimmed.length > USERNAME_MAX_LENGTH) {
        return { valid: false, error: `Username must be at most ${USERNAME_MAX_LENGTH} characters` };
    }
    if (!USERNAME_PATTERN.test(trimmed)) {
        return { valid: false, error: "Username can only contain letters, numbers, and underscores" };
    }
    return { valid: true };
}

interface ModalSetUsernameProps {
    isOpen: boolean;
}

export function ModalSetUsername({ isOpen }: ModalSetUsernameProps) {
    const [username, setUsername] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const [debouncedUsername, setDebouncedUsername] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const setUsernameMutation = useMutation(api.users.setUsername);

    // Debounce username for availability check (500ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedUsername(username);
        }, 500);
        return () => clearTimeout(timer);
    }, [username]);

    // Check username availability
    const isUsernameTaken = useQuery(
        api.users.isUsernameTaken,
        debouncedUsername.trim().length >= USERNAME_MIN_LENGTH &&
            validateUsername(debouncedUsername).valid
            ? { username: debouncedUsername }
            : "skip"
    );

    const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // Convert to lowercase immediately
        const value = e.target.value.toLowerCase();
        setUsername(value);
        setSaveError(null);

        const validation = validateUsername(value);
        if (value.trim().length > 0 && !validation.valid) {
            setValidationError(validation.error || null);
        } else {
            setValidationError(null);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validateUsername(username);
        if (!validation.valid) {
            setValidationError(validation.error || "Invalid username");
            return;
        }

        if (isUsernameTaken) {
            setSaveError("Username is already taken");
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            await setUsernameMutation({ username: username.trim() });
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to set username");
        } finally {
            setIsSaving(false);
        }
    };

    const isValid = validateUsername(username).valid;
    const showAvailability = isValid && debouncedUsername === username.trim();
    const isAvailable = showAvailability && isUsernameTaken === false;
    const isTaken = showAvailability && isUsernameTaken === true;
    const isChecking = showAvailability && isUsernameTaken === undefined;


    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-sm [&>button]:hidden">
                <DialogHeader>
                    <DialogTitle>Set Your Username</DialogTitle>
                    <DialogDescription>
                        Choose a unique username to continue. This will be displayed on leaderboards.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Enter your username"
                            disabled={isSaving}
                            autoFocus
                        />
                        {validationError && (
                            <p className="text-sm text-red-500">{validationError}</p>
                        )}
                        {isChecking && (
                            <p className="text-sm text-muted-foreground">Checking availability...</p>
                        )}
                        {isAvailable && (
                            <p className="text-sm text-green-500">Username is available!</p>
                        )}
                        {isTaken && (
                            <p className="text-sm text-red-500">Username is already taken</p>
                        )}
                        {saveError && (
                            <p className="text-sm text-red-500">{saveError}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!isValid || isTaken || isChecking || isSaving}
                    >
                        {isSaving ? "Saving..." : "Set Username"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
