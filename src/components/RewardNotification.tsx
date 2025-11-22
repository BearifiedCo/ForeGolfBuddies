import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { RewardNotification as RewardNotificationType, Achievement, UserTier } from '../types/rewards';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RewardNotificationProps {
  notification: RewardNotificationType | null;
  onDismiss: () => void;
  onShare?: (achievement?: Achievement, tier?: UserTier) => void;
  visible: boolean;
  achievement?: Achievement;
  tier?: UserTier;
}

const RewardNotification: React.FC<RewardNotificationProps> = ({
  notification,
  onDismiss,
  onShare,
  visible,
  achievement,
  tier,
}) => {
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const sparkleAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible && notification) {
      // Haptic feedback
      Vibration.vibrate([0, 100, 50, 100]);

      if (notification.celebrationLevel === 'legendary') {
        // Epic legendary animation
        Animated.sequence([
          Animated.parallel([
            Animated.spring(scaleAnimation, {
              toValue: 1.2,
              tension: 50,
              friction: 3,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnimation, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        // Continuous sparkle animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnimation, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();

        // Glow effect
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnimation, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnimation, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: false,
            }),
          ])
        ).start();
      } else if (notification.celebrationLevel === 'epic') {
        // Epic animation
        Animated.parallel([
          Animated.spring(scaleAnimation, {
            toValue: 1.1,
            tension: 80,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();

        Animated.timing(sparkleAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } else {
        // Standard animation
        Animated.parallel([
          Animated.spring(scaleAnimation, {
            toValue: 1,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnimation, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // Auto dismiss after delay based on celebration level
      const dismissDelay = notification.celebrationLevel === 'legendary' ? 4000 : 
                          notification.celebrationLevel === 'epic' ? 3000 : 2500;
      
      const timer = setTimeout(() => {
        handleDismiss();
      }, dismissDelay);

      return () => clearTimeout(timer);
    }
  }, [visible, notification]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(scaleAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      scaleAnimation.setValue(0);
      slideAnimation.setValue(SCREEN_HEIGHT);
      sparkleAnimation.setValue(0);
      glowAnimation.setValue(0);
      onDismiss();
    });
  };

  if (!notification) return null;

  const getRarityColors = () => {
    switch (notification.rarity) {
      case 'legendary': return ['#DC2626', '#EF4444', '#FCA5A5'];
      case 'epic': return ['#8B5CF6', '#A78BFA', '#C4B5FD'];
      case 'rare': return ['#3B82F6', '#60A5FA', '#93C5FD'];
      default: return ['#F59E0B', '#FBBF24', '#FDE68A'];
    }
  };

  const getIconSize = () => {
    switch (notification.celebrationLevel) {
      case 'legendary': return 80;
      case 'epic': return 64;
      default: return 48;
    }
  };

  const colors = getRarityColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { scale: scaleAnimation },
                { translateY: slideAnimation },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.touchableArea}
            activeOpacity={0.9}
            onPress={handleDismiss}
          >
            <LinearGradient
              colors={colors}
              style={[
                styles.notificationCard,
                notification.celebrationLevel === 'legendary' && styles.legendaryCard,
              ]}
            >
              {/* Glow effect for legendary */}
              {notification.celebrationLevel === 'legendary' && (
                <Animated.View
                  style={[
                    styles.glowEffect,
                    {
                      shadowOpacity: glowAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.8],
                      }),
                    },
                  ]}
                />
              )}

              {/* Sparkle effects */}
              {(notification.celebrationLevel === 'legendary' || notification.celebrationLevel === 'epic') && (
                <>
                  {[...Array(8)].map((_, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.sparkle,
                        {
                          top: `${20 + (index * 10)}%`,
                          left: `${10 + (index * 11)}%`,
                          opacity: sparkleAnimation.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, 1, 0],
                          }),
                          transform: [
                            {
                              rotate: sparkleAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="star-four-points"
                        size={12}
                        color="#FFFFFF"
                      />
                    </Animated.View>
                  ))}
                </>
              )}

              {/* Content */}
              <View style={styles.content}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={notification.iconName as any}
                    size={getIconSize()}
                    color="#FFFFFF"
                  />
                  
                  {notification.type === 'badge' && (
                    <View style={styles.checkmarkContainer}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color="#10B981"
                      />
                    </View>
                  )}
                </View>

                <Text style={[
                  styles.title,
                  notification.celebrationLevel === 'legendary' && styles.legendaryTitle,
                ]}>
                  {notification.title}
                </Text>

                <Text style={styles.description}>
                  {notification.description}
                </Text>

                {notification.pointsEarned > 0 && (
                  <View style={styles.pointsContainer}>
                    <MaterialCommunityIcons name="star" size={16} color="#FCD34D" />
                    <Text style={styles.pointsText}>
                      +{notification.pointsEarned} points
                    </Text>
                  </View>
                )}

                {notification.rarity && (
                  <View style={[styles.rarityBadge, { backgroundColor: colors[0] }]}>
                    <Text style={styles.rarityText}>
                      {notification.rarity.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action buttons */}
              <View style={styles.actionButtons}>
                {onShare && (achievement || tier) && (
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => onShare(achievement, tier)}
                  >
                    <MaterialCommunityIcons name="share-variant" size={16} color="#FFFFFF" />
                    <Text style={styles.shareButtonText}>Share</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={handleDismiss}
                >
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>

              {/* Dismiss hint */}
              <View style={styles.dismissHint}>
                <Text style={styles.dismissHintText}>
                  {onShare && (achievement || tier) ? 'Share your achievement or tap to dismiss' : 'Tap to dismiss'}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Legendary confetti effect */}
        {notification.celebrationLevel === 'legendary' && (
          <View style={styles.confettiContainer}>
            {[...Array(20)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.confetti,
                  {
                    left: `${Math.random() * 100}%`,
                    backgroundColor: colors[index % colors.length],
                    opacity: sparkleAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.7, 0],
                    }),
                    transform: [
                      {
                        translateY: sparkleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, SCREEN_HEIGHT + 50],
                        }),
                      },
                      {
                        rotate: sparkleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '720deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchableArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationCard: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 350,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  legendaryCard: {
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: '#FCD34D',
    borderRadius: 30,
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 5,
  },
  sparkle: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#065F46',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  legendaryTitle: {
    fontSize: 24,
    textShadowRadius: 4,
  },
  description: {
    color: '#F3F4F6',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 12,
  },
  pointsText: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  dismissButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dismissButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dismissHint: {
    marginTop: 8,
  },
  dismissHintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default RewardNotification;
