import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Post, PostCategory, ReactionType } from "@/types/post";
import { formatTimeAgo } from "@/utils/date";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface PostCardProps {
    post: Post;
    userReaction?: ReactionType;
    onToggleReaction: (postId: string, reaction: ReactionType) => void;
    onReportPost: (postId: string) => void;
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
    onToggleReaction,
    onReportPost,
}) => {
    const categoryStyle =
        CATEGORY_STYLES[post.category] || CATEGORY_STYLES.general;

    const handleReaction = (reaction: ReactionType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggleReaction(post.id, reaction);
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
                        Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Warning
                        );
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

                {/* Report / Overflow Button */}
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={handleReport}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="p-1"
                >
                    <Feather name="flag" size={14} color="#8B8B99" />
                </TouchableOpacity>
            </View>

            {/* Post Content */}
            <Text className="text-[15px] leading-relaxed text-zinc-100 font-normal select-text mb-3.5">
                {post.content}
            </Text>

            {/* Bottom Actions / Reactions */}
            <View className="flex-row items-center justify-between pt-3 border-t border-base-800/80">
                <View className="flex-row items-center space-x-2">
                    {REACTIONS.map((r) => {
                        const count = post[r.key] || 0;
                        const isSelected = userReaction === r.key;
                        return (
                            <TouchableOpacity
                                key={r.key}
                                activeOpacity={0.6}
                                onPress={() => handleReaction(r.key)}
                                className={`flex-row items-center px-2.5 py-1.5 rounded-xl border mr-2 ${
                                    isSelected
                                        ? "bg-ember-500/20 border-ember-500/70"
                                        : "bg-base-800/40 border-base-800"
                                }`}
                            >
                                <Text className="text-sm mr-1.5">{r.emoji}</Text>
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
                </View>

                {/* Anonymous Tag */}
                <View className="flex-row items-center">
                    <Feather name="shield" size={12} color="#8B8B99" />
                    <Text className="text-[11px] text-mist-400 ml-1">
                        Anon
                    </Text>
                </View>
            </View>
        </View>
    );
};
