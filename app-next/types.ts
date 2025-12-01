export interface Chapter {
    text: string;
    difficulty: "easy" | "medium" | "hard";
}

export interface Story {
    title: string;
    introduction: string;
    chapters: Chapter[];
}