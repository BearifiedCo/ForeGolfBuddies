import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';
import { authService } from '../api/auth-service';
import { getTimeBasedGreeting } from '../utils/greetings';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    handicap: '',
    location: '',
    homeClub: '',
  });
  const [enableTwoFactor, setEnableTwoFactor] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'email' | 'phone' | 'none'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const { login, setPendingSession, requireTwoFactor } = useAuthStore();

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.handicap || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    const handicapNum = parseInt(formData.handicap);
    if (isNaN(handicapNum) || handicapNum < 0 || handicapNum > 54) {
      Alert.alert('Error', 'Please enter a valid handicap (0-54)');
      return;
    }

    // Validate 2FA method if enabled
    if (enableTwoFactor && twoFactorMethod === 'phone' && !formData.phoneNumber) {
      Alert.alert('Error', 'Phone number is required when enabling phone-based 2FA');
      return;
    }

    setIsLoading(true);
    
    try {
      const session = await authService.register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name,
        phoneNumber: formData.phoneNumber || undefined,
        handicap: handicapNum,
        location: formData.location,
        homeClub: formData.homeClub || undefined,
        enableTwoFactor,
        twoFactorMethod: enableTwoFactor ? twoFactorMethod : 'none',
      });
      
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
        // Complete registration directly
        login(session);
      }
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTwoFactorToggle = (enabled: boolean) => {
    setEnableTwoFactor(enabled);
    if (!enabled) {
      setTwoFactorMethod('none');
    } else if (twoFactorMethod === 'none') {
      setTwoFactorMethod('email');
    }
  };

  const handleTwoFactorMethodChange = (method: 'email' | 'phone') => {
    setTwoFactorMethod(method);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#10288F" />
      <SafeAreaView className="flex-1 bg-golf-50">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <View className="items-center mt-8 mb-8">
            <View className="w-20 h-20 bg-golf-700 rounded-full items-center justify-center mb-4">
              <Ionicons name="golf" size={40} color="white" />
            </View>
            <Text className="text-3xl font-bold text-golf-800 mb-2">Join ForeBuddies</Text>
            <Text className="text-gray-600 text-center">Create your account to start connecting</Text>
          </View>

          <View className="space-y-4">
            <Text className="text-2xl font-bold text-golf-800 mb-6 text-center">{getTimeBasedGreeting()}</Text>
            
            {/* Personal Information */}
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Full Name *</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Email Address *</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Phone Number (Optional)</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="+1 (555) 123-4567"
                value={formData.phoneNumber}
                onChangeText={(value) => updateFormData('phoneNumber', value)}
                keyboardType="phone-pad"
              />
            </View>

            {/* Golf Information */}
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Golf Handicap *</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Enter your handicap (0-54)"
                value={formData.handicap}
                onChangeText={(value) => updateFormData('handicap', value)}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Location *</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="City, State"
                value={formData.location}
                onChangeText={(value) => updateFormData('location', value)}
                autoCapitalize="words"
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Home Club (Optional)</Text>
              <TextInput
                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Your home golf club"
                value={formData.homeClub}
                onChangeText={(value) => updateFormData('homeClub', value)}
                autoCapitalize="words"
              />
            </View>

            {/* Security Section */}
            <View className="bg-gray-50 rounded-lg p-4">
              <Text className="text-gray-800 font-semibold mb-3">Security Settings</Text>
              
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-700 mb-2 font-medium">Password *</Text>
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    secureTextEntry
                  />
                  <Text className="text-gray-500 text-xs mt-1">Must be at least 8 characters</Text>
                </View>

                <View>
                  <Text className="text-gray-700 mb-2 font-medium">Confirm Password *</Text>
                  <TextInput
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                    secureTextEntry
                  />
                </View>

                {/* Two-Factor Authentication */}
                <View className="bg-white rounded-lg p-4 border border-gray-200">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-gray-900 font-medium">Two-Factor Authentication</Text>
                      <Text className="text-gray-600 text-sm mt-1">
                        Add an extra layer of security to your account
                      </Text>
                    </View>
                    <Switch
                      value={enableTwoFactor}
                      onValueChange={handleTwoFactorToggle}
                      trackColor={{ false: '#d1d5db', true: '#10288F' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {enableTwoFactor && (
                    <View className="mt-3">
                      <Text className="text-gray-700 font-medium mb-2">2FA Method</Text>
                      <View className="flex-row space-x-3">
                        <TouchableOpacity
                          onPress={() => handleTwoFactorMethodChange('email')}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                            twoFactorMethod === 'email' 
                              ? 'border-golf-700 bg-golf-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <View className="flex-row items-center justify-center">
                            <Ionicons 
                              name="mail" 
                              size={20} 
                              color={twoFactorMethod === 'email' ? '#10288F' : '#6b7280'} 
                            />
                            <Text className={`ml-2 font-medium ${
                              twoFactorMethod === 'email' ? 'text-golf-700' : 'text-gray-600'
                            }`}>
                              Email
                            </Text>
                          </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleTwoFactorMethodChange('phone')}
                          className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                            twoFactorMethod === 'phone' 
                              ? 'border-golf-700 bg-golf-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <View className="flex-row items-center justify-center">
                            <Ionicons 
                              name="phone-portrait" 
                              size={20} 
                              color={twoFactorMethod === 'phone' ? '#10288F' : '#6b7280'} 
                            />
                            <Text className={`ml-2 font-medium ${
                              twoFactorMethod === 'phone' ? 'text-golf-700' : 'text-gray-600'
                            }`}>
                              Phone
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                      
                      {twoFactorMethod === 'phone' && !formData.phoneNumber && (
                        <Text className="text-red-500 text-xs mt-2">
                          Phone number is required for phone-based 2FA
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>

            <Pressable
              className={`bg-golf-700 rounded-lg py-4 items-center mt-6 ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-white font-semibold text-lg">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </Pressable>

            <View className="flex-row justify-center items-center mt-6 mb-8">
              <Text className="text-gray-600">Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text className="text-golf-700 font-semibold">Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}