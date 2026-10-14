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
    ScrollView,
    Alert,
    Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PostCategory } from "@/types/post";
import { CAMPUS_OPTIONS } from "@/stores/use-post.store";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface CreatePostModalProps {
    visible: boolean;
    campus: string | null;
    onClose: () => void;
    onSubmit: (
        content: string,
        category: PostCategory,
        campus?: string
    ) => Promise<{ error: string | null }>;
    onSelectCampus?: (campus: string) => void;
}

const CATEGORIES: { id: PostCategory; label: string; icon: string; desc: string }[] = [
    { id: "confession", label: "Confession", icon: "🔥", desc: "Crushes, secrets & truth" },
    { id: "rant", label: "Rant", icon: "😤", desc: "Venting & frustrations" },
    { id: "funny", label: "Funny", icon: "😂", desc: "Campus memes & humor" },
    { id: "advice", label: "Advice", icon: "💡", desc: "Questions & life tips" },
    { id: "general", label: "General", icon: "💬", desc: "Casual campus talk" },
];

const MAX_CHARS = 500;

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
    visible,
    campus,
    onClose,
    onSubmit,
    onSelectCampus,
}) => {
    const insets = useSafeAreaInsets();
    const [content, setContent] = useState("");
    const [category, setCategory] = useState<PostCategory>("confession");
    const [submitting, setSubmitting] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState(campus || "UET Lahore");
    const [showCampusPicker, setShowCampusPicker] = useState(false);

    // Keep selectedCampus in sync when campus prop changes
    useEffect(() => {
        if (campus) {
            setSelectedCampus(campus);
        } else if (!selectedCampus) {
            setSelectedCampus("UET Lahore");
        }
    }, [campus]);

    const handleCategorySelect = (cat: PostCategory) => {
        try {
            Haptics.selectionAsync();
        } catch {}
        setCategory(cat);
    };

    const handlePickCampus = (newCampus: string) => {
        try {
            Haptics.selectionAsync();
        } catch {}
        setSelectedCampus(newCampus);
        setShowCampusPicker(false);
        if (onSelectCampus) {
            onSelectCampus(newCampus);
        }
    };

    const handleSubmit = async () => {
        const trimmed = content.trim();
        if (!trimmed) {
            Alert.alert("Empty Post", "Please write something to share.");
            return;
        }

        const activeCampus = selectedCampus || campus || "UET Lahore";

        setSubmitting(true);
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}

        const res = await onSubmit(trimmed, category, activeCampus);
        setSubmitting(false);

        if (res.error) {
            Alert.alert("Failed to Post", res.error);
        } else {
            try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            setContent("");
            setCategory("confession");
            onClose();
        }
    };

    const remainingChars = MAX_CHARS - content.length;
    const canSubmit = content.trim().length > 0 && !submitting;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View
                className="flex-1 bg-base-950"
                style={{ paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) }}
            >
                {/* Top Navigation Bar */}
                <View className="px-5 py-3 flex-row items-center justify-between border-b border-base-800">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={onClose}
                        className="py-1.5 px-2 -ml-2 flex-row items-center"
                    >
                        <Feather name="x" size={20} color="#B4B4C2" />
                        <Text className="text-mist-300 font-medium text-sm ml-1.5">
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center">
                        <View className="w-6 h-6 rounded-full bg-ember-500/20 border border-ember-500/40 items-center justify-center mr-1.5">
                            <Ionicons name="flame" size={13} color="#FF7A3D" />
                        </View>
                        <Text className="text-base font-bold text-white tracking-tight">
                            New Confession
                        </Text>
                    </View>

                    {/* Top Post Action Pill */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        className={`px-4 py-1.5 rounded-full ${
                            canSubmit ? "bg-ember-500" : "bg-base-800 opacity-50"
                        }`}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text
                                className={`text-xs font-bold ${
                                    canSubmit ? "text-white" : "text-mist-400"
                                }`}
                            >
                                Post
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
                    >
                        {/* Campus Selector Pill Banner */}
                        <View className="mb-4">
                            <Text className="text-[11px] font-semibold uppercase tracking-wider text-mist-400 mb-1.5">
                                Select University
                            </Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setShowCampusPicker(!showCampusPicker)}
                                className="flex-row items-center justify-between bg-base-900 border border-base-800 px-4 py-3 rounded-2xl"
                            >
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="w-8 h-8 rounded-full bg-ember-500/15 items-center justify-center mr-3">
                                        <Ionicons name="school" size={16} color="#FF8F5E" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs text-mist-400">
                                            Posting anonymously to
                                        </Text>
                                        <Text className="text-sm font-bold text-white mt-0.5">
                                            {selectedCampus}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center bg-base-800 px-2.5 py-1 rounded-lg">
                                    <Text className="text-xs font-medium text-ember-400 mr-1">
                                        {showCampusPicker ? "Close" : "Change"}
                                    </Text>
                                    <Feather
                                        name={showCampusPicker ? "chevron-up" : "chevron-down"}
                                        size={13}
                                        color="#FF8F5E"
                                    />
                                </View>
                            </TouchableOpacity>

                            {/* Dropdown Campus Picker */}
                            {showCampusPicker && (
                                <View className="bg-base-900 border border-base-800 rounded-2xl mt-2 p-2 max-h-52">
                                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                        {CAMPUS_OPTIONS.map((c) => {
                                            const isCurr = c === selectedCampus;
                                            return (
                                                <TouchableOpacity
                                                    key={c}
                                                    onPress={() => handlePickCampus(c)}
                                                    className={`flex-row items-center justify-between px-3.5 py-2.5 rounded-xl ${
                                                        isCurr ? "bg-ember-500/15" : "bg-transparent"
                                                    }`}
                                                >
                                                    <Text
                                                        className={`text-sm ${
                                                            isCurr
                                                                ? "text-ember-400 font-bold"
                                                                : "text-zinc-300 font-medium"
                                                        }`}
                                                    >
                                                        {c}
                                                    </Text>
                                                    {isCurr && (
                                                        <Ionicons
                                                            name="checkmark-circle"
                                                            size={16}
                                                            color="#FF7A3D"
                                                        />
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* Category Selector */}
                        <View className="mb-4">
                            <Text className="text-[11px] font-semibold uppercase tracking-wider text-mist-400 mb-2">
                                Select Category
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="-mx-5 px-5"
                            >
                                {CATEGORIES.map((cat) => {
                                    const isSelected = category === cat.id;
                                    return (
                                        <Pressable
                                            key={cat.id}
                                            onPress={() => handleCategorySelect(cat.id)}
                                            className={`flex-row items-center px-4 py-2 rounded-2xl mr-2.5 border ${
                                                isSelected
                                                    ? "bg-ember-500 border-ember-400"
                                                    : "bg-base-900 border-base-800"
                                            }`}
                                        >
                                            <Text className="text-base mr-1.5">{cat.icon}</Text>
                                            <View>
                                                <Text
                                                    className={`text-xs ${
                                                        isSelected
                                                            ? "text-white font-bold"
                                                            : "text-zinc-200 font-semibold"
                                                    }`}
                                                >
                                                    {cat.label}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Text Writing Canvas */}
                        <View className="bg-base-900 border border-base-800 rounded-3xl p-4 mb-4">
                            <TextInput
                                multiline
                                numberOfLines={7}
                                maxLength={MAX_CHARS}
                                placeholder="What's the tea? Confess your crush, voice a secret, or share campus thoughts. 100% anonymous..."
                                placeholderTextColor="#8B8B99"
                                value={content}
                                onChangeText={setContent}
                                textAlignVertical="top"
                                autoFocus
                                className="text-white text-base leading-relaxed min-h-[160px]"
                            />

                            {/* Privacy and character counter footer */}
                            <View className="flex-row items-center justify-between pt-3 border-t border-base-800/80 mt-3">
                                <View className="flex-row items-center">
                                    <Feather name="shield" size={13} color="#8B8B99" />
                                    <Text className="text-xs text-mist-400 ml-1.5 font-medium">
                                        End-to-End Anonymous
                                    </Text>
                                </View>

                                <Text
                                    className={`text-xs font-mono font-semibold ${
                                        remainingChars < 30 ? "text-red-400" : "text-mist-400"
                                    }`}
                                >
                                    {content.length}/{MAX_CHARS}
                                </Text>
                            </View>
                        </View>

                        {/* Large Bottom Submit Button */}
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={handleSubmit}
                            disabled={!canSubmit}
                            className={`w-full py-4 rounded-2xl flex-row items-center justify-center ${
                                canSubmit ? "bg-ember-500" : "bg-base-800 opacity-50"
                            }`}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="flame"
                                        size={18}
                                        color="#FFFFFF"
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text className="text-white font-bold text-base">
                                        Post Anonymous Confession
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Safe Community Notice */}
                        <Text className="text-[11px] text-center text-mist-400 leading-normal mt-3 px-4">
                            Keep it respectful. Do not post personal phone numbers, harassment, or real full names.
                        </Text>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};
