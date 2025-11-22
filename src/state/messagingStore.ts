import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Message, 
  Conversation, 
  ConversationPreview, 
  MutualFriend 
} from '../types/golf';
import { messagingService } from '../api/messaging-service';

interface MessagingState {
  conversations: ConversationPreview[];
  currentConversation: Conversation | null;
  messages: Message[];
  mutualFriends: MutualFriend[];
  isLoading: boolean;
  unreadCount: number;
  
  // Actions
  loadConversations: (userId: string) => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, senderId: string, senderName: string, senderAvatar?: string) => Promise<void>;
  markMessagesAsRead: (conversationId: string, userId: string) => Promise<void>;
  loadMutualFriends: (userId1: string, userId2: string) => Promise<void>;
  searchConversations: (userId: string, query: string) => Promise<void>;
  deleteConversation: (conversationId: string, userId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearMessages: () => void;
  updateUnreadCount: (userId: string) => Promise<void>;
  
  // Reaction actions
  addReaction: (messageId: string, reactionType: string) => Promise<void>;
  removeReaction: (messageId: string) => Promise<void>;
  
  // Group chat actions
  createGroupChat: (groupName: string, groupDescription: string, participantIds: string[]) => Promise<void>;
  addMemberToGroup: (groupId: string, userId: string) => Promise<boolean>;
  removeMemberFromGroup: (groupId: string, userId: string) => Promise<boolean>;
  updateGroupSettings: (groupId: string, settings: any) => Promise<boolean>;
}

