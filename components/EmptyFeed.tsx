import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface EmptyFeedProps {
    campus: string | null;
    showAllCampus: boolean;
    category: string;
    onPressCreate: () => void;
}

export const EmptyFeed: React.FC<EmptyFeedProps> = ({
    campus,
    showAllCampus,
    category,
    onPressCreate,
}) => {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPressCreate();
    };

    const target = showAllCampus
        ? "any campus"
        : campus
        ? campus
        : "this campus";

    return (
        <View className="items-center justify-center py-16 px-6">
            <View className="w-16 h-16 rounded-3xl bg-ember-500/10 border border-ember-500/20 items-center justify-center mb-4">
                <Ionicons name="chatbubbles-outline" size={32} color="#FF7A3D" />
            </View>

            <Text className="text-white text-lg font-bold text-center mb-1.5">
                No Confessions Found
            </Text>

            <Text className="text-mist-400 text-sm text-center leading-relaxed mb-6 max-w-[280px]">
                {category !== "all"
                    ? `No ${category} posts yet for ${target}.`
                    : `The feed is completely quiet for ${target}. Be the first to drop an anonymous confession!`}
            </Text>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePress}
                className="bg-ember-500 px-5 py-2.5 rounded-full flex-row items-center"

            >
                <Ionicons name="flame" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text className="text-white font-bold text-sm">
                    Be the First to Confess
                </Text>
            </TouchableOpacity>
        </View>
    );
};
