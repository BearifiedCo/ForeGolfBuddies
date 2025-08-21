import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../state/bookingStore';
import { useAuthStore } from '../state/authStore';
import { useSocialStore } from '../state/socialStore';

interface BookingDetailsScreenProps {
  route: {
    params: {
      bookingId: string;
    };
  };
  navigation: any;
}

export default function BookingDetailsScreen({ route, navigation }: BookingDetailsScreenProps) {
  const { bookingId } = route.params;
  const { bookings, joinBooking, leaveBooking, cancelBooking } = useBookingStore();
  const { user } = useAuthStore();
  const { friends } = useSocialStore();
  
  const booking = bookings.find(b => b.id === bookingId);

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-xl font-semibold text-gray-900 mt-4">Booking Not Found</Text>
        <Text className="text-gray-600 mt-2 text-center px-6">
          This booking may have been cancelled or removed.
        </Text>
        <Pressable 
          className="bg-green-600 px-6 py-3 rounded-lg mt-6"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const isCreator = booking.createdBy === user?.id;
  const canJoin = booking.status === 'open' && booking.currentPlayers < booking.maxPlayers;
  const isFull = booking.currentPlayers >= booking.maxPlayers;

  const handleJoinBooking = () => {
    if (user && canJoin) {
      joinBooking(booking.id, user.id);
      Alert.alert('Success', 'You have joined this tee time!');
    }
  };

  const handleLeaveBooking = () => {
    if (user) {
      Alert.alert(
        'Leave Booking',
        'Are you sure you want to leave this tee time?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Leave', 
            style: 'destructive',
            onPress: () => {
              leaveBooking(booking.id, user.id);
              Alert.alert('Left', 'You have left this tee time.');
            }
          }
        ]
      );
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this tee time? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            cancelBooking(booking.id);
            Alert.alert('Cancelled', 'Tee time has been cancelled.', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        }
      ]
    );
  };

  const handleInviteFriends = () => {
    if (friends.length === 0) {
      Alert.alert('No Friends', 'Add some friends first to invite them to your tee times!');
      return;
    }
    
    Alert.alert('Invite Friends', 'Friend invitation feature coming soon!');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white">
          <View className="px-6 py-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-gray-900">{booking.courseName}</Text>
              <View className={`px-3 py-1 rounded-full ${
                booking.status === 'open' ? 'bg-green-100' : 
                booking.status === 'full' ? 'bg-yellow-100' : 
                booking.status === 'cancelled' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <Text className={`text-sm font-medium ${
                  booking.status === 'open' ? 'text-green-800' : 
                  booking.status === 'full' ? 'text-yellow-800' : 
                  booking.status === 'cancelled' ? 'text-red-800' : 'text-gray-800'
                }`}>
                  {booking.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View className="space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={20} color="#16a34a" />
                <Text className="ml-3 text-gray-700 text-base">
                  {new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#16a34a" />
                <Text className="ml-3 text-gray-700 text-base">{booking.time}</Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="people" size={20} color="#16a34a" />
                <Text className="ml-3 text-gray-700 text-base">
                  {booking.currentPlayers} of {booking.maxPlayers} players
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="person" size={20} color="#16a34a" />
                <Text className="ml-3 text-gray-700 text-base">
                  Created by {isCreator ? 'You' : 'Golf Buddy'}
                </Text>
              </View>
            </View>

            {booking.description && (
              <View className="mt-4 p-4 bg-gray-50 rounded-lg">
                <Text className="text-gray-700">{booking.description}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Players Section */}
        <View className="bg-white mt-4 px-6 py-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Players</Text>
          <View className="space-y-3">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-green-600 rounded-full items-center justify-center mr-3">
                <Ionicons name="person" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="font-medium text-gray-900">
                  {isCreator ? user?.name : 'Golf Buddy'} {isCreator && '(You)'}
                </Text>
                <Text className="text-sm text-gray-500">Organizer</Text>
              </View>
              <View className="bg-green-100 px-2 py-1 rounded">
                <Text className="text-green-800 text-xs font-medium">CONFIRMED</Text>
              </View>
            </View>

            {/* Mock additional players */}
            {Array.from({ length: booking.currentPlayers - 1 }).map((_, index) => (
              <View key={index} className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-400 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person" size={20} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-gray-900">Player {index + 2}</Text>
                  <Text className="text-sm text-gray-500">Joined recently</Text>
                </View>
                <View className="bg-green-100 px-2 py-1 rounded">
                  <Text className="text-green-800 text-xs font-medium">CONFIRMED</Text>
                </View>
              </View>
            ))}

            {/* Empty slots */}
            {Array.from({ length: booking.maxPlayers - booking.currentPlayers }).map((_, index) => (
              <View key={`empty-${index}`} className="flex-row items-center opacity-50">
                <View className="w-10 h-10 border-2 border-dashed border-gray-300 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person-add-outline" size={20} color="#9ca3af" />
                </View>
                <Text className="text-gray-400">Open slot</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 py-6 space-y-3">
          {!isCreator && canJoin && (
            <Pressable
              className="bg-green-600 rounded-lg py-4 items-center"
              onPress={handleJoinBooking}
            >
              <Text className="text-white font-semibold text-lg">Join Tee Time</Text>
            </Pressable>
          )}

          {!isCreator && !canJoin && !isFull && (
            <Pressable
              className="bg-red-600 rounded-lg py-4 items-center"
              onPress={handleLeaveBooking}
            >
              <Text className="text-white font-semibold text-lg">Leave Tee Time</Text>
            </Pressable>
          )}

          {isCreator && (
            <>
              <Pressable
                className="bg-blue-600 rounded-lg py-4 items-center"
                onPress={handleInviteFriends}
              >
                <Text className="text-white font-semibold text-lg">Invite Friends</Text>
              </Pressable>

              <Pressable
                className="bg-red-600 rounded-lg py-4 items-center"
                onPress={handleCancelBooking}
              >
                <Text className="text-white font-semibold text-lg">Cancel Booking</Text>
              </Pressable>
            </>
          )}

          {isFull && !isCreator && (
            <View className="bg-yellow-100 rounded-lg py-4 items-center">
              <Text className="text-yellow-800 font-medium">This tee time is full</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}