import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Switch,
    Pressable,
} from "react-native";

import { CAMPUS_OPTIONS } from "@/stores/use-post.store";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface CampusSelectorModalProps {
    visible: boolean;
    currentCampus: string | null;
    showAllCampus: boolean;
    onClose: () => void;
    onSelectCampus: (campus: string) => void;
    onToggleShowAll: () => void;
}

export const CampusSelectorModal: React.FC<CampusSelectorModalProps> = ({
    visible,
    currentCampus,
    showAllCampus,
    onClose,
    onSelectCampus,
    onToggleShowAll,
}) => {
    const [customCampus, setCustomCampus] = useState("");

    const handleSelect = (campus: string) => {
        Haptics.selectionAsync();
        onSelectCampus(campus);
        onClose();
    };

    const handleCustomSubmit = () => {
        if (!customCampus.trim()) return;
        Haptics.selectionAsync();
        onSelectCampus(customCampus.trim());
        setCustomCampus("");
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/80">
                <Pressable className="flex-1" onPress={onClose} />
                <View className="bg-base-950 border-t border-base-800 rounded-t-3xl max-h-[85%] p-5 pb-8">

                    {/* Header */}
                    <View className="flex-row items-center justify-between pb-3 border-b border-base-800">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full bg-ember-500/20 border border-ember-500/30 items-center justify-center mr-2.5">
                                <Ionicons name="school" size={17} color="#FF7A3D" />
                            </View>
                            <Text className="text-lg font-bold text-white">
                                Select Campus
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={onClose}
                            className="w-8 h-8 rounded-full bg-base-900 border border-base-800 items-center justify-center"
                        >
                            <Feather name="x" size={16} color="#B4B4C2" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
                        {/* Toggle All Campuses */}
                        <View className="bg-base-900 border border-base-800 rounded-2xl p-4 mb-4 flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 mr-3">
                                <View className="w-8 h-8 rounded-full bg-base-800 items-center justify-center mr-3">
                                    <Ionicons name="globe-outline" size={18} color="#FF8F5E" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-semibold text-sm">
                                        All Universities
                                    </Text>
                                    <Text className="text-xs text-mist-400">
                                        View posts from all campuses nationwide
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={showAllCampus}
                                onValueChange={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    onToggleShowAll();
                                }}
                                trackColor={{ false: "#1C1C24", true: "#FF7A3D" }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        {/* List of Universities */}
                        <Text className="text-xs font-semibold text-mist-300 uppercase tracking-wider mb-2">
                            Select Your University
                        </Text>
                        <View className="space-y-1.5 mb-4">
                            {CAMPUS_OPTIONS.map((campus) => {
                                const isSelected =
                                    !showAllCampus && currentCampus === campus;
                                return (
                                    <TouchableOpacity
                                        key={campus}
                                        activeOpacity={0.7}
                                        onPress={() => handleSelect(campus)}
                                        className={`flex-row items-center justify-between p-3.5 rounded-xl border mb-1.5 ${
                                            isSelected
                                                ? "bg-ember-500/15 border-ember-500"
                                                : "bg-base-900 border-base-800"
                                        }`}
                                    >
                                        <View className="flex-row items-center flex-1 mr-2">
                                            <Ionicons
                                                name="location"
                                                size={16}
                                                color={isSelected ? "#FF7A3D" : "#8B8B99"}
                                                style={{ marginRight: 10 }}
                                            />
                                            <Text
                                                className={`text-sm ${
                                                    isSelected
                                                        ? "text-white font-bold"
                                                        : "text-zinc-200 font-medium"
                                                }`}
                                            >
                                                {campus}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={18}
                                                color="#FF7A3D"
                                            />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Custom University Input */}
                        <Text className="text-xs font-semibold text-mist-300 uppercase tracking-wider mb-2">
                            Other University
                        </Text>
                        <View className="flex-row items-center bg-base-900 border border-base-800 rounded-xl px-3 py-1 mb-2">
                            <TextInput
                                placeholder="Enter custom campus name..."
                                placeholderTextColor="#8B8B99"
                                value={customCampus}
                                onChangeText={setCustomCampus}
                                className="flex-1 text-white text-sm py-2"
                            />
                            <TouchableOpacity
                                onPress={handleCustomSubmit}
                                disabled={!customCampus.trim()}
                                className={`px-3 py-1.5 rounded-lg ${
                                    customCampus.trim()
                                        ? "bg-ember-500"
                                        : "bg-base-800 opacity-50"
                                }`}
                            >
                                <Text className="text-white text-xs font-bold">
                                    Set
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
