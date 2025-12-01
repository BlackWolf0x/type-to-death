import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Generate a new story every 24 hours at midnight UTC
crons.daily(
    "generate daily story",
    { hourUTC: 0, minuteUTC: 0 },
    internal.stories.generateStory,
    {} // Empty arguments - retryCount defaults to 0
);

export default crons;
