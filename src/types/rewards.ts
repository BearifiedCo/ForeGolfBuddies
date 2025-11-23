// Reward System Types - Xbox-style achievements and tier progression

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type AchievementCategory = 'social' | 'golf' | 'engagement' | 'streak' | 'milestone' | 'special';
export type RewardType = 'badge' | 'tier_unlock' | 'title' | 'avatar_frame' | 'special_privilege';

// User Tier System (Like Xbox Gamerscore levels)
export interface UserTier {
  id: string;
  name: string;
  level: number;
  pointsRequired: number;
  color: string;
  iconName: string;
  benefits: TierBenefit[];
  isUnlocked: boolean;
}

export interface TierBenefit {
  type: 'profile_customization' | 'exclusive_badges' | 'priority_support' | 'beta_features' | 'custom_avatar_frames' | 'special_privilege';
  description: string;
  iconName: string;
}

// Achievement System
export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: BadgeRarity;
  iconName: string;
  pointsReward: number;
  unlockConditions: AchievementCondition[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  progressCurrent: number;
  progressTotal: number;
  isHidden: boolean; // Secret achievements
  prerequisites?: string[]; // Other achievement IDs required
}

export interface AchievementCondition {
  type: 'posts_created' | 'likes_received' | 'comments_made' | 'friends_added' | 'login_streak' | 
        'games_played' | 'score_under_par' | 'courses_played' | 'photos_uploaded' | 'messages_sent' |
        'profile_visits' | 'app_opens' | 'time_spent' | 'weekend_activity' | 'night_owl' | 'early_bird';
  target: number;
  current: number;
  metadata?: Record<string, any>; // For complex conditions
}

// Badge System
export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  rarity: BadgeRarity;
  category: AchievementCategory;
  isUnlocked: boolean;
  unlockedAt?: Date;
  displayOrder: number;
  glowEffect?: boolean; // For special badges
}

// Reward Notification
export interface RewardNotification {
  id: string;
  type: RewardType;
  title: string;
  description: string;
  iconName: string;
  rarity?: BadgeRarity;
  pointsEarned: number;
  timestamp: Date;
  isRead: boolean;
  celebrationLevel: 'minimal' | 'standard' | 'epic' | 'legendary';
}

// User Progress and Stats
export interface UserRewards {
  userId: string;
  currentTier: UserTier;
  totalPoints: number;
  unlockedAchievements: Achievement[];
  unlockedBadges: Badge[];
  recentNotifications: RewardNotification[];
  dailyStreak: {
    current: number;
    longest: number;
    lastLoginDate: Date;
  };
  weeklyStats: {
    postsCreated: number;
    likesReceived: number;
    commentsGiven: number;
    messagesExchanged: number;
    appOpens: number;
    timeSpentMinutes: number;
  };
  lifetimeStats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalFriends: number;
    totalMessages: number;
    gamesRecorded: number;
    coursesPlayed: number;
    photosUploaded: number;
    profileVisits: number;
    achievementsUnlocked: number;
    joinDate: Date;
  };
  specialTitles: string[];
  selectedTitle?: string;
  selectedAvatarFrame?: string;
}

// Leaderboard and Competition
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  currentTier: UserTier;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  rank: number;
  achievementCount: number;
  isCurrentUser?: boolean;
}

// Predefined Tiers
export const USER_TIERS: UserTier[] = [
  {
    id: 'rookie',
    name: 'Rookie',
    level: 1,
    pointsRequired: 0,
    color: '#9CA3AF',
    iconName: 'account-circle',
    benefits: [],
    isUnlocked: true
  },
  {
    id: 'amateur',
    name: 'Amateur',
    level: 2,
    pointsRequired: 100,
    color: '#10B981',
    iconName: 'golf-tee',
    benefits: [
      {
        type: 'profile_customization',
        description: 'Custom bio backgrounds',
        iconName: 'palette'
      }
    ],
    isUnlocked: false
  },
  {
    id: 'player',
    name: 'Player',
    level: 3,
    pointsRequired: 300,
    color: '#3B82F6',
    iconName: 'golf',
    benefits: [
      {
        type: 'exclusive_badges',
        description: 'Access to rare badge collection',
        iconName: 'star-circle'
      },
      {
        type: 'custom_avatar_frames',
        description: 'Unique profile frames',
        iconName: 'account-box'
      }
    ],
    isUnlocked: false
  },
  {
    id: 'competitor',
    name: 'Competitor',
    level: 4,
    pointsRequired: 600,
    color: '#8B5CF6',
    iconName: 'trophy',
    benefits: [
      {
        type: 'priority_support',
        description: 'Priority customer support',
        iconName: 'headset'
      },
      {
        type: 'beta_features',
        description: 'Early access to new features',
        iconName: 'flask'
      }
    ],
    isUnlocked: false
  },
  {
    id: 'professional',
    name: 'Professional',
    level: 5,
    pointsRequired: 1000,
    color: '#F59E0B',
    iconName: 'crown',
    benefits: [
      {
        type: 'profile_customization',
        description: 'Professional profile themes',
        iconName: 'brush'
      },
      {
        type: 'exclusive_badges',
        description: 'Legendary badge access',
        iconName: 'diamond-stone'
      }
    ],
    isUnlocked: false
  },
  {
    id: 'elite',
    name: 'Elite',
    level: 6,
    pointsRequired: 1500,
    color: '#EF4444',
    iconName: 'fire',
    benefits: [
      {
        type: 'beta_features',
        description: 'Exclusive elite features',
        iconName: 'rocket'
      },
      {
        type: 'priority_support',
        description: 'VIP support access',
        iconName: 'diamond'
      }
    ],
    isUnlocked: false
  },
  {
    id: 'legend',
    name: 'Legend',
    level: 7,
    pointsRequired: 2500,
    color: '#DC2626',
    iconName: 'crown-circle',
    benefits: [
      {
        type: 'special_privilege',
        description: 'Hall of Fame recognition',
        iconName: 'trophy-variant'
      },
      {
        type: 'exclusive_badges',
        description: 'Legendary status badges',
        iconName: 'star-shooting'
      }
    ],
    isUnlocked: false
  }
];

