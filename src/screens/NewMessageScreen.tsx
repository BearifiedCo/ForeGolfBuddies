import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { User, MutualFriend } from '../types/golf';
import { messagingService } from '../api/messaging-service';
import { getTimeBasedGreeting } from '../utils/greetings';

interface NewMessageScreenProps {
  navigation: any;
}

export default function NewMessageScreen({ navigation }: NewMessageScreenProps) {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    loadRecentUsers();
  }, []);

  const loadRecentUsers = async () => {
    // In a real app, this would load users you've recently interacted with
    // For now, we'll use mock data
    const mockRecentUsers: User[] = [
      {
        id: 'recent1',
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
        id: 'recent2',
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
      }
    ];
    
    setRecentUsers(mockRecentUsers);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // In a real app, this would search the user database
      // For now, we'll filter from mock data
      const mockUsers: User[] = [
        {
          id: 'search1',
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

      const filtered = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.location.toLowerCase().includes(query.toLowerCase()) ||
        user.homeClub.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserPress = async (selectedUser: User) => {
    if (!user) return;

    try {
      // Create or get conversation
      const conversation = await messagingService.getOrCreateConversation(
        user.id,
        selectedUser.id
      );

      // Navigate to chat
      navigation.replace('Chat', {
        conversationId: conversation.id,
        otherUser: selectedUser
      });
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="bg-white border-b border-gray-100 p-4"
      onPress={() => handleUserPress(item)}
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="relative">
          <View className="w-12 h-12 bg-golf-100 rounded-full items-center justify-center mr-3">
            <Text className="text-golf-700 font-semibold text-lg">
              {item.name.charAt(0)}
            </Text>
          </View>
          
          {/* Online indicator */}
          {item.isOnline && (
            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>

        {/* User info */}
        <View className="flex-1">
          <Text className="font-semibold text-gray-900 text-base mb-1">
            {item.name}
          </Text>
          
          <View className="flex-row items-center mb-1">
            <Ionicons name="location" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">
              {item.location}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="golf" size={14} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-1">
              Handicap: {item.handicap} • {item.homeClub}
            </Text>
          </View>
        </View>

        {/* Message button */}
        <TouchableOpacity
          onPress={() => handleUserPress(item)}
          className="w-10 h-10 bg-golf-600 rounded-full items-center justify-center"
        >
          <Ionicons name="chatbubble" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <View className="bg-gray-50 px-4 py-2">
      <Text className="text-sm font-medium text-gray-600 uppercase tracking-wide">
        {title}
      </Text>
    </View>
  );

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
              <Text className="text-golf-100 text-sm">New Message</Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-900"
              placeholder="Search by name, location, or club..."
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        {searchQuery.trim() ? (
          // Search results
          <FlatList
            data={searchResults}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => renderSectionHeader('Search Results')}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-8">
                {isSearching ? (
                  <ActivityIndicator size="large" color="#10288F" />
                ) : (
                  <Text className="text-gray-500 text-center">
                    No users found matching "{searchQuery}"
                  </Text>
                )}
              </View>
            )}
          />
        ) : (
          // Recent users
          <FlatList
            data={recentUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => renderSectionHeader('Recent')}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-gray-500 text-center">
                  No recent conversations
                </Text>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </>
  );
}
