import { useRewardsStore } from '../state/rewardsStore';
import { useAuthStore } from '../state/authStore';
import { Achievement, RewardNotification } from '../types/rewards';

// Service to automatically check and trigger rewards based on user actions
class RewardsService {
  private static instance: RewardsService;
  private rewardsStore: any;
  private authStore: any;
  private notificationQueue: RewardNotification[] = [];
  private isProcessingNotifications = false;

  private constructor() {
    // Initialize stores
    this.rewardsStore = useRewardsStore.getState();
    this.authStore = useAuthStore.getState();

    // Subscribe to store changes
    useRewardsStore.subscribe((state) => {
      this.rewardsStore = state;
    });
    
    useAuthStore.subscribe((state) => {
      this.authStore = state;
    });
  }

  public static getInstance(): RewardsService {
    if (!RewardsService.instance) {
      RewardsService.instance = new RewardsService();
    }
    return RewardsService.instance;
  }

  // Initialize user rewards when they log in
  public initializeUser(userId: string) {
    this.rewardsStore.initializeUserRewards(userId);
    this.trackAppOpen();
    this.updateDailyLoginStreak();
  }

  // Track app opens for engagement rewards
  public trackAppOpen() {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateWeeklyStats('appOpens', 1);
    this.checkAndTriggerRewards('app_open');
  }

  // Track daily login streaks
  public updateDailyLoginStreak() {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateDailyStreak();
    this.checkAndTriggerRewards('daily_login');
  }

  // Track when user creates a post
  public trackPostCreated(postData?: any) {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateLifetimeStats('totalPosts', 1);
    this.rewardsStore.updateWeeklyStats('postsCreated', 1);

    // Check for time-based achievements
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      this.rewardsStore.incrementProgress('night_owl');
    } else if (hour >= 5 && hour < 7) {
      this.rewardsStore.incrementProgress('early_bird');
    }

    // Check for weekend activity
    const day = new Date().getDay();
    if (day === 0 || day === 6) {
      this.rewardsStore.incrementProgress('weekend_activity');
    }

