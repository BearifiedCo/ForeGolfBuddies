import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { useBookingStore } from '../state/bookingStore';
import { useSocialStore } from '../state/socialStore';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation: _navigation }: ProfileScreenProps) {
  const { user, updateUser, logout } = useAuthStore();
  const { bookings } = useBookingStore();
  const { friends } = useSocialStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    handicap: user?.handicap.toString() || '',
    location: user?.location || '',
  });

  const handleSaveProfile = () => {
    const handicapNum = parseInt(editForm.handicap);
    if (isNaN(handicapNum) || handicapNum < 0 || handicapNum > 54) {
      Alert.alert('Error', 'Please enter a valid handicap (0-54)');
      return;
    }

    updateUser({
      name: editForm.name,
      handicap: handicapNum,
      location: editForm.location,
    });

    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const myBookings = bookings.filter(b => b.createdBy === user?.id);
  const completedBookings = myBookings.filter(b => b.status === 'completed').length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white">
          <View className="items-center py-8">
            <View className="w-24 h-24 bg-green-600 rounded-full items-center justify-center mb-4">
              <Ionicons name="person" size={48} color="white" />
            </View>
            
            {!isEditing ? (
              <>
                <Text className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</Text>
                <Text className="text-gray-600 mb-2">{user?.location}</Text>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-800 font-medium">Handicap: {user?.handicap}</Text>
                </View>
                
                <Pressable
                  className="mt-4 bg-green-600 px-6 py-2 rounded-lg"
                  onPress={() => setIsEditing(true)}
                >
                  <Text className="text-white font-medium">Edit Profile</Text>
                </Pressable>
              </>
            ) : (
              <View className="w-full px-6">
                <View className="space-y-4">
                  <View>
                    <Text className="text-gray-700 mb-2 font-medium">Name</Text>
                    <TextInput
                      className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-base"
                      value={editForm.name}
                      onChangeText={(value) => setEditForm(prev => ({ ...prev, name: value }))}
                      autoCapitalize="words"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-2 font-medium">Handicap</Text>
                    <TextInput
                      className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-base"
                      value={editForm.handicap}
                      onChangeText={(value) => setEditForm(prev => ({ ...prev, handicap: value }))}
                      keyboardType="numeric"
                      placeholder="0-54"
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-2 font-medium">Location</Text>
                    <TextInput
                      className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-base"
                      value={editForm.location}
                      onChangeText={(value) => setEditForm(prev => ({ ...prev, location: value }))}
                      autoCapitalize="words"
                      placeholder="City, State"
                    />
                  </View>

                  <View className="flex-row space-x-3 mt-6">
                    <Pressable
                      className="flex-1 bg-green-600 rounded-lg py-3 items-center"
                      onPress={handleSaveProfile}
                    >
                      <Text className="text-white font-medium">Save Changes</Text>
                    </Pressable>
                    
                    <Pressable
                      className="flex-1 bg-gray-300 rounded-lg py-3 items-center"
                      onPress={() => {
                        setIsEditing(false);
                        setEditForm({
                          name: user?.name || '',
                          handicap: user?.handicap.toString() || '',
                          location: user?.location || '',
                        });
                      }}
                    >
                      <Text className="text-gray-700 font-medium">Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View className="bg-white mt-4">
          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Golf Stats</Text>
            
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-green-600">{myBookings.length}</Text>
                <Text className="text-gray-600 text-sm">Bookings Created</Text>
              </View>
              
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-blue-600">{completedBookings}</Text>
                <Text className="text-gray-600 text-sm">Rounds Played</Text>
              </View>
              
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-purple-600">{friends.length}</Text>
                <Text className="text-gray-600 text-sm">Golf Buddies</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="bg-white mt-4">
          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</Text>
            
            {myBookings.length > 0 ? (
              <View className="space-y-3">
                {myBookings.slice(0, 3).map((booking) => (
                  <View key={booking.id} className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                    <View className="w-10 h-10 bg-green-600 rounded-full items-center justify-center mr-3">
                      <Ionicons name="golf" size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">{booking.courseName}</Text>
                      <Text className="text-sm text-gray-600">
                        {new Date(booking.date).toLocaleDateString()} at {booking.time}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded ${
                      booking.status === 'open' ? 'bg-green-100' : 
                      booking.status === 'completed' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Text className={`text-xs font-medium ${
                        booking.status === 'open' ? 'text-green-800' : 
                        booking.status === 'completed' ? 'text-blue-800' : 'text-gray-800'
                      }`}>
                        {booking.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-6">
                <Ionicons name="golf-outline" size={48} color="#d1d5db" />
                <Text className="text-gray-500 mt-2">No recent activity</Text>
                <Text className="text-gray-400 text-sm text-center mt-1">
                  Start booking tee times to see your activity here
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Account Settings */}
        <View className="bg-white mt-4 mb-6">
          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Account</Text>
            
            <View className="space-y-3">
              <Pressable className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <Ionicons name="notifications-outline" size={24} color="#6b7280" />
                  <Text className="ml-3 text-gray-900">Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </Pressable>

              <Pressable className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <Ionicons name="shield-outline" size={24} color="#6b7280" />
                  <Text className="ml-3 text-gray-900">Privacy</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </Pressable>

              <Pressable className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <Ionicons name="help-circle-outline" size={24} color="#6b7280" />
                  <Text className="ml-3 text-gray-900">Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </Pressable>

              <Pressable 
                className="flex-row items-center justify-between py-3"
                onPress={handleLogout}
              >
                <View className="flex-row items-center">
                  <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                  <Text className="ml-3 text-red-500">Logout</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ef4444" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}