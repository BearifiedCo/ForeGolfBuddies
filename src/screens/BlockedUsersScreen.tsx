import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useModerationStore } from '../state/moderationStore';
import { useAuthStore } from '../state/authStore';
import { BlockedUser } from '../types/golf';

interface BlockedUsersScreenProps {
  navigation: any;
}

export default function BlockedUsersScreen({ navigation }: BlockedUsersScreenProps) {
  const { user } = useAuthStore();
  const { getBlockedUsers, unblockUser } = useModerationStore();

  const blockedUsers = user ? getBlockedUsers(user.id) : [];

  const handleUnblock = (blockedUser: BlockedUser) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${blockedUser.blockedUserName}? They will be able to see your posts and message you again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => {
            if (user) {
              unblockUser(user.id, blockedUser.blockedUserId);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View className="bg-white p-4 border-b border-gray-100 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3">
          <Ionicons name="person" size={24} color="#9ca3af" />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-gray-900">{item.blockedUserName}</Text>
          <Text className="text-sm text-gray-500">
            Blocked on {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        className="bg-gray-100 px-4 py-2 rounded-lg"
        onPress={() => handleUnblock(item)}
      >
        <Text className="text-gray-700 font-medium">Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Blocked Users</Text>
          </View>
        </View>

        {blockedUsers.length > 0 ? (
          <FlatList
            data={blockedUsers}
            renderItem={renderBlockedUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="ban-outline" size={40} color="#9ca3af" />
            </View>
            <Text className="text-xl font-medium text-gray-900 mb-2">No Blocked Users</Text>
            <Text className="text-gray-500 text-center">
              When you block someone, they'll appear here. Blocked users can't see your posts or message you.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}
