import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { internal } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";
import { STORY_PROMPT } from "./prompt";
import type { Story } from "../types";
import { compressImage } from "../lib/image-compression";
import { enhancePortraitPrompt } from "./facialFeatures";
import { generateFormattedCharacter } from "./characterTraits";

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
            description: "100-120 words atmospheric introduction. Use \\n\\n for paragraph breaks.",
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
            minItems: 8,
            maxItems: 8,
            description: "Exactly 8 chapters: 1-4 easy, 5-6 medium, 7-8 hard",
        },
        patientName: {
            type: "string" as const,
            description: "The patient's full name (first and last name). Must be culturally appropriate for the character's ethnicity and gender specified in CHARACTER REQUIREMENT.",
        },
        patientNumber: {
            type: "string" as const,
            description: "The patient's identification number prefixed with hashtag (e.g., #928, #2120, #15847)",
        },
        imageGenerationPrompt: {
            type: "string" as const,
            description: "Portrait prompt with: name, age, gender, ethnicity, body type, and story-related background. Format: 'Portrait of [name], [age] year old [gender] [ethnicity], [body type], background: [setting]'",
        },
        story: {
            type: "string" as const,
            description: "The full readable story combining the introduction and all chapters into a cohesive narrative. Use paragraph breaks (\\n\\n) between sections for readability.",
        },
    },
    required: ["title", "introduction", "chapters", "patientName", "patientNumber", "imageGenerationPrompt", "story"],
};

// Slugify function for converting titles to URL-friendly slugs
function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

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
        patientName: v.string(),
        patientNumber: v.string(),
        imageGenerationPrompt: v.string(),
        story: v.string(),
    },
    handler: async (ctx, args) => {
        const slug = slugify(args.title);
        const storyId = await ctx.db.insert("stories", {
            title: args.title,
            slug,
            introduction: args.introduction,
            chapters: args.chapters,
            patientName: args.patientName,
            patientNumber: args.patientNumber,
            imageGenerationPrompt: args.imageGenerationPrompt,
            story: args.story,
            createdAt: Date.now(),
        });
        return storyId;
    },
});

// Internal mutation to update a story's image storage ID
export const updateStoryImage = internalMutation({
    args: {
        storyId: v.id("stories"),
        storageId: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.storyId, {
            storageId: args.storageId,
        });
        console.log(`Updated story ${args.storyId} with image storageId: ${args.storageId}`);
    },
});

// Internal query to get previous story data (titles and patient identities for avoiding duplicates)
export const getPreviousStoryData = internalQuery({
    args: {},
    handler: async (ctx) => {
        const stories = await ctx.db
            .query("stories")
            .withIndex("by_createdAt")
            .order("asc")
            .collect();

        return stories.map(story => ({
            title: story.title,
            patientName: story.patientName,
            patientNumber: story.patientNumber,
        }));
    },
});

