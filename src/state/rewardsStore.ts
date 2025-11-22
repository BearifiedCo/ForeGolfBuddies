import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserRewards, 
  Achievement, 
  Badge, 
  RewardNotification, 
  UserTier, 
  LeaderboardEntry,
  USER_TIERS,
  ACHIEVEMENT_TEMPLATES,
  AchievementCondition
} from '../types/rewards';

interface RewardsState {
  userRewards: UserRewards | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  
  // Initialization and user management
  initializeUserRewards: (userId: string) => void;
  updateUserProgress: (updates: Partial<UserRewards>) => void;
  
  // Achievement system
  checkAndUnlockAchievements: (actionType: string, metadata?: any) => Achievement[];
  unlockAchievement: (achievementId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // Progress tracking
  incrementProgress: (conditionType: string, amount?: number, metadata?: any) => void;
  updateDailyStreak: () => void;
  updateWeeklyStats: (statType: keyof UserRewards['weeklyStats'], amount: number) => void;
  updateLifetimeStats: (statType: keyof UserRewards['lifetimeStats'], amount: number) => void;
  
  // Tier system
  checkTierProgression: () => UserTier | null;
  updateTier: (newTier: UserTier) => void;
  
  // Customization
  selectTitle: (title: string) => void;
  selectAvatarFrame: (frameId: string) => void;
  
  // Leaderboard
  updateLeaderboard: (entries: LeaderboardEntry[]) => void;
  
  // Utility
  setLoading: (loading: boolean) => void;
  resetUserRewards: () => void;
}

// Helper function to create initial user rewards
const createInitialUserRewards = (userId: string): UserRewards => {
  const now = new Date();
  
  return {
    userId,
    currentTier: USER_TIERS[0], // Rookie tier
    totalPoints: 0,
    unlockedAchievements: [],
    unlockedBadges: [],
    recentNotifications: [],
    dailyStreak: {
      current: 0,
      longest: 0,
      lastLoginDate: now
    },
    weeklyStats: {
      postsCreated: 0,
      likesReceived: 0,
      commentsGiven: 0,
      messagesExchanged: 0,
      appOpens: 1, // Count the initial app open
      timeSpentMinutes: 0
    },
    lifetimeStats: {
      totalPosts: 0,
      totalLikes: 0,
      totalComments: 0,
      totalFriends: 0,
      totalMessages: 0,
      gamesRecorded: 0,
      coursesPlayed: 0,
      photosUploaded: 0,
      profileVisits: 0,
      achievementsUnlocked: 0,
      joinDate: now
    },
    specialTitles: ['Rookie Golfer'],
    selectedTitle: 'Rookie Golfer'
  };
};

// Helper function to check if achievement conditions are met
const checkAchievementConditions = (
  achievement: Achievement, 
  userRewards: UserRewards
): boolean => {
  return achievement.unlockConditions.every(condition => {
    switch (condition.type) {
      case 'posts_created':
        return userRewards.lifetimeStats.totalPosts >= condition.target;
      case 'likes_received':
        return userRewards.lifetimeStats.totalLikes >= condition.target;
      case 'comments_made':
        return userRewards.lifetimeStats.totalComments >= condition.target;
      case 'friends_added':
        return userRewards.lifetimeStats.totalFriends >= condition.target;
      case 'login_streak':
        return userRewards.dailyStreak.current >= condition.target;
      case 'games_played':
        return userRewards.lifetimeStats.gamesRecorded >= condition.target;
      case 'courses_played':
        return userRewards.lifetimeStats.coursesPlayed >= condition.target;
      case 'photos_uploaded':
        return userRewards.lifetimeStats.photosUploaded >= condition.target;
      case 'messages_sent':
        return userRewards.lifetimeStats.totalMessages >= condition.target;
      case 'profile_visits':
        return userRewards.lifetimeStats.profileVisits >= condition.target;
      case 'app_opens':
        return userRewards.weeklyStats.appOpens >= condition.target;
      case 'time_spent':
        // For time-based achievements (like veteran status)
        const joinDate = new Date(userRewards.lifetimeStats.joinDate);
        const daysSinceJoin = Math.floor(
          (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceJoin >= condition.target;
      case 'night_owl':
      case 'early_bird':
      case 'weekend_activity':
        // These require special tracking in metadata
        return condition.current >= condition.target;
      default:
        return false;
    }
  });
};

// Helper function to create notification for new achievement
const createAchievementNotification = (achievement: Achievement): RewardNotification => ({
  id: `achievement_${achievement.id}_${Date.now()}`,
  type: 'badge',
  title: `Achievement Unlocked: ${achievement.title}!`,
  description: achievement.description,
  iconName: achievement.iconName,
  rarity: achievement.rarity,
  pointsEarned: achievement.pointsReward,
  timestamp: new Date(),
  isRead: false,
  celebrationLevel: achievement.rarity === 'legendary' ? 'legendary' : 
                   achievement.rarity === 'epic' ? 'epic' : 'standard'
});

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      userRewards: null,
      leaderboard: [],
      isLoading: false,

      initializeUserRewards: (userId: string) => {
        const existing = get().userRewards;
        if (!existing || existing.userId !== userId) {
          const newUserRewards = createInitialUserRewards(userId);
          set({ userRewards: newUserRewards });
        }
      },

      updateUserProgress: (updates: Partial<UserRewards>) => {
        const current = get().userRewards;
        if (current) {
          set({ 
            userRewards: { 
              ...current, 
              ...updates 
            } 
          });
        }
      },

      checkAndUnlockAchievements: (actionType: string, metadata?: any): Achievement[] => {
        const state = get();
        const userRewards = state.userRewards;
        if (!userRewards) return [];

        const unlockedAchievements: Achievement[] = [];
        const newNotifications: RewardNotification[] = [...userRewards.recentNotifications];

        // Create current achievements with progress
        const currentAchievements = ACHIEVEMENT_TEMPLATES.map(template => ({
          ...template,
          isUnlocked: userRewards.unlockedAchievements.some(a => a.id === template.id),
          progressCurrent: 0, // Will be calculated based on conditions
          unlockedAt: userRewards.unlockedAchievements.find(a => a.id === template.id)?.unlockedAt
        }));

        // Update progress for all achievements
        currentAchievements.forEach(achievement => {
          if (!achievement.isUnlocked) {
            // Update progress based on current stats
            achievement.unlockConditions.forEach(condition => {
              switch (condition.type) {
                case 'posts_created':
                  condition.current = userRewards.lifetimeStats.totalPosts;
                  break;
                case 'likes_received':
                  condition.current = userRewards.lifetimeStats.totalLikes;
                  break;
                case 'comments_made':
                  condition.current = userRewards.lifetimeStats.totalComments;
                  break;
                case 'friends_added':
                  condition.current = userRewards.lifetimeStats.totalFriends;
                  break;
                case 'login_streak':
                  condition.current = userRewards.dailyStreak.current;
                  break;
                case 'games_played':
                  condition.current = userRewards.lifetimeStats.gamesRecorded;
                  break;
                case 'courses_played':
                  condition.current = userRewards.lifetimeStats.coursesPlayed;
                  break;
                case 'photos_uploaded':
                  condition.current = userRewards.lifetimeStats.photosUploaded;
                  break;
                case 'messages_sent':
                  condition.current = userRewards.lifetimeStats.totalMessages;
                  break;
              }
            });

            achievement.progressCurrent = Math.min(
              achievement.unlockConditions[0]?.current || 0,
              achievement.progressTotal
            );

            // Check if achievement should be unlocked
            if (checkAchievementConditions(achievement, userRewards)) {
              achievement.isUnlocked = true;
              achievement.unlockedAt = new Date();
              unlockedAchievements.push(achievement);

              // Create notification
              const notification = createAchievementNotification(achievement);
              newNotifications.unshift(notification);
            }
          }
        });

        // Update user rewards if achievements were unlocked
        if (unlockedAchievements.length > 0) {
          const totalNewPoints = unlockedAchievements.reduce((sum, ach) => sum + ach.pointsReward, 0);
          
          set({
            userRewards: {
              ...userRewards,
              unlockedAchievements: [
                ...userRewards.unlockedAchievements,
                ...unlockedAchievements
              ],
              totalPoints: userRewards.totalPoints + totalNewPoints,
              recentNotifications: newNotifications.slice(0, 50), // Keep only recent 50
              lifetimeStats: {
                ...userRewards.lifetimeStats,
                achievementsUnlocked: userRewards.lifetimeStats.achievementsUnlocked + unlockedAchievements.length
              }
            }
          });

          // Check for tier progression
          state.checkTierProgression();
        }

        return unlockedAchievements;
      },

      unlockAchievement: (achievementId: string) => {
        const state = get();
        const template = ACHIEVEMENT_TEMPLATES.find(t => t.id === achievementId);
        const userRewards = state.userRewards;
        
        if (template && userRewards && !userRewards.unlockedAchievements.some(a => a.id === achievementId)) {
          const achievement: Achievement = {
            ...template,
            isUnlocked: true,
            unlockedAt: new Date(),
            progressCurrent: template.progressTotal
          };

          const notification = createAchievementNotification(achievement);

          set({
            userRewards: {
              ...userRewards,
              unlockedAchievements: [...userRewards.unlockedAchievements, achievement],
              totalPoints: userRewards.totalPoints + achievement.pointsReward,
              recentNotifications: [notification, ...userRewards.recentNotifications].slice(0, 50),
              lifetimeStats: {
                ...userRewards.lifetimeStats,
                achievementsUnlocked: userRewards.lifetimeStats.achievementsUnlocked + 1
              }
            }
          });

          state.checkTierProgression();
        }
      },

      markNotificationAsRead: (notificationId: string) => {
        const userRewards = get().userRewards;
        if (userRewards) {
          set({
            userRewards: {
              ...userRewards,
              recentNotifications: userRewards.recentNotifications.map(notification =>
                notification.id === notificationId
                  ? { ...notification, isRead: true }
                  : notification
              )
            }
          });
        }
      },

      clearAllNotifications: () => {
        const userRewards = get().userRewards;
        if (userRewards) {
          set({
            userRewards: {
              ...userRewards,
              recentNotifications: userRewards.recentNotifications.map(notification => ({
                ...notification,
                isRead: true
              }))
            }
          });
        }
      },

      incrementProgress: (conditionType: string, amount = 1, metadata?: any) => {
        const state = get();
        const userRewards = state.userRewards;
        if (!userRewards) return;

        const updates: Partial<UserRewards> = {};

        // Handle special time-based achievements
        if (conditionType === 'night_owl' || conditionType === 'early_bird') {
          const hour = new Date().getHours();
          if (conditionType === 'night_owl' && (hour >= 0 && hour < 6)) {
            // Trigger night owl achievement check
            state.checkAndUnlockAchievements('night_owl');
          } else if (conditionType === 'early_bird' && (hour >= 5 && hour < 7)) {
            // Trigger early bird achievement check
            state.checkAndUnlockAchievements('early_bird');
          }
          return;
        }

        // Handle weekend activity
        if (conditionType === 'weekend_activity') {
          const day = new Date().getDay();
          if (day === 0 || day === 6) { // Sunday or Saturday
            // Track weekend activity in metadata
            state.checkAndUnlockAchievements('weekend_activity');
          }
          return;
        }

        // Update stats and trigger achievement checks
        if (updates.lifetimeStats || updates.weeklyStats) {
          set({ userRewards: { ...userRewards, ...updates } });
          state.checkAndUnlockAchievements(conditionType, metadata);
        }
      },

      updateDailyStreak: () => {
        const userRewards = get().userRewards;
        if (!userRewards) return;

        const now = new Date();
        const lastLogin = new Date(userRewards.dailyStreak.lastLoginDate);
        const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

        let newStreak = userRewards.dailyStreak.current;
        
        if (daysDiff === 1) {
          // Consecutive day
          newStreak += 1;
        } else if (daysDiff > 1) {
          // Streak broken
          newStreak = 1;
        }
        // If daysDiff === 0, same day login, don't change streak

        const updatedStreak = {
          current: newStreak,
          longest: Math.max(userRewards.dailyStreak.longest, newStreak),
          lastLoginDate: now
        };

        set({
          userRewards: {
            ...userRewards,
            dailyStreak: updatedStreak
          }
        });

        // Check for streak achievements
        get().checkAndUnlockAchievements('login_streak');
      },

      updateWeeklyStats: (statType: keyof UserRewards['weeklyStats'], amount: number) => {
        const userRewards = get().userRewards;
        if (!userRewards) return;

        set({
          userRewards: {
            ...userRewards,
            weeklyStats: {
              ...userRewards.weeklyStats,
              [statType]: userRewards.weeklyStats[statType] + amount
            }
          }
        });
      },

      updateLifetimeStats: (statType: keyof UserRewards['lifetimeStats'], amount: number) => {
        const userRewards = get().userRewards;
        if (!userRewards) return;

        set({
          userRewards: {
            ...userRewards,
            lifetimeStats: {
              ...userRewards.lifetimeStats,
              [statType]: userRewards.lifetimeStats[statType] + amount
            }
          }
        });

        // Trigger achievement check based on the stat type
        get().checkAndUnlockAchievements(statType.toString());
      },

      checkTierProgression: (): UserTier | null => {
        const userRewards = get().userRewards;
        if (!userRewards) return null;

        const currentTierLevel = userRewards.currentTier.level;
        const nextTier = USER_TIERS.find(tier => 
          tier.level === currentTierLevel + 1 && 
          userRewards.totalPoints >= tier.pointsRequired
        );

        if (nextTier) {
          get().updateTier(nextTier);
          return nextTier;
        }

        return null;
      },

      updateTier: (newTier: UserTier) => {
        const userRewards = get().userRewards;
        if (!userRewards) return;

        // Create tier unlock notification
        const notification: RewardNotification = {
          id: `tier_${newTier.id}_${Date.now()}`,
          type: 'tier_unlock',
          title: `Tier Up! Welcome to ${newTier.name}!`,
          description: `You've reached ${newTier.name} tier with ${newTier.pointsRequired} points!`,
          iconName: newTier.iconName,
          pointsEarned: 0,
          timestamp: new Date(),
          isRead: false,
          celebrationLevel: 'epic'
        };

        set({
          userRewards: {
            ...userRewards,
            currentTier: { ...newTier, isUnlocked: true },
            recentNotifications: [notification, ...userRewards.recentNotifications].slice(0, 50),
            specialTitles: [...userRewards.specialTitles, newTier.name]
          }
        });
      },

      selectTitle: (title: string) => {
        const userRewards = get().userRewards;
        if (userRewards && userRewards.specialTitles.includes(title)) {
          set({
            userRewards: {
              ...userRewards,
              selectedTitle: title
            }
          });
        }
      },

      selectAvatarFrame: (frameId: string) => {
        const userRewards = get().userRewards;
        if (userRewards) {
          set({
            userRewards: {
              ...userRewards,
              selectedAvatarFrame: frameId
            }
          });
        }
      },

      updateLeaderboard: (entries: LeaderboardEntry[]) => {
        set({ leaderboard: entries });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      resetUserRewards: () => {
        set({ userRewards: null, leaderboard: [] });
      }
    }),
    {
      name: 'rewards-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        userRewards: state.userRewards,
        leaderboard: state.leaderboard
      }),
      onRehydrateStorage: () => (state) => {
        // Convert date strings back to Date objects after rehydration
        if (state?.userRewards) {
          if (state.userRewards.lifetimeStats.joinDate) {
            state.userRewards.lifetimeStats.joinDate = new Date(state.userRewards.lifetimeStats.joinDate);
          }
          if (state.userRewards.dailyStreak.lastLoginDate) {
            state.userRewards.dailyStreak.lastLoginDate = new Date(state.userRewards.dailyStreak.lastLoginDate);
          }
          // Convert achievement unlock dates
          state.userRewards.unlockedAchievements = state.userRewards.unlockedAchievements.map(achievement => ({
            ...achievement,
            unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
          }));
          // Convert notification timestamps
          state.userRewards.recentNotifications = state.userRewards.recentNotifications.map(notification => ({
            ...notification,
            timestamp: new Date(notification.timestamp)
          }));
        }
      },
    }
  )
);
