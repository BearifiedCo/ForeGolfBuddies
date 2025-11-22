// Messaging service for ForeBuddies
import { 
  Message, 
  Conversation, 
  ConversationPreview, 
  MutualFriend, 
  User 
} from '../types/golf';

// Mock data storage
const MOCK_CONVERSATIONS: Conversation[] = [];
const MOCK_MESSAGES: Message[] = [];
const MOCK_MUTUAL_FRIENDS: Map<string, MutualFriend[]> = new Map();

export class MessagingService {
  // Simulate network delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get or create conversation between two users
  async getOrCreateConversation(userId1: string, userId2: string): Promise<Conversation> {
    await this.delay(300);

    // Check if conversation already exists
    const existingConversation = MOCK_CONVERSATIONS.find(conv => 
      conv.participants.includes(userId1) && 
      conv.participants.includes(userId2) &&
      conv.participants.length === 2
    );

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: this.generateId(),
      participants: [userId1, userId2],
      unreadCount: 0,
      isGroupChat: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    MOCK_CONVERSATIONS.push(newConversation);
    return newConversation;
  }

  // Get conversation previews for a user
  async getConversationPreviews(userId: string): Promise<ConversationPreview[]> {
    await this.delay(400);

    const userConversations = MOCK_CONVERSATIONS.filter(conv => 
      conv.participants.includes(userId)
    );

    const previews: ConversationPreview[] = [];

    for (const conv of userConversations) {
      const otherUserId = conv.participants.find(id => id !== userId);
      if (!otherUserId) continue;

      // Get other user info (in real app, this would come from user service)
      const otherUser: User = {
        id: otherUserId,
        email: `${otherUserId}@example.com`,
        name: `User ${otherUserId}`,
        avatar: `https://via.placeholder.com/100?text=${otherUserId}`,
        handicap: 15,
        homeClub: 'Local Golf Club',
        location: 'Golf City, GC',
        bio: 'Golf enthusiast',
        profilePicture: `https://via.placeholder.com/150?text=${otherUserId}`,
        coverPhoto: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=200&fit=crop',
        isPrivate: false,
        isVerified: false,
        followersCount: 25,
        followingCount: 30,
        postsCount: 12,
        website: '',
        galleryPhotos: [],
        lastActive: new Date(),
        twoFactorEnabled: false,
        twoFactorMethod: 'none',
        stats: {
          gamesPlayed: 20,
          averageScore: 85,
          bestScore: 78,
          coursesPlayed: 8
        },
        createdAt: new Date(),
        isOnline: Math.random() > 0.7
      };

      const lastMessage = MOCK_MESSAGES
        .filter(msg => msg.conversationId === conv.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      previews.push({
        id: conv.id,
        otherUser,
        lastMessage,
        unreadCount: conv.unreadCount,
        updatedAt: conv.updatedAt
      });
    }

    // Sort by most recent activity
    return previews.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    await this.delay(300);

    const messages = MOCK_MESSAGES
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return messages.slice(-limit);
  }

  // Send a message
  async sendMessage(
    conversationId: string, 
    senderId: string, 
    senderName: string, 
    senderAvatar: string | undefined,
    content: string, 
    messageType: 'text' | 'image' | 'golf_score' | 'location' = 'text',
    metadata?: any
  ): Promise<Message> {
    await this.delay(200);

    const message: Message = {
      id: this.generateId(),
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      content,
      messageType,
      metadata,
      isRead: false,
      reactions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    MOCK_MESSAGES.push(message);

    // Update conversation
    const conversation = MOCK_CONVERSATIONS.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = new Date();
      conversation.unreadCount += 1;
    }

    return message;
  }

  // Add reaction to message
  async addReaction(
    messageId: string,
    userId: string,
    userName: string,
    reactionType: '👍' | '❤️' | '🏌️' | '🎯' | '🔥' | '👏' | '😄' | '🤔'
  ): Promise<MessageReaction> {
    await this.delay(200);

    const reaction: MessageReaction = {
      id: this.generateId(),
      messageId,
      userId,
      userName,
      reactionType,
      createdAt: new Date()
    };

    // Add reaction to message
    const message = MOCK_MESSAGES.find(msg => msg.id === messageId);
    if (message) {
      // Remove existing reaction from same user if exists
      message.reactions = message.reactions.filter(r => r.userId !== userId);
      message.reactions.push(reaction);
      message.updatedAt = new Date();
    }

    return reaction;
  }

  // Remove reaction from message
  async removeReaction(messageId: string, userId: string): Promise<void> {
    await this.delay(200);

    const message = MOCK_MESSAGES.find(msg => msg.id === messageId);
    if (message) {
      message.reactions = message.reactions.filter(r => r.userId !== userId);
      message.updatedAt = new Date();
    }
  }

  // Create group chat
  async createGroupChat(
    creatorId: string,
    groupName: string,
    groupDescription: string,
    participantIds: string[],
    groupAvatar?: string
  ): Promise<Conversation> {
    await this.delay(500);

    const newGroupChat: Conversation = {
      id: this.generateId(),
      participants: [creatorId, ...participantIds],
      unreadCount: 0,
      isGroupChat: true,
      groupName,
      groupDescription,
      groupAvatar,
      groupAdminIds: [creatorId],
      groupSettings: {
        allowReactions: true,
        allowNewMembers: true,
        requireAdminApproval: false,
        maxMembers: 50
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    MOCK_CONVERSATIONS.push(newGroupChat);
    return newGroupChat;
  }

  // Add member to group
  async addMemberToGroup(
    groupId: string,
    userId: string,
    addedByUserId: string
  ): Promise<boolean> {
    await this.delay(300);

    const group = MOCK_CONVERSATIONS.find(conv => 
      conv.id === groupId && conv.isGroupChat
    );

    if (!group) return false;

    // Check if user is admin or if admin approval is not required
    const isAdmin = group.groupAdminIds.includes(addedByUserId);
    const requiresApproval = group.groupSettings.requireAdminApproval;

    if (requiresApproval && !isAdmin) {
      return false; // Need admin approval
    }

    // Check if user is already a member
    if (group.participants.includes(userId)) {
      return false; // Already a member
    }

    // Check max members limit
    if (group.participants.length >= group.groupSettings.maxMembers) {
      return false; // Group is full
    }

    group.participants.push(userId);
    group.updatedAt = new Date();
    return true;
  }

  // Remove member from group
  async removeMemberFromGroup(
    groupId: string,
    userId: string,
    removedByUserId: string
  ): Promise<boolean> {
    await this.delay(300);

    const group = MOCK_CONVERSATIONS.find(conv => 
      conv.id === groupId && conv.isGroupChat
    );

    if (!group) return false;

    // Only admins can remove members
    if (!group.groupAdminIds.includes(removedByUserId)) {
      return false;
    }

    // Can't remove yourself if you're the only admin
    if (userId === removedByUserId && group.groupAdminIds.length === 1) {
      return false;
    }

    group.participants = group.participants.filter(id => id !== userId);
    group.groupAdminIds = group.groupAdminIds.filter(id => id !== userId);
    group.updatedAt = new Date();

    return true;
  }

  // Update group settings
  async updateGroupSettings(
    groupId: string,
    userId: string,
    settings: Partial<Conversation['groupSettings']>
  ): Promise<boolean> {
    await this.delay(300);

    const group = MOCK_CONVERSATIONS.find(conv => 
      conv.id === groupId && conv.isGroupChat
    );

    if (!group || !group.groupAdminIds.includes(userId)) {
      return false; // Not found or not admin
    }

    Object.assign(group.groupSettings, settings);
    group.updatedAt = new Date();
    return true;
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await this.delay(200);

    const messages = MOCK_MESSAGES.filter(msg => 
      msg.conversationId === conversationId && 
      msg.senderId !== userId && 
      !msg.isRead
    );

    messages.forEach(msg => {
      msg.isRead = true;
      msg.updatedAt = new Date();
    });

    // Reset unread count for conversation
    const conversation = MOCK_CONVERSATIONS.find(conv => conv.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }
  }

  // Get mutual friends between two users
  async getMutualFriends(userId1: string, userId2: string): Promise<MutualFriend[]> {
    await this.delay(400);

    // In a real app, this would query the database for mutual friends
    // For now, we'll generate some mock mutual friends
    const mockMutualFriends: MutualFriend[] = [
      {
        userId: 'mutual1',
        userName: 'Mike Johnson',
        userAvatar: 'https://via.placeholder.com/100?text=MJ',
        mutualFriendsCount: 8,
        isOnline: true,
        lastActive: new Date()
      },
      {
        userId: 'mutual2',
        userName: 'Sarah Wilson',
        userAvatar: 'https://via.placeholder.com/100?text=SW',
        mutualFriendsCount: 12,
        isOnline: false,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        userId: 'mutual3',
        userName: 'David Chen',
        userAvatar: 'https://via.placeholder.com/100?text=DC',
        mutualFriendsCount: 5,
        isOnline: true,
        lastActive: new Date()
      }
    ];

    return mockMutualFriends;
  }

  // Search conversations
  async searchConversations(userId: string, query: string): Promise<ConversationPreview[]> {
    await this.delay(300);

    const allPreviews = await this.getConversationPreviews(userId);
    
    if (!query.trim()) return allPreviews;

    return allPreviews.filter(preview => 
      preview.otherUser.name.toLowerCase().includes(query.toLowerCase()) ||
      preview.lastMessage?.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Delete conversation
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    await this.delay(300);

    // Remove conversation from user's list
    const conversationIndex = MOCK_CONVERSATIONS.findIndex(conv => 
      conv.id === conversationId && conv.participants.includes(userId)
    );

    if (conversationIndex !== -1) {
      MOCK_CONVERSATIONS.splice(conversationIndex, 1);
    }

    // Remove all messages
    const messageIndices = MOCK_MESSAGES
      .map((msg, index) => ({ msg, index }))
      .filter(({ msg }) => msg.conversationId === conversationId)
      .map(({ index }) => index)
      .reverse(); // Reverse to remove from end first

    messageIndices.forEach(index => {
      MOCK_MESSAGES.splice(index, 1);
    });
  }

  // Get unread message count for a user
  async getUnreadCount(userId: string): Promise<number> {
    await this.delay(200);

    const userConversations = MOCK_CONVERSATIONS.filter(conv => 
      conv.participants.includes(userId)
    );

    return userConversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }
}

export const messagingService = new MessagingService();
