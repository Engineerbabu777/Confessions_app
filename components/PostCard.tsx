import React from "react";
import { View, Text, TouchableOpacity, Alert, Share } from "react-native";
import { Post, PostCategory, ReactionType } from "@/types/post";
import { formatTimeAgo } from "@/utils/date";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface PostCardProps {
    post: Post;
    userReaction?: ReactionType;
    replyCount?: number;
    onToggleReaction: (postId: string, reaction: ReactionType) => void;
    onReportPost: (postId: string) => void;
    onPressReply?: (post: Post) => void;
}

interface ReactionConfig {
    key: ReactionType;
    emoji: string;
    label: string;
}

const REACTIONS: ReactionConfig[] = [
    { key: "reaction_heart", emoji: "❤️", label: "Heart" },
    { key: "reaction_laugh", emoji: "😂", label: "Laugh" },
    { key: "reaction_shock", emoji: "😲", label: "Shock" },
    { key: "reaction_sad", emoji: "😢", label: "Sad" },
];

const CATEGORY_STYLES: Record<
    PostCategory,
    { badgeBg: string; badgeBorder: string; badgeText: string; icon: string }
> = {
    confession: {
        badgeBg: "bg-ember-500/15",
        badgeBorder: "border-ember-500/30",
        badgeText: "text-ember-400",
        icon: "🔥",
    },
    rant: {
        badgeBg: "bg-rose-500/15",
        badgeBorder: "border-rose-500/30",
        badgeText: "text-rose-400",
        icon: "😤",
    },
    funny: {
        badgeBg: "bg-amber-500/15",
        badgeBorder: "border-amber-500/30",
        badgeText: "text-amber-400",
        icon: "😂",
    },
    advice: {
        badgeBg: "bg-emerald-500/15",
        badgeBorder: "border-emerald-500/30",
        badgeText: "text-emerald-400",
        icon: "💡",
    },
    general: {
        badgeBg: "bg-indigo-500/15",
        badgeBorder: "border-indigo-500/30",
        badgeText: "text-indigo-300",
        icon: "💬",
    },
};

export const PostCard: React.FC<PostCardProps> = ({
    post,
    userReaction,
    replyCount,
    onToggleReaction,
    onReportPost,
    onPressReply,
}) => {
    const categoryStyle =
        CATEGORY_STYLES[post.category] || CATEGORY_STYLES.general;

    const handleReaction = (reaction: ReactionType) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        onToggleReaction(post.id, reaction);
    };

    const handleShare = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await Share.share({
                message: `"${post.content}"\n\n— Anonymous Confession from ${post.campus} on ConfessApp`,
            });
        } catch (e) {
            console.error("Share error:", e);
        }
    };

    const handleReport = () => {
        Alert.alert(
            "Report Post",
            "Are you sure you want to report this post? It will be hidden from your feed and flagged for review.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Report",
                    style: "destructive",
                    onPress: () => {
                        try {
                            Haptics.notificationAsync(
                                Haptics.NotificationFeedbackType.Warning
                            );
                        } catch {}
                        onReportPost(post.id);
                    },
                },
            ]
        );
    };

    return (
        <View className="bg-base-900 border border-base-800 rounded-2xl p-4 mb-3.5">
            {/* Top Meta Bar */}
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-wrap flex-1 mr-2">
                    {/* Category Pill */}
                    <View
                        className={`flex-row items-center px-2.5 py-0.5 rounded-full border mr-2 ${categoryStyle.badgeBg} ${categoryStyle.badgeBorder}`}
                    >
                        <Text className="text-[11px] mr-1">
                            {categoryStyle.icon}
                        </Text>
                        <Text
                            className={`text-[11px] font-bold capitalize ${categoryStyle.badgeText}`}
                        >
                            {post.category}
                        </Text>
                    </View>

                    {/* Campus Tag */}
                    <View className="flex-row items-center mr-2">
                        <Ionicons name="location-outline" size={12} color="#8B8B99" />
                        <Text className="text-xs text-mist-400 font-medium ml-0.5">
                            {post.campus}
                        </Text>
                    </View>

                    {/* Relative Time */}
                    <Text className="text-xs text-mist-400">
                        • {formatTimeAgo(post.created_at)}
                    </Text>
                </View>

                {/* Share & Report Actions */}
                <View className="flex-row items-center space-x-2">
                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={handleShare}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className="p-1 mr-1"
                    >
                        <Feather name="share-2" size={13} color="#8B8B99" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={handleReport}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className="p-1"
                    >
                        <Feather name="flag" size={13} color="#8B8B99" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Post Content */}
            <Text className="text-[15px] leading-relaxed text-zinc-100 font-normal select-text mb-3.5">
                {post.content}
            </Text>

            {/* Bottom Actions / Reactions & Replies */}
            <View className="flex-row items-center justify-between pt-3 border-t border-base-800/80">
                <View className="flex-row items-center flex-wrap">
                    {REACTIONS.map((r) => {
                        const count = post[r.key] || 0;
                        const isSelected = userReaction === r.key;
                        return (
                            <TouchableOpacity
                                key={r.key}
                                activeOpacity={0.6}
                                onPress={() => handleReaction(r.key)}
                                className={`flex-row items-center px-2.5 py-1.5 rounded-xl border mr-1.5 mb-1 ${
                                    isSelected
                                        ? "bg-ember-500/20 border-ember-500/70"
                                        : "bg-base-800/40 border-base-800"
                                }`}
                            >
                                <Text className="text-sm mr-1">{r.emoji}</Text>
                                <Text
                                    className={`text-xs font-semibold ${
                                        isSelected
                                            ? "text-ember-400 font-bold"
                                            : "text-mist-400"
                                    }`}
                                >
                                    {count}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Reply Action Pill */}
                    {onPressReply && (
                        <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={() => {
                                try {
                                    Haptics.selectionAsync();
                                } catch {}
                                onPressReply(post);
                            }}
                            className="flex-row items-center px-2.5 py-1.5 rounded-xl bg-base-800/40 border border-base-800 mb-1"
                        >
                            <Feather name="message-circle" size={13} color="#8B8B99" />
                            <Text className="text-xs text-mist-400 font-semibold ml-1">
                                {typeof replyCount === "number" && replyCount > 0
                                    ? replyCount
                                    : "Reply"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Anonymous Badge */}
                <View className="flex-row items-center mb-1">
                    <Feather name="shield" size={12} color="#8B8B99" />
                    <Text className="text-[11px] text-mist-400 ml-1">
                        Anon
                    </Text>
                </View>
            </View>
        </View>
    );
};
