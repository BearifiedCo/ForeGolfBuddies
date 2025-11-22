import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment, Reply } from '../types/golf';

interface CommentSectionProps {
  comments: Comment[];
  currentUserId: string;
  currentUserName: string;
  onAddComment: (content: string) => void;
  onAddReply: (commentId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
  onLikeReply: (commentId: string, replyId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onDeleteReply?: (commentId: string, replyId: string) => void;
}

export default function CommentSection({
  comments,
  currentUserId,
  currentUserName,
  onAddComment,
  onAddReply,
  onLikeComment,
  onLikeReply,
  onDeleteComment,
  onDeleteReply
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const handleAddReply = (commentId: string) => {
    if (!replyText.trim()) return;
    
    onAddReply(commentId, replyText.trim());
    setReplyText('');
    setReplyingTo(null);
  };

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderReply = (reply: Reply, commentId: string) => (
    <View key={reply.id} className="ml-8 mt-3 border-l-2 border-gray-100 pl-3">
      <View className="flex-row items-start space-x-2">
        <View className="w-6 h-6 bg-golf-600 rounded-full items-center justify-center">
          <Ionicons name="person" size={12} color="white" />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center space-x-2">
            <Text className="font-medium text-gray-900 text-sm">{reply.userName}</Text>
            <Text className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</Text>
          </View>
          
          <Text className="text-gray-800 mt-1 text-sm">{reply.content}</Text>
          
          <View className="flex-row items-center mt-2 space-x-4">
            <TouchableOpacity
              onPress={() => onLikeReply(commentId, reply.id)}
              className="flex-row items-center"
            >
              <Ionicons
                name={reply.likedBy.includes(currentUserId) ? "heart" : "heart-outline"}
                size={14}
                color={reply.likedBy.includes(currentUserId) ? "#ef4444" : "#6b7280"}
              />
              {reply.likes > 0 && (
                <Text className="text-xs text-gray-600 ml-1">{reply.likes}</Text>
              )}
            </TouchableOpacity>
            
            {reply.userId === currentUserId && onDeleteReply && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Delete Reply',
                    'Are you sure you want to delete this reply?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', onPress: () => onDeleteReply(commentId, reply.id), style: 'destructive' }
                    ]
                  );
                }}
              >
                <Text className="text-xs text-red-500">Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  const renderComment = (comment: Comment) => (
    <View key={comment.id} className="py-3 border-b border-gray-100">
      <View className="flex-row items-start space-x-3">
        <View className="w-8 h-8 bg-golf-700 rounded-full items-center justify-center">
          <Ionicons name="person" size={16} color="white" />
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center space-x-2">
            <Text className="font-medium text-gray-900">{comment.userName}</Text>
            <Text className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</Text>
          </View>
          
          <Text className="text-gray-800 mt-1">{comment.content}</Text>
          
          <View className="flex-row items-center mt-2 space-x-4">
            <TouchableOpacity
              onPress={() => onLikeComment(comment.id)}
              className="flex-row items-center"
            >
              <Ionicons
                name={comment.likedBy.includes(currentUserId) ? "heart" : "heart-outline"}
                size={16}
                color={comment.likedBy.includes(currentUserId) ? "#ef4444" : "#6b7280"}
              />
              {comment.likes > 0 && (
                <Text className="text-sm text-gray-600 ml-1">{comment.likes}</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setReplyingTo(comment.id)}>
              <Text className="text-sm text-golf-700 font-medium">Reply</Text>
            </TouchableOpacity>
            
            {comment.replies.length > 0 && (
              <TouchableOpacity onPress={() => toggleReplies(comment.id)}>
                <Text className="text-sm text-gray-600">
                  {expandedComments.has(comment.id) ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                </Text>
              </TouchableOpacity>
            )}
            
            {comment.userId === currentUserId && onDeleteComment && (
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Delete Comment',
                    'Are you sure you want to delete this comment?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', onPress: () => onDeleteComment(comment.id), style: 'destructive' }
                    ]
                  );
                }}
              >
                <Text className="text-sm text-red-500">Delete</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Reply Input */}
          {replyingTo === comment.id && (
            <View className="mt-3">
              <View className="flex-row space-x-2">
                <TextInput
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  placeholder={`Reply to ${comment.userName}...`}
                  value={replyText}
                  onChangeText={setReplyText}
                  maxLength={200}
                  multiline
                />
                <TouchableOpacity
                  onPress={() => handleAddReply(comment.id)}
                  disabled={!replyText.trim()}
                  className={`px-3 py-2 rounded-lg ${
                    replyText.trim() ? 'bg-golf-700' : 'bg-gray-300'
                  }`}
                >
                  <Ionicons name="send" size={16} color="white" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
                className="mt-2"
              >
                <Text className="text-sm text-gray-500">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Replies */}
          {expandedComments.has(comment.id) && comment.replies.map(reply => 
            renderReply(reply, comment.id)
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View className="bg-white">
      {/* Comments List */}
      {comments.length > 0 ? (
        <View className="max-h-96 px-4">
          {comments.map(renderComment)}
        </View>
      ) : (
        <View className="px-4 py-6 items-center">
          <Ionicons name="chatbubble-outline" size={32} color="#d1d5db" />
          <Text className="text-gray-500 mt-2">No comments yet</Text>
          <Text className="text-gray-400 text-sm">Be the first to comment!</Text>
        </View>
      )}
      
      {/* Add Comment Input */}
      <View className="border-t border-gray-100 p-4">
        <View className="flex-row space-x-3">
          <View className="w-8 h-8 bg-golf-700 rounded-full items-center justify-center">
            <Ionicons name="person" size={16} color="white" />
          </View>
          
          <TextInput
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            maxLength={300}
            multiline
          />
          
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!newComment.trim()}
            className={`px-4 py-2 rounded-lg ${
              newComment.trim() ? 'bg-golf-700' : 'bg-gray-300'
            }`}
          >
            <Ionicons name="send" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
