import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useMessagingStore } from '../state/messagingStore';
import { User } from '../types/golf';
import { getTimeBasedGreeting } from '../utils/greetings';

interface CreateGroupChatScreenProps {
  navigation: any;
}

export default function CreateGroupChatScreen({ navigation }: CreateGroupChatScreenProps) {
  const { user } = useAuthStore();
  const { createGroupChat } = useMessagingStore();
  
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock available users to add to group
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    loadAvailableUsers();
  }, []);

  const loadAvailableUsers = () => {
    // In a real app, this would load users from your friends list or search
    const mockUsers: User[] = [
      {
        id: 'user1',
        email: 'john@example.com',
        name: 'John Smith',
        profilePicture: 'https://via.placeholder.com/150',
        handicap: 12,
        homeClub: 'Augusta National',
        location: 'Augusta, GA',
        bio: 'Golf enthusiast',
        coverPhoto: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=200&fit=crop',
        isPrivate: false,
        isVerified: false,
        followersCount: 45,
        followingCount: 32,
        postsCount: 18,
        website: '',
        galleryPhotos: [],
        lastActive: new Date(),
        twoFactorEnabled: false,
        twoFactorMethod: 'none',
        stats: {
          gamesPlayed: 25,
          averageScore: 88,
          bestScore: 79,
          coursesPlayed: 12
        },
        createdAt: new Date(),
        isOnline: true
      },
      {
        id: 'user2',
        email: 'sarah@example.com',
        name: 'Sarah Wilson',
        profilePicture: 'https://via.placeholder.com/150',
        handicap: 8,
        homeClub: 'Pebble Beach',
        location: 'Monterey, CA',
        bio: 'Weekend golfer',
        coverPhoto: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=200&fit=crop',
        isPrivate: false,
        isVerified: true,
        followersCount: 89,
        followingCount: 67,
        postsCount: 34,
        website: '',
        galleryPhotos: [],
        lastActive: new Date(),
        twoFactorEnabled: false,
        twoFactorMethod: 'none',
        stats: {
          gamesPlayed: 42,
          averageScore: 82,
          bestScore: 74,
          coursesPlayed: 18
        },
        createdAt: new Date(),
        isOnline: false
      },
      {
        id: 'user3',
        email: 'mike@example.com',
        name: 'Mike Johnson',
        profilePicture: 'https://via.placeholder.com/150',
        handicap: 15,
        homeClub: 'Local Club',
        location: 'Golf City, GC',
        bio: 'New to golf',
        coverPhoto: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=200&fit=crop',
        isPrivate: false,
        isVerified: false,
        followersCount: 12,
        followingCount: 8,
        postsCount: 5,
        website: '',
        galleryPhotos: [],
        lastActive: new Date(),
        twoFactorEnabled: false,
        twoFactorMethod: 'none',
        stats: {
          gamesPlayed: 8,
          averageScore: 95,
          bestScore: 89,
          coursesPlayed: 3
        },
        createdAt: new Date(),
        isOnline: true
      }
    ];
    
    setAvailableUsers(mockUsers);
  };

  const toggleUserSelection = (user: User) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one member');
      return;
    }

    setIsLoading(true);
    
    try {
      await createGroupChat(
        groupName.trim(),
        groupDescription.trim(),
        selectedUsers.map(u => u.id)
      );
      
      Alert.alert(
        'Success',
        'Group chat created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Messages')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create group chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#10288F" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-golf-700 px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <View className="flex-1">
              <Text className="text-white text-lg font-semibold">
                {getTimeBasedGreeting()}
              </Text>
              <Text className="text-golf-100 text-sm">Create Group Chat</Text>
            </View>
          </View>
        </View>

        <FlatList
          className="flex-1 px-4"
          data={[{ key: 'content' }]}
          renderItem={() => (
            <View className="py-4">
              {/* Group Details */}
              <View className="bg-white rounded-lg p-4 mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">Group Details</Text>
                
                <View className="mb-4">
                  <Text className="text-gray-700 font-medium mb-2">Group Name *</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                    placeholder="Enter group name"
                    value={groupName}
                    onChangeText={setGroupName}
                    maxLength={50}
                  />
                </View>
                
                <View className="mb-4">
                  <Text className="text-gray-700 font-medium mb-2">Description</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900"
                    placeholder="Enter group description"
                    value={groupDescription}
                    onChangeText={setGroupDescription}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                  />
                </View>
              </View>

              {/* Selected Members */}
              {selectedUsers.length > 0 && (
                <View className="bg-white rounded-lg p-4 mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-4">
                    Selected Members ({selectedUsers.length})
                  </Text>
                  <View className="flex-row flex-wrap">
                    {selectedUsers.map((user) => (
                      <View key={user.id} className="bg-golf-100 rounded-lg p-3 mr-3 mb-3">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 bg-golf-200 rounded-full items-center justify-center mr-2">
                            <Text className="text-golf-700 font-semibold text-sm">
                              {user.name.charAt(0)}
                            </Text>
                          </View>
                          <Text className="text-golf-800 font-medium text-sm mr-2">
                            {user.name}
                          </Text>
                          <TouchableOpacity
                            onPress={() => toggleUserSelection(user)}
                            className="w-5 h-5 bg-golf-600 rounded-full items-center justify-center"
                          >
                            <Ionicons name="close" size={12} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Available Users */}
              <View className="bg-white rounded-lg p-4 mb-6">
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Add Members
                </Text>
                {availableUsers.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    className={`bg-white border rounded-lg p-4 mb-3 ${
                      selectedUsers.some(u => u.id === user.id) ? 'border-golf-600 bg-golf-50' : 'border-gray-200'
                    }`}
                    onPress={() => toggleUserSelection(user)}
                  >
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-golf-100 rounded-full items-center justify-center mr-3">
                        <Text className="text-golf-700 font-semibold text-lg">
                          {user.name.charAt(0)}
                        </Text>
                      </View>
                      
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900 text-base mb-1">
                          {user.name}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {user.location} • Handicap: {user.handicap}
                        </Text>
                      </View>
                      
                      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        selectedUsers.some(u => u.id === user.id) ? 'bg-golf-600 border-golf-600' : 'border-gray-300'
                      }`}>
                        {selectedUsers.some(u => u.id === user.id) && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Create Button */}
              <TouchableOpacity
                className={`bg-golf-700 rounded-lg py-4 items-center ${
                  isLoading || !groupName.trim() || selectedUsers.length === 0 ? 'opacity-50' : ''
                }`}
                onPress={handleCreateGroup}
                disabled={isLoading || !groupName.trim() || selectedUsers.length === 0}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Create Group Chat
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </>
  );
}
