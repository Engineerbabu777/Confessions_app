import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Post } from "@/types/post";
import { Reply } from "@/types/replies";
import { formatTimeAgo } from "@/utils/date";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface RepliesModalProps {
    visible: boolean;
    post: Post | null;
    replies: Reply[];
    loading: boolean;
    onClose: () => void;
    onFetchReplies: (postId: string) => Promise<any>;
    onAddReply: (postId: string, content: string) => Promise<{ error: string | null; data?: Reply }>;
}

const MAX_REPLY_CHARS = 200;

export const RepliesModal: React.FC<RepliesModalProps> = ({
    visible,
    post,
    replies,
    loading,
    onClose,
    onFetchReplies,
    onAddReply,
}) => {
    const insets = useSafeAreaInsets();
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (visible && post) {
            onFetchReplies(post.id);
        }
    }, [visible, post?.id]);

    if (!post) return null;

    const handleSubmitReply = async () => {
        const trimmed = replyText.trim();
        if (!trimmed) return;

        setSubmitting(true);
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}

        const res = await onAddReply(post.id, trimmed);
        setSubmitting(false);

        if (res.error) {
            Alert.alert("Error", res.error);
        } else {
            try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            setReplyText("");
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 bg-base-950"
                style={{ paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 8) }}
            >
                {/* Header */}
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-base-800">
                    <View className="flex-row items-center">
                        <View className="w-7 h-7 rounded-full bg-ember-500/20 border border-ember-500/40 items-center justify-center mr-2">
                            <Ionicons name="chatbubbles" size={14} color="#FF7A3D" />
                        </View>
                        <Text className="text-base font-bold text-white tracking-tight">
                            Replies & Discussion
                        </Text>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={onClose}
                        className="w-8 h-8 rounded-full bg-base-900 border border-base-800 items-center justify-center"
                    >
                        <Feather name="x" size={16} color="#B4B4C2" />
                    </TouchableOpacity>
                </View>

                {/* Original Confession Card Snippet */}
                <View className="mx-4 mt-3 p-3.5 bg-base-900/90 border border-base-800 rounded-2xl">
                    <View className="flex-row items-center justify-between mb-1.5">
                        <View className="flex-row items-center">
                            <Text className="text-xs font-bold text-ember-400 capitalize mr-2">
                                {post.category}
                            </Text>
                            <Text className="text-xs text-mist-400 font-medium">
                                • {post.campus}
                            </Text>
                        </View>
                        <Text className="text-[11px] text-mist-400">
                            {formatTimeAgo(post.created_at)}
                        </Text>
                    </View>
                    <Text
                        numberOfLines={3}
                        className="text-zinc-200 text-sm leading-relaxed"
                    >
                        "{post.content}"
                    </Text>
                </View>

                {/* Replies Feed */}
                <View className="flex-1 px-4 mt-3">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-mist-400 mb-2 px-1">
                        Anonymous Responses ({replies.length})
                    </Text>

                    {loading ? (
                        <View className="py-12 items-center justify-center">
                            <ActivityIndicator size="small" color="#FF7A3D" />
                            <Text className="text-xs text-mist-400 mt-2">
                                Loading replies...
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={replies}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <View className="bg-base-900 border border-base-800/80 rounded-2xl p-3.5 mb-2.5">
                                    <View className="flex-row items-center justify-between mb-1">
                                        <View className="flex-row items-center">
                                            <View className="w-5 h-5 rounded-full bg-base-800 items-center justify-center mr-1.5">
                                                <Feather name="user" size={10} color="#8B8B99" />
                                            </View>
                                            <Text className="text-xs font-semibold text-mist-300">
                                                Student #{index + 1}
                                            </Text>
                                        </View>
                                        <Text className="text-[11px] text-mist-400">
                                            {formatTimeAgo(item.created_at)}
                                        </Text>
                                    </View>
                                    <Text className="text-zinc-200 text-sm leading-relaxed pl-6">
                                        {item.content}
                                    </Text>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View className="py-12 items-center justify-center">
                                    <Ionicons
                                        name="chatbubble-ellipses-outline"
                                        size={28}
                                        color="#8B8B99"
                                    />
                                    <Text className="text-zinc-300 text-sm font-semibold mt-2">
                                        No replies yet
                                    </Text>
                                    <Text className="text-mist-400 text-xs text-center mt-1">
                                        Be the first to reply anonymously to this confession!
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>

                {/* Input Bar */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
                >
                    <View className="px-4 pt-2 pb-1 border-t border-base-800 bg-base-950">
                        <View className="flex-row items-center bg-base-900 border border-base-800 rounded-2xl px-3 py-1.5">
                            <TextInput
                                placeholder="Add an anonymous reply (max 200 chars)..."
                                placeholderTextColor="#8B8B99"
                                value={replyText}
                                onChangeText={setReplyText}
                                maxLength={MAX_REPLY_CHARS}
                                multiline
                                className="flex-1 text-white text-sm py-1.5 max-h-24 mr-2"
                            />
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleSubmitReply}
                                disabled={submitting || !replyText.trim()}
                                className={`w-9 h-9 rounded-xl items-center justify-center ${
                                    replyText.trim() && !submitting
                                        ? "bg-ember-500"
                                        : "bg-base-800 opacity-40"
                                }`}
                            >
                                {submitting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center justify-between px-2 pt-1.5">
                            <Text className="text-[10px] text-mist-400">
                                🔒 100% anonymous reply
                            </Text>
                            <Text
                                className={`text-[10px] font-mono ${
                                    MAX_REPLY_CHARS - replyText.length < 20
                                        ? "text-red-400 font-bold"
                                        : "text-mist-400"
                                }`}
                            >
                                {replyText.length}/{MAX_REPLY_CHARS}
                            </Text>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
