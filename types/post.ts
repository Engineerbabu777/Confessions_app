
export type PostCategory = "confession" | "rant" | "funny" | "advice" | "general";

export interface Post {
    id: string;
    created_at: string;
    content: string;
    reaction_heart: number;
    reaction_shock: number;
    reaction_sad: number;
    reaction_laugh: number;
    category: PostCategory;
    campus: string;
    reported_count?: number;
}

export type ReactionType = "reaction_heart" | "reaction_shock" | "reaction_sad" | "reaction_laugh";