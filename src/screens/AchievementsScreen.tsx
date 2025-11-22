import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRewardsStore } from '../state/rewardsStore';
import { useAuthStore } from '../state/authStore';
import { Achievement, Badge, UserTier, ACHIEVEMENT_TEMPLATES, USER_TIERS } from '../types/rewards';
import RewardShareModal from '../components/RewardShareModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACHIEVEMENT_CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

interface AchievementsScreenProps {
  navigation: any;
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { 
    userRewards, 
    initializeUserRewards, 
    isLoading,
    updateDailyStreak,
    updateLifetimeStats
  } = useRewardsStore();

  const [selectedTab, setSelectedTab] = useState<'achievements' | 'tiers' | 'stats'>('achievements');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [progressAnimation] = useState(new Animated.Value(0));
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareAchievement, setShareAchievement] = useState<Achievement | null>(null);
  const [shareTier, setShareTier] = useState<UserTier | null>(null);

  useEffect(() => {
    if (user && !userRewards) {
      initializeUserRewards(user.id);
      updateDailyStreak();
    }
  }, [user, userRewards]);

  useEffect(() => {
    // Animate progress bars
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [userRewards]);

  if (!userRewards) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <MaterialCommunityIcons name="trophy" size={64} color="#F59E0B" />
        <Text style={styles.loadingText}>Loading your achievements...</Text>
      </SafeAreaView>
    );
  }

  const categories = [
    { id: 'all', name: 'All', icon: 'view-grid' },
    { id: 'social', name: 'Social', icon: 'account-group' },
    { id: 'golf', name: 'Golf', icon: 'golf' },
    { id: 'engagement', name: 'Engagement', icon: 'heart' },
    { id: 'streak', name: 'Streaks', icon: 'fire' },
    { id: 'milestone', name: 'Milestones', icon: 'star' },
    { id: 'special', name: 'Special', icon: 'diamond-stone' },
  ];

  const getFilteredAchievements = () => {
    let achievements = ACHIEVEMENT_TEMPLATES.map(template => {
      const unlocked = userRewards.unlockedAchievements.find(a => a.id === template.id);
      
      // Calculate progress
      let progressCurrent = 0;
      if (unlocked) {
        progressCurrent = template.progressTotal;
      } else {
        // Calculate progress based on current stats
        const condition = template.unlockConditions[0];
        if (condition) {
          switch (condition.type) {
            case 'posts_created':
              progressCurrent = Math.min(userRewards.lifetimeStats.totalPosts, template.progressTotal);
              break;
            case 'likes_received':
              progressCurrent = Math.min(userRewards.lifetimeStats.totalLikes, template.progressTotal);
              break;
            case 'comments_made':
              progressCurrent = Math.min(userRewards.lifetimeStats.totalComments, template.progressTotal);
              break;
            case 'friends_added':
              progressCurrent = Math.min(userRewards.lifetimeStats.totalFriends, template.progressTotal);
              break;
            case 'login_streak':
              progressCurrent = Math.min(userRewards.dailyStreak.current, template.progressTotal);
              break;
            case 'games_played':
              progressCurrent = Math.min(userRewards.lifetimeStats.gamesRecorded, template.progressTotal);
              break;
            case 'courses_played':
              progressCurrent = Math.min(userRewards.lifetimeStats.coursesPlayed, template.progressTotal);
              break;
            case 'photos_uploaded':
              progressCurrent = Math.min(userRewards.lifetimeStats.photosUploaded, template.progressTotal);
              break;
            default:
              progressCurrent = 0;
          }
        }
      }

      return {
        ...template,
        isUnlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt,
        progressCurrent
      };
    });

    if (selectedCategory !== 'all') {
      achievements = achievements.filter(a => a.category === selectedCategory);
    }

    // Sort: unlocked first, then by rarity, then by progress
    return achievements.sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1;
      }
      
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      
      return (b.progressCurrent / b.progressTotal) - (a.progressCurrent / a.progressTotal);
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return ['#DC2626', '#EF4444'];
      case 'epic': return ['#8B5CF6', '#A78BFA'];
      case 'rare': return ['#3B82F6', '#60A5FA'];
      case 'common': return ['#6B7280', '#9CA3AF'];
      default: return ['#6B7280', '#9CA3AF'];
    }
  };

  const handleShareAchievement = (achievement: Achievement) => {
    setShareAchievement(achievement);
    setShowShareModal(true);
  };

  const handleShareTier = (tier: UserTier) => {
    setShareTier(tier);
    setShowShareModal(true);
  };

  const renderAchievementCard = ({ item: achievement }: { item: Achievement }) => {
    const progressPercent = (achievement.progressCurrent / achievement.progressTotal) * 100;
    const rarityColors = getRarityColor(achievement.rarity);

    return (
      <TouchableOpacity 
        style={styles.achievementCard}
        onPress={() => {
          if (achievement.isUnlocked) {
            handleShareAchievement(achievement);
          }
        }}
      >
        <LinearGradient
          colors={achievement.isUnlocked ? rarityColors : ['#1F2937', '#374151']}
          style={styles.achievementGradient}
        >
          <View style={styles.achievementHeader}>
            <MaterialCommunityIcons 
              name={achievement.iconName as any} 
              size={32} 
              color={achievement.isUnlocked ? '#FFFFFF' : '#9CA3AF'} 
            />
            {achievement.isUnlocked && (
              <MaterialCommunityIcons 
                name="check-circle" 
                size={20} 
                color="#10B981" 
                style={styles.unlockedIcon}
              />
            )}
          </View>
          
          <Text style={[
            styles.achievementTitle,
            { color: achievement.isUnlocked ? '#FFFFFF' : '#9CA3AF' }
          ]}>
            {achievement.title}
          </Text>
          
          <Text style={[
            styles.achievementDescription,
            { color: achievement.isUnlocked ? '#E5E7EB' : '#6B7280' }
          ]}>
            {achievement.description}
          </Text>

          {!achievement.isUnlocked && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${progressPercent}%`],
                      })
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {achievement.progressCurrent}/{achievement.progressTotal}
              </Text>
            </View>
          )}

          <View style={styles.achievementFooter}>
            <View style={[styles.rarityBadge, { backgroundColor: rarityColors[0] }]}>
              <Text style={styles.rarityText}>
                {achievement.rarity.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.pointsText}>
              {achievement.pointsReward} pts
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderTierCard = (tier: UserTier, index: number) => {
    const isCurrentTier = userRewards.currentTier.level === tier.level;
    const isUnlocked = userRewards.totalPoints >= tier.pointsRequired;
    const isNextTier = userRewards.currentTier.level + 1 === tier.level;
    
    return (
      <TouchableOpacity 
        key={tier.id} 
        style={styles.tierCard}
        onPress={() => {
          if (isUnlocked) {
            handleShareTier(tier);
          }
        }}
      >
        <LinearGradient
          colors={isCurrentTier ? [tier.color, tier.color + '80'] : 
                  isUnlocked ? [tier.color + '40', tier.color + '20'] : 
                  ['#1F2937', '#374151']}
          style={styles.tierGradient}
        >
          <View style={styles.tierHeader}>
            <MaterialCommunityIcons 
              name={tier.iconName as any} 
              size={40} 
              color={isUnlocked ? tier.color : '#6B7280'} 
            />
            {isCurrentTier && (
              <View style={styles.currentTierBadge}>
                <Text style={styles.currentTierText}>CURRENT</Text>
              </View>
            )}
          </View>
          
          <Text style={[
            styles.tierName,
            { color: isUnlocked ? '#FFFFFF' : '#9CA3AF' }
          ]}>
            {tier.name}
          </Text>
          
          <Text style={[
            styles.tierPoints,
            { color: isUnlocked ? '#E5E7EB' : '#6B7280' }
          ]}>
            {tier.pointsRequired} points required
          </Text>

          {isNextTier && !isUnlocked && (
            <View style={styles.tierProgressContainer}>
              <View style={styles.progressBar}>
                <Animated.View 
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', `${(userRewards.totalPoints / tier.pointsRequired) * 100}%`],
                      })
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {userRewards.totalPoints}/{tier.pointsRequired}
              </Text>
            </View>
          )}

          {tier.benefits.length > 0 && (
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Benefits:</Text>
              {tier.benefits.slice(0, 2).map((benefit, idx) => (
                <Text key={idx} style={styles.benefitText}>
                  • {benefit.description}
                </Text>
              ))}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Your Progress</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="trophy" size={32} color="#F59E0B" />
          <Text style={styles.statValue}>{userRewards.totalPoints}</Text>
          <Text style={styles.statLabel}>Total Points</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="medal" size={32} color="#10B981" />
          <Text style={styles.statValue}>{userRewards.unlockedAchievements.length}</Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="fire" size={32} color="#EF4444" />
          <Text style={styles.statValue}>{userRewards.dailyStreak.current}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="star" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>{userRewards.currentTier.name}</Text>
          <Text style={styles.statLabel}>Current Tier</Text>
        </View>
      </View>

      <View style={styles.lifetimeStatsContainer}>
        <Text style={styles.lifetimeStatsTitle}>Lifetime Stats</Text>
        
        <View style={styles.lifetimeStatsGrid}>
          <View style={styles.lifetimeStatItem}>
            <Text style={styles.lifetimeStatValue}>{userRewards.lifetimeStats.totalPosts}</Text>
            <Text style={styles.lifetimeStatLabel}>Posts Created</Text>
          </View>
          
          <View style={styles.lifetimeStatItem}>
            <Text style={styles.lifetimeStatValue}>{userRewards.lifetimeStats.totalLikes}</Text>
            <Text style={styles.lifetimeStatLabel}>Likes Received</Text>
          </View>
          
          <View style={styles.lifetimeStatItem}>
            <Text style={styles.lifetimeStatValue}>{userRewards.lifetimeStats.totalFriends}</Text>
            <Text style={styles.lifetimeStatLabel}>Friends Made</Text>
          </View>
          
          <View style={styles.lifetimeStatItem}>
            <Text style={styles.lifetimeStatValue}>{userRewards.lifetimeStats.gamesRecorded}</Text>
            <Text style={styles.lifetimeStatLabel}>Games Recorded</Text>
          </View>
          
          <View style={styles.lifetimeStatItem}>
            <Text style={styles.lifetimeStatValue}>{userRewards.lifetimeStats.coursesPlayed}</Text>
            <Text style={styles.lifetimeStatLabel}>Courses Played</Text>
          </View>
          
          <View style={styles.lifetimeStatItem}>
            <Text style={styles.lifetimeStatValue}>{userRewards.dailyStreak.longest}</Text>
            <Text style={styles.lifetimeStatLabel}>Longest Streak</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="bell" size={24} color="#FFFFFF" />
          {userRewards.recentNotifications.filter(n => !n.isRead).length > 0 && (
            <View style={styles.notificationBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { id: 'achievements', label: 'Achievements', icon: 'trophy' },
          { id: 'tiers', label: 'Tiers', icon: 'crown' },
          { id: 'stats', label: 'Stats', icon: 'chart-line' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id as any)}
          >
            <MaterialCommunityIcons 
              name={tab.icon as any} 
              size={20} 
              color={selectedTab === tab.id ? '#F59E0B' : '#9CA3AF'} 
            />
            <Text style={[
              styles.tabText, 
              selectedTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'achievements' && (
          <>
            {/* Category Filter */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
            >
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.activeCategoryButton
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialCommunityIcons 
                    name={category.icon as any} 
                    size={16} 
                    color={selectedCategory === category.id ? '#FFFFFF' : '#9CA3AF'} 
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.activeCategoryButtonText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Achievements Grid */}
            <FlatList
              data={getFilteredAchievements()}
              renderItem={renderAchievementCard}
              numColumns={2}
              columnWrapperStyle={styles.achievementRow}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        {selectedTab === 'tiers' && (
          <View style={styles.tiersContainer}>
            {USER_TIERS.map((tier, index) => renderTierCard(tier, index))}
          </View>
        )}

        {selectedTab === 'stats' && renderStatsCard()}
      </ScrollView>

      {/* Share Modal */}
      <RewardShareModal
        visible={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setShareAchievement(null);
          setShareTier(null);
        }}
        achievement={shareAchievement || undefined}
        tier={shareTier || undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1F2937',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#374151',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#F59E0B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryContainer: {
    marginVertical: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
    marginRight: 12,
  },
  activeCategoryButton: {
    backgroundColor: '#F59E0B',
  },
  categoryButtonText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  activeCategoryButtonText: {
    color: '#FFFFFF',
  },
  achievementRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  achievementCard: {
    width: ACHIEVEMENT_CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: 16,
    minHeight: 200,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unlockedIcon: {
    backgroundColor: '#065F46',
    borderRadius: 10,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  achievementDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressText: {
    color: '#9CA3AF',
    fontSize: 10,
    textAlign: 'right',
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pointsText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tiersContainer: {
    paddingVertical: 16,
  },
  tierCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tierGradient: {
    padding: 20,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentTierBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentTierText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tierName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tierPoints: {
    fontSize: 14,
    marginBottom: 16,
  },
  tierProgressContainer: {
    marginBottom: 16,
  },
  benefitsContainer: {
    marginTop: 16,
  },
  benefitsTitle: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benefitText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  statsContainer: {
    paddingVertical: 16,
  },
  statsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: (SCREEN_WIDTH - 60) / 2,
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  lifetimeStatsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
  },
  lifetimeStatsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  lifetimeStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lifetimeStatItem: {
    width: (SCREEN_WIDTH - 100) / 3,
    alignItems: 'center',
    marginBottom: 16,
  },
  lifetimeStatValue: {
    color: '#F59E0B',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lifetimeStatLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    textAlign: 'center',
  },
});

export default AchievementsScreen;