// Achievement Templates
export const ACHIEVEMENT_TEMPLATES: Omit<Achievement, 'isUnlocked' | 'unlockedAt' | 'progressCurrent'>[] = [
  // Social Achievements
  {
    id: 'first_post',
    title: 'First Steps',
    description: 'Create your first post',
    category: 'social',
    rarity: 'common',
    iconName: 'pencil',
    pointsReward: 10,
    unlockConditions: [{ type: 'posts_created', target: 1, current: 0 }],
    progressTotal: 1,
    isHidden: false
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Make 25 friends',
    category: 'social',
    rarity: 'rare',
    iconName: 'account-group',
    pointsReward: 50,
    unlockConditions: [{ type: 'friends_added', target: 25, current: 0 }],
    progressTotal: 25,
    isHidden: false
  },
  {
    id: 'hundred_likes',
    title: 'Crowd Pleaser',
    description: 'Receive 100 likes on your posts',
    category: 'social',
    rarity: 'epic',
    iconName: 'heart',
    pointsReward: 75,
    unlockConditions: [{ type: 'likes_received', target: 100, current: 0 }],
    progressTotal: 100,
    isHidden: false
  },

  // Golf Achievements  
  {
    id: 'first_score',
    title: 'On the Scorecard',
    description: 'Record your first golf score',
    category: 'golf',
    rarity: 'common',
    iconName: 'golf',
    pointsReward: 15,
    unlockConditions: [{ type: 'games_played', target: 1, current: 0 }],
    progressTotal: 1,
    isHidden: false
  },
  {
    id: 'under_par',
    title: 'Under Par',
    description: 'Score under par on any hole',
    category: 'golf',
    rarity: 'rare',
    iconName: 'flag',
    pointsReward: 30,
    unlockConditions: [{ type: 'score_under_par', target: 1, current: 0 }],
    progressTotal: 1,
    isHidden: false
  },
  {
    id: 'course_explorer',
    title: 'Course Explorer',
    description: 'Play at 10 different courses',
    category: 'golf',
    rarity: 'epic',
    iconName: 'map-marker-multiple',
    pointsReward: 100,
    unlockConditions: [{ type: 'courses_played', target: 10, current: 0 }],
    progressTotal: 10,
    isHidden: false
  },

  // Engagement Achievements
  {
    id: 'daily_visitor',
    title: 'Daily Visitor',
    description: 'Open the app 7 days in a row',
    category: 'streak',
    rarity: 'rare',
    iconName: 'calendar-check',
    pointsReward: 40,
    unlockConditions: [{ type: 'login_streak', target: 7, current: 0 }],
    progressTotal: 7,
    isHidden: false
  },
  {
    id: 'dedicated_member',
    title: 'Dedicated Member',
    description: 'Maintain a 30-day login streak',
    category: 'streak',
    rarity: 'legendary',
    iconName: 'fire',
    pointsReward: 200,
    unlockConditions: [{ type: 'login_streak', target: 30, current: 0 }],
    progressTotal: 30,
    isHidden: false
  },
  {
    id: 'commentator',
    title: 'Commentator',
    description: 'Leave 50 thoughtful comments',
    category: 'engagement',
    rarity: 'rare',
    iconName: 'comment-text',
    pointsReward: 60,
    unlockConditions: [{ type: 'comments_made', target: 50, current: 0 }],
    progressTotal: 50,
    isHidden: false
  },
  {
    id: 'photographer',
    title: 'Photographer',
    description: 'Upload 25 photos to your profile',
    category: 'engagement',
    rarity: 'epic',
    iconName: 'camera',
    pointsReward: 80,
    unlockConditions: [{ type: 'photos_uploaded', target: 25, current: 0 }],
    progressTotal: 25,
    isHidden: false
  },

  // Special/Hidden Achievements
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Post something between midnight and 6 AM',
    category: 'special',
    rarity: 'rare',
    iconName: 'owl',
    pointsReward: 25,
    unlockConditions: [{ type: 'night_owl', target: 1, current: 0 }],
    progressTotal: 1,
    isHidden: true
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Post something between 5 AM and 7 AM',
    category: 'special',
    rarity: 'rare',
    iconName: 'weather-sunny',
    pointsReward: 25,
    unlockConditions: [{ type: 'early_bird', target: 1, current: 0 }],
    progressTotal: 1,
    isHidden: true
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Be active every weekend for a month',
    category: 'special',
    rarity: 'epic',
    iconName: 'sword',
    pointsReward: 120,
    unlockConditions: [{ type: 'weekend_activity', target: 4, current: 0 }],
    progressTotal: 4,
    isHidden: true
  },

  // Milestone Achievements
  {
    id: 'veteran',
    title: 'Veteran',
    description: 'Be a member for 1 year',
    category: 'milestone',
    rarity: 'legendary',
    iconName: 'star',
    pointsReward: 300,
    unlockConditions: [{ type: 'time_spent', target: 365, current: 0 }],
    progressTotal: 365,
    isHidden: false
  }
];
