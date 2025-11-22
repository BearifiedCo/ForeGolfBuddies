import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../api/auth-service';
import { getTimeBasedGreeting } from '../utils/greetings';

interface PasswordResetScreenProps {
  navigation: any;
}

export default function PasswordResetScreen({ navigation }: PasswordResetScreenProps) {
  const [email, setEmail] = useState('');
  const [resetMethod, setResetMethod] = useState<'email' | 'phone'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email.trim(), resetMethod);
      setResetSent(true);
      Alert.alert(
        'Reset Link Sent',
        `We've sent a password reset link to your ${resetMethod === 'email' ? 'email' : 'phone number'}. Please check your ${resetMethod === 'email' ? 'inbox' : 'messages'} and follow the instructions.`
      );
    } catch (error) {
      // Don't show error for security reasons - just show success message
      setResetSent(true);
      Alert.alert(
        'Reset Link Sent',
        `If an account exists with that email, we've sent a password reset link. Please check your ${resetMethod === 'email' ? 'inbox' : 'messages'}.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
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
            <View className="items-center mb-8">
              <View className="w-16 h-16 bg-golf-700 rounded-full items-center justify-center mb-4">
                <Ionicons name="lock-open" size={32} color="white" />
              </View>
              <Text className="text-2xl font-bold text-golf-800 mb-2">{getTimeBasedGreeting()}</Text>
              <Text className="text-lg text-gray-600 text-center">Reset Your Password</Text>
            </View>

            {!resetSent ? (
              <>
                {/* Instructions */}
                <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <Text className="text-blue-800 text-center">
                    Enter your email address and we'll send you a link to reset your password.
                  </Text>
                </View>

                {/* Email Input */}
                <View className="space-y-2 mb-6">
                  <Text className="text-gray-700 font-medium">Email Address</Text>
                  <TextInput
                    className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                    placeholder="Enter your email address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>

                {/* Reset Method Selection */}
                <View className="mb-6">
                  <Text className="text-gray-700 font-medium mb-3">Reset Method</Text>
                  <View className="flex-row space-x-3">
                    <TouchableOpacity
                      onPress={() => setResetMethod('email')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                        resetMethod === 'email' 
                          ? 'border-golf-700 bg-golf-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons 
                          name="mail" 
                          size={20} 
                          color={resetMethod === 'email' ? '#10288F' : '#6b7280'} 
                        />
                        <Text className={`ml-2 font-medium ${
                          resetMethod === 'email' ? 'text-golf-700' : 'text-gray-600'
                        }`}>
                          Email
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setResetMethod('phone')}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                        resetMethod === 'phone' 
                          ? 'border-golf-700 bg-golf-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons 
                          name="phone-portrait" 
                          size={20} 
                          color={resetMethod === 'phone' ? '#10288F' : '#6b7280'} 
                        />
                        <Text className={`ml-2 font-medium ${
                          resetMethod === 'phone' ? 'text-golf-700' : 'text-gray-600'
                        }`}>
                          Phone
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="space-y-3">
                  <TouchableOpacity
                    className={`bg-golf-700 rounded-lg py-4 items-center ${isLoading ? 'opacity-50' : ''}`}
                    onPress={handleRequestReset}
                    disabled={isLoading || !email.trim()}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-semibold text-lg">Send Reset Link</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-gray-200 rounded-lg py-4 items-center"
                    onPress={handleBackToLogin}
                    disabled={isLoading}
                  >
                    <Text className="text-gray-700 font-semibold text-lg">Back to Login</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Success State */}
                <View className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <View className="items-center">
                    <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                      <Ionicons name="checkmark-circle" size={32} color="#059669" />
                    </View>
                    <Text className="text-green-800 text-lg font-semibold text-center mb-2">
                      Reset Link Sent!
                    </Text>
                    <Text className="text-green-700 text-center">
                      We've sent a password reset link to your {resetMethod === 'email' ? 'email' : 'phone number'}. 
                      Please check your {resetMethod === 'email' ? 'inbox' : 'messages'} and follow the instructions.
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="space-y-3">
                  <TouchableOpacity
                    className="bg-golf-700 rounded-lg py-4 items-center"
                    onPress={handleBackToLogin}
                  >
                    <Text className="text-white font-semibold text-lg">Return to Login</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="bg-gray-200 rounded-lg py-4 items-center"
                    onPress={() => {
                      setResetSent(false);
                      setEmail('');
                    }}
                  >
                    <Text className="text-gray-700 font-semibold text-lg">Send Another Link</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Help Text */}
            <View className="mt-8">
              <Text className="text-gray-500 text-center text-sm">
                Still having trouble? Contact support at{' '}
                <Text className="text-golf-700">help@forebuddies.com</Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
