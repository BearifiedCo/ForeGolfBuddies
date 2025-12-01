import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useModerationStore } from '../state/moderationStore';
import { useAuthStore } from '../state/authStore';

interface BlockUserModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onBlocked?: () => void;
}

export default function BlockUserModal({
  visible,
  onClose,
  userId,
  userName,
  onBlocked,
}: BlockUserModalProps) {
  const { user } = useAuthStore();
  const { blockUser, isUserBlocked } = useModerationStore();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBlock = () => {
    if (!user) return;

    if (isUserBlocked(user.id, userId)) {
      Alert.alert('Already Blocked', `${userName} is already blocked.`);
      onClose();
      return;
    }

    blockUser(user.id, userId, userName);
    setShowSuccess(true);
    onBlocked?.();
  };

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  if (showSuccess) {
    return (
      <Modal visible={visible} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 items-center justify-center px-8">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={40} color="#22c55e" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                User Blocked
              </Text>
              <Text className="text-gray-600 text-center mb-6">
                {userName} has been blocked. You won't see their posts or messages anymore.
              </Text>
              <TouchableOpacity
                className="bg-golf-700 px-8 py-3 rounded-lg w-full"
                onPress={handleClose}
              >
                <Text className="text-white font-medium text-center">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/50 items-center justify-center px-8">
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
          <View className="items-center">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="ban" size={32} color="#ef4444" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">
              Block {userName}?
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              They won't be able to find your profile, posts, or message you. They won't be notified that you blocked them.
            </Text>

            <View className="bg-gray-50 rounded-lg p-4 mb-6 w-full">
              <Text className="text-gray-700 text-sm font-medium mb-2">
                When you block someone:
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-start">
                  <Text className="text-gray-500 mr-2">•</Text>
                  <Text className="text-gray-600 text-sm flex-1">
                    Their posts and comments will be hidden from you
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-gray-500 mr-2">•</Text>
                  <Text className="text-gray-600 text-sm flex-1">
                    They can't message or mention you
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Text className="text-gray-500 mr-2">•</Text>
                  <Text className="text-gray-600 text-sm flex-1">
                    You can unblock them anytime in Settings
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row space-x-3 w-full">
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-3 rounded-lg"
                onPress={onClose}
              >
                <Text className="text-gray-700 font-medium text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 py-3 rounded-lg"
                onPress={handleBlock}
              >
                <Text className="text-white font-medium text-center">Block</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
