import React from "react";
import { ScrollView, Text, Pressable, View } from "react-native";
import { PostCategory } from "@/types/post";
import * as Haptics from "expo-haptics";

interface CategoryItem {
    id: PostCategory | "all";
    label: string;
    icon: string;
}

const CATEGORIES: CategoryItem[] = [
    { id: "all", label: "All Posts", icon: "✨" },
    { id: "confession", label: "Confessions", icon: "🔥" },
    { id: "rant", label: "Rants", icon: "😤" },
    { id: "funny", label: "Funny", icon: "😂" },
    { id: "advice", label: "Advice", icon: "💡" },
    { id: "general", label: "General", icon: "💬" },
];

interface CategoryTabsProps {
    selectedCategory: PostCategory | "all";
    onSelectCategory: (category: PostCategory | "all") => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
    selectedCategory,
    onSelectCategory,
}) => {
    const handleSelect = (category: PostCategory | "all") => {
        try {
            Haptics.selectionAsync();
        } catch {
            // ignore haptics failure if unsupported
        }
        onSelectCategory(category);
    };

    return (
        <View className="py-2.5 bg-base-950">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            >
                {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                        <Pressable
                            key={cat.id}
                            onPress={() => handleSelect(cat.id)}
                            className={`flex-row items-center px-3.5 py-1.5 rounded-full mr-2 border ${
                                isSelected
                                    ? "bg-ember-500 border-ember-400"
                                    : "bg-base-900 border-base-800"
                            }`}
                        >
                            <Text className="text-xs mr-1">{cat.icon}</Text>
                            <Text
                                className={`text-xs ${
                                    isSelected
                                        ? "text-white font-bold"
                                        : "text-mist-300 font-medium"
                                }`}
                            >
                                {cat.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
};
