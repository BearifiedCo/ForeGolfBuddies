import React from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSocialStore } from '../state/socialStore';
import { useBookingStore } from '../state/bookingStore';
import { useAuthStore } from '../state/authStore';
import { Post, Booking } from '../types/golf';

interface HomeFeedScreenProps {
  navigation: any;
}

export default function HomeFeedScreen({ navigation }: HomeFeedScreenProps) {
  const { posts, likePost } = useSocialStore();
  const { bookings } = useBookingStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderPost = (post: Post) => (
    <View key={post.id} className="bg-white mx-4 mb-4 rounded-lg shadow-sm border border-gray-100">
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <View className="w-10 h-10 bg-green-600 rounded-full items-center justify-center mr-3">
            <Ionicons name="person" size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-gray-900">Golf Buddy</Text>
            <Text className="text-sm text-gray-500">2 hours ago</Text>
          </View>
        </View>
        
        <Text className="text-gray-800 mb-3">{post.content}</Text>
        
        {post.type === 'booking' && post.bookingId && (
          <View className="bg-green-50 p-3 rounded-lg mb-3">
            <Text className="text-green-800 font-medium">Tee Time Booking</Text>
            <Text className="text-green-600 text-sm">Tap to view details</Text>
          </View>
        )}
        
        <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
          <Pressable 
            className="flex-row items-center"
            onPress={() => likePost(post.id)}
          >
            <Ionicons name="heart-outline" size={20} color="#16a34a" />
            <Text className="ml-1 text-green-600">{post.likes}</Text>
          </Pressable>
          
          <Pressable className="flex-row items-center">
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text className="ml-1 text-gray-500">{post.comments.length}</Text>
          </Pressable>
          
          <Pressable className="flex-row items-center">
            <Ionicons name="share-outline" size={20} color="#6b7280" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderBooking = (booking: Booking) => (
    <Pressable 
      key={booking.id}
      className="bg-white mx-4 mb-4 rounded-lg shadow-sm border border-gray-100"
      onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
    >
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-semibold text-gray-900">{booking.courseName}</Text>
          <View className={`px-2 py-1 rounded-full ${
            booking.status === 'open' ? 'bg-green-100' : 
            booking.status === 'full' ? 'bg-yellow-100' : 'bg-gray-100'
          }`}>
            <Text className={`text-xs font-medium ${
              booking.status === 'open' ? 'text-green-800' : 
              booking.status === 'full' ? 'text-yellow-800' : 'text-gray-800'
            }`}>
              {booking.status.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text className="ml-2 text-gray-600">
            {new Date(booking.date).toLocaleDateString()} at {booking.time}
          </Text>
        </View>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="people-outline" size={16} color="#6b7280" />
            <Text className="ml-2 text-gray-600">
              {booking.currentPlayers}/{booking.maxPlayers} players
            </Text>
          </View>
          
          <Text className="text-green-600 font-medium">View Details</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-4">
          <Text className="text-xl font-bold text-gray-900 px-4 mb-4">
            Welcome back, {user?.name}!
          </Text>
          
          {/* Recent Bookings */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 px-4 mb-3">
              Recent Bookings
            </Text>
            {bookings.length > 0 ? (
              bookings.slice(0, 3).map(renderBooking)
            ) : (
              <View className="bg-white mx-4 rounded-lg p-6 items-center">
                <Ionicons name="golf-outline" size={48} color="#d1d5db" />
                <Text className="text-gray-500 mt-2 text-center">
                  No bookings yet. Create your first tee time!
                </Text>
                <Pressable 
                  className="bg-green-600 px-4 py-2 rounded-lg mt-3"
                  onPress={() => navigation.navigate('CreateBooking')}
                >
                  <Text className="text-white font-medium">Book Now</Text>
                </Pressable>
              </View>
            )}
          </View>
          
          {/* Social Feed */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 px-4 mb-3">
              Activity Feed
            </Text>
            {posts.length > 0 ? (
              posts.map(renderPost)
            ) : (
              <View className="bg-white mx-4 rounded-lg p-6 items-center">
                <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
                <Text className="text-gray-500 mt-2 text-center">
                  No activity yet. Connect with friends to see their golf activities!
                </Text>
                <Pressable 
                  className="bg-green-600 px-4 py-2 rounded-lg mt-3"
                  onPress={() => navigation.navigate('Friends')}
                >
                  <Text className="text-white font-medium">Find Friends</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}