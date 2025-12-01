import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Image, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSocialStore } from '../state/socialStore';
import { useAuthStore } from '../state/authStore';
import { useModerationStore } from '../state/moderationStore';
import { Post, User, Comment } from '../types/golf';
import CreatePostModal from '../components/CreatePostModal';
import CommentSection from '../components/CommentSection';
import WeatherWidget from '../components/WeatherWidget';
import AchievementPost from '../components/AchievementPost';
import RewardShareModal from '../components/RewardShareModal';
import PostOptionsMenu from '../components/PostOptionsMenu';
import { getFullGreeting } from '../utils/greetings';
import { useRewardsStore } from '../state/rewardsStore';
import { ACHIEVEMENT_TEMPLATES } from '../types/rewards';

interface HomeFeedScreenProps {
  navigation: any;
}

export default function HomeFeedScreen({ navigation }: HomeFeedScreenProps) {
  const { posts, likePost, addPost, addComment, addReply, likeComment, likeReply, deletePost, deleteComment } = useSocialStore();
  const { user } = useAuthStore();
  const { userRewards } = useRewardsStore();
  const { blockedUsers } = useModerationStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [currentGreeting, setCurrentGreeting] = useState(getFullGreeting(user?.name));

  // Filter out posts from blocked users
  const filteredPosts = useMemo(() => {
    if (!user) return posts;
    const blockedUserIds = blockedUsers
      .filter(block => block.blockerId === user.id)
      .map(block => block.blockedUserId);
    return posts.filter(post => !blockedUserIds.includes(post.userId));
  }, [posts, blockedUsers, user]);

  // Update greeting when user changes or time changes
  React.useEffect(() => {
    setCurrentGreeting(getFullGreeting(user?.name));
    
    // Update greeting every hour to handle time changes
    const interval = setInterval(() => {
      setCurrentGreeting(getFullGreeting(user?.name));
    }, 60 * 60 * 1000); // Every hour
    
    return () => clearInterval(interval);
  }, [user?.name]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh and update weather
    setTimeout(() => {
      setRefreshing(false);
      // Refresh weather data
      setCurrentGreeting(getFullGreeting(user?.name));
    }, 1000);
  }, [user?.name]);

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return 'unknown';
    
    const now = new Date();
    const postDate = new Date(date);
    
    // Check if the date is valid
    if (isNaN(postDate.getTime())) return 'unknown';
    
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handleCreatePost = (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPost: Post = {
      ...postData,
      id: `post_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    addPost(newPost);
  };

  const handleLikePost = (postId: string) => {
    if (!user) return;
    likePost(postId, user.id);
  };

  const handleAddComment = (postId: string, content: string) => {
    if (!user) return;
    
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      userId: user.id,
      userName: user.name,
      userAvatar: undefined,
      content,
      likes: 0,
      likedBy: [],
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    addComment(postId, newComment);
  };

  const handleSharePost = (post: Post) => {
    setSharePost(post);
    setShowShareModal(true);
  };

  const getAchievementFromPost = (post: Post) => {
    if (post.type === 'achievement' && post.metadata?.achievementId) {
      return ACHIEVEMENT_TEMPLATES.find(a => a.id === post.metadata?.achievementId);
    }
    return undefined;
  };

  const renderPost = (post: Post) => {
    // Special rendering for achievement posts
    if (post.type === 'achievement') {
      return (
        <View key={post.id} className="mx-4 mb-4">
          <AchievementPost
            post={post}
            onLike={() => likePost(post.id, user?.id || '')}
            onComment={() => setShowComments(post.id)}
            onShare={() => handleSharePost(post)}
            isLiked={post.likedBy?.includes(user?.id || '') || false}
          />
        </View>
      );
    }

    // Regular post rendering
    return (
    <View key={post.id} className="bg-white mx-4 mb-4 rounded-lg shadow-sm border border-gray-100">
      <View className="p-4">
        {/* Post Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-golf-700 rounded-full items-center justify-center mr-3">
              <Ionicons name="person" size={20} color="white" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-semibold text-gray-900">{post.userName}</Text>
                {post.location && (
                  <>
                    <Text className="text-gray-400 mx-1">•</Text>
                    <Ionicons name="location-outline" size={12} color="#6b7280" />
                    <Text className="text-sm text-gray-600 ml-1">{post.location}</Text>
                  </>
                )}
              </View>
              <Text className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            {/* Post Type Indicator */}
            {post.type !== 'general' && (
              <View className={`px-2 py-1 rounded-full mr-2 ${
                post.type === 'photo' ? 'bg-blue-100' :
                post.type === 'score' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Text className={`text-xs font-medium ${
                  post.type === 'photo' ? 'text-blue-700' :
                  post.type === 'score' ? 'text-green-700' : 'text-gray-700'
                }`}>
                  {post.type === 'photo' ? 'Photo' :
                   post.type === 'score' ? 'Score' : post.type}
                </Text>
              </View>
            )}

            {/* Post Options Menu (Report/Block/Delete) */}
            <PostOptionsMenu
              postId={post.id}
              postOwnerId={post.userId}
              postOwnerName={post.userName}
              isOwnPost={post.userId === user?.id}
              onDelete={() => deletePost(post.id)}
            />
          </View>
        </View>

        {/* Score Data */}
        {post.type === 'score' && post.scoreData && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold text-green-800">{post.scoreData.score}</Text>
                <Text className="text-sm text-green-600">Score</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-green-800">{post.scoreData.par}</Text>
                <Text className="text-sm text-green-600">Par</Text>
              </View>
              <View className="flex-1 ml-4">
                <Text className="font-medium text-green-800">{post.scoreData.course}</Text>
                <Text className="text-sm text-green-600">
                  {post.scoreData.score <= post.scoreData.par ? '🎉 Great round!' : 'Keep improving!'}
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Post Content */}
        <Text className="text-gray-800 mb-3">{post.content}</Text>

        {/* Photos */}
        {post.photos && post.photos.length > 0 && (
          <View className="mb-3">
            {post.photos.length === 1 ? (
              <Image
                source={{ uri: post.photos[0].uri }}
                className="w-full h-64 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row space-x-2">
                  {post.photos.map((photo) => (
                    <Image
                      key={photo.id}
                      source={{ uri: photo.uri }}
                      className="w-48 h-48 rounded-lg"
                      resizeMode="cover"
                    />
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        )}
        

        
        {/* Interaction Bar */}
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => handleLikePost(post.id)}
          >
            <Ionicons
              name={post.likedBy?.includes(user?.id || '') ? "heart" : "heart-outline"}
              size={20}
              color={post.likedBy?.includes(user?.id || '') ? "#ef4444" : "#10288F"}
            />
            <Text className="ml-1 text-golf-700">{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setShowComments(showComments === post.id ? null : post.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text className="ml-1 text-gray-500">{post.comments?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="share-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Section */}
      {showComments === post.id && (
        <CommentSection
          comments={post.comments || []}
          currentUserId={user?.id || ''}
          currentUserName={user?.name || 'Anonymous'}
          onAddComment={(content) => handleAddComment(post.id, content)}
          onAddReply={(commentId, content) => addReply(post.id, commentId, {
            id: `reply_${Date.now()}`,
            commentId,
            userId: user?.id || '',
            userName: user?.name || 'Anonymous',
            content,
            likes: 0,
            likedBy: [],
            createdAt: new Date(),
            updatedAt: new Date()
          })}
          onLikeComment={(commentId) => likeComment(post.id, commentId, user?.id || '')}
          onLikeReply={(commentId, replyId) => likeReply(post.id, commentId, replyId, user?.id || '')}
          onDeleteComment={(commentId) => deleteComment(post.id, commentId)}
        />
      )}
    </View>
  );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#10288F" />
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
        <View className="pt-4">
          {/* Header with Greeting and Weather */}
          <View className="flex-row items-center justify-between px-4 mb-4">
            <Text className="text-xl font-bold text-gray-900 flex-1">
              {currentGreeting}
            </Text>
            <WeatherWidget 
              onPress={() => {
                // Could open detailed weather view or refresh weather
                console.log('Weather widget tapped');
              }}
            />
          </View>
          


          
          {/* Social Feed */}
          <View>
            <View className="flex-row items-center justify-between px-4 mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Activity Feed
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreatePost(true)}
                className="bg-golf-700 px-4 py-2 rounded-lg flex-row items-center"
              >
                <Ionicons name="add" size={16} color="white" />
                <Text className="text-white font-medium ml-1">Post</Text>
              </TouchableOpacity>
            </View>

            {filteredPosts.length > 0 ? (
              filteredPosts.map(renderPost)
            ) : (
              <View className="bg-white mx-4 rounded-lg p-6 items-center">
                <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
                <Text className="text-gray-500 mt-2 text-center">
                  No activity yet. Share your golf experiences!
                </Text>
                <TouchableOpacity 
                  className="bg-golf-700 px-4 py-2 rounded-lg mt-3"
                  onPress={() => setShowCreatePost(true)}
                >
                  <Text className="text-white font-medium">Create First Post</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Create Post Modal */}
      <CreatePostModal
        isVisible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onCreatePost={handleCreatePost}
        currentUserId={user?.id || ''}
        currentUserName={user?.name || 'Anonymous'}
        currentUserAvatar={undefined}
      />

      {/* Share Modal */}
      <RewardShareModal
        visible={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSharePost(null);
        }}
        achievement={sharePost ? getAchievementFromPost(sharePost) : undefined}
      />

      {/* Comments Modal */}
      {showComments && (
        <CommentSection
          visible={!!showComments}
          postId={showComments}
          onClose={() => setShowComments(null)}
          onAddComment={handleAddComment}
          currentUser={user}
        />
      )}
      </SafeAreaView>
    </>
  );
}