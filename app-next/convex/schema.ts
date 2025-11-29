import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
    ...authTables,

    users: defineTable({
        username: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
    }).index("email", ["email"]),

    stories: defineTable({
        title: v.string(),
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
        createdAt: v.number(),
    }).index("by_createdAt", ["createdAt"]),
});

export default schema;
