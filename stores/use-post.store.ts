import { supabase } from "@/lib/supabase";
import { Post, PostCategory, ReactionType } from "@/types/post";
import { Reply } from "@/types/replies";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const REACTIONS_KEY = "user_reactions_v1";
const REPORTED_KEY = "user_reported_posts_v1";
const CAMPUS_KEY = "user_campus_v1";
const REPORT_HIDE_THRESHOLD = 3;
const PAGE_SIZE = 20;

export const CAMPUS_OPTIONS = [
    "UET Lahore",
    "FAST-NUCES",
    "NUST Islamabad",
    "LUMS",
    "COMSATS",
    "GIKI",
    "Punjab University (PU)",
    "IBA Karachi",
    "NED University",
    "PIEAS",
];

interface PostsState {
    posts: Post[];
    userReactions: Record<string, ReactionType>;
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    reportedPostIds: string[];
    myCampus: string | null;
    showAllCampus: boolean;
    selectedCategory: PostCategory | "all";
    replies: Record<string, Reply[]>;
    loadingReplies: boolean;

    setMyCampus: (campus: string) => void;
    toggleShowAllCampus: () => void;
    setSelectedCategory: (category: PostCategory | "all") => void;

    loadCampus: () => Promise<void>;
    loadUserReactions: () => Promise<void>;
    loadReportedPosts: () => Promise<void>;
    initializeStore: () => Promise<void>;

    fetchPosts: () => Promise<void>;
    fetchMorePosts: () => Promise<void>;

    toggleReaction: (postId: string, reaction: ReactionType) => Promise<void>;
    togglePostReport: (postId: string) => Promise<void>;

    addPost: (
        content: string,
        category: PostCategory,
        campus?: string
    ) => Promise<{ error: string | null; data?: Post }>;

    reportPost: (
        postId: string
    ) => Promise<{ error: string | null }>;

    fetchReplies: (postId: string) => Promise<{ data: Reply[]; error: string | null }>;
    addReply: (postId: string, content: string) => Promise<{ error: string | null; data?: Reply }>;

    upsertPost: (
        post: Post
    ) => void;

    subscribeToRealtime: () => () => void;
}


