import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../types/golf';

// Mock data for profile discovery
const MOCK_PUBLIC_PROFILES: User[] = [
  {
    id: '2',
    email: 'sarah@golf.com',
    name: 'Sarah Johnson',
    handicap: 8,
    location: 'Los Angeles, CA',
    bio: 'Weekend golfer, tournament player, always up for a friendly match! ⛳',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b78bb4bd?w=150&h=150&fit=crop&crop=face',
    isPrivate: false,
    isVerified: false,
    followersCount: 156,
    followingCount: 203,
    postsCount: 28,
    homeClub: 'Riviera Country Club',
    galleryPhotos: [],
    stats: {
      gamesPlayed: 52,
      averageScore: 82,
      bestScore: 76,
      coursesPlayed: 18
    }
  },
  {
    id: '3',
    email: 'mike@golf.com',
    name: 'Mike Wilson',
    handicap: 12,
    location: 'Austin, TX',
    bio: 'Golf instructor & course designer. Helping golfers improve their game! 🏌️‍♂️',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isPrivate: false,
    isVerified: true,
    followersCount: 1284,
    followingCount: 89,
    postsCount: 156,
    homeClub: 'Austin Country Club',
    website: 'mikegolfcoach.com',
    galleryPhotos: [],
    stats: {
      gamesPlayed: 320,
      averageScore: 74,
      bestScore: 68,
      coursesPlayed: 45
    }
  },
  {
    id: '4',
    email: 'lisa@golf.com',
    name: 'Lisa Chen',
    handicap: 15,
    location: 'San Diego, CA',
    bio: 'New to golf but loving every minute! Looking for playing partners 🌟',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isPrivate: false,
    isVerified: false,
    followersCount: 89,
    followingCount: 156,
    postsCount: 15,
    homeClub: 'Torrey Pines',
    galleryPhotos: [],
    stats: {
      gamesPlayed: 23,
      averageScore: 95,
      bestScore: 89,
      coursesPlayed: 8
    }
  },
  {
    id: '5',
    email: 'david@golf.com',
    name: 'David Rodriguez',
    handicap: 5,
    location: 'Phoenix, AZ',
    bio: 'Scratch golfer | Travel blogger | Always chasing the perfect round',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isPrivate: false,
    isVerified: true,
    followersCount: 892,
    followingCount: 234,
    postsCount: 98,
    homeClub: 'TPC Scottsdale',
    website: 'golfwithDavid.blog',
    galleryPhotos: [],
    stats: {
      gamesPlayed: 125,
      averageScore: 75,
      bestScore: 69,
      coursesPlayed: 67
    }
  }
];

interface ProfileSearchScreenProps {
  navigation: any;
}

export default function ProfileSearchScreen({ navigation }: ProfileSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>(MOCK_PUBLIC_PROFILES);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    // Simulate search delay
    setTimeout(() => {
      if (query.trim() === '') {
        setSearchResults(MOCK_PUBLIC_PROFILES);
      } else {
        const filtered = MOCK_PUBLIC_PROFILES.filter(user =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.location.toLowerCase().includes(query.toLowerCase()) ||
          user.homeClub?.toLowerCase().includes(query.toLowerCase()) ||
          user.bio?.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
      }
      setIsSearching(false);
    }, 300);
  };

  const handleProfilePress = (userId: string) => {
    navigation.navigate('Profile', { userId });
  };

  const handleFollowToggle = (userId: string) => {
    Alert.alert('Follow', `Follow functionality for user ${userId} will be implemented`);
  };

  const renderProfileCard = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="bg-white mx-4 mb-4 rounded-lg shadow-sm border border-gray-100 p-4"
      onPress={() => handleProfilePress(item.id)}
    >
      <View className="flex-row items-center mb-3">
        {item.profilePicture ? (
          <Image
            source={{ uri: item.profilePicture }}
            className="w-16 h-16 rounded-full mr-4"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 bg-golf-700 rounded-full mr-4 items-center justify-center">
            <Ionicons name="person" size={24} color="white" />
          </View>
        )}
        
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
            {item.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#3b82f6" className="ml-2" />
            )}
            {item.isPrivate && (
              <Ionicons name="lock-closed" size={14} color="#6b7280" className="ml-1" />
            )}
          </View>
          
          <View className="flex-row items-center mb-1">
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text className="text-gray-600 ml-1 text-sm">{item.location}</Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="golf-outline" size={14} color="#6b7280" />
            <Text className="text-gray-600 ml-1 text-sm">
              Handicap: {item.handicap} • {item.homeClub}
            </Text>
          </View>
        </View>
      </View>

      {item.bio && (
        <Text className="text-gray-700 text-sm mb-3" numberOfLines={2}>
          {item.bio}
        </Text>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-row space-x-4">
          <View className="items-center">
            <Text className="font-bold text-gray-900">{item.postsCount}</Text>
            <Text className="text-xs text-gray-600">Posts</Text>
          </View>
          <View className="items-center">
            <Text className="font-bold text-gray-900">{item.followersCount}</Text>
            <Text className="text-xs text-gray-600">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="font-bold text-gray-900">{item.stats?.gamesPlayed || 0}</Text>
            <Text className="text-xs text-gray-600">Rounds</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-golf-700 px-4 py-2 rounded-lg"
          onPress={() => handleFollowToggle(item.id)}
        >
          <Text className="text-white font-medium text-sm">Follow</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Ionicons name="search-outline" size={48} color="#d1d5db" />
      <Text className="text-gray-500 mt-4 text-center">
        {searchQuery ? 'No profiles found' : 'Search for golf players'}
      </Text>
      <Text className="text-gray-400 text-sm text-center mt-1">
        {searchQuery 
          ? 'Try searching with different keywords'
          : 'Discover golfers in your area or with similar interests'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Discover Golfers</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Search by name, location, or club..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={renderProfileCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListEmptyComponent={renderEmptyState}
        refreshing={isSearching}
        onRefresh={() => handleSearch(searchQuery)}
      />
    </SafeAreaView>
  );
}
