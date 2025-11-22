import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useMessagingStore } from '../state/messagingStore';
import { Message, User } from '../types/golf';
import { messagingService } from '../api/messaging-service';

interface ChatScreenProps {
  navigation: any;
  route: {
    params: {
      conversationId: string;
      otherUser: User;
    };
  };
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { conversationId, otherUser } = route.params;
  const { user } = useAuthStore();
  const { 
    messages, 
    isLoading, 
    loadMessages, 
    sendMessage, 
    markMessagesAsRead,
    addReaction,
    removeReaction
  } = useMessagingStore();
  
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (user && conversationId) {
      markMessagesAsRead(conversationId, user.id);
    }
  }, [messages, user, conversationId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(
        conversationId,
        messageText.trim(),
        user.id,
        user.name,
        user.profilePicture
      );
      setMessageText('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleReactionPress = async (messageId: string, reactionType: string) => {
    // If user already has this reaction, remove it
    const message = messages.find(msg => msg.id === messageId);
    const userReaction = message?.reactions.find(r => r.userId === user?.id);
    
    if (userReaction && userReaction.reactionType === reactionType) {
      await removeReaction(messageId);
    } else {
      await addReaction(messageId, reactionType);
    }
  };

  const renderReactionPicker = (messageId: string) => {
    const reactions = ['👍', '❤️', '🏌️', '🎯', '🔥', '👏', '😄', '🤔'];
    
    return (
      <View className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <View className="flex-row space-x-2">
          {reactions.map((reaction) => (
            <TouchableOpacity
              key={reaction}
              onPress={() => {
                handleReactionPress(messageId, reaction);
                setShowReactionPicker(null);
              }}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Text className="text-lg">{reaction}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === user?.id;
    
    return (
      <View className={`mb-3 px-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <View className={`max-w-[80%] ${isOwnMessage ? 'bg-golf-600' : 'bg-gray-200'} rounded-2xl px-4 py-3`}>
          {item.messageType === 'golf_score' && item.metadata ? (
            <View>
              <Text className={`text-sm font-medium ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
                🏌️ Golf Score
              </Text>
              <Text className={`text-lg font-bold ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
                {item.metadata.score} on {item.metadata.par} par
              </Text>
              <Text className={`text-sm ${isOwnMessage ? 'text-golf-100' : 'text-gray-600'}`}>
                Course: {item.metadata.course}
              </Text>
            </View>
          ) : item.messageType === 'location' && item.metadata ? (
            <View>
              <Text className={`text-sm font-medium ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
                📍 Location Shared
              </Text>
              <Text className={`text-base ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
                {item.metadata.locationName || 'Golf Course'}
              </Text>
            </View>
          ) : item.messageType === 'image' ? (
            <View>
              <Text className={`text-sm font-medium ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
                📷 Photo
              </Text>
            </View>
          ) : (
            <Text className={`text-base ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
              {item.content}
            </Text>
          )}
        </View>
        
        <Text className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {new Date(item.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {!isOwnMessage && !item.isRead && (
            <Text className="ml-2">• Unread</Text>
          )}
        </Text>
        
        {/* Reactions */}
        {item.reactions.length > 0 && (
          <View className={`mt-2 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
            <View className="flex-row flex-wrap space-x-1">
              {item.reactions.map((reaction, index) => (
                <TouchableOpacity
                  key={reaction.id}
                  onPress={() => handleReactionPress(item.id, reaction.reactionType)}
                  className="bg-gray-100 rounded-full px-2 py-1"
                >
                  <Text className="text-sm">{reaction.reactionType}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* Reaction Button */}
        <TouchableOpacity
          onPress={() => setShowReactionPicker(item.id)}
          className={`mt-2 ${isOwnMessage ? 'items-end' : 'items-start'}`}
        >
          <View className="bg-gray-100 rounded-full px-3 py-1">
            <Text className="text-gray-600 text-sm">+</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View className="mb-3 px-4 items-start">
      <View className="bg-gray-200 rounded-2xl px-4 py-3">
        <View className="flex-row space-x-1">
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        </View>
      </View>
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
            
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-golf-100 rounded-full items-center justify-center mr-3">
                <Text className="text-golf-700 font-semibold text-lg">
                  {otherUser.name.charAt(0)}
                </Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-white font-semibold text-lg">
                  {otherUser.name}
                </Text>
                <View className="flex-row items-center">
                  <View className={`w-2 h-2 rounded-full mr-2 ${
                    otherUser.isOnline ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                  <Text className="text-golf-100 text-sm">
                    {otherUser.isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('UserProfile', { userId: otherUser.id })}
              className="ml-3"
            >
              <Ionicons name="person-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#10288F" />
          </View>
        ) : (
          <View className="flex-1">
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            />
            
            {/* Reaction Picker */}
            {showReactionPicker && renderReactionPicker(showReactionPicker)}
          </View>
        )}

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-white border-t border-gray-200 px-4 py-3"
        >
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="add" size={20} color="#6b7280" />
            </TouchableOpacity>
            
            <View className="flex-1 bg-gray-100 rounded-full px-4 py-2">
              <TextInput
                className="text-gray-900 text-base"
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
                placeholderTextColor="#9ca3af"
              />
            </View>
            
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!messageText.trim() || isSending}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                messageText.trim() && !isSending ? 'bg-golf-600' : 'bg-gray-300'
              }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={messageText.trim() && !isSending ? "white" : "#9ca3af"} 
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
