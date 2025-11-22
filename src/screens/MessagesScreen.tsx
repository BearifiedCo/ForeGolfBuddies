import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useMessagingStore } from '../state/messagingStore';
import { ConversationPreview, Message } from '../types/golf';
import { getTimeBasedGreeting } from '../utils/greetings';

interface MessagesScreenProps {
  navigation: any;
}

export default function MessagesScreen({ navigation }: MessagesScreenProps) {
  const { user } = useAuthStore();
  const { 
    conversations, 
    isLoading, 
    loadConversations, 
    searchConversations,
    updateUnreadCount 
  } = useMessagingStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations(user.id);
      updateUnreadCount(user.id);
    }
  }, [user]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!user) return;

    if (query.trim()) {
      setIsSearching(true);
      await searchConversations(user.id, query);
      setIsSearching(false);
    } else {
      await loadConversations(user.id);
    }
  };

  const handleConversationPress = (conversation: ConversationPreview) => {
    navigation.navigate('Chat', { 
      conversationId: conversation.id,
      otherUser: conversation.otherUser
    });
  };

  const handleNewMessage = () => {
    navigation.navigate('NewMessage');
  };

  const formatLastMessage = (message?: Message) => {
    if (!message) return 'No messages yet';
    
    if (message.messageType === 'golf_score') {
      return `🏌️ Shot ${message.metadata?.score} on ${message.metadata?.course}`;
    } else if (message.messageType === 'location') {
      return `📍 ${message.metadata?.locationName || 'Shared location'}`;
    } else if (message.messageType === 'image') {
      return '📷 Photo';
    }
    
    return message.content.length > 30 
      ? `${message.content.substring(0, 30)}...` 
      : message.content;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return new Date(date).toLocaleDateString();
  };

  const renderConversation = ({ item }: { item: ConversationPreview }) => (
    <TouchableOpacity
      className="bg-white border-b border-gray-100 p-4"
      onPress={() => handleConversationPress(item)}
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="relative">
          <View className="w-12 h-12 bg-golf-100 rounded-full items-center justify-center mr-3">
            {item.otherUser.profilePicture ? (
              <Text className="text-golf-700 font-semibold text-lg">
                {item.otherUser.name.charAt(0)}
              </Text>
            ) : (
              <Text className="text-golf-700 font-semibold text-lg">
                {item.otherUser.name.charAt(0)}
              </Text>
            )}
          </View>
          
          {/* Online indicator */}
          {item.otherUser.isOnline && (
            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>

        {/* Conversation details */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-semibold text-gray-900 text-base">
              {item.otherUser.name}
            </Text>
            <Text className="text-xs text-gray-500">
              {formatTime(item.updatedAt)}
            </Text>
          </View>
          
          <Text className="text-gray-600 text-sm mb-1" numberOfLines={1}>
            {formatLastMessage(item.lastMessage)}
          </Text>
          
          {/* Mutual friends indicator */}
          <View className="flex-row items-center">
            <Ionicons name="people" size={14} color="#6b7280" />
            <Text className="text-xs text-gray-500 ml-1">
              {Math.floor(Math.random() * 15) + 1} mutual friends
            </Text>
          </View>
        </View>

        {/* Unread count */}
        {item.unreadCount > 0 && (
          <View className="ml-3">
            <View className="bg-golf-600 rounded-full w-6 h-6 items-center justify-center">
              <Text className="text-white text-xs font-semibold">
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-20 h-20 bg-golf-100 rounded-full items-center justify-center mb-4">
        <Ionicons name="chatbubbles-outline" size={40} color="#10288F" />
      </View>
      <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
        No conversations yet
      </Text>
      <Text className="text-gray-600 text-center mb-6">
        Start connecting with other golfers by sending your first message!
      </Text>
      <TouchableOpacity
        className="bg-golf-700 rounded-lg px-6 py-3"
        onPress={handleNewMessage}
      >
        <Text className="text-white font-semibold">Start a Conversation</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#10288F" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-golf-700 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-lg font-semibold">
                {getTimeBasedGreeting()}
              </Text>
              <Text className="text-golf-100 text-sm">Messages</Text>
            </View>
            
            <View className="flex-row space-x-2">
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateGroupChat')}
                className="w-10 h-10 bg-golf-600 rounded-full items-center justify-center"
              >
                <Ionicons name="people" size={20} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleNewMessage}
                className="w-10 h-10 bg-golf-600 rounded-full items-center justify-center"
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-900"
              placeholder="Search conversations..."
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

        {/* Conversations List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#10288F" />
          </View>
        ) : conversations.length > 0 ? (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          renderEmptyState()
        )}
      </SafeAreaView>
    </>
  );
}
