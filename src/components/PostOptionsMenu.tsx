import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReportModal from './ReportModal';
import BlockUserModal from './BlockUserModal';

interface PostOptionsMenuProps {
  postId: string;
  postOwnerId: string;
  postOwnerName: string;
  isOwnPost: boolean;
  onDelete?: () => void;
}

export default function PostOptionsMenu({
  postId,
  postOwnerId,
  postOwnerName,
  isOwnPost,
  onDelete,
}: PostOptionsMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  const handleReport = () => {
    setShowMenu(false);
    setShowReportModal(true);
  };

  const handleBlock = () => {
    setShowMenu(false);
    setShowBlockModal(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowMenu(true)}
        className="p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
      </TouchableOpacity>

      {/* Options Menu Modal */}
      <Modal visible={showMenu} animationType="fade" transparent>
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View className="bg-white rounded-t-3xl">
            <View className="items-center py-3">
              <View className="w-10 h-1 bg-gray-300 rounded-full" />
            </View>

            {isOwnPost ? (
              // Own post options
              <>
                <TouchableOpacity
                  className="flex-row items-center px-6 py-4 border-b border-gray-100"
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={24} color="#ef4444" />
                  <Text className="ml-4 text-red-500 font-medium text-lg">Delete Post</Text>
                </TouchableOpacity>
              </>
            ) : (
              // Other user's post options
              <>
                <TouchableOpacity
                  className="flex-row items-center px-6 py-4 border-b border-gray-100"
                  onPress={handleReport}
                >
                  <Ionicons name="flag-outline" size={24} color="#6b7280" />
                  <Text className="ml-4 text-gray-700 font-medium text-lg">Report Post</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center px-6 py-4 border-b border-gray-100"
                  onPress={handleBlock}
                >
                  <Ionicons name="ban-outline" size={24} color="#ef4444" />
                  <Text className="ml-4 text-red-500 font-medium text-lg">Block {postOwnerName}</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              className="flex-row items-center justify-center px-6 py-4 mb-6"
              onPress={() => setShowMenu(false)}
            >
              <Text className="text-gray-500 font-medium text-lg">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Modal */}
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="post"
        contentId={postId}
        contentOwnerId={postOwnerId}
        contentOwnerName={postOwnerName}
      />

      {/* Block Modal */}
      <BlockUserModal
        visible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userId={postOwnerId}
        userName={postOwnerName}
      />
    </>
  );
}
