import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePostsStore } from "@/stores/use-post.store";
import { Post } from "@/types/post";
import { Header } from "@/components/Header";
import { CategoryTabs } from "@/components/CategoryTabs";
import { PostCard } from "@/components/PostCard";
import { CreatePostModal } from "@/components/CreatePostModal";
import { CampusSelectorModal } from "@/components/CampusSelectorModal";
import { RepliesModal } from "@/components/RepliesModal";
import { EmptyFeed } from "@/components/EmptyFeed";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";

export default function Index() {
    const insets = useSafeAreaInsets();

    const {
        posts,
        userReactions,
        loading,
        loadingMore,
        hasMore,
        myCampus,
        showAllCampus,
        selectedCategory,
        replies,
        loadingReplies,
        initializeStore,
        fetchPosts,
        fetchMorePosts,
        toggleReaction,
        reportPost,
        addPost,
        fetchReplies,
        addReply,
        subscribeToRealtime,
        setMyCampus,
        toggleShowAllCampus,
        setSelectedCategory,
    } = usePostsStore();

    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [campusModalVisible, setCampusModalVisible] = useState(false);
    const [selectedPostForReplies, setSelectedPostForReplies] = useState<Post | null>(null);
    const [repliesModalVisible, setRepliesModalVisible] = useState(false);

    // Initialize store & Supabase Realtime subscription
    useEffect(() => {
        initializeStore();
        const unsubscribe = subscribeToRealtime();
        return () => {
            unsubscribe();
        };
    }, []);

    // Filter posts by selected category tab
    const filteredPosts = useMemo(() => {
        if (selectedCategory === "all") return posts;
        return posts.filter(
            (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
    }, [posts, selectedCategory]);

    const handleOpenCreate = () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
        setCreateModalVisible(true);
    };

    const handleOpenReplies = (post: Post) => {
        setSelectedPostForReplies(post);
        setRepliesModalVisible(true);
    };

    return (
        <View
            className="flex-1 bg-base-950"
            style={{ paddingTop: insets.top }}
        >
            <StatusBar style="light" />

            {/* Top Navigation Header */}
            <Header
                campus={myCampus}
                showAllCampus={showAllCampus}
                onOpenCampusModal={() => setCampusModalVisible(true)}
                onOpenCreateModal={handleOpenCreate}
            />

            {/* Category Filter Horizontal Tabs */}
            <CategoryTabs
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            {/* Main Feed */}
            <FlatList
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <PostCard
                        post={item}
                        userReaction={userReactions[item.id]}
                        replyCount={replies[item.id]?.length}
                        onToggleReaction={toggleReaction}
                        onReportPost={reportPost}
                        onPressReply={handleOpenReplies}
                    />
                )}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: insets.bottom + 80,
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={fetchPosts}
                        tintColor="#FF7A3D"
                        colors={["#FF7A3D"]}
                    />
                }
                onEndReached={fetchMorePosts}
                onEndReachedThreshold={0.4}
                ListEmptyComponent={
                    loading ? (
                        <View className="py-20 items-center justify-center">
                            <ActivityIndicator size="large" color="#FF7A3D" />
                            <Text className="text-mist-400 text-xs mt-3">
                                Loading confessions...
                            </Text>
                        </View>
                    ) : (
                        <EmptyFeed
                            campus={myCampus}
                            showAllCampus={showAllCampus}
                            category={selectedCategory}
                            onPressCreate={handleOpenCreate}
                        />
                    )
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View className="py-4 items-center justify-center">
                            <ActivityIndicator size="small" color="#FF7A3D" />
                        </View>
                    ) : null
                }
            />

            {/* Floating Action Button (FAB) */}
            <View
                style={{ bottom: insets.bottom + 20 }}
                className="absolute right-5"
            >
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleOpenCreate}
                    className="flex-row items-center bg-ember-500 px-5 py-3.5 rounded-full"
                >
                    <Ionicons name="flame" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text className="text-white font-bold text-[15px]">
                        Confess
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Create Post Full-Screen Modal */}
            <CreatePostModal
                visible={createModalVisible}
                campus={myCampus}
                onClose={() => setCreateModalVisible(false)}
                onSubmit={addPost}
                onSelectCampus={setMyCampus}
            />

            {/* Campus Selector Modal */}
            <CampusSelectorModal
                visible={campusModalVisible}
                currentCampus={myCampus}
                showAllCampus={showAllCampus}
                onClose={() => setCampusModalVisible(false)}
                onSelectCampus={setMyCampus}
                onToggleShowAll={toggleShowAllCampus}
            />

            {/* Replies & Discussion Modal */}
            <RepliesModal
                visible={repliesModalVisible}
                post={selectedPostForReplies}
                replies={
                    selectedPostForReplies
                        ? replies[selectedPostForReplies.id] || []
                        : []
                }
                loading={loadingReplies}
                onClose={() => setRepliesModalVisible(false)}
                onFetchReplies={fetchReplies}
                onAddReply={addReply}
            />
        </View>
    );
}