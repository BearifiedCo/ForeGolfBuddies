import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ScorecardRound, 
  PlayerScorecard, 
  HoleScore, 
  CourseData,
  RoundStatistics,
  ScorecardPreferences,
  ScoringEvent 
} from '../types/scorecard';
import { courseService } from '../services/courseService';
import { trackGameRecorded } from '../services/rewardsService';

interface ScorecardState {
  // Current round state
  currentRound: ScorecardRound | null;
  availableCourses: CourseData[];
  
  // Historical data
  completedRounds: ScorecardRound[];
  playerStatistics: Record<string, RoundStatistics>;
  
  // UI state
  isLoading: boolean;
  selectedHole: number;
  selectedPlayer: string;
  
  // User preferences
  preferences: ScorecardPreferences;
  
  // Actions - Round management
  startNewRound: (courseId: string, players: Omit<PlayerScorecard, 'holes' | 'roundStats'>[]) => Promise<void>;
  saveCurrentRound: () => Promise<void>;
  completeRound: () => Promise<void>;
  cancelRound: () => void;
  loadRound: (roundId: string) => void;
  
  // Actions - Scoring
  updateHoleScore: (playerId: string, holeNumber: number, scoreData: Partial<HoleScore>) => void;
  updatePlayerScore: (playerId: string, score: number, holeNumber: number) => void;
  updatePlayerPutts: (playerId: string, putts: number, holeNumber: number) => void;
  updateFairwayHit: (playerId: string, hit: boolean, holeNumber: number) => void;
  updateGreenInRegulation: (playerId: string, hit: boolean, holeNumber: number) => void;
  addPenalty: (playerId: string, holeNumber: number) => void;
  removePenalty: (playerId: string, holeNumber: number) => void;
  
  // Actions - Navigation
  goToNextHole: () => void;
  goToPreviousHole: () => void;
  goToHole: (holeNumber: number) => void;
  selectPlayer: (playerId: string) => void;
  
  // Actions - Statistics
  calculateRoundStatistics: (round: ScorecardRound) => Record<string, RoundStatistics>;
  getPlayerHistory: (playerId: string) => ScorecardRound[];
  
  // Actions - Courses
  loadCourses: () => Promise<void>;
  searchCourses: (query: string) => Promise<void>;
  
  // Actions - Preferences
  updatePreferences: (prefs: Partial<ScorecardPreferences>) => void;
  
  // Utility
  setLoading: (loading: boolean) => void;
  clearCurrentRound: () => void;
}

// Helper functions
const createEmptyHoleScores = (course: CourseData, teeBox: string): HoleScore[] => {
  return course.holes.map(hole => ({
    holeNumber: hole.holeNumber,
    par: hole.par,
    score: undefined,
    putts: undefined,
    fairwayHit: hole.par === 3 ? undefined : undefined, // Will be set when scoring
    greenInRegulation: undefined,
    penalties: 0,
  }));
};

const calculatePlayerStats = (holes: HoleScore[]) => {
  const completedHoles = holes.filter(h => h.score !== undefined);
  const totalScore = completedHoles.reduce((sum, h) => sum + (h.score || 0), 0);
  const totalPutts = completedHoles.reduce((sum, h) => sum + (h.putts || 0), 0);
  const fairwaysAttempted = holes.filter(h => h.par !== 3).length;
  const fairwaysHit = holes.filter(h => h.fairwayHit === true).length;
  const greensInRegulation = holes.filter(h => h.greenInRegulation === true).length;
  const totalPenalties = holes.reduce((sum, h) => sum + (h.penalties || 0), 0);
  
  const frontNine = holes.slice(0, 9).filter(h => h.score !== undefined);
  const backNine = holes.slice(9, 18).filter(h => h.score !== undefined);
  
  return {
    totalScore: completedHoles.length === 18 ? totalScore : undefined,
    totalPutts,
    fairwaysHit,
    fairwaysAttempted,
    greensInRegulation,
    totalPenalties,
    frontNineScore: frontNine.length === 9 ? frontNine.reduce((sum, h) => sum + (h.score || 0), 0) : undefined,
    backNineScore: backNine.length === 9 ? backNine.reduce((sum, h) => sum + (h.score || 0), 0) : undefined,
  };
};

const defaultPreferences: ScorecardPreferences = {
  defaultTeeBox: 'white',
  trackPutts: true,
  trackFairways: true,
  trackGreens: true,
  trackPenalties: true,
  autoAdvanceHoles: false,
  confirmScores: true,
  enableNotifications: true,
};