    this.checkAndTriggerRewards('post_created', postData);
  }

  // Track when user receives likes
  public trackLikeReceived() {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateLifetimeStats('totalLikes', 1);
    this.rewardsStore.updateWeeklyStats('likesReceived', 1);
    this.checkAndTriggerRewards('like_received');
  }

  // Track when user makes comments
  public trackCommentMade() {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateLifetimeStats('totalComments', 1);
    this.rewardsStore.updateWeeklyStats('commentsGiven', 1);
    this.checkAndTriggerRewards('comment_made');
  }

  // Track when user adds friends
  public trackFriendAdded() {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateLifetimeStats('totalFriends', 1);
    this.checkAndTriggerRewards('friend_added');
  }

  // Track when user sends messages
  public trackMessageSent() {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateLifetimeStats('totalMessages', 1);
    this.rewardsStore.updateWeeklyStats('messagesExchanged', 1);
    this.checkAndTriggerRewards('message_sent');
  }

  // Track when user records golf game
  public trackGameRecorded(scoreData?: any) {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateLifetimeStats('gamesRecorded', 1);

    // Check for under par achievement
    if (scoreData && scoreData.score < scoreData.par) {
      this.rewardsStore.incrementProgress('score_under_par');
    }

    this.checkAndTriggerRewards('game_recorded', scoreData);
  }

  // Track when user plays at a new course
  public trackCourseVisited(courseId: string) {
    if (!this.rewardsStore.userRewards) return;

    // This would typically check if it's a new course
    // For now, we'll increment the counter
    this.rewardsStore.updateLifetimeStats('coursesPlayed', 1);
    this.checkAndTriggerRewards('course_visited', { courseId });
  }

  // Track when user uploads photos
  public trackPhotoUploaded() {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateLifetimeStats('photosUploaded', 1);
    this.checkAndTriggerRewards('photo_uploaded');
  }

  // Track profile visits
  public trackProfileVisit() {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateLifetimeStats('profileVisits', 1);
    this.checkAndTriggerRewards('profile_visit');
  }

  // Track time spent in app (call this periodically)
  public trackTimeSpent(minutes: number) {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateWeeklyStats('timeSpentMinutes', minutes);
  }

  // Check and trigger rewards after any action
  private checkAndTriggerRewards(actionType: string, metadata?: any) {
    const unlockedAchievements = this.rewardsStore.checkAndUnlockAchievements(actionType, metadata);
    
    if (unlockedAchievements.length > 0) {
      // Add notifications to queue
      unlockedAchievements.forEach(achievement => {
        const notification: RewardNotification = {
          id: `achievement_${achievement.id}_${Date.now()}`,
          type: 'badge',
          title: `Achievement Unlocked!`,
          description: `${achievement.title} - ${achievement.description}`,
          iconName: achievement.iconName,
          rarity: achievement.rarity,
          pointsEarned: achievement.pointsReward,
          timestamp: new Date(),
          isRead: false,
          celebrationLevel: this.getCelebrationLevel(achievement.rarity)
        };
        this.notificationQueue.push(notification);
      });

      this.processNotificationQueue();
    }
  }

  private getCelebrationLevel(rarity: string): 'minimal' | 'standard' | 'epic' | 'legendary' {
    switch (rarity) {
      case 'legendary': return 'legendary';
      case 'epic': return 'epic';
      case 'rare': return 'standard';
      default: return 'minimal';
    }
  }

  // Process notification queue (show one at a time)
  private async processNotificationQueue() {
    if (this.isProcessingNotifications || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingNotifications = true;

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (notification) {
        // This would trigger the notification component
        // The actual implementation would depend on your notification system
        await this.showNotification(notification);
        
        // Wait between notifications
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.isProcessingNotifications = false;
  }

  private async showNotification(notification: RewardNotification): Promise<void> {
    return new Promise(resolve => {
      // This would be implemented in your main app component
      // to show the RewardNotification component
      console.log('🏆 Achievement Unlocked:', notification.title);
      
      // For now, just resolve after the notification duration
      const duration = notification.celebrationLevel === 'legendary' ? 4000 : 
                      notification.celebrationLevel === 'epic' ? 3000 : 2500;
      setTimeout(resolve, duration);
    });
  }

  // Manual achievement unlock (for testing or special events)
  public unlockAchievement(achievementId: string) {
    this.rewardsStore.unlockAchievement(achievementId);
  }

  // Get current user rewards summary
  public getUserRewardsSummary() {
    const rewards = this.rewardsStore.userRewards;
    if (!rewards) return null;

    return {
      currentTier: rewards.currentTier,
      totalPoints: rewards.totalPoints,
      achievementsUnlocked: rewards.unlockedAchievements.length,
      currentStreak: rewards.dailyStreak.current,
      longestStreak: rewards.dailyStreak.longest,
      unreadNotifications: rewards.recentNotifications.filter(n => !n.isRead).length
    };
  }

  // Get achievements progress for specific category
  public getCategoryProgress(category: string) {
    const rewards = this.rewardsStore.userRewards;
    if (!rewards) return null;

    // This would calculate progress for achievements in a specific category
    // Implementation would depend on your specific needs
    return {
      category,
      totalAchievements: 0,
      unlockedAchievements: 0,
      progress: 0
    };
  }

  // Reset weekly stats (call this weekly)
  public resetWeeklyStats() {
    if (!this.rewardsStore.userRewards) return;

    this.rewardsStore.updateUserProgress({
      weeklyStats: {
        postsCreated: 0,
        likesReceived: 0,
        commentsGiven: 0,
        messagesExchanged: 0,
        appOpens: 0,
        timeSpentMinutes: 0
      }
    });
  }

  // Check for tier progression
  public checkTierProgression() {
    const newTier = this.rewardsStore.checkTierProgression();
    if (newTier) {
      // Tier up notification would be handled automatically by the store
      console.log('🎖️ Tier Up!', newTier.name);
    }
    return newTier;
  }
}

// Export singleton instance
export const rewardsService = RewardsService.getInstance();

// Export individual tracking functions for easy import
export const trackAppOpen = () => rewardsService.trackAppOpen();
export const trackPostCreated = (data?: any) => rewardsService.trackPostCreated(data);
export const trackLikeReceived = () => rewardsService.trackLikeReceived();
export const trackCommentMade = () => rewardsService.trackCommentMade();
export const trackFriendAdded = () => rewardsService.trackFriendAdded();
export const trackMessageSent = () => rewardsService.trackMessageSent();
export const trackGameRecorded = (data?: any) => rewardsService.trackGameRecorded(data);
export const trackCourseVisited = (courseId: string) => rewardsService.trackCourseVisited(courseId);
export const trackPhotoUploaded = () => rewardsService.trackPhotoUploaded();
export const trackProfileVisit = () => rewardsService.trackProfileVisit();
export const trackTimeSpent = (minutes: number) => rewardsService.trackTimeSpent(minutes);

export default rewardsService;
