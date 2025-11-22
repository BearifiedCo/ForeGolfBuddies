import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useScorecardStore } from '../state/scorecardStore';
import { useAuthStore } from '../state/authStore';
import { PlayerScorecard, HoleScore } from '../types/scorecard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScorecardScreenProps {
  navigation: any;
}

const ScorecardScreen: React.FC<ScorecardScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const {
    currentRound,
    selectedHole,
    selectedPlayer,
    preferences,
    updatePlayerScore,
    updatePlayerPutts,
    updateFairwayHit,
    updateGreenInRegulation,
    addPenalty,
    removePenalty,
    goToNextHole,
    goToPreviousHole,
    goToHole,
    selectPlayer,
    completeRound,
    saveCurrentRound,
  } = useScorecardStore();

  const [activeTab, setActiveTab] = useState<'scorecard' | 'stats'>('scorecard');
  const [showHoleSelector, setShowHoleSelector] = useState(false);

  useEffect(() => {
    if (currentRound && !selectedPlayer && currentRound.players.length > 0) {
      selectPlayer(currentRound.players[0].playerId);
    }
  }, [currentRound, selectedPlayer]);

  if (!currentRound) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="golf" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Active Round</Text>
          <Text style={styles.emptyDescription}>
            Start a new round to begin scoring
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('StartRound')}
          >
            <Text style={styles.startButtonText}>Start New Round</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentHole = currentRound.players[0]?.holes.find(h => h.holeNumber === selectedHole);
  const selectedPlayerData = currentRound.players.find(p => p.playerId === selectedPlayer);

  const handleScoreUpdate = (playerId: string, score: number) => {
    updatePlayerScore(playerId, score, selectedHole);
    if (preferences.autoAdvanceHoles && selectedHole < 18) {
      setTimeout(() => goToNextHole(), 500);
    }
  };

  const handleCompleteRound = () => {
    Alert.alert(
      'Complete Round',
      'Are you sure you want to complete this round? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await completeRound();
            navigation.navigate('RoundSummary');
          }
        }
      ]
    );
  };

  const getScoreColor = (score: number, par: number) => {
    const diff = score - par;
    if (diff <= -2) return '#DC2626'; // Eagle or better
    if (diff === -1) return '#059669'; // Birdie
    if (diff === 0) return '#3B82F6'; // Par
    if (diff === 1) return '#F59E0B'; // Bogey
    return '#EF4444'; // Double bogey or worse
  };

  const renderHoleHeader = () => (
    <View style={styles.holeHeader}>
      <View style={styles.holeInfo}>
        <TouchableOpacity
          style={styles.holeSelector}
          onPress={() => setShowHoleSelector(true)}
        >
          <Text style={styles.holeNumber}>Hole {selectedHole}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        
        {currentHole && (
          <View style={styles.holeDetails}>
            <View style={styles.holeDetail}>
              <Text style={styles.holeDetailLabel}>Par</Text>
              <Text style={styles.holeDetailValue}>{currentHole.par}</Text>
            </View>
            <View style={styles.holeDetail}>
              <Text style={styles.holeDetailLabel}>Yardage</Text>
              <Text style={styles.holeDetailValue}>420</Text>
            </View>
            <View style={styles.holeDetail}>
              <Text style={styles.holeDetailLabel}>Handicap</Text>
              <Text style={styles.holeDetailValue}>5</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.holeNavigation}>
        <TouchableOpacity
          style={[styles.navButton, selectedHole === 1 && styles.navButtonDisabled]}
          onPress={goToPreviousHole}
          disabled={selectedHole === 1}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, selectedHole === 18 && styles.navButtonDisabled]}
          onPress={goToNextHole}
          disabled={selectedHole === 18}
        >
          <MaterialCommunityIcons name="chevron-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlayerSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.playerSelector}
    >
      {currentRound.players.map((player, index) => (
        <TouchableOpacity
          key={player.playerId}
          style={[
            styles.playerTab,
            selectedPlayer === player.playerId && styles.activePlayerTab
          ]}
          onPress={() => selectPlayer(player.playerId)}
        >
          <Text style={[
            styles.playerName,
            selectedPlayer === player.playerId && styles.activePlayerName
          ]}>
            {player.playerName}
          </Text>
          <Text style={[
            styles.playerScore,
            selectedPlayer === player.playerId && styles.activePlayerScore
          ]}>
            {player.roundStats.totalScore || 'E'}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderScoreInput = () => {
    if (!selectedPlayerData || !currentHole) return null;

    const playerHole = selectedPlayerData.holes.find(h => h.holeNumber === selectedHole);
    if (!playerHole) return null;

    return (
      <View style={styles.scoreInputContainer}>
        <Text style={styles.scoreInputTitle}>Score for {selectedPlayerData.playerName}</Text>
        
        {/* Score Buttons */}
        <View style={styles.scoreButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(score => (
            <TouchableOpacity
              key={score}
              style={[
                styles.scoreButton,
                playerHole.score === score && styles.selectedScoreButton,
                { backgroundColor: getScoreColor(score, currentHole.par) }
              ]}
              onPress={() => handleScoreUpdate(selectedPlayerData.playerId, score)}
            >
              <Text style={styles.scoreButtonText}>{score}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Detailed Stats */}
        {preferences.trackPutts && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Putts</Text>
            <View style={styles.statButtons}>
              {[1, 2, 3, 4].map(putts => (
                <TouchableOpacity
                  key={putts}
                  style={[
                    styles.statButton,
                    playerHole.putts === putts && styles.selectedStatButton
                  ]}
                  onPress={() => updatePlayerPutts(selectedPlayerData.playerId, putts, selectedHole)}
                >
                  <Text style={styles.statButtonText}>{putts}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {preferences.trackFairways && currentHole.par !== 3 && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Fairway</Text>
            <View style={styles.booleanButtons}>
              <TouchableOpacity
                style={[
                  styles.booleanButton,
                  playerHole.fairwayHit === true && styles.selectedBooleanButton
                ]}
                onPress={() => updateFairwayHit(selectedPlayerData.playerId, true, selectedHole)}
              >
                <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                <Text style={styles.booleanButtonText}>Hit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.booleanButton,
                  playerHole.fairwayHit === false && styles.selectedBooleanButton
                ]}
                onPress={() => updateFairwayHit(selectedPlayerData.playerId, false, selectedHole)}
              >
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
                <Text style={styles.booleanButtonText}>Miss</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {preferences.trackGreens && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Green in Regulation</Text>
            <View style={styles.booleanButtons}>
              <TouchableOpacity
                style={[
                  styles.booleanButton,
                  playerHole.greenInRegulation === true && styles.selectedBooleanButton
                ]}
                onPress={() => updateGreenInRegulation(selectedPlayerData.playerId, true, selectedHole)}
              >
                <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                <Text style={styles.booleanButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.booleanButton,
                  playerHole.greenInRegulation === false && styles.selectedBooleanButton
                ]}
                onPress={() => updateGreenInRegulation(selectedPlayerData.playerId, false, selectedHole)}
              >
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
                <Text style={styles.booleanButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {preferences.trackPenalties && (
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Penalties</Text>
            <View style={styles.penaltyButtons}>
              <TouchableOpacity
                style={styles.penaltyButton}
                onPress={() => removePenalty(selectedPlayerData.playerId, selectedHole)}
              >
                <MaterialCommunityIcons name="minus" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.penaltyCount}>{playerHole.penalties || 0}</Text>
              <TouchableOpacity
                style={styles.penaltyButton}
                onPress={() => addPenalty(selectedPlayerData.playerId, selectedHole)}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderQuickStats = () => {
    if (!selectedPlayerData) return null;

    return (
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{selectedPlayerData.roundStats.totalScore || 'E'}</Text>
          <Text style={styles.statCardLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{selectedPlayerData.roundStats.totalPutts}</Text>
          <Text style={styles.statCardLabel}>Putts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>
            {selectedPlayerData.roundStats.fairwaysHit}/{selectedPlayerData.roundStats.fairwaysAttempted}
          </Text>
          <Text style={styles.statCardLabel}>Fairways</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{selectedPlayerData.roundStats.greensInRegulation}</Text>
          <Text style={styles.statCardLabel}>GIR</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{currentRound.courseName}</Text>
            <Text style={styles.headerSubtitle}>
              {currentRound.date.toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ScorecardSettings')}>
            <MaterialCommunityIcons name="cog" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {renderHoleHeader()}
      </LinearGradient>

      {/* Player Selector */}
      {renderPlayerSelector()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'scorecard' && styles.activeTab]}
            onPress={() => setActiveTab('scorecard')}
          >
            <Text style={[styles.tabText, activeTab === 'scorecard' && styles.activeTabText]}>
              Scorecard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              Statistics
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'scorecard' ? (
          <>
            {renderScoreInput()}
            {renderQuickStats()}
          </>
        ) : (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Round Statistics</Text>
            {/* Detailed stats would go here */}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveCurrentRound}
        >
          <MaterialCommunityIcons name="content-save" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteRound}
        >
          <MaterialCommunityIcons name="flag-checkered" size={20} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Complete Round</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  holeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  holeInfo: {
    flex: 1,
  },
  holeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  holeNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  holeDetails: {
    flexDirection: 'row',
  },
  holeDetail: {
    marginRight: 20,
  },
  holeDetailLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  holeDetailValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  holeNavigation: {
    flexDirection: 'row',
  },
  navButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  playerSelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  playerTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  activePlayerTab: {
    backgroundColor: '#10B981',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activePlayerName: {
    color: '#FFFFFF',
  },
  playerScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 2,
  },
  activePlayerScore: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#10B981',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scoreInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  scoreInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  scoreButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  selectedScoreButton: {
    borderWidth: 3,
    borderColor: '#1F2937',
  },
  scoreButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statRow: {
    marginBottom: 20,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  selectedStatButton: {
    backgroundColor: '#10B981',
  },
  statButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  booleanButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  booleanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  selectedBooleanButton: {
    backgroundColor: '#10B981',
  },
  booleanButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  penaltyButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  penaltyButton: {
    backgroundColor: '#6B7280',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  penaltyCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B7280',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScorecardScreen;