// Constants for retry logic
const MAX_RETRIES = 2;
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
            // Get all previous story data (titles and patient identities) to avoid repetition
            const previousStoryData = await ctx.runQuery(internal.stories.getPreviousStoryData);

            // Generate a random character description for the protagonist
            const characterDescription = generateFormattedCharacter();
            console.log(`Generated character: ${characterDescription}`);

            // Construct enhanced prompt with character description and previous titles
            let enhancedPrompt = STORY_PROMPT;
            
            // Add character description requirement
            enhancedPrompt += `\n\nCHARACTER REQUIREMENT:\nThe protagonist of this story MUST be ${characterDescription}. Use this exact description for the patient and ensure the imageGenerationPrompt matches this character.`;
            
            if (previousStoryData.length > 0) {
                const titlesList = previousStoryData.map(story => `- ${story.title}`).join('\n');
                const patientIdentitiesList = previousStoryData
                    .map(story => `- Name: ${story.patientName}, Number: ${story.patientNumber}`)
                    .join('\n');

                enhancedPrompt += `\n\nPREVIOUSLY USED (avoid these and create something completely different):\n\nTitles:\n${titlesList}\n\nPatient Identities:\n${patientIdentitiesList}`;
            }

            const anthropic = new Anthropic({ apiKey });

            // Use tool_choice to force structured JSON output
            const response = await anthropic.messages.create({
                model: "claude-sonnet-4-5-20250929",
                max_tokens: 4096,
                temperature: 1.0, // Higher temperature for more creative/varied outputs (0-1 range)
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
                        content: enhancedPrompt,
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
            if (!story.title || !story.introduction || !story.chapters || !story.patientName || !story.patientNumber || !story.imageGenerationPrompt || !story.story) {
                throw new Error("Invalid story structure - missing required fields");
            }

            if (!Array.isArray(story.chapters) || story.chapters.length !== 8) {
                throw new Error(`Invalid story structure - chapters must be an array of 8 items, got: ${story.chapters?.length}`);
            }

            // Insert the story into the database
            const storyId = await ctx.runMutation(internal.stories.insertStory, {
                title: story.title,
                introduction: story.introduction,
                chapters: story.chapters,
                patientName: story.patientName,
                patientNumber: story.patientNumber,
                imageGenerationPrompt: story.imageGenerationPrompt,
                story: story.story,
            });

            console.log("Successfully generated and stored story:", story.title);

            // Schedule patient portrait image generation (async, non-blocking)
            await ctx.scheduler.runAfter(0, internal.stories.generatePatientPortrait, {
                storyId,
                imageGenerationPrompt: story.imageGenerationPrompt,
            });
            console.log("Scheduled patient portrait generation for story:", storyId);
        } catch (error) {
            console.error(`Story generation failed (attempt ${currentRetry + 1}/${MAX_RETRIES}):`, error);

            // Schedule retry if we haven't exceeded max retries
            if (currentRetry < MAX_RETRIES) {
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

// Internal action to generate patient portrait image using Recraft.ai
export const generatePatientPortrait = internalAction({
    args: {
        storyId: v.id("stories"),
        imageGenerationPrompt: v.string(),
    },
    handler: async (ctx, args) => {
        const { storyId, imageGenerationPrompt } = args;

        // Validate prompt is not empty or whitespace-only
        if (!imageGenerationPrompt || imageGenerationPrompt.trim().length === 0) {
            console.warn(`Skipping image generation for story ${storyId}: empty or whitespace-only prompt`);
            return;
        }

        // Check for API key
        const apiKey = process.env.RECRAFT_API_KEY;
        if (!apiKey) {
            console.error("RECRAFT_API_KEY environment variable not set - skipping image generation");
            return;
        }

        try {
            console.log(`Starting image generation for story ${storyId}`);

            // Enhance the base prompt with random facial features
            const enhancedPrompt = enhancePortraitPrompt(imageGenerationPrompt);
            
            // Add moody atmosphere suffix for horror aesthetic
            const finalPrompt = `${enhancedPrompt}, heavy moody atmosphere, dark tones, unsettling mood`;
            console.log(`Final prompt: ${finalPrompt}`);

            // Call Recraft.ai API
            const response = await fetch("https://external.api.recraft.ai/v1/images/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    style_id: "1f9a9d70-2d71-4b85-9106-646bbddf1fd0",
                    model: "recraftv2",
                    size: "1024x1536",
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Recraft.ai API error (${response.status}): ${errorText}`);
                return;
            }

            const data = await response.json();

            // Extract image URL from response
            if (!data.data || !data.data[0] || !data.data[0].url) {
                console.error("Invalid Recraft.ai response - missing image URL:", JSON.stringify(data));
                return;
            }

            const imageUrl = data.data[0].url;
            console.log(`Image generated, downloading from: ${imageUrl}`);

            // Download the image
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                console.error(`Failed to download image (${imageResponse.status}): ${imageUrl}`);
                return;
            }

            const imageBlob = await imageResponse.blob();

            // Compress the image before storing
            const compressedBlob = await compressImage(imageBlob, {
                maxWidthOrHeight: 1024,
                quality: 0.8,
            });

            // Store the compressed image in Convex storage
            const storageId = await ctx.storage.store(compressedBlob);
            console.log(`Image stored with storageId: ${storageId}`);

            // Update the story document with the storage ID
            await ctx.runMutation(internal.stories.updateStoryImage, {
                storyId,
                storageId,
            });

            console.log(`Successfully generated and stored patient portrait for story ${storyId}`);
        } catch (error) {
            console.error(`Image generation failed for story ${storyId}:`, error);
            // Do not throw - image generation failure should not affect story generation
        }
    },
});

// Public query to get a story by ID or the latest story
export const getStory = query({
    args: {
        storyId: v.optional(v.id("stories")),
    },
    handler: async (ctx, args) => {
        let story;

        if (args.storyId) {
            // Fetch story by ID
            story = await ctx.db.get(args.storyId);
        } else {
            // Fetch latest story
            story = await ctx.db
                .query("stories")
                .withIndex("by_createdAt")
                .order("desc")
                .first();
        }

        if (!story) {
            return null;
        }

        // Convert storageId to image URL
        let imageUrl: string | null = null;
        if (story.storageId) {
            imageUrl = await ctx.storage.getUrl(story.storageId);
        }

        return {
            ...story,
            imageUrl,
        };
    },
});

// Public query to get all stories ordered by creation date (newest first)
export const getAllStories = query({
    args: {},
    handler: async (ctx) => {
        const stories = await ctx.db
            .query("stories")
            .withIndex("by_createdAt")
            .order("desc")
            .collect();

        // Convert storageId to image URL for each story
        const storiesWithImageUrls = await Promise.all(
            stories.map(async (story) => {
                let imageUrl: string | null = null;
                if (story.storageId) {
                    imageUrl = await ctx.storage.getUrl(story.storageId);
                }
                return {
                    ...story,
                    imageUrl,
                };
            })
        );

        return storiesWithImageUrls;
    },
});

// Public query to get a story by its slug
export const getStoryBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const story = await ctx.db
            .query("stories")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .unique();

        if (!story) {
            return null;
        }

        // Convert storageId to image URL
        let imageUrl: string | null = null;
        if (story.storageId) {
            imageUrl = await ctx.storage.getUrl(story.storageId);
        }

        return {
            ...story,
            imageUrl,
        };
    },
});
