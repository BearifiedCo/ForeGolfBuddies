import React, { useState, useEffect, useRef } from 'react';
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
import { useAuthStore } from '../state/authStore';
import { authService } from '../api/auth-service';
import { getTimeBasedGreeting } from '../utils/greetings';

interface TwoFactorScreenProps {
  navigation: any;
  route: {
    params: {
      userId: string;
      method: 'email' | 'phone';
      userEmail: string;
      userPhone?: string;
    };
  };
}

export default function TwoFactorScreen({ navigation, route }: TwoFactorScreenProps) {
  const { userId, method, userEmail, userPhone } = route.params;
  const { completeTwoFactor, clearTwoFactor } = useAuthStore();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    // Start countdown for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  useEffect(() => {
    // Send initial 2FA code
    sendTwoFactorCode();
  }, []);

  const sendTwoFactorCode = async () => {
    try {
      setIsLoading(true);
      await authService.sendTwoFactorCode(userId, method);
      setCountdown(60); // 60 second cooldown
      setResendDisabled(true);
      Alert.alert(
        'Verification Code Sent',
        `We've sent a 6-digit code to your ${method === 'email' ? 'email' : 'phone number'}. Check your ${method === 'email' ? 'inbox' : 'messages'} and enter the code below.`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are entered
    if (newCode.every(digit => digit) && newCode.join('').length === 6) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (verificationCode: string) => {
    if (verificationCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const session = await authService.verifyTwoFactor(userId, verificationCode, method);
      completeTwoFactor(session);
      // Navigation will be handled by auth state change
    } catch (error) {
      Alert.alert('Verification Failed', error instanceof Error ? error.message : 'Invalid verification code');
      // Clear the code inputs on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendDisabled) return;
    await sendTwoFactorCode();
  };

  const handleBackToLogin = () => {
    clearTwoFactor();
    navigation.navigate('Login');
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple phone formatting for display
    return phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1-$2-$3-$4');
  };

  const getContactInfo = () => {
    if (method === 'email') {
      return userEmail;
    } else {
      return userPhone ? formatPhoneNumber(userPhone) : 'your phone number';
    }
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
                <Ionicons 
                  name={method === 'email' ? 'mail' : 'phone-portrait'} 
                  size={32} 
                  color="white" 
                />
              </View>
              <Text className="text-2xl font-bold text-golf-800 mb-2">{getTimeBasedGreeting()}</Text>
              <Text className="text-lg text-gray-600 text-center">Two-Factor Authentication</Text>
            </View>

            {/* Instructions */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <Text className="text-blue-800 text-center">
                We've sent a 6-digit verification code to{' '}
                <Text className="font-semibold">{getContactInfo()}</Text>
              </Text>
              <Text className="text-blue-700 text-center mt-2 text-sm">
                Enter the code below to complete your sign-in
              </Text>
            </View>

            {/* Verification Code Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-3 text-center">Verification Code</Text>
              <View className="flex-row justify-center space-x-3">
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      if (ref) inputRefs.current[index] = ref;
                    }}
                    className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg text-center text-xl font-bold text-golf-800"
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    autoFocus={index === 0}
                    editable={!isLoading}
                  />
                ))}
              </View>
            </View>

            {/* Resend Code */}
            <View className="items-center mb-6">
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={resendDisabled || isLoading}
                className={`${resendDisabled ? 'opacity-50' : ''}`}
              >
                <Text className={`text-golf-700 font-medium ${resendDisabled ? 'text-gray-500' : ''}`}>
                  {resendDisabled 
                    ? `Resend code in ${countdown}s` 
                    : "Didn't receive the code? Resend"
                  }
                </Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                className={`bg-golf-700 rounded-lg py-4 items-center ${isLoading ? 'opacity-50' : ''}`}
                onPress={() => handleVerifyCode(code.join(''))}
                disabled={isLoading || code.some(digit => !digit)}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-lg">Verify & Continue</Text>
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

            {/* Help Text */}
            <View className="mt-8">
              <Text className="text-gray-500 text-center text-sm">
                Having trouble? Contact support at{' '}
                <Text className="text-golf-700">help@forebuddies.com</Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
