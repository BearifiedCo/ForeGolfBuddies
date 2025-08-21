import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../state/bookingStore';
import { useAuthStore } from '../state/authStore';
import { Booking } from '../types/golf';

interface CreateBookingScreenProps {
  navigation: any;
}

export default function CreateBookingScreen({ navigation }: CreateBookingScreenProps) {
  const [formData, setFormData] = useState({
    courseName: '',
    date: new Date(),
    time: '',
    maxPlayers: '4',
    description: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { addBooking } = useBookingStore();
  const { user } = useAuthStore();

  const handleCreateBooking = async () => {
    if (!formData.courseName || !formData.time) {
      Alert.alert('Error', 'Please fill in course name and time');
      return;
    }

    const maxPlayersNum = parseInt(formData.maxPlayers);
    if (isNaN(maxPlayersNum) || maxPlayersNum < 1 || maxPlayersNum > 4) {
      Alert.alert('Error', 'Max players must be between 1 and 4');
      return;
    }

    setIsLoading(true);

    const newBooking: Booking = {
      id: Date.now().toString(),
      courseId: Date.now().toString(),
      courseName: formData.courseName,
      date: formData.date,
      time: formData.time,
      createdBy: user?.id || '',
      maxPlayers: maxPlayersNum,
      currentPlayers: 1, // Creator is automatically included
      status: 'open',
      description: formData.description,
      createdAt: new Date(),
    };

    addBooking(newBooking);
    
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Tee time created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    }, 1000);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateFormData('date', selectedDate);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-green-600 rounded-full items-center justify-center mb-3">
              <Ionicons name="golf" size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">Book a Tee Time</Text>
            <Text className="text-gray-600 text-center mt-1">
              Create a booking and invite your friends
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Golf Course</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Enter golf course name"
                value={formData.courseName}
                onChangeText={(value) => updateFormData('courseName', value)}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Date</Text>
              <Pressable
                className="bg-white border border-gray-300 rounded-lg px-4 py-3"
                onPress={() => setShowDatePicker(true)}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-gray-900">
                    {formData.date.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                </View>
              </Pressable>
              
              {showDatePicker && (
                <DateTimePicker
                  value={formData.date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Tee Time</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="e.g., 10:30 AM"
                value={formData.time}
                onChangeText={(value) => updateFormData('time', value)}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Max Players</Text>
              <View className="flex-row space-x-2">
                {['1', '2', '3', '4'].map((num) => (
                  <Pressable
                    key={num}
                    className={`flex-1 py-3 rounded-lg border ${
                      formData.maxPlayers === num
                        ? 'bg-green-600 border-green-600'
                        : 'bg-white border-gray-300'
                    }`}
                    onPress={() => updateFormData('maxPlayers', num)}
                  >
                    <Text className={`text-center font-medium ${
                      formData.maxPlayers === num ? 'text-white' : 'text-gray-700'
                    }`}>
                      {num}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Description (Optional)</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Add any notes about this booking..."
                value={formData.description}
                onChangeText={(value) => updateFormData('description', value)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <Pressable
              className={`bg-green-600 rounded-lg py-4 items-center mt-6 ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleCreateBooking}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-lg">
                {isLoading ? 'Creating Booking...' : 'Create Tee Time'}
              </Text>
            </Pressable>

            <View className="bg-green-50 p-4 rounded-lg mt-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#16a34a" />
                <View className="ml-3 flex-1">
                  <Text className="text-green-800 font-medium mb-1">How it works</Text>
                  <Text className="text-green-700 text-sm">
                    After creating your booking, you can invite friends from your friends list. 
                    They'll receive notifications and can join your tee time.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}