export const usePostsStore = create<PostsState>((set, get) => ({
    posts: [],
    userReactions: {},
    loading: false,
    loadingMore: false,
    hasMore: true,
    reportedPostIds: [],
    myCampus: null,
    showAllCampus: false,
    selectedCategory: "all",
    replies: {},
    loadingReplies: false,


    setSelectedCategory: (category: PostCategory | "all") => {
        set({ selectedCategory: category });
    },

    setMyCampus: (campus: string) => {
        set({ myCampus: campus });
        AsyncStorage.setItem(CAMPUS_KEY, campus).catch((err) =>
            console.error("Failed to save campus to storage:", err)
        );
        if (!get().showAllCampus) {
            get().fetchPosts();
        }
    },

    toggleShowAllCampus: () => {
        const nextShowAll = !get().showAllCampus;
        set({ showAllCampus: nextShowAll });
        get().fetchPosts();
    },

    loadCampus: async () => {
        try {
            const campus = await AsyncStorage.getItem(CAMPUS_KEY);
            if (campus) {
                set({ myCampus: campus });
            } else {
                const defaultCampus = "UET Lahore";
                set({ myCampus: defaultCampus });
                await AsyncStorage.setItem(CAMPUS_KEY, defaultCampus);
            }
        } catch (e) {
            console.error("Failed to load campus from storage:", e);
        }
    },

    loadUserReactions: async () => {
        try {
            const reactions = await AsyncStorage.getItem(REACTIONS_KEY);
            if (reactions) {
                set({ userReactions: JSON.parse(reactions) });
            }
        } catch (e) {
            console.error("Failed to load user reactions:", e);
        }
    },

    loadReportedPosts: async () => {
        try {
            const reported = await AsyncStorage.getItem(REPORTED_KEY);
            if (reported) {
                set({ reportedPostIds: JSON.parse(reported) });
            }
        } catch (e) {
            console.error("Failed to load reported posts:", e);
        }
    },

    initializeStore: async () => {
        await Promise.all([
            get().loadCampus(),
            get().loadUserReactions(),
            get().loadReportedPosts(),
        ]);
        await get().fetchPosts();
    },

    fetchPosts: async () => {
        set({ loading: true });
        const { myCampus, showAllCampus, reportedPostIds } = get();

        if (!showAllCampus && !myCampus) {
            set({ posts: [], loading: false, hasMore: false });
            return;
        }

        let query = supabase.from("posts").select("*");

        if (!showAllCampus && myCampus) {
            query = query.eq("campus", myCampus);
        }

        query = query
            .order("created_at", { ascending: false })
            .range(0, PAGE_SIZE - 1);

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching posts:", error);
            set({ loading: false });
            return;
        }

        const rawPosts = (data as Post[]) || [];
        const filteredPosts = rawPosts.filter(
            (post) =>
                !reportedPostIds.includes(post.id) &&
                (!post.reported_count || post.reported_count < REPORT_HIDE_THRESHOLD)
        );

        set({
            posts: filteredPosts,
            hasMore: rawPosts.length === PAGE_SIZE,
            loading: false,
        });
    },

    fetchMorePosts: async () => {
        const { loading, loadingMore, hasMore, posts, myCampus, showAllCampus, reportedPostIds } = get();

        if (loading || loadingMore || !hasMore) return;
        if (!showAllCampus && !myCampus) return;

        set({ loadingMore: true });

        let query = supabase.from("posts").select("*");

        if (!showAllCampus && myCampus) {
            query = query.eq("campus", myCampus);
        }

        const from = posts.length;
        const to = from + PAGE_SIZE - 1;

        const { data, error } = await query
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) {
            console.error("Error fetching more posts:", error);
            set({ loadingMore: false });
            return;
        }

        const rawPosts = (data as Post[]) || [];
        const filteredPosts = rawPosts.filter(
            (post) =>
                !reportedPostIds.includes(post.id) &&
                (!post.reported_count || post.reported_count < REPORT_HIDE_THRESHOLD) &&
                !posts.some((existing) => existing.id === post.id)
        );

        set({
            posts: [...posts, ...filteredPosts],
            hasMore: rawPosts.length === PAGE_SIZE,
            loadingMore: false,
        });
    },

    toggleReaction: async (postId: string, reaction: ReactionType) => {
        const { posts, userReactions } = get();
        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        const currentReaction = userReactions[postId];
        const isRemoving = currentReaction === reaction;
        const previousReaction = !isRemoving && currentReaction ? currentReaction : null;

        const nextUserReactions = { ...userReactions };
        if (isRemoving) {
            delete nextUserReactions[postId];
        } else {
            nextUserReactions[postId] = reaction;
        }

        const updatedPost: Post = { ...post };
        if (isRemoving) {
            updatedPost[reaction] = Math.max(0, updatedPost[reaction] - 1);
        } else {
            if (previousReaction) {
                updatedPost[previousReaction] = Math.max(0, updatedPost[previousReaction] - 1);
            }
            updatedPost[reaction] = updatedPost[reaction] + 1;
        }

        set({
            posts: posts.map((p) => (p.id === postId ? updatedPost : p)),
            userReactions: nextUserReactions,
        });

        AsyncStorage.setItem(REACTIONS_KEY, JSON.stringify(nextUserReactions)).catch((err) =>
            console.error("Failed to save reactions to storage:", err)
        );

        const dbUpdates: Partial<Record<ReactionType, number>> = {};
        if (isRemoving) {
            dbUpdates[reaction] = updatedPost[reaction];
        } else {
            if (previousReaction) {
                dbUpdates[previousReaction] = updatedPost[previousReaction];
            }
            dbUpdates[reaction] = updatedPost[reaction];
        }

        const { error } = await supabase.from("posts").update(dbUpdates).eq("id", postId);

        if (error) {
            console.error("Failed to update reaction in Supabase:", error);
            set({
                posts: get().posts.map((p) => (p.id === postId ? post : p)),
                userReactions,
            });
            AsyncStorage.setItem(REACTIONS_KEY, JSON.stringify(userReactions)).catch(console.error);
        }
    },

    togglePostReport: async (postId: string) => {
        const { reportedPostIds } = get();
        if (reportedPostIds.includes(postId)) {
            const updated = reportedPostIds.filter((id) => id !== postId);
            set({ reportedPostIds: updated });
            await AsyncStorage.setItem(REPORTED_KEY, JSON.stringify(updated));
            get().fetchPosts();
        } else {
            await get().reportPost(postId);
        }
    },

    addPost: async (content: string, category: PostCategory, campus?: string) => {
        const { myCampus } = get();
        const targetCampus = campus || myCampus;

        if (!targetCampus) {
            return { error: "Please select a campus before creating a post." };
        }
        if (!content.trim()) {
            return { error: "Post content cannot be empty." };
        }

        const newPostPayload = {
            content: content.trim(),
            category,
            campus: targetCampus,
            reaction_heart: 0,
            reaction_shock: 0,
            reaction_sad: 0,
            reaction_laugh: 0,
        };

        const { data, error } = await supabase
            .from("posts")
            .insert([newPostPayload])
            .select("*")
            .single();

        if (error) {
            console.error("Error adding post:", error);
            return { error: error.message };
        }

        const createdPost = data as Post;
        set((state) => ({
            posts: [createdPost, ...state.posts],
        }));

        return { error: null, data: createdPost };
    },

    reportPost: async (postId: string) => {
        try {
            const { reportedPostIds, posts } = get();
            if (reportedPostIds.includes(postId)) {
                return { error: null };
            }

            const updatedReported = [...reportedPostIds, postId];
            set({
                reportedPostIds: updatedReported,
                posts: posts.filter((post) => post.id !== postId),
            });

            await AsyncStorage.setItem(REPORTED_KEY, JSON.stringify(updatedReported));

            const post = posts.find((p) => p.id === postId);
            if (post && typeof post.reported_count === "number") {
                await supabase
                    .from("posts")
                    .update({ reported_count: post.reported_count + 1 })
                    .eq("id", postId);
            }

            return { error: null };
        } catch (err: any) {
            console.error("Error reporting post:", err);
            return { error: err?.message || "Failed to report post" };
        }
    },

    fetchReplies: async (postId: string) => {
        set({ loadingReplies: true });
        const { data, error } = await supabase
            .from("replies")
            .select("*")
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching replies:", error);
            set({ loadingReplies: false });
            return { data: [], error: error.message };
        }

        const list = (data as Reply[]) || [];
        set((state) => ({
            replies: { ...state.replies, [postId]: list },
            loadingReplies: false,
        }));
        return { data: list, error: null };
    },

    addReply: async (postId: string, content: string) => {
        const trimmed = content.trim();
        if (!trimmed) {
            return { error: "Reply cannot be empty." };
        }
        if (trimmed.length > 200) {
            return { error: "Reply cannot exceed 200 characters." };
        }

        const { data, error } = await supabase
            .from("replies")
            .insert([{ post_id: postId, content: trimmed }])
            .select("*")
            .single();

        if (error) {
            console.error("Error adding reply:", error);
            return { error: error.message };
        }

        const newReply = data as Reply;
        set((state) => {
            const current = state.replies[postId] || [];
            return {
                replies: {
                    ...state.replies,
                    [postId]: [...current, newReply],
                },
            };
        });

        return { error: null, data: newReply };
    },


    upsertPost: (post: Post) => {
        set((state) => {
            const exists = state.posts.some((p) => p.id === post.id);
            if (exists) {
                return {
                    posts: state.posts.map((p) => (p.id === post.id ? post : p)),
                };
            }
            return {
                posts: [post, ...state.posts],
            };
        });
    },

    subscribeToRealtime: () => {
        const channel = supabase
            .channel("public:posts")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "posts" },
                (payload) => {
                    const newPost = payload.new as Post;
                    const { myCampus, showAllCampus, reportedPostIds, posts } = get();

                    if (!showAllCampus && myCampus && newPost.campus !== myCampus) {
                        return;
                    }

                    if (reportedPostIds.includes(newPost.id)) {
                        return;
                    }

                    if (posts.some((p) => p.id === newPost.id)) {
                        return;
                    }

                    set((state) => ({
                        posts: [newPost, ...state.posts],
                    }));
                }
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "posts" },
                (payload) => {
                    const updatedPost = payload.new as Post;
                    set((state) => ({
                        posts: state.posts.map((post) =>
                            post.id === updatedPost.id ? { ...post, ...updatedPost } : post
                        ),
                    }));
                }
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "posts" },
                (payload) => {
                    const deletedId = (payload.old as { id?: string })?.id;
                    if (!deletedId) return;
                    set((state) => ({
                        posts: state.posts.filter((post) => post.id !== deletedId),
                    }));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
}));