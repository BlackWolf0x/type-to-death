"use client";

import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ModalSetUsername } from "@/components/modal-set-username";

export function UsernameCheck() {
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

    const currentUser = useQuery(
        api.users.getCurrentUser,
        isAuthenticated ? {} : "skip"
    );

    // Show modal when authenticated and user has no username
    const shouldShowModal =
        isAuthenticated &&
        !isAuthLoading &&
        currentUser !== undefined &&
        currentUser !== null &&
        !currentUser.username;

    return <ModalSetUsername isOpen={shouldShowModal} />;
}
