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
import { useRewardsStore } from '../state/rewardsStore';
import { ACHIEVEMENT_TEMPLATES } from '../types/rewards';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RewardsSummaryProps {
  onPress?: () => void;
  compact?: boolean;
}

const RewardsSummary: React.FC<RewardsSummaryProps> = ({ onPress, compact = false }) => {
  const { userRewards } = useRewardsStore();

  if (!userRewards) return null;

  const unreadNotifications = userRewards.recentNotifications.filter(n => !n.isRead).length;
  const totalAchievements = ACHIEVEMENT_TEMPLATES.length;
  const unlockedAchievements = userRewards.unlockedAchievements.length;
  const completionPercentage = Math.round((unlockedAchievements / totalAchievements) * 100);

  // Calculate next tier progress
  const nextTierIndex = userRewards.currentTier.level;
  const nextTierPoints = nextTierIndex < 7 ? 
    [0, 100, 300, 600, 1000, 1500, 2500][nextTierIndex] : 
    userRewards.currentTier.pointsRequired;
  const previousTierPoints = nextTierIndex > 1 ? 
    [0, 100, 300, 600, 1000, 1500, 2500][nextTierIndex - 1] : 0;
  
  const tierProgress = nextTierIndex < 7 ? 
    ((userRewards.totalPoints - previousTierPoints) / (nextTierPoints - previousTierPoints)) * 100 : 
    100;

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPress}>
        <LinearGradient
          colors={['#1F2937', '#374151']}
          style={styles.compactGradient}
        >
          <View style={styles.compactHeader}>
            <View style={styles.compactTitleContainer}>
              <MaterialCommunityIcons name="trophy" size={20} color="#F59E0B" />
              <Text style={styles.compactTitle}>Rewards</Text>
              {unreadNotifications > 0 && (
                <View style={styles.compactBadge}>
                  <Text style={styles.compactBadgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
          </View>
          
          <View style={styles.compactStats}>
            <View style={styles.compactStat}>
              <Text style={styles.compactStatValue}>{userRewards.totalPoints}</Text>
              <Text style={styles.compactStatLabel}>Points</Text>
            </View>
            <View style={styles.compactStat}>
              <Text style={styles.compactStatValue}>{unlockedAchievements}</Text>
              <Text style={styles.compactStatLabel}>Achievements</Text>
            </View>
            <View style={styles.compactStat}>
              <Text style={styles.compactStatValue}>{userRewards.dailyStreak.current}</Text>
              <Text style={styles.compactStatLabel}>Streak</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons 
              name={userRewards.currentTier.iconName as any} 
              size={32} 
              color={userRewards.currentTier.color} 
            />
            <View style={styles.headerText}>
              <Text style={styles.tierName}>{userRewards.currentTier.name}</Text>
              <Text style={styles.pointsText}>{userRewards.totalPoints} points</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
          </View>
        </View>

        {/* Tier Progress */}
        {nextTierIndex < 7 && (
          <View style={styles.tierProgressContainer}>
            <View style={styles.tierProgressHeader}>
              <Text style={styles.tierProgressLabel}>
                Progress to {['', 'Amateur', 'Player', 'Competitor', 'Professional', 'Elite', 'Legend'][nextTierIndex]}
              </Text>
              <Text style={styles.tierProgressPercentage}>
                {Math.round(tierProgress)}%
              </Text>
            </View>
            <View style={styles.tierProgressBar}>
              <View 
                style={[
                  styles.tierProgressFill, 
                  { 
                    width: `${tierProgress}%`,
                    backgroundColor: userRewards.currentTier.color 
                  }
                ]} 
              />
            </View>
            <Text style={styles.tierProgressPoints}>
              {userRewards.totalPoints} / {nextTierPoints} points
            </Text>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <MaterialCommunityIcons name="medal" size={24} color="#10B981" />
            <Text style={styles.quickStatValue}>{unlockedAchievements}/{totalAchievements}</Text>
            <Text style={styles.quickStatLabel}>Achievements</Text>
            <Text style={styles.completionPercentage}>{completionPercentage}% Complete</Text>
          </View>

          <View style={styles.quickStat}>
            <MaterialCommunityIcons name="fire" size={24} color="#EF4444" />
            <Text style={styles.quickStatValue}>{userRewards.dailyStreak.current}</Text>
            <Text style={styles.quickStatLabel}>Current Streak</Text>
            <Text style={styles.completionPercentage}>
              Longest: {userRewards.dailyStreak.longest}
            </Text>
          </View>

          <View style={styles.quickStat}>
            <MaterialCommunityIcons name="star-shooting" size={24} color="#8B5CF6" />
            <Text style={styles.quickStatValue}>
              {userRewards.specialTitles.length}
            </Text>
            <Text style={styles.quickStatLabel}>Titles Earned</Text>
            {userRewards.selectedTitle && (
              <Text style={styles.completionPercentage}>
                "{userRewards.selectedTitle}"
              </Text>
            )}
          </View>
        </View>

        {/* Recent Achievement Preview */}
        {userRewards.unlockedAchievements.length > 0 && (
          <View style={styles.recentAchievementContainer}>
            <Text style={styles.recentAchievementTitle}>Latest Achievement</Text>
            {(() => {
              const latestAchievement = userRewards.unlockedAchievements
                .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))[0];
              
              return (
                <View style={styles.recentAchievement}>
                  <MaterialCommunityIcons 
                    name={latestAchievement.iconName as any} 
                    size={20} 
                    color="#F59E0B" 
                  />
                  <Text style={styles.recentAchievementName}>
                    {latestAchievement.title}
                  </Text>
                  <View style={[
                    styles.rarityDot, 
                    { backgroundColor: getRarityColor(latestAchievement.rarity) }
                  ]} />
                </View>
              );
            })()}
          </View>
        )}

        {/* Call to Action */}
        <View style={styles.callToAction}>
          <Text style={styles.callToActionText}>
            View all achievements and unlock rewards
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return '#DC2626';
    case 'epic': return '#8B5CF6';
    case 'rare': return '#3B82F6';
    default: return '#6B7280';
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  tierName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pointsText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tierProgressContainer: {
    marginBottom: 16,
  },
  tierProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierProgressLabel: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  tierProgressPercentage: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tierProgressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  tierProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  tierProgressPoints: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  quickStatLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  completionPercentage: {
    color: '#6B7280',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  recentAchievementContainer: {
    marginBottom: 12,
  },
  recentAchievementTitle: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  recentAchievement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  recentAchievementName: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  callToAction: {
    alignItems: 'center',
  },
  callToActionText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  // Compact styles
  compactContainer: {
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  compactGradient: {
    padding: 12,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  compactBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  compactBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactStat: {
    alignItems: 'center',
  },
  compactStatValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  compactStatLabel: {
    color: '#9CA3AF',
    fontSize: 10,
  },
});

export default RewardsSummary;
