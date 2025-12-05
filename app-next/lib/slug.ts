/**
 * Converts a story title to a URL-friendly slug.
 * - Converts to lowercase
 * - Removes special characters (keeps only letters, numbers, spaces, dashes)
 * - Replaces spaces with dashes
 * - Removes consecutive dashes
 * - Removes leading/trailing dashes
 */
export function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with dashes
        .replace(/-+/g, "-") // Replace multiple dashes with single
        .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
}
