import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { useBookingStore } from "./src/state/bookingStore";
import { useSocialStore } from "./src/state/socialStore";
import { initializeMockData } from "./src/data/mockData";

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

export default function App() {
  const { setCourses, bookings, addBooking } = useBookingStore();
  const { posts, addPost } = useSocialStore();

  useEffect(() => {
    // Initialize mock data on app start
    const mockData = initializeMockData();
    
    // Set courses
    setCourses(mockData.courses);
    
    // Add mock bookings if none exist
    if (bookings.length === 0) {
      mockData.bookings.forEach(booking => addBooking(booking));
    }
    
    // Add mock posts if none exist
    if (posts.length === 0) {
      mockData.posts.forEach(post => addPost(post));
    }
  }, []);

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
