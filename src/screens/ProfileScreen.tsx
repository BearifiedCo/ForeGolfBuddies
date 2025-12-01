import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Image, 
  Modal, 
  TextInput, 
  Switch,
  StatusBar,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useSocialStore } from '../state/socialStore';
import { authService } from '../api/auth-service';
import { User, Post, ProfilePhoto } from '../types/golf';
import ProfileGallery from '../components/ProfileGallery';
import RewardsSummary from '../components/RewardsSummary';
import { useRewardsStore } from '../state/rewardsStore';
import { trackProfileVisit } from '../services/rewardsService';

interface ProfileScreenProps {
  navigation: any;
  route?: {
    params?: {
      userId?: string; // For viewing other users' profiles
    };
  };
}

export default function ProfileScreen({ navigation, route }: ProfileScreenProps) {
  const { user: currentUser, logout, updateUser } = useAuthStore();
  const { posts } = useSocialStore();
  const { initializeUserRewards } = useRewardsStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'gallery'>('posts');
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    location: '',
    website: '',
    isPrivate: false
  });

  // Determine if viewing own profile or someone else's
  const targetUserId = route?.params?.userId || currentUser?.id;
  const isOwnProfile = targetUserId === currentUser?.id;
  
  // For now, use current user data. In production, fetch user by targetUserId
  const profileUser: User | null = currentUser;

  // Initialize rewards and track profile visit
  useEffect(() => {
    if (currentUser) {
      initializeUserRewards(currentUser.id);
      if (!isOwnProfile) {
        trackProfileVisit();
      }
    }
  }, [currentUser, isOwnProfile]);

  // Get user's posts from activity feed
  const userPosts = posts.filter(post => post.userId === targetUserId);
  const userGalleryPhotos: ProfilePhoto[] = profileUser?.galleryPhotos || [];

  useEffect(() => {
    if (profileUser && isOwnProfile) {
      setEditForm({
        bio: profileUser.bio || '',
        location: profileUser.location || '',
        website: profileUser.website || '',
        isPrivate: profileUser.isPrivate || false
      });
    }
  }, [profileUser, isOwnProfile]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = () => {
    if (!currentUser) return;
    
    const updatedUser: User = {
      ...currentUser,
      bio: editForm.bio,
      location: editForm.location,
      website: editForm.website,
      isPrivate: editForm.isPrivate
    };
    
    updateUser(updatedUser);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleFollowToggle = () => {
    // Implement follow/unfollow logic
    Alert.alert('Follow', 'Follow functionality will be implemented');
  };

  const renderProfileHeader = () => (
    <View className="bg-white">
      {/* Golf Course Background */}
      <View className="relative h-40 bg-gradient-to-br from-golf-600 to-golf-800">
        {/* Golf Pattern Overlay */}
        <View className="absolute inset-0 opacity-20">
          <View className="flex-row justify-center items-center h-full">
            <Ionicons name="golf" size={80} color="white" />
          </View>
        </View>
        
        {/* Profile Picture - Floating on top */}
        <View className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <View className="relative">
            {profileUser?.profilePicture ? (
              <Image
                source={{ uri: profileUser.profilePicture }}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-20 h-20 bg-white rounded-full border-4 border-golf-700 items-center justify-center shadow-lg">
                <Ionicons name="golf" size={32} color="#10288F" />
              </View>
            )}
            {profileUser?.isVerified && (
              <View className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full items-center justify-center border-2 border-white">
                <Ionicons name="star" size={12} color="white" />
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Profile Content */}
      <View className="px-4 pt-12 pb-4">
        {/* Name & Status */}
        <View className="items-center mb-4">
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl font-bold text-gray-900">{profileUser?.name}</Text>
            {profileUser?.isPrivate && (
              <View className="ml-2 bg-gray-100 px-2 py-1 rounded-full">
                <Ionicons name="lock-closed" size={12} color="#6b7280" />
              </View>
            )}
          </View>
          
          {/* Golf Badge */}
          <View className="bg-golf-100 px-3 py-1 rounded-full mb-3">
            <Text className="text-golf-700 font-medium text-sm">
              Handicap {profileUser?.handicap} • {profileUser?.homeClub || 'Golf Enthusiast'}
            </Text>
          </View>
        </View>

        {/* Quick Stats - Golf Focused */}
        <View className="flex-row justify-around mb-4 bg-gray-50 rounded-lg p-4">
          <View className="items-center">
            <View className="w-12 h-12 bg-golf-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="golf" size={20} color="#10288F" />
            </View>
            <Text className="text-lg font-bold text-gray-900">{profileUser?.stats?.gamesPlayed || 0}</Text>
            <Text className="text-xs text-gray-600">Rounds</Text>
          </View>
          
          <View className="items-center">
            <View className="w-12 h-12 bg-golf-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="trophy" size={20} color="#10288F" />
            </View>
            <Text className="text-lg font-bold text-gray-900">{profileUser?.stats?.bestScore || 'N/A'}</Text>
            <Text className="text-xs text-gray-600">Best</Text>
          </View>
          
          <View className="items-center">
            <View className="w-12 h-12 bg-golf-100 rounded-full items-center justify-center mb-1">
              <Ionicons name="chatbubbles" size={20} color="#10288F" />
            </View>
            <Text className="text-lg font-bold text-gray-900">{userPosts.length}</Text>
            <Text className="text-xs text-gray-600">Posts</Text>
          </View>
        </View>

        {/* Bio - Golf Focused */}
        {profileUser?.bio && (
          <View className="bg-gray-50 rounded-lg p-3 mb-4">
            <Text className="text-gray-700 text-center italic">"{profileUser.bio}"</Text>
          </View>
        )}

        {/* Action Button - Simplified */}
        <View className="flex-row">
          {isOwnProfile ? (
            <TouchableOpacity
              className="flex-1 bg-golf-700 py-3 rounded-lg"
              onPress={() => setIsEditing(true)}
            >
              <Text className="text-center font-medium text-white">Customize Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-1 bg-golf-700 py-3 rounded-lg"
              onPress={handleFollowToggle}
            >
              <Text className="text-center font-medium text-white">Add Golf Buddy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View className="bg-white border-b border-gray-200">
      <View className="flex-row px-4">
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${
            activeTab === 'posts' ? 'bg-golf-50' : ''
          } rounded-t-lg`}
          onPress={() => setActiveTab('posts')}
        >
          <View className={`flex-row items-center space-x-2 ${
            activeTab === 'posts' ? 'text-golf-700' : 'text-gray-600'
          }`}>
            <Ionicons
              name="chatbubbles-outline"
              size={20}
              color={activeTab === 'posts' ? '#10288F' : '#6b7280'}
            />
            <Text
              className={`text-sm font-medium ${
                activeTab === 'posts' ? 'text-golf-700' : 'text-gray-600'
              }`}
            >
              Golf Stories
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 py-4 items-center ${
            activeTab === 'gallery' ? 'bg-golf-50' : ''
          } rounded-t-lg`}
          onPress={() => setActiveTab('gallery')}
        >
          <View className={`flex-row items-center space-x-2 ${
            activeTab === 'gallery' ? 'text-golf-700' : 'text-gray-600'
          }`}>
            <Ionicons
              name="golf-outline"
              size={20}
              color={activeTab === 'gallery' ? '#10288F' : '#6b7280'}
            />
            <Text
              className={`text-sm font-medium ${
                activeTab === 'gallery' ? 'text-golf-700' : 'text-gray-600'
              }`}
            >
              Course Photos
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActivityPosts = () => (
    <View className="flex-1 bg-gray-50 px-4">
      {userPosts.length > 0 ? (
        userPosts.map((post) => (
          <View key={post.id} className="bg-white mb-3 rounded-lg shadow-sm overflow-hidden">
            {/* Post Header */}
            <View className="p-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-golf-100 rounded-full items-center justify-center mr-2">
                  <Ionicons name="golf" size={16} color="#10288F" />
                </View>
                <Text className="text-golf-700 font-medium text-sm">
                  {post.courseName || 'Golf Course'}
                </Text>
              </View>
            </View>
            
            {/* Post Content */}
            <View className="p-3">
              <Text className="text-gray-800 mb-3 leading-5">{post.content}</Text>
              
              {/* Score Display if it's a score post */}
              {post.scoreData && (
                <View className="bg-golf-50 rounded-lg p-3 mb-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-golf-700 font-medium">Round Score</Text>
                    <Text className="text-2xl font-bold text-golf-700">{post.scoreData.score}</Text>
                  </View>
                  <Text className="text-golf-600 text-sm">Par {post.scoreData.par || '72'}</Text>
                </View>
              )}
              
              {/* Photo Display */}
              {post.photos && post.photos.length > 0 && (
                <View className="mb-3">
                  <Image
                    source={{ uri: post.photos[0].uri }}
                    className="w-full h-48 rounded-lg"
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>
            
            {/* Post Footer */}
            <View className="px-3 py-2 bg-gray-50 flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <Ionicons name="heart" size={16} color="#ef4444" />
                  <Text className="text-sm text-gray-600 ml-1">{post.likes}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
                  <Text className="text-sm text-gray-600 ml-1">{post.comments?.length || 0}</Text>
                </View>
              </View>
              <Text className="text-xs text-gray-500">
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 bg-golf-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="golf" size={32} color="#10288F" />
          </View>
          <Text className="text-gray-700 text-lg font-medium mb-2">No Golf Stories Yet</Text>
          <Text className="text-gray-500 text-center leading-5">
            {isOwnProfile 
              ? "Share your golf adventures, course photos, and round scores with the community!"
              : "This golfer hasn't shared any stories yet."
            }
          </Text>
        </View>
      )}
    </View>
  );

  if (!profileUser) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Profile not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#10288F" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">
            {isOwnProfile ? 'Profile' : profileUser?.name}
          </Text>
          
          {isOwnProfile ? (
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => navigation.navigate('ProfileSearch')}
                className="p-2 mr-2"
              >
                <Ionicons name="search-outline" size={24} color="#374151" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => navigation.navigate('Achievements')}
                className="p-2 mr-2"
              >
                <Ionicons name="trophy" size={24} color="#F59E0B" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                className="p-2"
              >
                <Ionicons name="settings-outline" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => navigation.navigate('NewMessage')}
                className="p-2 mr-2 bg-golf-600 rounded-lg"
              >
                <Ionicons name="chatbubble-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View>
            {renderProfileHeader()}
            
            {/* Rewards Summary - Only show on own profile */}
            {isOwnProfile && (
              <RewardsSummary 
                onPress={() => navigation.navigate('Achievements')}
                compact={false}
              />
            )}
            
            {renderTabBar()}
            
            <View style={{ minHeight: 400 }}>
              {activeTab === 'posts' ? (
                renderActivityPosts()
              ) : (
                <ProfileGallery
                  photos={userGalleryPhotos}
                  currentUserId={currentUser?.id || ''}
                  isOwnProfile={isOwnProfile}
                  isPrivateProfile={profileUser.isPrivate && !isOwnProfile}
                  onAddPhoto={(photo) => {
                    // Add photo to user's gallery
                    Alert.alert('Success', 'Photo added to gallery!');
                  }}
                  onDeletePhoto={(photoId) => {
                    // Delete photo from gallery
                    Alert.alert('Success', 'Photo deleted from gallery!');
                  }}
                  onLikePhoto={(photoId) => {
                    // Like gallery photo
                    Alert.alert('Liked!', 'Photo liked!');
                  }}
                  onAddComment={(photoId, comment) => {
                    // Add comment to gallery photo
                    Alert.alert('Success', 'Comment added!');
                  }}
                />
              )}
            </View>
          </View>
        )}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
      />

      {/* Edit Profile Modal */}
      <Modal visible={isEditing} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="bg-white border-b border-gray-200 px-4 py-3">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Text className="text-golf-700 font-medium text-lg">Cancel</Text>
              </TouchableOpacity>
              
              <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
              
              <TouchableOpacity onPress={handleSaveProfile} className="bg-golf-700 px-4 py-2 rounded-lg">
                <Text className="text-white font-medium">Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Bio</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                placeholder="Tell people about yourself..."
                value={editForm.bio}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, bio: text }))}
                multiline
                maxLength={150}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Location</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                placeholder="Your location"
                value={editForm.location}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, location: text }))}
                maxLength={50}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Website</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                placeholder="Your website"
                value={editForm.website}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, website: text }))}
                maxLength={100}
                autoCapitalize="none"
              />
            </View>

            <View className="bg-white rounded-lg p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Private Account</Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    Only followers can see your posts and gallery
                  </Text>
                </View>
                <Switch
                  value={editForm.isPrivate}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, isPrivate: value }))}
                  trackColor={{ false: '#d1d5db', true: '#10288F' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="bg-white border-b border-gray-200 px-4 py-3">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text className="text-golf-700 font-medium text-lg">Close</Text>
              </TouchableOpacity>
              
              <Text className="text-xl font-bold text-gray-900">Settings</Text>
              
              <View style={{ width: 60 }} />
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            <View className="bg-white rounded-lg mb-4">
              <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
                <Ionicons name="notifications-outline" size={24} color="#10288F" />
                <Text className="ml-3 text-gray-900 font-medium flex-1">Notifications</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
                <Ionicons name="shield-outline" size={24} color="#10288F" />
                <Text className="ml-3 text-gray-900 font-medium flex-1">Privacy</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity className="flex-row items-center p-4">
                <Ionicons name="help-circle-outline" size={24} color="#10288F" />
                <Text className="ml-3 text-gray-900 font-medium flex-1">Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-red-500 p-4 rounded-lg items-center"
              onPress={handleLogout}
            >
              <Text className="text-white font-semibold text-lg">Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
        </SafeAreaView>
      </>
    );
}