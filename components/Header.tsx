import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface HeaderProps {
    campus: string | null;
    showAllCampus: boolean;
    onOpenCampusModal: () => void;
    onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    campus,
    showAllCampus,
    onOpenCampusModal,
    onOpenCreateModal,
}) => {
    const handlePressCampus = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onOpenCampusModal();
    };

    const handlePressCreate = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onOpenCreateModal();
    };

    const campusDisplay = showAllCampus ? "All Campuses" : campus || "Select Campus";

    return (
        <View className="px-4 pt-3 pb-3 bg-base-950 border-b border-base-800">
            <View className="flex-row items-center justify-between">
                {/* Brand / Logo */}
                <View className="flex-row items-center space-x-2">
                    <View className="w-8 h-8 rounded-full bg-ember-500/20 border border-ember-500/40 items-center justify-center">
                        <Ionicons name="flame" size={18} color="#FF7A3D" />
                    </View>
                    <View className="ml-2">
                        <Text className="text-xl font-black tracking-tight text-white">
                            Confess<Text className="text-ember-400">App</Text>
                        </Text>
                        <View className="flex-row items-center mt-0.5">
                            <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                            <Text className="text-[10px] font-medium tracking-wide uppercase text-mist-400">
                                Live Feed
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Right Action Buttons */}
                <View className="flex-row items-center">
                    {/* Campus Selector Pill */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handlePressCampus}
                        className="flex-row items-center bg-base-900 border border-base-800 px-3 py-1.5 rounded-full mr-2"
                    >
                        <Ionicons
                            name={showAllCampus ? "globe-outline" : "location-sharp"}
                            size={14}
                            color="#FF8F5E"
                        />
                        <Text
                            numberOfLines={1}
                            className="text-xs font-semibold text-mist-300 ml-1.5 max-w-[110px]"
                        >
                            {campusDisplay}
                        </Text>
                        <Feather name="chevron-down" size={13} color="#8B8B99" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    {/* Quick Add Post Icon */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handlePressCreate}
                        className="w-9 h-9 rounded-full bg-ember-500 items-center justify-center"

                    >
                        <Feather name="plus" size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
