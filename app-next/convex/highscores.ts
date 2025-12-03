import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { calculateScore } from "../lib/score";

/**
 * Submit a score for a completed story.
 * Only updates the user's highscore if the new score is greater than their existing score.
 */
export const submitScore = mutation({
    args: {
        storyId: v.id("stories"),
        wordPerMinute: v.number(),
        accuracy: v.number(),
        timeTaken: v.number(),
    },
    handler: async (ctx, args) => {
        // Check authentication
        const userId = await getAuthUserId(ctx);
        if (!userId) {
            throw new Error("Unauthenticated");
        }

        // Destructure args
        const { storyId, wordPerMinute, accuracy, timeTaken } = args;

        // Validate inputs
        if (accuracy < 0 || accuracy > 100) {
            throw new Error("Invalid accuracy: must be between 0 and 100");
        }
        if (wordPerMinute <= 0 || wordPerMinute >= 500) {
            throw new Error("Invalid WPM: must be greater than 0 and less than 500");
        }
        if (timeTaken <= 0) {
            throw new Error("Invalid time: must be greater than 0");
        }

        // Calculate score
        const score = calculateScore(accuracy, wordPerMinute, timeTaken);

        // Check for existing highscore
        const existingHighscore = await ctx.db
            .query("highscores")
            .withIndex("by_user_story", (q) =>
                q.eq("userId", userId).eq("storyId", storyId)
            )
            .unique();

        if (!existingHighscore) {
            // No existing score - create new record
            await ctx.db.insert("highscores", {
                storyId,
                userId,
                wordPerMinute,
                accuracy,
                timeTaken,
                score,
                createdAt: Date.now(),
            });
        } else if (score > existingHighscore.score) {
            // New score is higher - update existing record
            await ctx.db.patch(existingHighscore._id, {
                storyId,
                wordPerMinute,
                accuracy,
                timeTaken,
                score,
                createdAt: Date.now(),
            });
        }
        // If new score <= existing score, do nothing (keep existing better score)
    },
});


/**
 * Get all highscores sorted by score in descending order (highest first).
 * Returns all records without pagination.
 */
export const getHighscores = query({
    args: {},
    handler: async (ctx) => {
        const highscores = await ctx.db
            .query("highscores")
            .withIndex("by_score")
            .order("desc")
            .collect();

        return highscores;
    },
});


/**
 * Get all highscores with user information, sorted by score descending.
 * Returns username as null if user not found.
 */
export const getHighscoresWithUsers = query({
    args: {},
    handler: async (ctx) => {
        const highscores = await ctx.db
            .query("highscores")
            .withIndex("by_score")
            .order("desc")
            .collect();

        // Enrich with user data
        const enriched = await Promise.all(
            highscores.map(async (hs) => {
                const user = await ctx.db.get(hs.userId);
                return {
                    ...hs,
                    username: user?.username ?? null,
                };
            })
        );

        return enriched;
    },
});
