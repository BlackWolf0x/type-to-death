import { v } from "convex/values";
import { internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import { STORY_PROMPT } from "./prompt";
import type { Story } from "../types";

// JSON Schema for the story structure - used for tool-based structured output
const STORY_SCHEMA = {
    type: "object" as const,
    properties: {
        title: {
            type: "string" as const,
            description: "A compelling, atmospheric horror title (3-8 words)",
        },
        introduction: {
            type: "string" as const,
            description: "120-180 words atmospheric introduction. Use \\n\\n for paragraph breaks.",
        },
        chapters: {
            type: "array" as const,
            items: {
                type: "object" as const,
                properties: {
                    text: {
                        type: "string" as const,
                        description: "Chapter text as a single continuous paragraph with no line breaks",
                    },
                    difficulty: {
                        type: "string" as const,
                        enum: ["easy", "medium", "hard"],
                        description: "Chapter difficulty level",
                    },
                },
                required: ["text", "difficulty"],
            },
            minItems: 10,
            maxItems: 10,
            description: "Exactly 10 chapters: 1-4 easy, 5-8 medium, 9-10 hard",
        },
    },
    required: ["title", "introduction", "chapters"],
};

// Internal mutation to insert a story into the database
export const insertStory = internalMutation({
    args: {
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
    },
    handler: async (ctx, args) => {
        const storyId = await ctx.db.insert("stories", {
            title: args.title,
            introduction: args.introduction,
            chapters: args.chapters,
            createdAt: Date.now(),
        });
        return storyId;
    },
});


// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

// Internal action to generate a story using Claude
export const generateStory = internalAction({
    args: {
        retryCount: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const currentRetry = args.retryCount ?? 0;
        const apiKey = process.env.CLAUDE_API_KEY;

        if (!apiKey) {
            console.error("CLAUDE_API_KEY environment variable not set");
            return;
        }

        try {
            const anthropic = new Anthropic({ apiKey });

            // Use tool_choice to force structured JSON output
            const response = await anthropic.messages.create({
                model: "claude-sonnet-4-5-20250929",
                max_tokens: 4096,
                tools: [
                    {
                        name: "generate_story",
                        description: "Generate a horror story for the typing game",
                        input_schema: STORY_SCHEMA,
                    },
                ],
                tool_choice: { type: "tool", name: "generate_story" },
                messages: [
                    {
                        role: "user",
                        content: STORY_PROMPT,
                    },
                ],
            });

            // Find the tool_use block in the response
            const toolUseBlock = response.content.find(
                (block) => block.type === "tool_use"
            );

            if (!toolUseBlock || toolUseBlock.type !== "tool_use") {
                throw new Error("No tool_use block found in response");
            }

            // The input is already parsed as the Story structure
            const story = toolUseBlock.input as Story;

            // Validate required fields
            if (!story.title || !story.introduction || !story.chapters) {
                throw new Error("Invalid story structure - missing required fields");
            }

            if (!Array.isArray(story.chapters) || story.chapters.length !== 10) {
                throw new Error(`Invalid story structure - chapters must be an array of 10 items, got: ${story.chapters?.length}`);
            }

            // Insert the story into the database
            await ctx.runMutation(internal.stories.insertStory, {
                title: story.title,
                introduction: story.introduction,
                chapters: story.chapters,
            });

            console.log("Successfully generated and stored story:", story.title);
        } catch (error) {
            console.error(`Story generation failed (attempt ${currentRetry + 1}/${MAX_RETRIES}):`, error);

            // Schedule retry if we haven't exceeded max retries
            if (currentRetry < MAX_RETRIES - 1) {
                console.log(`Scheduling retry in 5 minutes (attempt ${currentRetry + 2}/${MAX_RETRIES})`);
                await ctx.scheduler.runAfter(RETRY_DELAY_MS, internal.stories.generateStory, {
                    retryCount: currentRetry + 1,
                });
            } else {
                console.error("Max retries exceeded. Story generation will be attempted again by the daily cron job.");
            }
        }
    },
});

// Public query to get the latest story
export const getLatestStory = query({
    args: {},
    handler: async (ctx) => {
        const story = await ctx.db
            .query("stories")
            .withIndex("by_createdAt")
            .order("desc")
            .first();

        return story;
    },
});
