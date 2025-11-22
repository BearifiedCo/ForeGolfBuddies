// Import polyfills for basic crypto/zlib compatibility
import './src/utils/polyfills';

import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AppNavigator from "./src/navigation/AppNavigator";
import { useSocialStore } from "./src/state/socialStore";
import { useAuthStore } from "./src/state/authStore";
import { rewardsService } from "./src/services/rewardsService";

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
  const { posts, addPost } = useSocialStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Add mock posts if none exist
    if (posts.length === 0) {
      // Import mock posts directly since we simplified the data structure
      const { mockPosts } = require('./src/data/mockData');
      mockPosts.forEach((post: any) => addPost(post));
    }
  }, [posts.length, addPost]);

  // Initialize rewards when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      rewardsService.initializeUser(user.id);
    }
  }, [isAuthenticated, user]);

  return (
    <GestureHandlerRootView className="flex-1">
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
