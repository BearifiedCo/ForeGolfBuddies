export interface UserStats {
  gamesPlayed: number;
  averageScore: number;
  bestScore: number;
  coursesPlayed: number;
}

export interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  name: string;
  avatar?: string;
  handicap?: number;
  homeClub?: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  coverPhoto?: string;
  isPrivate: boolean;
  isVerified?: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  website?: string;
  galleryPhotos: ProfilePhoto[];
  lastActive?: Date;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'email' | 'phone' | 'none';
  stats: {
    gamesPlayed: number;
    averageScore: number;
    bestScore: number;
    coursesPlayed: number;
  };
  createdAt: Date;
  // New messaging fields
  isOnline?: boolean;
  typingInConversation?: string; // conversation ID if currently typing
  messagePreferences?: {
    allowMessagesFrom: 'everyone' | 'friends_only' | 'none';
    showOnlineStatus: boolean;
    showTypingIndicator: boolean;
  };
}

export interface ProfilePhoto {
  id: string;
  uri: string;
  caption?: string;
  location?: string;
  takenAt: Date;
  uploadedAt: Date;
  likes: number;
  likedBy: string[];
  comments: ProfilePhotoComment[];
  isPrivate: boolean;
  tags?: string[];
}

export interface ProfilePhotoComment {
  id: string;
  photoId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface FollowRelationship {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'blocked';
}

export interface Friendship {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'general' | 'photo' | 'score' | 'achievement';
  photos?: PostPhoto[];
  location?: string;
  courseId?: string;
  courseName?: string;
  scoreData?: {
    score: number;
    par: number;
    course: string;
  };
  metadata?: {
    achievementId?: string;
    tierId?: string;
    rewardType?: 'achievement' | 'tier';
    iconName?: string;
    rarity?: string;
    points?: number;
  };
  likes: number;
  likedBy?: string[];
  comments?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostPhoto {
  id: string;
  uri: string;
  width: number;
  height: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  likedBy?: string[];
  replies?: Reply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  likedBy?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  location: string;
  holes: number;
  par: number;
  priceRange: string;
  amenities: string[];
  images: string[];
  description: string;
}

// Enhanced Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phoneNumber?: string;
  handicap?: number;
  homeClub?: string;
  location?: string;
  enableTwoFactor: boolean;
  twoFactorMethod: 'email' | 'phone' | 'none';
}

export interface TwoFactorVerification {
  userId: string;
  code: string;
  method: 'email' | 'phone';
}

export interface PasswordResetRequest {
  email: string;
  method: 'email' | 'phone';
}

export interface PasswordReset {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
  twoFactorRequired: boolean;
  twoFactorMethod?: 'email' | 'phone';
}

// Messaging System Types
export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  reactionType: '👍' | '❤️' | '🏌️' | '🎯' | '🔥' | '👏' | '😄' | '🤔';
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'image' | 'golf_score' | 'location';
  metadata?: {
    imageUrl?: string;
    score?: number;
    par?: number;
    course?: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
  };
  isRead: boolean;
  reactions: MessageReaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  unreadCount: number;
  isGroupChat: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupDescription?: string;
  groupAdminIds: string[]; // User IDs of admins
  groupSettings: {
    allowReactions: boolean;
    allowNewMembers: boolean;
    requireAdminApproval: boolean;
    maxMembers: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationPreview {
  id: string;
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
}

export interface MutualFriend {
  userId: string;
  userName: string;
  userAvatar?: string;
  mutualFriendsCount: number;
  isOnline: boolean;
  lastActive: Date;
}

export interface MessageNotification {
  id: string;
  userId: string;
  conversationId: string;
  messageId: string;
  type: 'new_message' | 'message_read' | 'typing_indicator';
  createdAt: Date;
}

// Content Moderation Types
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'hate_speech'
  | 'violence'
  | 'misinformation'
  | 'impersonation'
  | 'other';

export type ReportContentType = 'post' | 'comment' | 'reply' | 'message' | 'user';

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  contentType: ReportContentType;
  contentId: string;
  contentOwnerId: string;
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedUserId: string;
  blockedUserName: string;
  reason?: string;
  createdAt: Date;
}

// App Configuration
export interface AppConfig {
  supportEmail: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  appVersion: string;
}