export const useScorecardStore = create<ScorecardState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentRound: null,
      availableCourses: [],
      completedRounds: [],
      playerStatistics: {},
      isLoading: false,
      selectedHole: 1,
      selectedPlayer: '',
      preferences: defaultPreferences,

      // Round management actions
      startNewRound: async (courseId: string, players: Omit<PlayerScorecard, 'holes' | 'roundStats'>[]) => {
        try {
          set({ isLoading: true });
          
          const course = await courseService.getCourseById(courseId);
          if (!course) {
            throw new Error('Course not found');
          }

          const playersWithScores: PlayerScorecard[] = players.map(player => ({
            ...player,
            holes: createEmptyHoleScores(course, player.teeBox),
            roundStats: {
              totalScore: undefined,
              totalPutts: 0,
              fairwaysHit: 0,
              fairwaysAttempted: course.holes.filter(h => h.par !== 3).length,
              greensInRegulation: 0,
              totalPenalties: 0,
              frontNineScore: undefined,
              backNineScore: undefined,
            },
          }));

          const newRound: ScorecardRound = {
            id: `round_${Date.now()}`,
            courseId: course.id,
            courseName: course.name,
            date: new Date(),
            startTime: new Date(),
            players: playersWithScores,
            currentHole: 1,
            isCompleted: false,
            createdBy: players[0]?.playerId || 'unknown',
          };

          set({ 
            currentRound: newRound,
            selectedHole: 1,
            selectedPlayer: playersWithScores[0]?.playerId || '',
            isLoading: false 
          });
        } catch (error) {
          console.error('Error starting new round:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      saveCurrentRound: async () => {
        const { currentRound } = get();
        if (!currentRound) return;

        try {
          // Auto-save to AsyncStorage
          await AsyncStorage.setItem(`round_${currentRound.id}`, JSON.stringify(currentRound));
          
          // Update completed rounds if the round is finished
          if (currentRound.isCompleted) {
            set(state => ({
              completedRounds: [currentRound, ...state.completedRounds.filter(r => r.id !== currentRound.id)]
            }));
          }
        } catch (error) {
          console.error('Error saving round:', error);
        }
      },

      completeRound: async () => {
        const state = get();
        const { currentRound } = state;
        
        if (!currentRound) return;

        const completedRound: ScorecardRound = {
          ...currentRound,
          endTime: new Date(),
          isCompleted: true,
          players: currentRound.players.map(player => ({
            ...player,
            roundStats: calculatePlayerStats(player.holes)
          }))
        };

        set({ 
          currentRound: completedRound,
          completedRounds: [completedRound, ...state.completedRounds]
        });

        // Track rewards for game completion
        if (completedRound.players.length > 0) {
          const userPlayer = completedRound.players[0]; // Assuming first player is the user
          if (userPlayer.roundStats.totalScore) {
            trackGameRecorded({
              score: userPlayer.roundStats.totalScore,
              par: 72, // Default, should get from course
              course: completedRound.courseName
            });
          }
        }

        await state.saveCurrentRound();
      },

      cancelRound: () => {
        set({ currentRound: null, selectedHole: 1, selectedPlayer: '' });
      },

      loadRound: (roundId: string) => {
        const { completedRounds } = get();
        const round = completedRounds.find(r => r.id === roundId);
        if (round) {
          set({ currentRound: round, selectedHole: 1, selectedPlayer: round.players[0]?.playerId || '' });
        }
      },

      // Scoring actions
      updateHoleScore: (playerId: string, holeNumber: number, scoreData: Partial<HoleScore>) => {
        const { currentRound } = get();
        if (!currentRound) return;

        const updatedRound = {
          ...currentRound,
          players: currentRound.players.map(player => {
            if (player.playerId === playerId) {
              const updatedHoles = player.holes.map(hole => {
                if (hole.holeNumber === holeNumber) {
                  return { ...hole, ...scoreData };
                }
                return hole;
              });
              
              return {
                ...player,
                holes: updatedHoles,
                roundStats: calculatePlayerStats(updatedHoles)
              };
            }
            return player;
          })
        };

        set({ currentRound: updatedRound });
        get().saveCurrentRound();
      },

      updatePlayerScore: (playerId: string, score: number, holeNumber: number) => {
        get().updateHoleScore(playerId, holeNumber, { score });
      },

      updatePlayerPutts: (playerId: string, putts: number, holeNumber: number) => {
        get().updateHoleScore(playerId, holeNumber, { putts });
      },

      updateFairwayHit: (playerId: string, hit: boolean, holeNumber: number) => {
        get().updateHoleScore(playerId, holeNumber, { fairwayHit: hit });
      },

      updateGreenInRegulation: (playerId: string, hit: boolean, holeNumber: number) => {
        get().updateHoleScore(playerId, holeNumber, { greenInRegulation: hit });
      },

      addPenalty: (playerId: string, holeNumber: number) => {
        const { currentRound } = get();
        if (!currentRound) return;

        const player = currentRound.players.find(p => p.playerId === playerId);
        const hole = player?.holes.find(h => h.holeNumber === holeNumber);
        
        if (hole) {
          get().updateHoleScore(playerId, holeNumber, { 
            penalties: (hole.penalties || 0) + 1 
          });
        }
      },

      removePenalty: (playerId: string, holeNumber: number) => {
        const { currentRound } = get();
        if (!currentRound) return;

        const player = currentRound.players.find(p => p.playerId === playerId);
        const hole = player?.holes.find(h => h.holeNumber === holeNumber);
        
        if (hole && (hole.penalties || 0) > 0) {
          get().updateHoleScore(playerId, holeNumber, { 
            penalties: Math.max(0, (hole.penalties || 0) - 1) 
          });
        }
      },

      // Navigation actions
      goToNextHole: () => {
        const { selectedHole, currentRound } = get();
        if (currentRound && selectedHole < 18) {
          set({ selectedHole: selectedHole + 1 });
        }
      },

      goToPreviousHole: () => {
        const { selectedHole } = get();
        if (selectedHole > 1) {
          set({ selectedHole: selectedHole - 1 });
        }
      },

      goToHole: (holeNumber: number) => {
        if (holeNumber >= 1 && holeNumber <= 18) {
          set({ selectedHole: holeNumber });
        }
      },

      selectPlayer: (playerId: string) => {
        set({ selectedPlayer: playerId });
      },

      // Statistics actions
      calculateRoundStatistics: (round: ScorecardRound) => {
        // This would calculate detailed statistics for each player
        const stats: Record<string, RoundStatistics> = {};
        
        round.players.forEach(player => {
          // Calculate basic stats from this round and historical data
          const completedHoles = player.holes.filter(h => h.score !== undefined);
          const totalScore = completedHoles.reduce((sum, h) => sum + (h.score || 0), 0);
          const totalPar = completedHoles.reduce((sum, h) => sum + h.par, 0);
          
          stats[player.playerId] = {
            averageScore: totalScore / Math.max(completedHoles.length, 1),
            bestScore: totalScore,
            worstScore: totalScore,
            averagePutts: player.roundStats.totalPutts / Math.max(completedHoles.length, 1),
            fairwayAccuracy: (player.roundStats.fairwaysHit / Math.max(player.roundStats.fairwaysAttempted, 1)) * 100,
            greenAccuracy: (player.roundStats.greensInRegulation / Math.max(completedHoles.length, 1)) * 100,
            mostCommonScore: 4, // Would calculate from historical data
            scoringAverage: totalScore - totalPar,
            improvementTrend: 'stable',
            roundsPlayed: 1,
            coursesPlayed: [round.courseId],
          };
        });
        
        return stats;
      },

      getPlayerHistory: (playerId: string) => {
        const { completedRounds } = get();
        return completedRounds.filter(round => 
          round.players.some(player => player.playerId === playerId)
        );
      },

      // Course actions
      loadCourses: async () => {
        try {
          set({ isLoading: true });
          const response = await courseService.searchCourses({});
          set({ availableCourses: response.courses, isLoading: false });
        } catch (error) {
          console.error('Error loading courses:', error);
          set({ isLoading: false });
        }
      },

      searchCourses: async (query: string) => {
        try {
          set({ isLoading: true });
          const response = await courseService.searchCourses({ query });
          set({ availableCourses: response.courses, isLoading: false });
        } catch (error) {
          console.error('Error searching courses:', error);
          set({ isLoading: false });
        }
      },

      // Preferences
      updatePreferences: (prefs: Partial<ScorecardPreferences>) => {
        set(state => ({
          preferences: { ...state.preferences, ...prefs }
        }));
      },

      // Utility
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearCurrentRound: () => {
        set({ currentRound: null, selectedHole: 1, selectedPlayer: '' });
      },
    }),
    {
      name: 'scorecard-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        completedRounds: state.completedRounds,
        playerStatistics: state.playerStatistics,
        preferences: state.preferences,
      }),
      onRehydrateStorage: () => (state) => {
        // Convert date strings back to Date objects after rehydration
        if (state?.completedRounds) {
          state.completedRounds = state.completedRounds.map(round => ({
            ...round,
            date: new Date(round.date),
            startTime: round.startTime ? new Date(round.startTime) : undefined,
            endTime: round.endTime ? new Date(round.endTime) : undefined,
          }));
        }
      },
    }
  )
);
