import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Post } from '../types/golf';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AchievementPostProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  isLiked: boolean;
}

const AchievementPost: React.FC<AchievementPostProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  isLiked,
}) => {
  if (post.type !== 'achievement' || !post.metadata) {
    return null;
  }

  const getRarityColors = () => {
    switch (post.metadata.rarity) {
      case 'legendary': return ['#DC2626', '#EF4444', '#FCA5A5'];
      case 'epic': return ['#8B5CF6', '#A78BFA', '#C4B5FD'];
      case 'rare': return ['#3B82F6', '#60A5FA', '#93C5FD'];
      default: return ['#F59E0B', '#FBBF24', '#FDE68A'];
    }
  };

  const getRewardTypeText = () => {
    return post.metadata.rewardType === 'tier' ? 'Tier Unlock' : 'Achievement Unlocked';
  };

  const colors = getRarityColors();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {post.userAvatar ? (
              <MaterialCommunityIcons name="account" size={24} color="#10B981" />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={24} color="#10B981" />
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.userName}</Text>
            <Text style={styles.timestamp}>
              {post.createdAt.toLocaleDateString()} • {getRewardTypeText()}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MaterialCommunityIcons name="dots-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Achievement Content */}
      <LinearGradient
        colors={colors}
        style={styles.achievementContent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.achievementHeader}>
          <MaterialCommunityIcons name="trophy" size={20} color="#FFFFFF" />
          <Text style={styles.achievementLabel}>{getRewardTypeText()}</Text>
        </View>

        <View style={styles.achievementMain}>
          <MaterialCommunityIcons
            name={post.metadata.iconName as any || 'star'}
            size={48}
            color="#FFFFFF"
          />
          <View style={styles.achievementText}>
            <Text style={styles.achievementTitle}>
              {post.metadata.rewardType === 'tier' 
                ? `Welcome to ${post.content.split(' ')[4]}!` 
                : post.content.split(':')[1]?.trim() || post.content
              }
            </Text>
            <Text style={styles.achievementDescription}>
              {post.metadata.rewardType === 'tier'
                ? `Reached a new tier with amazing progress!`
                : 'Achievement completed with dedication!'
              }
            </Text>
          </View>
        </View>

        {post.metadata.points && (
          <View style={styles.pointsBadge}>
            <MaterialCommunityIcons name="star" size={16} color="#FCD34D" />
            <Text style={styles.pointsText}>+{post.metadata.points} points</Text>
          </View>
        )}

        {post.metadata.rarity && (
          <View style={[styles.rarityBadge, { backgroundColor: colors[0] }]}>
            <Text style={styles.rarityText}>
              {post.metadata.rarity.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Sparkle effects for epic/legendary */}
        {(post.metadata.rarity === 'epic' || post.metadata.rarity === 'legendary') && (
          <View style={styles.sparkleContainer}>
            {[...Array(6)].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.sparkle,
                  {
                    top: `${20 + (index * 12)}%`,
                    left: `${10 + (index * 15)}%`,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={8}
                  color="rgba(255, 255, 255, 0.6)"
                />
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      {/* Caption */}
      {post.content && (
        <View style={styles.caption}>
          <Text style={styles.captionText}>{post.content}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, isLiked && styles.likedButton]}
          onPress={onLike}
        >
          <MaterialCommunityIcons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? "#EF4444" : "#6B7280"}
          />
          <Text style={[
            styles.actionText,
            isLiked && styles.likedText
          ]}>
            {post.likes} {post.likes === 1 ? 'Like' : 'Likes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <MaterialCommunityIcons name="comment-outline" size={24} color="#6B7280" />
          <Text style={styles.actionText}>
            {post.comments?.length || 0} Comments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <MaterialCommunityIcons name="share-outline" size={24} color="#6B7280" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="flag-outline" size={24} color="#F59E0B" />
          <Text style={[styles.actionText, { color: '#F59E0B' }]}>Celebrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreButton: {
    padding: 4,
  },
  achievementContent: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementText: {
    flex: 1,
    marginLeft: 16,
  },
  achievementTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  achievementDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 18,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  pointsText: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
  },
  caption: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  captionText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  likedButton: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
  },
});

export default AchievementPost;
