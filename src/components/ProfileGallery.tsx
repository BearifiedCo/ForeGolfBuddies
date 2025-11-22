import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ProfilePhoto, ProfilePhotoComment } from '../types/golf';

interface ProfileGalleryProps {
  photos: ProfilePhoto[];
  currentUserId: string;
  isOwnProfile: boolean;
  isPrivateProfile: boolean;
  onAddPhoto?: (photo: Omit<ProfilePhoto, 'id' | 'uploadedAt'>) => void;
  onDeletePhoto?: (photoId: string) => void;
  onLikePhoto?: (photoId: string) => void;
  onAddComment?: (photoId: string, comment: string) => void;
}

const { width } = Dimensions.get('window');
const photoSize = (width - 48) / 3; // 3 photos per row with margins

export default function ProfileGallery({
  photos,
  currentUserId,
  isOwnProfile,
  isPrivateProfile,
  onAddPhoto,
  onDeletePhoto,
  onLikePhoto,
  onAddComment
}: ProfileGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProfilePhoto | null>(null);
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoLocation, setPhotoLocation] = useState('');

  const openImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: Omit<ProfilePhoto, 'id' | 'uploadedAt'> = {
          uri: result.assets[0].uri,
          caption: photoCaption.trim(),
          location: photoLocation.trim(),
          takenAt: new Date(),
          likes: 0,
          likedBy: [],
          comments: [],
          isPrivate: false,
          tags: []
        };

        onAddPhoto?.(newPhoto);
        setPhotoCaption('');
        setPhotoLocation('');
        setShowAddPhoto(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto: Omit<ProfilePhoto, 'id' | 'uploadedAt'> = {
          uri: result.assets[0].uri,
          caption: photoCaption.trim(),
          location: photoLocation.trim(),
          takenAt: new Date(),
          likes: 0,
          likedBy: [],
          comments: [],
          isPrivate: false,
          tags: []
        };

        onAddPhoto?.(newPhoto);
        setPhotoCaption('');
        setPhotoLocation('');
        setShowAddPhoto(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: openImagePicker },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPhoto) return;
    
    onAddComment?.(selectedPhoto.id, newComment.trim());
    setNewComment('');
  };

  const renderGalleryPhoto = ({ item }: { item: ProfilePhoto }) => (
    <TouchableOpacity
      className="mb-1"
      onPress={() => setSelectedPhoto(item)}
      style={{ width: photoSize, height: photoSize }}
    >
      <Image
        source={{ uri: item.uri }}
        className="w-full h-full rounded-sm"
        resizeMode="cover"
      />
      
      {/* Like count overlay */}
      {item.likes > 0 && (
        <View className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full px-2 py-1">
          <View className="flex-row items-center">
            <Ionicons name="heart" size={12} color="white" />
            <Text className="text-white text-xs ml-1">{item.likes}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderAddPhotoButton = () => (
    <TouchableOpacity
      className="mb-1 bg-golf-50 border-2 border-dashed border-golf-200 items-center justify-center rounded-sm"
      style={{ width: photoSize, height: photoSize }}
      onPress={() => setShowAddPhoto(true)}
    >
      <Ionicons name="golf" size={24} color="#10288F" />
      <Text className="text-golf-700 text-xs mt-1 font-medium">Add Course Photo</Text>
    </TouchableOpacity>
  );

        if (isPrivateProfile && !isOwnProfile) {
        return (
          <View className="flex-1 items-center justify-center py-12">
            <View className="w-20 h-20 bg-golf-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="lock-closed" size={32} color="#10288F" />
            </View>
            <Text className="text-gray-700 text-lg font-medium mb-2 text-center">
              Private Golf Profile
            </Text>
            <Text className="text-gray-500 text-center leading-5">
              This golfer keeps their course photos private.
            </Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              Add them as a golf buddy to see their photos!
            </Text>
          </View>
        );
      }

  return (
    <View className="flex-1">
      {/* Gallery Grid */}
      <FlatList
        data={isOwnProfile ? [null, ...photos] : photos}
        keyExtractor={(item, index) => item?.id || `add-${index}`}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        renderItem={({ item }) => {
          if (!item && isOwnProfile) {
            return renderAddPhotoButton();
          }
          return item ? renderGalleryPhoto({ item }) : null;
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={
          !isOwnProfile ? (
            <View className="flex-1 items-center justify-center py-12">
              <View className="w-20 h-20 bg-golf-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="golf" size={32} color="#10288F" />
              </View>
              <Text className="text-gray-700 text-lg font-medium mb-2">No Course Photos Yet</Text>
              <Text className="text-gray-500 text-center leading-5">
                This golfer hasn't shared any course photos yet.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Add Photo Modal */}
      <Modal visible={showAddPhoto} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-gray-50">
          <View className="bg-white border-b border-gray-200 px-4 py-3">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity onPress={() => setShowAddPhoto(false)}>
                <Text className="text-golf-700 font-medium text-lg">Cancel</Text>
              </TouchableOpacity>
              
              <Text className="text-xl font-bold text-gray-900">Add Photo</Text>
              
              <TouchableOpacity onPress={showImageOptions} className="bg-golf-700 px-4 py-2 rounded-lg">
                <Text className="text-white font-medium">Choose</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Caption</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                placeholder="Write a caption..."
                value={photoCaption}
                onChangeText={setPhotoCaption}
                multiline
                maxLength={200}
              />
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Location</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                placeholder="Add location..."
                value={photoLocation}
                onChangeText={setPhotoLocation}
                maxLength={100}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Photo Detail Modal */}
      <Modal visible={!!selectedPhoto} animationType="fade" transparent>
        <View className="flex-1 bg-black bg-opacity-90">
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-black bg-opacity-50">
              <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              
              {isOwnProfile && selectedPhoto && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Delete Photo',
                      'Are you sure you want to delete this photo?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          onPress: () => {
                            onDeletePhoto?.(selectedPhoto.id);
                            setSelectedPhoto(null);
                          },
                          style: 'destructive'
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash" size={24} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Photo */}
            {selectedPhoto && (
              <View className="flex-1 justify-center">
                <Image
                  source={{ uri: selectedPhoto.uri }}
                  className="w-full h-96"
                  resizeMode="contain"
                />
                
                {/* Photo Info */}
                <View className="bg-black bg-opacity-70 p-4">
                  {selectedPhoto.caption && (
                    <Text className="text-white text-base mb-2">{selectedPhoto.caption}</Text>
                  )}
                  
                  {selectedPhoto.location && (
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="location-outline" size={16} color="white" />
                      <Text className="text-white text-sm ml-1">{selectedPhoto.location}</Text>
                    </View>
                  )}

                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => selectedPhoto && onLikePhoto?.(selectedPhoto.id)}
                    >
                      <Ionicons
                        name={selectedPhoto.likedBy?.includes(currentUserId) ? "heart" : "heart-outline"}
                        size={20}
                        color={selectedPhoto.likedBy?.includes(currentUserId) ? "#ef4444" : "white"}
                      />
                      <Text className="text-white ml-1">{selectedPhoto.likes}</Text>
                    </TouchableOpacity>
                    
                    <Text className="text-gray-300 text-sm">
                      {selectedPhoto.takenAt.toLocaleDateString()}
                    </Text>
                  </View>

                  {/* Comments */}
                  <View className="mt-4">
                    <Text className="text-white font-medium mb-2">
                      Comments ({selectedPhoto.comments?.length || 0})
                    </Text>
                    
                    {selectedPhoto.comments?.slice(0, 3).map((comment) => (
                      <View key={comment.id} className="mb-2">
                        <Text className="text-white">
                          <Text className="font-medium">{comment.userName}</Text> {comment.content}
                        </Text>
                      </View>
                    ))}

                    {/* Add Comment */}
                    <View className="flex-row mt-3">
                      <TextInput
                        className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg mr-2"
                        placeholder="Add a comment..."
                        placeholderTextColor="#9ca3af"
                        value={newComment}
                        onChangeText={setNewComment}
                        maxLength={100}
                      />
                      <TouchableOpacity
                        onPress={handleAddComment}
                        disabled={!newComment.trim()}
                        className={`px-4 py-2 rounded-lg ${
                          newComment.trim() ? 'bg-golf-700' : 'bg-gray-600'
                        }`}
                      >
                        <Ionicons name="send" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
