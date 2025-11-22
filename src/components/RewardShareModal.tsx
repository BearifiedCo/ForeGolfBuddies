import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Share,
  Linking,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Achievement, UserTier, RewardNotification } from '../types/rewards';
import { useSocialStore } from '../state/socialStore';
import { useAuthStore } from '../state/authStore';
import { Post } from '../types/golf';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RewardShareModalProps {
  visible: boolean;
  onClose: () => void;
  achievement?: Achievement;
  tier?: UserTier;
  notification?: RewardNotification;
}

const RewardShareModal: React.FC<RewardShareModalProps> = ({
  visible,
  onClose,
  achievement,
  tier,
  notification,
}) => {
  const { addPost } = useSocialStore();
  const { user } = useAuthStore();
  const [isSharing, setIsSharing] = useState(false);

  if (!achievement && !tier) return null;

  const isAchievement = !!achievement;
  const rewardData = achievement || tier;

  const getRarityColors = () => {
    if (achievement) {
      switch (achievement.rarity) {
        case 'legendary': return ['#DC2626', '#EF4444'];
        case 'epic': return ['#8B5CF6', '#A78BFA'];
        case 'rare': return ['#3B82F6', '#60A5FA'];
        default: return ['#F59E0B', '#FBBF24'];
      }
    }
    if (tier) {
      return [tier.color, tier.color + '80'];
    }
    return ['#F59E0B', '#FBBF24'];
  };

  const getShareContent = () => {
    if (achievement) {
      return {
        title: `🏆 Achievement Unlocked: ${achievement.title}!`,
        description: achievement.description,
        type: 'achievement' as const,
        points: achievement.pointsReward,
        rarity: achievement.rarity,
        iconName: achievement.iconName,
      };
    }
    if (tier) {
      return {
        title: `🎖️ Tier Up! Welcome to ${tier.name}!`,
        description: `I've reached ${tier.name} tier in ForeBuddies Golf!`,
        type: 'tier' as const,
        points: tier.pointsRequired,
        rarity: 'legendary' as const,
        iconName: tier.iconName,
      };
    }
    return null;
  };

  const shareContent = getShareContent();

  const handleShareToTimeline = async () => {
    if (!user || !shareContent) return;

    try {
      setIsSharing(true);

      // Create a special achievement post
      const achievementPost: Post = {
        id: `achievement_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: shareContent.description,
        type: 'achievement' as any, // We'll need to extend the Post type
        metadata: {
          achievementId: achievement?.id,
          tierId: tier?.id,
          rewardType: shareContent.type,
          iconName: shareContent.iconName,
          rarity: shareContent.rarity,
          points: shareContent.points,
        },
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addPost(achievementPost);
      
      Alert.alert(
        'Shared!',
        'Your achievement has been shared to your timeline!',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to share to timeline. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleExternalShare = async (platform: 'general' | 'twitter' | 'facebook' | 'linkedin') => {
    if (!shareContent) return;

    try {
      setIsSharing(true);

      const appUrl = 'https://forebuddies.app'; // Your app's URL
      const shareUrl = `${appUrl}/achievement/${achievement?.id || tier?.id}`;
      
      let shareText = '';
      let url = '';

      switch (platform) {
        case 'twitter':
          shareText = `${shareContent.title} ${shareContent.description} 🏌️‍♂️ #ForeBuddies #Golf`;
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
          break;
          
        case 'facebook':
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareContent.title)}`;
          break;
          
        case 'linkedin':
          shareText = `${shareContent.title} ${shareContent.description}`;
          url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
          break;
          
        default:
          // Use React Native's Share API for general sharing
          await Share.share({
            message: `${shareContent.title}\n\n${shareContent.description}\n\nCheck out ForeBuddies Golf: ${shareUrl}`,
            url: shareUrl,
            title: shareContent.title,
          });
          onClose();
          return;
      }

      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          // Fallback to general share
          await Share.share({
            message: `${shareContent.title}\n\n${shareContent.description}\n\nCheck out ForeBuddies Golf: ${shareUrl}`,
            url: shareUrl,
            title: shareContent.title,
          });
        }
      }

      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const colors = getRarityColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={colors}
            style={styles.header}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.rewardDisplay}>
              <MaterialCommunityIcons
                name={shareContent?.iconName as any}
                size={64}
                color="#FFFFFF"
              />
              <Text style={styles.rewardTitle}>{shareContent?.title}</Text>
              <Text style={styles.rewardDescription}>{shareContent?.description}</Text>
              
              {shareContent?.points && (
                <View style={styles.pointsBadge}>
                  <MaterialCommunityIcons name="star" size={16} color="#FCD34D" />
                  <Text style={styles.pointsText}>+{shareContent.points} points</Text>
                </View>
              )}
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.shareTitle}>Share Your Achievement</Text>
            <Text style={styles.shareSubtitle}>
              Let your golf buddies know about your awesome progress!
            </Text>

            {/* Timeline Share */}
            <TouchableOpacity
              style={styles.shareOption}
              onPress={handleShareToTimeline}
              disabled={isSharing}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.shareButton}
              >
                <MaterialCommunityIcons name="home" size={24} color="#FFFFFF" />
                <View style={styles.shareButtonText}>
                  <Text style={styles.shareButtonTitle}>Share to Timeline</Text>
                  <Text style={styles.shareButtonSubtitle}>Post to your ForeBuddies feed</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* External Sharing Options */}
            <Text style={styles.externalTitle}>Share Externally</Text>

            <View style={styles.externalGrid}>
              <TouchableOpacity
                style={styles.externalButton}
                onPress={() => handleExternalShare('twitter')}
                disabled={isSharing}
              >
                <LinearGradient
                  colors={['#1DA1F2', '#0A7BC6']}
                  style={styles.externalButtonGradient}
                >
                  <MaterialCommunityIcons name="twitter" size={28} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.externalButtonText}>Twitter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.externalButton}
                onPress={() => handleExternalShare('facebook')}
                disabled={isSharing}
              >
                <LinearGradient
                  colors={['#1877F2', '#0C63D4']}
                  style={styles.externalButtonGradient}
                >
                  <MaterialCommunityIcons name="facebook" size={28} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.externalButtonText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.externalButton}
                onPress={() => handleExternalShare('linkedin')}
                disabled={isSharing}
              >
                <LinearGradient
                  colors={['#0A66C2', '#004182']}
                  style={styles.externalButtonGradient}
                >
                  <MaterialCommunityIcons name="linkedin" size={28} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.externalButtonText}>LinkedIn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.externalButton}
                onPress={() => handleExternalShare('general')}
                disabled={isSharing}
              >
                <LinearGradient
                  colors={['#6B7280', '#4B5563']}
                  style={styles.externalButtonGradient}
                >
                  <MaterialCommunityIcons name="share-variant" size={28} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.externalButtonText}>More</Text>
              </TouchableOpacity>
            </View>

            {/* Link Sharing */}
            <TouchableOpacity
              style={styles.linkShare}
              onPress={() => handleExternalShare('general')}
              disabled={isSharing}
            >
              <MaterialCommunityIcons name="link" size={20} color="#6B7280" />
              <Text style={styles.linkShareText}>Copy Achievement Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    padding: 8,
    zIndex: 1,
  },
  rewardDisplay: {
    alignItems: 'center',
  },
  rewardTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rewardDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  pointsText: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  shareTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  shareSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  shareOption: {
    marginBottom: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  shareButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  shareButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButtonSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
  },
  externalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  externalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  externalButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  externalButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  externalButtonText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  linkShare: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  linkShareText: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default RewardShareModal;
