import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Post, PostPhoto } from '../types/golf';

interface CreatePostModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreatePost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => void;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
}

export default function CreatePostModal({
  isVisible,
  onClose,
  onCreatePost,
  currentUserId,
  currentUserName,
  currentUserAvatar
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<PostPhoto[]>([]);
  const [location, setLocation] = useState('');
  const [postType, setPostType] = useState<'general' | 'photo' | 'score'>('general');
  const [scoreData, setScoreData] = useState({
    score: '',
    par: '',
    course: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setContent('');
    setPhotos([]);
    setLocation('');
    setPostType('general');
    setScoreData({ score: '', par: '', course: '' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        const newPhotos: PostPhoto[] = result.assets.map((asset, index) => ({
          id: `photo_${Date.now()}_${index}`,
          uri: asset.uri,
          width: asset.width,
          height: asset.height
        }));

        setPhotos(prev => [...prev, ...newPhotos]);
        if (postType === 'general') {
          setPostType('photo');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: PostPhoto = {
          id: `photo_${Date.now()}`,
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height
        };

        setPhotos(prev => [...prev, newPhoto]);
        if (postType === 'general') {
          setPostType('photo');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    if (photos.length === 1) {
      setPostType('general');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleCreatePost = () => {
    if (!content.trim() && photos.length === 0) {
      Alert.alert('Error', 'Please add some content or photos to your post');
      return;
    }

    if (postType === 'score' && (!scoreData.score || !scoreData.course)) {
      Alert.alert('Error', 'Please fill in your score and course name');
      return;
    }

    setIsLoading(true);

    const newPost: Omit<Post, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: currentUserId,
      userName: currentUserName,
      userAvatar: currentUserAvatar,
      content: content.trim(),
      type: postType,
      likes: 0,
      likedBy: [],
      comments: [],
      photos: photos.length > 0 ? photos : undefined,
      location: location.trim() || undefined,
              scoreData: postType === 'score' ? {
          score: parseInt(scoreData.score),
          par: parseInt(scoreData.par) || 72,
          course: scoreData.course
        } : undefined
    };

    onCreatePost(newPost);
    resetForm();
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-gray-50">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="bg-white border-b border-gray-200 px-4 py-3">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={handleClose}>
                <Text className="text-golf-700 font-medium text-lg">Cancel</Text>
              </TouchableOpacity>
              
              <Text className="text-xl font-bold text-gray-900">Create Post</Text>
              
              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg ${
                  isLoading ? 'bg-gray-300' : 'bg-golf-700'
                }`}
              >
                <Text className="text-white font-medium">
                  {isLoading ? 'Posting...' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-golf-700 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={24} color="white" />
              </View>
              <View>
                <Text className="font-semibold text-gray-900">{currentUserName}</Text>
                <Text className="text-sm text-gray-500">Sharing to golf community</Text>
              </View>
            </View>

            {/* Post Type Selector */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Post Type</Text>
              <View className="flex-row space-x-2">
                {[
                  { type: 'general' as const, label: 'General', icon: 'chatbubble-outline' },
                  { type: 'photo' as const, label: 'Photo', icon: 'camera-outline' },
                  { type: 'score' as const, label: 'Score', icon: 'trophy-outline' }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.type}
                    onPress={() => setPostType(option.type)}
                    className={`flex-1 flex-row items-center justify-center py-3 rounded-lg border ${
                      postType === option.type
                        ? 'bg-golf-100 border-golf-300'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={postType === option.type ? '#10288F' : '#6b7280'}
                    />
                    <Text
                      className={`ml-2 font-medium ${
                        postType === option.type ? 'text-golf-700' : 'text-gray-600'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Content Input */}
            <View className="mb-4">
              <TextInput
                className="bg-white border border-gray-200 rounded-lg p-4 min-h-[100px]"
                placeholder={
                  postType === 'photo'
                    ? "Share your golf adventure..."
                    : postType === 'score'
                    ? "How was your round today?"
                    : "What's on your mind?"
                }
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* Score Data (if score post) */}
            {postType === 'score' && (
              <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <Text className="text-lg font-semibold text-gray-900 mb-3">Score Details</Text>
                
                <View className="flex-row space-x-3 mb-3">
                  <View className="flex-1">
                    <Text className="text-gray-700 mb-2">Your Score</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                      placeholder="85"
                      value={scoreData.score}
                      onChangeText={(text) => setScoreData(prev => ({ ...prev, score: text }))}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-gray-700 mb-2">Course Par</Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                      placeholder="72"
                      value={scoreData.par}
                      onChangeText={(text) => setScoreData(prev => ({ ...prev, par: text }))}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>
                
                <View>
                  <Text className="text-gray-700 mb-2">Course Name</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="Pebble Beach Golf Links"
                    value={scoreData.course}
                    onChangeText={(text) => setScoreData(prev => ({ ...prev, course: text }))}
                    maxLength={100}
                  />
                </View>
              </View>
            )}

            {/* Location Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Location (Optional)</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                placeholder="Add location..."
                value={location}
                onChangeText={setLocation}
                maxLength={100}
              />
            </View>

            {/* Photos Section */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-700 font-medium">Photos</Text>
                <TouchableOpacity
                  onPress={showImageOptions}
                  className="flex-row items-center bg-golf-700 px-3 py-2 rounded-lg"
                >
                  <Ionicons name="camera" size={16} color="white" />
                  <Text className="text-white font-medium ml-1">Add Photo</Text>
                </TouchableOpacity>
              </View>

              {photos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-3">
                    {photos.map((photo) => (
                      <View key={photo.id} className="relative">
                        <Image
                          source={{ uri: photo.uri }}
                          className="w-20 h-20 rounded-lg"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => removePhoto(photo.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                        >
                          <Ionicons name="close" size={14} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
