import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSocialStore } from '../state/socialStore';
import { useAuthStore } from '../state/authStore';
import { User, Friendship } from '../types/golf';

interface FriendsScreenProps {
  navigation: any;
}

export default function FriendsScreen({ navigation: _navigation }: FriendsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  
  const { friends, friendRequests, addFriend, addFriendRequest, acceptFriendRequest, declineFriendRequest } = useSocialStore();
  const { user } = useAuthStore();

  // Mock search results
  const mockUsers: User[] = [
    {
      id: '2',
      email: 'john.doe@example.com',
      name: 'John Doe',
      handicap: 12,
      location: 'Los Angeles, CA',
      createdAt: new Date(),
    },
    {
      id: '3',
      email: 'sarah.smith@example.com',
      name: 'Sarah Smith',
      handicap: 8,
      location: 'San Diego, CA',
      createdAt: new Date(),
    },
    {
      id: '4',
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      handicap: 18,
      location: 'San Francisco, CA',
      createdAt: new Date(),
    },
  ];

  const filteredUsers = mockUsers.filter(mockUser => 
    mockUser.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    mockUser.id !== user?.id &&
    !friends.some(friend => friend.id === mockUser.id)
  );

  const handleSendFriendRequest = (targetUser: User) => {
    const newRequest: Friendship = {
      id: Date.now().toString(),
      userId: user?.id || '',
      friendId: targetUser.id,
      status: 'pending',
      createdAt: new Date(),
    };
    
    addFriendRequest(newRequest);
    Alert.alert('Success', `Friend request sent to ${targetUser.name}!`);
  };

  const handleAcceptRequest = (request: Friendship) => {
    const friendUser = mockUsers.find(u => u.id === request.userId);
    if (friendUser) {
      addFriend(friendUser);
      acceptFriendRequest(request.id);
      Alert.alert('Success', `You are now friends with ${friendUser.name}!`);
    }
  };

  const handleDeclineRequest = (request: Friendship) => {
    declineFriendRequest(request.id);
    Alert.alert('Declined', 'Friend request declined.');
  };

  const renderFriend = (friend: User) => (
    <View key={friend.id} className="bg-white mx-4 mb-3 rounded-lg shadow-sm border border-gray-100">
      <View className="p-4">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-golf-700 rounded-full items-center justify-center mr-4">
            <Ionicons name="person" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-base">{friend.name}</Text>
            <Text className="text-gray-600 text-sm">{friend.location}</Text>
            <Text className="text-golf-700 text-sm">Handicap: {friend.handicap}</Text>
          </View>
          <View className="flex-row space-x-2">
            <Pressable 
              className="p-2 bg-golf-600 rounded-lg"
              onPress={() => navigation.navigate('NewMessage')}
            >
              <Ionicons name="chatbubble-outline" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFriendRequest = (request: Friendship) => {
    const requester = mockUsers.find(u => u.id === request.userId);
    if (!requester) return null;

    return (
      <View key={request.id} className="bg-white mx-4 mb-3 rounded-lg shadow-sm border border-gray-100">
        <View className="p-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center mr-4">
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 text-base">{requester.name}</Text>
              <Text className="text-gray-600 text-sm">{requester.location}</Text>
              <Text className="text-blue-600 text-sm">Handicap: {requester.handicap}</Text>
            </View>
          </View>
          <View className="flex-row mt-3 space-x-3">
            <Pressable
              className="flex-1 bg-golf-700 rounded-lg py-2 items-center"
              onPress={() => handleAcceptRequest(request)}
            >
              <Text className="text-white font-medium">Accept</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-gray-300 rounded-lg py-2 items-center"
              onPress={() => handleDeclineRequest(request)}
            >
              <Text className="text-gray-700 font-medium">Decline</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderSearchResult = (searchUser: User) => (
    <View key={searchUser.id} className="bg-white mx-4 mb-3 rounded-lg shadow-sm border border-gray-100">
      <View className="p-4">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-gray-600 rounded-full items-center justify-center mr-4">
            <Ionicons name="person" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900 text-base">{searchUser.name}</Text>
            <Text className="text-gray-600 text-sm">{searchUser.location}</Text>
            <Text className="text-gray-600 text-sm">Handicap: {searchUser.handicap}</Text>
          </View>
          <View className="flex-row space-x-2">
            <Pressable
              className="bg-golf-600 px-3 py-2 rounded-lg"
              onPress={() => navigation.navigate('NewMessage')}
            >
              <Ionicons name="chatbubble-outline" size={18} color="white" />
            </Pressable>
            
            <Pressable
              className="bg-golf-700 px-4 py-2 rounded-lg"
              onPress={() => handleSendFriendRequest(searchUser)}
            >
              <Text className="text-white font-medium">Add Friend</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Tab Navigation */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row px-4 py-2">
          {[
            { key: 'friends', label: 'Friends', count: friends.length },
            { key: 'requests', label: 'Requests', count: friendRequests.length },
            { key: 'search', label: 'Find Friends', count: 0 },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              className={`flex-1 py-3 items-center border-b-2 ${
                activeTab === tab.key ? 'border-golf-700' : 'border-transparent'
              }`}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <View className="flex-row items-center">
                <Text className={`font-medium ${
                  activeTab === tab.key ? 'text-golf-700' : 'text-gray-600'
                }`}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View className="ml-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs font-bold">{tab.count}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Search Bar for Find Friends tab */}
      {activeTab === 'search' && (
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search for golfers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>
        </View>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          {activeTab === 'friends' && (
            <>
              {friends.length > 0 ? (
                friends.map(renderFriend)
              ) : (
                <View className="items-center py-12">
                  <Ionicons name="people-outline" size={64} color="#d1d5db" />
                  <Text className="text-gray-500 text-lg font-medium mt-4">No friends yet</Text>
                  <Text className="text-gray-400 text-center mt-2 px-6">
                    Start connecting with other golfers to build your network
                  </Text>
                  <Pressable
                    className="bg-golf-700 px-6 py-3 rounded-lg mt-4"
                    onPress={() => setActiveTab('search')}
                  >
                    <Text className="text-white font-medium">Find Friends</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}

          {activeTab === 'requests' && (
            <>
              {friendRequests.length > 0 ? (
                friendRequests.map(renderFriendRequest)
              ) : (
                <View className="items-center py-12">
                  <Ionicons name="mail-outline" size={64} color="#d1d5db" />
                  <Text className="text-gray-500 text-lg font-medium mt-4">No friend requests</Text>
                  <Text className="text-gray-400 text-center mt-2 px-6">
                    Friend requests will appear here when other golfers want to connect
                  </Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'search' && (
            <>
              {searchQuery.length > 0 ? (
                filteredUsers.length > 0 ? (
                  filteredUsers.map(renderSearchResult)
                ) : (
                  <View className="items-center py-12">
                    <Ionicons name="search-outline" size={64} color="#d1d5db" />
                    <Text className="text-gray-500 text-lg font-medium mt-4">No results found</Text>
                    <Text className="text-gray-400 text-center mt-2 px-6">
                      Try searching with a different name
                    </Text>
                  </View>
                )
              ) : (
                <View className="items-center py-12">
                  <Ionicons name="search-outline" size={64} color="#d1d5db" />
                  <Text className="text-gray-500 text-lg font-medium mt-4">Find Golf Buddies</Text>
                  <Text className="text-gray-400 text-center mt-2 px-6">
                    Search for golfers by name to send friend requests
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}