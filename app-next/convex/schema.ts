import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
    ...authTables,

    users: defineTable({
        username: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
    })
        .index("email", ["email"])
        .index("username", ["username"]),

    stories: defineTable({
        title: v.string(),
        slug: v.string(),
        introduction: v.string(),
        chapters: v.array(
            v.object({
                text: v.string(),
                difficulty: v.union(
                    v.literal("easy"),
                    v.literal("medium"),
                    v.literal("hard")
                ),
            })
        ),
        patientName: v.string(),
        patientNumber: v.string(),
        createdAt: v.number(),
        story: v.string(),
        imageGenerationPrompt: v.string(),
        storageId: v.optional(v.id("_storage")),
    })
        .index("by_createdAt", ["createdAt"])
        .index("by_slug", ["slug"]),

    highscores: defineTable({
        storyId: v.id("stories"),
        userId: v.id("users"),
        wordPerMinute: v.number(),
        accuracy: v.number(),
        timeTaken: v.number(),
        score: v.number(),
        createdAt: v.number(),
    })
        .index("by_score", ["score"])
        .index("by_user", ["userId"]),
});

export default schema;
