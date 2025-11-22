import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../state/authStore';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TwoFactorScreen from '../screens/TwoFactorScreen';
import PasswordResetScreen from '../screens/PasswordResetScreen';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import FriendsScreen from '../screens/FriendsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileSearchScreen from '../screens/ProfileSearchScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import NewMessageScreen from '../screens/NewMessageScreen';
import CreateGroupChatScreen from '../screens/CreateGroupChatScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ScorecardScreen from '../screens/ScorecardScreen';
import StartRoundScreen from '../screens/StartRoundScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  TwoFactor: {
    userId: string;
    method: 'email' | 'phone';
    userEmail: string;
    userPhone?: string;
  };
  PasswordReset: undefined;
  Main: undefined;
  ProfileSearch: undefined;
  Profile: { userId?: string };
  Achievements: undefined;
  Scorecard: undefined;
  StartRound: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scorecard: undefined;
  Messages: undefined;
  Friends: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Scorecard') {
            iconName = focused ? 'golf' : 'golf-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#10288F',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#e5e7eb',
        },
        headerStyle: {
          backgroundColor: '#10288F',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeFeedScreen}
        options={{ title: 'ForeBuddies' }}
      />
      <Tab.Screen 
        name="Scorecard" 
        component={ScorecardScreen}
        options={{ title: 'Scorecard' }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsScreen}
        options={{ title: 'Friends' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="TwoFactor" component={TwoFactorScreen} />
            <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen 
              name="ProfileSearch" 
              component={ProfileSearchScreen}
              options={{ 
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ 
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{ 
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="NewMessage" 
              component={NewMessageScreen}
              options={{ 
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="CreateGroupChat" 
              component={CreateGroupChatScreen}
              options={{ 
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="Achievements" 
              component={AchievementsScreen}
              options={{ 
                headerShown: false
              }}
            />
            <Stack.Screen 
              name="StartRound" 
              component={StartRoundScreen}
              options={{ 
                headerShown: false
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}