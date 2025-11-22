import { Linking, Share } from 'react-native';
import { Achievement, UserTier } from '../types/rewards';
import { Post } from '../types/golf';
import { useSocialStore } from '../state/socialStore';
import { useAuthStore } from '../state/authStore';

export interface ShareOptions {
  achievement?: Achievement;
  tier?: UserTier;
  includeTimeline?: boolean;
  platform?: 'twitter' | 'facebook' | 'linkedin' | 'general';
}

class SharingService {
  private static instance: SharingService;

  private constructor() {}

  public static getInstance(): SharingService {
    if (!SharingService.instance) {
      SharingService.instance = new SharingService();
    }
    return SharingService.instance;
  }

  // Generate share content for achievements/tiers
  private generateShareContent(options: ShareOptions) {
    const { achievement, tier } = options;
    
    if (achievement) {
      return {
        title: `🏆 Achievement Unlocked: ${achievement.title}!`,
        description: achievement.description,
        hashtags: ['ForeBuddies', 'Golf', 'Achievement', `${achievement.rarity}Achievement`],
        points: achievement.pointsReward,
        type: 'achievement' as const,
        iconName: achievement.iconName,
        rarity: achievement.rarity,
      };
    }
    
    if (tier) {
      return {
        title: `🎖️ Tier Up! Welcome to ${tier.name}!`,
        description: `I've reached ${tier.name} tier in ForeBuddies Golf! ${tier.pointsRequired} points earned!`,
        hashtags: ['ForeBuddies', 'Golf', 'TierUp', `${tier.name}Tier`],
        points: tier.pointsRequired,
        type: 'tier' as const,
        iconName: tier.iconName,
        rarity: 'legendary' as const,
      };
    }
    
    return null;
  }

  // Create timeline post for achievement/tier
  public async shareToTimeline(options: ShareOptions): Promise<boolean> {
    const content = this.generateShareContent(options);
    if (!content) return false;

    try {
      const { addPost } = useSocialStore.getState();
      const { user } = useAuthStore.getState();
      
      if (!user) return false;

      const achievementPost: Post = {
        id: `${content.type}_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: content.description,
        type: 'achievement',
        metadata: {
          achievementId: options.achievement?.id,
          tierId: options.tier?.id,
          rewardType: content.type,
          iconName: content.iconName,
          rarity: content.rarity,
          points: content.points,
        },
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addPost(achievementPost);
      return true;
    } catch (error) {
      console.error('Failed to share to timeline:', error);
      return false;
    }
  }

  // Generate deep link for achievement/tier
  private generateDeepLink(options: ShareOptions): string {
    const baseUrl = 'https://forebuddies.app'; // Your app's URL
    const { achievement, tier } = options;
    
    if (achievement) {
      return `${baseUrl}/achievement/${achievement.id}`;
    }
    
    if (tier) {
      return `${baseUrl}/tier/${tier.id}`;
    }
    
    return baseUrl;
  }

  // Share to external platforms
  public async shareExternal(options: ShareOptions): Promise<boolean> {
    const content = this.generateShareContent(options);
    if (!content) return false;

    const deepLink = this.generateDeepLink(options);
    const platform = options.platform || 'general';

    try {
      let shareUrl = '';
      let shareText = '';

      switch (platform) {
        case 'twitter':
          shareText = `${content.title} ${content.description} 🏌️‍♂️ ${content.hashtags.map(tag => `#${tag}`).join(' ')}`;
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(deepLink)}`;
          break;
          
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(deepLink)}&quote=${encodeURIComponent(content.title)}`;
          break;
          
        case 'linkedin':
          shareText = `${content.title} ${content.description}`;
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(deepLink)}&summary=${encodeURIComponent(shareText)}`;
          break;
          
        default:
          // Use React Native's Share API for general sharing
          await Share.share({
            message: `${content.title}\n\n${content.description}\n\nCheck out my progress on ForeBuddies Golf: ${deepLink}`,
            url: deepLink,
            title: content.title,
          });
          return true;
      }

      if (shareUrl) {
        const supported = await Linking.canOpenURL(shareUrl);
        if (supported) {
          await Linking.openURL(shareUrl);
        } else {
          // Fallback to general share
          await Share.share({
            message: `${content.title}\n\n${content.description}\n\nCheck out my progress on ForeBuddies Golf: ${deepLink}`,
            url: deepLink,
            title: content.title,
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to share externally:', error);
      return false;
    }
  }

  // Copy share link to clipboard
  public async copyShareLink(options: ShareOptions): Promise<string> {
    const deepLink = this.generateDeepLink(options);
    const content = this.generateShareContent(options);
    
    if (!content) return '';

    try {
      const { Clipboard } = await import('expo-clipboard');
      const shareMessage = `${content.title}\n\nCheck out my progress on ForeBuddies Golf: ${deepLink}`;
      
      await Clipboard.setStringAsync(shareMessage);
      return shareMessage;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return deepLink;
    }
  }

  // Complete sharing with both timeline and external
  public async shareReward(options: ShareOptions & { includeTimeline?: boolean }): Promise<boolean> {
    let success = true;

    // Share to timeline if requested
    if (options.includeTimeline) {
      const timelineSuccess = await this.shareToTimeline(options);
      if (!timelineSuccess) success = false;
    }

    // Share externally
    const externalSuccess = await this.shareExternal(options);
    if (!externalSuccess) success = false;

    return success;
  }

  // Generate share preview text (for UI display)
  public getSharePreview(options: ShareOptions): { title: string; description: string; hashtags: string[] } | null {
    const content = this.generateShareContent(options);
    if (!content) return null;

    return {
      title: content.title,
      description: content.description,
      hashtags: content.hashtags,
    };
  }

  // Check if sharing is available for given platform
  public async canShareTo(platform: string): Promise<boolean> {
    const urls = {
      twitter: 'https://twitter.com',
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com',
    };

    const url = urls[platform as keyof typeof urls];
    if (!url) return true; // General sharing is always available

    try {
      return await Linking.canOpenURL(url);
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const sharingService = SharingService.getInstance();

// Export convenience functions
export const shareAchievement = (achievement: Achievement, options?: Partial<ShareOptions>) =>
  sharingService.shareReward({ achievement, ...options });

export const shareTier = (tier: UserTier, options?: Partial<ShareOptions>) =>
  sharingService.shareReward({ tier, ...options });

export default sharingService;
