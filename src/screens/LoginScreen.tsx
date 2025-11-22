import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { authService } from '../api/auth-service';
import { getTimeBasedGreeting } from '../utils/greetings';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('test@golf.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const { login, setPendingSession, requireTwoFactor } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const session = await authService.login({ email, password });
      
      if (session.twoFactorRequired && session.twoFactorMethod) {
        // Store pending session and require 2FA
        setPendingSession(session);
        requireTwoFactor(session.twoFactorMethod);
        
        // Navigate to 2FA screen
        navigation.navigate('TwoFactor', {
          userId: session.user.id,
          method: session.twoFactorMethod,
          userEmail: session.user.email,
          userPhone: session.user.phoneNumber
        });
      } else {
        // Complete login directly
        login(session);
      }
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToPasswordReset = () => {
    navigation.navigate('PasswordReset');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#10288F" />
      <SafeAreaView className="flex-1 bg-golf-50">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-golf-700 rounded-full items-center justify-center mb-4">
              <Ionicons name="golf" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-golf-800 mb-2">ForeBuddies</Text>
            <Text className="text-gray-600 text-center">Connect with golfers and share your passion</Text>
          </View>

          {/* Login Form */}
          <View className="space-y-4">
            <Text className="text-2xl font-bold text-golf-800 mb-2 text-center">{getTimeBasedGreeting()}</Text>
            <Text className="text-lg text-gray-600 mb-6 text-center">Sign in to your account</Text>

            {/* Email Input */}
            <View className="space-y-2">
              <Text className="text-gray-700 font-medium">Email</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Password Input */}
            <View className="space-y-2">
              <Text className="text-gray-700 font-medium">Password</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              onPress={navigateToPasswordReset}
              className="self-end"
              disabled={isLoading}
            >
              <Text className="text-golf-700 font-medium text-sm">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Demo Credentials */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <Text className="text-blue-800 font-medium text-sm mb-1">Demo Credentials:</Text>
              <Text className="text-blue-700 text-xs">Email: test@golf.com</Text>
              <Text className="text-blue-700 text-xs">Password: password123</Text>
              <Text className="text-blue-600 text-xs mt-1">(2FA temporarily disabled for development)</Text>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`bg-golf-700 rounded-lg py-4 items-center mt-6 ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToRegister} disabled={isLoading}>
                <Text className="text-golf-700 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Security Notice */}
            <View className="mt-6">
              <View className="flex-row items-center justify-center">
                <Ionicons name="shield-checkmark" size={16} color="#059669" />
                <Text className="text-green-600 text-sm ml-2 text-center">
                  Your security is our priority. 2FA available for enhanced protection.
                </Text>
              </View>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}