export const useMessagingStore = create<MessagingState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversation: null,
      messages: [],
      mutualFriends: [],
      isLoading: false,
      unreadCount: 0,
      
      loadConversations: async (userId: string) => {
        set({ isLoading: true });
        try {
          const conversations = await messagingService.getConversationPreviews(userId);
          set({ conversations });
        } catch (error) {
          console.error('Failed to load conversations:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      loadMessages: async (conversationId: string) => {
        set({ isLoading: true });
        try {
          const messages = await messagingService.getMessages(conversationId);
          set({ messages });
        } catch (error) {
          console.error('Failed to load messages:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      sendMessage: async (conversationId: string, content: string, senderId: string, senderName: string, senderAvatar?: string) => {
        try {
          const message = await messagingService.sendMessage(
            conversationId,
            senderId,
            senderName,
            senderAvatar,
            content
          );
          
          // Add message to current messages
          const { messages } = get();
          set({ messages: [...messages, message] });
          
          // Update conversations list
          const { conversations } = get();
          const updatedConversations = conversations.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: message,
                updatedAt: new Date(),
                unreadCount: 0
              };
            }
            return conv;
          });
          set({ conversations: updatedConversations });
          
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      },
      
      markMessagesAsRead: async (conversationId: string, userId: string) => {
        try {
          await messagingService.markMessagesAsRead(conversationId, userId);
          
          // Update messages locally
          const { messages } = get();
          const updatedMessages = messages.map(msg => 
            msg.conversationId === conversationId && msg.senderId !== userId
              ? { ...msg, isRead: true }
              : msg
          );
          set({ messages: updatedMessages });
          
          // Update conversations list
          const { conversations } = get();
          const updatedConversations = conversations.map(conv => {
            if (conv.id === conversationId) {
              return { ...conv, unreadCount: 0 };
            }
            return conv;
          });
          set({ conversations: updatedConversations });
          
        } catch (error) {
          console.error('Failed to mark messages as read:', error);
        }
      },
      
      loadMutualFriends: async (userId1: string, userId2: string) => {
        try {
          const mutualFriends = await messagingService.getMutualFriends(userId1, userId2);
          set({ mutualFriends });
        } catch (error) {
          console.error('Failed to load mutual friends:', error);
        }
      },
      
      searchConversations: async (userId: string, query: string) => {
        try {
          const conversations = await messagingService.searchConversations(userId, query);
          set({ conversations });
        } catch (error) {
          console.error('Failed to search conversations:', error);
        }
      },
      
      deleteConversation: async (conversationId: string, userId: string) => {
        try {
          await messagingService.deleteConversation(conversationId, userId);
          
          // Remove from local state
          const { conversations, messages } = get();
          const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
          const updatedMessages = messages.filter(msg => msg.conversationId !== conversationId);
          
          set({ 
            conversations: updatedConversations,
            messages: updatedMessages,
            currentConversation: null
          });
          
        } catch (error) {
          console.error('Failed to delete conversation:', error);
        }
      },
      
      setCurrentConversation: (conversation: Conversation | null) => {
        set({ currentConversation: conversation });
      },
      
      clearMessages: () => {
        set({ messages: [] });
      },
      
      updateUnreadCount: async (userId: string) => {
        try {
          const unreadCount = await messagingService.getUnreadCount(userId);
          set({ unreadCount });
        } catch (error) {
          console.error('Failed to update unread count:', error);
        }
      },

      // Reaction actions
      addReaction: async (messageId: string, reactionType: string) => {
        if (!user) return;
        
        try {
          await messagingService.addReaction(
            messageId,
            user.id,
            user.name,
            reactionType as any
          );
          
          // Update local messages
          const { messages } = get();
          const updatedMessages = messages.map(msg => {
            if (msg.id === messageId) {
              // Remove existing reaction from same user
              const filteredReactions = msg.reactions.filter(r => r.userId !== user.id);
              // Add new reaction
              filteredReactions.push({
                id: `${Date.now()}`,
                messageId,
                userId: user.id,
                userName: user.name,
                reactionType: reactionType as any,
                createdAt: new Date()
              });
              return { ...msg, reactions: filteredReactions };
            }
            return msg;
          });
          
          set({ messages: updatedMessages });
        } catch (error) {
          console.error('Failed to add reaction:', error);
        }
      },

      removeReaction: async (messageId: string) => {
        if (!user) return;
        
        try {
          await messagingService.removeReaction(messageId, user.id);
          
          // Update local messages
          const { messages } = get();
          const updatedMessages = messages.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                reactions: msg.reactions.filter(r => r.userId !== user.id)
              };
            }
            return msg;
          });
          
          set({ messages: updatedMessages });
        } catch (error) {
          console.error('Failed to remove reaction:', error);
        }
      },

      // Group chat actions
      createGroupChat: async (groupName: string, groupDescription: string, participantIds: string[]) => {
        if (!user) return;
        
        try {
          const newGroup = await messagingService.createGroupChat(
            user.id,
            groupName,
            groupDescription,
            participantIds
          );
          
          // Add to conversations list
          const { conversations } = get();
          const newPreview: ConversationPreview = {
            id: newGroup.id,
            otherUser: {
              id: newGroup.id,
              email: '',
              name: groupName,
              profilePicture: newGroup.groupAvatar,
              handicap: 0,
              homeClub: '',
              location: '',
              bio: groupDescription,
              coverPhoto: '',
              isPrivate: false,
              isVerified: false,
              followersCount: 0,
              followingCount: 0,
              postsCount: 0,
              website: '',
              galleryPhotos: [],
              lastActive: new Date(),
              twoFactorEnabled: false,
              twoFactorMethod: 'none',
              stats: {
                gamesPlayed: 0,
                averageScore: 0,
                bestScore: 0,
                coursesPlayed: 0
              },
              createdAt: new Date()
            },
            lastMessage: undefined,
            unreadCount: 0,
            updatedAt: new Date()
          };
          
          set({ conversations: [newPreview, ...conversations] });
        } catch (error) {
          console.error('Failed to create group chat:', error);
        }
      },

      addMemberToGroup: async (groupId: string, userId: string) => {
        if (!user) return false;
        
        try {
          const success = await messagingService.addMemberToGroup(groupId, userId, user.id);
          return success;
        } catch (error) {
          console.error('Failed to add member to group:', error);
          return false;
        }
      },

      removeMemberFromGroup: async (groupId: string, userId: string) => {
        if (!user) return false;
        
        try {
          const success = await messagingService.removeMemberFromGroup(groupId, userId, user.id);
          return success;
        } catch (error) {
          console.error('Failed to remove member from group:', error);
          return false;
        }
      },

      updateGroupSettings: async (groupId: string, settings: any) => {
        if (!user) return false;
        
        try {
          const success = await messagingService.updateGroupSettings(groupId, user.id, settings);
          return success;
        } catch (error) {
          console.error('Failed to update group settings:', error);
          return false;
        }
      }
    }),
    {
      name: 'messaging-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        conversations: state.conversations,
        unreadCount: state.unreadCount
      }),
    }
  )
);
