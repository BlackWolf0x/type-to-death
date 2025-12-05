import { v } from "convex/values";
import { mutation } from "./_generated/server";

const FAKE_USERNAMES = [
    "SpeedTyper99",
    "KeyboardNinja",
    "TypeMaster3000",
    "BlinklessWonder",
    "FastFingers",
    "MonsterSlayer",
    "TypeOrDie",
    "WPMChamp",
    "AccuracyKing",
    "DeathTyper",
    "SurvivalMode",
    "NoBlinkZone",
    "TypeFury",
    "KeySmash",
    "WordWarrior",
    "TypingTerror",
    "FlashKeys",
    "PrecisionPro",
    "SpeedDemon",
    "TypeSurvivor",
];

/**
 * Add fake users to the database for testing purposes.
 * Creates users with random usernames and optionally adds highscores.
 */
export const addFakeUsers = mutation({
    args: {
        amount: v.number(),
    },
    handler: async (ctx, args) => {
        const { amount } = args;

        if (amount <= 0 || amount > 100) {
            throw new Error("Amount must be between 1 and 100");
        }

        const createdUserIds: string[] = [];

        for (let i = 0; i < amount; i++) {
            const randomUsername =
                FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)] +
                "_" +
                Math.floor(Math.random() * 10000);

            const userId = await ctx.db.insert("users", {
                username: randomUsername,
                email: `${randomUsername.toLowerCase()}@fake.test`,
            });

            createdUserIds.push(userId);
        }

        return {
            created: createdUserIds.length,
            userIds: createdUserIds,
        };
    },
});

/**
 * Add fake users with highscores for a specific story.
 * Useful for testing the leaderboard.
 */
export const addFakeUsersWithScores = mutation({
    args: {
        amount: v.number(),
        storyId: v.id("stories"),
    },
    handler: async (ctx, args) => {
        const { amount, storyId } = args;

        if (amount <= 0 || amount > 100) {
            throw new Error("Amount must be between 1 and 100");
        }

        // Verify story exists
        const story = await ctx.db.get(storyId);
        if (!story) {
            throw new Error("Story not found");
        }

        const createdRecords: { userId: string; score: number }[] = [];

        for (let i = 0; i < amount; i++) {
            const randomUsername =
                FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)] +
                "_" +
                Math.floor(Math.random() * 10000);

            // Create user
            const userId = await ctx.db.insert("users", {
                username: randomUsername,
                email: `${randomUsername.toLowerCase()}@fake.test`,
            });

            // Generate random stats tuned for 1-2 million score range
            // Score formula: ((Accuracy² × WPM) / Time) × 1000
            const accuracy = 80 + Math.random() * 9; // 80-89%
            const wordPerMinute = 55 + Math.random() * 5; // 55-60 WPM
            const timeTaken = 240 + Math.random() * 60; // 240-300 seconds (4-5 minutes)

            // Calculate score: ((Accuracy² × WPM) / Time) × 1000
            const score = ((accuracy * accuracy * wordPerMinute) / timeTaken) * 1000;

            // Create highscore
            await ctx.db.insert("highscores", {
                storyId,
                userId,
                wordPerMinute,
                accuracy,
                timeTaken,
                score,
                createdAt: Date.now(),
            });

            createdRecords.push({ userId, score });
        }

        return {
            created: createdRecords.length,
            records: createdRecords,
        };
    },
});
