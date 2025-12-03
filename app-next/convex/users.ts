import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export const getCurrentUser = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;

        const user = await ctx.db.get(userId);
        return user;
    },
});

export const isUsernameTaken = query({
    args: { username: v.string() },
    handler: async (ctx, { username }) => {
        const normalizedUsername = username.toLowerCase();
        const existing = await ctx.db
            .query("users")
            .withIndex("username", (q) => q.eq("username", normalizedUsername))
            .first();
        return !!existing;
    },
});


export const setUsername = mutation({
    args: { username: v.string() },
    handler: async (ctx, { username }) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Validate username format
        const trimmedUsername = username.trim();
        if (trimmedUsername.length < USERNAME_MIN_LENGTH) {
            throw new Error(`Username must be at least ${USERNAME_MIN_LENGTH} characters`);
        }
        if (trimmedUsername.length > USERNAME_MAX_LENGTH) {
            throw new Error(`Username must be at most ${USERNAME_MAX_LENGTH} characters`);
        }
        if (!USERNAME_PATTERN.test(trimmedUsername)) {
            throw new Error("Username can only contain letters, numbers, and underscores");
        }

        const normalizedUsername = trimmedUsername.toLowerCase();

        // Check if username is already taken (race condition protection)
        const existing = await ctx.db
            .query("users")
            .withIndex("username", (q) => q.eq("username", normalizedUsername))
            .first();
        if (existing) {
            throw new Error("Username is already taken");
        }

        // Get current user
        const user = await ctx.db.get(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Check if user already has a username
        if (user.username) {
            throw new Error("Username already set");
        }

        // Save username
        await ctx.db.patch(userId, { username: normalizedUsername });

        return { success: true };
    },
});
