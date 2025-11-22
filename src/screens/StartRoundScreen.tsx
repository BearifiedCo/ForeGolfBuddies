import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useScorecardStore } from '../state/scorecardStore';
import { useAuthStore } from '../state/authStore';
import { CourseData, PlayerScorecard } from '../types/scorecard';
import { courseService } from '../services/courseService';

interface StartRoundScreenProps {
  navigation: any;
}

interface PlayerSetup {
  playerId: string;
  playerName: string;
  handicap?: number;
  teeBox: string;
}

const StartRoundScreen: React.FC<StartRoundScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { availableCourses, loadCourses, startNewRound, setLoading, isLoading } = useScorecardStore();
  
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlayerSetup, setShowPlayerSetup] = useState(false);
  const [players, setPlayers] = useState<PlayerSetup[]>([
    {
      playerId: user?.id || 'user1',
      playerName: user?.name || 'You',
      handicap: user?.handicap,
      teeBox: 'white',
    }
  ]);

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = availableCourses.filter(course =>
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers([...players, {
        playerId: `player_${Date.now()}`,
        playerName: '',
        handicap: undefined,
        teeBox: 'white',
      }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, updates: Partial<PlayerSetup>) => {
    setPlayers(players.map((player, i) => 
      i === index ? { ...player, ...updates } : player
    ));
  };

  const handleStartRound = async () => {
    if (!selectedCourse) {
      Alert.alert('Error', 'Please select a course');
      return;
    }

    const invalidPlayers = players.filter(p => !p.playerName.trim());
    if (invalidPlayers.length > 0) {
      Alert.alert('Error', 'Please enter names for all players');
      return;
    }

    try {
      const playerScoreards: Omit<PlayerScorecard, 'holes' | 'roundStats'>[] = players.map(player => ({
        playerId: player.playerId,
        playerName: player.playerName.trim(),
        handicap: player.handicap,
        teeBox: player.teeBox,
      }));

      await startNewRound(selectedCourse.id, playerScoreards);
      navigation.replace('Scorecard');
    } catch (error) {
      Alert.alert('Error', 'Failed to start round. Please try again.');
      console.error('Error starting round:', error);
    }
  };

  const renderCourseCard = (course: CourseData) => (
    <TouchableOpacity
      key={course.id}
      style={[
        styles.courseCard,
        selectedCourse?.id === course.id && styles.selectedCourseCard
      ]}
      onPress={() => setSelectedCourse(course)}
    >
      {course.images.length > 0 && (
        <Image 
          source={{ uri: course.images[0] }} 
          style={styles.courseImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.courseInfo}>
        <View style={styles.courseHeader}>
          <Text style={styles.courseName}>{course.name}</Text>
          {selectedCourse?.id === course.id && (
            <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
          )}
        </View>
        
        <Text style={styles.courseLocation}>{course.city}, {course.state}</Text>
        <Text style={styles.courseDetails}>Par {course.totalPar} • {course.priceRange}</Text>
        
        <View style={styles.courseAmenities}>
          {course.amenities.slice(0, 3).map((amenity, index) => (
            <View key={index} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPlayerSetup = () => (
    <Modal
      visible={showPlayerSetup}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowPlayerSetup(false)}>
            <MaterialCommunityIcons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Setup Players</Text>
          <TouchableOpacity onPress={handleStartRound}>
            <Text style={styles.startText}>Start</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.sectionTitle}>Players ({players.length}/4)</Text>
          
          {players.map((player, index) => (
            <View key={index} style={styles.playerSetupCard}>
              <View style={styles.playerHeader}>
                <Text style={styles.playerNumber}>Player {index + 1}</Text>
                {players.length > 1 && (
                  <TouchableOpacity onPress={() => removePlayer(index)}>
                    <MaterialCommunityIcons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.playerInput}
                placeholder="Player Name"
                value={player.playerName}
                onChangeText={(text) => updatePlayer(index, { playerName: text })}
              />

              <View style={styles.playerOptions}>
                <View style={styles.handicapInput}>
                  <Text style={styles.inputLabel}>Handicap</Text>
                  <TextInput
                    style={styles.smallInput}
                    placeholder="0"
                    value={player.handicap?.toString() || ''}
                    onChangeText={(text) => updatePlayer(index, { 
                      handicap: text ? parseInt(text) : undefined 
                    })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.teeBoxSelector}>
                  <Text style={styles.inputLabel}>Tee Box</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedCourse?.teeBoxes.map(tee => (
                      <TouchableOpacity
                        key={tee.name}
                        style={[
                          styles.teeBoxButton,
                          player.teeBox === tee.name.toLowerCase() && styles.selectedTeeBox,
                          { backgroundColor: getTeeBoxColor(tee.color) }
                        ]}
                        onPress={() => updatePlayer(index, { teeBox: tee.name.toLowerCase() })}
                      >
                        <Text style={styles.teeBoxText}>{tee.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          ))}

          {players.length < 4 && (
            <TouchableOpacity style={styles.addPlayerButton} onPress={addPlayer}>
              <MaterialCommunityIcons name="plus" size={20} color="#10B981" />
              <Text style={styles.addPlayerText}>Add Player</Text>
            </TouchableOpacity>
          )}

          {selectedCourse && (
            <View style={styles.coursePreview}>
              <Text style={styles.sectionTitle}>Selected Course</Text>
              <View style={styles.selectedCourseInfo}>
                <Text style={styles.selectedCourseName}>{selectedCourse.name}</Text>
                <Text style={styles.selectedCourseDetails}>
                  {selectedCourse.city}, {selectedCourse.state} • Par {selectedCourse.totalPar}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const getTeeBoxColor = (color: string) => {
    switch (color.toLowerCase()) {
      case 'black': return '#1F2937';
      case 'blue': return '#3B82F6';
      case 'white': return '#FFFFFF';
      case 'red': return '#EF4444';
      case 'gold': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Start New Round</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Course List */}
      <ScrollView style={styles.coursesList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Select a Course</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="loading" size={32} color="#10B981" />
            <Text style={styles.loadingText}>Loading courses...</Text>
          </View>
        ) : (
          filteredCourses.map(renderCourseCard)
        )}
      </ScrollView>

      {/* Continue Button */}
      {selectedCourse && (
        <View style={styles.continueContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setShowPlayerSetup(true)}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {renderPlayerSetup()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  coursesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCourseCard: {
    borderColor: '#10B981',
  },
  courseImage: {
    width: '100%',
    height: 120,
  },
  courseInfo: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  courseLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  courseDetails: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  courseAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 12,
    color: '#6B7280',
  },
  continueContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 12,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  startText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  playerSetupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  playerInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  playerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  handicapInput: {
    flex: 1,
    marginRight: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  teeBoxSelector: {
    flex: 2,
  },
  teeBoxButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTeeBox: {
    borderColor: '#10B981',
  },
  teeBoxText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#10B981',
    borderStyle: 'dashed',
  },
  addPlayerText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  coursePreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  selectedCourseInfo: {
    marginTop: 8,
  },
  selectedCourseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  selectedCourseDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default StartRoundScreen;
